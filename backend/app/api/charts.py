from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.chart_service import recommend_charts
from app.services.dataset_service import load_dataframe

router = APIRouter(prefix="/charts", tags=["charts"])


@router.post("/recommend")
async def charts(file: UploadFile = File(...)) -> dict:
    """Return chart specifications based on dataset structure."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return recommend_charts(dataframe)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
