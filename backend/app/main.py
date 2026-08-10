"""Точка входу бекенда Parket Planet."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import ALLOWED_ORIGINS, UPLOAD_DIR
from .database import Base, SessionLocal, engine
from .routers import auth_router, calculator, categories, products, uploads
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

Base.metadata.create_all(bind=engine)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

with SessionLocal() as session:
    run_seed(session)

app.include_router(auth_router.router)
app.include_router(categories.public)
app.include_router(categories.admin)
app.include_router(products.public)
app.include_router(products.admin)
app.include_router(calculator.public)
app.include_router(calculator.admin)
app.include_router(uploads.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
