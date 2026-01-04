"""Custom exception classes and global exception handlers.

This module provides database-specific exceptions and FastAPI exception handlers
with structured logging integration.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger


logger = get_logger(__name__)


# Custom exception classes
class DatabaseError(Exception):
    """Base exception for database-related errors."""

    pass


class NotFoundError(DatabaseError):
    """Exception raised when a requested resource is not found."""

    pass


class ValidationError(DatabaseError):
    """Exception raised when data validation fails."""

    pass


# Global exception handlers
async def database_exception_handler(
    request: Request, exc: DatabaseError
) -> JSONResponse:
    """Handle database exceptions with structured logging and JSON response.

    Args:
        request: The FastAPI request object
        exc: The database exception that was raised

    Returns:
        JSONResponse with error details and appropriate status code
    """
    logger.error(
        "database.exception",
        extra={
            "error": str(exc),
            "exception_type": type(exc).__name__,
            "path": request.url.path,
            "method": request.method,
        },
        exc_info=True,
    )

    status_code = 500
    if isinstance(exc, NotFoundError):
        status_code = 404
    elif isinstance(exc, ValidationError):
        status_code = 422

    return JSONResponse(
        status_code=status_code,
        content={"error": str(exc), "type": type(exc).__name__},
    )


def setup_exception_handlers(app: FastAPI) -> None:
    """Register custom exception handlers with the FastAPI application.

    Args:
        app: The FastAPI application instance

    Example:
        ```python
        app = FastAPI()
        setup_exception_handlers(app)
        ```
    """
    app.add_exception_handler(DatabaseError, database_exception_handler)
    app.add_exception_handler(NotFoundError, database_exception_handler)
    app.add_exception_handler(ValidationError, database_exception_handler)
