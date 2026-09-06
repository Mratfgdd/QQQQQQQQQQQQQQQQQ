"""Точка входу бекенда Parket Planet."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import ALLOWED_ORIGINS, IS_SERVERLESS, UPLOAD_DIR
from .database import Base, SessionLocal, engine, ensure_columns
from .routers import (
    auth_router,
    calculator,
    categories,
    delivery,
    files,
    floors,
    gallery,
    orders,
    products,
    uploads,
)
from .seed import run as run_seed

app = FastAPI(title="Parket Planet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # Без цього браузер не надішле HttpOnly-куку сесії з dev-сервера
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _prepare_storage() -> None:
    """Створює таблиці й початкові дані.

    У serverless це виконується на кожному холодному старті, тому все
    всередині ідемпотентне, а помилки не мають валити застосунок: якщо
    два інстанси стартують одночасно, один може програти гонку за
    створення таблиці. Сайт від цього працювати не перестає — наступний
    запит потрапить на вже готову базу.
    """
    Base.metadata.create_all(bind=engine)
    ensure_columns()

    with SessionLocal() as session:
        run_seed(session)


if IS_SERVERLESS:
    try:
        _prepare_storage()
    except Exception:
        # Логи Vercel покажуть трасування, але функція має піднятися
        pass
else:
    _prepare_storage()

# Статична тека потрібна лише там, де є куди писати. У serverless
# файлова система доступна тільки для читання, а зображення роздає
# /api/files з бази.
if not IS_SERVERLESS:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router.router)
app.include_router(categories.public)
app.include_router(categories.admin)
app.include_router(products.public)
app.include_router(products.admin)
app.include_router(calculator.public)
app.include_router(calculator.admin)
app.include_router(floors.public)
app.include_router(floors.admin)
app.include_router(gallery.public)
app.include_router(gallery.admin)
app.include_router(delivery.router)
app.include_router(orders.public)
app.include_router(orders.admin)
app.include_router(uploads.router)
app.include_router(files.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
