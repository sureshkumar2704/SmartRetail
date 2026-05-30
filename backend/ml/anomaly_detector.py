from datetime import datetime, timedelta
import statistics

from sqlalchemy import select

from models.entities import DailySales, Anomaly, AgentAction, Product


# simple external signals for demo
external_signals = {
    "2026-01-15": "Public Holiday",
    "2026-01-20": "Heavy Rain",
}


def fetch_external_signals(day):
    # day is date or ISO string
    key = day if isinstance(day, str) else day.strftime("%Y-%m-%d")
    return external_signals.get(key)


def explain_anomaly(product_name, day, anomaly_type, z, signal=None):
    day_str = day.strftime("%b %d") if hasattr(day, "strftime") else str(day)
    if anomaly_type == "spike":
        return f"Sales of '{product_name}' spiked (z={z:.2f}) on {day_str}. Likely correlated with {signal or 'an external event'}."
    else:
        return f"Sales of '{product_name}' dropped (z={z:.2f}) on {day_str}. Likely due to {signal or 'low demand or external event'}."


def detect_anomalies(session, z_threshold=2.5):
    new_count = 0
    # iterate products
    prods = session.execute(select(Product)).scalars().all()
    for p in prods:
        stmt = select(DailySales.day, DailySales.units).where(DailySales.product_id == p.id).order_by(DailySales.day.desc()).limit(30)
        rows = session.execute(stmt).all()
        if not rows or len(rows) < 14:
            continue
        rows = rows[::-1]
        days = [r[0] for r in rows]
        units = [r[1] for r in rows]
        # rolling 14-day mean/std — compare last day to previous 14-day window
        window = 14
        if len(units) < window + 1:
            continue
        baseline = units[-(window+1):-1]
        mean = statistics.mean(baseline)
        stdev = statistics.pstdev(baseline) if len(baseline) > 1 else 0.0
        todays = units[-1]
        z = (todays - mean) / (stdev or 1.0)
        if abs(z) > z_threshold:
            anomaly_type = "spike" if z > 0 else "drop"
            severity = "critical" if abs(z) > 3 else ("medium" if abs(z) > 2.8 else "low")
            day = days[-1]
            signal = fetch_external_signals(day)
            explanation = explain_anomaly(p.name, day, anomaly_type, z, signal)
            # skip if exists for same product + date
            day_start = datetime.combine(day, datetime.min.time())
            day_end = day_start + timedelta(days=1)
            exists = session.query(Anomaly).filter(
                Anomaly.product_id == p.id,
                Anomaly.detected_at >= day_start,
                Anomaly.detected_at < day_end,
            ).first()
            if exists:
                continue
            a = Anomaly(product_id=p.id, detected_at=day_start, anomaly_type=anomaly_type, severity=severity, z_score=z, explanation=explanation, external_signal=signal)
            session.add(a)
            session.flush()
            new_count += 1
            # if critical and indicates stockout risk, create AgentAction
            if anomaly_type == "drop" and p.current_stock and p.current_stock < 5:
                act = AgentAction(product_id=p.id, action_type="reorder", payload={"reason": "auto-detected stockout risk"}, triggered_by=a.id)
                session.add(act)
    session.commit()
    return new_count
