"""
Comprehensive tests for main.py module.

Tests cover all functions including edge cases, error conditions,
and async test support using pytest-asyncio.
"""

import asyncio

import pytest

from main import (
    Statistics,
    calculate_average,
    calculate_sum,
    format_statistics,
    process_data,
    safe_divide,
)


class TestCalculateSum:
    """Test suite for calculate_sum function."""

    def test_sum_positive_numbers(self) -> None:
        """Test sum with positive numbers."""
        numbers = [1.0, 2.0, 3.0, 4.0, 5.0]
        assert calculate_sum(numbers) == 15.0

    def test_sum_negative_numbers(self) -> None:
        """Test sum with negative numbers."""
        numbers = [-1.0, -2.0, -3.0]
        assert calculate_sum(numbers) == -6.0

    def test_sum_mixed_numbers(self) -> None:
        """Test sum with mixed positive and negative numbers."""
        numbers = [-10.0, 5.0, 15.0, -5.0]
        assert calculate_sum(numbers) == 5.0

    def test_sum_single_number(self) -> None:
        """Test sum with a single number."""
        numbers = [42.0]
        assert calculate_sum(numbers) == 42.0

    def test_sum_empty_list(self) -> None:
        """Test sum with an empty list."""
        numbers: list[float] = []
        assert calculate_sum(numbers) == 0.0

    def test_sum_with_zero(self) -> None:
        """Test sum with zeros included."""
        numbers = [0.0, 1.0, 0.0, 2.0]
        assert calculate_sum(numbers) == 3.0

    def test_sum_decimal_precision(self) -> None:
        """Test sum maintains decimal precision."""
        numbers = [0.1, 0.2, 0.3]
        result = calculate_sum(numbers)
        assert abs(result - 0.6) < 1e-10


class TestCalculateAverage:
    """Test suite for calculate_average function."""

    def test_average_positive_numbers(self) -> None:
        """Test average with positive numbers."""
        numbers = [10.0, 20.0, 30.0, 40.0, 50.0]
        assert calculate_average(numbers) == 30.0

    def test_average_single_number(self) -> None:
        """Test average with a single number."""
        numbers = [42.0]
        assert calculate_average(numbers) == 42.0

    def test_average_negative_numbers(self) -> None:
        """Test average with negative numbers."""
        numbers = [-10.0, -20.0, -30.0]
        assert calculate_average(numbers) == -20.0

    def test_average_empty_list_raises_error(self) -> None:
        """Test that average raises ValueError for empty list."""
        numbers: list[float] = []
        with pytest.raises(ValueError, match="Cannot calculate average of empty list"):
            _ = calculate_average(numbers)

    def test_average_decimal_result(self) -> None:
        """Test average with decimal result."""
        numbers = [1.0, 2.0, 3.0]
        assert calculate_average(numbers) == 2.0


class TestProcessData:
    """Test suite for process_data function."""

    def test_process_valid_data(self) -> None:
        """Test processing valid data returns correct statistics."""
        data = [10.0, 20.0, 30.0, 40.0, 50.0]
        result = process_data(data)

        assert result is not None
        assert result["count"] == 5
        assert result["sum"] == 150.0
        assert result["average"] == 30.0
        assert result["min"] == 10.0
        assert result["max"] == 50.0

    def test_process_empty_data_returns_none(self) -> None:
        """Test processing empty data returns None."""
        data: list[float] = []
        result = process_data(data)
        assert result is None

    def test_process_single_value(self) -> None:
        """Test processing single value."""
        data = [42.0]
        result = process_data(data)

        assert result is not None
        assert result["count"] == 1
        assert result["sum"] == 42.0
        assert result["average"] == 42.0
        assert result["min"] == 42.0
        assert result["max"] == 42.0

    def test_process_negative_values(self) -> None:
        """Test processing negative values."""
        data = [-5.0, -10.0, -15.0]
        result = process_data(data)

        assert result is not None
        assert result["count"] == 3
        assert result["sum"] == -30.0
        assert result["average"] == -10.0
        assert result["min"] == -15.0
        assert result["max"] == -5.0

    def test_process_mixed_values(self) -> None:
        """Test processing mixed positive and negative values."""
        data = [-10.0, 0.0, 10.0]
        result = process_data(data)

        assert result is not None
        assert result["count"] == 3
        assert result["sum"] == 0.0
        assert result["average"] == 0.0
        assert result["min"] == -10.0
        assert result["max"] == 10.0


