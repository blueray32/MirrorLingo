"""
Structured logging configuration for AI-optimized observability.

Provides JSON output with request ID correlation and hybrid dotted namespace pattern.

Pattern: {domain}.{component}.{action}_{state}
Examples:
    - user.registration_started
    - user.registration_completed
    - database.connection_initialized
    - database.query_failed

States: _started, _completed, _failed, _validated, _rejected
"""

import contextvars
import logging
import sys
from typing import Any, cast
import uuid

import structlog


# Context variable for request ID correlation across async operations
request_id_var: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "request_id", default=None
)


def set_request_id(request_id: str | None = None) -> str:
    """
    Set request ID in context for correlation across logs.

    Args:
        request_id: Optional request ID. Generates UUID if not provided.

    Returns:
        The request ID that was set
    """
    if request_id is None:
        request_id = str(uuid.uuid4())
    _ = request_id_var.set(request_id)
    return request_id


def get_request_id() -> str:
    """
    Get current request ID from context.

    Returns:
        Current request ID (empty string if not set)
    """
    return cast(str, request_id_var.get(""))


def add_request_id(
    logger: logging.Logger, method_name: str, event_dict: dict[str, Any]
) -> dict[str, Any]:
    """
    Add request ID to log event if available.

    Args:
        logger: Logger instance (unused but required by structlog)
        method_name: Method name (unused but required by structlog)
        event_dict: Log event dictionary

    Returns:
        Updated event dictionary with request_id
    """
    request_id = get_request_id()
    if request_id is not None:
        event_dict["request_id"] = request_id
    return event_dict


def setup_logging(log_level: str = "INFO") -> None:
    """
    Configure structlog for AI-optimized structured logging.

    Features:
        - JSON output for AI-parseable logs
        - Request ID correlation via context variables
        - Exception formatting with stack traces
        - Timestamp in ISO format
        - Consistent key naming (snake_case)

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper()),
    )

    # Configure structlog processors
    # Note: Type ignore needed due to structlog's type stub incompatibility
    processors_list: list[Any] = [
        structlog.contextvars.merge_contextvars,  # Merge context variables
        structlog.stdlib.add_log_level,  # Add log level
        structlog.stdlib.add_logger_name,  # Add logger name
        add_request_id,  # Add request ID from context
        structlog.processors.TimeStamper(fmt="iso"),  # ISO timestamp
        structlog.processors.StackInfoRenderer(),  # Stack traces
        structlog.processors.format_exc_info,  # Exception formatting
        structlog.processors.UnicodeDecoder(),  # Unicode handling
        structlog.processors.JSONRenderer(),  # JSON output
    ]

    structlog.configure(
        processors=processors_list,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> Any:
    """
    Get a configured structlog logger.

    Args:
        name: Logger name (typically __name__). Uses root logger if not provided.

    Returns:
        Configured structlog logger instance (structlog.stdlib.BoundLogger)

    Example:
        >>> logger = get_logger(__name__)
        >>> logger.info("user.registration_started", email="user@example.com")
        >>> logger.info("user.registration_completed", user_id=123)
    """
    return structlog.get_logger(name)
