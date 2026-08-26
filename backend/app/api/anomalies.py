from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.anomaly_service import detect_anomalies
from app.services.dataset_service import load_dataframe

router = APIRouter(prefix="/anomalies", tags=["anomalies"])


@router.post("/detect")
async def anomalies(file: UploadFile = File(...)) -> dict:
    """Detect numeric observations that are unusually far from their column mean."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return detect_anomalies(dataframe)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
