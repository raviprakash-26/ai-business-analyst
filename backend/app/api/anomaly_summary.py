from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

router = APIRouter(prefix="/anomalies", tags=["anomalies"])

class PreviewRequest(BaseModel):
    rows: list[dict]
    filename: str | None = None

@router.post("/preview")
def preview_anomalies(request: PreviewRequest) -> dict:
    if not request.rows:
        raise HTTPException(status_code=400, detail="rows must not be empty")
    df = pd.DataFrame(request.rows)
    numeric = df.select_dtypes(include="number")
    findings = []
    for column in numeric.columns:
        series = numeric[column].dropna()
        if len(series) < 4 or series.nunique() < 3:
            continue
        q1, q3 = series.quantile([0.25, 0.75])
        iqr = q3 - q1
        if iqr == 0:
            continue
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        mask = (series < lower) | (series > upper)
        for index in series.index[mask]:
            findings.append({"column": str(column), "row_index": int(index), "value": float(series.loc[index]), "lower_bound": float(lower), "upper_bound": float(upper), "method": "IQR"})
    return {"filename": request.filename, "anomaly_count": len(findings), "findings": findings[:100], "method": "IQR on numeric preview columns", "note": "Anomalies are screening signals, not proof of errors or fraud."}
