from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


def forecast_series(df: pd.DataFrame, column: str, periods: int = 6) -> dict[str, Any]:
    """Forecast a numeric series with a simple linear trend model."""
    if column not in df.columns:
        raise ValueError(f"Column not found: {column}")
    series = pd.to_numeric(df[column], errors="coerce").dropna()
    if len(series) < 3:
        raise ValueError("At least 3 numeric observations are required for forecasting.")
    if periods < 1 or periods > 24:
        raise ValueError("Forecast periods must be between 1 and 24.")
    x = np.arange(len(series), dtype=float)
    y = series.to_numpy(dtype=float)
    slope, intercept = np.polyfit(x, y, 1)
    future_x = np.arange(len(series), len(series) + periods, dtype=float)
    predictions = slope * future_x + intercept
    return {
        "method": "linear_trend",
        "column": column,
        "history_points": len(series),
        "periods": periods,
        "trend_per_period": round(float(slope), 4),
        "forecast": [round(float(value), 2) for value in predictions],
        "note": "Forecast is a directional baseline, not a guaranteed future outcome.",
    }
