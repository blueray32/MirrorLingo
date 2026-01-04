# Testing

## Backend
- Tests mirror `app/` structure: `test_<module>.py`
- Fixtures in `tests/conftest.py`
- Verbose test names: `test_get_products_with_category_returns_filtered_list`

```python
def test_get_products_returns_200(test_client: TestClient) -> None:
    """Test that GET /api/products returns HTTP 200."""
    response = test_client.get("/api/products")
    assert response.status_code == 200
```

**Run:** `uv run pytest`
