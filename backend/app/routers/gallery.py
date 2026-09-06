"""Галерея колекції — ОКРЕМА сутність від товарів каталогу.

Публічний GET /api/gallery віддає активні фотографії у порядку, який
задав адміністратор. Саме цей ендпоїнт читає сторінка /collection.

Адмінські /api/admin/gallery захищені тією ж залежністю require_admin,
що й решта адмінки.

Ключове: тут немає жодного дотику до таблиць products і categories.
Додавання фотографії у галерею фізично не може створити товар, і
навпаки — видалення фотографії не чіпає каталог.
"""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..config import UPLOAD_DIR
from ..database import get_db
from ..models import Category, FloorMaterial, GalleryPhoto, ProductImage, UploadedFile
from ..schemas import (
    GalleryPhotoCreate,
    GalleryPhotoOut,
    GalleryPhotoUpdate,
    GalleryReorder,
)

public = APIRouter(prefix="/api/gallery", tags=["gallery"])
admin = APIRouter(
    prefix="/api/admin/gallery", tags=["admin"], dependencies=[Depends(require_admin)]
)


def _ordered(query):
    return query.order_by(GalleryPhoto.position, GalleryPhoto.id)


def _next_position(db: Session) -> int:
    last = _ordered(db.query(GalleryPhoto)).all()
    return (last[-1].position + 1) if last else 0


def _drop_unused_file(db: Session, url: str) -> bool:
    """Прибирає завантажений файл, якщо на нього більше ніхто не посилається.

    Свідомо обережно: чіпаємо лише те, що завантажив адміністратор
    (/api/files/… у базі або старе /uploads/… на диску) — файли з public/
    належать репозиторію. І лише коли жоден товар, категорія,
    3D-матеріал чи інша фотографія галереї цей самий URL не використовує.
    Інакше видалення однієї картки могло б «погасити» зображення в
    іншому місці сайту.
    """
    if not (url.startswith("/uploads/") or url.startswith("/api/files/")):
        return False

    still_used = (
        db.query(GalleryPhoto).filter(GalleryPhoto.url == url).first()
        or db.query(ProductImage).filter(ProductImage.url == url).first()
        or db.query(Category).filter(Category.image == url).first()
        or db.query(FloorMaterial)
        .filter(
            (FloorMaterial.texture_url == url) | (FloorMaterial.preview_url == url)
        )
        .first()
    )
    if still_used:
        return False

    name = Path(url).name

    # Нові файли живуть у базі
    stored = db.query(UploadedFile).filter(UploadedFile.filename == name).first()
    if stored is not None:
        db.delete(stored)
        db.commit()
        return True

    # Старі — ще на диску (там, де диск взагалі є)
    target = (UPLOAD_DIR / name).resolve()
    if not str(target).startswith(str(UPLOAD_DIR.resolve())):
        return False

    if target.exists():
        target.unlink()
        return True
    return False


@public.get("", response_model=list[GalleryPhotoOut])
def list_public(db: Session = Depends(get_db)):
    """Те, що бачить відвідувач на /collection.

    Порожній список — теж коректна відповідь: якщо адміністратор видалив
    усі фотографії, галерея на сайті має стати порожньою, а не показувати
    щось «зі старих запасів».
    """
    return _ordered(
        db.query(GalleryPhoto).filter(GalleryPhoto.is_active.is_(True))
    ).all()


@admin.get("", response_model=list[GalleryPhotoOut])
def admin_list(db: Session = Depends(get_db)):
    """Адміністратор бачить усі фотографії, зокрема приховані."""
    return _ordered(db.query(GalleryPhoto)).all()


@admin.post("", response_model=GalleryPhotoOut, status_code=status.HTTP_201_CREATED)
def create_photo(payload: GalleryPhotoCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    if data.get("position") is None:
        data["position"] = _next_position(db)

    photo = GalleryPhoto(**data)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@admin.put("/reorder", response_model=list[GalleryPhotoOut])
def reorder(payload: GalleryReorder, db: Session = Depends(get_db)):
    """Записує новий порядок одним запитом.

    Маршрут оголошений ДО /{photo_id}, інакше FastAPI спробував би
    прочитати «reorder» як число й повернув би 422.
    """
    photos = {photo.id: photo for photo in db.query(GalleryPhoto).all()}

    unknown = [photo_id for photo_id in payload.ids if photo_id not in photos]
    if unknown:
        raise HTTPException(status_code=404, detail="Фотографію не знайдено")

    for index, photo_id in enumerate(payload.ids):
        photos[photo_id].position = index

    # Те, чого немає у списку, лишається після впорядкованих
    tail = len(payload.ids)
    for photo_id, photo in photos.items():
        if photo_id not in payload.ids:
            photo.position = tail
            tail += 1

    db.commit()
    return _ordered(db.query(GalleryPhoto)).all()


@admin.put("/{photo_id}", response_model=GalleryPhotoOut)
def update_photo(
    photo_id: int, payload: GalleryPhotoUpdate, db: Session = Depends(get_db)
):
    photo = db.get(GalleryPhoto, photo_id)
    if photo is None:
        raise HTTPException(status_code=404, detail="Фотографію не знайдено")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(photo, field, value)

    db.commit()
    db.refresh(photo)
    return photo


@admin.delete("/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.get(GalleryPhoto, photo_id)
    if photo is None:
        raise HTTPException(status_code=404, detail="Фотографію не знайдено")

    url = photo.url
    db.delete(photo)
    db.commit()

    removed_file = _drop_unused_file(db, url)
    return {"ok": True, "file_removed": removed_file}
