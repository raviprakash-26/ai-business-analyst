# AI Business Analyst

AI-powered business analytics and decision-support platform that transforms raw business datasets into KPIs, dashboards, insights, forecasts, anomaly detection, root-cause drivers, recommendations, and what-if scenarios.

## 🎯 What this project demonstrates

This portfolio project combines **Business Analysis + Data Analytics + AI + Software Engineering** in one workflow.

```text
Dataset
  ↓
Profiling & Quality
  ↓
KPIs + Visual Analytics
  ↓
Anomalies + Forecasting
  ↓
Root Cause Analysis
  ↓
Recommendations
  ↓
What-If Scenarios
  ↓
🤖 Unified AI Business Analyst
```

## ✨ Core capabilities

- CSV/XLSX dataset ingestion
- Data profiling and quality checks
- Automatic KPI detection
- Exploratory analytics and charts
- Business insight generation
- Natural-language analyst questions
- Statistical anomaly detection
- Transparent trend forecasting
- Root-cause driver analysis
- Evidence-backed recommendations
- Revenue/expense what-if simulation
- Unified analyst workflow
- Synthetic Indian retail demo dataset

## 🧠 Analytical integrity

The project deliberately separates **calculation from interpretation**:

- Deterministic analytics calculate business metrics.
- Statistical methods identify unusual observations.
- Forecasting provides a transparent directional baseline.
- Driver analysis identifies where to investigate; it does not claim causation.
- Recommendations are decision-support suggestions, not autonomous decisions.
- Synthetic demo data is used instead of private customer information.

## 🏗️ Architecture

```text
                         USER
                           │
                           ↓
                    Next.js Frontend
                           │
                           ↓
                     FastAPI Backend
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   Data Profiling     Analytics Engine    AI Analyst
        │                  │                  │
        ↓          ┌───────┼────────┐         ↓
     Quality       ↓       ↓        ↓      Tool Calls
                 KPIs   Anomaly  Forecast      │
                   │       │        │          │
                   └───────┼────────┘          │
                           ↓                    │
                     Root Cause                │
                           ↓                    │
                  Recommendations ←───────────┘
                           ↓
                       What-If
                           ↓
                   Decision Support
```

## 🧪 Demo dataset

The repository includes a synthetic Indian retail dataset at `data/demo_retail_business.csv`.

It contains 30 orders across January–June 2026 with regions, states, products, categories, quantities, revenue, cost, profit, discounts, and payment methods.

Example analyst questions:

- What is total revenue?
- Which region has the highest revenue?
- Which product contributes most to profit?
- What is the revenue trend?
- Are there unusual values?
- Which business drivers should management investigate?
- What happens if revenue increases by 10%?

## 🛠️ Tech stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Python, FastAPI
- **Analytics:** Pandas, NumPy
- **AI:** LLM integration with controlled tool usage
- **Testing:** pytest + frontend production build
- **CI:** GitHub Actions

## 🚀 Local development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the frontend development server and use the `/analyst` or `/dashboard` experience.

## 📁 Important project areas

```text
backend/
  app/
    api/
    services/
  tests/
frontend/
  app/
data/
  demo_retail_business.csv
.github/
  workflows/
```

## 📌 Portfolio positioning

**Project:** AI Business Analyst — End-to-End Business Intelligence & Decision Support Platform

**Role:** Business Analyst / Data Analyst project

**Key skills demonstrated:** Python, Pandas, FastAPI, Next.js, SQL-ready analytics concepts, KPI analysis, EDA, anomaly detection, forecasting, root-cause analysis, scenario analysis, AI-assisted analysis, API design, testing, GitHub workflows.

## 🔒 Data and security

Do not commit passwords, API keys, tokens, private business data, or personally identifiable information. The included demo dataset is synthetic.

## 📈 Roadmap

- [x] Dataset ingestion
- [x] Profiling and KPI analytics
- [x] Business insights
- [x] Anomaly detection
- [x] Forecasting
- [x] Root-cause analysis
- [x] Recommendations
- [x] What-if analysis
- [x] Unified AI Analyst
- [x] Synthetic demo dataset
- [ ] Final production integration
- [ ] Deployment
- [ ] Automated demo screenshots
- [ ] Report export
- [ ] Authentication and saved analyses

## 👤 Author

**Ravi Prakash** — B.Com Accounting & Finance student building toward Data Analytics, Business Analysis, and AI.
