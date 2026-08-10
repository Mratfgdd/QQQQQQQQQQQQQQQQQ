"""Первинне наповнення бази.

Дані взяті з реального сайту (експорт із categoriesData.js + productsData.js
у seed_data.json), тому після міграції каталог виглядає точно так само,
як раніше — змінюється лише джерело даних.

Сідинг ідемпотентний: якщо категорії вже є, повторний запуск нічого не чіпає.
"""

import json
from pathlib import Path

from sqlalchemy.orm import Session

from .auth import hash_password
from .config import INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_USERNAME
from .models import AdminUser, CalculatorSettings, Category, Product, ProductImage

SEED_FILE = Path(__file__).resolve().parent / "seed_data.json"


def ensure_admin(db: Session) -> None:
    if db.query(AdminUser).count():
        return
    db.add(
        AdminUser(
            username=INITIAL_ADMIN_USERNAME,
            password_hash=hash_password(INITIAL_ADMIN_PASSWORD),
        )
    )
    db.commit()


def ensure_catalog(db: Session) -> None:
    if db.query(Category).count():
        return
    if not SEED_FILE.exists():
        return

    payload = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    for category_data in payload.get("categories", []):
        products = category_data.pop("products", [])
        category = Category(**category_data)
        db.add(category)
        db.flush()

        for product_data in products:
            images = product_data.pop("images", [])
            product = Product(category_id=category.id, **product_data)
            db.add(product)
            db.flush()

            for image in images:
                db.add(ProductImage(product_id=product.id, **image))

    settings = payload.get("calculator") or {}
    if db.get(CalculatorSettings, 1) is None:
        db.add(CalculatorSettings(id=1, **settings))

    db.commit()


def run(db: Session) -> None:
    ensure_admin(db)
    ensure_catalog(db)
    top_up_specs(db)


def top_up_specs(db: Session) -> None:
    """Доповнює характеристики сідованих товарів.

    Потрібно тому, що сторінка товару тепер малює specs з бази, а перший
    сід містив лише 4 характеристики з картки каталогу.

    Працює ідемпотентно й НЕ перезаписує те, що вже відредагував
    адміністратор: додається тільки характеристика, назви якої в товарі
    ще немає. Товарів, створених вручну, не торкається взагалі.
    """
    if not SEED_FILE.exists():
        return

    payload = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    changed = False

    for category_data in payload.get("categories", []):
        for product_data in category_data.get("products", []):
            product = (
                db.query(Product).filter(Product.slug == product_data["slug"]).first()
            )
            if product is None:
                continue

            existing = list(product.specs or [])
            labels = {spec.get("label") for spec in existing}

            for spec in product_data.get("specs", []):
                if spec["label"] not in labels:
                    existing.append(spec)
                    labels.add(spec["label"])
                    changed = True

            if existing != (product.specs or []):
                product.specs = existing

    if changed:
        db.commit()
