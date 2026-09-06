"""Автентифікація адміністратора.

Пароль перевіряється ВИКЛЮЧНО тут, на бекенді: у базі лежить bcrypt-хеш,
а фронтенд ніколи не бачить ані пароля, ані хеша.

Сесія — підписаний JWT у HttpOnly-куці. JavaScript до неї не має доступу
(тому XSS не вкраде сесію), а localStorage ми навмисно не використовуємо.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .config import (
    COOKIE_NAME,
    COOKIE_SAMESITE,
    COOKIE_SECURE,
    SECRET_KEY,
    TOKEN_TTL_HOURS,
)
from .database import get_db
from .models import AdminUser

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # зіпсований хеш у базі — вважаємо пароль невірним
        return False


def create_token(user: AdminUser) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "iat": now,
        "exp": now + timedelta(hours=TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def set_session_cookie(response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        # На проді (різні домени) потрібні samesite="none" + secure=True,
        # локально — lax + secure=False. Керується змінними середовища.
        samesite=COOKIE_SAMESITE,
        secure=COOKIE_SECURE,
        max_age=TOKEN_TTL_HOURS * 3600,
        path="/",
    )


def clear_session_cookie(response) -> None:
    response.delete_cookie(COOKIE_NAME, path="/")


def require_admin(request: Request, db: Session = Depends(get_db)) -> AdminUser:
    """Залежність для всіх адмінських ендпоїнтів.

    Без валідної куки — 401. Саме ця функція, а не фронтенд, і є захистом:
    ручний запит до /api/admin/* із браузера чи curl без сесії не пройде.
    """
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Потрібна авторизація"
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Сесія завершилася"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Недійсна сесія"
        )

    user = db.get(AdminUser, int(payload.get("sub", 0)))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Користувача не знайдено"
        )

    return user
