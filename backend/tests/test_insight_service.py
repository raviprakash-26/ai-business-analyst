import pandas as pd

from app.services.insight_service import generate_insights


def test_generates_growth_insight_for_large_numeric_change() -> None:
    dataframe = pd.DataFrame({"Revenue": [100, 105, 125]})

    result = generate_insights(dataframe)

    assert result["count"] == 1
    assert result["insights"][0]["type"] == "opportunity"
    assert result["insights"][0]["evidence"]["change_percent"] == 25.0


def test_generates_concentration_insight() -> None:
    dataframe = pd.DataFrame({"Region": ["North", "North", "North", "South"]})

    result = generate_insights(dataframe)

    assert result["count"] == 1
    assert result["insights"][0]["type"] == "concentration"
