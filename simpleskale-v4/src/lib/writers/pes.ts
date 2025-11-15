/**
 * SimpleSkale 4.0 - PES Writer
 *
 * Writes Brother PES embroidery file format.
 */

import type { DesignDocument, ColorBlock, Thread } from "../../types";
import { BinaryWriter } from "../binaryWriter";

/**
 * Write a design to PES format
 */
export function writePES(design: DesignDocument): ArrayBuffer {
  const writer = new BinaryWriter();

  // Write PES header
  writePESHeader(writer);

  // Write PEC section
  const pecOffset = writer.getPosition();
  writePECSection(writer, design);

  return writer.toArrayBuffer();
}

/**
 * Write PES file header
 */
function writePESHeader(writer: BinaryWriter): void {
  // Magic number
  writer.writeString("#PES", "ascii");

  // Version (0001 for PES v1)
  writer.writeString("0001", "ascii");

  // PEC section offset (will be at position 8)
  writer.writeUInt32LE(8); // PEC section starts immediately after header

  // Padding to align to PEC section
  // (In real PES files, there's often embroidery design info here,
  // but for SimpleSkale we'll keep it minimal)
}

/**
 * Write PEC section (the actual stitch data)
 */
function writePECSection(writer: BinaryWriter, design: DesignDocument): void {
  const pecStartPos = writer.getPosition();

  // "LA:" label
  writer.writeString("LA:", "ascii");

  // Design label (16 bytes, space-padded)
  const label = design.name.substring(0, 16);
  writer.writeFixedString(label, 16, 0x20);

  // Padding
  writer.writePadding(12, 0x20);

  // Thumbnail placeholder (48x38 pixels, 6 bytes per row = 228 bytes)
  // We'll write a simple blank thumbnail
  writer.writePadding(228, 0x00);

  // Padding
  writer.writePadding(12, 0x00);

  // Color count (1 byte)
  const colorCount = design.threads.length;
  writer.writeUInt8(Math.min(colorCount, 255));

  // Color palette (colorCount bytes)
  for (const thread of design.threads) {
    const colorIndex = getPECColorIndex(thread.color);
    writer.writeUInt8(colorIndex);
  }

  // Padding to align stitch data
  writer.writePadding(463 - (writer.getPosition() - pecStartPos), 0x20);

  // Write stitch data
  writePECStitches(writer, design.colorBlocks);
}

/**
 * Write PEC stitch data
 */
function writePECStitches(writer: BinaryWriter, colorBlocks: ColorBlock[]): void {
  let lastX = 0;
  let lastY = 0;

  // Calculate bounds and offset to center design
  const bounds = calculateBounds(colorBlocks);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  for (let blockIndex = 0; blockIndex < colorBlocks.length; blockIndex++) {
    const block = colorBlocks[blockIndex];

    // Add color change before each block (except first)
    if (blockIndex > 0) {
      writer.writeUInt8(0xfe); // Color change
      writer.writeUInt8(0xb0);
    }

    for (const stitch of block.stitches) {
      // Convert from 1/10mm units to PEC units (centered)
      const x = Math.round(stitch.position.x - centerX);
      const y = Math.round(stitch.position.y - centerY);
      const dx = x - lastX;
      const dy = y - lastY;

      // PEC uses 12-bit signed coordinates (-2048 to +2047)
      // If delta exceeds this, we need to split into multiple stitches
      if (Math.abs(dx) > 2047 || Math.abs(dy) > 2047) {
        writePECJump(writer, dx, dy);
      } else {
        writePECStitch(writer, dx, dy, stitch.type === "jump");
      }

      lastX = x;
      lastY = y;
    }
  }

  // End marker
  writer.writeUInt8(0xff);
}

/**
 * Write a PEC stitch or jump
 */
function writePECStitch(writer: BinaryWriter, dx: number, dy: number, isJump: boolean): void {
  // PEC encoding:
  // - Small movements (-63 to +63): 1-byte encoding
  // - Larger movements: 2-byte encoding with 12-bit coordinates

  if (Math.abs(dx) <= 63 && Math.abs(dy) <= 63) {
    // 1-byte encoding
    let byte1 = 0;
    let byte2 = 0;

    if (dx >= 0) {
      byte1 = dx & 0x7f;
    } else {
      byte1 = (Math.abs(dx) & 0x7f) | 0x80;
    }

    if (dy >= 0) {
      byte2 = dy & 0x7f;
    } else {
      byte2 = (Math.abs(dy) & 0x7f) | 0x80;
    }

    writer.writeUInt8(byte1);
    writer.writeUInt8(byte2);
  } else {
    // 2-byte encoding for larger movements
    const byte1 = ((Math.abs(dx) >> 8) & 0x0f) | (dx < 0 ? 0x10 : 0x00) | (isJump ? 0x80 : 0x00);
    const byte2 = Math.abs(dx) & 0xff;
    const byte3 = ((Math.abs(dy) >> 8) & 0x0f) | (dy < 0 ? 0x10 : 0x00);
    const byte4 = Math.abs(dy) & 0xff;

    writer.writeUInt8(byte1);
    writer.writeUInt8(byte2);
    writer.writeUInt8(byte3);
    writer.writeUInt8(byte4);
  }
}

/**
 * Write a PEC jump (for movements > 2047 units)
 */
function writePECJump(writer: BinaryWriter, dx: number, dy: number): void {
  let remainingX = dx;
  let remainingY = dy;

  while (Math.abs(remainingX) > 2047 || Math.abs(remainingY) > 2047) {
    const stepX = Math.max(-2047, Math.min(2047, remainingX));
    const stepY = Math.max(-2047, Math.min(2047, remainingY));

    writePECStitch(writer, stepX, stepY, true);

    remainingX -= stepX;
    remainingY -= stepY;
  }

  // Write final step if needed
  if (remainingX !== 0 || remainingY !== 0) {
    writePECStitch(writer, remainingX, remainingY, true);
  }
}

/**
 * Get PEC color index from hex color
 * (Simplified - maps to nearest standard Brother color)
 */
function getPECColorIndex(hexColor: string): number {
  // Standard Brother PEC colors (simplified mapping)
  const standardColors = [
    "#000000", // 0: Black
    "#0000ff", // 1: Blue
    "#00ff00", // 2: Green
    "#ff0000", // 3: Red
    "#ffff00", // 4: Yellow
    "#ff00ff", // 5: Magenta
    "#00ffff", // 6: Cyan
    "#ffffff", // 7: White
    "#804000", // 8: Brown
    "#ffa500", // 9: Orange
    "#ffc0cb", // 10: Pink
    "#800080", // 11: Purple
    "#c0c0c0", // 12: Gray
  ];

  const color = hexColor.toLowerCase();

  // Find closest match
  for (let i = 0; i < standardColors.length; i++) {
    if (standardColors[i] === color) {
      return i;
    }
  }

  // Default to black if no match
  return 0;
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
