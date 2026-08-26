from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.ai_analyst_service import answer_question
from app.services.dataset_service import load_dataframe

router = APIRouter(prefix="/ai", tags=["ai-analyst"])


@router.post("/analyze")
async def analyze_question(
    question: str = Form(...),
    file: UploadFile = File(...),
) -> dict:
    """Answer an approved business question using deterministic analytics tools."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return answer_question(dataframe, question)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
