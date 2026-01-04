# Development Commands

## Backend
```bash
uv sync                                           # Install
uv run uvicorn app.main:app --reload --port 8000 # Dev server
uv run pytest                                     # Test
uv run ruff check . && uv run ruff format .      # Lint + format
```

## Frontend
```bash
bun install       # Install
bun run dev       # Dev server (HMR)
bun run check:fix # Lint + format + organize imports
```
