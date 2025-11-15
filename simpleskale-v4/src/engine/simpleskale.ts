/**
 * SimpleSkale 4.0 - Core Scaling Engine
 *
 * Implements the SimpleSkale algorithm for safe embroidery file scaling.
 * Ported from Python resizer.py with density-preserving stitch interpolation/reduction.
 */

import type {
  ColorBlock,
  DesignDocument,
  Point,
  ScalingParams,
  SimpleSkaleConfig,
  SimpleSkaleResult,
  Stitch,
  StitchType,
} from "../types";
import { calculateDensityMetrics, calculateScaleFactor, distance, interpolatePoint } from "../utils/calculations";
import { validateAll } from "./validator";

/**
 * Optimal stitch density constants (same as Python)
 */
export const OPTIMAL_DENSITY = {
  MIN: 0.4, // mm
  MAX: 0.45, // mm
  TARGET: 0.425, // mm (middle of range)
} as const;

/**
 * SimpleSkale Engine
 * Main class for performing density-preserving embroidery scaling
 */
export class SimpleSkaleEngine {
  private config: SimpleSkaleConfig;

  constructor(config?: Partial<SimpleSkaleConfig>) {
    this.config = {
      targetDensityMm: config?.targetDensityMm ?? OPTIMAL_DENSITY.TARGET,
      safeMode: config?.safeMode ?? true,
      machineProfile: config?.machineProfile ?? (null as any), // Will be set from design
    };
  }

  /**
   * Apply scaling to a design document
   *
   * Ported from Python resize_smart() in resizer.py
   */
  applyScaling(design: DesignDocument, params: ScalingParams): SimpleSkaleResult {
    // Update config with design's machine profile
    this.config.machineProfile = design.machineProfile;

    // Calculate scale factor
    const { scale, newWidth, newHeight } = calculateScaleFactor(
      design.metadata.originalWidthMm,
      design.metadata.originalHeightMm,
      {
        targetWidth: params.targetWidth,
        targetHeight: params.targetHeight,
        scalePercent: params.scalePercent,
        preserveAspectRatio: params.preserveAspectRatio,
      }
    );

    // Calculate metrics before scaling
    const beforeMetrics = calculateDensityMetrics(design.colorBlocks);

    // Estimate new density after simple scaling
    const estimatedDensity = beforeMetrics.averageDensityMm * scale;

    // Validate the scaling operation
    const { canProceed, results: validationResults } = validateAll({
      originalWidth: design.metadata.originalWidthMm,
      originalHeight: design.metadata.originalHeightMm,
      newWidth,
      newHeight,
      newDensityMm: estimatedDensity,
      minStitchLength: beforeMetrics.minStitchLengthMm * scale,
      maxStitchLength: beforeMetrics.maxStitchLengthMm * scale,
      machineProfile: this.config.machineProfile,
    });

    // In safe mode, block if validation fails
    if (this.config.safeMode && !canProceed) {
      return {
        success: false,
        validationResults,
        beforeMetrics,
        afterMetrics: beforeMetrics, // No change
        error: "Scaling operation blocked by safe mode. Validation failed.",
      };
    }

    // Step 1: Scale all stitch coordinates
    const scaledBlocks = this.scaleCoordinates(design.colorBlocks, scale);

    // Step 2: Adjust stitch density
    let finalBlocks: ColorBlock[];
    if (scale > 1.0) {
      // Upscaling - add interpolated stitches
      finalBlocks = this.addInterpolatedStitches(scaledBlocks, this.config.targetDensityMm);
    } else if (scale < 1.0) {
      // Downscaling - remove excess stitches
      finalBlocks = this.removeExcessStitches(scaledBlocks, this.config.targetDensityMm);
    } else {
      // No scaling needed
      finalBlocks = scaledBlocks;
    }

    // Calculate final metrics
    const afterMetrics = calculateDensityMetrics(finalBlocks);

    // Create scaled design document
    const scaledDesign: DesignDocument = {
      ...design,
      id: crypto.randomUUID(), // New ID for scaled design
      colorBlocks: finalBlocks,
      metadata: {
        ...design.metadata,
        originalWidthMm: design.metadata.originalWidthMm, // Keep original
        originalHeightMm: design.metadata.originalHeightMm,
        scaleFactor: scale,
        currentStitchCount: afterMetrics.totalStitches,
        modifiedAt: new Date(),
      },
    };

    return {
      success: true,
      design: scaledDesign,
      validationResults,
      beforeMetrics,
      afterMetrics,
    };
  }

