from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.grounded_analyst import answer_with_tools

router = APIRouter(prefix="/analyst", tags=["analyst"])


class GroundedAnalystRequest(BaseModel):
    question: str
    analysis: dict[str, Any]


@router.post("/ask-grounded")
def ask_grounded(request: GroundedAnalystRequest) -> dict[str, Any]:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="question must not be empty")
    try:
        return answer_with_tools(request.question, request.analysis)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
