from __future__ import annotations

from typing import Any

import pandas as pd


def generate_insights(df: pd.DataFrame) -> dict[str, Any]:
    """Generate deterministic, evidence-backed business observations."""
    insights: list[dict[str, Any]] = []
    numeric = df.select_dtypes(include="number")

    for column in numeric.columns:
        series = pd.to_numeric(numeric[column], errors="coerce").dropna()
        if len(series) < 3 or series.mean() == 0:
            continue
        latest = float(series.iloc[-1])
        first = float(series.iloc[0])
        change_pct = ((latest - first) / abs(first)) * 100 if first else 0.0
        if abs(change_pct) >= 10:
            direction = "increased" if change_pct > 0 else "decreased"
            severity = "opportunity" if change_pct > 0 else "watch"
            insights.append({
                "type": severity,
                "title": f"{column} {direction}",
                "message": f"{column} {direction} by {abs(change_pct):.1f}% from the first to the latest observed value.",
                "evidence": {"column": str(column), "first": first, "latest": latest, "change_percent": round(change_pct, 2)},
            })

    for column in df.select_dtypes(exclude="number").columns:
        counts = df[column].dropna().astype(str).value_counts()
        if len(counts) >= 2:
            top = counts.iloc[0]
            total = counts.sum()
            share = top / total * 100
            if share >= 50:
                insights.append({
                    "type": "concentration",
                    "title": f"High concentration in {column}",
                    "message": f"{counts.index[0]} represents {share:.1f}% of non-null {column} records.",
                    "evidence": {"column": str(column), "category": str(counts.index[0]), "share_percent": round(share, 2)},
                })

    return {"insights": insights[:20], "count": len(insights[:20])}
