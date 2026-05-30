from __future__ import annotations

from fastapi import APIRouter, HTTPException

from database import get_session
from ml.anomaly_detector import detect_anomalies
from models.entities import Anomaly, Product

router = APIRouter(tags=["anomaly"])


@router.post("/anomaly/scan")
def scan():
    with get_session() as session:
        count = detect_anomalies(session)
        return {"new_anomalies": count}


@router.get("/anomaly/feed")
def feed():
    with get_session() as session:
        anomalies = session.query(Anomaly).filter(Anomaly.resolved == False).order_by(Anomaly.detected_at.desc()).limit(50).all()
        out = []
        sev_color = {"critical": "red", "medium": "amber", "low": "blue"}
        for a in anomalies:
            prod = session.query(Product).filter(Product.id == a.product_id).first()
            out.append({
                "id": a.id,
                "product_id": a.product_id,
                "product_name": prod.name if prod else None,
                "severity": a.severity,
                "color": sev_color.get(a.severity, "blue"),
                "explanation": a.explanation,
                "external_signal": a.external_signal,
                "detected_at": a.detected_at.isoformat() if a.detected_at else None,
                "triggered_action_id": None,
            })
        return out


@router.post("/anomaly/{id}/resolve")
def resolve(id: int):
    with get_session() as session:
        a = session.query(Anomaly).filter(Anomaly.id == id).first()
        if not a:
            raise HTTPException(status_code=404, detail="Anomaly not found")
        a.resolved = True
        session.add(a)
        return {"id": a.id, "resolved": True}


@router.get("/anomaly/summary")
def summary():
    with get_session() as session:
        rows = session.query(Anomaly.severity, Anomaly.anomaly_type).all()
        counts = {"critical": 0, "medium": 0, "low": 0}
        types = {}
        for r in rows:
            sev, typ = r
            if sev in counts:
                counts[sev] += 1
            types[typ] = types.get(typ, 0) + 1
        return {"by_severity": counts, "by_type": types}
