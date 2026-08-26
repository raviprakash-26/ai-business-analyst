import pandas as pd

from app.services.unified_analyst_service import run_unified_analysis


def test_unified_analysis_returns_major_layers() -> None:
    dataframe = pd.DataFrame({"Region": ["North", "South", "North", "West"], "Revenue": [100, 90, 120, 80]})
    result = run_unified_analysis(dataframe, "What is total revenue?", metric="Revenue", forecast_periods=2)
    assert result["answer"]["tool"] == "total_revenue"
    assert result["forecast"]["column"] == "Revenue"
    assert "anomalies" in result
    assert result["root_cause_drivers"]
    assert result["recommendations"]["recommendations"]
