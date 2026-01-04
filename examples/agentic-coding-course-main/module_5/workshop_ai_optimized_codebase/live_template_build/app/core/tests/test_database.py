"""Unit tests for database configuration and session management.

These tests verify the database module's configuration without
requiring an actual database connection.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base, engine, get_db


def test_engine_created():
    """Test that async engine is created with correct configuration."""
    assert engine is not None
    assert engine.url.drivername == "postgresql+asyncpg"


def test_base_class_configured():
    """Test that Base class is properly configured for SQLAlchemy models."""
    assert Base is not None
    assert hasattr(Base, "metadata")
    # __tablename__ is only present on subclasses, not on Base itself
    assert hasattr(Base, "registry")


@pytest.mark.asyncio
async def test_get_db_session_lifecycle():
    """Test that get_db creates and closes session properly."""
    # Mock the AsyncSessionLocal to avoid actual database connection
    mock_session = MagicMock(spec=AsyncSession)
    # Make close an async mock
    mock_session.close = AsyncMock()

    # Create async context manager mock
    class MockAsyncContextManager:
        async def __aenter__(self):
            return mock_session

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            # The async context manager handles cleanup
            pass

    with patch("app.core.database.AsyncSessionLocal") as mock_session_local:
        mock_session_local.return_value = MockAsyncContextManager()

        # Test the generator
        gen = get_db()
        session = await gen.__anext__()

        # Verify session was yielded
        assert session == mock_session

        # Close the generator
        try:
            await gen.__anext__()
        except StopAsyncIteration:
            pass

        # Session close should have been called by the finally block
        assert mock_session.close.called


@pytest.mark.asyncio
async def test_get_db_yields_async_session():
    """Test that get_db yields an AsyncSession instance."""
    # Mock the AsyncSessionLocal
    mock_session = MagicMock(spec=AsyncSession)

    class MockAsyncContextManager:
        async def __aenter__(self):
            return mock_session

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    with patch("app.core.database.AsyncSessionLocal") as mock_session_local:
        mock_session_local.return_value = MockAsyncContextManager()

        gen = get_db()
        session = await gen.__anext__()

        # Verify the yielded object is the mock session
        assert session == mock_session
