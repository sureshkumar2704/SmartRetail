from __future__ import annotations

import base64
from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext

from database import get_session
from models.entities import User
from schemas import LoginRequest, LoginResponse


router = APIRouter(tags=["auth"])
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
JWT_SECRET = "smartretail-secret"
JWT_ALGORITHM = "HS256"
DEMO_EMAIL = "demo@smartretail.ai"
DEMO_PASSWORD = "demo1234"


def _seed_user(session):
    user = session.query(User).filter(User.email == DEMO_EMAIL).first()
    if user is None:
        user = User(
            name="Demo Manager",
            email=DEMO_EMAIL,
            password_hash=pwd_context.hash(DEMO_PASSWORD),
            avatar_url=None,
        )
        session.add(user)
        session.flush()
    elif not user.password_hash.startswith("$pbkdf2-sha256$"):
        user.password_hash = pwd_context.hash(DEMO_PASSWORD)
        session.flush()
    return user


@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    with get_session() as session:
        user = _seed_user(session)
        if payload.email != user.email or not pwd_context.verify(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = jwt.encode(
            {
                "sub": str(user.id),
                "email": user.email,
                "name": user.name,
                "exp": datetime.utcnow() + timedelta(hours=12),
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM,
        )
        return LoginResponse(token=token, user={"id": user.id, "name": user.name, "email": user.email})


@router.post("/auth/demo", response_model=LoginResponse)
def demo_login():
    token = base64.urlsafe_b64encode(b"demo-token").decode("utf-8")
    return LoginResponse(token=token, user={"id": 0, "name": "Demo User", "email": "demo@smartretail.ai"})
