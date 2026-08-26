from __future__ import annotations

from typing import Any

import pandas as pd


def _numeric_series(df: pd.DataFrame, column: str) -> pd.Series:
    return pd.to_numeric(df[column], errors="coerce").dropna()


def _histogram_data(series: pd.Series, bins: int = 12) -> list[dict[str, Any]]:
    if series.empty:
        return []
    minimum = float(series.min())
    maximum = float(series.max())
    if minimum == maximum:
        return [{"label": f"{minimum:,.2f}", "value": int(len(series))}]
    counts, edges = pd.cut(series, bins=bins, include_lowest=True, retbins=True, duplicates="drop")
    grouped = series.groupby(counts, observed=False).size()
    return [
        {
            "label": f"{float(interval.left):,.2f}–{float(interval.right):,.2f}",
            "value": int(count),
        }
        for interval, count in grouped.items()
    ]


def recommend_charts(df: pd.DataFrame) -> dict[str, Any]:
    """Return render-ready chart data rather than placeholder specifications."""
    charts: list[dict[str, Any]] = []
    numeric = [str(c) for c in df.select_dtypes(include="number").columns]
    categorical = [str(c) for c in df.select_dtypes(exclude="number").columns]

    if numeric:
        column = numeric[0]
        series = _numeric_series(df, column)
        charts.append({
            "id": "numeric-distribution",
            "type": "histogram",
            "title": f"Distribution of {column}",
            "x": column,
            "data": _histogram_data(series),
        })

    if categorical and numeric:
        category = categorical[0]
        value = numeric[0]
        grouped = df.assign(_chart_value=pd.to_numeric(df[value], errors="coerce")).groupby(category, dropna=False)["_chart_value"].sum().sort_values(ascending=False).head(10)
        charts.append({
            "id": "category-performance",
            "type": "bar",
            "title": f"{value} by {category}",
            "x": category,
            "y": value,
            "data": [{"category": str(index), "value": float(amount)} for index, amount in grouped.items()],
        })

    if len(numeric) >= 2:
        x_column, y_column = numeric[:2]
        points = df[[x_column, y_column]].copy()
        points[x_column] = pd.to_numeric(points[x_column], errors="coerce")
        points[y_column] = pd.to_numeric(points[y_column], errors="coerce")
        points = points.dropna().head(500)
        charts.append({
            "id": "numeric-relationship",
            "type": "scatter",
            "title": f"{x_column} vs {y_column}",
            "x": x_column,
            "y": y_column,
            "data": [{"x": float(row[x_column]), "y": float(row[y_column])} for _, row in points.iterrows()],
        })

    return {"charts": charts, "count": len(charts)}
