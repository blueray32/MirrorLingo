"""Application configuration settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class ApplicationSettings(BaseSettings):
    """
    Application-wide configuration settings.

    These settings can be overridden via environment variables.
    For example, LOG_LEVEL=DEBUG will set the logging level to DEBUG.

    Attributes:
        application_name: Display name of the application
        application_version: Semantic version number
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        enable_cors: Whether to enable CORS (Cross-Origin Resource Sharing)
        supabase_url: Supabase project URL
        supabase_key: Supabase anonymous API key
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    application_name: str = "Product Catalog API"
    application_version: str = "0.1.0"
    log_level: str = "INFO"
    enable_cors: bool = True
    supabase_url: str = ""
    supabase_key: str = ""


# Global settings instance
settings = ApplicationSettings()
