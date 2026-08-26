# Backend

FastAPI service for the AI Business Analyst platform.

## Local setup

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The health endpoint is available at:

`http://localhost:8000/health`

Interactive API documentation:

`http://localhost:8000/docs`
