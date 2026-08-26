from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.ai_response_service import generate_response
from app.services.dataset_service import load_dataframe
from app.services.explanation_service import build_explanation
from app.services.query_engine import analyze_question

router = APIRouter(prefix="/ai", tags=["llm"])


@router.post("/answer")
async def answer_question(
    question: str = Form(...),
    file: UploadFile = File(...),
) -> dict:
    """Run verified analytics and pass only the verified context to the configured provider."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        analysis = analyze_question(dataframe, question)
        context = build_explanation(question, analysis)["llm_context"]
        return generate_response(context)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
