"""Замовлення: публічне оформлення та адмінський перегляд."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from ..auth import require_admin
from ..database import get_db
from ..models import Order, OrderItem, Product
from ..schemas import OrderCreate, OrderOut, OrderStatusUpdate

public = APIRouter(prefix="/api/orders", tags=["orders"])
admin = APIRouter(
    prefix="/api/admin/orders", tags=["admin"], dependencies=[Depends(require_admin)]
)


@public.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Оформлення замовлення з кошика.

    Ціни беруться З БАЗИ, а не з того, що надіслав браузер: інакше суму
    можна було б підмінити з DevTools. Клієнт передає лише що і скільки.
    """
    if not payload.city_ref or not payload.warehouse_ref:
        raise HTTPException(
            status_code=400, detail="Оберіть місто та відділення Нової пошти"
        )

    order = Order(
        customer_name=payload.customer_name.strip(),
        phone=payload.phone.strip(),
        comment=payload.comment.strip(),
        delivery_method=payload.delivery_method,
        area_ref=payload.area_ref,
        area_name=payload.area_name,
        city_ref=payload.city_ref,
        city_name=payload.city_name,
        warehouse_ref=payload.warehouse_ref,
        warehouse_name=payload.warehouse_name,
    )

    total = 0.0

    for line in payload.items:
        product = (
            db.query(Product).filter(Product.slug == line.product_slug).first()
        )
        if product is None:
            raise HTTPException(
                status_code=400,
                detail=f"Товар «{line.product_slug}» більше недоступний",
            )

        total += product.price * line.qty
        order.items.append(
            OrderItem(
                product_slug=product.slug,
                title=product.title,
                unit=product.unit,
                price=product.price,
                qty=line.qty,
            )
        )

    if not order.items:
        raise HTTPException(status_code=400, detail="Кошик порожній")

    order.total = round(total, 2)

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@admin.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc(), Order.id.desc())
        .all()
    )


@admin.put("/{order_id}", response_model=OrderOut)
def update_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Замовлення не знайдено")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@admin.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Замовлення не знайдено")

    db.delete(order)
    db.commit()
    return {"ok": True}
