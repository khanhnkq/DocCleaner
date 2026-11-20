/**
 * Pure Node.js Media Inspector Helper
 * Zero-dependency parser for MP4 containers, video/audio stream metadata,
 * and animated GIF89a structure, frame counts, loop extensions, and size budgets.
 */

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

/**
 * Finds available ffprobe binary path.
 * @returns {string|null}
 */
function getFfprobePath() {
  const candidates = [
    '/opt/homebrew/bin/ffprobe',
    '/usr/local/bin/ffprobe',
    '/usr/bin/ffprobe',
    'ffprobe'
  ];
  for (const c of candidates) {
    try {
      cp.execFileSync(c, ['-version'], { stdio: 'ignore' });
      return c;
    } catch {
      // continue search
    }
  }
  return null;
}

/**
 * Native ISO Base Media File Format (MP4) Atom Parser.
 * Pure Node.js fallback when ffprobe is not installed.
 * @param {string|Buffer} source File path or Buffer
 * @returns {{
 *   duration: number,
 *   width: number,
 *   height: number,
 *   codec: string,
 *   fps: number,
 *   hasAudio: boolean,
 *   audioStreamCount: number,
 *   sizeBytes: number
 * }}
 */
function parseMp4AtomsNative(source) {
  let buf;
  let sizeBytes;
  if (typeof source === 'string') {
    if (!fs.existsSync(source)) {
      throw new Error(`MP4 file not found: ${source}`);
    }
    buf = fs.readFileSync(source);
    sizeBytes = buf.length;
  } else if (Buffer.isBuffer(source)) {
    buf = source;
    sizeBytes = buf.length;
  } else {
    throw new TypeError(`Invalid source: expected file path or Buffer, got ${typeof source}`);
  }

  let duration = 0;
  let width = 0;
  let height = 0;
  let audioStreamCount = 0;
  let videoStreamCount = 0;
  let codec = 'unknown';

  // Recursive box parser
  function parseBoxes(start, end) {
    let offset = start;
    while (offset + 8 <= end) {
      let boxSize = buf.readUInt32BE(offset);
      const boxType = buf.toString('ascii', offset + 4, offset + 8);

      let headerSize = 8;
      if (boxSize === 1) {
        // 64-bit large size
        if (offset + 16 > end) break;
        // Read low 32-bits for simplicity if size fits
        boxSize = Number(buf.readBigUInt64BE(offset + 8));
        headerSize = 16;
      } else if (boxSize === 0) {
        // Extends to end of file
        boxSize = end - offset;
      }

      if (boxSize < headerSize || offset + boxSize > end) {
        break;
      }

      const payloadStart = offset + headerSize;
      const payloadEnd = offset + boxSize;

      if (boxType === 'moov' || boxType === 'trak' || boxType === 'mdia' || boxType === 'minf' || boxType === 'stbl') {
        // Container box: parse children
        parseBoxes(payloadStart, payloadEnd);
      } else if (boxType === 'mvhd') {
        // Movie Header: extract duration and timescale
        const version = buf.readUInt8(payloadStart);
        let timescale = 0;
        let dur = 0;
        if (version === 1) {
          timescale = buf.readUInt32BE(payloadStart + 20);
          dur = Number(buf.readBigUInt64BE(payloadStart + 24));
        } else {
          timescale = buf.readUInt32BE(payloadStart + 12);
          dur = buf.readUInt32BE(payloadStart + 16);
        }
        if (timescale > 0) {
          duration = dur / timescale;
        }
      } else if (boxType === 'tkhd') {
        // Track Header: extract track width and height from the last 8 bytes
        // Fixed point 16.16: uint16 integer part, uint16 fraction part
        const trackWidth = buf.readUInt16BE(payloadEnd - 8);
        const trackHeight = buf.readUInt16BE(payloadEnd - 4);
        if (trackWidth > 0 && trackHeight > 0 && width === 0) {
          width = trackWidth;
          height = trackHeight;
        }
      } else if (boxType === 'hdlr') {
        // Handler reference: handler type is at payloadStart + 8 (4 bytes ASCII)
        if (payloadEnd - payloadStart >= 12) {
          const handlerType = buf.toString('ascii', payloadStart + 8, payloadStart + 12);
          if (handlerType === 'vide') {
            videoStreamCount++;
            codec = 'h264';
          } else if (handlerType === 'soun') {
            audioStreamCount++;
          }
        }
      }

      offset += boxSize;
    }
  }

  parseBoxes(0, buf.length);

  return {
    duration: Number(duration.toFixed(3)),
    width,
    height,
    codec,
    fps: 30, // nominal
    hasAudio: audioStreamCount > 0,
    audioStreamCount,
    sizeBytes
  };
}

