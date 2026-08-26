# 🤖 AI Business Analyst

An end-to-end Business Intelligence and decision-support platform that turns business datasets into **KPIs, dashboards, insights, anomaly alerts, forecasts, root-cause drivers, recommendations, and what-if scenarios**.

> **Core principle:** deterministic analytics calculate the numbers; AI explains verified results and supports business reasoning.

## 🎯 Why this project?

Traditional dashboards tell a user **what happened**. This project is designed to help answer:

- What happened?
- Why should I investigate it?
- What is likely to happen next?
- What could happen under a different assumption?
- What action should the business consider?

## ✨ Capabilities

| Capability | Purpose |
| --- | --- |
| Data ingestion | Upload CSV/XLSX business datasets |
| Data profiling | Understand columns, types, missing values, and structure |
| KPI analytics | Calculate business performance metrics |
| Dashboards | Present business performance visually |
| Natural-language analyst | Ask questions about uploaded data |
| LLM explanation layer | Explain verified analytical results |
| Conversation memory | Support multi-turn analyst sessions |
| Anomaly detection | Flag statistically unusual observations |
| Forecasting | Produce transparent trend-based projections |
| Root-cause explorer | Rank major categorical contributors |
| Recommendation engine | Convert findings into prioritized investigation actions |
| What-if simulator | Compare baseline vs scenario assumptions |

## 🏗️ Architecture

```text
                         USER
                          |
                    Next.js Frontend
                          |
                    FastAPI Backend
                          |
       +------------------+------------------+
       |                  |                  |
       v                  v                  v
  Data Engine        Analytics Engine    AI Analyst
       |                  |                  |
       |             +----+----+             |
       |             |         |             |
       |             v         v             v
       |          Anomaly   Forecast      LLM Layer
       |             |         |             |
       |             +----+----+             |
       |                  |                  |
       |             Root Cause              |
       |                  |                  |
       +------------------+------------------+
                          |
                   Recommendations
                          |
                     What-If Scenarios
```

## 🔐 AI safety / analytical integrity

The LLM is **not the source of truth for numeric calculations**. The application first runs deterministic analytics and then provides verified context to the AI layer.

Recommendations are decision-support suggestions, not autonomous decisions. Anomaly flags indicate observations worth investigating; they do not prove fraud, error, or causation. Forecasts are directional baselines, and what-if results are sensitivity scenarios.

## 🧰 Tech Stack

- **Frontend:** Next.js / React / TypeScript
- **Backend:** Python / FastAPI
- **Analytics:** Pandas / NumPy
- **AI:** Provider abstraction with optional LLM integration
- **Testing:** Pytest + frontend production build
- **CI:** GitHub Actions

## 🚀 Local development

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
pytest -q
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set the API URL when required:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔑 LLM configuration

Keep secrets outside Git. The safe default is no external provider.

```text
LLM_PROVIDER=none
OPENAI_API_KEY=
OPENAI_MODEL=
```

Only configure a real provider through environment variables. Never commit API keys, tokens, or private credentials.

## 🧪 Continuous Integration

Every pull request targeting `main` runs:

1. Backend dependency installation
2. Backend Pytest suite
3. Frontend dependency installation
4. Frontend production build

Workflow: `.github/workflows/ci.yml`

## 📁 High-level structure

```text
ai-business-analyst/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   └── services/
│   └── tests/
├── frontend/
│   └── app/
├── .github/
│   └── workflows/
└── README.md
```

## 🗺️ Roadmap

- [x] Dataset ingestion
- [x] Analytics and KPIs
- [x] Dashboard foundation
- [x] Natural-language analytics
- [x] LLM provider abstraction
- [x] Conversation memory
- [x] Anomaly detection
- [x] Forecasting
- [x] Root-cause analysis
- [x] Recommendations
- [x] What-if analysis
- [x] CI foundation
- [ ] Unified analyst workflow
- [ ] Production deployment
- [ ] Report export
- [ ] Saved analyses / database persistence
- [ ] Authentication and authorization
- [ ] Demo dataset and portfolio walkthrough

## 👨‍💻 Author

**Ravi Prakash** — B.Com Accounting & Finance student building toward Data Analytics, Business Analysis, and AI.

This project demonstrates practical skills across **business analysis, data analytics, Python, SQL-oriented thinking, dashboards, statistics, AI integration, and software engineering practices**.
