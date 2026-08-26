from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe
from app.services.unified_analyst_service import run_unified_analysis

router = APIRouter(prefix="/analyst", tags=["unified-analyst"])


@router.post("/analyze")
async def analyze(question: str = Form(...), file: UploadFile = File(...), metric: str | None = Form(None), forecast_periods: int = Form(6)) -> dict:
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return run_unified_analysis(dataframe, question, metric, forecast_periods)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