class TestFormatStatistics:
    """Test suite for format_statistics function."""

    def test_format_statistics_output(self) -> None:
        """Test formatting statistics produces correct output."""
        stats: Statistics = {
            "count": 5,
            "sum": 150.0,
            "average": 30.0,
            "min": 10.0,
            "max": 50.0,
        }

        result = format_statistics(stats)

        assert "Count: 5" in result
        assert "Sum: 150.00" in result
        assert "Average: 30.00" in result
        assert "Min: 10.00" in result
        assert "Max: 50.00" in result

    def test_format_statistics_decimal_precision(self) -> None:
        """Test formatting maintains 2 decimal precision."""
        stats: Statistics = {
            "count": 3,
            "sum": 6.666,
            "average": 2.222,
            "min": 1.111,
            "max": 3.333,
        }

        result = format_statistics(stats)

        assert "Sum: 6.67" in result
        assert "Average: 2.22" in result
        assert "Min: 1.11" in result
        assert "Max: 3.33" in result

    def test_format_statistics_multiline(self) -> None:
        """Test formatting produces multiline output."""
        stats: Statistics = {
            "count": 1,
            "sum": 1.0,
            "average": 1.0,
            "min": 1.0,
            "max": 1.0,
        }

        result = format_statistics(stats)
        lines = result.split("\n")

        assert len(lines) == 5


class TestSafeDivide:
    """Test suite for safe_divide function."""

    def test_safe_divide_normal_division(self) -> None:
        """Test safe division with normal numbers."""
        result = safe_divide(10.0, 2.0)
        assert result == 5.0

    def test_safe_divide_by_zero_returns_none(self) -> None:
        """Test division by zero returns None."""
        result = safe_divide(10.0, 0.0)
        assert result is None

    def test_safe_divide_negative_numbers(self) -> None:
        """Test safe division with negative numbers."""
        result = safe_divide(-10.0, 2.0)
        assert result == -5.0

    def test_safe_divide_decimal_result(self) -> None:
        """Test safe division with decimal result."""
        result = safe_divide(10.0, 3.0)
        assert result is not None
        assert abs(result - 3.333333) < 1e-5

    @pytest.mark.parametrize(
        "numerator,denominator,expected",
        [
            (100.0, 10.0, 10.0),
            (0.0, 5.0, 0.0),
            (7.0, 2.0, 3.5),
            (-20.0, 4.0, -5.0),
            (15.0, -3.0, -5.0),
        ],
    )
    def test_safe_divide_parametrized(
        self, numerator: float, denominator: float, expected: float
    ) -> None:
        """Test safe division with parametrized values."""
        result = safe_divide(numerator, denominator)
        assert result == expected


class TestAsyncSupport:
    """Test suite demonstrating async test support with pytest-asyncio."""

    async def test_async_function_support(self) -> None:
        """Test that async tests work with pytest-asyncio."""
        # Verify we have a running event loop
        loop = asyncio.get_running_loop()
        assert loop is not None

    async def test_async_with_delay(self) -> None:
        """Test async function with delay."""
        start = asyncio.get_event_loop().time()
        await asyncio.sleep(0.01)  # 10ms delay
        end = asyncio.get_event_loop().time()

        # Verify the delay occurred (allow for timing variance on different platforms)
        assert (end - start) >= 0.005  # At least 5ms (half of expected delay)

    async def test_async_calculate_sum(self) -> None:
        """Test calculate_sum in async context."""
        # Simulate async operation (e.g., loading data from async source)
        await asyncio.sleep(0.001)

        numbers = [1.0, 2.0, 3.0, 4.0, 5.0]
        result = calculate_sum(numbers)
        assert result == 15.0

    async def test_async_process_data(self) -> None:
        """Test process_data in async context."""
        # Simulate async operation
        await asyncio.sleep(0.001)

        data = [10.0, 20.0, 30.0]
        result = process_data(data)

        assert result is not None
        assert result["average"] == 20.0


class TestIntegration:
    """Integration tests combining multiple functions."""

    def test_full_statistics_pipeline(self) -> None:
        """Test complete pipeline from data to formatted output."""
        # Process data
        data = [5.0, 10.0, 15.0, 20.0, 25.0]
        stats = process_data(data)

        # Verify processing
        assert stats is not None

        # Format results
        formatted = format_statistics(stats)

        # Verify formatted output
        assert "Count: 5" in formatted
        assert "Sum: 75.00" in formatted
        assert "Average: 15.00" in formatted

    def test_edge_case_all_same_values(self) -> None:
        """Test statistics when all values are the same."""
        data = [5.0, 5.0, 5.0, 5.0, 5.0]
        stats = process_data(data)

        assert stats is not None
        assert stats["min"] == 5.0
        assert stats["max"] == 5.0
        assert stats["average"] == 5.0
        assert stats["sum"] == 25.0

    def test_edge_case_very_large_numbers(self) -> None:
        """Test with very large numbers."""
        data = [1e10, 2e10, 3e10]
        stats = process_data(data)

        assert stats is not None
        assert stats["sum"] == 6e10
        assert stats["average"] == 2e10

    def test_edge_case_very_small_numbers(self) -> None:
        """Test with very small numbers."""
        data = [1e-10, 2e-10, 3e-10]
        stats = process_data(data)

        assert stats is not None
        assert abs(stats["sum"] - 6e-10) < 1e-15
