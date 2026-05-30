from ml.reorder_engine import compute_reorder
from agents.po_generator import draft_purchase_order
from models.entities import Product, AgentAction, PurchaseOrder
from sqlalchemy import select


def run_agent_cycle(session):
    created_actions = []
    products = session.execute(select(Product)).scalars().all()
    for p in products:
        if p.current_stock is None:
            continue
        result = compute_reorder(session, p.id)
        if not result:
            continue
        urgency = result.get("urgency_level")
        if urgency in ("critical", "warning"):
            # check for existing unresolved reorder action
            exists = session.query(AgentAction).filter(AgentAction.product_id == p.id, AgentAction.action_type == "reorder", AgentAction.status == "pending").first()
            if exists:
                continue
            qty = result.get("eoq") or max(1, int((p.moq or 10)))
            po = draft_purchase_order(session, p.id, qty)
            action = AgentAction(product_id=p.id, action_type="reorder", payload=po, status="pending")
            session.add(action)
            session.flush()
            # link PO record if created
            if po and po.get("purchase_order_id"):
                po_rec = session.get(PurchaseOrder, po["purchase_order_id"])
                if po_rec:
                    po_rec.agent_action_id = action.id
            created_actions.append(action.id)
    session.commit()
    return created_actions
