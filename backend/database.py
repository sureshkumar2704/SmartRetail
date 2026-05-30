from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartretail.sqlite3")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def migrate_product_schema() -> None:
    required_columns = {
        "supplier_name": {
            "sqlite": "ALTER TABLE products ADD COLUMN supplier_name VARCHAR(200)",
            "mysql": "ALTER TABLE products ADD COLUMN supplier_name VARCHAR(200) NULL",
        },
        "lead_time_days": {
            "sqlite": "ALTER TABLE products ADD COLUMN lead_time_days INTEGER",
            "mysql": "ALTER TABLE products ADD COLUMN lead_time_days INTEGER NULL DEFAULT 7",
        },
        "moq": {
            "sqlite": "ALTER TABLE products ADD COLUMN moq INTEGER",
            "mysql": "ALTER TABLE products ADD COLUMN moq INTEGER NULL DEFAULT 10",
        },
        "unit_cost": {
            "sqlite": "ALTER TABLE products ADD COLUMN unit_cost FLOAT",
            "mysql": "ALTER TABLE products ADD COLUMN unit_cost FLOAT NULL DEFAULT 0.0",
        },
        "selling_price": {
            "sqlite": "ALTER TABLE products ADD COLUMN selling_price FLOAT",
            "mysql": "ALTER TABLE products ADD COLUMN selling_price FLOAT NULL DEFAULT 0.0",
        },
    }

    dialect = engine.dialect.name
    if dialect not in {"sqlite", "mysql"}:
        return

    with engine.begin() as conn:
        inspector = inspect(conn)
        if not inspector.has_table("products"):
            return

        existing = {column["name"] for column in inspector.get_columns("products")}
        for column_name, ddl_by_dialect in required_columns.items():
            if column_name not in existing:
                conn.exec_driver_sql(ddl_by_dialect[dialect])


@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
