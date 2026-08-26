from __future__ import annotations

from io import BytesIO
from typing import Any

import pandas as pd

ALLOWED_EXTENSIONS = {".csv", ".xlsx"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024


def _extension(filename: str) -> str:
    return "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def load_dataframe(filename: str, content: bytes) -> pd.DataFrame:
    """Load a supported tabular file into a DataFrame without persisting the upload."""
    if not filename:
        raise ValueError("A filename is required.")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise ValueError("File exceeds the 25 MB upload limit.")

    extension = _extension(filename)
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type. Upload a CSV or XLSX file.")

    try:
        if extension == ".csv":
            return pd.read_csv(BytesIO(content))
        return pd.read_excel(BytesIO(content))
    except Exception as exc:  # pandas raises several parser-specific exceptions
        raise ValueError("The uploaded file could not be parsed as a valid dataset.") from exc


def profile_dataframe(df: pd.DataFrame) -> dict[str, Any]:
    """Return deterministic, JSON-safe dataset profiling information."""
    rows, columns = df.shape
    missing_by_column = df.isna().sum()
    duplicate_rows = int(df.duplicated().sum())

    numeric_summary: dict[str, dict[str, float | None]] = {}
    numeric_df = df.select_dtypes(include="number")
    for column in numeric_df.columns:
        series = numeric_df[column].dropna()
        if series.empty:
            numeric_summary[column] = {"min": None, "max": None, "mean": None, "median": None}
            continue
        numeric_summary[column] = {
            "min": float(series.min()),
            "max": float(series.max()),
            "mean": float(series.mean()),
            "median": float(series.median()),
        }

    missing_cells = int(missing_by_column.sum())
    total_cells = max(rows * columns, 1)
    missing_rate = missing_cells / total_cells
    duplicate_rate = duplicate_rows / max(rows, 1)
    quality_score = max(0.0, min(100.0, 100 - (missing_rate * 70) - (duplicate_rate * 30)))

    return {
        "rows": rows,
        "columns": columns,
        "column_names": [str(column) for column in df.columns],
        "dtypes": {str(column): str(dtype) for column, dtype in df.dtypes.items()},
        "missing_values": {str(column): int(value) for column, value in missing_by_column.items()},
        "missing_cells": missing_cells,
        "duplicate_rows": duplicate_rows,
        "numeric_summary": numeric_summary,
        "quality_score": round(quality_score, 2),
    }


def preview_dataframe(df: pd.DataFrame, limit: int = 10) -> list[dict[str, Any]]:
    """Return a small JSON-safe preview for the UI."""
    preview = df.head(max(1, min(limit, 50))).copy()
    preview = preview.astype(object).where(pd.notna(preview), None)
    return preview.to_dict(orient="records")
