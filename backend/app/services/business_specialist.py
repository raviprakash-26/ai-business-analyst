from __future__ import annotations

from typing import Any

from app.services.analyst_tools import run_tool
from app.services.llm_provider import get_llm_provider

SPECIALIST_INSTRUCTIONS = """
You are Business Analyst Specialist, an embedded decision-support analyst.
Your job is to understand the uploaded company's dataset, answer the user's business question,
and recommend practical actions that management can validate and implement.

Rules:
- Use only verified evidence supplied by the analytics tools.
- Never invent numbers, companies, trends, causes, or facts.
- Distinguish correlation/descriptive drivers from proven causation.
- If evidence is insufficient, say exactly what is missing.
- Prefer business language over technical jargon.
- Every recommendation must be tied to evidence and include an expected business objective.
- Do not make autonomous financial, legal, tax, HR, or investment decisions.
"""


def select_specialist_tools(question: str) -> list[str]:
    q = question.lower()
    tools: list[str] = ["summary"]
    if any(x in q for x in ("revenue", "sales", "turnover", "region", "city", "channel")):
        tools.append("revenue_regions")
    if any(x in q for x in ("profit", "margin", "product", "category", "cost")):
        tools.append("profit_products")
    if any(x in q for x in ("anomaly", "unusual", "outlier", "error", "risk")):
        tools.append("anomalies")
    if any(x in q for x in ("forecast", "future", "next", "trend", "growth")):
        tools.append("forecast")
    if any(x in q for x in ("recommend", "suggest", "improve", "should", "action", "strategy", "management")):
        tools.append("recommendations")
    return list(dict.fromkeys(tools))


def _deterministic_recommendations(analysis: dict[str, Any]) -> list[dict[str, str]]:
    recommendations: list[dict[str, str]] = []
    summary = analysis.get("summary", {})
    rankings = analysis.get("rankings", {})
    anomalies = analysis.get("anomalies", {})
    margin = summary.get("profit_margin")

    regions = rankings.get("regions_by_revenue", [])
    if regions:
        top = regions[0]
        recommendations.append({
            "priority": "HIGH",
            "action": f"Review the leading region ({top.get('label', 'top region')}) for repeatable sales practices and allocate resources toward the highest-return opportunities.",
            "reason": f"It leads the available regional revenue ranking at ₹{float(top.get('value', 0)):,.0f}.",
            "objective": "Scale proven revenue drivers without assuming the region itself is causal."
        })

    products = rankings.get("products_by_profit", [])
    if products:
        top = products[0]
        recommendations.append({
            "priority": "HIGH",
            "action": f"Protect availability and pricing discipline for the leading profit contributor ({top.get('label', 'top product')}).",
            "reason": f"It is the top product in the supplied profit ranking at ₹{float(top.get('value', 0)):,.0f}.",
            "objective": "Defend profitable revenue and reduce avoidable margin leakage."
        })

    anomaly_count = int(anomalies.get("anomaly_count", 0) or 0)
    if anomaly_count > 0:
        recommendations.append({
            "priority": "MEDIUM",
            "action": "Review flagged anomalous records against source documents before using them for operational decisions.",
            "reason": f"The screening identified {anomaly_count} potential anomaly signal(s).",
            "objective": "Improve data quality and prevent distorted management reporting."
        })

    if margin is not None:
        try:
            margin_value = float(margin)
            recommendations.append({
                "priority": "MEDIUM",
                "action": "Track profit margin alongside revenue and investigate categories or products where volume growth is accompanied by margin deterioration.",
                "reason": f"The calculated overall profit margin is {margin_value:.2f}%.",
                "objective": "Grow revenue while protecting profitability."
            })
        except (TypeError, ValueError):
            pass

    return recommendations[:5]


def specialist_answer(question: str, analysis: dict[str, Any], history: list[dict[str, str]] | None = None) -> dict[str, Any]:
    history = history or []
    tools = select_specialist_tools(question)
    evidence = {tool: run_tool(tool, analysis) for tool in tools}
    recommendations = _deterministic_recommendations(analysis)

    context = {
        "specialist_instructions": SPECIALIST_INSTRUCTIONS,
        "question": question,
        "conversation_history": history[-10:],
        "verified_evidence": evidence,
        "management_recommendations": recommendations,
    }

    provider = get_llm_provider()
    if provider.__class__.__name__ == "NoOpLLMProvider":
        summary = analysis.get("summary", {})
        answer = _fallback_answer(question, evidence, summary)
        explanation = answer
    else:
        explanation = provider.explain(context)
        answer = explanation

    return {
        "specialist": "Business Analyst Specialist",
        "answer": answer,
        "recommendations": recommendations,
        "tools_used": tools,
        "evidence": evidence,
        "grounded": True,
        "conversation_turns": len(history),
        "guardrail": "Answers and recommendations are grounded in deterministic analytics; causal claims require validation."
    }


def _fallback_answer(question: str, evidence: dict[str, Any], summary: dict[str, Any]) -> str:
    q = question.lower()
    regions = evidence.get("revenue_regions", {}).get("regions", [])
    products = evidence.get("profit_products", {}).get("products", [])
    if regions and any(x in q for x in ("revenue", "sales", "region", "city", "channel")):
        top = regions[0]
        return f"Based on the verified dataset, {top.get('label', 'the leading segment')} has the highest revenue at ₹{float(top.get('value', 0)):,.0f}. This is a descriptive finding, so management should validate the underlying products, customers and channel mix before treating it as a causal driver."
    if products and any(x in q for x in ("profit", "margin", "product", "category", "cost")):
        top = products[0]
        return f"Based on the verified dataset, {top.get('label', 'the leading product')} is the highest profit contributor at ₹{float(top.get('value', 0)):,.0f}. Review its volume, price, cost and availability to identify what can be replicated across other profitable segments."
    if "forecast" in evidence:
        trend = evidence["forecast"].get("trend", "stable")
        return f"The verified baseline indicates a {trend} direction. Use it as a planning baseline rather than a guarantee, and validate seasonality and recent business events before committing resources."
    return f"The dataset contains {int(summary.get('rows', 0) or 0):,} analyzed rows. Current verified totals are revenue ₹{float(summary.get('revenue', 0) or 0):,.0f} and profit ₹{float(summary.get('profit', 0) or 0):,.0f}. Ask about revenue, profit, products, regions, anomalies, forecasts or improvement actions for a more targeted analysis."
