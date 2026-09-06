"""Завантаження та видалення зображень.

Файли зберігаються В БАЗІ (таблиця uploaded_files), а не на диску.

ЧОМУ ТАК. На Vercel і будь-якому іншому serverless файлова система
доступна лише для читання, а /tmp існує рівно один виклик функції.
Запис на диск там просто не переживе відповіді, тому фото, додане в
адмін-панелі, зникало б одразу. База — єдине сховище, спільне для всіх
інстансів і стійке до передеплою.

У товарах, категоріях і галереї, як і раніше, лежить лише шлях
(/api/files/<ім'я>) — жодного base64 у полях сутностей.

Старі файли з backend/uploads нікуди не зникли: main.py досі роздає їх
за /uploads/..., тому вже збережені посилання продовжують працювати.
"""

import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..config import ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..database import get_db
from ..models import UploadedFile
from ..schemas import UploadOut

router = APIRouter(
    prefix="/api/admin/uploads", tags=["admin"], dependencies=[Depends(require_admin)]
)

# Публічний префікс, за яким віддаються завантажені файли
PUBLIC_PREFIX = "/api/files"


@router.post("", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
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
    filename = f"{secrets.token_hex(12)}{extension}"

    db.add(
        UploadedFile(
            filename=filename,
            content_type=file.content_type or "application/octet-stream",
            size=len(payload),
            data=payload,
        )
    )
    db.commit()

    return UploadOut(
        url=f"{PUBLIC_PREFIX}/{filename}", filename=filename, size=len(payload)
    )


@router.delete("/{filename}")
def delete_image(filename: str, db: Session = Depends(get_db)):
    safe = Path(filename).name

    stored = db.query(UploadedFile).filter(UploadedFile.filename == safe).first()
    if stored is not None:
        db.delete(stored)
        db.commit()
        return {"ok": True, "deleted": safe}

    # Сумісність зі старими файлами, які ще лежать на диску
    target = (UPLOAD_DIR / safe).resolve()
    if not str(target).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Некоректне ім'я файлу")

    if target.exists():
        target.unlink()
        return {"ok": True, "deleted": target.name}

    return {"ok": True, "deleted": None}
