/**
 * SimpleSkale 4.0 - Binary Writer
 *
 * Utility class for writing binary embroidery file formats.
 */

export class BinaryWriter {
  private buffer: number[] = [];

  /**
   * Write an unsigned 8-bit integer
   */
  writeUInt8(value: number): void {
    this.buffer.push(value & 0xff);
  }

  /**
   * Write a signed 8-bit integer
   */
  writeInt8(value: number): void {
    const byte = value < 0 ? value + 256 : value;
    this.buffer.push(byte & 0xff);
  }

  /**
   * Write an unsigned 16-bit integer (little-endian)
   */
  writeUInt16LE(value: number): void {
    this.buffer.push(value & 0xff);
    this.buffer.push((value >> 8) & 0xff);
  }

  /**
   * Write a signed 16-bit integer (little-endian)
   */
  writeInt16LE(value: number): void {
    const unsigned = value < 0 ? value + 65536 : value;
    this.writeUInt16LE(unsigned);
  }

  /**
   * Write an unsigned 32-bit integer (little-endian)
   */
  writeUInt32LE(value: number): void {
    this.buffer.push(value & 0xff);
    this.buffer.push((value >> 8) & 0xff);
    this.buffer.push((value >> 16) & 0xff);
    this.buffer.push((value >> 24) & 0xff);
  }

  /**
   * Write a string
   */
  writeString(str: string, encoding: "utf-8" | "ascii" = "utf-8"): void {
    if (encoding === "ascii") {
      for (let i = 0; i < str.length; i++) {
        this.buffer.push(str.charCodeAt(i) & 0xff);
      }
    } else {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      for (const byte of bytes) {
        this.buffer.push(byte);
      }
    }
  }

  /**
   * Write a fixed-length string, padding with spaces or null bytes
   */
  writeFixedString(str: string, length: number, padChar: number = 0x20): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    for (let i = 0; i < length; i++) {
      if (i < bytes.length) {
        this.buffer.push(bytes[i]);
      } else {
        this.buffer.push(padChar);
      }
    }
  }

  /**
   * Write raw bytes
   */
  writeBytes(bytes: Uint8Array | number[]): void {
    for (const byte of bytes) {
      this.buffer.push(byte & 0xff);
    }
  }

  /**
   * Write padding bytes
   */
  writePadding(length: number, value: number = 0x00): void {
    for (let i = 0; i < length; i++) {
      this.buffer.push(value);
    }
  }

  /**
   * Get current buffer position
   */
  getPosition(): number {
    return this.buffer.length;
  }

  /**
   * Get the complete buffer as Uint8Array
   */
  toBuffer(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Get the complete buffer as ArrayBuffer
   */
  toArrayBuffer(): ArrayBuffer {
    return this.toBuffer().buffer;
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer = [];
  }
}
