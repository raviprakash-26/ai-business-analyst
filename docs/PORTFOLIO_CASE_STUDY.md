# Portfolio Case Study

## AI Business Analyst — End-to-End Decision Support Platform

### Problem
Business teams often have spreadsheets full of transactions but still need analysts to answer four questions: what happened, why it happened, what may happen next, and what action should be considered.

### Solution
This project provides a guided workflow that ingests a business dataset, profiles quality, calculates deterministic KPIs, screens for anomalies, identifies contribution drivers, produces a transparent forecast baseline, generates evidence-backed recommendations, and runs what-if sensitivity scenarios.

### Business Analyst workflow

1. **Describe** — quantify revenue, cost, profit, quantity and other available metrics.
2. **Diagnose** — surface unusual values and identify major contributors by business dimension.
3. **Predict** — estimate a directional revenue trend baseline and expose model error.
4. **Decide** — convert analytical signals into prioritized actions for business review.
5. **Simulate** — test revenue/cost assumptions before discussing a scenario.

### Engineering approach

The frontend is built with Next.js, React and TypeScript. The backend uses FastAPI and Pandas. Analytics are intentionally deterministic and separated from AI interpretation. GitHub Actions runs backend tests and a frontend production build.

### Why this is portfolio-worthy

The project demonstrates more than dashboard creation. It combines business analysis thinking, statistical reasoning, API design, frontend engineering, testing, CI, scenario modeling, and AI-assisted interpretation in one end-to-end product.

### Important limitations

The current forecast is a transparent linear-trend baseline. Anomaly detection is a screening method. Driver analysis is descriptive rather than causal. Recommendations and scenarios require human/business validation.

### Suggested resume bullet

> Built an end-to-end AI Business Analyst platform using FastAPI, Pandas, Next.js and TypeScript that profiles business datasets, calculates KPIs, detects anomalies, analyzes performance drivers, forecasts trends, generates evidence-backed recommendations, and runs what-if scenarios with automated CI testing.
