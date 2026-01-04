"""Unit tests for custom exception classes and handlers.

These tests verify that custom exceptions work correctly and
that exception handlers return proper responses.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI, Request

from app.core.exceptions import (
    DatabaseError,
    NotFoundError,
    ValidationError,
    database_exception_handler,
    setup_exception_handlers,
)


def test_database_error_raises():
    """Test that DatabaseError can be raised."""
    with pytest.raises(DatabaseError):
        raise DatabaseError("Test error")


def test_not_found_error_raises():
    """Test that NotFoundError can be raised and is a DatabaseError."""
    with pytest.raises(NotFoundError):
        raise NotFoundError("Resource not found")

    # Verify inheritance
    with pytest.raises(DatabaseError):
        raise NotFoundError("Resource not found")


def test_validation_error_raises():
    """Test that ValidationError can be raised and is a DatabaseError."""
    with pytest.raises(ValidationError):
        raise ValidationError("Validation failed")

    # Verify inheritance
    with pytest.raises(DatabaseError):
        raise ValidationError("Validation failed")


@pytest.mark.asyncio
async def test_database_exception_handler_returns_json():
    """Test that exception handler returns proper JSON structure."""
    # Create mock request
    mock_request = MagicMock(spec=Request)
    mock_request.url.path = "/test"
    mock_request.method = "GET"

    # Create test exception
    test_error = DatabaseError("Test database error")

    # Call handler
    with patch("app.core.exceptions.logger") as mock_logger:
        response = await database_exception_handler(mock_request, test_error)

        # Verify response
        assert response.status_code == 500
        assert "error" in response.body.decode()
        assert "type" in response.body.decode()

        # Verify logger was called
        mock_logger.error.assert_called_once()


@pytest.mark.asyncio
async def test_not_found_error_handler_returns_404():
    """Test that NotFoundError handler returns 404 status."""
    mock_request = MagicMock(spec=Request)
    mock_request.url.path = "/test"
    mock_request.method = "GET"

    test_error = NotFoundError("Resource not found")

    with patch("app.core.exceptions.logger"):
        response = await database_exception_handler(mock_request, test_error)
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_validation_error_handler_returns_422():
    """Test that ValidationError handler returns 422 status."""
    mock_request = MagicMock(spec=Request)
    mock_request.url.path = "/test"
    mock_request.method = "GET"

    test_error = ValidationError("Validation failed")

    with patch("app.core.exceptions.logger"):
        response = await database_exception_handler(mock_request, test_error)
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_exception_handler_logs_with_exc_info():
    """Test that exception handler logs with exc_info=True."""
    mock_request = MagicMock(spec=Request)
    mock_request.url.path = "/test"
    mock_request.method = "GET"

    test_error = DatabaseError("Test error")

    with patch("app.core.exceptions.logger") as mock_logger:
        await database_exception_handler(mock_request, test_error)

        # Verify logger.error was called with exc_info=True
        mock_logger.error.assert_called_once()
        call_kwargs = mock_logger.error.call_args[1]
        assert call_kwargs.get("exc_info") is True


def test_setup_exception_handlers():
    """Test that setup_exception_handlers registers handlers with FastAPI app."""
    mock_app = MagicMock(spec=FastAPI)

    setup_exception_handlers(mock_app)

    # Verify add_exception_handler was called for each exception type
    assert mock_app.add_exception_handler.call_count == 3
