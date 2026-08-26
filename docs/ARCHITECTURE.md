# Architecture

## System flow

```text
CSV / XLSX / Demo Dataset
        |
        v
Dataset Profiling (FastAPI + Pandas)
        |
        v
Session Dataset -> Next.js Intelligence Workspace
        |
        +--> Describe: KPIs, summaries, charts
        +--> Diagnose: anomaly screening, contribution drivers
        +--> Predict: revenue trend baseline
        +--> Decide: evidence-based recommendations
        +--> Simulate: what-if sensitivity analysis
        +--> Analyst: natural-language questions grounded in analytics
```

## Current foundation

```text
Browser
  |
  v
Next.js frontend :3000
  |
  | HTTP / JSON
  v
FastAPI backend :8000
  |
  v
Application services
```

## Target architecture

```text
                    Web Client
                        |
                        v
                  Next.js / React
                        |
                        v
                   FastAPI API
                        |
        +---------------+----------------+
        |               |                |
        v               v                v
 Dataset Service   Analytics Engine   AI Tool Layer
        |               |                |
        v        +------+-------+        v
   Data Quality  |      |       |     LLM Provider
        |        v      v       v
        |       KPI    EDA   ML/Stats
        |        |      |       |
        +--------+------+-------+
                 |
                 v
             PostgreSQL
```

## Technology

- Frontend: Next.js + React + TypeScript
- Backend: FastAPI + Python + Pandas
- Analytics: deterministic statistical/business calculations
- CI: GitHub Actions

## Analytical principles

1. Deterministic calculations must be performed by code, not guessed by the AI.
2. AI should interpret results, select approved analytical tools, and communicate findings.
3. Raw user data must remain separate from cleaned/transformed data.
4. Private or sensitive datasets must never be committed to GitHub.
5. Anomalies are screening signals, not proof of fraud or data errors.
6. Driver analysis describes contribution and does not establish causality.
7. Forecasting is currently a transparent linear-trend baseline.
8. Recommendations are decision-support suggestions and require business validation.
9. What-if outputs are sensitivity calculations, not guaranteed forecasts.
10. Each production analytics capability should have automated tests.
