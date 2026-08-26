from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.business_specialist import specialist_answer

router = APIRouter(prefix="/analyst", tags=["business specialist"])


class SpecialistMessage(BaseModel):
    role: str
    content: str


class SpecialistRequest(BaseModel):
    question: str
    analysis: dict[str, Any]
    history: list[SpecialistMessage] = Field(default_factory=list, max_length=10)


@router.post("/specialist")
def ask_specialist(request: SpecialistRequest) -> dict[str, Any]:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="question must not be empty")
    try:
        history = [{"role": item.role, "content": item.content} for item in request.history]
        return specialist_answer(request.question, request.analysis, history=history)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
