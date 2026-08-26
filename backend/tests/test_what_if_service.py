from app.services.what_if_service import run_scenario


def test_revenue_growth_improves_profit() -> None:
    result = run_scenario(1000, 700, revenue_change_pct=10)
    assert result["baseline"]["profit"] == 300.0
    assert result["scenario"]["profit"] == 400.0
    assert result["impact"]["profit_change"] == 100.0
