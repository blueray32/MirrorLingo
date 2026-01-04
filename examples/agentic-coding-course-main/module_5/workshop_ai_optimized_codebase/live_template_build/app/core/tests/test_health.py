"""Unit tests for health check endpoints.

These tests verify health endpoints work correctly with and without database.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.health import health_check, health_check_db, health_check_ready


@pytest.mark.asyncio
async def test_health_check_returns_200():
    """Test basic health check endpoint returns healthy status."""
    result = await health_check()

    assert result["status"] == "healthy"
    assert result["service"] == "api"


@pytest.mark.asyncio
async def test_health_check_db_returns_200_with_database():
    """Test database health check returns healthy when database is connected."""
    # Mock database session
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock(return_value=MagicMock())

    result = await health_check_db(db=mock_db)

    assert result["status"] == "healthy"
    assert result["service"] == "database"
    assert result["provider"] == "postgresql"
    mock_db.execute.assert_called_once()


@pytest.mark.asyncio
async def test_health_check_db_returns_503_on_failure():
    """Test database health check returns 503 when database fails."""
    # Mock database session that raises exception
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock(side_effect=Exception("Database connection failed"))

    with patch("app.core.health.logger"):
        with pytest.raises(HTTPException) as exc_info:
            await health_check_db(db=mock_db)

        assert exc_info.value.status_code == 503
        assert "Database health check failed" in exc_info.value.detail


@pytest.mark.asyncio
async def test_health_check_db_logs_errors():
    """Test database health check logs errors when database fails."""
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock(side_effect=Exception("DB error"))

    with patch("app.core.health.logger") as mock_logger:
        with pytest.raises(HTTPException):
            await health_check_db(db=mock_db)

        # Verify logger.error was called with exc_info=True
        mock_logger.error.assert_called_once()
        call_args = mock_logger.error.call_args
        assert call_args[0][0] == "database.health_check_failed"
        assert call_args[1].get("exc_info") is True


@pytest.mark.asyncio
async def test_health_check_ready_returns_200_when_ready():
    """Test readiness check returns ready when all dependencies are healthy."""
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock(return_value=MagicMock())

    with patch("app.core.health.get_settings") as mock_settings:
        mock_settings.return_value.environment = "development"

        result = await health_check_ready(db=mock_db)

        assert result["status"] == "ready"
        assert result["environment"] == "development"
        assert result["database"] == "connected"


@pytest.mark.asyncio
async def test_health_check_ready_returns_503_when_not_ready():
    """Test readiness check returns 503 when dependencies fail."""
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock(side_effect=Exception("Database not ready"))

    with patch("app.core.health.logger"):
        with patch("app.core.health.get_settings"):
            with pytest.raises(HTTPException) as exc_info:
                await health_check_ready(db=mock_db)

            assert exc_info.value.status_code == 503
            assert "Service not ready" in exc_info.value.detail


@pytest.mark.asyncio
async def test_health_check_ready_logs_errors():
    """Test readiness check logs errors when not ready."""
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock(side_effect=Exception("Not ready"))

    with patch("app.core.health.logger") as mock_logger:
        with patch("app.core.health.get_settings"):
            with pytest.raises(HTTPException):
                await health_check_ready(db=mock_db)

            # Verify logger.error was called
            mock_logger.error.assert_called_once()
            call_args = mock_logger.error.call_args
            assert call_args[0][0] == "readiness.check_failed"
            assert call_args[1].get("exc_info") is True
