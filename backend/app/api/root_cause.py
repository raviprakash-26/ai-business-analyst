from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe
from app.services.root_cause_service import analyze_root_causes

router = APIRouter(prefix="/root-cause", tags=["root-cause"])


@router.post("/analyze")
async def root_cause(file: UploadFile = File(...), metric: str = Form(...), top_n: int = Form(5)) -> dict:
    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        return analyze_root_causes(dataframe, metric, top_n)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
