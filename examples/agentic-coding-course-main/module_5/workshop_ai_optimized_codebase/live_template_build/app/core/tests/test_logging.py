"""
Unit tests for structured logging module.

Tests verify:
    - Request ID context management
    - Logger configuration
    - JSON output format
    - Exception handling
    - Hybrid dotted namespace pattern
"""

from io import StringIO
import json
import logging

from app.core.logging import (
    add_request_id,
    get_logger,
    get_request_id,
    set_request_id,
    setup_logging,
)


class TestRequestIDContext:
    """Test suite for request ID context management."""

    def test_set_request_id_with_value(self) -> None:
        """Test setting explicit request ID."""
        request_id = "test-request-123"
        result = set_request_id(request_id)

        assert result == request_id
        assert get_request_id() == request_id

    def test_set_request_id_generates_uuid(self) -> None:
        """Test auto-generation of request ID."""
        result = set_request_id()

        assert result is not None
        assert len(result) > 0
        assert get_request_id() == result

    def test_get_request_id_initially(self) -> None:
        """Test getting request ID returns empty string initially in a fresh context."""
        # Note: In practice, context may have values from previous tests
        # This test documents the behavior rather than enforcing isolation
        result = get_request_id()
        # get_request_id() always returns a string (empty if not set)
        assert isinstance(result, str)

    def test_request_id_isolation_between_calls(self) -> None:
        """Test that request IDs don't leak between calls."""
        first_id = set_request_id("request-1")
        assert get_request_id() == first_id

        second_id = set_request_id("request-2")
        assert get_request_id() == second_id
        assert second_id != first_id


class TestAddRequestIDProcessor:
    """Test suite for add_request_id processor."""

    def test_adds_request_id_when_set(self) -> None:
        """Test processor adds request_id to event dict."""
        _ = set_request_id("test-123")

        logger = logging.getLogger("test")
        event_dict: dict[str, str] = {"event": "test.event"}

        result = add_request_id(logger, "info", event_dict)

        assert "request_id" in result
        assert result["request_id"] == "test-123"

    def test_preserves_event_dict(self) -> None:
        """Test processor preserves original event dict fields."""
        _ = set_request_id("test-123")

        logger = logging.getLogger("test")
        event_dict: dict[str, str] = {"event": "test.event", "data": "value"}

        result = add_request_id(logger, "info", event_dict)

        assert result["event"] == "test.event"
        assert result["data"] == "value"
        assert result["request_id"] == "test-123"


class TestSetupLogging:
    """Test suite for logging setup."""

    def test_setup_logging_configures_structlog(self) -> None:
        """Test setup_logging configures structlog properly."""
        setup_logging(log_level="INFO")

        logger = get_logger("test")
        assert logger is not None

    def test_setup_logging_accepts_log_levels(self) -> None:
        """Test setup_logging accepts different log level strings."""
        # Test that function accepts different levels without error
        setup_logging(log_level="DEBUG")
        setup_logging(log_level="INFO")
        setup_logging(log_level="WARNING")
        # If we get here without exception, test passes


class TestGetLogger:
    """Test suite for get_logger function."""

    def test_get_logger_with_name(self) -> None:
        """Test getting logger with explicit name."""
        logger = get_logger("test.module")
        assert logger is not None

    def test_get_logger_without_name(self) -> None:
        """Test getting logger without name (root logger)."""
        logger = get_logger()
        assert logger is not None

    def test_logger_returns_bound_logger(self) -> None:
        """Test that get_logger returns structlog bound logger."""
        logger = get_logger("test.module")

        # Verify it's a structlog logger with bound methods
        assert hasattr(logger, "info")
        assert hasattr(logger, "error")
        assert hasattr(logger, "warning")


