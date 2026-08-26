from __future__ import annotations

from typing import Any

import pandas as pd


def recommend_charts(df: pd.DataFrame) -> dict[str, Any]:
    """Recommend chart specifications from column types without rendering them server-side."""
    charts: list[dict[str, Any]] = []
    numeric = [str(c) for c in df.select_dtypes(include="number").columns]
    categorical = [str(c) for c in df.select_dtypes(exclude="number").columns]

    if numeric:
        charts.append({
            "id": "numeric-distribution",
            "type": "histogram",
            "title": f"Distribution of {numeric[0]}",
            "x": numeric[0],
        })

    if categorical and numeric:
        category = categorical[0]
        value = numeric[0]
        grouped = df.groupby(category, dropna=False)[value].sum().sort_values(ascending=False).head(10)
        charts.append({
            "id": "category-performance",
            "type": "bar",
            "title": f"{value} by {category}",
            "x": category,
            "y": value,
            "data": [{"category": str(index), "value": float(amount)} for index, amount in grouped.items()],
        })

    if len(numeric) >= 2:
        charts.append({
            "id": "numeric-relationship",
            "type": "scatter",
            "title": f"{numeric[0]} vs {numeric[1]}",
            "x": numeric[0],
            "y": numeric[1],
        })

    return {"charts": charts, "count": len(charts)}
