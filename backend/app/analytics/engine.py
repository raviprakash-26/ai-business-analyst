from __future__ import annotations

from typing import Any

import pandas as pd


def analyze_dataframe(df: pd.DataFrame) -> dict[str, Any]:
    """Produce deterministic, dataset-agnostic descriptive analytics."""
    numeric = df.select_dtypes(include="number")
    categorical = df.select_dtypes(exclude="number")

    numeric_summary: dict[str, dict[str, float | None]] = {}
    for column in numeric.columns:
        series = numeric[column].dropna()
        numeric_summary[str(column)] = {
            "sum": float(series.sum()) if not series.empty else None,
            "mean": float(series.mean()) if not series.empty else None,
            "median": float(series.median()) if not series.empty else None,
            "min": float(series.min()) if not series.empty else None,
            "max": float(series.max()) if not series.empty else None,
            "std": float(series.std()) if len(series) > 1 else 0.0 if len(series) == 1 else None,
        }

    categorical_summary: dict[str, dict[str, Any]] = {}
    for column in categorical.columns:
        series = categorical[column].dropna().astype(str)
        counts = series.value_counts().head(10)
        categorical_summary[str(column)] = {
            "unique_values": int(series.nunique()),
            "top_value": str(counts.index[0]) if not counts.empty else None,
            "top_value_count": int(counts.iloc[0]) if not counts.empty else 0,
            "top_values": [{"value": str(index), "count": int(value)} for index, value in counts.items()],
        }

    correlations: dict[str, dict[str, float]] = {}
    if len(numeric.columns) >= 2:
        matrix = numeric.corr(numeric_only=True)
        for column in matrix.columns:
            correlations[str(column)] = {
                str(other): round(float(value), 4)
                for other, value in matrix[column].dropna().items()
                if str(other) != str(column)
            }

    return {
        "row_count": int(len(df)),
        "numeric_columns": [str(column) for column in numeric.columns],
        "categorical_columns": [str(column) for column in categorical.columns],
        "numeric_summary": numeric_summary,
        "categorical_summary": categorical_summary,
        "correlations": correlations,
    }


def rank_column(df: pd.DataFrame, category_column: str, value_column: str, limit: int = 10) -> list[dict[str, Any]]:
    """Aggregate a numeric measure by a category and return a descending ranking."""
    if category_column not in df.columns or value_column not in df.columns:
        raise ValueError("Both category_column and value_column must exist in the dataset.")
    if not pd.api.types.is_numeric_dtype(df[value_column]):
        raise ValueError("value_column must be numeric.")

    result = (
        df.groupby(category_column, dropna=False)[value_column]
        .sum()
        .sort_values(ascending=False)
        .head(max(1, min(limit, 50)))
    )
    return [{"category": str(index), "value": float(value)} for index, value in result.items()]
