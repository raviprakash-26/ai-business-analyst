from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

router = APIRouter(prefix="/root-cause", tags=["root-cause"])

class PreviewRequest(BaseModel):
    rows: list[dict]
    metric: str = "Profit"

@router.post("/preview")
def root_cause_preview(request: PreviewRequest) -> dict:
    if not request.rows:
        raise HTTPException(status_code=400, detail="rows must not be empty")
    df = pd.DataFrame(request.rows)
    metric = request.metric
    if metric not in df.columns:
        raise HTTPException(status_code=400, detail=f"metric '{metric}' not found")
    df[metric] = pd.to_numeric(df[metric], errors="coerce").fillna(0)
    dimensions = [c for c in ("Region", "Category", "Product") if c in df.columns]
    drivers = []
    total = float(df[metric].sum())
    for dimension in dimensions:
        grouped = df.groupby(dimension, dropna=False)[metric].sum().sort_values(ascending=False)
        for label, contribution in grouped.head(10).items():
            value = float(contribution)
            share = (value / total * 100) if total else 0
            drivers.append({"dimension": dimension, "label": str(label), "value": value, "share_pct": share})
    drivers.sort(key=lambda x: abs(x["value"]), reverse=True)
    return {"metric": metric, "total": total, "drivers": drivers[:20], "dimensions": dimensions, "note": "Driver contribution is descriptive; it does not establish causality."}
