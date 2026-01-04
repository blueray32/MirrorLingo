# Code Style

## Backend (Python)
- Naming: `snake_case` functions, `PascalCase` classes, verbose fields (`product_id`)
- Always include type hints and Google-style docstrings with examples

```python
def filter_products(category: str, min_price: Decimal) -> list[Product]:
    """
    Filter products by category and minimum price.

    Args:
        category: Product category to filter by
        min_price: Minimum price in USD (inclusive)

    Returns:
        List of Product objects matching criteria
    """
```

## Frontend (TypeScript)
- Naming: `PascalCase` components, `camelCase` functions, explicit types everywhere

```typescript
interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  // Implementation
}
```
