"""Validation and safety checks for embroidery file resizing."""

from enum import Enum
from typing import Tuple, Optional
from .utils import calculate_resize_percentage


class ValidationLevel(Enum):
    """Validation severity levels."""
    SAFE = "safe"
    WARNING = "warning"
    DANGER = "danger"
    CRITICAL = "critical"


class ValidationResult:
    """Result of a validation check."""

    def __init__(self, level: ValidationLevel, message: str, can_proceed: bool = True):
        self.level = level
        self.message = message
        self.can_proceed = can_proceed

    def __str__(self):
        return f"[{self.level.value.upper()}] {self.message}"


class ResizeValidator:
    """Validator for embroidery resize operations."""

    # Safe resize limits (percentage)
    SAFE_RESIZE_LIMIT = 20.0
    WARNING_RESIZE_LIMIT = 30.0
    CRITICAL_RESIZE_LIMIT = 50.0

    # Stitch density limits (mm)
    MIN_STITCH_DENSITY = 0.2  # Too dense, may break needles
    OPTIMAL_STITCH_DENSITY_MIN = 0.4
    OPTIMAL_STITCH_DENSITY_MAX = 0.45
    MAX_STITCH_DENSITY = 1.0  # Too sparse, poor quality

    def __init__(self):
        self.results = []

    def validate_resize_percentage(
        self, original_size: float, new_size: float
    ) -> ValidationResult:
        """
        Validate the resize percentage is within safe limits.

        Args:
            original_size: Original dimension
            new_size: New dimension

        Returns:
            ValidationResult
        """
        percent_change = abs(calculate_resize_percentage(original_size, new_size))

        if percent_change <= self.SAFE_RESIZE_LIMIT:
            return ValidationResult(
                ValidationLevel.SAFE,
                f"Resize of {percent_change:.1f}% is within safe limits (±{self.SAFE_RESIZE_LIMIT}%)",
            )
        elif percent_change <= self.WARNING_RESIZE_LIMIT:
            return ValidationResult(
                ValidationLevel.WARNING,
                f"Resize of {percent_change:.1f}% may affect quality. Consider staying within ±{self.SAFE_RESIZE_LIMIT}%",
            )
        elif percent_change <= self.CRITICAL_RESIZE_LIMIT:
            return ValidationResult(
                ValidationLevel.DANGER,
                f"Resize of {percent_change:.1f}% is significant and may cause problems. Re-digitizing recommended for best results",
            )
        else:
            return ValidationResult(
                ValidationLevel.CRITICAL,
                f"Resize of {percent_change:.1f}% is too extreme. Original design quality will be severely compromised",
                can_proceed=False,
            )

    def validate_stitch_density(self, density: float) -> ValidationResult:
        """
        Validate stitch density is within acceptable range.

        Args:
            density: Average stitch density in mm

        Returns:
            ValidationResult
        """
        if density < self.MIN_STITCH_DENSITY:
            return ValidationResult(
                ValidationLevel.CRITICAL,
                f"Stitch density ({density:.3f}mm) is too dense. May cause needle breaks or fabric damage",
                can_proceed=False,
            )
        elif density < self.OPTIMAL_STITCH_DENSITY_MIN:
            return ValidationResult(
                ValidationLevel.WARNING,
                f"Stitch density ({density:.3f}mm) is denser than optimal ({self.OPTIMAL_STITCH_DENSITY_MIN}-{self.OPTIMAL_STITCH_DENSITY_MAX}mm)",
            )
        elif density <= self.OPTIMAL_STITCH_DENSITY_MAX:
            return ValidationResult(
                ValidationLevel.SAFE,
                f"Stitch density ({density:.3f}mm) is optimal",
            )
        elif density <= self.MAX_STITCH_DENSITY:
            return ValidationResult(
                ValidationLevel.WARNING,
                f"Stitch density ({density:.3f}mm) is sparser than optimal ({self.OPTIMAL_STITCH_DENSITY_MIN}-{self.OPTIMAL_STITCH_DENSITY_MAX}mm)",
            )
        else:
            return ValidationResult(
                ValidationLevel.DANGER,
                f"Stitch density ({density:.3f}mm) is too sparse. Quality will be poor",
            )

    def validate_dimensions(
        self, width: float, height: float, max_width: Optional[float] = None, max_height: Optional[float] = None
    ) -> ValidationResult:
        """
        Validate pattern dimensions fit within constraints.

        Args:
            width: Pattern width in mm
            height: Pattern height in mm
            max_width: Maximum allowed width in mm (optional)
            max_height: Maximum allowed height in mm (optional)

        Returns:
            ValidationResult
        """
        if max_width and width > max_width:
            return ValidationResult(
                ValidationLevel.CRITICAL,
                f"Width ({width:.1f}mm) exceeds maximum ({max_width:.1f}mm)",
                can_proceed=False,
            )

        if max_height and height > max_height:
            return ValidationResult(
                ValidationLevel.CRITICAL,
                f"Height ({height:.1f}mm) exceeds maximum ({max_height:.1f}mm)",
                can_proceed=False,
            )

        return ValidationResult(
            ValidationLevel.SAFE,
            f"Dimensions ({width:.1f}mm × {height:.1f}mm) are valid",
        )

    def validate_all(
        self,
        original_width: float,
        original_height: float,
        new_width: float,
        new_height: float,
        stitch_density: Optional[float] = None,
    ) -> Tuple[bool, list]:
        """
        Run all validations.

        Args:
            original_width: Original width in mm
            original_height: Original height in mm
            new_width: New width in mm
            new_height: New height in mm
            stitch_density: Stitch density in mm (optional)

        Returns:
            Tuple of (can_proceed, list of ValidationResults)
        """
        results = []

        # Check width resize
        width_result = self.validate_resize_percentage(original_width, new_width)
        results.append(width_result)

        # Check height resize
        height_result = self.validate_resize_percentage(original_height, new_height)
        results.append(height_result)

        # Check stitch density if provided
        if stitch_density is not None:
            density_result = self.validate_stitch_density(stitch_density)
            results.append(density_result)

        # Determine if we can proceed
        can_proceed = all(r.can_proceed for r in results)

        return can_proceed, results
