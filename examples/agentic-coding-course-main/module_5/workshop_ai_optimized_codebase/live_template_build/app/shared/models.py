"""Shared database model mixins.

Contains base mixins used across all feature models.
"""

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr


def _utcnow() -> datetime:
    """Get current UTC time as timezone-aware datetime."""
    return datetime.now(UTC)


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps.

    Automatically adds timestamp columns to any SQLAlchemy model.
    All models should inherit this mixin for consistent timestamp tracking.

    Example:
        class Product(Base, TimestampMixin):
            __tablename__ = "products"
            id = Column(Integer, primary_key=True)
    """

    @declared_attr
    def created_at(cls):  # type: ignore[no-untyped-def]  # noqa: N805
        """Timestamp when the record was created."""
        return Column(DateTime, default=_utcnow, nullable=False)

    @declared_attr
    def updated_at(cls):  # type: ignore[no-untyped-def]  # noqa: N805
        """Timestamp when the record was last updated."""
        return Column(
            DateTime,
            default=_utcnow,
            onupdate=_utcnow,
            nullable=False,
        )
