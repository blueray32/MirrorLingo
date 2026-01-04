# Logging (Structured JSON)

## Backend
```python
from app.core.logging_config import StructuredLogger
logger = StructuredLogger(__name__)

logger.info("filtering_products", filter_category="electronics", total_results=15)
logger.error("validation_failed", error_type="invalid_price_range",
             fix_suggestion="Ensure min_price_usd <= max_price_usd")
```

## Frontend
```typescript
import { logger } from "@/lib/logger";

logger.info("fetching_products", { endpoint: "/api/products" });
logger.error("fetch_failed", { error_message: err.message,
                                fix_suggestion: "Check backend server" });
```
