from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe
from app.services.insight_service import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("/generate")
async def insights(file: UploadFile = File(...)) -> dict:
    """Generate deterministic business observations from an uploaded dataset."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return generate_insights(dataframe)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
