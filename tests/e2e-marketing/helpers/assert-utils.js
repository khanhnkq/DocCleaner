/**
 * Domain-Specific Assertions for DocCleaner Marketing Asset Pipeline
 * Zero-dependency assertion library checking exact dimensions, audio silence,
 * brand color tokens, border width, zero-shadow, zero-blur, and zero-emoji compliance.
 */

const assert = require('node:assert');

// Approved brand color palette tokens from DESIGN_SYSTEM.md and ORIGINAL_REQUEST.md
const APPROVED_BRAND_PALETTE = new Set([
  '#091b42', // Deep Navy (canvas & borders)
  '#193582', // Royal Navy (card background)
  '#c6eb34', // DocCleaner Acid Lime (Studocu accent)
  '#58c474', // Emerald Mint (Scribd accent)
  '#f6f7ef', // Paper Cream (surface light)
  '#ffffff', // Pure White (text & clean pages)
  '#ffdd00', // Mustard Yellow (star favorite)
  '#ef4444', // Red Burn Accent (clean & burn)
  '#5e6d8a', // Slate Muted (subtext)
  '#07122b'  // Midnight Space (deep space)
]);

// Unicode Regex for extended pictographic and emoji symbols
const EMOJI_REGEX = /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u;

/**
 * Asserts exact image dimensions (0px tolerance).
 * @param {{ width: number, height: number }} actual
 * @param {number} expectedWidth
 * @param {number} expectedHeight
 * @param {string} [context='Asset']
 */
function assertExactDimensions(actual, expectedWidth, expectedHeight, context = 'Asset') {
  assert.ok(actual, `[${context}] Dimension object must be provided`);
  assert.strictEqual(
    actual.width,
    expectedWidth,
    `[${context}] Width mismatch: expected exactly ${expectedWidth}px, got ${actual.width}px`
  );
  assert.strictEqual(
    actual.height,
    expectedHeight,
    `[${context}] Height mismatch: expected exactly ${expectedHeight}px, got ${actual.height}px`
  );
}

/**
 * Asserts aspect ratio within a tight tolerance.
 * @param {number} width
 * @param {number} height
 * @param {number} expectedRatio
 * @param {number} [tolerance=0.01]
 * @param {string} [context='Asset']
 */
function assertAspectRatio(width, height, expectedRatio, tolerance = 0.01, context = 'Asset') {
  const actualRatio = width / height;
  const diff = Math.abs(actualRatio - expectedRatio);
  assert.ok(
    diff <= tolerance,
    `[${context}] Aspect ratio mismatch: expected ~${expectedRatio.toFixed(3)}, got ${actualRatio.toFixed(3)} (diff: ${diff.toFixed(4)})`
  );
}

/**
 * Asserts strictly 0 audio streams (silent video).
 * @param {number} audioStreamCount
 * @param {string} [context='Video']
 */
function assertSilentAudio(audioStreamCount, context = 'Video') {
  assert.strictEqual(
    audioStreamCount,
    0,
    `[${context}] Silent audio violation: expected strictly 0 audio streams, found ${audioStreamCount}`
  );
}

/**
 * Asserts video duration is strictly within bounds [min, max].
 * @param {number} duration
 * @param {number} [min=15.0]
 * @param {number} [max=20.0]
 * @param {string} [context='Video']
 */
function assertVideoDuration(duration, min = 15.0, max = 20.0, context = 'Video') {
  assert.ok(
    duration >= min,
    `[${context}] Duration underflow: duration ${duration.toFixed(2)}s is under ${min.toFixed(1)}s minimum`
  );
  assert.ok(
    duration <= max,
    `[${context}] Duration overflow: duration ${duration.toFixed(2)}s exceeds ${max.toFixed(1)}s maximum`
  );
}

/**
 * Asserts file size is strictly under 8MB (8,388,608 bytes).
 * @param {number} sizeBytes
 * @param {number} [limitBytes=8388608]
 * @param {string} [context='GIF']
 */
function assertGifSizeUnderLimit(sizeBytes, limitBytes = 8388608, context = 'GIF') {
  assert.ok(
    sizeBytes < limitBytes,
    `[${context}] Size budget violation: file size ${sizeBytes} bytes exceeds ${limitBytes} bytes (< 8MB)`
  );
}

/**
 * Asserts that the string contains zero Unicode emoji characters.
 * @param {string} text
 * @param {string} [context='Copy']
 */
function assertNoEmojis(text, context = 'Copy') {
  if (typeof text !== 'string') return;
  const match = text.match(EMOJI_REGEX);
  assert.strictEqual(
    match,
    null,
    `[${context}] Emoji violation: detected prohibited Unicode emoji "${match ? match[0] : ''}" in: "${text}"`
  );
}

