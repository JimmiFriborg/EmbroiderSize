/**
 * SimpleSkale 4.0 - Binary Utilities
 *
 * Utilities for reading binary embroidery file formats.
 * Provides helpers for reading various data types from ArrayBuffer.
 */

/**
 * Binary reader for embroidery files
 * Wraps DataView with convenience methods
 */
export class BinaryReader {
  private view: DataView;
  private offset: number = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  /**
   * Get current read position
   */
  get position(): number {
    return this.offset;
  }

  /**
   * Set read position
   */
  set position(value: number) {
    this.offset = value;
  }

  /**
   * Get total buffer size
   */
  get size(): number {
    return this.view.byteLength;
  }

  /**
   * Check if we've reached end of buffer
   */
  get eof(): boolean {
    return this.offset >= this.view.byteLength;
  }

  /**
   * Seek to a specific position
   */
  seek(position: number): void {
    this.offset = position;
  }

  /**
   * Skip n bytes
   */
  skip(n: number): void {
    this.offset += n;
  }

  /**
   * Read unsigned 8-bit integer
   */
  readUInt8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  /**
   * Read signed 8-bit integer
   */
  readInt8(): number {
    const value = this.view.getInt8(this.offset);
    this.offset += 1;
    return value;
  }

  /**
   * Read unsigned 16-bit integer (little-endian)
   */
  readUInt16LE(): number {
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
  }

  /**
   * Read unsigned 16-bit integer (big-endian)
   */
  readUInt16BE(): number {
    const value = this.view.getUint16(this.offset, false);
    this.offset += 2;
    return value;
  }

  /**
   * Read signed 16-bit integer (little-endian)
   */
  readInt16LE(): number {
    const value = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return value;
  }

  /**
   * Read signed 16-bit integer (big-endian)
   */
  readInt16BE(): number {
    const value = this.view.getInt16(this.offset, false);
    this.offset += 2;
    return value;
  }

  /**
   * Read unsigned 32-bit integer (little-endian)
   */
  readUInt32LE(): number {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  /**
   * Read unsigned 32-bit integer (big-endian)
   */
  readUInt32BE(): number {
    const value = this.view.getUint32(this.offset, false);
    this.offset += 4;
    return value;
  }

  /**
   * Read signed 32-bit integer (little-endian)
   */
  readInt32LE(): number {
    const value = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return value;
  }

  /**
   * Read string of specified length
   * @param length Number of bytes to read
   * @param encoding Text encoding (default: utf-8)
   */
  readString(length: number, encoding: 'utf-8' | 'ascii' = 'utf-8'): string {
    const bytes = new Uint8Array(this.view.buffer, this.offset, length);
    this.offset += length;

    if (encoding === 'ascii') {
      return Array.from(bytes)
        .map(b => String.fromCharCode(b))
        .join('');
    }

    // UTF-8
    const decoder = new TextDecoder(encoding);
    return decoder.decode(bytes);
  }

  /**
   * Read null-terminated string
   */
  readCString(maxLength: number = 256): string {
    const bytes: number[] = [];
    let count = 0;

    while (count < maxLength && !this.eof) {
      const byte = this.readUInt8();
      if (byte === 0) break;
      bytes.push(byte);
      count++;
    }

    return String.fromCharCode(...bytes);
  }

  /**
   * Read array of bytes
   */
  readBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(this.view.buffer, this.offset, length);
    this.offset += length;
    return bytes;
  }

  /**
   * Peek at next byte without advancing position
   */
  peekUInt8(): number {
    return this.view.getUint8(this.offset);
  }

  /**
   * Read remaining bytes
   */
  readRemaining(): Uint8Array {
    const remaining = this.size - this.offset;
    return this.readBytes(remaining);
  }
}

/**
 * Convert RGB values to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex color string to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}
