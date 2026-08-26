from __future__ import annotations

from typing import Any


def generate_recommendations(
    insights: list[dict[str, Any]] | None = None,
    anomalies: list[dict[str, Any]] | None = None,
    forecast: dict[str, Any] | None = None,
    drivers: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Turn verified analytical findings into prioritized investigation actions."""
    recommendations: list[dict[str, Any]] = []
    insights = insights or []
    anomalies = anomalies or []
    drivers = drivers or []

    if anomalies:
        recommendations.append({
            "priority": "high",
            "area": "anomaly investigation",
            "action": f"Investigate {len(anomalies)} statistically unusual observations before making operational decisions.",
            "evidence": {"anomaly_count": len(anomalies)},
        })

    if forecast and forecast.get("trend_per_period", 0) < 0:
        recommendations.append({
            "priority": "high",
            "area": "declining trend",
            "action": f"Investigate the drivers of the declining {forecast.get('column', 'metric')} trend and review the forecast assumptions.",
            "evidence": {"trend_per_period": forecast.get("trend_per_period")},
        })
    elif forecast and forecast.get("trend_per_period", 0) > 0:
        recommendations.append({
            "priority": "medium",
            "area": "growth",
            "action": f"Validate whether the positive {forecast.get('column', 'metric')} trend is sustainable and identify the drivers supporting it.",
            "evidence": {"trend_per_period": forecast.get("trend_per_period")},
        })

    if drivers:
        top = drivers[0]
        recommendations.append({
            "priority": "medium",
            "area": "concentration",
            "action": f"Review {top['dimension']} = {top['category']} because it is the largest identified contributor to {top['metric']}.",
            "evidence": top,
        })

    if insights:
        recommendations.append({
            "priority": "medium",
            "area": "business insight",
            "action": "Review the highest-impact insight with the relevant business owner and validate the underlying data before acting.",
            "evidence": insights[0],
        })

    if not recommendations:
        recommendations.append({
            "priority": "low",
            "area": "next analysis",
            "action": "No high-priority action was identified from the supplied findings. Continue monitoring the core KPIs and investigate meaningful changes.",
            "evidence": {},
        })

    return {"count": len(recommendations), "recommendations": recommendations}
