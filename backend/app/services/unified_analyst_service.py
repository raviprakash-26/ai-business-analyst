from __future__ import annotations

from typing import Any

import pandas as pd

from app.services.ai_analyst_service import answer_question
from app.services.anomaly_service import detect_anomalies
from app.services.forecast_service import forecast_series
from app.services.recommendation_service import generate_recommendations
from app.services.root_cause_service import analyze_root_causes


def run_unified_analysis(
    df: pd.DataFrame,
    question: str,
    metric: str | None = None,
    forecast_periods: int = 6,
) -> dict[str, Any]:
    """Run a compact analyst workflow and return grounded findings plus next actions."""
    answer = answer_question(df, question)
    numeric_columns = list(df.select_dtypes(include="number").columns)
    selected_metric = metric if metric in df.columns else (numeric_columns[0] if numeric_columns else None)

    anomalies = detect_anomalies(df)
    forecast = forecast_series(df, selected_metric, forecast_periods) if selected_metric else None
    drivers = analyze_root_causes(df, selected_metric)["drivers"] if selected_metric else []
    recommendations = generate_recommendations(
        anomalies=anomalies["anomalies"],
        forecast=forecast,
        drivers=drivers,
    )

    return {
        "question": question,
        "answer": answer,
        "selected_metric": selected_metric,
        "anomalies": anomalies,
        "forecast": forecast,
        "root_cause_drivers": drivers,
        "recommendations": recommendations,
        "integrity_note": "Calculations are produced by deterministic analytics tools; recommendations are decision-support suggestions, not autonomous decisions.",
    }
