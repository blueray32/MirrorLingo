# Pytest Setup Prompt

Using https://docs.pytest.org/en/stable/explanation/goodpractices.html as context, set up pytest unit testing for our Python 3.12 project.

Documentation to read: FETCH:(https://docs.pytest.org/en/stable/explanation/goodpractices.html)
Focus on: test discovery, strict mode, import modes, and project structure

First, install dependencies:
```bash
uv add --dev pytest pytest-cov hypothesis
```

Then create/modify these files:

1. UPDATE pyproject.toml with pytest configuration:
   - Add [tool.pytest.ini_options] section
   - Enable strict mode (strict-markers, strict-config)
   - Set testpaths = ["tests"]
   - Configure addopts for coverage and output
   - Set minversion = "8.0"

2. CREATE tests/test_main.py with:
   - Unit tests for calculate_sum, calculate_average, safe_divide
   - Test edge cases: empty lists, zero division, negative numbers
   - Use pytest fixtures for reusable test data
   - Add property-based tests using hypothesis for math functions

3. CREATE tests/conftest.py (if needed):
   - Shared fixtures for common test data
   - pytest configuration hooks

Test requirements:

Unit tests (no external dependencies):
- Test all functions in main.py with standard inputs
- Test edge cases (empty data, None values, division by zero)
- Test Statistics TypedDict structure
- Expected: All tests passing with >90% coverage

Property-based tests (with hypothesis):
- Test mathematical properties (sum commutativity, etc.)
- Expected: 100+ generated test cases passing

Coverage check:
```bash
pytest --cov=. --cov-report=term --cov-report=html
```
- Expected: Coverage report showing >90% line coverage

All linting (ruff check ., mypy ., pyright .) must pass

When everything is green, let the user know we are ready to commit

Output format:
Summary: [what was accomplished]
Files created/modified: [list]
Test results: [X/X tests passing, Y% coverage]
