"""Завантаження та видалення зображень товарів.

Файли лягають у backend/uploads і віддаються статикою за /uploads/...
У базі зберігається лише шлях — жодного base64.
"""

import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from ..auth import require_admin
from ..config import ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..schemas import UploadOut

router = APIRouter(
    prefix="/api/admin/uploads", tags=["admin"], dependencies=[Depends(require_admin)]
)


@router.post("", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...)):
    # 1) тип файлу — тільки зображення з білого списку
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(
            status_code=415,
            detail="Дозволені лише зображення: JPEG, PNG, WebP або AVIF",
        )

    payload = await file.read()

    # 2) розмір
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Файл завеликий. Максимум {MAX_UPLOAD_BYTES // (1024 * 1024)} МБ",
        )
    if not payload:
        raise HTTPException(status_code=400, detail="Порожній файл")

    # 3) ім'я генеруємо самі — щоб оригінальне ім'я не могло вилізти
    #    за межі каталогу (../../) і не переписало чужий файл
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{secrets.token_hex(12)}{extension}"
    (UPLOAD_DIR / filename).write_bytes(payload)

    return UploadOut(url=f"/uploads/{filename}", filename=filename, size=len(payload))


@router.delete("/{filename}")
def delete_image(filename: str):
    # Файл шукаємо строго всередині UPLOAD_DIR
    target = (UPLOAD_DIR / Path(filename).name).resolve()
    if not str(target).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Некоректне ім'я файлу")

    if target.exists():
        target.unlink()
        return {"ok": True, "deleted": target.name}

    return {"ok": True, "deleted": None}
