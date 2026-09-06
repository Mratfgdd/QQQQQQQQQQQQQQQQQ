"""Pydantic-схеми: валідація входу та форма відповіді.

Хеш пароля не потрапляє в жодну схему відповіді.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Авторизація ──
class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=200)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=6, max_length=200)


class AdminOut(ORMModel):
    id: int
    username: str


# ── Зображення ──
class ProductImageIn(BaseModel):
    url: str = Field(min_length=1, max_length=400)
    position: int = 0
    is_main: bool = False


class ProductImageOut(ORMModel):
    id: int
    url: str
    position: int
    is_main: bool


# ── Характеристики ──
class SpecIn(BaseModel):
    icon: str = "tree"
    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=120)


# ── Товари ──
class ProductBase(BaseModel):
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1, max_length=200)
    title_top: str = ""
    title_bottom: str = ""
    short_description: str = ""
    description: str = ""
    price: float = Field(ge=0, default=0)
    old_price: float | None = Field(ge=0, default=None)
    unit: str = "м²"
    pack_qty: float = Field(ge=0, default=0)
    in_stock: bool = True
    is_popular: bool = False
    discount: int = Field(ge=0, le=95, default=0)
    position: int = 0
    specs: list[SpecIn] = []


class ProductCreate(ProductBase):
    category_id: int
    images: list[ProductImageIn] = []


class ProductUpdate(BaseModel):
    """Часткове оновлення: приходить лише те, що змінили."""

    slug: str | None = Field(default=None, pattern=r"^[a-z0-9-]+$")
    category_id: int | None = None
    title: str | None = None
    title_top: str | None = None
    title_bottom: str | None = None
    short_description: str | None = None
    description: str | None = None
    price: float | None = Field(ge=0, default=None)
    old_price: float | None = Field(ge=0, default=None)
    unit: str | None = None
    pack_qty: float | None = Field(ge=0, default=None)
    in_stock: bool | None = None
    is_popular: bool | None = None
    discount: int | None = Field(ge=0, le=95, default=None)
    position: int | None = None
    specs: list[SpecIn] | None = None
    images: list[ProductImageIn] | None = None


class ProductOut(ORMModel):
    id: int
    slug: str
    category_id: int
    title: str
    title_top: str
    title_bottom: str
    short_description: str
    description: str
    price: float
    old_price: float | None
    unit: str
    pack_qty: float
    in_stock: bool
    is_popular: bool
    discount: int
    position: int
    specs: list
    images: list[ProductImageOut]
    created_at: datetime
    updated_at: datetime


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    pages: int
    per_page: int


# ── Категорії ──
class CategoryBase(BaseModel):
    slug: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1, max_length=120)
    breadcrumb: str = ""
    subtitle: str = ""
    image: str = ""
    position: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9-]+$")
    title: str | None = None
    breadcrumb: str | None = None
    subtitle: str | None = None
    image: str | None = None
    position: int | None = None


class CategoryOut(ORMModel):
    id: int
    slug: str
    title: str
    breadcrumb: str
    subtitle: str
    image: str
    position: int
    product_count: int = 0


class CategoryWithProductsOut(CategoryOut):
    products: list[ProductOut] = []


# ── Галерея колекції ──
# Свідомо без ціни, slug і характеристик: це не товар, а фотографія.
class GalleryPhotoCreate(BaseModel):
    url: str = Field(min_length=1, max_length=400)
    alt: str = Field(default="", max_length=200)
    # None — покласти в кінець списку
    position: int | None = None
    is_active: bool = True


class GalleryPhotoUpdate(BaseModel):
    url: str | None = Field(default=None, min_length=1, max_length=400)
    alt: str | None = Field(default=None, max_length=200)
    position: int | None = None
    is_active: bool | None = None


class GalleryPhotoOut(ORMModel):
    id: int
    url: str
    alt: str
    position: int
    is_active: bool


class GalleryReorder(BaseModel):
    """Повний порядок списку: id у тій послідовності, яку задав адміністратор."""

    ids: list[int] = Field(min_length=1)


# ── Калькулятор ──
class CalculatorOut(ORMModel):
    waste_percent: float
    default_price_per_m2: float
    default_pack_sq_m: float
    min_order_m2: float
    currency: str


class CalculatorUpdate(BaseModel):
    waste_percent: float | None = Field(ge=0, le=50, default=None)
    default_price_per_m2: float | None = Field(ge=0, default=None)
    default_pack_sq_m: float | None = Field(gt=0, default=None)
    min_order_m2: float | None = Field(ge=0, default=None)
    currency: str | None = None


# ── Дашборд ──
class UploadOut(BaseModel):
    url: str
    filename: str
    size: int


class FloorOut(BaseModel):
    """Форма, яку очікує 3D-візуалізатор (сумісна з floorData)."""

    id: int
    name: str
    textureImg: str
    previewImg: str = ""
    repeat: float = 4
    slug: str = ""
    kind: str = ""


class FloorMaterialBase(BaseModel):
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=1, max_length=200)
    kind: str = "Паркет"
    description: str = ""
    preview_url: str = ""
    texture_url: str = Field(min_length=1, max_length=400)
    texture_repeat: float = Field(gt=0, default=4)
    is_active: bool = True
    position: int = 0


class FloorMaterialCreate(FloorMaterialBase):
    pass


class FloorMaterialUpdate(BaseModel):
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9-]+$")
    name: str | None = None
    kind: str | None = None
    description: str | None = None
    preview_url: str | None = None
    texture_url: str | None = Field(default=None, min_length=1)
    texture_repeat: float | None = Field(gt=0, default=None)
    is_active: bool | None = None
    position: int | None = None


class FloorMaterialOut(ORMModel):
    id: int
    slug: str
    name: str
    kind: str
    description: str
    preview_url: str
    texture_url: str
    texture_repeat: float
    is_active: bool
    position: int


class StatsOut(BaseModel):
    products: int
    categories: int
    in_stock: int
    popular: int
    latest: list[ProductOut]
    recently_updated: list[ProductOut]


# ── Замовлення ──
class OrderItemIn(BaseModel):
    product_slug: str = ""
    qty: int = Field(ge=1, le=999, default=1)


class OrderItemOut(ORMModel):
    product_slug: str
    title: str
    unit: str
    price: float
    qty: int


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=9, max_length=32)
    comment: str = Field(max_length=1000, default="")

    delivery_method: str = Field(pattern="^(branch|postomat)$", default="branch")
    area_ref: str = ""
    area_name: str = ""
    city_ref: str = ""
    city_name: str = ""
    warehouse_ref: str = ""
    warehouse_name: str = ""

    items: list[OrderItemIn] = Field(min_length=1)


class OrderOut(ORMModel):
    id: int
    customer_name: str
    phone: str
    comment: str
    delivery_method: str
    area_name: str
    city_name: str
    warehouse_name: str
    warehouse_ref: str
    total: float
    status: str
    created_at: datetime
    items: list[OrderItemOut]


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|processing|shipped|done|cancelled)$")
