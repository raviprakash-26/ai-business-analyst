from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analytics import router as analytics_router
from app.api.datasets import router as datasets_router
from app.api.insights import router as insights_router

app = FastAPI(
    title="AI Business Analyst API",
    description="Backend API for the AI Business Analyst platform.",
    version="0.4.0",
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


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ai-business-analyst-api"}
