import pandas as pd

from app.analytics.engine import analyze_dataframe, rank_column


def test_analyze_dataframe_detects_numeric_and_categorical_columns() -> None:
    dataframe = pd.DataFrame(
        {
            "region": ["North", "South", "North"],
            "revenue": [100, 250, 150],
        }
    )

    result = analyze_dataframe(dataframe)

    assert result["numeric_columns"] == ["revenue"]
    assert result["categorical_columns"] == ["region"]
    assert result["numeric_summary"]["revenue"]["sum"] == 500.0
    assert result["categorical_summary"]["region"]["top_value"] == "North"


def test_rank_column_returns_descending_category_totals() -> None:
    dataframe = pd.DataFrame(
        {
            "region": ["North", "South", "North", "East"],
            "revenue": [100, 300, 200, 150],
        }
    )

    ranking = rank_column(dataframe, "region", "revenue")

    assert ranking[0] == {"category": "North", "value": 300.0}
    assert ranking[1] == {"category": "South", "value": 300.0}
