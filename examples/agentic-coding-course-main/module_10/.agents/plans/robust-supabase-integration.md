# Feature: Robust Supabase Integration

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Transform the basic Supabase integration into a production-ready, secure, and feature-rich implementation. This includes enabling Row-Level Security (RLS) on all tables, implementing Supabase Auth for user authentication, adding real-time subscriptions for live updates, implementing proper error handling with retry logic, and setting up storage for product images.

## User Story

As a developer
I want a robust Supabase integration with authentication, security, and real-time features
So that the application is production-ready, secure, and provides a great user experience

## Problem Statement

The current Supabase integration is minimal:
- Only reads from a `products` table with no RLS (security vulnerability!)
- No authentication - anyone can access the API
- No real-time updates - users must refresh to see changes
- No proper error handling or retry logic
- No storage integration for product images
- Frontend has no Supabase client - only calls backend API

## Solution Statement

Implement a comprehensive Supabase integration that:
1. **Secures data** with RLS policies on all tables
2. **Authenticates users** via Supabase Auth with email/password
3. **Enables real-time** subscriptions for product updates
4. **Adds resilient** error handling with exponential backoff
5. **Integrates storage** for product images
6. **Generates types** from database schema for type safety

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: High
**Primary Systems Affected**: Backend (FastAPI), Frontend (React), Database (Supabase)
**Dependencies**: supabase-py, @supabase/supabase-js, @supabase/auth-ui-react

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `app/backend/app/core/config.py` (lines 1-34) - Why: Configuration pattern to extend with new settings
- `app/backend/app/core/database.py` (lines 1-34) - Why: Current Supabase client initialization to enhance
- `app/backend/app/services/product_service.py` (lines 1-93) - Why: Service pattern to follow for new services
- `app/backend/app/api/products.py` (lines 1-59) - Why: API router pattern to follow
- `app/backend/app/models/product.py` (lines 1-95) - Why: Pydantic model patterns
- `app/backend/app/core/logging_config.py` - Why: Logging pattern to follow
- `app/frontend/src/lib/api-client.ts` (lines 1-181) - Why: Frontend API client pattern
- `app/frontend/package.json` - Why: Dependencies to update

### New Files to Create

**Backend:**
- `app/backend/app/core/supabase.py` - Enhanced Supabase client with retry logic
- `app/backend/app/services/auth_service.py` - Authentication service
- `app/backend/app/api/auth.py` - Authentication API endpoints
- `app/backend/app/models/auth.py` - Auth-related Pydantic models
- `app/backend/app/middleware/auth.py` - JWT verification middleware

**Frontend:**
- `app/frontend/src/lib/supabase.ts` - Supabase client initialization
- `app/frontend/src/contexts/AuthContext.tsx` - Auth state management
- `app/frontend/src/components/auth/LoginForm.tsx` - Login component
- `app/frontend/src/components/auth/SignUpForm.tsx` - Signup component
- `app/frontend/src/hooks/useProducts.ts` - Real-time products hook
- `app/frontend/src/types/database.ts` - Generated database types

**Database Migrations:**
- Migration: Enable RLS on products table
- Migration: Create RLS policies for products

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Supabase Python SDK](https://supabase.com/docs/reference/python/introduction)
  - Client initialization, authentication, database queries
  - Why: Primary backend SDK documentation

- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript/introduction)
  - Client setup, auth, realtime subscriptions
  - Why: Frontend SDK documentation

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
  - RLS policies, auth.uid(), auth.jwt()
  - Why: Security implementation guide

