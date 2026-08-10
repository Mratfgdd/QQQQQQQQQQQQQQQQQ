"""Підключення до бази та сесії SQLAlchemy."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL

# check_same_thread потрібен лише для SQLite: FastAPI обслуговує запити
# в різних потоках, а SQLite за замовчуванням це забороняє.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db():
    """Залежність FastAPI: сесія на один запит."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
