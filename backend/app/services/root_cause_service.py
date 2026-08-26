from __future__ import annotations

from typing import Any

import pandas as pd


def analyze_root_causes(df: pd.DataFrame, metric: str, top_n: int = 5) -> dict[str, Any]:
    """Rank categorical dimensions by their contribution to a numeric metric."""
    if metric not in df.columns:
        raise ValueError(f"Metric not found: {metric}")
    values = pd.to_numeric(df[metric], errors="coerce")
    numeric = df.copy()
    numeric[metric] = values
    numeric = numeric.dropna(subset=[metric])
    if numeric.empty:
        raise ValueError("Metric contains no usable numeric observations.")
    total = float(numeric[metric].sum())
    dimensions: list[dict[str, Any]] = []
    for column in numeric.select_dtypes(exclude="number").columns:
        grouped = numeric.groupby(column, dropna=False)[metric].sum().sort_values(ascending=False).head(top_n)
        for category, value in grouped.items():
            amount = float(value)
            dimensions.append({"dimension": str(column), "category": str(category), "metric": metric, "value": round(amount, 2), "contribution_pct": round((amount / total * 100) if total else 0.0, 2)})
    dimensions.sort(key=lambda item: abs(item["contribution_pct"]), reverse=True)
    return {"metric": metric, "total": round(total, 2), "drivers": dimensions[: top_n * 3], "interpretation": "Drivers indicate where to investigate; grouped contribution alone does not establish causation."}
