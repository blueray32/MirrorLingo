"""
Application configuration using pydantic-settings.

Centralized configuration management for the entire application.
All settings are loaded from environment variables with sensible defaults.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application-wide configuration.

    Settings are loaded from environment variables with fallback to defaults.
    The .env file is optional - the application will work with defaults.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra fields in .env
    )

    # Application Settings
    app_name: str = Field(
        default="Obsidian Agent Project",
        description="Name of the application",
    )
    version: str = Field(
        default="0.1.0",
        description="Application version",
    )
    environment: str = Field(
        default="development",
        description="Environment (development, staging, production)",
    )
    log_level: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)",
    )
    api_prefix: str = Field(
        default="/api",
        description="API route prefix",
    )

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5433/obsidian_db",
        description="Database connection URL (works with any PostgreSQL provider)",
    )

    # CORS Settings
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:8123",
        description="Comma-separated list of allowed CORS origins",
    )

    @property
    def cors_origins(self) -> list[str]:
        """Parse allowed_origins string into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Uses lru_cache to ensure settings are only loaded once.
    This is the recommended pattern for FastAPI dependencies.

    Returns:
        Settings instance with all configuration
    """
    return Settings()
