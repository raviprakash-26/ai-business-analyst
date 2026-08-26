from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ai import router as ai_router
from app.api.analytics import router as analytics_router
from app.api.charts import router as charts_router
from app.api.datasets import router as datasets_router
from app.api.explanations import router as explanations_router
from app.api.forecast import router as forecast_router
from app.api.insights import router as insights_router
from app.api.llm import router as llm_router
from app.api.root_cause import router as root_cause_router

app = FastAPI(
    title="AI Business Analyst API",
    description="Backend API for the AI Business Analyst platform.",
    version="1.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets_router)
app.include_router(analytics_router)
app.include_router(insights_router)
app.include_router(charts_router)
app.include_router(ai_router)
app.include_router(explanations_router)
app.include_router(llm_router)
app.include_router(forecast_router)
app.include_router(root_cause_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ai-business-analyst-api"}
