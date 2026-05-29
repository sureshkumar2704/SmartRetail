from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
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
