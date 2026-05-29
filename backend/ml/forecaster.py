from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

from models.entities import DailySales


@dataclass
class ForecastResult:
    points: list[dict]
    model: str


def _rolling_average_fallback(history: pd.DataFrame, horizon: int) -> ForecastResult:
    average_units = float(history["units"].tail(7).mean()) if not history.empty else 0.0
    last_day = pd.to_datetime(history["day"].max()).date() if not history.empty else date.today()
    points: list[dict] = []
    for offset in range(1, horizon + 1):
        forecast_date = last_day + timedelta(days=offset)
        prediction = round(average_units, 2)
        points.append(
            {
                "date": forecast_date.isoformat(),
                "predicted_units": prediction,
                "lower_bound": round(prediction * 0.85, 2),
                "upper_bound": round(prediction * 1.15, 2),
            }
        )
    return ForecastResult(points=points, model="7-day rolling average")


def forecast_demand(session, product_id: int, horizon: int) -> ForecastResult:
    rows = (
        session.query(DailySales.day, DailySales.units)
        .filter(DailySales.product_id == product_id)
        .order_by(DailySales.day.asc())
        .all()
    )
    history = pd.DataFrame(rows, columns=["day", "units"])
    if history.empty or len(history) < 14:
        return _rolling_average_fallback(history, horizon)

    history["day"] = pd.to_datetime(history["day"])
    history["index"] = np.arange(len(history))
    x_train = history[["index"]]
    y_train = history["units"]

    model = LinearRegression()
    model.fit(x_train, y_train)
    score = r2_score(y_train, model.predict(x_train))
    print(f"Forecast model R^2 for product {product_id}: {score:.4f}")

    last_day = history["day"].iloc[-1].date()
    future_index = np.arange(len(history), len(history) + horizon).reshape(-1, 1)
    predicted_units = model.predict(future_index)
    points: list[dict] = []
    for step, prediction in enumerate(predicted_units, start=1):
        prediction = max(float(prediction), 0.0)
        forecast_date = last_day + timedelta(days=step)
        points.append(
            {
                "date": forecast_date.isoformat(),
                "predicted_units": round(prediction, 2),
                "lower_bound": round(prediction * 0.85, 2),
                "upper_bound": round(prediction * 1.15, 2),
            }
        )
    return ForecastResult(points=points, model="LinearRegression")
