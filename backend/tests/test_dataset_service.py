import pandas as pd

from app.services.dataset_service import preview_dataframe, profile_dataframe


def test_profile_dataframe_returns_core_quality_metrics() -> None:
    dataframe = pd.DataFrame(
        {
            "region": ["North", "South", "North", "South"],
            "revenue": [1000, 2000, 1000, None],
        }
    )

    profile = profile_dataframe(dataframe)

    assert profile["rows"] == 4
    assert profile["columns"] == 2
    assert profile["missing_cells"] == 1
    assert profile["duplicate_rows"] == 1
    assert profile["quality_score"] < 100
    assert profile["numeric_summary"]["revenue"]["mean"] == 1333.3333333333333


def test_preview_dataframe_limits_rows_and_preserves_nulls() -> None:
    dataframe = pd.DataFrame({"name": ["A", "B", "C"], "value": [1, None, 3]})

    preview = preview_dataframe(dataframe, limit=2)

    assert len(preview) == 2
    assert preview[1]["value"] is None
