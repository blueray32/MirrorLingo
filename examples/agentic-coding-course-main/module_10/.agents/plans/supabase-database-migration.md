# Feature: Supabase Database Migration for Product Catalog

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Migrate the product catalog from in-memory storage to a Supabase PostgreSQL database. This involves creating a `products` table in Supabase, updating the backend to query from the database instead of the in-memory list, and validating the entire flow using Playwright MCP to confirm the frontend correctly displays products fetched from the database.

## User Story

As a **developer**
I want to **store products in a persistent Supabase database**
So that **product data persists across server restarts and can be managed via standard database tools**

## Problem Statement

Currently, products are stored in an in-memory Python list (`_PRODUCTS_DATABASE` in `product_service.py`) that loads from `seed_products.py` on every server start. This means:
- No data persistence between restarts
- No ability to modify products without code changes
- No scalability for larger product catalogs

## Solution Statement

1. Create a `products` table in Supabase using the Supabase MCP
2. Seed the table with the existing 30 products
3. Update the backend to use the Supabase Python client
4. Add environment configuration for Supabase credentials
5. Validate the full stack using Playwright MCP

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Backend service layer, configuration
**Dependencies**: `supabase` Python package, Supabase MCP, Playwright MCP

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `app/backend/app/services/product_service.py` (lines 1-45) - Why: Current in-memory storage to be replaced with Supabase queries
- `app/backend/app/models/product.py` (lines 1-95) - Why: Product model schema that maps to database columns
- `app/backend/app/core/config.py` (lines 1-28) - Why: Configuration pattern using pydantic-settings to follow for Supabase credentials
- `app/backend/app/data/seed_products.py` (lines 1-278) - Why: Contains 30 seed products to insert into database
- `app/backend/pyproject.toml` (lines 1-74) - Why: Dependencies file where `supabase` package needs to be added
- `app/backend/tests/test_products_basic.py` (lines 1-101) - Why: Test patterns to follow, tests to update if needed

### New Files to Create

- `app/backend/.env.example` - Environment variable template for Supabase credentials
- `app/backend/app/core/database.py` - Supabase client initialization module

### Relevant Documentation - YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)
  - Client initialization and query patterns
  - Why: Required for implementing database queries
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
  - Environment variable configuration
  - Why: Pattern already used in config.py

### Patterns to Follow

**Supabase Python Client Pattern (from docs):**
```python
import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Select all
result = supabase.table('products').select("*").execute()

# Insert
result = supabase.table('products').insert({"column": "value"}).execute()
```

**Configuration Pattern (from config.py):**
```python
class ApplicationSettings(BaseSettings):
    """Settings with environment variable override."""
    supabase_url: str = ""
    supabase_key: str = ""
```

**Logging Pattern (from product_service.py):**
```python
logger.info(
    "event_name",
    field1=value1,
    operation="operation_name"
)
```

**Error Handling Pattern:**
```python
from app.models.error import ErrorResponse
# Backend uses structured error responses
```

---

## IMPLEMENTATION PLAN

### Phase 1: Database Setup (Supabase MCP)

Create the products table in Supabase and seed it with initial data.

**Tasks:**
- Create `products` table with proper schema
- Insert 30 seed products from existing seed data

### Phase 2: Backend Configuration

Add Supabase credentials to the application configuration.

**Tasks:**
- Add `supabase` dependency to pyproject.toml
- Create `.env.example` with required environment variables
- Update `config.py` with Supabase settings
- Create database client module

### Phase 3: Service Layer Update

Update the product service to query Supabase instead of in-memory storage.

**Tasks:**
- Update `product_service.py` to use Supabase client
- Maintain the same interface (`get_all_products()`)

### Phase 4: Validation (Playwright MCP)

Validate the entire stack works end-to-end.

**Tasks:**
- Start backend and frontend servers
- Use Playwright to verify products load correctly
- Screenshot for documentation

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: CREATE products table in Supabase

Use the Supabase MCP to create the products table.

- **IMPLEMENT**: Create table with columns matching Product model:
  - `product_id` - SERIAL PRIMARY KEY
  - `product_name` - VARCHAR(200) NOT NULL
  - `product_description` - VARCHAR(1000) NOT NULL
  - `product_price_usd` - DECIMAL(10,2) NOT NULL, CHECK > 0
  - `product_category` - VARCHAR(20) NOT NULL, CHECK IN ('electronics', 'clothing', 'home', 'sports', 'books')
  - `product_in_stock` - BOOLEAN DEFAULT TRUE
  - `created_at` - TIMESTAMPTZ DEFAULT NOW()
