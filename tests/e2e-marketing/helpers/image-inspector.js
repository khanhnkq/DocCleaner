/**
 * Pure Node.js PNG Inspector Helper
 * Zero-dependency parser for PNG signatures, IHDR chunks, dimensions, and metadata.
 */

const fs = require('node:fs');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const COLOR_TYPE_NAMES = {
  0: 'Grayscale',
  2: 'RGB',
  3: 'Palette',
  4: 'Grayscale+Alpha',
  6: 'RGBA'
};

/**
 * Validates if the given buffer begins with the PNG signature.
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function isPngSignature(buffer) {
  if (!buffer || buffer.length < 8) return false;
  return buffer.subarray(0, 8).equals(PNG_SIGNATURE);
}

/**
 * Parses PNG metadata from a file path or Buffer.
 * Reads the 8-byte signature and 25-byte IHDR chunk (33 bytes total).
 * @param {string|Buffer} source File path or Buffer containing at least 33 bytes
 * @returns {{
 *   width: number,
 *   height: number,
 *   bitDepth: number,
 *   colorType: string,
 *   colorTypeCode: number,
 *   compression: number,
 *   filter: number,
 *   interlace: string,
 *   interlaceCode: number,
 *   aspectRatio: number,
 *   aspectRatioFormatted: string,
 *   sizeBytes?: number
 * }}
 */
function parsePngHeader(source) {
  let buffer;
  let sizeBytes = undefined;

  if (typeof source === 'string') {
    if (!fs.existsSync(source)) {
      throw new Error(`PNG file not found: ${source}`);
    }
    const stat = fs.statSync(source);
    sizeBytes = stat.size;

    const fd = fs.openSync(source, 'r');
    buffer = Buffer.alloc(33);
    try {
      const bytesRead = fs.readSync(fd, buffer, 0, 33, 0);
      if (bytesRead < 33) {
        throw new Error(`File is too small to be a valid PNG (${bytesRead} bytes read, expected >= 33)`);
      }
    } finally {
      fs.closeSync(fd);
    }
  } else if (Buffer.isBuffer(source)) {
    buffer = source;
    sizeBytes = source.length;
    if (buffer.length < 33) {
      throw new Error(`Buffer is too small to be a valid PNG (${buffer.length} bytes, expected >= 33)`);
    }
  } else {
    throw new TypeError(`Invalid source: expected file path string or Buffer, got ${typeof source}`);
  }

  // 1. Verify PNG Magic Signature (bytes 0-7)
  if (!isPngSignature(buffer)) {
    throw new Error('Not a valid PNG: magic signature mismatch');
  }

  // 2. Verify IHDR Chunk Length (bytes 8-11: uint32 BE === 13)
  const chunkLength = buffer.readUInt32BE(8);
  if (chunkLength !== 13) {
    throw new Error(`Invalid IHDR chunk length: expected 13, got ${chunkLength}`);
  }

  // 3. Verify IHDR Chunk Type (bytes 12-15: ASCII 'IHDR')
  const chunkType = buffer.toString('ascii', 12, 16);
  if (chunkType !== 'IHDR') {
    throw new Error(`Invalid chunk type: expected "IHDR", got "${chunkType}"`);
  }

  // 4. Extract Dimensions and Image Attributes (bytes 16-28)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer.readUInt8(24);
  const colorTypeCode = buffer.readUInt8(25);
  const compression = buffer.readUInt8(26);
  const filter = buffer.readUInt8(27);
  const interlaceCode = buffer.readUInt8(28);

  if (width === 0 || height === 0) {
    throw new Error(`Invalid PNG dimensions: width=${width}, height=${height}`);
  }

  const aspectRatio = width / height;
  const colorType = COLOR_TYPE_NAMES[colorTypeCode] || `Unknown(${colorTypeCode})`;

  return {
    width,
    height,
    bitDepth,
    colorType,
    colorTypeCode,
    compression,
    filter,
    interlace: interlaceCode === 1 ? 'Adam7' : 'None',
    interlaceCode,
    aspectRatio,
    aspectRatioFormatted: aspectRatio.toFixed(4),
    sizeBytes
  };
}

/**
 * Creates a synthetic 33-byte PNG header buffer for testing purposes.
 * @param {number} width
 * @param {number} height
 * @param {object} [options]
 * @param {number} [options.bitDepth=8]
 * @param {number} [options.colorType=6]
 * @param {number} [options.compression=0]
 * @param {number} [options.filter=0]
 * @param {number} [options.interlace=0]
 * @returns {Buffer}
 */
function createSyntheticPngHeader(width, height, options = {}) {
  const {
    bitDepth = 8,
    colorType = 6, // RGBA
    compression = 0,
    filter = 0,
    interlace = 0
  } = options;

  const buf = Buffer.alloc(33);
  PNG_SIGNATURE.copy(buf, 0); // 0-7

  buf.writeUInt32BE(13, 8); // 8-11: chunk length
  buf.write('IHDR', 12, 4, 'ascii'); // 12-15: chunk type
  buf.writeUInt32BE(width, 16); // 16-19: width
  buf.writeUInt32BE(height, 20); // 20-23: height
  buf.writeUInt8(bitDepth, 24); // 24: bit depth
  buf.writeUInt8(colorType, 25); // 25: color type
  buf.writeUInt8(compression, 26); // 26: compression
  buf.writeUInt8(filter, 27); // 27: filter
  buf.writeUInt8(interlace, 28); // 28: interlace

  // 29-32: placeholder CRC
  buf.writeUInt32BE(0x00000000, 29);

  return buf;
}

module.exports = {
  PNG_SIGNATURE,
  COLOR_TYPE_NAMES,
  isPngSignature,
  parsePngHeader,
  createSyntheticPngHeader
};
