"""Налаштування бекенда Parket Planet.

Секрет для підпису JWT береться з середовища, а якщо його немає —
генерується один раз і лягає у backend/.secret. Так локальний запуск
працює «з коробки», але секрет не лежить у репозиторії й не в коді.
"""

import os
import secrets
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"
DB_PATH = BASE_DIR / "parket_planet.db"
SECRET_FILE = BASE_DIR / ".secret"

DATABASE_URL = os.environ.get("PP_DATABASE_URL", f"sqlite:///{DB_PATH}")

# Початкові дані адміністратора. Пароль одразу хешується bcrypt і в базу
# потрапляє тільки хеш; у відкритому вигляді він ніде не зберігається.
INITIAL_ADMIN_USERNAME = os.environ.get("PP_ADMIN_USER", "admin")
INITIAL_ADMIN_PASSWORD = os.environ.get("PP_ADMIN_PASSWORD", "parket")

COOKIE_NAME = "pp_admin"
TOKEN_TTL_HOURS = 12

# Фронтенд у режимі розробки живе на іншому порту, тому потрібні CORS
# із credentials — інакше браузер не віддасть HttpOnly-куку.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "PP_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001",
    ).split(",")
    if origin.strip()
]

# Завантаження зображень
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 МБ
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
}


def get_secret_key() -> str:
    env_secret = os.environ.get("PP_SECRET_KEY")
    if env_secret:
        return env_secret

    if SECRET_FILE.exists():
        stored = SECRET_FILE.read_text(encoding="utf-8").strip()
        if stored:
            return stored

    generated = secrets.token_urlsafe(48)
    SECRET_FILE.write_text(generated, encoding="utf-8")
    return generated


SECRET_KEY = get_secret_key()
