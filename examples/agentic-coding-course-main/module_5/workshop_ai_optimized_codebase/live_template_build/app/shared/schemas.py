"""Shared Pydantic schemas.

Contains common request/response schemas used across features.
"""

import math
from typing import Generic, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class PaginationParams(BaseModel):
    """Standard pagination parameters for list endpoints.

    Example:
        params = PaginationParams(page=2, page_size=50)
        offset = params.offset  # Returns 50
    """

    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        """Calculate database offset from page number.

        Returns:
            The number of records to skip
        """
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):  # noqa: UP046
    """Standard paginated response format.

    Generic response wrapper for paginated list endpoints.
    Provides consistent pagination metadata across all features.

    Example:
        response = PaginatedResponse(
            items=[product1, product2],
            total=100,
            page=1,
            page_size=20
        )
        # total_pages will be automatically calculated as 5
    """

    items: list[T]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        """Calculate total number of pages.

        Returns:
            Total pages rounded up from total/page_size
        """
        return math.ceil(self.total / self.page_size) if self.page_size > 0 else 0


class ErrorResponse(BaseModel):
    """Standard error response format.

    Used by exception handlers to provide consistent error responses.

    Example:
        ErrorResponse(
            error="Product not found",
            type="NotFoundError",
            detail="Product with ID 123 does not exist"
        )
    """

    error: str
    type: str
    detail: str | None = None
