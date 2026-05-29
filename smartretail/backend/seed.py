from __future__ import annotations

from datetime import datetime, timedelta

from passlib.context import CryptContext

from database import get_session
from models.entities import DailySales, Product, StoreSetting, Transaction, User


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
DEMO_EMAIL = "demo@smartretail.ai"
DEMO_PASSWORD = "demo1234"


def seed_database() -> None:
    with get_session() as session:
        if session.query(Product).count() > 0:
            return

        products = [
            Product(name="Aurora Hoodie", sku="SR-1001", category="Apparel", current_stock=24, reorder_level=18, unit_price=64.0),
            Product(name="Nimbus Bottle", sku="SR-1002", category="Accessories", current_stock=8, reorder_level=12, unit_price=18.0),
            Product(name="Pulse Sneakers", sku="SR-1003", category="Footwear", current_stock=42, reorder_level=16, unit_price=89.0),
            Product(name="Echo Headphones", sku="SR-1004", category="Electronics", current_stock=5, reorder_level=10, unit_price=129.0),
            Product(name="Orbit Mug", sku="SR-1005", category="Home", current_stock=36, reorder_level=14, unit_price=16.0),
            Product(name="Vertex Tee", sku="SR-1006", category="Apparel", current_stock=12, reorder_level=20, unit_price=29.0),
        ]
        session.add_all(products)
        session.flush()

        demo_user = session.query(User).filter(User.email == DEMO_EMAIL).first()
        if demo_user is None:
            session.add(User(name="Demo Manager", email=DEMO_EMAIL, password_hash=pwd_context.hash(DEMO_PASSWORD)))
        else:
            demo_user.password_hash = pwd_context.hash(DEMO_PASSWORD)
        session.add(StoreSetting(store_name="SmartRetail Store", currency="USD", timezone="UTC", reorder_threshold=20))
        session.flush()

        now = datetime.utcnow()
        transactions: list[Transaction] = []
        sales_rows: list[DailySales] = []
        for day_offset in range(90):
            day = now - timedelta(days=89 - day_offset)
            for index, product in enumerate(products, start=1):
                units = max(1, 12 + ((day_offset + index) % 9) - (index % 3))
                revenue = round(units * product.unit_price, 2)
                transactions.append(
                    Transaction(
                        transaction_code=f"TX-{day_offset:03d}-{index:02d}",
                        product_id=product.id,
                        product_name=product.name,
                        category=product.category,
                        quantity=units,
                        revenue=revenue,
                        transacted_at=day.replace(hour=8 + (index % 8), minute=(index * 7) % 60),
                        notes="Seeded record",
                    )
                )
                sales_rows.append(DailySales(product_id=product.id, day=day.date(), units=units, revenue=revenue))
        session.add_all(transactions)
        session.add_all(sales_rows)
