"""Supabase database client initialization."""

from supabase import Client, create_client

from app.core.config import settings

# Cached Supabase client instance
_supabase_client: Client | None = None


def get_supabase_client() -> Client | None:
    """
    Get the Supabase client instance.

    Returns None if Supabase credentials are not configured,
    allowing the application to fall back to seed data.

    Returns:
        Supabase Client instance if configured, None otherwise
    """
    global _supabase_client

    # Return cached client if available
    if _supabase_client is not None:
        return _supabase_client

    # Check if credentials are configured
    if not settings.supabase_url or not settings.supabase_key:
        return None

    # Create and cache the client
    _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
    return _supabase_client
