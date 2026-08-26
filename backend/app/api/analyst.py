from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/analyst", tags=["analyst"])


class AnalystRequest(BaseModel):
    question: str
    analysis: dict[str, Any]


def _answer(question: str, analysis: dict[str, Any]) -> dict[str, Any]:
    q = question.lower().strip()
    summary = analysis.get("summary", {})
    rankings = analysis.get("rankings", {})

    if any(word in q for word in ("revenue", "sales", "turnover")):
        rows = rankings.get("regions_by_revenue", [])
        if rows:
            top = rows[0]
            return {"answer": f"{top['label']} has the highest revenue in the analyzed data at ₹{top['value']:,.0f}.", "evidence": {"metric": "Revenue", "leader": top}, "next_action": "Investigate the products and categories driving the leading region."}
        if "revenue" in summary:
            return {"answer": f"Total analyzed revenue is ₹{summary['revenue']:,.0f}.", "evidence": {"metric": "Revenue", "value": summary["revenue"]}, "next_action": "Break revenue down by region, category, and product."}

    if any(word in q for word in ("profit", "margin")):
        products = rankings.get("products_by_profit", [])
        if products:
            top = products[0]
            return {"answer": f"{top['label']} is the leading profit contributor at ₹{top['value']:,.0f}.", "evidence": {"metric": "Profit", "leader": top, "margin": summary.get("profit_margin")}, "next_action": "Compare the leading product's margin and volume with other products."}
        if "profit" in summary:
            return {"answer": f"Total analyzed profit is ₹{summary['profit']:,.0f}, with a calculated margin of {summary.get('profit_margin', 0):.1f}%.", "evidence": {"metric": "Profit", "value": summary["profit"], "margin": summary.get("profit_margin")}, "next_action": "Investigate product and regional contribution."}

    return {"answer": "I can answer questions supported by the current analytical evidence, such as revenue, profit, regional performance, category performance, and product contribution.", "evidence": {"available_metrics": list(summary.keys()), "available_rankings": list(rankings.keys())}, "next_action": "Ask a specific business question about revenue, profit, region, category, or product."}


@router.post("/ask")
def ask(request: AnalystRequest) -> dict[str, Any]:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="question must not be empty")
    return _answer(request.question, request.analysis)
