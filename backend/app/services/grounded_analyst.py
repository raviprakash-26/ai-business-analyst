from __future__ import annotations

from typing import Any

from app.services.analyst_tools import run_tool
from app.services.llm_provider import get_llm_provider


def select_tools(question: str) -> list[str]:
    q = question.lower()
    tools: list[str] = []
    if any(x in q for x in ("revenue", "sales", "region")):
        tools.append("revenue_regions")
    if any(x in q for x in ("profit", "margin", "product")):
        tools.append("profit_products")
    if any(x in q for x in ("anomaly", "unusual", "outlier")):
        tools.append("anomalies")
    if any(x in q for x in ("forecast", "future", "trend", "next")):
        tools.append("forecast")
    if any(x in q for x in ("recommend", "should", "action", "improve")):
        tools.append("recommendations")
    return list(dict.fromkeys(tools or ["summary"]))


def answer_with_tools(question: str, analysis: dict[str, Any], history: list[dict[str, str]] | None = None) -> dict[str, Any]:
    history = history or []
    selected = select_tools(question)
    evidence = {tool: run_tool(tool, analysis) for tool in selected}
    context = {
        "question": question,
        "conversation_history": history[-10:],
        "verified_answer": "Use only the verified evidence supplied below. Resolve follow-up references from the conversation history when possible.",
        "tool_used": ", ".join(selected),
        "result": evidence,
        "evidence": evidence,
    }
    provider = get_llm_provider()
    return {
        "provider": provider.__class__.__name__,
        "answer": provider.explain(context),
        "tools_used": selected,
        "evidence": evidence,
        "grounded": True,
        "conversation_turns": len(history),
        "guardrail": "The language model receives verified tool outputs and is instructed not to invent or recalculate numeric values.",
    }
