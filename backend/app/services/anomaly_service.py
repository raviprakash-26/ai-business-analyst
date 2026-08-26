from __future__ import annotations

from typing import Any

import pandas as pd


def detect_anomalies(df: pd.DataFrame, z_threshold: float = 3.0) -> dict[str, Any]:
    """Detect unusually large/small numeric observations using a z-score rule."""
    anomalies: list[dict[str, Any]] = []

    for column in df.select_dtypes(include="number").columns:
        series = pd.to_numeric(df[column], errors="coerce")
        mean = series.mean()
        std = series.std(ddof=0)
        if pd.isna(std) or std == 0:
            continue

        scores = ((series - mean) / std).abs()
        for index in scores[scores >= z_threshold].index:
            value = series.loc[index]
            score = scores.loc[index]
            anomalies.append({
                "row": int(index),
                "column": str(column),
                "value": float(value),
                "z_score": round(float(score), 3),
                "direction": "high" if value > mean else "low",
            })

    anomalies.sort(key=lambda item: item["z_score"], reverse=True)
    return {
        "method": "z_score",
        "threshold": z_threshold,
        "count": len(anomalies),
        "anomalies": anomalies[:100],
    }
