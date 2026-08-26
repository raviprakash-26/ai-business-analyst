from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe
from app.services.kpi_service import detect_kpis

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/kpis")
async def kpis(file: UploadFile = File(...)) -> dict:
    """Calculate common business KPIs from an uploaded CSV/XLSX dataset."""
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return detect_kpis(dataframe)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
