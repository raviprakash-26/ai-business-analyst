from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.dataset_service import load_dataframe, preview_dataframe, profile_dataframe

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.post("/profile")
async def profile_dataset(file: UploadFile = File(...)) -> dict:
    """Upload a CSV/XLSX file and return its deterministic profile and preview."""
    try:
        content = await file.read()
        dataframe = load_dataframe(file.filename or "", content)
        return {
            "filename": file.filename,
            "profile": profile_dataframe(dataframe),
            "preview": preview_dataframe(dataframe),
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
