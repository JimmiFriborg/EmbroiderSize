/**
 * SimpleSkale 4.0 - Validation Engine
 *
 * Ported from Python validator.py with equivalent functionality.
 * Validates resize operations for safety and quality.
 */

import type { MachineProfile, ValidationLevel, ValidationResult } from "../types";
import { ValidationLevel as VLevel } from "../types";
import { calculateResizePercentage } from "../utils/calculations";

/**
 * Validation thresholds (ported from Python ResizeValidator)
 */
export const VALIDATION_THRESHOLDS = {
  SAFE_RESIZE_LIMIT: 20.0,
  WARNING_RESIZE_LIMIT: 30.0,
  CRITICAL_RESIZE_LIMIT: 50.0,
  MIN_STITCH_DENSITY: 0.2, // Too dense, may break needles
  OPTIMAL_DENSITY_MIN: 0.4,
  OPTIMAL_DENSITY_MAX: 0.45,
  MAX_STITCH_DENSITY: 1.0, // Too sparse, poor quality
} as const;

/**
 * Create a validation result
 */
function createValidationResult(
  level: ValidationLevel,
  message: string,
  canProceed: boolean = true,
  details?: string
): ValidationResult {
  return { level, message, canProceed, details };
}

/**
 * Validate resize percentage is within safe limits
 *
 * Ported from Python validate_resize_percentage()
 */
export function validateResizePercentage(
  originalSize: number,
  newSize: number
): ValidationResult {
  const percentChange = Math.abs(calculateResizePercentage(originalSize, newSize));

  if (percentChange <= VALIDATION_THRESHOLDS.SAFE_RESIZE_LIMIT) {
    return createValidationResult(
      VLevel.SAFE,
      `Resize of ${percentChange.toFixed(1)}% is within safe limits (±${VALIDATION_THRESHOLDS.SAFE_RESIZE_LIMIT}%)`
    );
  } else if (percentChange <= VALIDATION_THRESHOLDS.WARNING_RESIZE_LIMIT) {
    return createValidationResult(
      VLevel.WARNING,
      `Resize of ${percentChange.toFixed(1)}% may affect quality. Consider staying within ±${VALIDATION_THRESHOLDS.SAFE_RESIZE_LIMIT}%`,
      true,
      "This resize is outside the recommended safe range but should still produce acceptable results for most designs."
    );
  } else if (percentChange <= VALIDATION_THRESHOLDS.CRITICAL_RESIZE_LIMIT) {
    return createValidationResult(
      VLevel.DANGER,
      `Resize of ${percentChange.toFixed(1)}% is significant and may cause problems. Re-digitizing recommended for best results`,
      true,
      "At this scale, you may experience quality issues. Consider having the design professionally re-digitized."
    );
  } else {
    return createValidationResult(
      VLevel.CRITICAL,
      `Resize of ${percentChange.toFixed(1)}% is too extreme. Original design quality will be severely compromised`,
      false,
      "This resize is far outside safe limits. The result will likely be unusable. Professional re-digitizing is strongly recommended."
    );
  }
}

/**
 * Validate stitch density is within acceptable range
 *
 * Ported from Python validate_stitch_density()
 */
export function validateStitchDensity(densityMm: number): ValidationResult {
  if (densityMm < VALIDATION_THRESHOLDS.MIN_STITCH_DENSITY) {
    return createValidationResult(
      VLevel.CRITICAL,
      `Stitch density (${densityMm.toFixed(3)}mm) is too dense. May cause needle breaks or fabric damage`,
      false,
      "Stitches are too close together. This can break needles, damage fabric, and cause thread bunching."
    );
  } else if (densityMm < VALIDATION_THRESHOLDS.OPTIMAL_DENSITY_MIN) {
    return createValidationResult(
      VLevel.WARNING,
      `Stitch density (${densityMm.toFixed(3)}mm) is denser than optimal (${VALIDATION_THRESHOLDS.OPTIMAL_DENSITY_MIN}-${VALIDATION_THRESHOLDS.OPTIMAL_DENSITY_MAX}mm)`,
      true,
      "This density is higher than recommended but may work depending on fabric and thread type."
    );
  } else if (densityMm <= VALIDATION_THRESHOLDS.OPTIMAL_DENSITY_MAX) {
    return createValidationResult(
      VLevel.SAFE,
      `Stitch density (${densityMm.toFixed(3)}mm) is optimal`
    );
  } else if (densityMm <= VALIDATION_THRESHOLDS.MAX_STITCH_DENSITY) {
    return createValidationResult(
      VLevel.WARNING,
      `Stitch density (${densityMm.toFixed(3)}mm) is sparser than optimal (${VALIDATION_THRESHOLDS.OPTIMAL_DENSITY_MIN}-${VALIDATION_THRESHOLDS.OPTIMAL_DENSITY_MAX}mm)`,
      true,
      "This density is lower than recommended. The design may look sparse or have poor coverage."
    );
  } else {
    return createValidationResult(
      VLevel.DANGER,
      `Stitch density (${densityMm.toFixed(3)}mm) is too sparse. Quality will be poor`,
      true,
      "Stitches are too far apart. The design will have poor coverage and look unprofessional."
    );
  }
}

/**
 * Validate dimensions fit within machine constraints
 */
