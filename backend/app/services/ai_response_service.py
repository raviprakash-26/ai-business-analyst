from __future__ import annotations

from typing import Any

from app.services.llm_provider import get_llm_provider


def generate_response(context: dict[str, Any]) -> dict[str, Any]:
    """Generate a response through the configured provider while preserving verified context."""
    provider = get_llm_provider()
    answer = provider.explain(context)
    return {
        "provider": provider.__class__.__name__,
        "answer": answer,
        "verified_result": context.get("result"),
        "tool": context.get("tool_used"),
    }
