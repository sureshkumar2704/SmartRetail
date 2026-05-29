from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Query

from database import get_session
from models.entities import Transaction


router = APIRouter(tags=["sales"])


@router.get("/sales/trend")
def trend(days: int = Query(default=30, ge=1, le=90)):
    with get_session() as session:
        cutoff = datetime.utcnow() - timedelta(days=days)
        records = (
            session.query(Transaction)
            .filter(Transaction.transacted_at >= cutoff)
            .order_by(Transaction.transacted_at.asc())
            .all()
        )
        daily: dict[str, float] = defaultdict(float)
        for record in records:
            daily[record.transacted_at.date().isoformat()] += float(record.revenue)
        return [{"date": day, "revenue": round(value, 2)} for day, value in sorted(daily.items())]


@router.get("/sales/by-category")
def by_category():
    with get_session() as session:
        categories: dict[str, float] = defaultdict(float)
        for record in session.query(Transaction).all():
            categories[record.category] += float(record.revenue)
        return [{"category": name, "revenue": round(value, 2)} for name, value in categories.items()]


@router.get("/sales/hourly-pattern")
def hourly_pattern():
    with get_session() as session:
        buckets: dict[int, list[float]] = defaultdict(list)
        for record in session.query(Transaction).all():
            buckets[record.transacted_at.hour].append(float(record.quantity))
        return [
            {"hour": hour, "avg_sales": round(sum(values) / len(values), 2) if values else 0.0}
            for hour, values in sorted(buckets.items())
        ]


@router.get("/transactions")
def transactions(page: int = 1, limit: int = 50, category: str | None = None):
    with get_session() as session:
        query = session.query(Transaction)
        if category:
            query = query.filter(Transaction.category == category)
        total = query.count()
        rows = query.order_by(Transaction.transacted_at.desc()).offset((page - 1) * limit).limit(limit).all()
        items = [
            {
                "id": row.id,
                "transaction_code": row.transaction_code,
                "date": row.transacted_at.isoformat(),
                "product": row.product_name,
                "category": row.category,
                "quantity": row.quantity,
                "revenue": round(row.revenue, 2),
                "notes": row.notes,
            }
            for row in rows
        ]
        return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/sales/heatmap")
def heatmap(days: int = 90):
    with get_session() as session:
        cutoff = datetime.utcnow() - timedelta(days=days)
        rows = session.query(Transaction).filter(Transaction.transacted_at >= cutoff).all()
        return [
            {"date": row.transacted_at.date().isoformat(), "value": round(float(row.revenue), 2)}
            for row in rows
        ]
