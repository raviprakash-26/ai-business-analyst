from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.analyst_tools import available_tools, run_tool

router = APIRouter(prefix="/analyst", tags=["analyst"])


class AnalystRequest(BaseModel):
    question: str
    analysis: dict[str, Any]


def _select_tools(question: str) -> list[str]:
    q = question.lower()
    selected: list[str] = []
    if any(word in q for word in ("revenue", "sales", "turnover", "region")):
        selected.append("revenue_regions")
    if any(word in q for word in ("profit", "margin", "product")):
        selected.append("profit_products")
    if any(word in q for word in ("unusual", "anomaly", "outlier")):
        selected.append("anomalies")
    if any(word in q for word in ("forecast", "future", "next", "trend")):
        selected.append("forecast")
    if any(word in q for word in ("recommend", "should", "action", "improve")):
        selected.append("recommendations")
    return selected or ["summary"]


def _answer(question: str, analysis: dict[str, Any]) -> dict[str, Any]:
    tools = _select_tools(question)
    evidence = {name: run_tool(name, analysis) for name in tools}
    q = question.lower()
    summary = analysis.get("summary", {})

    if "revenue_regions" in evidence and evidence["revenue_regions"].get("regions"):
        top = evidence["revenue_regions"]["regions"][0]
        answer = f"{top['label']} has the highest revenue in the analyzed data at ₹{top['value']:,.0f}."
        action = "Investigate the products and categories driving the leading region."
    elif "profit_products" in evidence and evidence["profit_products"].get("products"):
        top = evidence["profit_products"]["products"][0]
        answer = f"{top['label']} is the leading profit contributor at ₹{top['value']:,.0f}."
        action = "Compare this product's margin, volume and pricing with other products."
    elif "forecast" in evidence and evidence["forecast"]:
        answer = f"The available revenue baseline indicates a {evidence['forecast'].get('trend', 'stable')} trend."
        action = "Validate the baseline against seasonality and recent business events before using it for planning."
    elif "anomalies" in evidence:
        answer = f"The current screening found {evidence['anomalies'].get('anomaly_count', 0)} potential anomaly signals."
        action = "Review flagged observations and validate them against source records."
    else:
        answer = f"Total analyzed revenue is ₹{summary.get('revenue', 0):,.0f} and profit is ₹{summary.get('profit', 0):,.0f}."
        action = "Break the result down by region, category and product."

    if "recommend" in q or "should" in q:
        action = "Use the evidence above to prioritize investigation, validate the finding, then act on the highest-impact driver."
    return {"answer": answer, "tools_used": tools, "evidence": evidence, "next_action": action, "available_tools": available_tools()}


@router.post("/ask")
def ask(request: AnalystRequest) -> dict[str, Any]:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="question must not be empty")
    try:
        return _answer(request.question, request.analysis)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
