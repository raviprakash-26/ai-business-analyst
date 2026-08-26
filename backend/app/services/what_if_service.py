from __future__ import annotations

from typing import Any


def run_scenario(revenue: float, expenses: float, revenue_change_pct: float = 0.0, expense_change_pct: float = 0.0) -> dict[str, Any]:
    if revenue < 0 or expenses < 0:
        raise ValueError("Revenue and expenses must be non-negative.")
    if revenue_change_pct < -100 or expense_change_pct < -100:
        raise ValueError("Scenario changes cannot reduce a metric below zero.")
    baseline_profit = revenue - expenses
    baseline_margin = (baseline_profit / revenue * 100) if revenue else 0.0
    scenario_revenue = revenue * (1 + revenue_change_pct / 100)
    scenario_expenses = expenses * (1 + expense_change_pct / 100)
    scenario_profit = scenario_revenue - scenario_expenses
    scenario_margin = (scenario_profit / scenario_revenue * 100) if scenario_revenue else 0.0
    return {
        "baseline": {"revenue": round(revenue, 2), "expenses": round(expenses, 2), "profit": round(baseline_profit, 2), "profit_margin_pct": round(baseline_margin, 2)},
        "scenario": {"revenue": round(scenario_revenue, 2), "expenses": round(scenario_expenses, 2), "profit": round(scenario_profit, 2), "profit_margin_pct": round(scenario_margin, 2)},
        "impact": {"revenue_change": round(scenario_revenue - revenue, 2), "expense_change": round(scenario_expenses - expenses, 2), "profit_change": round(scenario_profit - baseline_profit, 2), "margin_change_pct_points": round(scenario_margin - baseline_margin, 2)},
        "assumption": "This is a sensitivity scenario, not a forecast or causal estimate.",
    }
