from __future__ import annotations

import re
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


def _norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value).lower())


def _find_column(df: pd.DataFrame, aliases: tuple[str, ...]) -> str | None:
    normalized = {_norm(column): str(column) for column in df.columns}
    for alias in aliases:
        key = _norm(alias)
        if key in normalized:
            return normalized[key]
    for column in df.columns:
        name = _norm(column)
        for alias in aliases:
            token = _norm(alias)
            if token and token in name:
                return str(column)
    return None


def _metric_columns(df: pd.DataFrame) -> dict[str, str | None]:
    return {
        "revenue": _find_column(df, ("Revenue", "Sales", "Net Sales", "Total Sales", "Turnover", "Amount")),
        "profit": _find_column(df, ("Profit", "Net Profit", "Gross Profit")),
        "cost": _find_column(df, ("Cost", "Total Cost", "COGS", "Cost of Goods Sold")),
        "quantity": _find_column(df, ("Quantity", "Qty", "Units", "Units Sold")),
        "region": _find_column(df, ("Region", "Sales Region", "Territory", "Area")),
        "category": _find_column(df, ("Category", "Product Category", "Segment")),
        "product": _find_column(df, ("Product", "Product Name", "Item", "SKU")),
    }


def _numeric_series(df: pd.DataFrame, column: str) -> pd.Series:
    return pd.to_numeric(df[column], errors="coerce").fillna(0)


def _summary(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include="number")
    columns = _metric_columns(df)
    result: dict[str, Any] = {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "numeric_columns": [str(c) for c in numeric.columns],
        "resolved_columns": columns,
    }
    for key, column in columns.items():
        if column is not None and key in ("revenue", "cost", "profit", "quantity"):
            result[key] = float(_numeric_series(df, column).sum())

    revenue = float(result.get("revenue", 0) or 0)
    profit = float(result.get("profit", 0) or 0)
    result["profit_margin"] = (profit / revenue * 100) if revenue else None
    return result


def _run(df: pd.DataFrame, filename: str) -> dict[str, Any]:
    summary = _summary(df)
    columns = summary["resolved_columns"]
    rankings: dict[str, Any] = {}
    region, revenue = columns.get("region"), columns.get("revenue")
    category, product, profit = columns.get("category"), columns.get("product"), columns.get("profit")

    if region and revenue:
        working = df.copy()
        working[revenue] = _numeric_series(working, revenue)
        rankings["regions_by_revenue"] = rank_column(working, region, revenue, 10)
    if category and revenue:
        working = df.copy()
        working[revenue] = _numeric_series(working, revenue)
        rankings["categories_by_revenue"] = rank_column(working, category, revenue, 10)
    if product and profit:
        working = df.copy()
        working[profit] = _numeric_series(working, profit)
        rankings["products_by_profit"] = rank_column(working, product, profit, 10)

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
