import pandas as pd

from app.services.forecast_service import forecast_series


def test_forecast_follows_upward_trend() -> None:
    dataframe = pd.DataFrame({"Revenue": [100, 110, 120, 130]})
    result = forecast_series(dataframe, "Revenue", periods=2)
    assert result["method"] == "linear_trend"
    assert result["forecast"] == [140.0, 150.0]
    assert result["trend_per_period"] == 10.0
