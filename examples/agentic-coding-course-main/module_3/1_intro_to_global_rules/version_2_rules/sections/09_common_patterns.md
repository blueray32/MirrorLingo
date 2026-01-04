# Common Patterns

## Backend Service with Logging
```python
def get_filtered_products(category: str | None = None) -> list[Product]:
    """Get products filtered by category."""
    logger.info("filtering_products_started", category=category)
    results = [p for p in _PRODUCTS_DATABASE if not category or p.product_category == category]
    logger.info("filtering_products_completed", total_results=len(results))
    return results
```

## Frontend API Fetch with Error Handling
```typescript
async function fetchProducts(): Promise<ProductListResponse> {
  logger.info("fetching_products", { endpoint: "/api/products" });
  try {
    const response = await fetch("/api/products");
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new ApiError(response.status, errorData);
    }
    const data: ProductListResponse = await response.json();
    logger.info("fetch_success", { total_count: data.total_count });
    return data;
  } catch (error) {
    logger.error("fetch_failed", { error_message: error instanceof Error ? error.message : "Unknown",
                                    fix_suggestion: "Check backend on http://localhost:8000" });
    throw error;
  }
}
```
