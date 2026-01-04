"""Shared utility functions.

Common utilities used across multiple features.
"""

from datetime import UTC, datetime


def utcnow() -> datetime:
    """Get current UTC time as timezone-aware datetime.

    Returns timezone-aware datetime in UTC. Use this instead of
    datetime.utcnow() which returns naive datetime.

    Returns:
        Current UTC time with timezone information

    Example:
        now = utcnow()
        # datetime(2024, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
    """
    return datetime.now(UTC)


def format_iso(dt: datetime) -> str:
    """Format datetime as ISO 8601 string.

    Returns standardized ISO 8601 formatted string for API responses.

    Args:
        dt: Datetime object to format

    Returns:
        ISO 8601 formatted string

    Example:
        dt = utcnow()
        iso_string = format_iso(dt)
        # "2024-01-15T10:30:00+00:00"
    """
    return dt.isoformat()
