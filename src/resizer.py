"""Core embroidery resizing functionality."""

import pyembroidery
from typing import Optional, Tuple, Literal
from pathlib import Path
from .utils import (
    get_pattern_dimensions,
    calculate_stitch_density,
    count_stitches,
)
from .validator import ResizeValidator, ValidationLevel


class EmbroideryResizer:
    """Main class for resizing embroidery files."""

    def __init__(self):
        self.validator = ResizeValidator()
        self.pattern = None
        self.original_dimensions = None
        self.original_stitch_count = None
        self.original_density = None

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

        NOTE: This is a simplified implementation. For production use,
        consider using professional embroidery software or the pyembroidery
        library's more advanced features.

        Args:
            output_file: Path to output file
            target_width: Target width in mm (optional)
            target_height: Target height in mm (optional)
            scale_percent: Scale percentage (optional)
            target_density: Target stitch density in mm (optional, uses original if not specified)

        Returns:
            Dictionary with resize results
        """
        if not self.pattern:
            raise ValueError("No pattern loaded")

        # For now, use simple scaling with a note about density
        # A full smart resize would require:
        # 1. Scaling the pattern
        # 2. Analyzing stitch density
        # 3. Adding interpolated stitches where too sparse
        # 4. Removing stitches where too dense
        # 5. Preserving stitch types (satin, fill, etc.)

        result = self.resize_simple(output_file, target_width, target_height, scale_percent)
        result["method"] = "smart_resize (simplified)"
        result["note"] = "Smart resize is currently using simple scaling. For complex designs requiring density adjustment, consider professional re-digitizing."

        return result

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