  /**
   * Scale stitch coordinates by a factor
   *
   * Ported from Python resizer.py:391-401
   */
  private scaleCoordinates(colorBlocks: ColorBlock[], scale: number): ColorBlock[] {
    return colorBlocks.map((block) => ({
      ...block,
      stitches: block.stitches.map((stitch) => ({
        ...stitch,
        position: {
          x: stitch.position.x * scale,
          y: stitch.position.y * scale,
        },
      })),
    }));
  }

  /**
   * Add interpolated stitches to maintain density (for upscaling)
   *
   * Ported from Python _add_interpolated_stitches() in resizer.py:61-109
   */
  private addInterpolatedStitches(colorBlocks: ColorBlock[], targetDensityMm: number): ColorBlock[] {
    const targetDensityUnits = targetDensityMm * 10; // Convert mm to 1/10mm units

    return colorBlocks.map((block) => {
      if (block.stitches.length < 2) return block;

      const newStitches: Stitch[] = [];

      for (let i = 0; i < block.stitches.length - 1; i++) {
        const current = block.stitches[i];
        const next = block.stitches[i + 1];

        // Always add current stitch
        newStitches.push(current);

        // Check if this is a special stitch (don't interpolate)
        if (this.isSpecialStitch(current.type)) {
          continue;
        }

        // Calculate distance
        const dist = distance(current.position, next.position);

        // If distance is significantly larger than target, add interpolated stitches
        if (dist > targetDensityUnits * 1.5) {
          const numNewStitches = Math.floor(dist / targetDensityUnits);

          for (let j = 1; j < numNewStitches; j++) {
            const t = j / numNewStitches;
            const interpolatedPos = interpolatePoint(current.position, next.position, t);

            newStitches.push({
              position: interpolatedPos,
              type: current.type, // Use same type as current stitch
              colorIndex: current.colorIndex,
            });
          }
        }
      }

      // Add the last stitch
      if (block.stitches.length > 0) {
        newStitches.push(block.stitches[block.stitches.length - 1]);
      }

      return {
        ...block,
        stitches: newStitches,
      };
    });
  }

  /**
   * Remove excess stitches to maintain density (for downscaling)
   *
   * Ported from Python _remove_excess_stitches() in resizer.py:111-152
   */
  private removeExcessStitches(colorBlocks: ColorBlock[], targetDensityMm: number): ColorBlock[] {
    const targetDensityUnits = targetDensityMm * 10; // Convert mm to 1/10mm units
    const minDistance = targetDensityUnits * 0.7; // Remove if closer than 70% of target

    return colorBlocks.map((block) => {
      if (block.stitches.length < 2) return block;

      const newStitches: Stitch[] = [];

      // Always keep first stitch
      newStitches.push(block.stitches[0]);

      for (let i = 1; i < block.stitches.length; i++) {
        const current = block.stitches[i];
        const prev = newStitches[newStitches.length - 1];

        // Always keep special stitches
        if (this.isSpecialStitch(current.type)) {
          newStitches.push(current);
          continue;
        }

        // Calculate distance from previous kept stitch
        const dist = distance(prev.position, current.position);

        // Only keep if distance is sufficient
        if (dist >= minDistance) {
          newStitches.push(current);
        }
      }

      return {
        ...block,
        stitches: newStitches,
      };
    });
  }

  /**
   * Check if a stitch type is special (shouldn't be interpolated/removed)
   */
  private isSpecialStitch(type: StitchType): boolean {
    return type === "trim" || type === "stop" || type === "end" || type === "jump";
  }
}

/**
 * Convenience function to scale a design
 */
export function scaleDesign(design: DesignDocument, params: ScalingParams, config?: Partial<SimpleSkaleConfig>): SimpleSkaleResult {
  const engine = new SimpleSkaleEngine(config);
  return engine.applyScaling(design, params);
}
