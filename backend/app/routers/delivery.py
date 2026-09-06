"""Проксі до API Нової пошти.

БЕЗПЕКА. Ключ читається з NOVA_POSHTA_API_KEY на сервері й НІКОЛИ не
потрапляє у відповідь. Фронтенд звертається лише до наших /api/delivery/*
і про існування ключа не знає — тому його неможливо витягти з бандла
чи з DevTools.

КЕШ. Довідники Нової пошти майже не змінюються, а список відділень для
великого міста важкий. Тому відповіді лежать у пам'яті процесу з TTL:
області — доба, міста й відділення — година. Це прибирає зайві звернення
до НП і робить вибір у формі миттєвим.
"""

import time

import httpx
from fastapi import APIRouter, HTTPException, Query

from ..config import NOVA_POSHTA_API_KEY, NOVA_POSHTA_URL

router = APIRouter(prefix="/api/delivery", tags=["delivery"])

_cache: dict[str, tuple[float, list]] = {}

DAY = 24 * 60 * 60
HOUR = 60 * 60


def _cached(key: str, ttl: int):
    entry = _cache.get(key)
    if entry and time.time() - entry[0] < ttl:
        return entry[1]
    return None


def _store(key: str, value: list) -> list:
    _cache[key] = (time.time(), value)
    return value


def _call(model: str, method: str, properties: dict) -> list:
    """Один запит до Нової пошти з нормальною обробкою помилок."""
    payload = {
        "apiKey": NOVA_POSHTA_API_KEY,
        "modelName": model,
        "calledMethod": method,
        "methodProperties": properties,
    }

    try:
        with httpx.Client(timeout=20) as client:
            response = client.post(NOVA_POSHTA_URL, json=payload)
    except httpx.RequestError:
        raise HTTPException(
            status_code=503, detail="Нова пошта не відповідає. Спробуйте ще раз."
        )

    if response.status_code != 200:
        raise HTTPException(status_code=503, detail="Нова пошта недоступна")

    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=503, detail="Некоректна відповідь Нової пошти")

    if not data.get("success"):
        errors = data.get("errors") or []
        # Текст помилки НП показуємо лише як загальний натяк, без деталей ключа
        detail = "Не вдалося отримати дані Нової пошти"
        if any("API key" in str(item) for item in errors):
            detail = "Сервіс доставки тимчасово недоступний"
        raise HTTPException(status_code=502, detail=detail)

    return data.get("data") or []


@router.get("/areas")
def areas():
    """Список областей."""
    cached = _cached("areas", DAY)
    if cached is not None:
        return cached

    raw = _call("Address", "getAreas", {})
    result = [
        {"ref": item["Ref"], "name": item["Description"]}
        for item in raw
        if item.get("Ref") and item.get("Description")
    ]
    result.sort(key=lambda item: item["name"])
    return _store("areas", result)


@router.get("/cities")
def cities(area: str = Query(..., min_length=8), search: str = ""):
    """Міста обраної області (з необов'язковим пошуком по назві)."""
    key = f"cities:{area}:{search.strip().lower()}"
    cached = _cached(key, HOUR)
    if cached is not None:
        return cached

    properties = {"AreaRef": area, "Page": "1", "Limit": "500"}
    if search.strip():
        properties["FindByString"] = search.strip()

    raw = _call("Address", "getCities", properties)
    result = [
        {
            "ref": item["Ref"],
            "name": item["Description"],
            "area": item.get("AreaDescription", ""),
        }
        for item in raw
        if item.get("Ref")
    ]
    result.sort(key=lambda item: item["name"])
    return _store(key, result)


@router.get("/warehouses")
def warehouses(
    city: str = Query(..., min_length=8),
    kind: str = Query("branch", pattern="^(branch|postomat)$"),
    search: str = "",
):
    """Відділення або поштомати обраного міста.

    Нова пошта повертає категорію у CategoryOfWarehouse: Postomat — це
    поштомат, решта (Branch, Store, DropOff) — звичайні відділення.
    """
    key = f"wh:{city}:{kind}:{search.strip().lower()}"
    cached = _cached(key, HOUR)
    if cached is not None:
        return cached

    properties = {"CityRef": city, "Page": "1", "Limit": "500"}
    if search.strip():
        properties["FindByString"] = search.strip()

    raw = _call("Address", "getWarehouses", properties)

    result = []
    for item in raw:
        category = item.get("CategoryOfWarehouse") or "Branch"

        # Fulfillment — це склад НП, а не пункт видачі: клієнту він не потрібен
        if category == "Fulfillment":
            continue

        is_postomat = category == "Postomat"

        if (kind == "postomat") != is_postomat:
            continue

        result.append(
            {
                "ref": item["Ref"],
                "name": item.get("Description", ""),
                "number": item.get("Number", ""),
                "category": category,
            }
        )

    def order(entry):
        try:
            return (0, int(entry["number"]))
        except (TypeError, ValueError):
            return (1, 0)

    result.sort(key=order)
    return _store(key, result)
