from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.recommendation_service import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class RecommendationRequest(BaseModel):
    insights: list[dict] = Field(default_factory=list)
    anomalies: list[dict] = Field(default_factory=list)
    forecast: dict | None = None
    drivers: list[dict] = Field(default_factory=list)


@router.post("/generate")
def recommendations(request: RecommendationRequest) -> dict:
    return generate_recommendations(request.insights, request.anomalies, request.forecast, request.drivers)
