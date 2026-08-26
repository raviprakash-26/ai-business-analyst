# Frontend

Next.js interface for the AI Business Analyst platform.

## Local setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

By default the frontend expects the API at `http://localhost:8000`. To override it, create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
