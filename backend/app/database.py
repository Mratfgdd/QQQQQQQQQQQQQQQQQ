"""Підключення до бази та сесії SQLAlchemy."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from .config import DATABASE_URL, IS_SERVERLESS, IS_SQLITE

# check_same_thread потрібен лише для SQLite: FastAPI обслуговує запити
# в різних потоках, а SQLite за замовчуванням це забороняє.
connect_args = {"check_same_thread": False} if IS_SQLITE else {}

engine_options = {"connect_args": connect_args, "future": True}

if not IS_SQLITE:
    # pre_ping рятує від «server closed the connection unexpectedly»:
    # хмарний Postgres (Neon, Supabase) закриває простої, а пул про це
    # не знає й віддає мертве з'єднання.
    engine_options["pool_pre_ping"] = True

if IS_SERVERLESS and not IS_SQLITE:
    # У serverless кожен інстанс живе секунди, і власний пул у кожного
    # з них швидко вичерпує ліміт з'єднань Postgres на безкоштовному
    # тарифі. NullPool відкриває з'єднання на запит і одразу закриває.
    engine_options["poolclass"] = NullPool

engine = create_engine(DATABASE_URL, **engine_options)
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


def ensure_columns() -> None:
    """Додає нові колонки в уже створену SQLite-базу.

    create_all() створює лише відсутні ТАБЛИЦІ й нічого не знає про нові
    поля, тому колонки для 3D додаємо вручну. Ідемпотентно: перевіряємо
    PRAGMA і додаємо тільки те, чого ще немає — дані не втрачаються.

    Працює тільки для SQLite: PRAGMA — його власний синтаксис, і на
    Postgres цей виклик впав би. Для чистої хмарної бази міграція й не
    потрібна — там create_all() одразу створює таблиці правильної форми,
    бо колонок зі старої схеми ніколи не існувало.
    """
    if not IS_SQLITE:
        return

    from sqlalchemy import text

    with engine.begin() as connection:
        existing = {
            row[1] for row in connection.execute(text("PRAGMA table_info(products)"))
        }

        # Раніше 3D-підлога зберігалася прямо в товарі. Переносимо такі
        # записи в окрему таблицю floor_materials, щоб нічого не загубити,
        # і прибираємо самі колонки — тоді товар більше не може стати 3D.
        if "available_in_3d" in existing:
            rows = connection.execute(
                text(
                    "SELECT slug, title, texture_url, texture_repeat, available_in_3d "
                    "FROM products WHERE texture_url IS NOT NULL AND texture_url != ''"
                )
            ).fetchall()

            for slug, title, texture_url, texture_repeat, active in rows:
                taken = connection.execute(
                    text("SELECT 1 FROM floor_materials WHERE slug = :slug"),
                    {"slug": slug},
                ).fetchone()
                if taken:
                    continue

                connection.execute(
                    text(
                        "INSERT INTO floor_materials "
                        "(slug, name, kind, description, preview_url, texture_url, "
                        " texture_repeat, is_active, position, created_at, updated_at) "
                        "VALUES (:slug, :name, :kind, '', '', :texture, :repeat, "
                        ":active, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
                    ),
                    {
                        "slug": slug,
                        "name": title,
                        "kind": "Паркет",
                        "texture": texture_url,
                        "repeat": texture_repeat or 4,
                        "active": 1 if active else 0,
                    },
                )

            for column in ("texture_url", "available_in_3d", "texture_repeat"):
                if column in existing:
                    try:
                        connection.execute(
                            text(f"ALTER TABLE products DROP COLUMN {column}")
                        )
                    except Exception:
                        # Старий SQLite без DROP COLUMN — колонка просто
                        # лишиться невживаною, код її вже не читає
                        pass
