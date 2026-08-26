import pandas as pd

from app.services.ai_analyst_service import answer_question


def test_answers_total_revenue_question() -> None:
    dataframe = pd.DataFrame({"Revenue": [100, 200, 300]})
    result = answer_question(dataframe, "What is total revenue?")
    assert result["tool"] == "total_revenue"
    assert result["result"] == 600.0


def test_answers_highest_profit_region_question() -> None:
    dataframe = pd.DataFrame({"Region": ["North", "South", "North"], "Profit": [50, 100, 75]})
    result = answer_question(dataframe, "Which region has the highest profit?")
    assert result["tool"] == "top_profit_category"
    assert result["result"]["category"] == "North"
    assert result["result"]["value"] == 125.0
