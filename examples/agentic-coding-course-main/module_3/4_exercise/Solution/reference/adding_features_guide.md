## Adding Features

1. Create vertical slice in `src/tools/<name>/`
2. Define Pydantic schemas in `schemas.py` (types first)
3. Implement with proper logging, docstrings, and type annotations
4. **Create corresponding test file** in `tests/tools/<name>/test_<module>.py`
5. Write unit tests for the component
6. Add integration tests if the feature interacts with other components
7. Verify linters pass: `uv run ruff check src/ && uv run mypy src/`
8. Ensure all tests pass: `uv run pytest tests/`

**For agent tools specifically:** See separate documentation on tool docstring patterns for agents.