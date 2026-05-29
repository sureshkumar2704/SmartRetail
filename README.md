# SmartRetail AI

SmartRetail AI is a full-stack retail analytics scaffold with a React + Tailwind + Chart.js frontend and a FastAPI backend with SQLAlchemy, ML forecasting, and JSON APIs.

## Structure

- `frontend/` React application
- `backend/` FastAPI application

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## Database

Set `DATABASE_URL` to a MySQL connection string to use MySQL, for example:

```bash
export DATABASE_URL="mysql+pymysql://user:password@localhost:3306/smartretail"
```

If `DATABASE_URL` is not provided, the backend falls back to SQLite for local development.
