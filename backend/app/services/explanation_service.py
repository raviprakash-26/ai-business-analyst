from __future__ import annotations

from typing import Any


def build_explanation(question: str, analysis: dict[str, Any]) -> dict[str, Any]:
    """Build a structured explanation prompt/context without calling an external LLM."""
    answer = analysis.get("answer", "No answer was generated.")
    tool = analysis.get("tool", "unknown")
    evidence = analysis.get("evidence", [])

    context = {
        "role": "business analyst",
        "instruction": "Explain the verified analytical result clearly. Do not change, invent, or recalculate the result.",
        "question": question,
        "tool_used": tool,
        "verified_answer": answer,
        "result": analysis.get("result"),
        "evidence": evidence,
    }

    return {
        "ready": True,
        "provider": "none",
        "mode": "verified-context",
        "answer": answer,
        "llm_context": context,
    }
