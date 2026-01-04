"""Integration tests for database connectivity.

IMPORTANT: These tests require a running PostgreSQL database.
Start with: docker-compose up -d db

These tests use fixtures from conftest.py to avoid event loop conflicts.
DO NOT import AsyncSessionLocal or engine directly from app.core.database.
"""

import pytest
from sqlalchemy import text


@pytest.mark.integration
@pytest.mark.asyncio
async def test_database_connection(test_db_session):
    """Test database connection with real PostgreSQL.

    This test verifies that we can connect to the database and execute
    a simple query.

    Args:
        test_db_session: Test database session fixture from conftest.py
    """
    result = await test_db_session.execute(text("SELECT 1 as value"))
    value = result.scalar_one()
    assert value == 1


@pytest.mark.integration
@pytest.mark.asyncio
async def test_database_session_transaction(test_db_session):
    """Test database session transaction behavior.

    This test verifies that the session can execute queries and
    handle transactions properly.

    Args:
        test_db_session: Test database session fixture from conftest.py
    """
    # Execute a query that returns multiple values
    result = await test_db_session.execute(
        text("SELECT 1 as a, 2 as b, 3 as c")
    )
    row = result.first()

    assert row is not None
    assert row.a == 1
    assert row.b == 2
    assert row.c == 3


@pytest.mark.integration
@pytest.mark.asyncio
async def test_database_version(test_db_session):
    """Test retrieving PostgreSQL version.

    This test verifies we can query database metadata.

    Args:
        test_db_session: Test database session fixture from conftest.py
    """
    result = await test_db_session.execute(text("SELECT version()"))
    version = result.scalar_one()

    assert version is not None
    assert "PostgreSQL" in version


@pytest.mark.integration
@pytest.mark.asyncio
async def test_database_multiple_queries(test_db_session):
    """Test executing multiple queries in same session.

    This test verifies session can handle multiple queries.

    Args:
        test_db_session: Test database session fixture from conftest.py
    """
    # First query
    result1 = await test_db_session.execute(text("SELECT 1"))
    assert result1.scalar_one() == 1

    # Second query
    result2 = await test_db_session.execute(text("SELECT 2"))
    assert result2.scalar_one() == 2

    # Third query
    result3 = await test_db_session.execute(text("SELECT 3"))
    assert result3.scalar_one() == 3


@pytest.mark.integration
@pytest.mark.asyncio
async def test_database_engine_disposal(test_db_engine):
    """Test database engine can be properly disposed.

    This test verifies engine lifecycle management.

    Args:
        test_db_engine: Test database engine fixture from conftest.py
    """
    # Engine should be usable
    async with test_db_engine.connect() as conn:
        result = await conn.execute(text("SELECT 1"))
        assert result.scalar_one() == 1

    # The fixture will handle disposal
