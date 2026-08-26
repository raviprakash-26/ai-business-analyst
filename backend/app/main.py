from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ai import router as ai_router
from app.api.analytics import router as analytics_router
from app.api.anomalies import router as anomalies_router
from app.api.analyst import router as analyst_router
from app.api.grounded_analyst import router as grounded_analyst_router
from app.api.charts import router as charts_router
from app.api.datasets import router as datasets_router
from app.api.forecast_preview import router as forecast_router
from app.api.insights import router as insights_router
from app.api.intelligence import router as intelligence_router
from app.api.root_cause_preview import router as root_cause_router
from app.api.recommendations_preview import router as recommendations_router
from app.api.scenarios import router as scenarios_router

app = FastAPI(title="AI Business Analyst API", description="Backend API for the AI Business Analyst platform.", version="1.4.1")

configured_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
allow_origins = [origin.strip().rstrip("/") for origin in configured_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets_router)
app.include_router(analytics_router)
app.include_router(intelligence_router)
app.include_router(analyst_router)
app.include_router(grounded_analyst_router)
app.include_router(insights_router)
app.include_router(charts_router)
app.include_router(ai_router)
app.include_router(anomalies_router)
app.include_router(root_cause_router)
app.include_router(forecast_router)
app.include_router(recommendations_router)
app.include_router(scenarios_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ai-business-analyst-api"}
