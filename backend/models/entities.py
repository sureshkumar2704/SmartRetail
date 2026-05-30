from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    sku = Column(String(80), unique=True, nullable=False, index=True)
    category = Column(String(80), nullable=False)
    current_stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=20)
    unit_price = Column(Float, default=0.0)
    # inventory / procurement fields required by reorder engine and markdown optimizer
    supplier_name = Column(String(200), nullable=True)
    lead_time_days = Column(Integer, nullable=True, default=7)
    moq = Column(Integer, nullable=True, default=10)
    unit_cost = Column(Float, nullable=True, default=0.0)
    selling_price = Column(Float, nullable=True, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_code = Column(String(80), unique=True, nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(160), nullable=False)
    category = Column(String(80), nullable=False)
    quantity = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=False)
    transacted_at = Column(DateTime, default=datetime.utcnow, index=True)
    notes = Column(Text, nullable=True)

    product = relationship("Product")


class DailySales(Base):
    __tablename__ = "daily_sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    day = Column(Date, nullable=False, index=True)
    units = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=False)


class StoreSetting(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(160), nullable=False, default="SmartRetail Store")
    currency = Column(String(16), nullable=False, default="USD")
    timezone = Column(String(64), nullable=False, default="UTC")
    reorder_threshold = Column(Integer, nullable=False, default=20)
    low_stock_alert = Column(Boolean, default=True)
    daily_report_email = Column(Boolean, default=True)
    forecast_accuracy_alert = Column(Boolean, default=True)


class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id = Column(Integer, primary_key=True, index=True)
    frequency = Column(String(16), nullable=False, default="Weekly")
    enabled = Column(Boolean, default=False)


class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    detected_at = Column(DateTime, default=datetime.utcnow)
    anomaly_type = Column(String(50))
    severity = Column(String(20))
    z_score = Column(Float)
    explanation = Column(Text)
    external_signal = Column(String(200))
    resolved = Column(Boolean, default=False)


class AgentAction(Base):
    __tablename__ = "agent_actions"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    action_type = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="pending")
    payload = Column(JSON)
    triggered_by = Column(Integer, ForeignKey("anomalies.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    outcome_notes = Column(Text, nullable=True)


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    agent_action_id = Column(Integer, ForeignKey("agent_actions.id"))
    supplier_name = Column(String(200))
    order_qty = Column(Integer)
    unit_cost = Column(Float)
    expected_delivery_days = Column(Integer)
    status = Column(String(30), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)


class MarkdownRecommendation(Base):
    __tablename__ = "markdown_recommendations"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    current_stock = Column(Integer)
    days_to_clear = Column(Integer)
    current_price = Column(Float)
    recommended_discount_pct = Column(Float)
    projected_margin_impact = Column(Float)
    hold_scenario_margin = Column(Float)
    deadline = Column(DateTime)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class ActionOutcome(Base):
    __tablename__ = "action_outcomes"
    id = Column(Integer, primary_key=True)
    agent_action_id = Column(Integer, ForeignKey("agent_actions.id"))
    expected_result = Column(JSON)
    actual_result = Column(JSON)
    accuracy_score = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
