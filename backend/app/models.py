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
    LargeBinary,
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


class FloorMaterial(Base):
    """Матеріал підлоги для 3D-візуалізатора.

    ОКРЕМА СУТНІСТЬ, не пов'язана з Product. Раніше 3D-підлога була тим
    самим товаром із прапорцем available_in_3d — через це матеріал,
    доданий для залу, автоматично з'являвся в каталозі, кошику й пошуку.
    Тепер таблиці різні, тому 3D-матеріал фізично не може потрапити
    у Products, а видалення товару не чіпає матеріал і навпаки.
    """

    __tablename__ = "floor_materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    # Тип потрібен лише для групування у списку адмінки: «Паркет», «Ламінат»…
    kind: Mapped[str] = mapped_column(String(80), default="Паркет")
    description: Mapped[str] = mapped_column(Text, default="")

    preview_url: Mapped[str] = mapped_column(String(400), default="")
    texture_url: Mapped[str] = mapped_column(String(400), nullable=False)
    texture_repeat: Mapped[float] = mapped_column(Float, default=4)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class GalleryPhoto(Base):
    """Фотографія галереї колекції (/collection).

    ОКРЕМА СУТНІСТЬ, як і FloorMaterial. Це не товар: немає ні ціни, ні
    slug, ні характеристик, і таблиця ніяк не пов'язана з products. Тому
    фотографія галереї фізично не може потрапити в каталог, пошук,
    сортування, кошик чи обране, а видалення товару не чіпає галерею.

    У базі лежить лише шлях до файлу (/uploads/... або /файл.jpg із
    public), самі файли — на диску. Жодного base64.
    """

    __tablename__ = "gallery_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    url: Mapped[str] = mapped_column(String(400), nullable=False)
    # Текст для скрінрідерів і для випадку, коли фото не завантажилось.
    # У самій галереї він не показується.
    alt: Mapped[str] = mapped_column(String(200), default="")
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class UploadedFile(Base):
    """Завантажене зображення разом із вмістом.

    ЧОМУ В БАЗІ, А НЕ НА ДИСКУ. На Vercel (як і на будь-якому serverless)
    файлова система доступна тільки для читання, а /tmp живе рівно один
    виклик функції й не спільний між інстансами. Тобто фото, завантажене
    в адмін-панелі, зникало б одразу після відповіді. База — єдине
    сховище, яке в такому середовищі переживає деплой і масштабування.

    Шлях лишається шляхом: у товарах, категоріях і галереї, як і раніше,
    зберігається лише рядок /api/files/<ім'я>, а не самі байти.
    """

    __tablename__ = "uploaded_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Згенероване нами ім'я, воно ж — частина публічного URL
    filename: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    content_type: Mapped[str] = mapped_column(String(80), default="application/octet-stream")
    size: Mapped[int] = mapped_column(Integer, default=0)
    data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class AppState(Base):
    """Маленьке сховище «ключ → значення» для службових прапорців.

    Потрібне, щоб одноразові дії залишалися одноразовими. Конкретно:
    початкові фотографії галереї сідуються ОДИН раз. Без такого прапорця
    перевірка «таблиця порожня → засідувати» повертала б видалені
    адміністратором фотографії після кожного перезапуску сервера.
    """

    __tablename__ = "app_state"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(String(400), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class Order(Base):
    """Замовлення з сайту.

    Дані доставки зберігаємо і як Ref (ідентифікатори Нової пошти), і як
    людські назви: назви потрібні адміністратору у списку, а Ref — щоб
    пізніше можна було створити ТТН без повторного пошуку.

    Товари копіюються в order_items разом із назвою й ціною на момент
    покупки: якщо адміністратор потім змінить ціну або видалить товар,
    замовлення лишиться таким, яким його оформив клієнт.
    """

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    customer_name: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    comment: Mapped[str] = mapped_column(Text, default="")

    delivery_method: Mapped[str] = mapped_column(String(20), default="branch")
    area_ref: Mapped[str] = mapped_column(String(64), default="")
    area_name: Mapped[str] = mapped_column(String(160), default="")
    city_ref: Mapped[str] = mapped_column(String(64), default="")
    city_name: Mapped[str] = mapped_column(String(160), default="")
    warehouse_ref: Mapped[str] = mapped_column(String(64), default="")
    warehouse_name: Mapped[str] = mapped_column(String(400), default="")

    total: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(20), default="new")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )

    product_slug: Mapped[str] = mapped_column(String(80), default="")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    unit: Mapped[str] = mapped_column(String(16), default="м²")
    price: Mapped[float] = mapped_column(Float, default=0)
    qty: Mapped[int] = mapped_column(Integer, default=1)

    order: Mapped[Order] = relationship(back_populates="items")
