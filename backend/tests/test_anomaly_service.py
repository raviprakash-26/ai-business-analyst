import pandas as pd

from app.services.anomaly_service import detect_anomalies


def test_detects_extreme_numeric_observation() -> None:
    dataframe = pd.DataFrame({"Revenue": [100, 101, 99, 100, 100, 1000]})

    result = detect_anomalies(dataframe, z_threshold=2.0)

    assert result["count"] >= 1
    assert result["anomalies"][0]["column"] == "Revenue"
    assert result["anomalies"][0]["direction"] == "high"
