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


def test_aspect_ratio_preserved_by_default():
    """Test that aspect ratio is preserved by default when both dimensions specified."""
    resizer = EmbroideryResizer()
    pattern = create_test_pattern()

    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pes", delete=False) as tmp:
        pyembroidery.write(pattern, tmp.name)
        resizer.load_pattern(tmp.name)

        # Original is 10x10, request 20x30 (different aspect ratio)
        scale, new_width, new_height = resizer.calculate_scale_factor(
            target_width=20.0,
            target_height=30.0,
            preserve_aspect_ratio=True
        )

        # Should use smaller scale (2.0 for width) to preserve aspect ratio
        assert abs(scale - 2.0) < 0.01
        assert abs(new_width - 20.0) < 0.1
        assert abs(new_height - 20.0) < 0.1  # Not 30.0!

        # Clean up
        import os
        os.unlink(tmp.name)


def test_aspect_ratio_can_be_disabled():
    """Test that aspect ratio preservation can be disabled."""
    resizer = EmbroideryResizer()
    pattern = create_test_pattern()

    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pes", delete=False) as tmp:
        pyembroidery.write(pattern, tmp.name)
        resizer.load_pattern(tmp.name)

        # Request 20mm x 30mm with aspect ratio preservation disabled
        scale, new_width, new_height = resizer.calculate_scale_factor(
            target_width=20.0,
            target_height=30.0,
            preserve_aspect_ratio=False
        )

        # Should allow distortion
        assert abs(new_width - 20.0) < 0.1
        assert abs(new_height - 30.0) < 0.1
        assert abs(scale - 2.5) < 0.01  # Average of 2.0 and 3.0

        # Clean up
        import os
        os.unlink(tmp.name)


def test_aspect_ratio_fit_within_bounds():
    """Test that design fits within specified bounds when aspect preserved."""
    resizer = EmbroideryResizer()
    pattern = create_test_pattern()

    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pes", delete=False) as tmp:
        pyembroidery.write(pattern, tmp.name)
        resizer.load_pattern(tmp.name)

        # Original is 10x10, request 100x20 bounds
        scale, new_width, new_height = resizer.calculate_scale_factor(
            target_width=100.0,
            target_height=20.0,
            preserve_aspect_ratio=True
        )

        # Should use height scale (2.0) which is smaller
        assert abs(scale - 2.0) < 0.01
        assert abs(new_width - 20.0) < 0.1
        assert abs(new_height - 20.0) < 0.1

        # Verify it fits within bounds
        assert new_width <= 100.0
        assert new_height <= 20.0

        # Clean up
        import os
        os.unlink(tmp.name)


if __name__ == "__main__":
    pytest.main([__file__])
