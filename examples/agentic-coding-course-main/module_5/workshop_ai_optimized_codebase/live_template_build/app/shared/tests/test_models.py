"""Tests for shared database model mixins."""

from collections.abc import Generator
from datetime import UTC, datetime
from typing import Any

import pytest
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base

from app.shared.models import TimestampMixin


Base: Any = declarative_base()


class TestModel(Base, TimestampMixin):  # type: ignore[misc, no-any-unimported]
    """Test model for TimestampMixin testing."""

    __tablename__ = "test_table"
    __allow_unmapped__ = True  # Allow legacy-style columns with mixins

    id = Column(Integer, primary_key=True)
    name = Column(String(50))


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Create in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = Session(engine)
    yield session
    session.close()


def test_timestamp_mixin_creates_columns() -> None:
    """Test that TimestampMixin creates created_at and updated_at columns."""
    # Verify columns exist
    assert hasattr(TestModel, "created_at")
    assert hasattr(TestModel, "updated_at")

    # Verify column types
    created_col_type = TestModel.created_at.property.columns[0].type
    assert created_col_type.__class__.__name__ == "DateTime"
    updated_col_type = TestModel.updated_at.property.columns[0].type
    assert updated_col_type.__class__.__name__ == "DateTime"


@pytest.mark.integration
def test_timestamps_set_on_creation(db_session: Session) -> None:
    """Test that timestamps are automatically set when creating a model."""
    # Create test instance
    before_create = datetime.now(UTC)
    test_obj = TestModel(name="test")
    db_session.add(test_obj)
    db_session.commit()
    after_create = datetime.now(UTC)

    # Verify timestamps are set
    assert test_obj.created_at is not None
    assert test_obj.updated_at is not None

    # Convert to timezone-aware if naive (SQLite returns naive datetimes)
    created_at = (
        test_obj.created_at.replace(tzinfo=UTC)
        if test_obj.created_at.tzinfo is None
        else test_obj.created_at
    )
    updated_at = (
        test_obj.updated_at.replace(tzinfo=UTC)
        if test_obj.updated_at.tzinfo is None
        else test_obj.updated_at
    )

    # Verify timestamps are in reasonable range
    assert before_create <= created_at <= after_create
    assert before_create <= updated_at <= after_create

    # Verify created_at and updated_at are initially the same
    assert test_obj.created_at == test_obj.updated_at


@pytest.mark.integration
def test_updated_at_changes_on_update(db_session: Session) -> None:
    """Test that updated_at changes when model is updated."""
    # Create test instance
    test_obj = TestModel(name="original")
    db_session.add(test_obj)
    db_session.commit()

    original_created_at = test_obj.created_at
    original_updated_at = test_obj.updated_at

    # Update the model
    import time

    time.sleep(0.01)  # Small delay to ensure timestamp difference
    test_obj.name = "updated"  # type: ignore[assignment]
    db_session.commit()
    db_session.refresh(test_obj)

    # Verify created_at stays the same
    assert test_obj.created_at == original_created_at

    # Verify updated_at has changed
    assert test_obj.updated_at != original_updated_at
    assert test_obj.updated_at > original_updated_at
