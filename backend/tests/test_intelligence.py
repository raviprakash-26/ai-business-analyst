import pandas as pd

from app.api.intelligence import _run


def test_intelligence_summary_and_rankings():
    df = pd.DataFrame([
        {"Region": "South", "Category": "Electronics", "Product": "Laptop", "Revenue": 100, "Cost": 70, "Profit": 30, "Quantity": 2},
        {"Region": "North", "Category": "Furniture", "Product": "Desk", "Revenue": 50, "Cost": 35, "Profit": 15, "Quantity": 1},
        {"Region": "South", "Category": "Electronics", "Product": "Monitor", "Revenue": 80, "Cost": 60, "Profit": 20, "Quantity": 2},
    ])
    result = _run(df, "demo.csv")
    assert result["summary"]["revenue"] == 230
    assert result["summary"]["profit"] == 65
    assert round(result["summary"]["profit_margin"], 2) == 28.26
    assert result["rankings"]["regions_by_revenue"][0] == {"category": "South", "value": 180.0}
    assert result["rankings"]["products_by_profit"][0] == {"category": "Laptop", "value": 30.0}