- **MCP TOOL**: `mcp__supabase__apply_migration`
- **MIGRATION NAME**: `create_products_table`
- **VALIDATE**: `mcp__supabase__list_tables` should show `products` table

### Task 2: INSERT seed products into Supabase

Use the Supabase MCP to seed the 30 products.

- **IMPLEMENT**: Insert all 30 products from `seed_products.py`
- **MCP TOOL**: `mcp__supabase__execute_sql`
- **PATTERN**: Reference `app/backend/app/data/seed_products.py` for exact values
- **GOTCHA**: Decimal values should be inserted as numbers, not strings
- **VALIDATE**: `mcp__supabase__execute_sql` with `SELECT COUNT(*) FROM products` should return 30

### Task 3: UPDATE pyproject.toml with supabase dependency

- **IMPLEMENT**: Add `supabase>=2.0.0` to dependencies list
- **PATTERN**: Reference `app/backend/pyproject.toml:6-14`
- **IMPORTS**: No imports needed, just add to dependencies array
- **VALIDATE**: `cd app/backend && uv sync` should complete without errors

### Task 4: CREATE .env.example file

- **IMPLEMENT**: Create environment variable template
- **FILE**: `app/backend/.env.example`
- **CONTENT**:
  ```
  # Supabase Configuration
  # Get these from: https://supabase.com/dashboard/project/_/settings/api
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_KEY=your-anon-key
  ```
- **GOTCHA**: Do NOT commit actual credentials, only the example file
- **VALIDATE**: File exists at `app/backend/.env.example`

### Task 5: UPDATE config.py with Supabase settings

- **IMPLEMENT**: Add `supabase_url` and `supabase_key` fields to `ApplicationSettings`
- **PATTERN**: Reference `app/backend/app/core/config.py:6-24`
- **IMPORTS**: No new imports needed (pydantic_settings already imported)
- **GOTCHA**: Fields should have empty string defaults so app doesn't crash without env vars
- **VALIDATE**: Python import should not error: `python -c "from app.core.config import settings; print(settings.supabase_url)"`

### Task 6: CREATE database.py client module

- **IMPLEMENT**: Create Supabase client initialization module
- **FILE**: `app/backend/app/core/database.py`
- **PATTERN**: Follow Supabase Python client pattern from docs
- **IMPORTS**: `from supabase import create_client, Client` and `from app.core.config import settings`
- **CONTENT**: Initialize client using settings, export `supabase` client instance
- **GOTCHA**: Handle case where credentials are not set (for backwards compatibility)
- **VALIDATE**: `python -c "from app.core.database import get_supabase_client"` should not error

### Task 7: UPDATE product_service.py to use Supabase

- **IMPLEMENT**: Replace in-memory `_PRODUCTS_DATABASE` with Supabase query
- **PATTERN**: Reference `app/backend/app/services/product_service.py:1-45`
- **IMPORTS**: Add `from app.core.database import get_supabase_client`
- **LOGIC**:
  1. Get Supabase client
  2. Query `products` table with `.select("*")`
  3. Transform response data to `Product` objects
  4. Return list of products
- **GOTCHA**: Supabase returns data in `response.data` as list of dicts
- **GOTCHA**: Keep fallback to seed_products if Supabase not configured (for local dev)
- **VALIDATE**: `cd app/backend && uv run pytest tests/test_products_basic.py -v` should pass

### Task 8: VALIDATE with Playwright MCP - Start Servers

- **IMPLEMENT**: Manually start both backend and frontend servers
- **BACKEND**: `cd app/backend && uv run python run_api.py` (Terminal 1)
- **FRONTEND**: `cd app/frontend && bun dev` (Terminal 2)
- **PREREQUISITE**: Create `.env` file with actual Supabase credentials
- **VALIDATE**: Backend responds at http://localhost:8000/health

### Task 9: VALIDATE with Playwright MCP - Test Frontend

- **MCP TOOL**: `mcp__playwright__browser_navigate` to `http://localhost:3000`
- **MCP TOOL**: `mcp__playwright__browser_snapshot` to capture page state
- **VERIFY**: Snapshot should show:
  - "Product Catalog" heading
  - "Browse our collection of 30 products" text
  - Product cards with names and prices
- **GOTCHA**: Wait for page to fully load before snapshot
- **VALIDATE**: No error messages visible in snapshot

### Task 10: VALIDATE with Playwright MCP - Screenshot

