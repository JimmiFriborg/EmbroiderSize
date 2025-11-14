"""Core embroidery resizing functionality."""

import pyembroidery
from typing import Optional, Tuple, Literal
from pathlib import Path
import math
import copy
from .utils import (
    get_pattern_dimensions,
    calculate_stitch_density,
    count_stitches,
)
from .validator import ResizeValidator, ValidationLevel


class EmbroideryResizer:
    """Main class for resizing embroidery files."""

    # Optimal stitch density range (in mm between stitches)
    OPTIMAL_DENSITY_MIN = 0.4  # mm
    OPTIMAL_DENSITY_MAX = 0.45  # mm
    OPTIMAL_DENSITY_TARGET = 0.425  # mm (middle of range)

    def __init__(self):
        self.validator = ResizeValidator()
        self.pattern = None
        self.original_dimensions = None
        self.original_stitch_count = None
        self.original_density = None

    @staticmethod
    def _distance(x1, y1, x2, y2):
        """Calculate Euclidean distance between two points."""
        return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

    @staticmethod
    def _interpolate_stitch(stitch1, stitch2, t):
        """
        Interpolate between two stitches.

        Args:
            stitch1: First stitch (x, y, flags)
            stitch2: Second stitch (x, y, flags)
            t: Interpolation factor (0.0 to 1.0)

        Returns:
            New interpolated stitch
        """
        x1, y1 = stitch1[0], stitch1[1]
        x2, y2 = stitch2[0], stitch2[1]

        # Linear interpolation
        new_x = x1 + (x2 - x1) * t
        new_y = y1 + (y2 - y1) * t

        # Use first stitch's flags (usually STITCH)
        flags = stitch1[2] if len(stitch1) > 2 else pyembroidery.STITCH

        return (new_x, new_y, flags)

    def _add_interpolated_stitches(self, stitches, target_density_mm):
        """
        Add stitches between existing ones to maintain target density.

        Args:
            stitches: List of stitches
            target_density_mm: Target distance between stitches in mm

        Returns:
            New list of stitches with interpolated stitches added
        """
        if not stitches or len(stitches) < 2:
            return stitches

        new_stitches = []
        target_density_units = target_density_mm * 10  # Convert mm to pyembroidery units (1/10mm)

        for i in range(len(stitches) - 1):
            current = stitches[i]
            next_stitch = stitches[i + 1]

            # Always add the current stitch
            new_stitches.append(current)

            # Check if this is a special stitch (color change, jump, trim, etc.)
            flags = current[2] if len(current) > 2 else pyembroidery.STITCH
            is_special = flags & (pyembroidery.TRIM | pyembroidery.COLOR_CHANGE |
                                 pyembroidery.STOP | pyembroidery.END | pyembroidery.JUMP)

            # Don't interpolate between special stitches
            if is_special:
                continue

            # Calculate distance between stitches
            dist = self._distance(current[0], current[1], next_stitch[0], next_stitch[1])

            # If distance is too large, add interpolated stitches
            if dist > target_density_units * 1.5:  # Only interpolate if significantly larger
                num_new_stitches = int(dist / target_density_units)

                for j in range(1, num_new_stitches):
                    t = j / num_new_stitches
                    interpolated = self._interpolate_stitch(current, next_stitch, t)
                    new_stitches.append(interpolated)

        # Add the last stitch
        new_stitches.append(stitches[-1])

        return new_stitches

    def _remove_excess_stitches(self, stitches, target_density_mm):
        """
        Remove stitches that are too close together to maintain target density.

        Args:
            stitches: List of stitches
            target_density_mm: Target distance between stitches in mm

        Returns:
            New list of stitches with excess stitches removed
        """
        if not stitches or len(stitches) < 2:
            return stitches

        new_stitches = []
        target_density_units = target_density_mm * 10  # Convert mm to pyembroidery units (1/10mm)
        min_distance = target_density_units * 0.7  # Remove if closer than 70% of target

        new_stitches.append(stitches[0])  # Always keep first stitch

        for i in range(1, len(stitches)):
            current = stitches[i]
            prev = new_stitches[-1]

            # Check if this is a special stitch (color change, jump, trim, etc.)
            flags = current[2] if len(current) > 2 else pyembroidery.STITCH
            is_special = flags & (pyembroidery.TRIM | pyembroidery.COLOR_CHANGE |
                                 pyembroidery.STOP | pyembroidery.END)

            # Always keep special stitches
            if is_special:
                new_stitches.append(current)
                continue

            # Calculate distance from previous kept stitch
            dist = self._distance(prev[0], prev[1], current[0], current[1])

            # Only keep if distance is sufficient or it's a special stitch
            if dist >= min_distance:
                new_stitches.append(current)

        return new_stitches

    def load_pattern(self, input_file: str) -> bool:
        """
        Load an embroidery pattern from file.

        Args:
            input_file: Path to input embroidery file

        Returns:
            True if successful, False otherwise
        """
        try:
            self.pattern = pyembroidery.read(input_file)
            if not self.pattern or not self.pattern.stitches:
                raise ValueError("No stitches found in pattern")

            # Store original metrics
            self.original_dimensions = get_pattern_dimensions(self.pattern)
            self.original_stitch_count = count_stitches(self.pattern)
            self.original_density = calculate_stitch_density(self.pattern)

            return True
        except Exception as e:
            raise ValueError(f"Failed to load pattern: {e}")

    def get_pattern_info(self) -> dict:
        """
        Get information about the loaded pattern.

        Returns:
            Dictionary with pattern information
        """
        if not self.pattern:
            return {}

        width, height = self.original_dimensions
        return {
            "width_mm": width,
            "height_mm": height,
            "width_inch": width / 25.4,
            "height_inch": height / 25.4,
            "stitch_count": self.original_stitch_count,
            "thread_count": len(self.pattern.threadlist),
            "stitch_density_mm": self.original_density,
            "color_changes": sum(1 for s in self.pattern.stitches if len(s) >= 3 and s[2] & 0x10),
        }

    def calculate_scale_factor(
        self,
        target_width: Optional[float] = None,
        target_height: Optional[float] = None,
        scale_percent: Optional[float] = None,
    ) -> Tuple[float, float, float]:
        """
        Calculate the scale factor needed for resize.

        Args:
            target_width: Target width in mm (optional)
            target_height: Target height in mm (optional)
            scale_percent: Scale percentage (e.g., 150 for 150%) (optional)

        Returns:
            Tuple of (scale_factor, new_width, new_height)
        """
        if not self.original_dimensions:
            raise ValueError("No pattern loaded")

        orig_width, orig_height = self.original_dimensions

        if scale_percent is not None:
            scale = scale_percent / 100.0
            new_width = orig_width * scale
            new_height = orig_height * scale
        elif target_width is not None and target_height is not None:
            scale_w = target_width / orig_width
            scale_h = target_height / orig_height
            scale = (scale_w + scale_h) / 2  # Average scale
            new_width = target_width
            new_height = target_height
        elif target_width is not None:
            scale = target_width / orig_width
            new_width = target_width
            new_height = orig_height * scale
        elif target_height is not None:
            scale = target_height / orig_height
            new_width = orig_width * scale
            new_height = target_height
        else:
            raise ValueError("Must specify target_width, target_height, or scale_percent")

        return scale, new_width, new_height

    def validate_resize(
        self,
        new_width: float,
        new_height: float,
        new_density: Optional[float] = None,
    ) -> Tuple[bool, list]:
        """
        Validate the proposed resize operation.

        Args:
            new_width: New width in mm
            new_height: New height in mm
            new_density: Expected new stitch density (optional)

        Returns:
            Tuple of (can_proceed, list of ValidationResults)
        """
        if not self.original_dimensions:
            raise ValueError("No pattern loaded")

        orig_width, orig_height = self.original_dimensions

        return self.validator.validate_all(
            orig_width, orig_height, new_width, new_height, new_density
        )

    def resize_simple(
        self,
        output_file: str,
        target_width: Optional[float] = None,
        target_height: Optional[float] = None,
        scale_percent: Optional[float] = None,
    ) -> dict:
        """
        Resize using simple scaling (changes stitch density).

        This is faster but changes the stitch density. The stitch count
        remains the same, but the spacing between stitches changes.

        Args:
            output_file: Path to output file
            target_width: Target width in mm (optional)
            target_height: Target height in mm (optional)
            scale_percent: Scale percentage (optional)

        Returns:
            Dictionary with resize results
        """
        if not self.pattern:
            raise ValueError("No pattern loaded")

        # Calculate scale factor
        scale, new_width, new_height = self.calculate_scale_factor(
            target_width, target_height, scale_percent
        )

        # Validate resize
        new_density = self.original_density * scale if self.original_density else None
        can_proceed, validation_results = self.validate_resize(
            new_width, new_height, new_density
        )

        # Write the resized pattern
        pyembroidery.write(
            self.pattern,
            output_file,
            {"scale": scale}
        )

        return {
            "method": "simple_scale",
            "scale_factor": scale,
            "original_width": self.original_dimensions[0],
            "original_height": self.original_dimensions[1],
            "new_width": new_width,
            "new_height": new_height,
            "original_stitch_count": self.original_stitch_count,
            "new_stitch_count": self.original_stitch_count,  # Same for simple scale
            "original_density": self.original_density,
            "estimated_new_density": new_density,
            "validation_results": validation_results,
            "can_proceed": can_proceed,
        }

    def resize_smart(
        self,
        output_file: str,
        target_width: Optional[float] = None,
        target_height: Optional[float] = None,
        scale_percent: Optional[float] = None,
        target_density: Optional[float] = None,
    ) -> dict:
        """
        Resize with density preservation (adds/removes stitches).

        This method attempts to maintain optimal stitch density by
        intelligently adding or removing stitches. This is more complex
        but produces better quality results.

        Args:
            output_file: Path to output file
            target_width: Target width in mm (optional)
            target_height: Target height in mm (optional)
            scale_percent: Scale percentage (optional)
            target_density: Target stitch density in mm (optional, uses optimal if not specified)

        Returns:
            Dictionary with resize results
        """
        if not self.pattern:
            raise ValueError("No pattern loaded")

        # Calculate scale factor
        scale, new_width, new_height = self.calculate_scale_factor(
            target_width, target_height, scale_percent
        )

        # Determine target density (use optimal if not specified)
        if target_density is None:
            target_density = self.OPTIMAL_DENSITY_TARGET

        # Validate resize
        new_density_simple = self.original_density * scale if self.original_density else None
        can_proceed, validation_results = self.validate_resize(
            new_width, new_height, new_density_simple
        )

        # Create a deep copy of the pattern to modify
        scaled_pattern = copy.deepcopy(self.pattern)

        # Step 1: Scale all stitch coordinates
        scaled_stitches = []
        for stitch in scaled_pattern.stitches:
            if len(stitch) >= 2:
                x, y = stitch[0], stitch[1]
                flags = stitch[2] if len(stitch) > 2 else pyembroidery.STITCH
                scaled_x = x * scale
                scaled_y = y * scale
                scaled_stitches.append((scaled_x, scaled_y, flags))
            else:
                scaled_stitches.append(stitch)

        # Step 2: Adjust stitch density
        if scale > 1.0:
            # Scaling up - add interpolated stitches to maintain density
            final_stitches = self._add_interpolated_stitches(scaled_stitches, target_density)
            method_detail = "upscaled with stitch interpolation"
        elif scale < 1.0:
            # Scaling down - remove excess stitches to maintain density
            final_stitches = self._remove_excess_stitches(scaled_stitches, target_density)
            method_detail = "downscaled with stitch reduction"
        else:
            # No scaling needed
            final_stitches = scaled_stitches
            method_detail = "no scaling needed"

        # Step 3: Create new pattern with modified stitches
        output_pattern = pyembroidery.EmbPattern()

        # Copy thread list
        for thread in scaled_pattern.threadlist:
            output_pattern.add_thread(thread)

        # Add modified stitches
        for stitch in final_stitches:
            if len(stitch) >= 3:
                output_pattern.add_stitch_absolute(stitch[0], stitch[1], stitch[2])
            elif len(stitch) >= 2:
                output_pattern.add_stitch_absolute(stitch[0], stitch[1], pyembroidery.STITCH)

        # Step 4: Write the output file
        pyembroidery.write(output_pattern, output_file)

        # Calculate final stitch count and estimated density
        final_stitch_count = len(final_stitches)
        estimated_final_density = target_density

        return {
            "method": f"smart_resize ({method_detail})",
            "scale_factor": scale,
            "original_width": self.original_dimensions[0],
            "original_height": self.original_dimensions[1],
            "new_width": new_width,
            "new_height": new_height,
            "original_stitch_count": self.original_stitch_count,
            "new_stitch_count": final_stitch_count,
            "original_density": self.original_density,
            "new_density": estimated_final_density,
            "estimated_new_density": estimated_final_density,
            "validation_results": validation_results,
            "can_proceed": can_proceed,
            "note": f"Smart resize completed: {method_detail}. " +
                   f"Stitch count changed from {self.original_stitch_count:,} to {final_stitch_count:,} " +
                   f"to maintain optimal density of ~{target_density:.2f}mm.",
        }

    def resize(
        self,
        output_file: str,
        target_width: Optional[float] = None,
        target_height: Optional[float] = None,
        scale_percent: Optional[float] = None,
        mode: Literal["simple", "smart"] = "simple",
    ) -> dict:
        """
        Resize the embroidery pattern.

        Args:
            output_file: Path to output file
            target_width: Target width in mm (optional)
            target_height: Target height in mm (optional)
            scale_percent: Scale percentage (optional)
            mode: Resize mode - 'simple' or 'smart'

        Returns:
            Dictionary with resize results
        """
        if mode == "smart":
            return self.resize_smart(output_file, target_width, target_height, scale_percent)
        else:
            return self.resize_simple(output_file, target_width, target_height, scale_percent)
