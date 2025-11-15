/**
 * SimpleSkale 4.0 - DST Writer
 *
 * Writes Tajima DST embroidery file format.
 */

import type { DesignDocument, ColorBlock, Stitch } from "../../types";
import { BinaryWriter } from "../binaryWriter";

/**
 * Write a design to DST format
 */
export function writeDST(design: DesignDocument): ArrayBuffer {
  const writer = new BinaryWriter();

  // Write 512-byte header
  writeDSTHeader(writer, design);

  // Write stitch data
  writeDSTStitches(writer, design.colorBlocks);

  // Write end-of-file sequence
  writer.writeUInt8(0x00);
  writer.writeUInt8(0x00);
  writer.writeUInt8(0xf3);

  return writer.toArrayBuffer();
}

/**
 * Write DST file header (512 bytes)
 */
function writeDSTHeader(writer: BinaryWriter, design: DesignDocument): void {
  const startPos = writer.getPosition();

  // Label field (3 bytes) - typically "LA:"
  writer.writeString("LA:", "ascii");

  // Design name (16 bytes, padded with spaces)
  const name = design.name.substring(0, 16);
  writer.writeFixedString(name, 16, 0x20);

  // File type (3 bytes) - typically spaces
  writer.writeString("   ", "ascii");

  // Skip to stitch count fields
  writer.writePadding(97 - (writer.getPosition() - startPos), 0x20);

  // Total stitch count field - format: "ST:nnnnn" (9 bytes)
  const totalStitches = design.colorBlocks.reduce(
    (sum, block) => sum + block.stitches.length,
    0
  );
  const stitchCountStr = `ST:${totalStitches.toString().padStart(7, " ")}`;
  writer.writeString(stitchCountStr.substring(0, 9), "ascii");

  // Color change count field - format: "CO:nnn" (7 bytes)
  const colorCount = Math.max(0, design.colorBlocks.length - 1);
  const colorCountStr = `CO:${colorCount.toString().padStart(4, " ")}`;
  writer.writeString(colorCountStr.substring(0, 7), "ascii");

  // Calculate bounds
  const bounds = calculateBounds(design.colorBlocks);

  // Positive X extent field - format: "+Xnnnnn" (7 bytes)
  const posX = Math.max(0, Math.round(bounds.maxX / 10));
  writer.writeString(`+X${posX.toString().padStart(5, " ")}`, "ascii");

  // Negative X extent field - format: "-Xnnnnn" (7 bytes)
  const negX = Math.max(0, Math.round(Math.abs(bounds.minX) / 10));
  writer.writeString(`-X${negX.toString().padStart(5, " ")}`, "ascii");

  // Positive Y extent field - format: "+Ynnnnn" (7 bytes)
  const posY = Math.max(0, Math.round(bounds.maxY / 10));
  writer.writeString(`+Y${posY.toString().padStart(5, " ")}`, "ascii");

  // Negative Y extent field - format: "-Ynnnnn" (7 bytes)
  const negY = Math.max(0, Math.round(Math.abs(bounds.minY) / 10));
  writer.writeString(`-Y${negY.toString().padStart(5, " ")}`, "ascii");

  // Pad rest of header to 512 bytes
  const currentPos = writer.getPosition() - startPos;
  if (currentPos < 512) {
    writer.writePadding(512 - currentPos, 0x20);
  }
}

/**
 * Write DST stitch data
 */
function writeDSTStitches(writer: BinaryWriter, colorBlocks: ColorBlock[]): void {
  let lastX = 0;
  let lastY = 0;

  for (let blockIndex = 0; blockIndex < colorBlocks.length; blockIndex++) {
    const block = colorBlocks[blockIndex];

    // Add color change before each block (except first)
    if (blockIndex > 0) {
      writer.writeUInt8(0x00);
      writer.writeUInt8(0x00);
      writer.writeUInt8(0xc3); // Color change flag
    }

    for (const stitch of block.stitches) {
      const x = Math.round(stitch.position.x);
      const y = Math.round(stitch.position.y);
      const dx = x - lastX;
      const dy = y - lastY;

      // DST uses 3-byte encoding for each stitch
      // Need to handle jumps longer than 121 units
      if (Math.abs(dx) > 121 || Math.abs(dy) > 121) {
        // Write as jump sequence
        writeDSTJump(writer, dx, dy);
      } else {
        // Write normal stitch
        const flags = getStitchFlags(stitch.type);
        writeDSTRecord(writer, dx, dy, flags);
      }

      lastX = x;
      lastY = y;
    }
  }
}

/**
 * Write a DST jump (for movements > 121 units)
 */
function writeDSTJump(writer: BinaryWriter, dx: number, dy: number): void {
  let remainingX = dx;
  let remainingY = dy;

  while (Math.abs(remainingX) > 121 || Math.abs(remainingY) > 121) {
    const stepX = Math.max(-121, Math.min(121, remainingX));
    const stepY = Math.max(-121, Math.min(121, remainingY));

    writeDSTRecord(writer, stepX, stepY, 0x83); // Jump flag

    remainingX -= stepX;
    remainingY -= stepY;
  }

  // Write final step if needed
  if (remainingX !== 0 || remainingY !== 0) {
    writeDSTRecord(writer, remainingX, remainingY, 0x83);
  }
}

/**
 * Write a single DST stitch record (3 bytes)
 */
function writeDSTRecord(writer: BinaryWriter, dx: number, dy: number, flags: number): void {
  let byte1 = 0;
  let byte2 = 0;
  let byte3 = flags;

  // Encode X movement
  if (dx > 0) {
    byte3 |= 0x04;
    if (dx > 40) byte3 |= 0x08;
    if (dx > 80) byte2 |= 0x04;
  } else if (dx < 0) {
    byte3 |= 0x08;
    if (dx < -40) byte3 |= 0x04;
    if (dx < -80) byte2 |= 0x08;
  }

  // Encode Y movement
  if (dy > 0) {
    byte3 |= 0x20;
    if (dy > 40) byte3 |= 0x10;
    if (dy > 80) byte2 |= 0x20;
  } else if (dy < 0) {
    byte3 |= 0x10;
    if (dy < -40) byte3 |= 0x20;
    if (dy < -80) byte2 |= 0x10;
  }

  // Set remaining bits based on delta
  byte1 = encodeDSTDelta(Math.abs(dx) % 3);
  byte2 |= encodeDSTDelta(Math.abs(dy) % 3);

  writer.writeUInt8(byte1);
  writer.writeUInt8(byte2);
  writer.writeUInt8(byte3);
}

/**
 * Encode DST delta value
 */
function encodeDSTDelta(value: number): number {
  return value & 0x03;
}

/**
 * Get stitch type flags
 */
function getStitchFlags(stitchType: string): number {
  switch (stitchType) {
    case "jump":
      return 0x83; // Jump
    case "trim":
      return 0xc3; // Trim/color change
    case "stop":
      return 0xf3; // End
    default:
      return 0x03; // Normal stitch
  }
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
