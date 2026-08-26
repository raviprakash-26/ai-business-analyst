from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.grounded_analyst import answer_with_tools

router = APIRouter(prefix="/analyst", tags=["analyst"])


class ConversationMessage(BaseModel):
    role: str
    content: str


class GroundedAnalystRequest(BaseModel):
    question: str
    analysis: dict[str, Any]
    history: list[ConversationMessage] = Field(default_factory=list, max_length=10)


@router.post("/ask-grounded")
def ask_grounded(request: GroundedAnalystRequest) -> dict[str, Any]:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="question must not be empty")
    try:
        history = [{"role": item.role, "content": item.content} for item in request.history]
        return answer_with_tools(request.question, request.analysis, history=history)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
