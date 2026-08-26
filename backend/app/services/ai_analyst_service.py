from __future__ import annotations

from typing import Any

import pandas as pd

from app.services.kpi_service import detect_kpis


def _numeric_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for column in df.columns:
        name = str(column).lower().strip()
        if any(candidate in name for candidate in candidates) and pd.api.types.is_numeric_dtype(df[column]):
            return str(column)
    return None


def _category_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for column in df.columns:
        name = str(column).lower().strip()
        if any(candidate in name for candidate in candidates) and not pd.api.types.is_numeric_dtype(df[column]):
            return str(column)
    return None


def answer_question(df: pd.DataFrame, question: str) -> dict[str, Any]:
    """Map a small set of business questions to deterministic analytics tools."""
    q = question.lower().strip()
    if not q:
        return {"tool": "none", "answer": "Please ask a business question about the dataset."}

    kpis = detect_kpis(df)["kpis"]

    if "row" in q or "record" in q:
        return {"tool": "dataset_count", "answer": f"The dataset contains {len(df):,} rows.", "result": len(df)}

    if "revenue" in q and ("total" in q or "how much" in q or "sales" in q):
        revenue = next((k for k in kpis if k["id"] == "revenue"), None)
        if revenue:
            return {"tool": "total_revenue", "answer": f"Total revenue is {revenue['value']:,.2f}.", "result": revenue["value"]}

    if "profit" in q and ("total" in q or "how much" in q):
        profit = next((k for k in kpis if k["id"] == "profit"), None)
        if profit:
            return {"tool": "total_profit", "answer": f"Total profit is {profit['value']:,.2f}.", "result": profit["value"]}

    if ("highest" in q or "top" in q or "best" in q) and "revenue" in q:
        category = _category_column(df, ["region", "category", "product", "segment", "department"])
        revenue = _numeric_column(df, ["revenue", "sales", "amount", "total"])
        if category and revenue:
            grouped = df.groupby(category, dropna=False)[revenue].sum().sort_values(ascending=False)
            if not grouped.empty:
                name, value = grouped.index[0], float(grouped.iloc[0])
                return {"tool": "top_revenue_category", "answer": f"{name} has the highest revenue at {value:,.2f}.", "result": {"category": str(name), "value": value}}

    if ("highest" in q or "top" in q or "best" in q) and "profit" in q:
        category = _category_column(df, ["region", "category", "product", "segment", "department"])
        profit = _numeric_column(df, ["profit"])
        if category and profit:
            grouped = df.groupby(category, dropna=False)[profit].sum().sort_values(ascending=False)
            if not grouped.empty:
                name, value = grouped.index[0], float(grouped.iloc[0])
                return {"tool": "top_profit_category", "answer": f"{name} has the highest profit at {value:,.2f}.", "result": {"category": str(name), "value": value}}

    return {
        "tool": "unsupported_question",
        "answer": "I can currently answer questions about total revenue, total profit, top revenue/profit categories, and dataset row counts.",
        "result": None,
    }
