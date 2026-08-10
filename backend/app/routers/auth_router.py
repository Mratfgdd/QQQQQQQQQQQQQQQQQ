"""Логін, логаут, поточний користувач і зміна пароля."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..auth import (
    clear_session_cookie,
    create_token,
    hash_password,
    require_admin,
    set_session_cookie,
    verify_password,
)
from ..database import get_db
from ..models import AdminUser
from ..schemas import AdminOut, LoginRequest, PasswordChangeRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=AdminOut)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()

    # Однакова відповідь і на невірне ім'я, і на невірний пароль —
    # щоб не підказувати, який саме логін існує
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невірний логін або пароль",
        )

    set_session_cookie(response, create_token(user))
    return user


@router.post("/logout")
def logout(response: Response):
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=AdminOut)
def me(user: AdminUser = Depends(require_admin)):
    return user


@router.post("/password")
def change_password(
    payload: PasswordChangeRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_admin),
):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Поточний пароль невірний"
        )

    user.password_hash = hash_password(payload.new_password)
    db.commit()

    # Видаємо свіжий токен, щоб сесія не «протухла» після зміни пароля
    set_session_cookie(response, create_token(user))
    return {"ok": True}
