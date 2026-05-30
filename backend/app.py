from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, migrate_product_schema
from routers import auth, dashboard, forecast, inventory, products, reports, sales, settings
from routers import agent as agent_router, anomaly as anomaly_router, markdown as markdown_router

from seed import seed_database

Base.metadata.create_all(bind=engine)
migrate_product_schema()
seed_database()

app = FastAPI(title="SmartRetail AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(sales.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(agent_router.router, prefix="/api")
app.include_router(anomaly_router.router, prefix="/api")
app.include_router(markdown_router.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
async def startup_tasks():
    # run agent and anomaly detector once at startup to populate queues
    from database import get_session
    from agents.inventory_agent import run_agent_cycle
    from ml.anomaly_detector import detect_anomalies

    with get_session() as session:
        try:
            run_agent_cycle(session)
        except Exception:
            pass
        try:
            detect_anomalies(session)
        except Exception:
            pass

    # background runner
    import asyncio

    async def background_loop():
        while True:
            try:
                with get_session() as session:
                    run_agent_cycle(session)
                    detect_anomalies(session)
            except Exception:
                pass
            await asyncio.sleep(3600)

    asyncio.create_task(background_loop())
