import pandas as pd

from app.services.query_engine import classify_question, analyze_question


def test_classifies_revenue_question() -> None:
    assert classify_question("What is the total revenue?") == "total_revenue"


def test_analyzes_row_count_question() -> None:
    dataframe = pd.DataFrame({"Revenue": [100, 200, 300]})
    result = analyze_question(dataframe, "How many rows are in the dataset?")
    assert result["status"] == "answered"
    assert result["result"] == 3


def test_analyzes_top_profit_question() -> None:
    dataframe = pd.DataFrame({"Region": ["North", "South", "North"], "Profit": [50, 100, 75]})
    result = analyze_question(dataframe, "Which region has the highest profit?")
    assert result["status"] == "answered"
    assert result["result"]["category"] == "North"
