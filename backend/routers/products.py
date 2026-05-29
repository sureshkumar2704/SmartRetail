from __future__ import annotations

from fastapi import APIRouter

from database import get_session
from models.entities import Product, Transaction


router = APIRouter(tags=["products"])


@router.get("/products")
def products():
    with get_session() as session:
        rows = session.query(Product).order_by(Product.name.asc()).all()
        return [{"id": row.id, "name": row.name, "current_stock": row.current_stock} for row in rows]


@router.get("/products/top")
def top_products():
    with get_session() as session:
        rows = session.query(Transaction.product_name, Transaction.revenue).all()
        totals: dict[str, float] = {}
        for name, revenue in rows:
            totals[name] = totals.get(name, 0.0) + float(revenue)
        ranked = sorted(totals.items(), key=lambda item: item[1], reverse=True)[:5]
        return [{"product": name, "revenue": round(revenue, 2)} for name, revenue in ranked]
