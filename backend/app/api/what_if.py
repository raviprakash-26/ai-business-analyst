from fastapi import APIRouter
from pydantic import BaseModel

from app.services.what_if_service import run_scenario

router = APIRouter(prefix="/what-if", tags=["what-if"])


class ScenarioRequest(BaseModel):
    revenue: float
    expenses: float
    revenue_change_pct: float = 0.0
    expense_change_pct: float = 0.0


@router.post("/simulate")
def simulate(request: ScenarioRequest) -> dict:
    return run_scenario(request.revenue, request.expenses, request.revenue_change_pct, request.expense_change_pct)
