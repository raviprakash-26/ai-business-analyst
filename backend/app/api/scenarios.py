from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

class ScenarioRequest(BaseModel):
    revenue: float = Field(ge=0)
    profit: float
    revenue_change_pct: float = 0
    cost_change_pct: float = 0

@router.post("/what-if")
def what_if(request: ScenarioRequest) -> dict:
    if request.revenue <= 0:
        raise HTTPException(status_code=400, detail="revenue must be greater than zero")
    current_cost = request.revenue - request.profit
    projected_revenue = request.revenue * (1 + request.revenue_change_pct / 100)
    projected_cost = current_cost * (1 + request.cost_change_pct / 100)
    projected_profit = projected_revenue - projected_cost
    current_margin = request.profit / request.revenue * 100
    projected_margin = projected_profit / projected_revenue * 100 if projected_revenue else 0
    return {
        "current": {"revenue": request.revenue, "cost": current_cost, "profit": request.profit, "margin_pct": current_margin},
        "scenario": {"revenue_change_pct": request.revenue_change_pct, "cost_change_pct": request.cost_change_pct},
        "projected": {"revenue": projected_revenue, "cost": projected_cost, "profit": projected_profit, "margin_pct": projected_margin},
        "impact": {"revenue_delta": projected_revenue - request.revenue, "profit_delta": projected_profit - request.profit, "margin_delta_pct": projected_margin - current_margin},
        "note": "Scenario output is a sensitivity calculation, not a forecast or guarantee."
    }
