# Architecture

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

## Design principles

1. Deterministic calculations must be performed by code, not guessed by the AI.
2. AI should interpret results, select approved analytical tools, and communicate findings.
3. Raw user data must remain separate from cleaned/transformed data.
4. Private or sensitive datasets must never be committed to GitHub.
5. Each production analytics capability should have automated tests.
