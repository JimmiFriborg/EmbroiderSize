/**
 * SimpleSkale 4.0 - PES File Parser
 *
 * Parser for Brother PES embroidery file format.
 * PES files contain stitch data for Brother embroidery machines.
 *
 * Format reference: https://edutechwiki.unige.ch/en/Embroidery_format_PES
 */

import type { ColorBlock, DesignDocument, Point, Stitch, StitchType, Thread } from "../../types";
import { BROTHER_PP1_PROFILE } from "../../types";
import { BinaryReader, rgbToHex } from "../binary";

/**
 * PES format constants
 */
const PES_MAGIC = "#PES";

/**
 * PES stitch commands (PEC section)
 */
const enum PESCommand {
  STITCH = 0x00,
  JUMP = 0x01,
  COLOR_CHANGE = 0x02,
  STOP = 0x03,
  END = 0x04,
  TRIM = 0x05,
}

/**
 * Standard PES/Brother thread colors
 * These are the default colors used by Brother machines
 */
const BROTHER_THREAD_COLORS: Thread[] = [
  { color: "#0f0f0f", colorName: "Black" },
  { color: "#1a55a2", colorName: "Prussian Blue" },
  { color: "#0f75ff", colorName: "Blue" },
  { color: "#007b88", colorName: "Teal Green" },
  { color: "#f39178", colorName: "Corn Flower Blue" },
  { color: "#ff0000", colorName: "Red" },
  { color: "#ee82ee", colorName: "Reddish Lilac" },
  { color: "#ffc0cb", colorName: "Lilac" },
  { color: "#ffcccc", colorName: "Pale Pink" },
  { color: "#ffa500", colorName: "Gold" },
  { color: "#00bfff", colorName: "Light Sky Blue" },
  { color: "#90ee90", colorName: "Pale Green" },
  { color: "#00ff00", colorName: "Green" },
  { color: "#40e0d0", colorName: "Turquoise" },
  { color: "#ffd700", colorName: "Yellow" },
  { color: "#ffa07a", colorName: "Light Salmon" },
];

/**
 * Parse PES file from ArrayBuffer
 *
 * @param buffer - ArrayBuffer containing PES file data
 * @param fileName - Optional file name
 * @returns Parsed design document
 */
export function parsePES(buffer: ArrayBuffer, fileName?: string): DesignDocument {
  const reader = new BinaryReader(buffer);

  // Read and validate header
  const magic = reader.readString(4, 'ascii');
  if (magic !== PES_MAGIC) {
    throw new Error(`Invalid PES file: expected "${PES_MAGIC}", got "${magic}"`);
  }

  // Read version
  const version = reader.readString(4, 'ascii');
  console.log(`PES version: ${version}`);

  // Read PEC offset (where the stitch data starts)
  const pecOffset = reader.readUInt32LE();

  // Jump to PEC section
  reader.seek(pecOffset);

  // Parse PEC section
  const { colorBlocks, threads, bounds } = parsePECSection(reader);

  // Calculate metadata
  const totalStitches = colorBlocks.reduce((sum, block) => sum + block.stitches.length, 0);

  const design: DesignDocument = {
    id: crypto.randomUUID(),
    name: fileName || "Untitled Design",
    originalFormat: "PES",
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
 * Parse PEC section (the core stitch data)
 */
function parsePECSection(reader: BinaryReader): {
  colorBlocks: ColorBlock[];
  threads: Thread[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  // Skip "LA:" label
  reader.skip(3);

  // Read label/name (16 bytes)
  const label = reader.readString(16, 'ascii').trim();
  console.log(`Design label: ${label}`);

  // Skip padding
  reader.skip(12);

  // Read thumbnail sizes (we'll skip the thumbnails)
  reader.skip(1); // thumbnail present flag
  reader.skip(12); // thumbnail data

  // Read color count
  const colorCount = reader.readUInt8() + 1;
  console.log(`Color count: ${colorCount}`);

  // Read color indices
  const colorIndices: number[] = [];
  for (let i = 0; i < colorCount; i++) {
    colorIndices.push(reader.readUInt8());
  }

  // Create thread list
  const threads: Thread[] = colorIndices.map((index) => {
    const color = BROTHER_THREAD_COLORS[index % BROTHER_THREAD_COLORS.length];
    return { ...color, brand: "Brother" };
  });

  // Skip to stitch data (after various headers)
  // Position varies by version, so we'll look for the stitch data section
  // In PES files, stitch data follows the color table

  // Read stitches and organize into color blocks
  const { colorBlocks, bounds } = parseStitchData(reader, colorCount);

  return { colorBlocks, threads, bounds };
}

/**
 * Parse stitch data from PEC section
 */
function parseStitchData(
  reader: BinaryReader,
  colorCount: number
): {
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

  // Parse stitch commands
  while (!reader.eof) {
    const byte1 = reader.readUInt8();
    const byte2 = reader.readUInt8();

    // Check for special commands
    if (byte1 === 0xff && byte2 === 0x00) {
      // End of stitches
      break;
    }

    if (byte1 === 0xfe && byte2 === 0xb0) {
      // Color change
      if (currentBlock.stitches.length > 0) {
        colorBlocks.push(currentBlock);
      }
      currentColorIndex++;
      currentBlock = {
        colorIndex: currentColorIndex % colorCount,
        stitches: [],
      };

      // Add color change marker
      currentBlock.stitches.push({
        position: { x, y },
        type: "stop" as StitchType,
        colorIndex: currentColorIndex % colorCount,
      });
      continue;
    }

    // Decode stitch movement
    let dx = 0;
    let dy = 0;

    // Decode X movement
    if (byte1 & 0x80) {
      dx = -(byte1 & 0x0f);
    } else {
      dx = byte1 & 0x0f;
    }

    // Decode Y movement
    if (byte2 & 0x80) {
      dy = -(byte2 & 0x0f);
    } else {
      dy = byte2 & 0x0f;
    }

    // Check for larger movements
    if (byte1 & 0x40) dx *= 16;
    if (byte2 & 0x40) dy *= 16;

    // Update position
    x += dx;
    y += dy;

    // Update bounds
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    // Determine stitch type
    let stitchType: StitchType = "run";
    if ((byte1 & 0x20) || (byte2 & 0x20)) {
      stitchType = "jump";
    }

    // Add stitch
    currentBlock.stitches.push({
      position: { x, y },
      type: stitchType,
      colorIndex: currentColorIndex % colorCount,
    });
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
 * Check if a buffer contains a valid PES file
 */
export function isPESFile(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;

  const reader = new BinaryReader(buffer);
  const magic = reader.readString(4, 'ascii');
  return magic === PES_MAGIC;
}

/**
 * Get PES file version
 */
export function getPESVersion(buffer: ArrayBuffer): string {
  if (!isPESFile(buffer)) {
    throw new Error("Not a valid PES file");
  }

  const reader = new BinaryReader(buffer);
  reader.skip(4); // Skip magic
  return reader.readString(4, 'ascii');
}
