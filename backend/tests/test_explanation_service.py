from app.services.explanation_service import build_explanation


def test_explanation_preserves_verified_answer() -> None:
    analysis = {
        "tool": "total_revenue",
        "answer": "Total revenue is 1,250.00.",
        "result": 1250.0,
        "evidence": [{"type": "dataset"}],
    }

    result = build_explanation("What is total revenue?", analysis)

    assert result["ready"] is True
    assert result["provider"] == "none"
    assert result["answer"] == analysis["answer"]
    assert result["llm_context"]["result"] == 1250.0
