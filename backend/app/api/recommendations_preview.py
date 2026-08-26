from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

class RecommendationRequest(BaseModel):
    summary: dict = {}
    anomalies: dict = {}
    drivers: dict = {}
    forecast: dict = {}

@router.post("/preview")
def recommendations(request: RecommendationRequest) -> dict:
    actions = []
    if request.anomalies.get("anomaly_count", 0) > 0:
        actions.append({"priority":"High","finding":f"{request.anomalies['anomaly_count']} potential anomaly signals detected.","action":"Review the flagged records and validate whether they reflect real business events or data-quality issues."})
    drivers = request.drivers.get("drivers", [])
    if drivers:
        top = drivers[0]
        actions.append({"priority":"High","finding":f"{top['label']} is a major {top['dimension']} contributor to the selected metric.","action":f"Investigate the products, pricing, volume and operating conditions behind {top['label']}."})
    if request.forecast.get("trend") == "decreasing":
        actions.append({"priority":"High","finding":"The baseline forecast trend is decreasing.","action":"Review demand, pricing, mix and regional performance before committing to growth assumptions."})
    elif request.forecast.get("trend") == "increasing":
        actions.append({"priority":"Medium","finding":"The baseline forecast trend is increasing.","action":"Validate whether capacity, inventory and working capital can support the projected direction."})
    if not actions:
        actions.append({"priority":"Medium","finding":"No strong diagnostic signal was detected from the supplied evidence.","action":"Segment the dataset further and investigate performance by region, category and product."})
    return {"recommendations": actions, "note":"Recommendations are decision-support suggestions derived from supplied analytical evidence; they require business validation."}
