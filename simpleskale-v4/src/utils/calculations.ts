/**
 * SimpleSkale 4.0 - Calculation Utilities
 *
 * Ported from Python utils.py with equivalent functionality.
 */

import type { BoundingBox, ColorBlock, DensityMetrics, Point, Stitch } from "../types";

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the bounding box of a set of stitches
 *
 * @param stitches - Array of stitches
 * @returns Bounding box with min/max coordinates and width/height
 */
export function calculateBoundingBox(stitches: Stitch[]): BoundingBox {
  if (stitches.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stitch of stitches) {
    const { x, y } = stitch.position;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  return { minX, minY, maxX, maxY, width, height };
}

/**
 * Calculate bounding box from color blocks
 */
export function calculateDesignBounds(colorBlocks: ColorBlock[]): BoundingBox {
  const allStitches = colorBlocks.flatMap((block) => block.stitches);
  return calculateBoundingBox(allStitches);
}

/**
 * Calculate stitch density and related metrics
 *
 * Ported from Python calculate_stitch_density() in utils.py
 *
 * @param colorBlocks - Color blocks to analyze
 * @returns Density metrics
 */
export function calculateDensityMetrics(colorBlocks: ColorBlock[]): DensityMetrics {
  const allStitches = colorBlocks.flatMap((block) => block.stitches);

  if (allStitches.length < 2) {
    return {
      averageDensityMm: 0,
      stitchesPerMm2: 0,
      minStitchLengthMm: 0,
      maxStitchLengthMm: 0,
      totalStitches: allStitches.length,
    };
  }

  let totalDistance = 0;
  let stitchCount = 0;
  let minLength = Infinity;
  let maxLength = -Infinity;

  // Calculate distances between consecutive stitches
  // Skip jump and trim stitches for density calculation
  for (const block of colorBlocks) {
    for (let i = 1; i < block.stitches.length; i++) {
      const prev = block.stitches[i - 1];
      const curr = block.stitches[i];

      // Only count actual stitches, not jumps or trims
      if (curr.type === "jump" || curr.type === "trim" || curr.type === "stop") {
        continue;
      }

      const dist = distance(prev.position, curr.position);
      totalDistance += dist;
      stitchCount++;

      minLength = Math.min(minLength, dist);
      maxLength = Math.max(maxLength, dist);
    }
  }

  if (stitchCount === 0) {
    return {
      averageDensityMm: 0,
      stitchesPerMm2: 0,
      minStitchLengthMm: 0,
      maxStitchLengthMm: 0,
      totalStitches: allStitches.length,
    };
  }

  const averageDensityMm = totalDistance / stitchCount;

  // Calculate stitches per mm²
  const bounds = calculateBoundingBox(allStitches);
  const areaMm2 = bounds.width * bounds.height;
  const stitchesPerMm2 = areaMm2 > 0 ? allStitches.length / areaMm2 : 0;

  return {
    averageDensityMm,
    stitchesPerMm2,
    minStitchLengthMm: minLength === Infinity ? 0 : minLength,
    maxStitchLengthMm: maxLength === -Infinity ? 0 : maxLength,
    totalStitches: allStitches.length,
  };
}

/**
 * Count actual stitches (excluding jumps and trims)
 */
export function countActualStitches(colorBlocks: ColorBlock[]): number {
  let count = 0;
  for (const block of colorBlocks) {
    for (const stitch of block.stitches) {
      if (stitch.type !== "jump" && stitch.type !== "trim" && stitch.type !== "stop") {
        count++;
      }
    }
  }
  return count;
}

/**
 * Calculate resize percentage
 *
 * Ported from Python calculate_resize_percentage() in utils.py
 */
export function calculateResizePercentage(original: number, newSize: number): number {
  if (original === 0) {
    return 0;
  }
  return ((newSize - original) / original) * 100;
}

/**
 * Format size in millimeters for display
 */
export function formatSize(mm: number): string {
  const inches = mm / 25.4;
  return `${mm.toFixed(2)}mm (${inches.toFixed(2)}")`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Convert millimeters to inches
 */
export function mmToInches(mm: number): number {
  return mm / 25.4;
}

/**
 * Convert inches to millimeters
 */
export function inchesToMm(inches: number): number {
  return inches * 25.4;
}

/**
 * Interpolate between two points
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @param t - Interpolation factor (0.0 to 1.0)
 * @returns Interpolated point
 */
export function interpolatePoint(p1: Point, p2: Point, t: number): Point {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

/**
 * Calculate scale factor from target dimensions
 *
 * Ported from Python calculate_scale_factor() in resizer.py
 */
export function calculateScaleFactor(
  originalWidth: number,
  originalHeight: number,
  params: {
    targetWidth?: number;
    targetHeight?: number;
    scalePercent?: number;
    preserveAspectRatio?: boolean;
  }
): { scale: number; newWidth: number; newHeight: number } {
  const { targetWidth, targetHeight, scalePercent, preserveAspectRatio = true } = params;

  if (scalePercent !== undefined) {
    const scale = scalePercent / 100.0;
    return {
      scale,
      newWidth: originalWidth * scale,
      newHeight: originalHeight * scale,
    };
  }

  if (targetWidth !== undefined && targetHeight !== undefined) {
    const scaleW = targetWidth / originalWidth;
    const scaleH = targetHeight / originalHeight;

    if (preserveAspectRatio) {
      // Use the smaller scale to fit within bounds (prevents distortion)
      const scale = Math.min(scaleW, scaleH);
      return {
        scale,
        newWidth: originalWidth * scale,
        newHeight: originalHeight * scale,
      };
    } else {
      // Non-uniform scaling (may distort the design)
      const scale = (scaleW + scaleH) / 2; // Average for reporting
      return {
        scale,
        newWidth: targetWidth,
        newHeight: targetHeight,
      };
    }
  }

  if (targetWidth !== undefined) {
    const scale = targetWidth / originalWidth;
    return {
      scale,
      newWidth: targetWidth,
      newHeight: originalHeight * scale,
    };
  }

  if (targetHeight !== undefined) {
    const scale = targetHeight / originalHeight;
    return {
      scale,
      newWidth: originalWidth * scale,
      newHeight: targetHeight,
    };
  }

  throw new Error("Must specify targetWidth, targetHeight, or scalePercent");
}
