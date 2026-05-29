from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["reports"])


@router.get("/reports/sales-summary")
def sales_summary():
    return {
        "generated_at": "2026-05-29T00:00:00Z",
        "title": "Monthly Sales Summary",
        "metrics": [{"label": "Revenue", "value": 124800}, {"label": "Transactions", "value": 3240}],
    }


@router.get("/reports/inventory")
def inventory_report():
    return {"generated_at": "2026-05-29T00:00:00Z", "title": "Inventory Health Report", "items": []}


@router.get("/reports/forecast")
def forecast_report():
    return {"generated_at": "2026-05-29T00:00:00Z", "title": "Demand Forecast Report", "items": []}


@router.post("/reports/schedule")
def schedule_report(payload: dict):
    return {"ok": True, "schedule": payload}
