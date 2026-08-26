from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.analytics.engine import analyze_dataframe, rank_column
from app.services.dataset_service import load_dataframe

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


def _summary(df):
    numeric = df.select_dtypes(include="number")
    result = {"rows": int(len(df)), "columns": int(len(df.columns)), "numeric_columns": [str(c) for c in numeric.columns]}
    for name in ("Revenue", "Cost", "Profit", "Quantity"):
        if name in df.columns:
            result[name.lower()] = float(df[name].sum())
    if "Revenue" in df.columns and "Profit" in df.columns:
        revenue = float(df["Revenue"].sum())
        result["profit_margin"] = (float(df["Profit"].sum()) / revenue * 100) if revenue else 0.0
    return result


@router.post("/analyze")
async def intelligence(file: UploadFile = File(...)) -> dict:
    try:
        df = load_dataframe(file.filename or "", await file.read())
        summary = _summary(df)
        rankings = {}
        if "Region" in df.columns and "Revenue" in df.columns:
            rankings["regions_by_revenue"] = rank_column(df, "Region", "Revenue", 10)
        if "Category" in df.columns and "Revenue" in df.columns:
            rankings["categories_by_revenue"] = rank_column(df, "Category", "Revenue", 10)
        if "Product" in df.columns and "Profit" in df.columns:
            rankings["products_by_profit"] = rank_column(df, "Product", "Profit", 10)
        return {"filename": file.filename, "summary": summary, "rankings": rankings, "descriptive": analyze_dataframe(df)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
