"""Моделі бази даних.

Зв'язки:
    Category 1 → N Product 1 → N ProductImage

Дані не дублюються: картка товару на сайті та сторінка товару читають
той самий рядок Product, а зображення живуть окремою таблицею з порядком
і позначкою головного.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    # У базі лежить ТІЛЬКИ bcrypt-хеш; відкритий пароль не зберігається ніде
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    breadcrumb: Mapped[str] = mapped_column(String(120), default="")
    subtitle: Mapped[str] = mapped_column(Text, default="")
    image: Mapped[str] = mapped_column(String(400), default="")
    position: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    products: Mapped[list["Product"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="Product.position",
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # slug — це і адреса /product/<slug>, і ключ, за яким кошик та обране
    # зберігають товар у localStorage
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # Дворядковий заголовок на картці каталогу
    title_top: Mapped[str] = mapped_column(String(100), default="")
    title_bottom: Mapped[str] = mapped_column(String(100), default="")

    short_description: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")

    price: Mapped[float] = mapped_column(Float, default=0)
    old_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(16), default="м²")
    pack_qty: Mapped[float] = mapped_column(Float, default=0)

    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False)
    discount: Mapped[int] = mapped_column(Integer, default=0)
    position: Mapped[int] = mapped_column(Integer, default=0)

    # Характеристики картки: [{icon, label, value}]
    specs: Mapped[list] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    category: Mapped[Category] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.position",
    )


class ProductImage(Base):
    __tablename__ = "product_images"
    __table_args__ = (UniqueConstraint("product_id", "position", name="uq_image_position"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Шлях або URL, а не base64: файли лежать у backend/uploads або в public
    url: Mapped[str] = mapped_column(String(400), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)

    product: Mapped[Product] = relationship(back_populates="images")


class CalculatorSettings(Base):
    """Один рядок із параметрами калькулятора для всього сайту."""

    __tablename__ = "calculator_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    waste_percent: Mapped[float] = mapped_column(Float, default=5)
    default_price_per_m2: Mapped[float] = mapped_column(Float, default=3850)
    default_pack_sq_m: Mapped[float] = mapped_column(Float, default=2.4)
    min_order_m2: Mapped[float] = mapped_column(Float, default=1)
    currency: Mapped[str] = mapped_column(String(16), default="грн")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)
