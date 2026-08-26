from __future__ import annotations

from typing import Any


def available_tools() -> list[dict[str, Any]]:
    return [
        {"name": "summary", "description": "Return key business metrics from the supplied analysis."},
        {"name": "revenue_regions", "description": "Rank regions by revenue."},
        {"name": "profit_products", "description": "Rank products by profit."},
        {"name": "anomalies", "description": "Return anomaly screening findings."},
        {"name": "forecast", "description": "Return the baseline revenue forecast."},
        {"name": "recommendations", "description": "Return evidence-based decision-support actions."},
    ]


def run_tool(name: str, analysis: dict[str, Any]) -> dict[str, Any]:
    if name == "summary":
        return analysis.get("summary", {})
    if name == "revenue_regions":
        return {"regions": analysis.get("rankings", {}).get("regions_by_revenue", [])}
    if name == "profit_products":
        return {"products": analysis.get("rankings", {}).get("products_by_profit", [])}
    if name == "anomalies":
        return analysis.get("anomalies", {})
    if name == "forecast":
        return analysis.get("forecast", {})
    if name == "recommendations":
        return analysis.get("recommendations", {})
    raise ValueError(f"Unknown analyst tool: {name}")