- [Supabase Auth](https://supabase.com/docs/guides/auth)
  - Email/password auth, session management
  - Why: Authentication implementation

- [Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
  - Subscribing to table changes
  - Why: Real-time feature implementation

### Patterns to Follow

**Naming Conventions:**
- Python: snake_case for functions/variables, PascalCase for classes
- TypeScript: camelCase for functions/variables, PascalCase for types/components
- Files: snake_case.py for Python, kebab-case.ts/tsx for TypeScript

**Error Handling Pattern (from product_service.py):**
```python
try:
    # Supabase operation
    response = supabase.table("products").select("*").execute()
except Exception as e:
    logger.warning("operation_failed", error=str(e))
    # Fallback behavior
```

**Logging Pattern (from logging_config.py):**
```python
logger = StructuredLogger(__name__)
logger.info("event_name", key1=value1, key2=value2)
```

**Frontend API Pattern (from api-client.ts):**
```typescript
export async function fetchResource(): Promise<ResourceType> {
  logger.info("fetching_resource", { operation: "fetchResource" });
  try {
    // fetch logic
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(`Network error: ${errorMessage}`);
  }
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Database Security (RLS)

Fix critical security issues first - the `products` table currently has RLS disabled.

**Tasks:**
1. Enable RLS on products table
2. Create RLS policies for public read access
3. Create RLS policies for authenticated write access
4. Add policies to remote_agent_* tables (currently have RLS but no policies)
5. Fix function search_path security issues

### Phase 2: Backend Authentication

Implement authentication infrastructure in the FastAPI backend.

**Tasks:**
1. Enhance configuration with auth-related settings
2. Create enhanced Supabase client with retry logic
3. Create auth service for user operations
4. Create auth API endpoints (signup, signin, signout, me)
5. Create JWT verification middleware
6. Protect product write endpoints

### Phase 3: Frontend Authentication

Add Supabase client and auth UI to the React frontend.

**Tasks:**
1. Install Supabase JS dependencies
2. Create Supabase client
3. Create Auth context provider
4. Create Login/Signup components
5. Add auth state to App component
6. Generate TypeScript types from database

### Phase 4: Real-time Features

Enable real-time subscriptions for live product updates.

**Tasks:**
1. Enable realtime on products table (publication)
2. Create useProducts hook with real-time subscription
3. Update ProductGrid to use real-time data
4. Add optimistic updates for better UX

### Phase 5: Testing & Validation

Ensure everything works correctly.

**Tasks:**
1. Test RLS policies with different roles
2. Test authentication flow end-to-end
3. Test real-time subscriptions
4. Run existing test suite
5. Validate security advisors are resolved

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Phase 1: Database Security

#### 1.1 CREATE RLS policies for products table

- **IMPLEMENT**: Enable RLS and create policies for the products table
- **PATTERN**: Follow existing RLS patterns from channels/videos tables
- **GOTCHA**: Products table currently has RLS DISABLED - this is a security vulnerability
- **VALIDATE**: Run `SELECT tablename, policyname FROM pg_policies WHERE tablename = 'products';`

```sql
-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view products)
CREATE POLICY "Public read access on products"
ON public.products
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update products
CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete products
CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- Service role has full access
CREATE POLICY "Service role full access on products"
ON public.products
FOR ALL
TO public
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
```

#### 1.2 CREATE RLS policies for remote_agent_* tables

- **IMPLEMENT**: Add policies to tables that have RLS enabled but no policies
- **PATTERN**: Service role access pattern from channels table
- **GOTCHA**: These tables have RLS enabled but NO policies = all access blocked
- **VALIDATE**: Query pg_policies to verify policies exist

```sql
-- remote_agent_codebases
CREATE POLICY "Service role full access on remote_agent_codebases"
ON public.remote_agent_codebases
FOR ALL
TO public
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- remote_agent_conversations
CREATE POLICY "Service role full access on remote_agent_conversations"
ON public.remote_agent_conversations
FOR ALL
TO public
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- remote_agent_sessions
CREATE POLICY "Service role full access on remote_agent_sessions"
ON public.remote_agent_sessions
FOR ALL
TO public
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
```

#### 1.3 UPDATE functions with immutable search_path

- **IMPLEMENT**: Fix security warnings about mutable search_path
- **PATTERN**: Set search_path explicitly in function definitions
- **GOTCHA**: Need to recreate functions with SET search_path
- **VALIDATE**: Run security advisors check

```sql
-- Example pattern for fixing search_path (apply to each function):
-- ALTER FUNCTION public.function_name SET search_path = public, auth;
-- Or recreate the function with the SET clause
```

---

### Phase 2: Backend Authentication

#### 2.1 UPDATE app/backend/app/core/config.py

- **IMPLEMENT**: Add auth-related configuration settings
- **PATTERN**: Follow existing ApplicationSettings pattern
- **IMPORTS**: No new imports needed
- **VALIDATE**: `uv run python -c "from app.core.config import settings; print(settings.jwt_secret)"`

```python
# Add to ApplicationSettings class:
jwt_secret: str = ""  # Supabase JWT secret for verification
supabase_service_key: str = ""  # Service role key for admin operations
auth_enabled: bool = True  # Toggle to disable auth for development
```

#### 2.2 CREATE app/backend/app/core/supabase.py

- **IMPLEMENT**: Enhanced Supabase client with retry logic and connection management
- **PATTERN**: Mirror database.py structure with added resilience
- **IMPORTS**: `from supabase import Client, create_client`, `import time`, `from functools import wraps`
- **GOTCHA**: Use service_role key for admin operations, anon key for user operations
- **VALIDATE**: `uv run python -c "from app.core.supabase import get_admin_client; print(get_admin_client())"`

```python
"""Enhanced Supabase client with retry logic and connection management."""

import time
from functools import wraps
from typing import TypeVar, Callable, Any

from supabase import Client, create_client

from app.core.config import settings
from app.core.logging_config import StructuredLogger

logger = StructuredLogger(__name__)

T = TypeVar('T')

def with_retry(max_retries: int = 3, base_delay: float = 1.0):
    """Decorator for retrying Supabase operations with exponential backoff."""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    delay = base_delay * (2 ** attempt)
                    logger.warning(
                        "supabase_operation_retry",
                        attempt=attempt + 1,
                        max_retries=max_retries,
                        delay=delay,
                        error=str(e),
                    )
                    time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator

# Cached clients
_anon_client: Client | None = None
_admin_client: Client | None = None

def get_supabase_client() -> Client | None:
    """Get Supabase client with anon key for user-context operations."""
    global _anon_client

    if _anon_client is not None:
        return _anon_client

    if not settings.supabase_url or not settings.supabase_key:
        logger.warning("supabase_not_configured", reason="missing_credentials")
        return None

    _anon_client = create_client(settings.supabase_url, settings.supabase_key)
    logger.info("supabase_client_initialized", client_type="anon")
    return _anon_client

def get_admin_client() -> Client | None:
    """Get Supabase client with service_role key for admin operations."""
    global _admin_client

    if _admin_client is not None:
        return _admin_client

    if not settings.supabase_url or not settings.supabase_service_key:
        logger.warning("supabase_admin_not_configured", reason="missing_service_key")
        return None

    _admin_client = create_client(settings.supabase_url, settings.supabase_service_key)
    logger.info("supabase_client_initialized", client_type="admin")
    return _admin_client
```

#### 2.3 CREATE app/backend/app/models/auth.py

- **IMPLEMENT**: Pydantic models for auth requests/responses
- **PATTERN**: Follow product.py model patterns
- **IMPORTS**: `from pydantic import BaseModel, Field, EmailStr`
- **VALIDATE**: `uv run python -c "from app.models.auth import UserSignUp; print(UserSignUp.model_json_schema())"`

```python
"""Authentication models for Supabase Auth integration."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserSignUp(BaseModel):
    """Request model for user registration."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")

