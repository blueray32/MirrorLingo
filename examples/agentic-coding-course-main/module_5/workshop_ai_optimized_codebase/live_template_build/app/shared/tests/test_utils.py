"""Tests for shared utility functions."""

from datetime import UTC, datetime

from app.shared.utils import format_iso, utcnow


def test_utcnow_returns_timezone_aware() -> None:
    """Test utcnow() returns timezone-aware datetime in UTC."""
    result = utcnow()

    # Verify it's a datetime
    assert isinstance(result, datetime)

    # Verify it has timezone info
    assert result.tzinfo is not None

    # Verify it's UTC timezone
    assert result.tzinfo == UTC

    # Verify it's close to current time (within 1 second)
    now = datetime.now(UTC)
    time_diff = abs((now - result).total_seconds())
    assert time_diff < 1.0


def test_format_iso_returns_iso8601_string() -> None:
    """Test format_iso() returns ISO 8601 formatted string."""
    # Create a known datetime
    dt = datetime(2024, 1, 15, 10, 30, 45, tzinfo=UTC)

    result = format_iso(dt)

    # Verify it's a string
    assert isinstance(result, str)

    # Verify it contains the expected date/time components
    assert "2024-01-15" in result
    assert "10:30:45" in result

    # Verify it's in ISO format (should contain 'T' separator)
    assert "T" in result

    # Verify the exact format
    assert result == "2024-01-15T10:30:45+00:00"


def test_format_iso_with_microseconds() -> None:
    """Test format_iso() handles microseconds correctly."""
    # Create datetime with microseconds
    dt = datetime(2024, 1, 15, 10, 30, 45, 123456, tzinfo=UTC)

    result = format_iso(dt)

    # Verify microseconds are included
    assert ".123456" in result or "123456" in result


def test_utcnow_and_format_iso_integration() -> None:
    """Test utcnow() and format_iso() work together correctly."""
    # Get current UTC time
    now = utcnow()

    # Format it
    iso_string = format_iso(now)

    # Verify we can parse it back
    parsed = datetime.fromisoformat(iso_string)

    # Verify the roundtrip preserves the time (within microsecond precision)
    assert abs((parsed - now).total_seconds()) < 0.001
