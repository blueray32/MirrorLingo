"""Database configuration and session management.

This module provides async SQLAlchemy setup with provider-agnostic PostgreSQL support.
Works with any PostgreSQL provider: Docker, Supabase, Neon, Railway, etc.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


# Get settings
settings = get_settings()

# Create async engine
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,  # Test connections before using
    pool_size=5,
    max_overflow=10,
    echo=settings.environment == "development",
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Base class for SQLAlchemy models
class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session.

    Yields:
        AsyncSession: Database session that will be automatically closed.

    Example:
        ```python
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
        ```
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