class UserSignIn(BaseModel):
    """Request model for user login."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class UserResponse(BaseModel):
    """Response model for user data."""
    id: str = Field(..., description="User UUID")
    email: Optional[str] = Field(None, description="User email")
    created_at: Optional[datetime] = Field(None, description="Account creation timestamp")

class AuthResponse(BaseModel):
    """Response model for authentication operations."""
    user: Optional[UserResponse] = Field(None, description="User data if authenticated")
    access_token: Optional[str] = Field(None, description="JWT access token")
    refresh_token: Optional[str] = Field(None, description="Refresh token")
    expires_at: Optional[int] = Field(None, description="Token expiration timestamp")

class AuthError(BaseModel):
    """Error response for auth operations."""
    error_code: str = Field(..., description="Error code")
    error_message: str = Field(..., description="Human-readable error message")
```

#### 2.4 CREATE app/backend/app/services/auth_service.py

- **IMPLEMENT**: Authentication service using Supabase Auth
- **PATTERN**: Follow product_service.py patterns
- **IMPORTS**: `from app.core.supabase import get_supabase_client`, auth models
- **GOTCHA**: Supabase Python SDK auth methods are slightly different from JS
- **VALIDATE**: Create test user and verify in Supabase dashboard

```python
"""Authentication service for Supabase Auth operations."""

from typing import Optional, Tuple

from app.core.supabase import get_supabase_client, get_admin_client
from app.core.logging_config import StructuredLogger
from app.models.auth import UserResponse, AuthResponse

logger = StructuredLogger(__name__)

def sign_up(email: str, password: str) -> Tuple[Optional[AuthResponse], Optional[str]]:
    """
    Register a new user with email and password.

    Returns:
        Tuple of (AuthResponse, None) on success, or (None, error_message) on failure
    """
    client = get_supabase_client()
    if not client:
        return None, "Supabase not configured"

    try:
        logger.info("auth_signup_attempt", email=email)
        response = client.auth.sign_up({"email": email, "password": password})

        if response.user:
            logger.info("auth_signup_success", user_id=response.user.id)
            return AuthResponse(
                user=UserResponse(
                    id=response.user.id,
                    email=response.user.email,
                    created_at=response.user.created_at,
                ),
                access_token=response.session.access_token if response.session else None,
                refresh_token=response.session.refresh_token if response.session else None,
                expires_at=response.session.expires_at if response.session else None,
            ), None

        return None, "Sign up failed"

    except Exception as e:
        logger.error("auth_signup_failed", error=str(e))
        return None, str(e)

def sign_in(email: str, password: str) -> Tuple[Optional[AuthResponse], Optional[str]]:
    """
    Sign in user with email and password.

    Returns:
        Tuple of (AuthResponse, None) on success, or (None, error_message) on failure
    """
    client = get_supabase_client()
    if not client:
        return None, "Supabase not configured"

    try:
        logger.info("auth_signin_attempt", email=email)
        response = client.auth.sign_in_with_password({"email": email, "password": password})

        if response.user and response.session:
            logger.info("auth_signin_success", user_id=response.user.id)
            return AuthResponse(
                user=UserResponse(
                    id=response.user.id,
                    email=response.user.email,
                    created_at=response.user.created_at,
                ),
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                expires_at=response.session.expires_at,
            ), None

        return None, "Invalid credentials"

    except Exception as e:
        logger.error("auth_signin_failed", error=str(e))
        return None, str(e)

def sign_out(access_token: str) -> Tuple[bool, Optional[str]]:
    """
    Sign out user and invalidate session.

    Returns:
        Tuple of (True, None) on success, or (False, error_message) on failure
    """
    client = get_supabase_client()
    if not client:
        return False, "Supabase not configured"

    try:
        logger.info("auth_signout_attempt")
        client.auth.sign_out()
        logger.info("auth_signout_success")
        return True, None

    except Exception as e:
        logger.error("auth_signout_failed", error=str(e))
        return False, str(e)

def get_user_from_token(access_token: str) -> Tuple[Optional[UserResponse], Optional[str]]:
    """
    Get user data from JWT access token.

    Returns:
        Tuple of (UserResponse, None) on success, or (None, error_message) on failure
    """
    client = get_supabase_client()
    if not client:
        return None, "Supabase not configured"

    try:
        response = client.auth.get_user(access_token)

        if response.user:
            return UserResponse(
                id=response.user.id,
                email=response.user.email,
                created_at=response.user.created_at,
            ), None

        return None, "Invalid token"

    except Exception as e:
        logger.error("auth_get_user_failed", error=str(e))
        return None, str(e)
```

#### 2.5 CREATE app/backend/app/api/auth.py

- **IMPLEMENT**: Authentication API endpoints
- **PATTERN**: Follow products.py router patterns
- **IMPORTS**: FastAPI dependencies, auth service, auth models
- **VALIDATE**: Test with `curl -X POST http://localhost:8000/api/auth/signup -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'`

```python
"""Authentication API endpoints."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from app.core.logging_config import StructuredLogger
from app.models.auth import UserSignUp, UserSignIn, AuthResponse, UserResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = StructuredLogger(__name__)

