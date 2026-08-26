from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.analytics.engine import analyze_dataframe, rank_column
from app.services.dataset_service import load_dataframe

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...)) -> dict:
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return {"filename": file.filename, "analysis": analyze_dataframe(dataframe)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/rank")
async def rank_dataset(
    file: UploadFile = File(...),
    category_column: str = Form(...),
    value_column: str = Form(...),
    limit: int = Form(10),
) -> dict:
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return {
            "filename": file.filename,
            "category_column": category_column,
            "value_column": value_column,
            "ranking": rank_column(dataframe, category_column, value_column, limit),
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
