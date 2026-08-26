from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

router = APIRouter(prefix="/forecast", tags=["forecast"])

class PreviewRequest(BaseModel):
    rows: list[dict]
    metric: str = "Revenue"
    periods: int = 3

@router.post("/preview")
def forecast_preview(request: PreviewRequest) -> dict:
    if not request.rows:
        raise HTTPException(status_code=400, detail="rows must not be empty")
    if request.periods < 1 or request.periods > 12:
        raise HTTPException(status_code=400, detail="periods must be between 1 and 12")
    df = pd.DataFrame(request.rows)
    if request.metric not in df.columns:
        raise HTTPException(status_code=400, detail=f"metric '{request.metric}' not found")
    values = pd.to_numeric(df[request.metric], errors="coerce").dropna().tolist()
    if len(values) < 3:
        raise HTTPException(status_code=400, detail="at least 3 numeric observations are required")

    # Transparent baseline: linear trend over observation order.
    x = list(range(len(values)))
    x_mean = sum(x) / len(x)
    y_mean = sum(values) / len(values)
    denominator = sum((item - x_mean) ** 2 for item in x)
    slope = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(len(values))) / denominator if denominator else 0
    intercept = y_mean - slope * x_mean
    fitted = [intercept + slope * item for item in x]
    residuals = [values[i] - fitted[i] for i in range(len(values))]
    rmse = (sum(r * r for r in residuals) / len(residuals)) ** 0.5
    forecasts = [max(0.0, intercept + slope * (len(values) + step)) for step in range(request.periods)]
    trend = "increasing" if slope > 0 else "decreasing" if slope < 0 else "flat"
    return {"metric": request.metric, "observations": len(values), "trend": trend, "slope": slope, "rmse": rmse, "forecast": forecasts, "method": "linear trend baseline", "note": "Forecast is a simple directional baseline, not a production-grade prediction interval."}
