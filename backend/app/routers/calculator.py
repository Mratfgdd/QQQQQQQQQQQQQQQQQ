"""Параметри калькулятора: публічне читання, захищена зміна."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..database import get_db
from ..models import CalculatorSettings
from ..schemas import CalculatorOut, CalculatorUpdate

public = APIRouter(prefix="/api/calculator", tags=["calculator"])
admin = APIRouter(
    prefix="/api/admin/calculator", tags=["admin"], dependencies=[Depends(require_admin)]
)


def get_settings(db: Session) -> CalculatorSettings:
    settings = db.get(CalculatorSettings, 1)
    if settings is None:
        settings = CalculatorSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@public.get("/settings", response_model=CalculatorOut)
def read_settings(db: Session = Depends(get_db)):
    return get_settings(db)


@admin.put("/settings", response_model=CalculatorOut)
def update_settings(payload: CalculatorUpdate, db: Session = Depends(get_db)):
    settings = get_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
