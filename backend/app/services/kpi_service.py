from __future__ import annotations

from typing import Any

import pandas as pd


def _find_column(columns: list[str], candidates: list[str]) -> str | None:
    normalized = {column.lower().strip(): column for column in columns}
    for candidate in candidates:
        if candidate in normalized:
            return normalized[candidate]
    for column in columns:
        name = column.lower().strip()
        if any(candidate in name for candidate in candidates):
            return column
    return None


def detect_kpis(df: pd.DataFrame) -> dict[str, Any]:
    """Detect common business KPIs only when appropriate source columns exist."""
    columns = [str(column) for column in df.columns]
    kpis: list[dict[str, Any]] = []

    revenue_col = _find_column(columns, ["revenue", "sales", "amount", "total sales", "net sales"])
    profit_col = _find_column(columns, ["profit", "net profit", "gross profit"])
    quantity_col = _find_column(columns, ["quantity", "units", "units sold"])
    order_col = _find_column(columns, ["order id", "order_id", "order number", "invoice id"])
    customer_col = _find_column(columns, ["customer id", "customer_id", "customer", "client id"])

    def numeric_sum(column: str) -> float:
        return float(pd.to_numeric(df[column], errors="coerce").fillna(0).sum())

    if revenue_col:
        revenue = numeric_sum(revenue_col)
        kpis.append({"id": "revenue", "label": "Total Revenue", "value": round(revenue, 2), "source_column": revenue_col})

    if profit_col:
        profit = numeric_sum(profit_col)
        kpis.append({"id": "profit", "label": "Total Profit", "value": round(profit, 2), "source_column": profit_col})
        if revenue_col and numeric_sum(revenue_col) != 0:
            margin = profit / numeric_sum(revenue_col) * 100
            kpis.append({"id": "profit_margin", "label": "Profit Margin", "value": round(margin, 2), "unit": "%"})

    if quantity_col:
        kpis.append({"id": "units", "label": "Units Sold", "value": round(numeric_sum(quantity_col), 2), "source_column": quantity_col})

    if order_col:
        orders = int(df[order_col].dropna().nunique())
        kpis.append({"id": "orders", "label": "Orders", "value": orders, "source_column": order_col})
        if revenue_col and orders:
            aov = numeric_sum(revenue_col) / orders
            kpis.append({"id": "average_order_value", "label": "Average Order Value", "value": round(aov, 2), "source_column": revenue_col})

    if customer_col:
        customers = int(df[customer_col].dropna().nunique())
        kpis.append({"id": "customers", "label": "Customers", "value": customers, "source_column": customer_col})

    return {"kpis": kpis, "detected_columns": {"revenue": revenue_col, "profit": profit_col, "quantity": quantity_col, "orders": order_col, "customers": customer_col}}
