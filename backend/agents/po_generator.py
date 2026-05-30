from datetime import datetime, timedelta

from models.entities import Product, PurchaseOrder


def draft_purchase_order(session, product_id, qty):
    prod = session.get(Product, product_id)
    if not prod:
        return None

    supplier = prod.supplier_name or "Default Supplier"
    unit_cost = prod.unit_cost or 0.0
    expected_delivery_date = datetime.utcnow() + timedelta(days=prod.lead_time_days or 7)

    line_item = {
        "sku": prod.sku,
        "name": prod.name,
        "qty": qty,
        "unit_cost": unit_cost,
        "subtotal": round(unit_cost * qty, 2),
    }

    po = {
        "supplier_name": supplier,
        "product_name": prod.name,
        "sku": prod.sku,
        "order_qty": qty,
        "unit_cost": unit_cost,
        "total_cost": round(unit_cost * qty, 2),
        "expected_delivery_date": expected_delivery_date.isoformat(),
        "line_items": [line_item],
    }

    # persist a PurchaseOrder draft
    po_rec = PurchaseOrder(product_id=product_id, supplier_name=supplier, order_qty=qty, unit_cost=unit_cost, expected_delivery_days=prod.lead_time_days or 7, status="draft")
    session.add(po_rec)
    session.flush()
    po["purchase_order_id"] = po_rec.id
    return po
