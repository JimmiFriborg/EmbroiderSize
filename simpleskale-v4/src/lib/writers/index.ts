/**
 * SimpleSkale 4.0 - File Writers
 *
 * Export embroidery file format writers (PES, DST).
 */

import type { DesignDocument } from "../../types";
import { writePES } from "./pes";
import { writeDST } from "./dst";

export { writePES } from "./pes";
export { writeDST } from "./dst";

/**
 * Write embroidery file with auto-detection of format
 */
export function writeEmbroideryFile(
  design: DesignDocument,
  fileName: string
): ArrayBuffer {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pes":
      return writePES(design);
    case "dst":
      return writeDST(design);
    default:
      // Default to PES format
      console.warn(`Unknown format '${ext}', defaulting to PES`);
      return writePES(design);
  }
}

/**
 * Get appropriate file extension for design format
 */
export function getFileExtension(design: DesignDocument): string {
  const format = design.originalFormat.toLowerCase();
  if (format === "dst") return "dst";
  return "pes"; // Default to PES
}
