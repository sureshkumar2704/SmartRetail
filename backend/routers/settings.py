from __future__ import annotations

from fastapi import APIRouter

from schemas import StoreSettingsPayload


router = APIRouter(tags=["settings"])


@router.put("/settings/store")
def save_store_config(payload: StoreSettingsPayload):
    return {"ok": True, "settings": payload.model_dump()}
