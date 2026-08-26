# AI Business Analyst

AI-powered business analytics and decision-support platform that transforms raw business datasets into KPIs, interactive dashboards, insights, forecasts, anomaly detection, and actionable recommendations.

## Vision

Build a portfolio-grade AI Business Analyst that combines deterministic analytics with AI-assisted interpretation. Calculations come from the analytics engine; the AI explains results and helps users explore the data.

## Planned Capabilities

- CSV/XLSX dataset upload
- Data profiling and quality checks
- Controlled data cleaning
- Automatic KPI detection
- Exploratory data analysis
- Interactive dashboards
- Business insights and recommendations
- Ask-your-data AI analyst
- Anomaly detection
- Forecasting
- What-if scenario analysis
- Report export
- User accounts and saved analyses

## Proposed Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Python, FastAPI
- Analytics: Pandas, NumPy, scikit-learn
- Visualization: Plotly
- Database: PostgreSQL
- AI: LLM API with tool/function calling

## Architecture

```text
User
  |
  v
Next.js Web App
  |
  v
FastAPI Backend
  |
  +--> Dataset Ingestion --> Profiling --> Cleaning
  |
  +--> Analytics Engine --> KPIs / Charts / Statistics
  |
  +--> Insight Engine --> Business Findings
  |
  +--> ML Engine --> Anomalies / Forecasts
  |
  +--> AI Analyst --> Tool Calls --> Analytics Engine
  |
  v
PostgreSQL
```

## Development Roadmap

1. Repository and application foundation
2. Frontend dashboard shell
3. FastAPI backend
4. Dataset ingestion
5. Data profiling and quality engine
6. Data cleaning pipeline
7. Analytics and KPI engine
8. Interactive dashboard
9. Business insight engine
10. AI analyst and ask-your-data chat
11. Anomaly detection
12. Forecasting
13. What-if analysis
14. Reports and exports
15. Authentication and saved analyses
16. Testing, deployment, and documentation

## Project Status

🚧 In active development.

## Author

Ravi Prakash — B.Com Accounting & Finance student building toward Data Analytics, Business Analysis, and AI.
