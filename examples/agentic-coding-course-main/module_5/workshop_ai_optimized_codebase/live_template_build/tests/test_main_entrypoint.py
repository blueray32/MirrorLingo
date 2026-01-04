"""Tests for main() entry point function."""

from io import StringIO
from unittest.mock import patch

from main import main


class TestMainEntryPoint:
    """Test suite for main() function."""

    def test_main_runs_without_error(self) -> None:
        """Test that main() executes without raising errors."""
        # Capture stdout to avoid cluttering test output
        with patch("sys.stdout", new=StringIO()):
            main()

    def test_main_prints_expected_output(self) -> None:
        """Test that main() produces expected output."""
        # Capture stdout
        with patch("sys.stdout", new=StringIO()) as fake_out:
            main()
            output = fake_out.getvalue()

            # Verify key outputs are present
            assert "MyPy Type Checking Test" in output
            assert "Statistics for" in output
            assert "Count: 5" in output
            assert "Sum: 150.00" in output
            assert "Average: 30.00" in output
            assert "Empty dataset correctly returned None" in output
            assert "Division by zero correctly handled" in output

    def test_main_handles_process_data(self) -> None:
        """Test that main() correctly processes sample data."""
        with patch("sys.stdout", new=StringIO()) as fake_out:
            main()
            output = fake_out.getvalue()

            # Verify statistics calculation is correct
            assert "10.0 / 2.0 = 5.0" in output
