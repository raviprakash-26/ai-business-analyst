from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import Any


class LLMProvider(ABC):
    @abstractmethod
    def explain(self, context: dict[str, Any]) -> str:
        raise NotImplementedError


class NoOpLLMProvider(LLMProvider):
    """Safe default when no external model is configured."""

    def explain(self, context: dict[str, Any]) -> str:
        return str(context.get("verified_answer", "No verified answer is available."))


def get_llm_provider() -> LLMProvider:
    provider = os.getenv("LLM_PROVIDER", "none").strip().lower()
    if provider in {"", "none", "noop"}:
        return NoOpLLMProvider()
    # Provider adapters are intentionally added behind this interface.
    # Unknown providers fail closed instead of silently using an unconfigured service.
    raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")