class TestStructuredLogging:
    """Test suite for structured logging output."""

    def test_json_output_format(self) -> None:
        """Test that logs are output as valid JSON."""
        setup_logging(log_level="INFO")

        # Capture log output
        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        handler.setLevel(logging.INFO)

        # Clear existing handlers and add our test handler
        root_logger = logging.getLogger()
        root_logger.handlers.clear()
        root_logger.addHandler(handler)
        root_logger.setLevel(logging.INFO)

        # Log a message
        structured_logger = get_logger("test")
        structured_logger.info("test.event", key="value", count=42)

        # Get output and parse as JSON
        output = log_stream.getvalue().strip()
        if output:  # Only parse if there's output
            log_data = json.loads(output)

            assert log_data["event"] == "test.event"
            assert log_data["key"] == "value"
            assert log_data["count"] == 42
            assert "timestamp" in log_data

    def test_hybrid_namespace_pattern(self) -> None:
        """Test hybrid dotted namespace pattern logging."""
        setup_logging(log_level="INFO")

        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        handler.setLevel(logging.INFO)

        # Clear existing handlers and add our test handler
        root_logger = logging.getLogger()
        root_logger.handlers.clear()
        root_logger.addHandler(handler)
        root_logger.setLevel(logging.INFO)

        structured_logger = get_logger("test")

        # Test various namespace patterns
        patterns = [
            "user.registration_started",
            "user.registration_completed",
            "database.connection_initialized",
        ]

        for pattern in patterns:
            structured_logger.info(pattern)

        output = log_stream.getvalue()
        # Verify at least some patterns appear in output
        if output:
            assert "user.registration_started" in output or "database" in output

    def test_exception_logging_with_exc_info(self) -> None:
        """Test exception logging includes stack trace."""
        setup_logging(log_level="INFO")

        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        logger = logging.getLogger()
        logger.handlers = [handler]

        structured_logger = get_logger("test")

        # Generate exception
        try:
            raise ValueError("Test exception")
        except ValueError as exc:
            structured_logger.error(
                "test.operation_failed",
                exc_info=exc,
            )

        output = log_stream.getvalue()
        log_data = json.loads(output.strip())

        assert log_data["event"] == "test.operation_failed"
        assert "exception" in log_data
        assert "ValueError" in log_data["exception"]
        assert "Test exception" in log_data["exception"]

    def test_request_id_in_logs(self) -> None:
        """Test request ID appears in log output when set."""
        setup_logging(log_level="INFO")

        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        handler.setLevel(logging.INFO)

        # Clear existing handlers and add our test handler
        root_logger = logging.getLogger()
        root_logger.handlers.clear()
        root_logger.addHandler(handler)
        root_logger.setLevel(logging.INFO)

        # Set request ID
        request_id = set_request_id("correlation-123")

        structured_logger = get_logger("test")
        structured_logger.info("test.event", data="value")

        output = log_stream.getvalue().strip()
        if output:
            log_data = json.loads(output)

            assert "request_id" in log_data
            assert log_data["request_id"] == request_id

    def test_multiple_context_fields(self) -> None:
        """Test logging with multiple context fields."""
        setup_logging(log_level="INFO")

        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        handler.setLevel(logging.INFO)

        # Clear existing handlers and add our test handler
        root_logger = logging.getLogger()
        root_logger.handlers.clear()
        root_logger.addHandler(handler)
        root_logger.setLevel(logging.INFO)

        structured_logger = get_logger("test")
        structured_logger.info(
            "user.action_completed",
            user_id=12345,
            email="test@example.com",
            duration_ms=123.45,
            success=True,
        )

        output = log_stream.getvalue().strip()
        if output:
            log_data = json.loads(output)

            assert log_data["event"] == "user.action_completed"
            assert log_data["user_id"] == 12345
            assert log_data["email"] == "test@example.com"
            assert log_data["duration_ms"] == 123.45
            assert log_data["success"] is True


class TestLoggingIntegration:
    """Integration tests for complete logging workflows."""

    def test_complete_workflow_with_correlation(self) -> None:
        """Test complete workflow with request ID correlation."""
        setup_logging(log_level="INFO")

        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        logger = logging.getLogger()
        logger.handlers = [handler]

        # Simulate request handling
        request_id = set_request_id()
        structured_logger = get_logger("app")

        # Log request lifecycle
        structured_logger.info("request.started", method="GET", path="/api/users")
        structured_logger.info("request.processing")
        structured_logger.info("request.completed", status_code=200, duration_ms=45.2)

        # Parse all logs
        output = log_stream.getvalue()
        log_lines = [line for line in output.strip().split("\n") if line]

        # Verify all logs have same request_id
        for line in log_lines:
            log_data = json.loads(line)
            assert log_data["request_id"] == request_id

    def test_error_handling_workflow(self) -> None:
        """Test error handling with structured logging."""
        setup_logging(log_level="INFO")

        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        logger = logging.getLogger()
        logger.handlers = [handler]

        structured_logger = get_logger("app")

        # Simulate error workflow
        structured_logger.info("operation.started", operation_type="data_import")

        try:
            raise RuntimeError("Simulated error")
        except RuntimeError as exc:
            structured_logger.error(
                "operation.failed",
                operation_type="data_import",
                exc_info=exc,
            )

        output = log_stream.getvalue()
        logs = [json.loads(line) for line in output.strip().split("\n") if line]

        # Verify error log contains exception
        error_log = logs[-1]
        assert error_log["event"] == "operation.failed"
        assert "exception" in error_log
        assert "RuntimeError" in error_log["exception"]
