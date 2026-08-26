from __future__ import annotations

from typing import Any

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.analytics.engine import analyze_dataframe, rank_column
from app.services.dataset_service import load_dataframe

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


class PreviewPayload(BaseModel):
    filename: str = "dataset.csv"
    rows: list[dict[str, Any]]


def _summary(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include="number")
    result: dict[str, Any] = {"rows": int(len(df)), "columns": int(len(df.columns)), "numeric_columns": [str(c) for c in numeric.columns]}
    for name in ("Revenue", "Cost", "Profit", "Quantity"):
        if name in df.columns:
            result[name.lower()] = float(pd.to_numeric(df[name], errors="coerce").fillna(0).sum())
    if "Revenue" in df.columns and "Profit" in df.columns:
        revenue = float(pd.to_numeric(df["Revenue"], errors="coerce").fillna(0).sum())
        profit = float(pd.to_numeric(df["Profit"], errors="coerce").fillna(0).sum())
        result["profit_margin"] = (profit / revenue * 100) if revenue else 0.0
    return result


def _run(df: pd.DataFrame, filename: str) -> dict[str, Any]:
    summary = _summary(df)
    rankings: dict[str, Any] = {}
    if "Region" in df.columns and "Revenue" in df.columns:
        rankings["regions_by_revenue"] = rank_column(df, "Region", "Revenue", 10)
    if "Category" in df.columns and "Revenue" in df.columns:
        rankings["categories_by_revenue"] = rank_column(df, "Category", "Revenue", 10)
    if "Product" in df.columns and "Profit" in df.columns:
        rankings["products_by_profit"] = rank_column(df, "Product", "Profit", 10)
    return {"filename": filename, "summary": summary, "rankings": rankings, "descriptive": analyze_dataframe(df)}


@router.post("/analyze")
async def intelligence(file: UploadFile = File(...)) -> dict:
    try:
        df = load_dataframe(file.filename or "", await file.read())
        return _run(df, file.filename or "dataset")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/analyze-preview")
async def analyze_preview(payload: PreviewPayload) -> dict:
    if not payload.rows:
        raise HTTPException(status_code=400, detail="rows must contain at least one record")
    try:
        return _run(pd.DataFrame(payload.rows), payload.filename)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
