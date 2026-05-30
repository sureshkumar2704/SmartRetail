from math import sqrt
from datetime import date
import statistics

from sqlalchemy import select, func

from models.entities import Product, DailySales, StoreSetting


def compute_reorder(session, product_id):
    prod = session.get(Product, product_id)
    if not prod:
        return None

    # gather last 90 days of sales
    stmt = select(DailySales.units).where(DailySales.product_id == product_id).order_by(DailySales.day.desc()).limit(90)
    rows = session.execute(stmt).scalars().all()
    if rows:
        daily = list(rows)[::-1]
        avg_daily = sum(daily) / len(daily)
        stddev = statistics.pstdev(daily) if len(daily) > 1 else 0.0
    else:
        avg_daily = 0.0
        stddev = 0.0

    # annual demand estimate
    annual_demand = max(1, avg_daily * 365)

    # simple cost assumptions (could be stored in StoreSetting later)
    order_cost = 50.0
    holding_cost_per_unit = (prod.unit_cost or 0.0) * 0.2 if prod.unit_cost else 1.0

    # EOQ formula
    try:
        eoq = sqrt((2 * annual_demand * order_cost) / max(0.0001, holding_cost_per_unit))
    except Exception:
        eoq = max(1, int(avg_daily * 30))

    # Safety stock and reorder point
    Z = 1.65
    lead = prod.lead_time_days or 7
    safety_stock = Z * stddev * (lead ** 0.5)
    reorder_point = (avg_daily * lead) + safety_stock

    current_stock = prod.current_stock or 0
    days_until_stockout = (current_stock / avg_daily) if avg_daily > 0 else float('inf')

    # urgency levels
    if days_until_stockout <= max(1, lead):
        urgency = "critical"
    elif days_until_stockout <= max(1, lead * 2):
        urgency = "warning"
    else:
        urgency = "normal"

    return {
        "reorder_point": int(reorder_point),
        "eoq": int(max(1, round(eoq))),
        "days_until_stockout": float(days_until_stockout) if days_until_stockout != float('inf') else None,
        "urgency_level": urgency,
        "safety_stock": int(round(safety_stock)),
        "avg_daily": float(avg_daily),
    }
