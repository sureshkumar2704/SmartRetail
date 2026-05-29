from __future__ import annotations

from fastapi import APIRouter, Query

from database import get_session
from models.entities import Product, Transaction


router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary")
def summary():
    with get_session() as session:
        transactions = session.query(Transaction).all()
        products = session.query(Product).all()
        total_revenue = round(sum(item.revenue for item in transactions), 2)
        total_transactions = len(transactions)
        top_selling = products[0].name if products else "N/A"
        low_stock_alerts = len([item for item in products if item.current_stock <= item.reorder_level])
        return {
            "total_revenue": total_revenue,
            "total_transactions": total_transactions,
            "top_selling_product": top_selling,
            "low_stock_alerts": low_stock_alerts,
        }
