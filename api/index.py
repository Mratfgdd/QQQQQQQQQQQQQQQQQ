"""Точка входу FastAPI для serverless-функції Vercel.

Vercel перетворює кожен файл у теці /api на окрему функцію. Цей файл —
єдина функція на весь бекенд: vercel.json переписує на неї всі запити
/api/*, а всередині вже працює звичайний роутер FastAPI.

Сам застосунок не дублюється: тут лише імпорт того самого
backend/app/main.py, який запускається локально через uvicorn. Тобто
код бекенда один, а середовищ — два.

Змінна `app` — це те, що шукає рантайм @vercel/python для ASGI.
"""

import sys
from pathlib import Path

# backend/ лежить поруч із api/, а не всередині, тому додаємо його в
# шлях пошуку модулів — інакше `from app.main import app` не знайдеться
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app  # noqa: E402  (шлях треба налаштувати до імпорту)

__all__ = ["app"]
