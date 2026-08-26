from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe
from app.services.forecast_service import forecast_series

router = APIRouter(prefix="/forecast", tags=["forecasting"])


@router.post("/generate")
async def forecast(file: UploadFile = File(...), column: str = Form(...), periods: int = Form(6)) -> dict:
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return forecast_series(dataframe, column, periods)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
