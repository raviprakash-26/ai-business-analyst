from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe
from app.services.explanation_service import build_explanation
from app.services.query_engine import analyze_question

router = APIRouter(prefix="/ai", tags=["ai-explanations"])


@router.post("/explain")
async def explain_question(
    question: str = Form(...),
    file: UploadFile = File(...),
) -> dict:
    """Return verified analysis plus structured context suitable for an optional LLM provider."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        analysis = analyze_question(dataframe, question)
        return build_explanation(question, analysis)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
