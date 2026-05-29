from __future__ import annotations

from fastapi import APIRouter, HTTPException

from database import get_session
from ml.forecaster import forecast_demand
from models.entities import Product
from schemas import ForecastRequest


router = APIRouter(tags=["forecast"])


@router.post("/forecast")
def forecast(payload: ForecastRequest):
    with get_session() as session:
        product = session.query(Product).filter(Product.id == payload.product_id).first()
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        result = forecast_demand(session, payload.product_id, payload.horizon)
        return {"product_id": payload.product_id, "horizon": payload.horizon, "points": result.points, "model": result.model}
