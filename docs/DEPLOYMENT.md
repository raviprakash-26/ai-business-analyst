# Deployment Guide

## Services

This repository is configured for two Render web services:

- `ai-business-analyst-api` — FastAPI backend under `backend/`
- `ai-business-analyst-web` — Next.js frontend under `frontend/`

The root `render.yaml` contains the service definitions.

## Environment variables

### Backend

Set `CORS_ORIGINS` to the exact public frontend origin, without a trailing slash. Multiple origins may be separated by commas.

Example:

```text
CORS_ORIGINS=https://your-frontend.example.com
```

### Frontend

Set `NEXT_PUBLIC_API_URL` to the public backend origin.

Example:

```text
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

Do not commit secrets or provider API keys. Configure private credentials in the deployment platform's environment settings.

## Deploy order

1. Deploy the backend service.
2. Confirm `GET /health` returns HTTP 200 and the expected JSON status.
3. Copy the backend public URL into the frontend `NEXT_PUBLIC_API_URL` setting.
4. Set the backend `CORS_ORIGINS` to the frontend public URL.
5. Deploy or redeploy the frontend.

## Smoke test

After deployment:

1. Open the frontend.
2. Load the demo dataset or upload a CSV/XLSX file.
3. Confirm dataset profiling appears.
4. Confirm KPIs and charts render.
5. Confirm anomaly screening, forecast, drivers, recommendations, and what-if sections render when applicable.
6. Ask the Grounded AI Analyst a question.
7. Ask a follow-up such as `Why?` and confirm conversation context is preserved.
8. Verify browser/network errors are absent.

## Troubleshooting

### CORS errors

Check that `CORS_ORIGINS` exactly matches the frontend origin, including `https://` and excluding a trailing slash.

### API unavailable

Open the backend `/health` URL directly. If it does not return HTTP 200, inspect the backend deployment logs before debugging the frontend.

### Analyst unavailable

Confirm the frontend is pointing at the correct backend URL and that any required LLM provider environment variables are configured on the backend.

## Quality gate

Before a production release, run the repository CI checks. The expected gate is:

- Backend `python -m pytest -q` passes.
- Frontend `npm install` completes.
- Frontend `npm run build` completes.
