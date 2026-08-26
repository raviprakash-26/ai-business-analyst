from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe
from app.services.query_engine import analyze_question

router = APIRouter(prefix="/query", tags=["natural-language-analyst"])


@router.post("/analyze")
async def query_dataset(
    question: str = Form(...),
    file: UploadFile = File(...),
) -> dict:
    """Interpret a natural-language business question and return a verified answer."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return analyze_question(dataframe, question)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
