"""Роздача завантажених зображень із бази.

Публічний ендпоїнт: зображення товарів і галереї має бачити будь-який
відвідувач, тому авторизації тут немає — як і в статичної теки /uploads,
яку цей роутер замінює в serverless-середовищі.

Ім'я файлу випадкове (24 hex-символи), тому вгадати чужий файл
неможливо, а перебирати — марно.
"""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import UploadedFile

router = APIRouter(prefix="/api/files", tags=["files"])

# Ім'я файлу незмінне (кожне завантаження отримує нове), тому вміст
# можна кешувати надовго — інакше кожен перегляд картки тягнув би
# зображення з бази заново.
CACHE_CONTROL = "public, max-age=31536000, immutable"


@router.get("/{filename}")
def get_file(filename: str, db: Session = Depends(get_db)):
    # Path().name відрізає будь-які ../ — за межі таблиці не вийти,
    # але залишаємо як захист від дивних імен у логах
    safe = Path(filename).name

    stored = db.query(UploadedFile).filter(UploadedFile.filename == safe).first()
    if stored is None:
        raise HTTPException(status_code=404, detail="Файл не знайдено")

    return Response(
        content=stored.data,
        media_type=stored.content_type or "application/octet-stream",
        headers={
            "Cache-Control": CACHE_CONTROL,
            "Content-Length": str(stored.size or len(stored.data)),
        },
    )
