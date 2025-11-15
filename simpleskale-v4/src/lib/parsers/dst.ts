/**
 * SimpleSkale 4.0 - DST File Parser
 *
 * Parser for Tajima DST embroidery file format.
 * DST is one of the most common embroidery formats.
 *
 * Format reference: https://www.fileformat.wiki/misc/dst/
 */

import type { ColorBlock, DesignDocument, StitchType, Thread } from "../../types";
import { BROTHER_PP1_PROFILE } from "../../types";
import { BinaryReader } from "../binary";

/**
 * DST format constants
 */
const DST_HEADER_SIZE = 512;

/**
 * Default thread colors for DST files (DST doesn't store colors)
 */
const DEFAULT_DST_COLORS: Thread[] = [
  { color: "#000000", colorName: "Black" },
  { color: "#ff0000", colorName: "Red" },
  { color: "#0000ff", colorName: "Blue" },
  { color: "#00ff00", colorName: "Green" },
  { color: "#ffff00", colorName: "Yellow" },
  { color: "#ff00ff", colorName: "Magenta" },
  { color: "#00ffff", colorName: "Cyan" },
  { color: "#ffffff", colorName: "White" },
];

/**
 * Parse DST file from ArrayBuffer
 *
 * @param buffer - ArrayBuffer containing DST file data
 * @param fileName - Optional file name
 * @returns Parsed design document
 */
export function parseDST(buffer: ArrayBuffer, fileName?: string): DesignDocument {
  const reader = new BinaryReader(buffer);

  // Read header (512 bytes)
  const header = parseDSTHeader(reader);
  console.log("DST header:", header);

  // Read stitch data
  const { colorBlocks, bounds } = parseDSTStitches(reader);

  // Create thread list based on color count
  const colorCount = colorBlocks.length;
  const threads: Thread[] = [];
  for (let i = 0; i < colorCount; i++) {
    threads.push({
      ...DEFAULT_DST_COLORS[i % DEFAULT_DST_COLORS.length],
      brand: "Generic",
    });
  }

  const totalStitches = colorBlocks.reduce((sum, block) => sum + block.stitches.length, 0);

  const design: DesignDocument = {
    id: crypto.randomUUID(),
    name: fileName || header.label || "Untitled Design",
    originalFormat: "DST",
    colorBlocks,
    threads,
    machineProfile: BROTHER_PP1_PROFILE,
    metadata: {
      originalWidthMm: bounds.width / 10, // Convert from 1/10mm to mm
      originalHeightMm: bounds.height / 10,
      scaleFactor: 1.0,
      originalStitchCount: totalStitches,
      currentStitchCount: totalStitches,
      fileName,
    },
  };

  return design;
}

/**
 * Parse DST file header
 */
function parseDSTHeader(reader: BinaryReader): {
  label: string;
  stitchCount: number;
  colorCount: number;
} {
  // DST header is 512 bytes of ASCII text
  const headerBytes = reader.readBytes(DST_HEADER_SIZE);
  const headerText = new TextDecoder('ascii').decode(headerBytes);

  // Extract label (LA: field)
  let label = "Untitled";
  const labelMatch = headerText.match(/LA:\s*([^\r\n]+)/);
  if (labelMatch) {
    label = labelMatch[1].trim();
  }

  // Extract stitch count (ST: field)
  let stitchCount = 0;
  const stitchMatch = headerText.match(/ST:\s*(\d+)/);
  if (stitchMatch) {
    stitchCount = parseInt(stitchMatch[1], 10);
  }

  // Extract color change count (CO: field)
  let colorCount = 1;
  const colorMatch = headerText.match(/CO:\s*(\d+)/);
  if (colorMatch) {
    colorCount = parseInt(colorMatch[1], 10) + 1; // +1 because CO is changes, not total colors
  }

  return { label, stitchCount, colorCount };
}

/**
 * Parse DST stitch data
 */
