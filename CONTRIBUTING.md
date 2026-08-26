# Contributing

## Development flow

1. Create a focused feature branch from `main`.
2. Keep changes small and testable.
3. Add or update tests for backend behavior.
4. Run `pytest -q` in `backend`.
5. Run `npm run build` in `frontend`.
6. Open a pull request to `main`.
7. Merge only after CI passes.

## Analytical integrity

- Keep numeric calculations deterministic and reproducible.
- Do not use an LLM as the source of truth for computed metrics.
- Attach evidence to recommendations where possible.
- Treat anomalies as investigation flags, not proof of fraud or error.
- Treat forecasts as estimates and scenarios as sensitivity analysis.

## Security

Never commit API keys, passwords, tokens, `.env` files, or other secrets. Use environment variables for local configuration.
