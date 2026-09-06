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

# Vercel виставляє цю змінну автоматично — по ній розуміємо, що працюємо
# в serverless-середовищі з тимчасовою файловою системою.
IS_SERVERLESS = bool(os.environ.get("VERCEL"))


def _normalize_database_url(url: str) -> str:
    """Приводить рядок підключення до формату, який розуміє SQLAlchemy 2.

    Neon, Vercel Postgres і Supabase видають URL у вигляді
    `postgres://…` або `postgresql://…`, а SQLAlchemy 2 потребує явного
    драйвера. Без цього створення engine падає з
    `Can't load plugin: sqlalchemy.dialects:postgres`.
    """
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]

    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]

    return url


# У проді підключення до Postgres приходить змінною середовища.
# Локально — той самий SQLite-файл, що й був, тому розробка не змінюється.
DATABASE_URL = _normalize_database_url(
    os.environ.get("PP_DATABASE_URL")
    or os.environ.get("DATABASE_URL")
    or f"sqlite:///{DB_PATH}"
)

IS_SQLITE = DATABASE_URL.startswith("sqlite")

if IS_SERVERLESS and IS_SQLITE:
    # Мовчазний фолбек тут був би найгіршим варіантом: застосунок
    # піднявся б, а потім кожен запит падав би з незрозумілим
    # «attempt to write a readonly database». Краще одразу сказати, чого
    # бракує, — у логах Vercel це видно першим рядком.
    raise RuntimeError(
        "PP_DATABASE_URL не задано. У serverless файлова система доступна "
        "лише для читання, тому SQLite там працювати не може. "
        "Створіть безкоштовну базу Postgres (Neon / Vercel Postgres / Supabase) "
        "і додайте її рядок підключення у Settings → Environment Variables."
    )

# Початкові дані адміністратора. Пароль одразу хешується bcrypt і в базу
# потрапляє тільки хеш; у відкритому вигляді він ніде не зберігається.
INITIAL_ADMIN_USERNAME = os.environ.get("PP_ADMIN_USER", "admin")
INITIAL_ADMIN_PASSWORD = os.environ.get("PP_ADMIN_PASSWORD", "parket")

COOKIE_NAME = "pp_admin"
TOKEN_TTL_HOURS = 12

# Куки сесії.
# Локально фронтенд і бекенд на одному хості по http → lax + secure=False.
# У продакшені вони на РІЗНИХ доменах (Netlify ↔ хостинг бекенда), і браузер
# збереже куку лише якщо вона SameSite=None; Secure. Тому на проді треба
# виставити PP_COOKIE_SAMESITE=none і PP_COOKIE_SECURE=1.
# На Vercel фронтенд і API живуть на ОДНОМУ домені (/api/* переписується
# на цю ж функцію), тому крос-доменних танців із SameSite=None не потрібно:
# lax + Secure — і безпечніше, і працює в Safari та в режимі блокування
# сторонніх кук. Тому secure вмикається автоматично під HTTPS-хостингом.
COOKIE_SAMESITE = os.environ.get("PP_COOKIE_SAMESITE", "lax").lower()
COOKIE_SECURE = (
    os.environ.get("PP_COOKIE_SECURE", "").lower() in {"1", "true", "yes"}
    or IS_SERVERLESS
)

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
    """Ключ підпису сесійного токена.

    Пріоритет — змінна середовища. У serverless вона фактично обов'язкова:
    інстанси там короткоживучі, і без спільного ключа кожен холодний старт
    генерував би свій, а вже видані куки ставали б недійсними — тобто
    адміністратора викидало б із панелі на випадкових запитах.

    Запис у файл лишається лише для локальної розробки й обгорнутий у
    try: на Vercel файлова система доступна тільки для читання, і спроба
    створити .secret валила б увесь застосунок ще на імпорті.
    """
    env_secret = os.environ.get("PP_SECRET_KEY")
    if env_secret:
        return env_secret

    try:
        if SECRET_FILE.exists():
            stored = SECRET_FILE.read_text(encoding="utf-8").strip()
            if stored:
                return stored
    except OSError:
        pass

    generated = secrets.token_urlsafe(48)

    try:
        SECRET_FILE.write_text(generated, encoding="utf-8")
    except OSError:
        # Тільки для читання — працюємо з тимчасовим ключем.
        # У проді це означає, що PP_SECRET_KEY забули задати.
        pass

    return generated


SECRET_KEY = get_secret_key()


# ── Нова пошта ──
# Ключ живе ТІЛЬКИ на сервері. Довідникові методи (області, міста,
# відділення) працюють і з порожнім ключем, але для стабільної роботи
# та лімітів варто вписати свій: NOVA_POSHTA_API_KEY у середовищі.
NOVA_POSHTA_API_KEY = os.environ.get("NOVA_POSHTA_API_KEY", "")
NOVA_POSHTA_URL = os.environ.get(
    "NOVA_POSHTA_URL", "https://api.novaposhta.ua/v2.0/json/"
)