/**
 * Inspects MP4 video file metadata using ffprobe if available, falling back to native atom parsing.
 * @param {string} filePath
 * @returns {{
 *   duration: number,
 *   width: number,
 *   height: number,
 *   codec: string,
 *   fps: number,
 *   hasAudio: boolean,
 *   audioStreamCount: number,
 *   sizeBytes: number,
 *   rawProbe?: object
 * }}
 */
function inspectMp4(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`MP4 file not found: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  const ffprobePath = getFfprobePath();

  if (ffprobePath) {
    try {
      const stdout = cp.execFileSync(
        ffprobePath,
        [
          '-v', 'quiet',
          '-print_format', 'json',
          '-show_format',
          '-show_streams',
          filePath
        ],
        { encoding: 'utf8', timeout: 5000 }
      );

      const probe = JSON.parse(stdout);
      const videoStream = (probe.streams || []).find((s) => s.codec_type === 'video');
      const audioStreams = (probe.streams || []).filter((s) => s.codec_type === 'audio');

      let fps = 0;
      if (videoStream && videoStream.r_frame_rate) {
        const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
        fps = den ? num / den : num;
      }

      const duration = parseFloat(probe.format?.duration || videoStream?.duration || '0');

      return {
        duration: Number(duration.toFixed(3)),
        width: videoStream ? videoStream.width : 0,
        height: videoStream ? videoStream.height : 0,
        codec: videoStream ? videoStream.codec_name : 'unknown',
        fps: Number(fps.toFixed(2)),
        hasAudio: audioStreams.length > 0,
        audioStreamCount: audioStreams.length,
        sizeBytes: stat.size,
        rawProbe: probe
      };
    } catch {
      // Fallback to native atom parsing if ffprobe execution fails
    }
  }

  return parseMp4AtomsNative(filePath);
}

/**
 * Zero-dependency Animated GIF89a Inspector.
 * Validates header magic, Logical Screen Descriptor, frame count via Graphic Control Extensions,
 * Netscape application loop extensions, and strict byte size budget.
 * @param {string|Buffer} source File path or Buffer
 * @returns {{
 *   header: string,
 *   width: number,
 *   height: number,
 *   hasGlobalColorTable: boolean,
 *   gctSize: number,
 *   sizeBytes: number,
 *   sizeMB: number,
 *   isUnder8MB: boolean,
 *   frameCount: number,
 *   hasLoopExtension: boolean,
 *   frameDelays: number[]
 * }}
 */
function inspectGif(source) {
  let buf;
  let sizeBytes;

  if (typeof source === 'string') {
    if (!fs.existsSync(source)) {
      throw new Error(`GIF file not found: ${source}`);
    }
    buf = fs.readFileSync(source);
    sizeBytes = buf.length;
  } else if (Buffer.isBuffer(source)) {
    buf = source;
    sizeBytes = buf.length;
  } else {
    throw new TypeError(`Invalid source: expected file path or Buffer, got ${typeof source}`);
  }

  if (buf.length < 13) {
    throw new Error(`File is too small to be a valid GIF (${buf.length} bytes, expected >= 13)`);
  }

  // 1. Signature & Version Check (bytes 0-5)
  const signature = buf.toString('ascii', 0, 3);
  const version = buf.toString('ascii', 3, 6);
  const header = signature + version;

  if (signature !== 'GIF' || (version !== '89a' && version !== '87a')) {
    throw new Error(`Invalid GIF header: expected "GIF89a" or "GIF87a", got "${header}"`);
  }

  // 2. Logical Screen Descriptor (bytes 6-12)
  const width = buf.readUInt16LE(6);
  const height = buf.readUInt16LE(8);
  const packedFields = buf.readUInt8(10);
  const hasGct = (packedFields & 0x80) !== 0;
  const gctSize = hasGct ? 2 ** ((packedFields & 0x07) + 1) : 0;

  // 3. Scan Blocks (Frames & Extensions)
  let frameCount = 0;
  const frameDelays = [];
  let hasLoopExtension = false;
  let pos = 13 + (hasGct ? gctSize * 3 : 0);

  while (pos < buf.length) {
    const block = buf[pos];

    if (block === 0x3b) {
      // GIF Trailer byte
      break;
    }

    if (block === 0x21) {
      // Extension block
      const extType = buf[pos + 1];
      if (extType === 0xf9) {
        // Graphic Control Extension (precedes an image frame)
        frameCount++;
        if (pos + 4 < buf.length) {
          const delayHundredths = buf.readUInt16LE(pos + 4);
          frameDelays.push(delayHundredths);
        }
        pos += 2;
        // Skip sub-blocks
        while (pos < buf.length) {
          const subLen = buf[pos++];
          if (subLen === 0) break;
          pos += subLen;
        }
      } else if (extType === 0xff) {
        // Application Extension: Check for NETSCAPE2.0 looping
        pos += 2;
        const subLen = buf[pos++];
        if (subLen === 11 && pos + 11 <= buf.length) {
          const appName = buf.toString('ascii', pos, pos + 11);
          if (appName === 'NETSCAPE2.0' || appName.startsWith('NETSCAPE')) {
            hasLoopExtension = true;
          }
        }
        pos += subLen;
        while (pos < buf.length) {
          const nextSub = buf[pos++];
          if (nextSub === 0) break;
          pos += nextSub;
        }
      } else {
        // Other extension: skip
        pos += 2;
        while (pos < buf.length) {
          const subLen = buf[pos++];
          if (subLen === 0) break;
          pos += subLen;
        }
      }
    } else if (block === 0x2c) {
      // Image Descriptor
      pos += 10;
      if (pos > buf.length) break;
      const imgPacked = buf[pos - 1];
      if ((imgPacked & 0x80) !== 0) {
        // Local color table present
        const lctSize = 2 ** ((imgPacked & 0x07) + 1);
        pos += lctSize * 3;
      }
      pos += 1; // LZW minimum code size
      // Skip raster data sub-blocks
      while (pos < buf.length) {
        const subLen = buf[pos++];
        if (subLen === 0) break;
        pos += subLen;
      }
    } else {
      pos++;
    }
  }

  const isUnder8MB = sizeBytes < 8 * 1024 * 1024; // 8,388,608 bytes

  return {
    header,
    width,
    height,
    hasGlobalColorTable: hasGct,
    gctSize,
    sizeBytes,
    sizeMB: Number((sizeBytes / (1024 * 1024)).toFixed(3)),
    isUnder8MB,
    frameCount,
    hasLoopExtension,
    frameDelays
  };
}

/**
 * Creates a synthetic minimal GIF buffer for testing.
 * @param {number} width
 * @param {number} height
 * @param {object} [options]
 * @param {number} [options.frames=1]
 * @param {boolean} [options.loop=true]
 * @param {number} [options.delay=4] 4 hundredths of a second = 40ms (~25fps)
 * @returns {Buffer}
 */
function createSyntheticGif(width, height, options = {}) {
  const { frames = 1, loop = true, delay = 4 } = options;
  const parts = [];

  // Header & Logical Screen Descriptor (13 bytes)
  const lsd = Buffer.alloc(13);
  lsd.write('GIF89a', 0, 6, 'ascii');
  lsd.writeUInt16LE(width, 6);
  lsd.writeUInt16LE(height, 8);
  lsd.writeUInt8(0x80, 10); // GCT present, 2 colors (2^(0+1))
  lsd.writeUInt8(0x00, 11);
  lsd.writeUInt8(0x00, 12);
  parts.push(lsd);

  // Global Color Table (2 colors: Black and White, 6 bytes)
  parts.push(Buffer.from([0x00, 0x00, 0x00, 0xff, 0xff, 0xff]));

  // Netscape loop extension
  if (loop) {
    parts.push(Buffer.from([
      0x21, 0xff, 0x0b,
      0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, // NETSCAPE2.0
      0x03, 0x01, 0x00, 0x00, 0x00 // loop count 0 (infinite)
    ]));
  }

  // Write frames
  for (let i = 0; i < frames; i++) {
    // Graphic Control Extension (8 bytes)
    const gce = Buffer.alloc(8);
    gce[0] = 0x21;
    gce[1] = 0xf9;
    gce[2] = 0x04;
    gce[3] = 0x00;
    gce.writeUInt16LE(delay, 4);
    gce[6] = 0x00;
    gce[7] = 0x00; // terminator
    parts.push(gce);

    // Image Descriptor (10 bytes)
    const imgDesc = Buffer.alloc(10);
    imgDesc[0] = 0x2c;
    imgDesc.writeUInt16LE(0, 1);
    imgDesc.writeUInt16LE(0, 3);
    imgDesc.writeUInt16LE(width, 5);
    imgDesc.writeUInt16LE(height, 7);
    imgDesc[9] = 0x00;
    parts.push(imgDesc);

    // Minimal image data (LZW code size + sub-block)
    parts.push(Buffer.from([0x02, 0x02, 0x44, 0x01, 0x00]));
  }

  // Trailer
  parts.push(Buffer.from([0x3b]));

  return Buffer.concat(parts);
}

module.exports = {
  getFfprobePath,
  parseMp4AtomsNative,
  inspectMp4,
  inspectGif,
  createSyntheticGif
};
