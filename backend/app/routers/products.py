"""Товари: публічне читання, захищений CRUD, пошук, фільтри, сортування, пагінація."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, selectinload

from ..auth import require_admin
from ..database import get_db
from ..models import Category, Product, ProductImage
from ..schemas import ProductCreate, ProductListOut, ProductOut, ProductUpdate, StatsOut

public = APIRouter(prefix="/api/products", tags=["products"])
admin = APIRouter(
    prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)]
)

SORT_FIELDS = {
    "title": Product.title,
    "price": Product.price,
    "created": Product.created_at,
    "updated": Product.updated_at,
    "popular": Product.is_popular,
    "position": Product.position,
}


def _query(db: Session):
    return db.query(Product).options(selectinload(Product.images))


def _apply_images(db: Session, product: Product, images) -> None:
    """Повністю переставляє галерею товару під переданий порядок.

    Спершу видаляємо старі рядки і ОБОВ'ЯЗКОВО робимо flush: інакше
    SQLAlchemy встигає вставити нове фото з position=0 раніше, ніж
    видалить старе з тією ж позицією, і спрацьовує UNIQUE-обмеження
    (product_id, position) — саме через це заміна фото падала з 500.
    """
    product.images.clear()
    db.flush()

    for index, image in enumerate(images):
        product.images.append(
            ProductImage(
                url=image.url,
                position=index,
                is_main=bool(image.is_main) if index else True,
            )
        )
    # Головне фото завжди рівно одне
    for index, image in enumerate(product.images):
        image.is_main = index == 0


@public.get("", response_model=ProductListOut)
def list_products(
    db: Session = Depends(get_db),
    search: str | None = None,
    category: str | None = None,
    in_stock: bool | None = None,
    popular: bool | None = None,
    sort: str = Query("position"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    # Фільтри збираємо на «голому» запиті, щоб той самий набір умов
    # використати і для підрахунку загальної кількості, і для сторінки
    base = db.query(Product)

    if search:
        pattern = f"%{search.strip()}%"
        base = base.filter(or_(Product.title.ilike(pattern), Product.slug.ilike(pattern)))
    if category:
        base = base.join(Category).filter(Category.slug == category)
    if in_stock is not None:
        base = base.filter(Product.in_stock.is_(in_stock))
    if popular is not None:
        base = base.filter(Product.is_popular.is_(popular))

    total = base.with_entities(func.count(Product.id)).scalar() or 0

    column = SORT_FIELDS.get(sort, Product.position)
    items = (
        base.options(selectinload(Product.images))
        .order_by(column.desc() if order == "desc" else column.asc(), Product.id)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    pages = max(1, (total + per_page - 1) // per_page)

    return ProductListOut(
        items=[ProductOut.model_validate(item) for item in items],
        total=total,
        page=page,
        pages=pages,
        per_page=per_page,
    )


@public.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = _query(db).filter(Product.slug == slug).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не знайдено")
    return product


@admin.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    latest = _query(db).order_by(Product.created_at.desc(), Product.id.desc()).limit(5).all()
    updated = _query(db).order_by(Product.updated_at.desc(), Product.id.desc()).limit(5).all()

    return StatsOut(
        products=db.query(func.count(Product.id)).scalar() or 0,
        categories=db.query(func.count(Category.id)).scalar() or 0,
        in_stock=db.query(func.count(Product.id)).filter(Product.in_stock.is_(True)).scalar() or 0,
        popular=db.query(func.count(Product.id)).filter(Product.is_popular.is_(True)).scalar() or 0,
        latest=[ProductOut.model_validate(item) for item in latest],
        recently_updated=[ProductOut.model_validate(item) for item in updated],
    )


@admin.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Товар з таким slug вже існує")
    if db.get(Category, payload.category_id) is None:
        raise HTTPException(status_code=400, detail="Категорію не знайдено")

    data = payload.model_dump()
    images = data.pop("images", [])
    data["specs"] = [dict(spec) for spec in data.get("specs", [])]

    product = Product(**data)
    db.add(product)
    db.flush()
    _apply_images(db, product, payload.images)

    db.commit()
    db.refresh(product)
    return product


@admin.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не знайдено")

    data = payload.model_dump(exclude_unset=True)

    if "slug" in data:
        clash = (
            db.query(Product)
            .filter(Product.slug == data["slug"], Product.id != product_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=409, detail="Такий slug вже зайнятий")
    if "category_id" in data and db.get(Category, data["category_id"]) is None:
        raise HTTPException(status_code=400, detail="Категорію не знайдено")

    images = data.pop("images", None)
    if "specs" in data and data["specs"] is not None:
        data["specs"] = [dict(spec) for spec in data["specs"]]

    for field, value in data.items():
        setattr(product, field, value)

    if images is not None:
        _apply_images(db, product, payload.images)

    db.commit()
    db.refresh(product)
    return product


@admin.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не знайдено")

    slug = product.slug
    db.delete(product)
    db.commit()
    # slug повертаємо, щоб фронтенд міг прибрати товар з кошика й обраного
    return {"ok": True, "slug": slug}
