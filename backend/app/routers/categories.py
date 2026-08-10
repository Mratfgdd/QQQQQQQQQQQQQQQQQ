"""Категорії: публічне читання і захищений CRUD."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from ..auth import require_admin
from ..database import get_db
from ..models import Category, Product
from ..schemas import CategoryCreate, CategoryOut, CategoryUpdate, CategoryWithProductsOut

public = APIRouter(prefix="/api/categories", tags=["categories"])
admin = APIRouter(
    prefix="/api/admin/categories", tags=["admin"], dependencies=[Depends(require_admin)]
)


def _with_count(category: Category) -> CategoryOut:
    data = CategoryOut.model_validate(category)
    data.product_count = len(category.products)
    return data


@public.get("", response_model=list[CategoryWithProductsOut])
def list_categories(
    with_products: bool = Query(True), db: Session = Depends(get_db)
):
    """Те, чим живе публічний сайт: категорії разом із товарами."""
    query = db.query(Category).options(
        selectinload(Category.products).selectinload(Product.images)
    )
    categories = query.order_by(Category.position, Category.id).all()

    result = []
    for category in categories:
        item = CategoryWithProductsOut.model_validate(category)
        item.product_count = len(category.products)
        if not with_products:
            item.products = []
        result.append(item)
    return result


@admin.get("", response_model=list[CategoryOut])
def admin_list(db: Session = Depends(get_db)):
    categories = (
        db.query(Category)
        .options(selectinload(Category.products))
        .order_by(Category.position, Category.id)
        .all()
    )
    return [_with_count(category) for category in categories]


@admin.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Категорія з таким slug вже існує")

    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return _with_count(category)


@admin.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)
):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Категорію не знайдено")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data:
        clash = (
            db.query(Category)
            .filter(Category.slug == data["slug"], Category.id != category_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=409, detail="Такий slug вже зайнятий")

    for field, value in data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return _with_count(category)


@admin.delete("/{category_id}")
def delete_category(
    category_id: int, force: bool = Query(False), db: Session = Depends(get_db)
):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Категорію не знайдено")

    count = len(category.products)
    # Категорію з товарами просто так не видаляємо — спершу попередження
    if count and not force:
        raise HTTPException(
            status_code=409,
            detail=f"У категорії {count} товар(ів). Видалення разом із товарами потребує підтвердження.",
        )

    db.delete(category)
    db.commit()
    return {"ok": True, "deleted_products": count}
