/**
 * SimpleSkale 4.0 - File Parsers
 *
 * Export all file format parsers.
 */

export { parsePES, isPESFile, getPESVersion } from "./pes";
export { parseDST, isDSTFile, getDSTMetadata } from "./dst";

import type { DesignDocument } from "../../types";
import { parsePES, isPESFile } from "./pes";
import { parseDST, isDSTFile } from "./dst";

/**
 * Auto-detect and parse embroidery file
 *
 * @param buffer - ArrayBuffer containing file data
 * @param fileName - Optional file name (used for format detection if provided)
 * @returns Parsed design document
 * @throws Error if format is not supported
 */
export function parseEmbroideryFile(buffer: ArrayBuffer, fileName?: string): DesignDocument {
  // Try to detect format from file extension
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pes':
        return parsePES(buffer, fileName);
      case 'dst':
        return parseDST(buffer, fileName);
    }
  }

  // Try to detect format from file content
  if (isPESFile(buffer)) {
    return parsePES(buffer, fileName);
  }

  if (isDSTFile(buffer)) {
    return parseDST(buffer, fileName);
  }

  throw new Error("Unsupported embroidery file format. Supported formats: PES, DST");
}

/**
 * Detect embroidery file format
 *
 * @param buffer - ArrayBuffer containing file data
 * @returns Format name or null if unknown
 */
export function detectFormat(buffer: ArrayBuffer): "PES" | "DST" | null {
  if (isPESFile(buffer)) return "PES";
  if (isDSTFile(buffer)) return "DST";
  return null;
}
