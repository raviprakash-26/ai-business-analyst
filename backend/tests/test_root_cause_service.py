import pandas as pd

from app.services.root_cause_service import analyze_root_causes


def test_ranks_category_drivers() -> None:
    dataframe = pd.DataFrame({"Region": ["North", "South", "North"], "Revenue": [500, 100, 300]})
    result = analyze_root_causes(dataframe, "Revenue")
    assert result["total"] == 900.0
    assert result["drivers"][0]["category"] == "North"
    assert result["drivers"][0]["value"] == 800.0
