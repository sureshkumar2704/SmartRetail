from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from database import get_session
from ml.markdown_optimizer import compute_markdown
from models.entities import MarkdownRecommendation, Product, AgentAction

router = APIRouter(tags=["markdown"])


class AnalyzeRequest(BaseModel):
    product_id: int
    target_clear_days: int = 30


@router.post("/markdown/analyze")
def analyze(payload: AnalyzeRequest):
    with get_session() as session:
        prod = session.query(Product).filter(Product.id == payload.product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")
        result = compute_markdown(session, payload.product_id, payload.target_clear_days)
        rec = MarkdownRecommendation(product_id=payload.product_id, current_stock=prod.current_stock or 0, days_to_clear=payload.target_clear_days, current_price=prod.selling_price or prod.unit_price or 0.0, recommended_discount_pct=result.get("recommended_discount_pct"), projected_margin_impact=result.get("projected_margin_discount"), hold_scenario_margin=result.get("projected_margin_hold"), deadline=datetime.fromisoformat(result.get("deadline")))
        session.add(rec)
        session.commit()
        return {**result, "id": rec.id}


@router.get("/markdown/recommendations")
def list_recs():
    with get_session() as session:
        recs = session.query(MarkdownRecommendation).filter(MarkdownRecommendation.status == "pending").all()
        out = []
        for r in recs:
            prod = session.query(Product).filter(Product.id == r.product_id).first()
            out.append({
                "id": r.id,
                "product_id": r.product_id,
                "product_name": prod.name if prod else None,
                "current_stock": r.current_stock,
                "recommended_discount_pct": r.recommended_discount_pct,
                "status": r.status,
            })
        return out


@router.post("/markdown/recommendations/{id}/approve")
def approve_markdown(id: int):
    with get_session() as session:
        rec = session.query(MarkdownRecommendation).filter(MarkdownRecommendation.id == id).first()
        if not rec:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        rec.status = "approved"
        session.add(rec)
        # create AgentAction of type markdown
        action = AgentAction(product_id=rec.product_id, action_type="markdown", payload={"recommendation_id": rec.id, "discount_pct": rec.recommended_discount_pct}, status="pending")
        session.add(action)
        session.commit()
        return {"id": rec.id, "status": rec.status, "action_id": action.id}


@router.get("/markdown/at-risk")
def at_risk():
    with get_session() as session:
        prods = session.query(Product).all()
        out = []
        for p in prods:
            # compute avg daily sales from DailySales
            avg = session.query(func.avg).selectable if False else None
        # Simple approach: reuse DailySales to compute avg per product
        from models.entities import DailySales
        for p in prods:
            rows = session.query(DailySales).filter(DailySales.product_id == p.id).order_by(DailySales.day.desc()).limit(60).all()
            qtys = [r.units for r in rows]
            avg_daily = sum(qtys) / len(qtys) if qtys else 0.0
            days_on_hand = (p.current_stock / avg_daily) if avg_daily > 0 else float('inf')
            if days_on_hand > 45:
                out.append({"product_id": p.id, "product_name": p.name, "current_stock": p.current_stock, "avg_daily_sales": avg_daily, "days_on_hand": days_on_hand})
        out = sorted(out, key=lambda x: x["days_on_hand"], reverse=True)
        return out
