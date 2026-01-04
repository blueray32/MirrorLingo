"""
Tests for application configuration.

Tests Settings class instantiation, environment variable loading,
and caching behavior.
"""

import os
from unittest.mock import patch

from app.core.config import Settings, get_settings


def test_settings_instantiation_with_defaults() -> None:
    """Test Settings can be instantiated with default values."""
    settings = Settings()

    assert settings.app_name == "Obsidian Agent Project"
    assert settings.version == "0.1.0"
    assert settings.environment == "development"
    assert settings.log_level == "INFO"
    assert settings.api_prefix == "/api"
    assert settings.cors_origins == [
        "http://localhost:3000",
        "http://localhost:8123",
    ]


def test_settings_from_environment_variables() -> None:
    """Test Settings loads values from environment variables."""
    with patch.dict(
        os.environ,
        {
            "APP_NAME": "Test App",
            "VERSION": "1.2.3",
            "ENVIRONMENT": "production",
            "LOG_LEVEL": "DEBUG",
            "API_PREFIX": "/v1",
            "ALLOWED_ORIGINS": "http://example.com,http://test.com",
        },
        clear=False,
    ):
        settings = Settings()

        assert settings.app_name == "Test App"
        assert settings.version == "1.2.3"
        assert settings.environment == "production"
        assert settings.log_level == "DEBUG"
        assert settings.api_prefix == "/v1"
        assert settings.cors_origins == [
            "http://example.com",
            "http://test.com",
        ]


def test_get_settings_caching() -> None:
    """Test get_settings() returns the same instance (caching works)."""
    settings1 = get_settings()
    settings2 = get_settings()

    assert settings1 is settings2


def test_allowed_origins_parsing() -> None:
    """Test cors_origins correctly parses comma-separated string."""
    with patch.dict(
        os.environ,
        {"ALLOWED_ORIGINS": "http://a.com,http://b.com,http://c.com"},
        clear=False,
    ):
        settings = Settings()

        assert len(settings.cors_origins) == 3
        assert "http://a.com" in settings.cors_origins
        assert "http://b.com" in settings.cors_origins
        assert "http://c.com" in settings.cors_origins


def test_is_development_property() -> None:
    """Test is_development property returns correct value."""
    with patch.dict(os.environ, {"ENVIRONMENT": "development"}, clear=False):
        settings = Settings()
        assert settings.is_development is True
        assert settings.is_production is False


def test_is_production_property() -> None:
    """Test is_production property returns correct value."""
    with patch.dict(os.environ, {"ENVIRONMENT": "production"}, clear=False):
        settings = Settings()
        assert settings.is_production is True
        assert settings.is_development is False
