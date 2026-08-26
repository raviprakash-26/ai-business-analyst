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


class OpenAIProvider(LLMProvider):
    """OpenAI Responses API adapter. Numeric results remain tool-grounded."""

    def __init__(self) -> None:
        from openai import OpenAI

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")
        self.client = OpenAI(api_key=api_key)
        self.model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")

    def explain(self, context: dict[str, Any]) -> str:
        prompt = (
            "You are an AI Business Analyst. Explain only the verified analytical result below. "
            "Do not change, invent, or recalculate numeric values. If the evidence is insufficient, say so. "
            "Give a concise business interpretation and, when justified, one practical implication.\n\n"
            f"Question: {context.get('question')}\n"
            f"Verified answer: {context.get('verified_answer')}\n"
            f"Tool used: {context.get('tool_used')}\n"
            f"Verified result: {context.get('result')}\n"
            f"Evidence: {context.get('evidence')}"
        )
        response = self.client.responses.create(model=self.model, input=prompt)
        return response.output_text


def get_llm_provider() -> LLMProvider:
    provider = os.getenv("LLM_PROVIDER", "none").strip().lower()
    if provider in {"", "none", "noop"}:
        return NoOpLLMProvider()
    if provider == "openai":
        return OpenAIProvider()
    raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")
