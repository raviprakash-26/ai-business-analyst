import pandas as pd

from app.services.kpi_service import detect_kpis


def test_detect_common_sales_kpis() -> None:
    dataframe = pd.DataFrame(
        {
            "Order ID": ["A", "B", "C"],
            "Customer ID": ["C1", "C2", "C1"],
            "Revenue": [100.0, 200.0, 300.0],
            "Profit": [10.0, 40.0, 50.0],
            "Quantity": [1, 2, 3],
        }
    )

    result = detect_kpis(dataframe)
    values = {item["id"]: item["value"] for item in result["kpis"]}

    assert values["revenue"] == 600.0
    assert values["profit"] == 100.0
    assert values["units"] == 6.0
    assert values["orders"] == 3
    assert values["customers"] == 2
    assert values["average_order_value"] == 200.0
    assert values["profit_margin"] == round(100 / 600 * 100, 2)
