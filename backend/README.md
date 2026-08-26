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

## AI provider configuration

The API defaults to a safe no-op provider. The deterministic analytics result is returned without making an external model call.

For OpenAI-powered explanations, configure these variables locally:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-5.6-luna
```

Never commit `.env` files or API keys. The OpenAI adapter uses the Responses API and receives only verified analytics context; it is not responsible for recalculating business metrics.

Additional providers can be added behind the same `LLMProvider` interface.
