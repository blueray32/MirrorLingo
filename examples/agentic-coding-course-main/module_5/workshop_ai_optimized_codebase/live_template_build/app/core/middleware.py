"""
Request/response middleware for FastAPI application.

Provides request logging with correlation IDs and CORS configuration.
"""

import time
from typing import Any

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import get_logger, get_request_id, set_request_id


logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for request/response logging with correlation ID.

    Features:
    - Extracts or generates request ID for correlation
    - Logs request start with method, path, client
    - Logs request completion with status code and duration
    - Logs request failures with exception info
    - Adds X-Request-ID to response headers
    """

    async def dispatch(self, request: Request, call_next: Any) -> Response:
        """
        Process request and response with logging.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain

        Returns:
            Response from the application
        """
        # Extract or generate request ID for correlation
        request_id = request.headers.get("X-Request-ID")
        _ = set_request_id(request_id)

        # Record start time for duration calculation
        start_time = time.time()

        # Log request start
        logger.info(
            "request.started",
            method=request.method,
            path=request.url.path,
            client_host=request.client.host if request.client else None,
        )

        try:
            # Process request
            response: Response = await call_next(request)
            duration_seconds = round(time.time() - start_time, 3)

            # Log successful completion
            logger.info(
                "request.completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_seconds=duration_seconds,
            )

            # Add request ID to response headers for client correlation
            current_request_id = get_request_id()
            response.headers["X-Request-ID"] = current_request_id
            return response

        except Exception as exc:
            # Log failure with exception details
            duration_seconds = round(time.time() - start_time, 3)
            logger.error(
                "request.failed",
                method=request.method,
                path=request.url.path,
                error=str(exc),
                duration_seconds=duration_seconds,
                exc_info=True,
            )
            raise


def setup_middleware(app: FastAPI) -> None:
    """
    Configure all middleware for the application.

    Adds:
    - CORS middleware with configured origins
    - Request logging middleware

    Args:
        app: FastAPI application instance
    """
    settings = get_settings()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add request logging middleware
    app.add_middleware(RequestLoggingMiddleware)

    logger.info(
        "middleware.configured",
        cors_origins=settings.cors_origins,
    )
