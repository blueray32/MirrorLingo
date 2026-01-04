"""Tests for shared Pydantic schemas."""

from pydantic import ValidationError
import pytest

from app.shared.schemas import ErrorResponse, PaginatedResponse, PaginationParams


def test_pagination_params_defaults() -> None:
    """Test PaginationParams uses correct default values."""
    params = PaginationParams()

    assert params.page == 1
    assert params.page_size == 20


def test_pagination_params_validation_page_minimum() -> None:
    """Test PaginationParams validates page >= 1."""
    # Valid: page = 1
    params = PaginationParams(page=1)
    assert params.page == 1

    # Invalid: page = 0
    with pytest.raises(ValidationError) as exc_info:
        _ = PaginationParams(page=0)
    assert "greater than or equal to 1" in str(exc_info.value).lower()

    # Invalid: page = -1
    with pytest.raises(ValidationError) as exc_info:
        _ = PaginationParams(page=-1)
    assert "greater than or equal to 1" in str(exc_info.value).lower()


def test_pagination_params_validation_page_size_range() -> None:
    """Test PaginationParams validates page_size between 1 and 100."""
    # Valid: page_size = 1
    params = PaginationParams(page_size=1)
    assert params.page_size == 1

    # Valid: page_size = 100
    params = PaginationParams(page_size=100)
    assert params.page_size == 100

    # Invalid: page_size = 0
    with pytest.raises(ValidationError) as exc_info:
        _ = PaginationParams(page_size=0)
    assert "greater than or equal to 1" in str(exc_info.value).lower()

    # Invalid: page_size = 101
    with pytest.raises(ValidationError) as exc_info:
        _ = PaginationParams(page_size=101)
    assert "less than or equal to 100" in str(exc_info.value).lower()


def test_pagination_params_offset_calculation() -> None:
    """Test PaginationParams.offset property calculates correctly."""
    # Page 1: offset should be 0
    params = PaginationParams(page=1, page_size=20)
    assert params.offset == 0

    # Page 2: offset should be 20
    params = PaginationParams(page=2, page_size=20)
    assert params.offset == 20

    # Page 3: offset should be 40
    params = PaginationParams(page=3, page_size=20)
    assert params.offset == 40

    # Different page_size
    params = PaginationParams(page=5, page_size=50)
    assert params.offset == 200


def test_paginated_response_structure() -> None:
    """Test PaginatedResponse structure with mock data."""
    from pydantic import BaseModel

    class Item(BaseModel):
        """Mock item for testing."""

        id: int
        name: str

    items = [Item(id=1, name="item1"), Item(id=2, name="item2")]
    response = PaginatedResponse[Item](items=items, total=100, page=1, page_size=20)

    assert response.items == items
    assert response.total == 100
    assert response.page == 1
    assert response.page_size == 20


def test_paginated_response_total_pages_calculation() -> None:
    """Test PaginatedResponse.total_pages property calculates correctly."""
    from pydantic import BaseModel

    class Item(BaseModel):
        """Mock item for testing."""

        id: int

    # Exact division: 100 items, 20 per page = 5 pages
    response = PaginatedResponse[Item](items=[], total=100, page=1, page_size=20)
    assert response.total_pages == 5

    # Rounded up: 95 items, 20 per page = 5 pages (rounded from 4.75)
    response = PaginatedResponse[Item](items=[], total=95, page=1, page_size=20)
    assert response.total_pages == 5

    # Single item
    response = PaginatedResponse[Item](items=[], total=1, page=1, page_size=20)
    assert response.total_pages == 1

    # No items
    response = PaginatedResponse[Item](items=[], total=0, page=1, page_size=20)
    assert response.total_pages == 0

    # Different page size
    response = PaginatedResponse[Item](items=[], total=250, page=1, page_size=50)
    assert response.total_pages == 5


def test_paginated_response_total_pages_edge_case() -> None:
    """Test PaginatedResponse.total_pages handles edge cases."""
    from pydantic import BaseModel

    class Item(BaseModel):
        """Mock item for testing."""

        id: int

    # Edge case: page_size = 1
    response = PaginatedResponse[Item](items=[], total=10, page=1, page_size=1)
    assert response.total_pages == 10


def test_error_response_structure() -> None:
    """Test ErrorResponse structure and optional detail field."""
    # With detail
    error = ErrorResponse(
        error="Not found", type="NotFoundError", detail="Resource ID 123"
    )
    assert error.error == "Not found"
    assert error.type == "NotFoundError"
    assert error.detail == "Resource ID 123"

    # Without detail
    error = ErrorResponse(error="Bad request", type="ValidationError")
    assert error.error == "Bad request"
    assert error.type == "ValidationError"
    assert error.detail is None