function parseDSTStitches(reader: BinaryReader): {
  colorBlocks: ColorBlock[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  const colorBlocks: ColorBlock[] = [];
  let currentColorIndex = 0;
  let currentBlock: ColorBlock = {
    colorIndex: 0,
    stitches: [],
  };

  let x = 0;
  let y = 0;
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;

  // Parse stitch records (3 bytes each)
  while (!reader.eof) {
    // Each stitch is encoded in 3 bytes
    const byte1 = reader.readUInt8();
    const byte2 = reader.readUInt8();
    const byte3 = reader.readUInt8();

    // Check for end of file marker (0x00 0x00 0xF3)
    if (byte1 === 0x00 && byte2 === 0x00 && byte3 === 0xf3) {
      break;
    }

    // Decode special commands
    let isJump = false;
    let isColorChange = false;
    let isEnd = false;

    // Check bit 7 of byte3 for special commands
    if (byte3 & 0x80) {
      // Color change
      if (byte3 & 0x40) {
        isColorChange = true;
      }
      // End
      if (byte3 === 0xf3) {
        isEnd = true;
      }
    }

    // Decode X movement
    let dx = 0;
    if (byte1 & 0x01) dx += 1;
    if (byte1 & 0x02) dx += 9;
    if (byte1 & 0x04) dx += 3;
    if (byte1 & 0x80) dx = -dx;

    if (byte2 & 0x01) dx += 81;
    if (byte2 & 0x02) dx += 27;
    if (byte2 & 0x04) dx += 243;
    if (byte2 & 0x80) dx = -dx;

    // Decode Y movement
    let dy = 0;
    if (byte1 & 0x08) dy += 1;
    if (byte1 & 0x10) dy += 9;
    if (byte1 & 0x20) dy += 3;
    if (byte1 & 0x40) dy = -dy;

    if (byte2 & 0x08) dy += 81;
    if (byte2 & 0x10) dy += 27;
    if (byte2 & 0x20) dy += 243;
    if (byte2 & 0x40) dy = -dy;

    // Update position
    x += dx;
    y += dy;

    // Update bounds
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    // Handle color change
    if (isColorChange) {
      if (currentBlock.stitches.length > 0) {
        colorBlocks.push(currentBlock);
      }
      currentColorIndex++;
      currentBlock = {
        colorIndex: currentColorIndex,
        stitches: [],
      };

      // Add color change marker
      currentBlock.stitches.push({
        position: { x, y },
        type: "stop" as StitchType,
        colorIndex: currentColorIndex,
      });
      continue;
    }

    // Handle end
    if (isEnd) {
      currentBlock.stitches.push({
        position: { x, y },
        type: "end" as StitchType,
        colorIndex: currentColorIndex,
      });
      break;
    }

    // Determine stitch type
    let stitchType: StitchType = "run";

    // Check for jump (long move with no color change)
    if (Math.abs(dx) > 100 || Math.abs(dy) > 100) {
      stitchType = "jump";
    }

    // Add stitch (skip if both dx and dy are 0)
    if (dx !== 0 || dy !== 0) {
      currentBlock.stitches.push({
        position: { x, y },
        type: stitchType,
        colorIndex: currentColorIndex,
      });
    }
  }

  // Add final block
  if (currentBlock.stitches.length > 0) {
    colorBlocks.push(currentBlock);
  }

  const bounds = {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };

  return { colorBlocks, bounds };
}

/**
 * Check if a buffer contains a valid DST file
 */
export function isDSTFile(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < DST_HEADER_SIZE) return false;

  // DST files don't have a magic number, but they have a specific header structure
  // Check for common header fields like "LA:" and "ST:"
  const reader = new BinaryReader(buffer);
  const headerBytes = reader.readBytes(DST_HEADER_SIZE);
  const headerText = new TextDecoder('ascii').decode(headerBytes);

  return headerText.includes("LA:") || headerText.includes("ST:");
}

/**
 * Extract metadata from DST file
 */
export function getDSTMetadata(buffer: ArrayBuffer): {
  label: string;
  stitchCount: number;
  colorCount: number;
} {
  const reader = new BinaryReader(buffer);
  return parseDSTHeader(reader);
}
