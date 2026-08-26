import pandas as pd

from app.services.chart_service import recommend_charts


def test_recommends_bar_and_scatter_charts() -> None:
    dataframe = pd.DataFrame(
        {
            "Region": ["North", "South", "North"],
            "Revenue": [100, 200, 150],
            "Profit": [20, 30, 25],
        }
    )

    result = recommend_charts(dataframe)
    chart_types = {chart["type"] for chart in result["charts"]}

    assert "bar" in chart_types
    assert "scatter" in chart_types
