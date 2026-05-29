from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user: dict[str, Any]


class SummaryResponse(BaseModel):
    total_revenue: float
    total_transactions: int
    top_selling_product: str
    low_stock_alerts: int


class TrendPoint(BaseModel):
    date: date
    revenue: float


class CategoryPoint(BaseModel):
    category: str
    revenue: float


class HourlyPoint(BaseModel):
    hour: int
    avg_sales: float


class TransactionItem(BaseModel):
    id: int
    transaction_code: str
    date: datetime
    product: str
    category: str
    quantity: int
    revenue: float
    notes: str | None = None


class TransactionPage(BaseModel):
    items: list[TransactionItem]
    total: int
    page: int
    limit: int


class InventoryItem(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    current_stock: int
    reorder_level: int
    status: Literal["In Stock", "Low", "Out"]
    unit_price: float


class InventoryUpdate(BaseModel):
    current_stock: int = Field(ge=0)
    reorder_level: int = Field(ge=0)


class ForecastRequest(BaseModel):
    product_id: int
    horizon: int = Field(default=7, ge=1, le=90)


class ForecastPoint(BaseModel):
    date: date
    predicted_units: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    product_id: int
    horizon: int
    points: list[ForecastPoint]
    model: str


class StoreSettingsPayload(BaseModel):
    store_name: str
    currency: str
    timezone: str
    reorder_threshold: int = Field(ge=0)
    low_stock_alert: bool
    daily_report_email: bool
    forecast_accuracy_alert: bool


class ReportSchedulePayload(BaseModel):
    enabled: bool
    frequency: Literal["Daily", "Weekly", "Monthly"]