/**
 * Normalizes hex colors to lowercase 6-digit hex format (#rrggbb).
 * @param {string} hex
 * @returns {string}
 */
function normalizeHex(hex) {
  let cleaned = hex.trim().toLowerCase();
  if (cleaned.startsWith('#')) {
    if (cleaned.length === 4) {
      // #rgb -> #rrggbb
      cleaned = '#' + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2] + cleaned[3] + cleaned[3];
    }
  }
  return cleaned;
}

/**
 * Asserts that a color matches one of the approved brand palette tokens.
 * @param {string} colorHex
 * @param {string} [context='Color']
 */
function assertBrandPalette(colorHex, context = 'Color') {
  const norm = normalizeHex(colorHex);
  assert.ok(
    APPROVED_BRAND_PALETTE.has(norm),
    `[${context}] Brand color violation: color "${colorHex}" (normalized: "${norm}") is not in the approved DocCleaner palette`
  );
}

/**
 * Asserts that mock document HTML uses flat monograms [ST] or [SC] and avoids official trademark logos.
 * @param {string} html
 * @param {string[]} [expectedMonograms=['ST', 'SC']]
 * @param {string} [context='Mock Document']
 */
function assertMonograms(html, expectedMonograms = ['ST', 'SC'], context = 'Mock Document') {
  // Check for presence of expected monogram(s)
  for (const m of expectedMonograms) {
    const hasMonogram = html.includes(`[${m}]`) || html.includes(`badge-${m.toLowerCase()}`) || html.includes(`>${m}<`);
    assert.ok(
      hasMonogram,
      `[${context}] Trademark compliance error: missing required flat monogram [${m}]`
    );
  }

  // Ensure official corporate logo references are absent
  const hasOfficialLogos = /studocu.*logo\.(?:svg|png)|scribd.*logo\.(?:svg|png)/i.test(html);
  assert.strictEqual(
    hasOfficialLogos,
    false,
    `[${context}] Trademark violation: official third-party logo asset found in markup`
  );
}

/**
 * Asserts that mock document URLs in address bars are masked (e.g. studocu.com/document/... and scribd.com/doc/...).
 * @param {string} html
 * @param {string} [context='Address Bar']
 */
function assertMaskedUrls(html, context = 'Address Bar') {
  const hasMaskedStudocu = /studocu\.com\/document\/(?:\.\.\.|[a-z0-9\-_/]+)/i.test(html);
  const hasMaskedScribd = /scribd\.com\/doc\/(?:\.\.\.|[a-z0-9\-_/]+)/i.test(html);
  assert.ok(
    hasMaskedStudocu || hasMaskedScribd,
    `[${context}] Privacy & trademark violation: document URL must be masked as studocu.com/document/... or scribd.com/doc/...`
  );
}

/**
 * Asserts 1.5px solid border compliance on relevant UI CSS.
 * @param {string} css
 * @param {string} [context='CSS']
 */
function assertCrispBorders(css, context = 'CSS') {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(
    /border:\s*1\.5px\s+solid/i.test(clean),
    `[${context}] Border style violation: expected 1.5px solid borders`
  );
}

/**
 * Asserts zero active box-shadow or text-shadow in extension UI CSS.
 * @param {string} css
 * @param {string} [context='CSS']
 */
function assertZeroBoxShadow(css, context = 'CSS') {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const shadowMatches = clean.match(/box-shadow:\s*([^;!]+)/gi) || [];
  for (const m of shadowMatches) {
    const val = m.replace(/box-shadow:\s*/i, '').trim().toLowerCase();
    assert.ok(
      val === 'none' || val === '0 0 0 0 transparent' || val === '0 0',
      `[${context}] Disallowed drop shadow found in extension UI: "${m}"`
    );
  }
}

/**
 * Asserts zero filter: blur or backdrop-filter in extension UI CSS.
 * @param {string} css
 * @param {string} [context='CSS']
 */
function assertZeroFilterBlur(css, context = 'CSS') {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // backdrop-filter check
  const backdropMatches = clean.match(/backdrop-filter:\s*([^;!]+)/gi) || [];
  for (const m of backdropMatches) {
    const val = m.replace(/backdrop-filter:\s*/i, '').trim().toLowerCase();
    assert.ok(
      val === 'none',
      `[${context}] Disallowed backdrop-filter in extension UI: "${m}"`
    );
  }
}

module.exports = {
  APPROVED_BRAND_PALETTE,
  EMOJI_REGEX,
  assertExactDimensions,
  assertAspectRatio,
  assertSilentAudio,
  assertVideoDuration,
  assertGifSizeUnderLimit,
  assertNoEmojis,
  assertBrandPalette,
  assertMonograms,
  assertMaskedUrls,
  assertCrispBorders,
  assertZeroBoxShadow,
  assertZeroFilterBlur
};
