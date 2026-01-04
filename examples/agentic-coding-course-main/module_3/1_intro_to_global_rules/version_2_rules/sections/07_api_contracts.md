# API Contracts (Backend ↔ Frontend Must Match)

## Models
```python
# Backend
class Product(BaseModel):
    product_id: int = Field(..., gt=0)
    product_name: str = Field(..., min_length=1, max_length=200)
    product_price_usd: Decimal = Field(..., gt=0, decimal_places=2)
```

```typescript
// Frontend (matching exactly)
interface Product {
  product_id: number;
  product_name: string;
  product_price_usd: string; // Decimal → string
}
```

## Error Handling
```python
# Backend
class ErrorResponse(BaseModel):
    error_code: str
    error_message: str
    error_details: dict[str, Any] | None = None
    timestamp_utc: str
```

```typescript
// Frontend
interface ErrorResponse {
  error_code: string;
  error_message: string;
  error_details?: Record<string, unknown>;
  timestamp_utc: string;
}

class ApiError extends Error {
  constructor(public readonly statusCode: number,
              public readonly errorResponse: ErrorResponse) {
    super(errorResponse.error_message);
  }
}
```
