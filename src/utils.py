"""Utility functions for embroidery file manipulation."""

import math
from typing import Tuple, List


def calculate_pattern_bounds(pattern) -> Tuple[float, float, float, float]:
    """
    Calculate the bounding box of a pattern.

    Args:
        pattern: PyEmbroidery pattern object

    Returns:
        Tuple of (min_x, min_y, max_x, max_y) in 1/10mm units
    """
    if not pattern.stitches:
        return (0, 0, 0, 0)

    min_x = min(stitch[0] for stitch in pattern.stitches)
    max_x = max(stitch[0] for stitch in pattern.stitches)
    min_y = min(stitch[1] for stitch in pattern.stitches)
    max_y = max(stitch[1] for stitch in pattern.stitches)

    return (min_x, min_y, max_x, max_y)


def get_pattern_dimensions(pattern) -> Tuple[float, float]:
    """
    Get the width and height of a pattern in millimeters.

    Args:
        pattern: PyEmbroidery pattern object

    Returns:
        Tuple of (width_mm, height_mm)
    """
    min_x, min_y, max_x, max_y = calculate_pattern_bounds(pattern)
    width = (max_x - min_x) / 10.0  # Convert from 1/10mm to mm
    height = (max_y - min_y) / 10.0
    return (width, height)


def calculate_stitch_density(pattern) -> float:
    """
    Calculate the average stitch density (mm between stitches).

    Args:
        pattern: PyEmbroidery pattern object

    Returns:
        Average distance between stitches in millimeters
    """
    if len(pattern.stitches) < 2:
        return 0.0

    total_distance = 0.0
    stitch_count = 0

    for i in range(1, len(pattern.stitches)):
        x1, y1, cmd1 = pattern.stitches[i - 1]
        x2, y2, cmd2 = pattern.stitches[i]

        # Only count actual stitches, not jumps or trims
        if cmd2 & 0x01:  # STITCH command
            distance = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
            total_distance += distance
            stitch_count += 1

    if stitch_count == 0:
        return 0.0

    avg_distance_tenth_mm = total_distance / stitch_count
    return avg_distance_tenth_mm / 10.0  # Convert to mm


def count_stitches(pattern) -> int:
    """
    Count the number of actual stitches (excluding jumps and trims).

    Args:
        pattern: PyEmbroidery pattern object

    Returns:
        Number of stitches
    """
    count = 0
    for stitch in pattern.stitches:
        if len(stitch) >= 3 and stitch[2] & 0x01:  # STITCH command
            count += 1
    return count


def format_size(mm: float) -> str:
    """
    Format size in millimeters for display.

    Args:
        mm: Size in millimeters

    Returns:
        Formatted string with mm and inches
    """
    inches = mm / 25.4
    return f"{mm:.2f}mm ({inches:.2f}\")"


def calculate_resize_percentage(original: float, new: float) -> float:
    """
    Calculate the resize percentage.

    Args:
        original: Original size
        new: New size

    Returns:
        Percentage change (positive for increase, negative for decrease)
    """
    if original == 0:
        return 0
    return ((new - original) / original) * 100
