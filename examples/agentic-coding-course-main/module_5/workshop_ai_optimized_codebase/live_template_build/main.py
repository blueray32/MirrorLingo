"""
MyPy Configuration Test Module.

This module tests various MyPy type checking rules to ensure
the configuration is working correctly for AI-optimized type safety.
"""

from typing import TypedDict


class Statistics(TypedDict):
    """Statistics data structure."""

    count: int
    sum: float
    average: float
    min: float
    max: float


def calculate_sum(numbers: list[float]) -> float:
    """
    Calculate the sum of a list of numbers.

    Args:
        numbers: List of numbers to sum

    Returns:
        The total sum of all numbers
    """
    total: float = 0.0
    for num in numbers:
        total = total + num
    return total


def calculate_average(numbers: list[float]) -> float:
    """
    Calculate the average of a list of numbers.

    Args:
        numbers: List of numbers

    Returns:
        The average value

    Raises:
        ValueError: If the list is empty
    """
    if len(numbers) == 0:
        raise ValueError("Cannot calculate average of empty list")
    return calculate_sum(numbers) / len(numbers)


def process_data(data: list[float]) -> Statistics | None:
    """
    Process data and return statistics.

    Args:
        data: List of numeric data to process

    Returns:
        Statistics dictionary if data is non-empty, None otherwise
    """
    if len(data) == 0:
        return None

    result: Statistics = {
        "count": len(data),
        "sum": calculate_sum(data),
        "average": calculate_average(data),
        "min": min(data),
        "max": max(data),
    }
    return result


def format_statistics(stats: Statistics) -> str:
    """
    Format statistics dictionary as a string.

    Args:
        stats: Statistics dictionary to format

    Returns:
        Formatted string representation
    """
    return (
        f"Count: {stats['count']}\n"
        f"Sum: {stats['sum']:.2f}\n"
        f"Average: {stats['average']:.2f}\n"
        f"Min: {stats['min']:.2f}\n"
        f"Max: {stats['max']:.2f}"
    )


def safe_divide(numerator: float, denominator: float) -> float | None:
    """
    Safely divide two numbers.

    Args:
        numerator: The number to divide
        denominator: The number to divide by

    Returns:
        The result of division, or None if denominator is zero
    """
    if denominator == 0:
        return None
    return numerator / denominator


def main() -> None:
    """Main entry point for the application."""
    print("MyPy Type Checking Test")
    print("=" * 40)

    # Test with valid data
    sample_numbers: list[float] = [10.0, 20.0, 30.0, 40.0, 50.0]
    stats: Statistics | None = process_data(sample_numbers)

    if stats is not None:
        print(f"\nStatistics for {sample_numbers}:")
        print(format_statistics(stats))
    else:
        print("No statistics available (empty dataset)")

    # Test with empty data
    empty_data: list[float] = []
    empty_stats: Statistics | None = process_data(empty_data)

    if empty_stats is None:
        print("\nEmpty dataset correctly returned None")

    # Test safe division
    result: float | None = safe_divide(10.0, 2.0)
    if result is not None:
        print(f"\n10.0 / 2.0 = {result}")

    zero_result: float | None = safe_divide(10.0, 0.0)
    if zero_result is None:
        print("Division by zero correctly handled")


if __name__ == "__main__":
    main()