@router.post("/signup", response_model=AuthResponse)
async def signup(request: UserSignUp) -> AuthResponse:
    """
    Register a new user with email and password.
    """
    logger.info("api_auth_signup", email=request.email)

    response, error = auth_service.sign_up(request.email, request.password)

    if error:
        logger.error("api_auth_signup_failed", error=error)
        raise HTTPException(status_code=400, detail=error)

    return response

@router.post("/signin", response_model=AuthResponse)
async def signin(request: UserSignIn) -> AuthResponse:
    """
    Sign in with email and password.
    """
    logger.info("api_auth_signin", email=request.email)

    response, error = auth_service.sign_in(request.email, request.password)

    if error:
        logger.error("api_auth_signin_failed", error=error)
        raise HTTPException(status_code=401, detail=error)

    return response

@router.post("/signout")
async def signout(authorization: Optional[str] = Header(None)) -> dict:
    """
    Sign out and invalidate session.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")

    token = authorization.replace("Bearer ", "")
    success, error = auth_service.sign_out(token)

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return {"message": "Signed out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: Optional[str] = Header(None)) -> UserResponse:
    """
    Get current authenticated user.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")

    token = authorization.replace("Bearer ", "")
    user, error = auth_service.get_user_from_token(token)

    if error:
        raise HTTPException(status_code=401, detail=error)

    return user
