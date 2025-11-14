"""Tests for the embroidery resizer module."""

import pytest
import pyembroidery
from src.resizer import EmbroideryResizer
from src.utils import calculate_stitch_density, get_pattern_dimensions


def create_test_pattern():
    """Create a simple test pattern."""
    pattern = pyembroidery.EmbPattern()

    # Create a simple 10mm x 10mm square
    # PyEmbroidery uses 1/10mm units
    pattern.add_stitch_absolute(pyembroidery.STITCH, 0, 0)
    pattern.add_stitch_absolute(pyembroidery.STITCH, 100, 0)
    pattern.add_stitch_absolute(pyembroidery.STITCH, 100, 100)
    pattern.add_stitch_absolute(pyembroidery.STITCH, 0, 100)
    pattern.add_stitch_absolute(pyembroidery.STITCH, 0, 0)
    pattern.add_stitch_absolute(pyembroidery.END, 0, 0)

    return pattern


def test_pattern_dimensions():
    """Test pattern dimension calculation."""
    pattern = create_test_pattern()
    width, height = get_pattern_dimensions(pattern)

    # Should be 10mm x 10mm
    assert abs(width - 10.0) < 0.1
    assert abs(height - 10.0) < 0.1


def test_scale_factor_calculation():
    """Test scale factor calculation."""
    resizer = EmbroideryResizer()
    pattern = create_test_pattern()

    # Save pattern to temp file and load
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pes", delete=False) as tmp:
        pyembroidery.write(pattern, tmp.name)
        resizer.load_pattern(tmp.name)

        # Test scale by percentage
        scale, new_w, new_h = resizer.calculate_scale_factor(scale_percent=200)
        assert abs(scale - 2.0) < 0.01
        assert abs(new_w - 20.0) < 0.1
        assert abs(new_h - 20.0) < 0.1

        # Test scale by width
        scale, new_w, new_h = resizer.calculate_scale_factor(target_width=20.0)
        assert abs(scale - 2.0) < 0.01

        # Clean up
        import os
        os.unlink(tmp.name)


def test_validation():
    """Test resize validation."""
    resizer = EmbroideryResizer()
    pattern = create_test_pattern()

    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pes", delete=False) as tmp:
        pyembroidery.write(pattern, tmp.name)
        resizer.load_pattern(tmp.name)

        # Test safe resize (within 20%)
        can_proceed, results = resizer.validate_resize(11.0, 11.0)
        assert can_proceed

        # Test warning resize (over 20% but under 50%)
        can_proceed, results = resizer.validate_resize(15.0, 15.0)
        # Should still be able to proceed but with warnings
        assert isinstance(results, list)

        # Clean up
        import os
        os.unlink(tmp.name)


if __name__ == "__main__":
    pytest.main([__file__])
