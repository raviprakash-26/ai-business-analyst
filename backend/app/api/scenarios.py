from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


class ScenarioRequest(BaseModel):
    revenue: float = Field(gt=0)
    profit: float
    revenue_change_pct: float = 0
    cost_change_pct: float = 0


@router.post("/what-if")
def what_if(request: ScenarioRequest) -> dict:
    current_cost = request.revenue - request.profit
    projected_revenue = round(request.revenue * (1 + request.revenue_change_pct / 100), 10)
    projected_cost = round(current_cost * (1 + request.cost_change_pct / 100), 10)
    projected_profit = round(projected_revenue - projected_cost, 10)
    current_margin = request.profit / request.revenue * 100
    projected_margin = projected_profit / projected_revenue * 100
    return {
        "current": {"revenue": request.revenue, "cost": current_cost, "profit": request.profit, "margin_pct": current_margin},
        "scenario": {"revenue_change_pct": request.revenue_change_pct, "cost_change_pct": request.cost_change_pct},
        "projected": {"revenue": projected_revenue, "cost": projected_cost, "profit": projected_profit, "margin_pct": projected_margin},
        "impact": {"revenue_delta": round(projected_revenue - request.revenue, 10), "profit_delta": round(projected_profit - request.profit, 10), "margin_delta_pct": projected_margin - current_margin},
        "note": "Scenario output is a sensitivity calculation, not a forecast or guarantee."
    }