```

#### 2.6 UPDATE app/backend/app/main.py

- **IMPLEMENT**: Register auth router
- **PATTERN**: Follow existing router registration
- **IMPORTS**: `from app.api import auth`
- **VALIDATE**: Check `/docs` endpoint shows auth routes

```python
# Add import at top:
from app.api import auth

# Add after products router registration:
app.include_router(auth.router)
logger.info("api_router_registered", router_prefix="/api/auth", router_tag="auth")
```

#### 2.7 UPDATE app/backend/app/services/__init__.py

- **IMPLEMENT**: Export auth_service
- **VALIDATE**: `uv run python -c "from app.services import auth_service"`

---

### Phase 3: Frontend Authentication

#### 3.1 UPDATE app/frontend/package.json

- **IMPLEMENT**: Add Supabase JS dependencies
- **VALIDATE**: `bun install` completes successfully

```json
// Add to dependencies:
"@supabase/supabase-js": "^2.45.0"
```

#### 3.2 CREATE app/frontend/src/lib/supabase.ts

- **IMPLEMENT**: Initialize Supabase client for frontend
- **PATTERN**: Follow api-client.ts patterns
- **IMPORTS**: `import { createClient } from '@supabase/supabase-js'`
- **GOTCHA**: Use environment variables or hardcode for demo
- **VALIDATE**: Import and check client exists

```typescript
/**
 * Supabase client for frontend operations.
 *
 * Handles authentication and real-time subscriptions.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Supabase configuration
// TODO: Move to environment variables for production
const SUPABASE_URL = 'https://qkzmkcdlzwsiwadzfsqb.supabase.co';
const SUPABASE_ANON_KEY = ''; // Add your anon key here

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
```

#### 3.3 CREATE app/frontend/src/types/database.ts

- **IMPLEMENT**: TypeScript types for database schema
- **PATTERN**: Standard Supabase generated types pattern
- **VALIDATE**: TypeScript compiles without errors

```typescript
/**
 * Database types generated from Supabase schema.
 *
 * Run `supabase gen types typescript` to regenerate.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          product_id: number;
          product_name: string;
          product_description: string;
          product_price_usd: number;
          product_category: 'electronics' | 'clothing' | 'home' | 'sports' | 'books';
          product_in_stock: boolean | null;
          created_at: string | null;
        };
        Insert: {
          product_id?: number;
          product_name: string;
          product_description: string;
          product_price_usd: number;
          product_category: 'electronics' | 'clothing' | 'home' | 'sports' | 'books';
          product_in_stock?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          product_id?: number;
          product_name?: string;
          product_description?: string;
          product_price_usd?: number;
          product_category?: 'electronics' | 'clothing' | 'home' | 'sports' | 'books';
          product_in_stock?: boolean | null;
          created_at?: string | null;
        };
      };
    };
  };
}

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
```

#### 3.4 CREATE app/frontend/src/contexts/AuthContext.tsx

- **IMPLEMENT**: React context for auth state management
- **PATTERN**: Standard React context pattern
- **IMPORTS**: React hooks, Supabase client
- **VALIDATE**: Wrap App and check auth state

```typescript
/**
 * Authentication context for managing user state.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      logger.info('auth_session_loaded', { user_id: session?.user?.id });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        logger.info('auth_state_changed', { event: _event, user_id: session?.user?.id });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 3.5 CREATE app/frontend/src/components/auth/LoginForm.tsx

- **IMPLEMENT**: Login form component
- **PATTERN**: Follow existing component patterns with Tailwind
- **IMPORTS**: useAuth hook, React hooks, UI components
- **VALIDATE**: Form renders and handles submission

```typescript
/**
 * Login form component for email/password authentication.
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-blue-600 hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}
```

#### 3.6 CREATE app/frontend/src/components/auth/SignUpForm.tsx

- **IMPLEMENT**: Sign up form component
- **PATTERN**: Mirror LoginForm structure
- **VALIDATE**: Form renders and handles submission

```typescript
/**
 * Sign up form component for new user registration.
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignUpFormProps {
  onToggleMode: () => void;
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-green-600">Check your email!</h2>
        <p className="text-gray-600">
          We've sent you a confirmation link. Please check your email to verify your account.
        </p>
        <Button onClick={onToggleMode} variant="outline">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-blue-600 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
```

---

### Phase 4: Real-time Features

#### 4.1 ENABLE realtime on products table

- **IMPLEMENT**: Add products table to supabase_realtime publication
- **VALIDATE**: Check publications in Supabase dashboard

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
```

#### 4.2 CREATE app/frontend/src/hooks/useProducts.ts

- **IMPLEMENT**: Hook for real-time product subscriptions
- **PATTERN**: Custom hook with Supabase realtime
- **IMPORTS**: Supabase client, React hooks, types
- **VALIDATE**: Products update in real-time when database changes

```typescript
/**
 * Hook for fetching and subscribing to real-time product updates.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';
import { logger } from '@/lib/logger';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('product_id', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
      logger.info('products_fetched', { count: data?.length || 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      logger.error('products_fetch_error', { error: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchProducts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          logger.info('products_realtime_event', { event: payload.eventType });

          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [...prev, payload.new as Product]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((p) =>
                p.product_id === (payload.new as Product).product_id
                  ? (payload.new as Product)
                  : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) =>
              prev.filter((p) => p.product_id !== (payload.old as Product).product_id)
            );
          }
        }
      )
      .subscribe();

    logger.info('products_realtime_subscribed');

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      logger.info('products_realtime_unsubscribed');
    };
  }, []);

  return { products, loading, error, refetch: fetchProducts };
}
```

---

## TESTING STRATEGY

### Unit Tests

**Backend:**
- Test auth_service functions with mocked Supabase client
- Test API endpoints with FastAPI TestClient
- Test retry logic in supabase.py

**Frontend:**
- Test AuthContext state management
- Test form validation in LoginForm/SignUpForm

### Integration Tests

- Test full auth flow: signup -> confirm email -> signin -> signout
- Test RLS policies block unauthorized access
- Test real-time subscriptions receive updates

### Edge Cases

- Invalid email format in signup
- Password too short
- Duplicate email registration
- Expired JWT token
- Network failures during auth
- Supabase service unavailable

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# Backend
cd app/backend
uv run ruff check app/
uv run ruff format app/ --check

# Frontend
cd app/frontend
bun run lint
bun run check
```

**Expected**: All commands pass with exit code 0

### Level 2: Unit Tests

```bash
cd app/backend
uv run pytest tests/ -v
```

### Level 3: Integration Tests

```bash
# Test backend server starts
cd app/backend
uv run python run_api.py &
sleep 3
curl http://localhost:8000/health
curl http://localhost:8000/api/products

# Test auth endpoints
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Level 4: Manual Validation

1. Open http://localhost:3000 in browser
2. Click "Sign Up" and create account
3. Check email for confirmation (if email enabled)
4. Sign in with created account
5. Verify products load
6. In Supabase dashboard, modify a product
7. Verify change appears in real-time on frontend

### Level 5: Security Validation

```bash
# Run Supabase security advisors
# Check via MCP: mcp__supabase__get_advisors type=security

# Verify RLS is enabled on products
# Check via MCP: mcp__supabase__list_tables
```

---

## ACCEPTANCE CRITERIA

- [x] RLS enabled on products table with appropriate policies
- [ ] Authentication endpoints work (signup, signin, signout, me)
- [ ] Frontend auth UI allows login/signup
- [ ] Auth state persists across page refreshes
- [ ] Real-time subscriptions update products list
- [ ] All security advisors resolved (no ERROR level issues)
- [ ] Backend tests pass
- [ ] Frontend linting passes
- [ ] No regressions in existing functionality

---

## COMPLETION CHECKLIST

- [ ] Phase 1: Database Security completed
  - [ ] RLS enabled on products
  - [ ] Policies created for products
  - [ ] Policies created for remote_agent_* tables
- [ ] Phase 2: Backend Authentication completed
  - [ ] Config updated
  - [ ] Enhanced Supabase client created
  - [ ] Auth models created
  - [ ] Auth service created
  - [ ] Auth API endpoints created
  - [ ] Main.py updated with auth router
- [ ] Phase 3: Frontend Authentication completed
  - [ ] Supabase JS installed
  - [ ] Supabase client created
  - [ ] Database types created
  - [ ] AuthContext created
  - [ ] LoginForm created
  - [ ] SignUpForm created
- [ ] Phase 4: Real-time Features completed
  - [ ] Realtime publication enabled
  - [ ] useProducts hook created
- [ ] All validation commands pass
- [ ] Security advisors show no ERROR level issues

---

## NOTES

### Design Decisions

1. **Service Role Key**: Used for admin operations that bypass RLS. Keep secure, never expose to frontend.

2. **Anon Key**: Used for user-context operations. Safe for frontend but still protected by RLS.

3. **JWT Verification**: Backend verifies JWTs using Supabase's `get_user()` method rather than manual JWT decoding. This ensures tokens are validated against Supabase's session store.

4. **Real-time vs Polling**: Chose Supabase Realtime over polling for immediate updates and reduced server load.

5. **Auth State**: Stored in React Context rather than Redux/Zustand for simplicity. Consider migration if app grows.

### Trade-offs

- **Complexity vs Security**: Added auth complexity but significantly improved security posture
- **Direct Supabase vs API**: Frontend calls Supabase directly for auth/realtime, reducing backend load but requiring careful RLS policies

### Future Considerations

- Add OAuth providers (Google, GitHub)
- Implement password reset flow
- Add MFA support
- Storage integration for product images
- Edge Functions for complex operations
