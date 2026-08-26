from app.services.recommendation_service import generate_recommendations


def test_recommends_investigation_for_anomalies_and_decline() -> None:
    result = generate_recommendations(anomalies=[{"column": "Revenue", "z_score": 4.2}], forecast={"column": "Revenue", "trend_per_period": -10.0})
    areas = {item["area"] for item in result["recommendations"]}
    assert "anomaly investigation" in areas
    assert "declining trend" in areas