export function validateDimensions(
  width: number,
  height: number,
  machineProfile: MachineProfile
): ValidationResult {
  if (width > machineProfile.maxHoopWidthMm) {
    return createValidationResult(
      VLevel.CRITICAL,
      `Width (${width.toFixed(1)}mm) exceeds ${machineProfile.name} maximum (${machineProfile.maxHoopWidthMm}mm)`,
      false,
      `The design is too wide for your machine's hoop. Maximum width is ${machineProfile.maxHoopWidthMm}mm.`
    );
  }

  if (height > machineProfile.maxHoopHeightMm) {
    return createValidationResult(
      VLevel.CRITICAL,
      `Height (${height.toFixed(1)}mm) exceeds ${machineProfile.name} maximum (${machineProfile.maxHoopHeightMm}mm)`,
      false,
      `The design is too tall for your machine's hoop. Maximum height is ${machineProfile.maxHoopHeightMm}mm.`
    );
  }

  // Check if close to maximum (warn if within 5mm)
  const widthMargin = machineProfile.maxHoopWidthMm - width;
  const heightMargin = machineProfile.maxHoopHeightMm - height;

  if (widthMargin < 5 || heightMargin < 5) {
    return createValidationResult(
      VLevel.WARNING,
      `Design is close to ${machineProfile.name} hoop limits. Consider adding margin for safety`,
      true,
      `Leaving at least 5mm margin around your design helps with hooping and prevents edge issues.`
    );
  }

  return createValidationResult(
    VLevel.SAFE,
    `Dimensions (${width.toFixed(1)}mm × ${height.toFixed(1)}mm) fit within ${machineProfile.name} hoop`
  );
}

/**
 * Validate stitch length against machine constraints
 */
export function validateStitchLength(
  minLength: number,
  maxLength: number,
  machineProfile: MachineProfile
): ValidationResult {
  if (maxLength > machineProfile.maxStitchLengthMm) {
    return createValidationResult(
      VLevel.DANGER,
      `Maximum stitch length (${maxLength.toFixed(2)}mm) exceeds ${machineProfile.name} limit (${machineProfile.maxStitchLengthMm}mm)`,
      true,
      "Some stitches are longer than recommended. This may cause skipped stitches or poor quality."
    );
  }

  if (minLength < machineProfile.minStitchLengthMm) {
    return createValidationResult(
      VLevel.WARNING,
      `Minimum stitch length (${minLength.toFixed(2)}mm) is below ${machineProfile.name} recommendation (${machineProfile.minStitchLengthMm}mm)`,
      true,
      "Some stitches are very short. This may cause excessive density in some areas."
    );
  }

  return createValidationResult(
    VLevel.SAFE,
    `Stitch lengths are within ${machineProfile.name} acceptable range`
  );
}

/**
 * Run all validations for a resize operation
 *
 * Ported from Python validate_all()
 */
export function validateAll(params: {
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  newDensityMm?: number;
  minStitchLength?: number;
  maxStitchLength?: number;
  machineProfile: MachineProfile;
}): { canProceed: boolean; results: ValidationResult[] } {
  const {
    originalWidth,
    originalHeight,
    newWidth,
    newHeight,
    newDensityMm,
    minStitchLength,
    maxStitchLength,
    machineProfile,
  } = params;

  const results: ValidationResult[] = [];

  // Check width resize percentage
  const widthResult = validateResizePercentage(originalWidth, newWidth);
  results.push(widthResult);

  // Check height resize percentage
  const heightResult = validateResizePercentage(originalHeight, newHeight);
  results.push(heightResult);

  // Check stitch density if provided
  if (newDensityMm !== undefined) {
    const densityResult = validateStitchDensity(newDensityMm);
    results.push(densityResult);
  }

  // Check dimensions against machine constraints
  const dimensionResult = validateDimensions(newWidth, newHeight, machineProfile);
  results.push(dimensionResult);

  // Check stitch lengths if provided
  if (minStitchLength !== undefined && maxStitchLength !== undefined) {
    const lengthResult = validateStitchLength(minStitchLength, maxStitchLength, machineProfile);
    results.push(lengthResult);
  }

  // Determine if we can proceed (all validations must allow it)
  const canProceed = results.every((r) => r.canProceed);

  return { canProceed, results };
}

/**
 * Get validation summary for display
 */
export function getValidationSummary(results: ValidationResult[]): {
  hasCritical: boolean;
  hasDanger: boolean;
  hasWarning: boolean;
  isSafe: boolean;
  message: string;
} {
  const hasCritical = results.some((r) => r.level === VLevel.CRITICAL);
  const hasDanger = results.some((r) => r.level === VLevel.DANGER);
  const hasWarning = results.some((r) => r.level === VLevel.WARNING);
  const isSafe = results.every((r) => r.level === VLevel.SAFE);

  let message: string;
  if (hasCritical) {
    message = "⛔ CRITICAL: This resize is not recommended!";
  } else if (hasDanger) {
    message = "⚠️  WARNING: Proceed with caution!";
  } else if (hasWarning) {
    message = "⚠️  Some warnings detected. Review before proceeding.";
  } else {
    message = "✅ This resize should produce acceptable results.";
  }

  return { hasCritical, hasDanger, hasWarning, isSafe, message };
}
