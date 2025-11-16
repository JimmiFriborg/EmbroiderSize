/**
 * SimpleSkale 4.0 - Density Heatmap
 *
 * Calculates and visualizes stitch density across the design.
 */

import type { ColorBlock, DesignDocument } from "../types";

export interface HeatmapCell {
  x: number;
  y: number;
  stitchCount: number;
  density: number; // stitches per mm²
  color: string; // Heat color (green -> yellow -> red)
}

export interface HeatmapGrid {
  cells: HeatmapCell[][];
  gridSizeMm: number;
  rows: number;
  cols: number;
  minDensity: number;
  maxDensity: number;
  avgDensity: number;
}

/**
 * Calculate density heatmap for a design
 */
export function calculateDensityHeatmap(
  design: DesignDocument,
  gridSizeMm: number = 5 // 5mm x 5mm grid cells
): HeatmapGrid {
  // Calculate design bounds
  const bounds = calculateBounds(design.colorBlocks);

  // Create grid dimensions
  const cols = Math.ceil((bounds.maxX - bounds.minX) / gridSizeMm);
  const rows = Math.ceil((bounds.maxY - bounds.minY) / gridSizeMm);

  // Initialize grid
  const cells: HeatmapCell[][] = [];
  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
      cells[row][col] = {
        x: bounds.minX + col * gridSizeMm,
        y: bounds.minY + row * gridSizeMm,
        stitchCount: 0,
        density: 0,
        color: "#00ff00", // Default green (low density)
      };
    }
  }

  // Count stitches in each cell
  for (const block of design.colorBlocks) {
    for (const stitch of block.stitches) {
      const col = Math.floor((stitch.position.x - bounds.minX) / gridSizeMm);
      const row = Math.floor((stitch.position.y - bounds.minY) / gridSizeMm);

      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        cells[row][col].stitchCount++;
      }
    }
  }

  // Calculate densities and colors
  const cellAreaMm2 = gridSizeMm * gridSizeMm;
  let minDensity = Infinity;
  let maxDensity = -Infinity;
  let totalDensity = 0;
  let cellsWithStitches = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = cells[row][col];
      cell.density = cell.stitchCount / cellAreaMm2;

      if (cell.stitchCount > 0) {
        minDensity = Math.min(minDensity, cell.density);
        maxDensity = Math.max(maxDensity, cell.density);
        totalDensity += cell.density;
        cellsWithStitches++;
      }

      // Assign heat color based on density
      cell.color = getDensityColor(cell.density);
    }
  }

  const avgDensity = cellsWithStitches > 0 ? totalDensity / cellsWithStitches : 0;

  return {
    cells,
    gridSizeMm,
    rows,
    cols,
    minDensity: minDensity === Infinity ? 0 : minDensity,
    maxDensity: maxDensity === -Infinity ? 0 : maxDensity,
    avgDensity,
  };
}

/**
 * Get color for density value
 * Green (low) -> Yellow (medium) -> Orange -> Red (high)
 */
export function getDensityColor(density: number): string {
  // Density thresholds (stitches per mm²)
  const LOW = 5; // < 5: Safe (green)
  const MEDIUM = 10; // 5-10: Warning (yellow)
  const HIGH = 15; // 10-15: Caution (orange)
  // > 15: Danger (red)

  if (density === 0) {
    return "transparent";
  } else if (density < LOW) {
    // Green to yellow (safe to warning)
    const ratio = density / LOW;
    return interpolateColor("#00ff00", "#ffff00", ratio);
  } else if (density < MEDIUM) {
    // Yellow to orange (warning to caution)
    const ratio = (density - LOW) / (MEDIUM - LOW);
    return interpolateColor("#ffff00", "#ff8800", ratio);
  } else if (density < HIGH) {
    // Orange to red (caution to danger)
    const ratio = (density - MEDIUM) / (HIGH - MEDIUM);
    return interpolateColor("#ff8800", "#ff0000", ratio);
  } else {
    // Deep red (critical)
    return "#cc0000";
  }
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

  return rgbToHex(r, g, b);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Calculate design bounds
 */
function calculateBounds(colorBlocks: ColorBlock[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const block of colorBlocks) {
    for (const stitch of block.stitches) {
      minX = Math.min(minX, stitch.position.x);
      minY = Math.min(minY, stitch.position.y);
      maxX = Math.max(maxX, stitch.position.x);
      maxY = Math.max(maxY, stitch.position.y);
    }
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Get density level description
 */
export function getDensityLevel(density: number): {
  level: "safe" | "warning" | "caution" | "danger";
  description: string;
} {
  if (density < 5) {
    return { level: "safe", description: "Safe density" };
  } else if (density < 10) {
    return { level: "warning", description: "Moderate density" };
  } else if (density < 15) {
    return { level: "caution", description: "High density - may cause issues" };
  } else {
    return { level: "danger", description: "Critical density - likely to fail" };
  }
}
