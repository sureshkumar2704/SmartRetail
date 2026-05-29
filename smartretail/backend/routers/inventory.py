from __future__ import annotations

from fastapi import APIRouter, HTTPException

from database import get_session
from models.entities import Product
from schemas import InventoryUpdate


router = APIRouter(tags=["inventory"])


def _status(stock: int, reorder_level: int) -> str:
    if stock <= 0:
        return "Out"
    if stock <= reorder_level:
        return "Low"
    return "In Stock"


@router.get("/inventory")
def inventory():
    with get_session() as session:
        rows = session.query(Product).order_by(Product.name.asc()).all()
        return [
            {
                "id": row.id,
                "name": row.name,
                "sku": row.sku,
                "category": row.category,
                "current_stock": row.current_stock,
                "reorder_level": row.reorder_level,
                "status": _status(row.current_stock, row.reorder_level),
                "unit_price": round(float(row.unit_price), 2),
            }
            for row in rows
        ]


@router.put("/inventory/{item_id}")
def update_inventory(item_id: int, payload: InventoryUpdate):
    with get_session() as session:
        product = session.query(Product).filter(Product.id == item_id).first()
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        product.current_stock = payload.current_stock
        product.reorder_level = payload.reorder_level
        session.add(product)
        session.flush()
        return {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "category": product.category,
            "current_stock": product.current_stock,
            "reorder_level": product.reorder_level,
            "status": _status(product.current_stock, product.reorder_level),
            "unit_price": round(float(product.unit_price), 2),
        }
