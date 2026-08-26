from __future__ import annotations

import re
from typing import Any

import pandas as pd

from app.services.ai_analyst_service import answer_question


QUESTION_PATTERNS = [
    (r"\btotal\b.*\b(revenue|sales)\b", "total_revenue"),
    (r"\b(revenue|sales)\b.*\btotal\b", "total_revenue"),
    (r"\btotal\b.*\bprofit\b", "total_profit"),
    (r"\bprofit\b.*\btotal\b", "total_profit"),
    (r"\baverage\s+order\s+value\b|\baov\b", "average_order_value"),
    (r"\bhow\s+many\b.*\b(rows|records)\b", "row_count"),
    (r"\bwhich\b.*\b(highest|top|best)\b.*\b(revenue|sales)\b", "top_category_by_value"),
    (r"\bwhich\b.*\b(highest|top|best)\b.*\bprofit\b", "top_category_by_value"),
]


def classify_question(question: str) -> str | None:
    normalized = " ".join(question.lower().split())
    for pattern, tool in QUESTION_PATTERNS:
        if re.search(pattern, normalized):
            return tool
    return None


def analyze_question(df: pd.DataFrame, question: str) -> dict[str, Any]:
    """Classify a question and execute the existing verified analytics tool."""
    tool = classify_question(question)
    result = answer_question(df, question)

    if tool and result.get("tool") == "unsupported_question":
        return {
            "tool": tool,
            "status": "needs_more_context",
            "answer": result["answer"],
            "evidence": [],
        }

    return {
        "tool": result.get("tool", tool or "unsupported_question"),
        "status": "answered" if result.get("tool") != "unsupported_question" else "unsupported",
        "answer": result.get("answer", "I could not answer that question with the available analytics tools."),
        "result": result.get("result"),
        "evidence": [
            {"type": "dataset", "detail": "Answer calculated from the uploaded dataset using the deterministic analytics engine."}
        ],
    }
