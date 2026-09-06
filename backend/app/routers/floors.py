"""3D-матеріали підлоги — ОКРЕМА сутність від товарів каталогу.

Публічний GET /api/floors віддає лише активні матеріали у форматі, який
уже очікує компонент TextureSelection у 3D.

Адмінські /api/admin/floors захищені тією ж залежністю require_admin, що
й решта адмінки: звичайний користувач не може ні створити, ні змінити,
ні видалити матеріал.

Ключове: тут немає жодного дотику до таблиці products. Створення
матеріалу фізично не може додати товар у каталог, кошик чи обране.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..database import get_db
from ..models import FloorMaterial
from ..schemas import (
    FloorMaterialCreate,
    FloorMaterialOut,
    FloorMaterialUpdate,
    FloorOut,
)

public = APIRouter(prefix="/api/floors", tags=["floors"])
admin = APIRouter(
    prefix="/api/admin/floors", tags=["admin"], dependencies=[Depends(require_admin)]
)


@public.get("", response_model=list[FloorOut])
def list_floors(db: Session = Depends(get_db)):
    materials = (
        db.query(FloorMaterial)
        .filter(FloorMaterial.is_active.is_(True))
        .order_by(FloorMaterial.position, FloorMaterial.id)
        .all()
    )

    return [
        FloorOut(
            id=material.id,
            name=material.name,
            textureImg=material.texture_url,
            previewImg=material.preview_url,
            repeat=material.texture_repeat or 4,
            slug=material.slug,
            kind=material.kind,
        )
        for material in materials
    ]


@admin.get("", response_model=list[FloorMaterialOut])
def admin_list(db: Session = Depends(get_db)):
    return (
        db.query(FloorMaterial)
        .order_by(FloorMaterial.position, FloorMaterial.id)
        .all()
    )


@admin.post("", response_model=FloorMaterialOut, status_code=status.HTTP_201_CREATED)
def create_material(payload: FloorMaterialCreate, db: Session = Depends(get_db)):
    if db.query(FloorMaterial).filter(FloorMaterial.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Матеріал з таким slug вже існує")

    material = FloorMaterial(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@admin.put("/{material_id}", response_model=FloorMaterialOut)
def update_material(
    material_id: int, payload: FloorMaterialUpdate, db: Session = Depends(get_db)
):
    material = db.get(FloorMaterial, material_id)
    if material is None:
        raise HTTPException(status_code=404, detail="Матеріал не знайдено")

    data = payload.model_dump(exclude_unset=True)

    if "slug" in data:
        clash = (
            db.query(FloorMaterial)
            .filter(FloorMaterial.slug == data["slug"], FloorMaterial.id != material_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=409, detail="Такий slug вже зайнятий")

    for field, value in data.items():
        setattr(material, field, value)

    db.commit()
    db.refresh(material)
    return material


@admin.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    material = db.get(FloorMaterial, material_id)
    if material is None:
        raise HTTPException(status_code=404, detail="Матеріал не знайдено")

    # Видаляється ТІЛЬКИ матеріал: жодного товару це не зачіпає
    db.delete(material)
    db.commit()
    return {"ok": True}
