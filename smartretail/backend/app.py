from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth, dashboard, forecast, inventory, products, reports, sales, settings

from seed import seed_database

Base.metadata.create_all(bind=engine)
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


@app.get("/health")
def health():
    return {"status": "ok"}
