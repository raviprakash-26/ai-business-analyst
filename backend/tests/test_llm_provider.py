import os

import pytest

from app.services.llm_provider import NoOpLLMProvider, get_llm_provider


def test_default_provider_is_safe_noop(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("LLM_PROVIDER", raising=False)
    provider = get_llm_provider()
    assert isinstance(provider, NoOpLLMProvider)
    assert provider.explain({"verified_answer": "Total revenue is 100."}) == "Total revenue is 100."


def test_unknown_provider_fails_closed(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LLM_PROVIDER", "unknown")
    with pytest.raises(ValueError, match="Unsupported LLM_PROVIDER"):
        get_llm_provider()