- **MCP TOOL**: `mcp__playwright__browser_take_screenshot`
- **FILENAME**: `supabase-products-validation.png`
- **PURPOSE**: Visual documentation that products load from database
- **VALIDATE**: Screenshot saved successfully

---

## TESTING STRATEGY

### Unit Tests

Existing tests in `tests/test_products_basic.py` should continue to pass:
- `test_get_all_products_returns_200`
- `test_get_all_products_returns_correct_structure`
- `test_get_all_products_returns_30_products`
- `test_product_objects_have_required_fields`
- `test_health_check_endpoint`

**Note**: Tests use `TestClient` which runs against the app, so they will implicitly test the Supabase integration if credentials are configured.

### Integration Tests

The Playwright validation (Tasks 8-10) serves as the integration test, verifying:
- Backend connects to Supabase
- API returns products from database
- Frontend renders products correctly

### Edge Cases

- **No Supabase credentials**: Service should fall back to seed data
- **Empty database**: Should return empty list, not error
- **Database connection error**: Should log error and return graceful response

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# Python linting (from backend directory)
cd app/backend && uv run ruff check app/

# Python formatting check
cd app/backend && uv run ruff format --check app/
```

**Expected**: All commands pass with exit code 0

### Level 2: Unit Tests

```bash
# Run all backend tests
cd app/backend && uv run pytest tests/ -v
```

**Expected**: All 5+ tests pass

### Level 3: Database Validation

```bash
# Using Supabase MCP
mcp__supabase__execute_sql: SELECT COUNT(*) FROM products;
```

**Expected**: Returns `[{"count": 30}]`

### Level 4: API Validation

```bash
# Health check
curl http://localhost:8000/health

# Products endpoint
curl http://localhost:8000/api/products | jq '.total_count'
```

**Expected**: Health returns `{"status": "healthy"}`, products returns `30`

### Level 5: Playwright Validation

Use Playwright MCP tools to:
1. Navigate to http://localhost:3000
2. Take snapshot and verify products displayed
3. Check for console errors with `mcp__playwright__browser_console_messages`

**Expected**: Products visible, no errors

---

## ACCEPTANCE CRITERIA

- [ ] `products` table exists in Supabase with correct schema
- [ ] Table contains 30 seed products
- [ ] Backend `pyproject.toml` includes `supabase` dependency
- [ ] `.env.example` file created with template credentials
- [ ] `config.py` includes `supabase_url` and `supabase_key` settings
- [ ] `database.py` module exports Supabase client
- [ ] `product_service.py` queries Supabase instead of in-memory list
- [ ] All existing tests pass
- [ ] Frontend displays products from database
- [ ] Playwright screenshot confirms successful integration

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully:
  - [ ] Level 1: ruff check, ruff format
  - [ ] Level 2: pytest tests pass
  - [ ] Level 3: Database count = 30
  - [ ] Level 4: API returns products
  - [ ] Level 5: Playwright validates frontend
- [ ] No linting errors
- [ ] No test failures
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **Supabase Python Client over asyncpg**: Chose Supabase client for simplicity. It handles connection pooling and provides a clean API. The service layer remains synchronous, which matches the existing codebase pattern.

2. **Fallback to seed data**: The service should gracefully fall back to in-memory seed data if Supabase credentials aren't configured. This maintains backwards compatibility for local development without a database.

3. **No RLS (Row Level Security)**: For a public product catalog, RLS is not needed. The `get_advisors` tool may flag this, but it's intentional for this use case.

4. **Environment variables over hardcoding**: Credentials stored in environment variables following 12-factor app principles.

### MCP Tools Reference

**Supabase MCP:**
- `mcp__supabase__apply_migration(name, query)` - Create table (DDL)
- `mcp__supabase__execute_sql(query)` - Run SQL (DML)
- `mcp__supabase__list_tables()` - Verify table creation
- `mcp__supabase__get_project_url()` - Get project URL

**Playwright MCP:**
- `mcp__playwright__browser_navigate(url)` - Go to URL
- `mcp__playwright__browser_snapshot()` - Get accessibility tree
- `mcp__playwright__browser_take_screenshot(filename)` - Save screenshot
- `mcp__playwright__browser_console_messages()` - Check for errors

### Supabase Project Info

- **Project URL**: https://qkzmkcdlzwsiwadzfsqb.supabase.co
- **Existing tables**: channels, videos, transcript_chunks, user_profiles, etc. (from different project)
- **New table**: `products` will be added to public schema
