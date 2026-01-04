# Product Catalog Application

This is the application built in exercises one and two of the [Dynamous Agentic Coding Course](https://github.com/dynamous-community/agentic-coding-course). It's a fullstack product catalog (that you built filtering capabilities into).

## MCP & Tool Demonstrations

In module 10, this codebase demonstrates the use of several MCP servers and Skills:

- **[Playwright MCP](https://github.com/microsoft/playwright-mcp)** - Browser automation via Model Context Protocol, enabling AI assistants to interact with web pages through structured accessibility snapshots
- **[Supabase MCP](https://github.com/supabase-community/supabase-mcp)** - Connects AI assistants to Supabase for database management, schema design, and data querying
- **[Archon MCP](https://github.com/coleam00/Archon)** - Knowledge and task management backbone for AI coding assistants with RAG capabilities for documentation search
- **[AST-Grep](https://ast-grep.github.io/)** - Claude Skill for structural code search and rewriting tool that operates on abstract syntax trees for precise pattern matching

## Quick Start

**Terminal 1 - Backend**:
```bash
cd app/backend
uv venv --python 3.12
uv sync
uv run python run_api.py
# → http://localhost:8000
```

**Terminal 2 - Frontend**:
```bash
cd app/frontend
npm install -g bun
bun install
bun dev
# → http://localhost:3000
```

## Project Structure

```
module_10/
├── app/
│   ├── backend/      # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── models/
│   │   │   └── services/
│   │   └── tests/
│   └── frontend/     # React frontend
│       └── src/
│           ├── components/
│           ├── lib/
│           └── types/
└── tasks/            # Task specifications
```

## API Documentation

When the backend is running, view the API docs at http://localhost:8000/docs

## Tests

Run backend tests:
```bash
cd app/backend
uv run pytest tests/ -v
```
