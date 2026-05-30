from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime

from database import get_session
from models.entities import AgentAction, Product, PurchaseOrder
from agents.inventory_agent import run_agent_cycle

router = APIRouter(tags=["agent"])


def send_po_email(po: PurchaseOrder):
    # stub: in production integrate with email service
    print(f"Sending PO email for PO#{po.id} to supplier {po.supplier_name}")


@router.post("/agent/run")
def run_agent():
    with get_session() as session:
        created = run_agent_cycle(session)
        return {"created": len(created), "ids": created}


@router.get("/agent/actions")
def list_actions(status: str = Query("pending")):
    with get_session() as session:
        q = session.query(AgentAction).filter(AgentAction.status == status).all()
        out = []
        for a in q:
            prod = session.query(Product).filter(Product.id == a.product_id).first()
            out.append({
                "id": a.id,
                "product_id": a.product_id,
                "product_name": prod.name if prod else None,
                "sku": prod.sku if prod else None,
                "action_type": a.action_type,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "status": a.status,
                "payload": a.payload,
                "triggered_by": a.triggered_by,
            })
        return out


@router.post("/agent/actions/{id}/approve")
def approve_action(id: int):
    with get_session() as session:
        action = session.query(AgentAction).filter(AgentAction.id == id).first()
        if not action:
            raise HTTPException(status_code=404, detail="Action not found")
        action.status = "approved"
        action.resolved_at = datetime.utcnow()
        # create a PurchaseOrder record or update existing to sent
        if action.payload and action.payload.get("purchase_order_id"):
            po = session.get(PurchaseOrder, action.payload.get("purchase_order_id"))
            if po:
                po.status = "sent"
                po.agent_action_id = action.id
                send_po_email(po)
        session.add(action)
        session.commit()
        return {"id": action.id, "status": action.status}


@router.post("/agent/actions/{id}/reject")
def reject_action(id: int, outcome_notes: str | None = None):
    with get_session() as session:
        action = session.query(AgentAction).filter(AgentAction.id == id).first()
        if not action:
            raise HTTPException(status_code=404, detail="Action not found")
        action.status = "rejected"
        action.resolved_at = datetime.utcnow()
        if outcome_notes:
            action.outcome_notes = outcome_notes
        session.add(action)
        session.commit()
        return {"id": action.id, "status": action.status}


@router.get("/agent/purchase-orders")
def list_pos():
    with get_session() as session:
        pos = session.query(PurchaseOrder).all()
        out = []
        for p in pos:
            prod = session.query(Product).filter(Product.id == p.product_id).first()
            out.append({
                "id": p.id,
                "product_id": p.product_id,
                "product_name": prod.name if prod else None,
                "status": p.status,
                "expected_delivery_days": p.expected_delivery_days,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            })
        return out
