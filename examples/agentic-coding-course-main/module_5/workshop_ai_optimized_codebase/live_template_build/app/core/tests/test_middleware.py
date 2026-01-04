"""
Tests for request logging middleware.

Tests RequestLoggingMiddleware behavior including request ID handling,
logging calls, and response headers.
"""

from unittest.mock import patch

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
import pytest

from app.core.middleware import RequestLoggingMiddleware


@pytest.fixture
def app() -> FastAPI:
    """Create a test FastAPI application with middleware."""
    test_app = FastAPI()

    # Add middleware
    test_app.add_middleware(RequestLoggingMiddleware)

    @test_app.get("/test")
    def test_endpoint() -> dict[str, str]:
        return {"message": "test"}

    @test_app.get("/error")
    def error_endpoint() -> None:
        raise ValueError("Test error")

    return test_app


@pytest.mark.asyncio
async def test_middleware_generates_request_id(app: FastAPI) -> None:
    """Test middleware generates request_id if not provided."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/test")

        assert response.status_code == 200
        assert "X-Request-ID" in response.headers
        assert len(response.headers["X-Request-ID"]) > 0


@pytest.mark.asyncio
async def test_middleware_uses_provided_request_id(app: FastAPI) -> None:
    """Test middleware uses X-Request-ID header if provided."""
    test_request_id = "test-request-123"

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get(
            "/test",
            headers={"X-Request-ID": test_request_id},
        )

        assert response.status_code == 200
        assert response.headers["X-Request-ID"] == test_request_id


@pytest.mark.asyncio
async def test_middleware_logs_request_started(app: FastAPI) -> None:
    """Test middleware logs request.started event."""
    with patch("app.core.middleware.logger") as mock_logger:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            await client.get("/test")

            # Check that request.started was logged
            started_calls = [
                call
                for call in mock_logger.info.call_args_list
                if call[0][0] == "request.started"
            ]
            assert len(started_calls) == 1

            # Verify log contains method and path
            call_kwargs = started_calls[0][1]
            assert call_kwargs["method"] == "GET"
            assert call_kwargs["path"] == "/test"


@pytest.mark.asyncio
async def test_middleware_logs_request_completed(app: FastAPI) -> None:
    """Test middleware logs request.completed event."""
    with patch("app.core.middleware.logger") as mock_logger:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            await client.get("/test")

            # Check that request.completed was logged
            completed_calls = [
                call
                for call in mock_logger.info.call_args_list
                if call[0][0] == "request.completed"
            ]
            assert len(completed_calls) == 1

            # Verify log contains status_code and duration
            call_kwargs = completed_calls[0][1]
            assert call_kwargs["status_code"] == 200
            assert "duration_seconds" in call_kwargs
            assert isinstance(call_kwargs["duration_seconds"], float)


@pytest.mark.asyncio
async def test_middleware_logs_request_failed_on_exception(
    app: FastAPI,
) -> None:
    """Test middleware logs request.failed with exc_info on exceptions."""
    with patch("app.core.middleware.logger") as mock_logger:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            # Error endpoint will raise ValueError
            with pytest.raises(ValueError):
                await client.get("/error")

            # Check that request.failed was logged
            error_calls = [
                call
                for call in mock_logger.error.call_args_list
                if call[0][0] == "request.failed"
            ]
            assert len(error_calls) == 1

            # Verify exc_info=True was passed
            call_kwargs = error_calls[0][1]
            assert call_kwargs["exc_info"] is True
            assert "error" in call_kwargs
            assert "duration_seconds" in call_kwargs


@pytest.mark.asyncio
async def test_request_id_in_response_headers(app: FastAPI) -> None:
    """Test X-Request-ID appears in response headers."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/test")

        assert "X-Request-ID" in response.headers
        request_id = response.headers["X-Request-ID"]
        assert isinstance(request_id, str)
        assert len(request_id) > 0
