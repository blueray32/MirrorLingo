"""
Tests for main FastAPI application.

Tests root endpoint, health check, CORS configuration, and lifespan events.
"""


from httpx import ASGITransport, AsyncClient
import pytest

from app.main import app


@pytest.mark.asyncio
async def test_root_endpoint() -> None:
    """Test root endpoint returns correct JSON structure."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert data["message"] == "Obsidian Agent Project"
        assert data["version"] == "0.1.0"
        assert data["docs"] == "/docs"


@pytest.mark.asyncio
async def test_health_check_endpoint() -> None:
    """Test health check endpoint returns correct status."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
        assert "environment" in data
        assert data["status"] == "healthy"
        assert data["version"] == "0.1.0"


@pytest.mark.asyncio
async def test_docs_endpoint_is_accessible() -> None:
    """Test /docs endpoint is accessible (Swagger UI)."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/docs")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_openapi_schema_endpoint() -> None:
    """Test /openapi.json endpoint is accessible."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert data["info"]["title"] == "Obsidian Agent Project"


@pytest.mark.asyncio
async def test_cors_headers_present() -> None:
    """Test CORS headers are present in response."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get(
            "/",
            headers={"Origin": "http://localhost:3000"},
        )

        assert response.status_code == 200
        # CORS middleware should add these headers
        assert "access-control-allow-origin" in response.headers


@pytest.mark.asyncio
async def test_request_id_in_response() -> None:
    """Test that X-Request-ID is added to response headers by middleware."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/")

        assert response.status_code == 200
        assert "X-Request-ID" in response.headers
        assert len(response.headers["X-Request-ID"]) > 0
