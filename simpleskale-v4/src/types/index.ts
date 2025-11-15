/**
 * SimpleSkale 4.0 - Type Definitions
 *
 * Core data model for embroidery design manipulation.
 * Based on the normalized internal model specified in the SimpleSkale Implementation Plan.
 */

/**
 * Base units: millimeters in logical design space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Stitch types supported by the system
 */
export type StitchType = "run" | "bean" | "satin" | "fill" | "jump" | "trim" | "stop" | "end";

/**
 * Individual stitch definition
 */
export interface Stitch {
  /** Position in mm */
  position: Point;
  /** Type of stitch */
  type: StitchType;
  /** Index into the thread/color list */
  colorIndex: number;
  /** Optional data for specific stitch types */
  data?: unknown;
}

/**
 * Group of stitches using the same color/thread
 */
export interface ColorBlock {
  /** Index into the thread/color list */
  colorIndex: number;
  /** All stitches in this color block */
  stitches: Stitch[];
}

/**
 * Thread/color definition
 */
export interface Thread {
  /** Color in hex format (e.g., "#FF0000") */
  color: string;
  /** Thread brand/type (e.g., "Robison-Anton") */
  brand?: string;
  /** Thread catalog number */
  catalogNumber?: string;
  /** Human-readable color name */
  colorName?: string;
}

/**
 * Machine profile defining constraints and capabilities
 */
export interface MachineProfile {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Maximum hoop width in mm */
  maxHoopWidthMm: number;
  /** Maximum hoop height in mm */
  maxHoopHeightMm: number;
  /** Maximum individual stitch length in mm */
  maxStitchLengthMm: number;
  /** Minimum individual stitch length in mm */
  minStitchLengthMm: number;
  /** Recommended maximum density (stitches per mm²) */
  recommendedMaxDensityStitchesPerMm2: number;
  /** Recommended minimum density (stitches per mm²) */
  recommendedMinDensityStitchesPerMm2: number;
  /** Safe mode enabled by default */
  safeModeDefault: boolean;
}

/**
 * Design document metadata
 */
export interface DesignMetadata {
  /** Original width before any scaling */
  originalWidthMm: number;
  /** Original height before any scaling */
  originalHeightMm: number;
  /** Current scale factor (1.0 = original size) */
  scaleFactor: number;
  /** Original stitch count */
  originalStitchCount: number;
  /** Current stitch count (after modifications) */
  currentStitchCount: number;
  /** Creation date */
  createdAt?: Date;
  /** Last modified date */
  modifiedAt?: Date;
  /** Original file name */
  fileName?: string;
}

/**
 * Complete embroidery design document
 */
export interface DesignDocument {
  /** Unique document ID */
  id: string;
  /** Display name */
  name: string;
  /** Original file format */
  originalFormat: "PES" | "DST" | "PEC" | string;
  /** Color blocks (ordered by execution) */
  colorBlocks: ColorBlock[];
  /** Thread list */
  threads: Thread[];
  /** Machine profile constraints */
  machineProfile: MachineProfile;
  /** Design metadata */
  metadata: DesignMetadata;
}

/**
 * Bounding box for design dimensions
 */
export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Validation severity levels
 */
export enum ValidationLevel {
  SAFE = "safe",
  WARNING = "warning",
  DANGER = "danger",
  CRITICAL = "critical",
}

/**
 * Validation result from safety checks
 */
export interface ValidationResult {
  /** Severity level */
  level: ValidationLevel;
  /** Human-readable message */
  message: string;
  /** Whether the operation can proceed */
  canProceed: boolean;
  /** Optional detailed explanation */
  details?: string;
}

/**
 * Scaling parameters
 */
export interface ScalingParams {
  /** Target scale factor (1.0 = original size) */
  scaleFactor?: number;
  /** Target width in mm */
  targetWidth?: number;
  /** Target height in mm */
  targetHeight?: number;
  /** Preserve aspect ratio */
  preserveAspectRatio: boolean;
}

/**
 * Density calculation result
 */
export interface DensityMetrics {
  /** Average stitch density (mm between stitches) */
  averageDensityMm: number;
  /** Stitches per mm² */
  stitchesPerMm2: number;
  /** Minimum stitch length found */
  minStitchLengthMm: number;
  /** Maximum stitch length found */
  maxStitchLengthMm: number;
  /** Total stitches counted */
  totalStitches: number;
}

/**
 * SimpleSkale engine configuration
 */
export interface SimpleSkaleConfig {
  /** Target stitch density in mm (default: 0.425) */
  targetDensityMm: number;
  /** Enable safe mode (enforce machine limits strictly) */
  safeMode: boolean;
  /** Machine profile to use */
  machineProfile: MachineProfile;
}

/**
 * Result of a SimpleSkale operation
 */
export interface SimpleSkaleResult {
  /** Success status */
  success: boolean;
  /** Modified design document */
  design?: DesignDocument;
  /** Validation results */
  validationResults: ValidationResult[];
  /** Density metrics before scaling */
  beforeMetrics: DensityMetrics;
  /** Density metrics after scaling */
  afterMetrics: DensityMetrics;
  /** Error message if failed */
  error?: string;
}

/**
 * Brother PP1 (Skitch) machine profile constants
 */
export const BROTHER_PP1_PROFILE: MachineProfile = {
  id: "brother-pp1",
  name: "Brother Skitch PP1",
  maxHoopWidthMm: 100,
  maxHoopHeightMm: 100,
  maxStitchLengthMm: 3.0, // Conservative for PP1
  minStitchLengthMm: 0.3,
  recommendedMaxDensityStitchesPerMm2: 15, // Very conservative
  recommendedMinDensityStitchesPerMm2: 2,
  safeModeDefault: true,
};

/**
 * Default machine profiles
 */
export const DEFAULT_PROFILES: Record<string, MachineProfile> = {
  "brother-pp1": BROTHER_PP1_PROFILE,
  // Add more profiles here as needed
};
