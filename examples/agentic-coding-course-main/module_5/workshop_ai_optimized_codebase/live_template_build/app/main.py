"""
FastAPI application with vertical slice architecture.

Main application entry point with lifespan events for startup/shutdown.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.database import engine
from app.core.exceptions import setup_exception_handlers
from app.core.health import router as health_router
from app.core.logging import get_logger, setup_logging
from app.core.middleware import setup_middleware


settings = get_settings()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.

    Handles startup and shutdown events:
    - Startup: Initialize logging and database connection
    - Shutdown: Clean up resources (dispose database engine)

    Args:
        app: FastAPI application instance

    Yields:
        None during application runtime
    """
    # Startup: Initialize logging
    setup_logging(log_level=settings.log_level)

    logger.info(
        "application.startup",
        app_name=settings.app_name,
        version=settings.version,
        environment=settings.environment,
    )

    # Initialize database connection
    logger.info("database.connection.initialized")

    yield

    # Shutdown: Dispose database engine
    await engine.dispose()
    logger.info("database.connection.closed")
    logger.info("application.shutdown")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
)

# Setup middleware (CORS, request logging)
setup_middleware(app)

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(health_router)


@app.get("/")
def root() -> dict[str, str]:
    """
    Root endpoint providing API information.

    Returns:
        Dictionary with welcome message, version, and docs link
    """
    return {
        "message": "Obsidian Agent Project",
        "version": settings.version,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8123,
        reload=True,
        log_level=settings.log_level.lower(),
    )
