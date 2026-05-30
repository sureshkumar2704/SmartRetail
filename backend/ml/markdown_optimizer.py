from datetime import datetime, timedelta
import math
import statistics
from math import log

from sqlalchemy import select

from models.entities import Product, DailySales


def compute_markdown(session, product_id, target_clear_days=30):
    prod = session.get(Product, product_id)
    if not prod:
        return None

    current_stock = prod.current_stock or 0
    selling_price = prod.selling_price or prod.unit_price or 0.0
    unit_cost = prod.unit_cost or 0.0

    # last 60 days sales
    stmt = select(DailySales.day, DailySales.units).where(DailySales.product_id == product_id).order_by(DailySales.day.desc()).limit(60)
    rows = session.execute(stmt).all()
    rows = rows[::-1]
    qtys = [r[1] for r in rows]
    prices = [selling_price for _ in qtys]

    # if insufficient variation in price/history, use default elasticity
    elasticity = -1.5
    if len(qtys) >= 10 and any(q > 0 for q in qtys):
        try:
            # simple log-log regression using means (since we don't have price variation, fallback remains)
            # This is a placeholder — in production would regress across observed price changes
            pass
        except Exception:
            elasticity = -1.5

    avg_daily = sum(qtys) / len(qtys) if qtys else 0.0
    target_days = max(1, target_clear_days)

    # solve for discount d (fraction) using linearized elasticity approx: new_demand = avg_daily * (1 + elasticity * d)
    # need new_demand * target_days >= current_stock
    required_daily = (current_stock / target_days) if target_days > 0 else current_stock
    d = 0.0
    write_off_risk = False
    if avg_daily <= 0:
        # no historical demand — recommend conservative discount
        d = 0.3
    else:
        try:
            needed_multiplier = required_daily / avg_daily
            # 1 + elasticity * d >= needed_multiplier  => d <= (needed_multiplier -1)/elasticity
            d_candidate = (needed_multiplier - 1.0) / (elasticity or -1.0)
            d = max(0.0, d_candidate)
        except Exception:
            d = 0.3

    if d > 0.5:
        write_off_risk = True
        d = 0.5

    recommended_discount_pct = round(d * 100, 2)

    # compute margins
    projected_margin_discount = (selling_price * (1 - d) - unit_cost) * current_stock
    # estimate projected sold under hold scenario: assume avg_daily * target_days
    projected_sold = min(current_stock, avg_daily * target_days)
    disposal_cost = 0  # placeholder
    projected_margin_hold = (selling_price - unit_cost) * projected_sold - disposal_cost * max(0, current_stock - projected_sold)

    margin_delta = projected_margin_discount - projected_margin_hold

    deadline = datetime.utcnow() + timedelta(days=target_days)

    return {
        "recommended_discount_pct": recommended_discount_pct,
        "projected_margin_discount": projected_margin_discount,
        "projected_margin_hold": projected_margin_hold,
        "margin_delta": margin_delta,
        "deadline": deadline.isoformat(),
        "write_off_risk": write_off_risk,
    }
