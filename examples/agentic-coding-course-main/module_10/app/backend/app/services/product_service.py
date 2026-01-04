"""
Product service containing business logic for product operations.

This service layer separates business logic from API routing logic,
making the code more testable and maintainable.
"""

from decimal import Decimal

from app.core.database import get_supabase_client
from app.core.logging_config import StructuredLogger
from app.data.seed_products import get_seed_products
from app.models.product import Product

# Initialize structured logger for this module
logger = StructuredLogger(__name__)


def get_all_products() -> list[Product]:
    """
    Retrieve all products from the catalog.

    This function first attempts to fetch products from Supabase.
    If Supabase is not configured or an error occurs, it falls back
    to the seed products for backwards compatibility.

    Returns:
        List of all Product objects in the catalog

    Example:
        >>> products = get_all_products()
        >>> len(products)
        30
        >>> products[0].product_name
        'Wireless Bluetooth Mouse'
    """
    # Try to get products from Supabase
    supabase = get_supabase_client()

    if supabase is not None:
        try:
            logger.info(
                "fetching_products_from_supabase",
                operation="get_all_products",
            )

            response = supabase.table("products").select("*").execute()

            # Transform response data to Product objects
            products = [
                Product(
                    product_id=row["product_id"],
                    product_name=row["product_name"],
                    product_description=row["product_description"],
                    product_price_usd=Decimal(str(row["product_price_usd"])),
                    product_category=row["product_category"],
                    product_in_stock=row["product_in_stock"],
                )
                for row in response.data
            ]

            logger.info(
                "products_retrieved_from_supabase",
                products_returned=len(products),
                operation="get_all_products",
            )

            return products

        except Exception as e:
            logger.warning(
                "supabase_query_failed_falling_back_to_seed_data",
                error=str(e),
                operation="get_all_products",
            )

    # Fallback to seed products if Supabase not configured or query failed
    seed_products = get_seed_products()

    logger.info(
        "retrieving_all_products_from_seed_data",
        total_products_in_database=len(seed_products),
        operation="get_all_products",
    )

    logger.info(
        "products_retrieved_successfully",
        products_returned=len(seed_products),
        operation="get_all_products",
    )

    return seed_products
