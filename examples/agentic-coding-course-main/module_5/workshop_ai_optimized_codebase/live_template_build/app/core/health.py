"""Health check endpoints for monitoring service and database status.

This module provides three levels of health checks:
- /health: Basic API health (no dependencies)
- /health/db: Database connectivity check
- /health/ready: Full readiness check (all dependencies)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.logging import get_logger


logger = get_logger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Basic health check endpoint with no dependencies.

    Returns:
        dict: Health status of the API service

    Example response:
        {"status": "healthy", "service": "api"}
    """
    return {"status": "healthy", "service": "api"}


@router.get("/health/db")
async def health_check_db(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    """Database health check endpoint.

    Args:
        db: Database session from dependency injection

    Returns:
        dict: Health status of the database connection

    Raises:
        HTTPException: If database connection fails (503 Service Unavailable)

    Example response:
        {"status": "healthy", "service": "database", "provider": "postgresql"}
    """
    try:
        # Execute simple query to verify database connectivity
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "service": "database", "provider": "postgresql"}
    except Exception as e:
        logger.error("database.health_check_failed", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=f"Database health check failed: {e!s}",
        ) from e


@router.get("/health/ready")
async def health_check_ready(
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """Readiness check endpoint for all service dependencies.

    This endpoint checks that all critical dependencies are available
    and the service is ready to accept traffic.

    Args:
        db: Database session from dependency injection

    Returns:
        dict: Readiness status with environment and database info

    Raises:
        HTTPException: If any dependency is not ready (503 Service Unavailable)

    Example response:
        {
            "status": "ready",
            "environment": "development",
            "database": "connected"
        }
    """
    settings = get_settings()

    try:
        # Check database connectivity
        await db.execute(text("SELECT 1"))

        return {
            "status": "ready",
            "environment": settings.environment,
            "database": "connected",
        }
    except Exception as e:
        logger.error("readiness.check_failed", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=f"Service not ready: {e!s}",
        ) from e
