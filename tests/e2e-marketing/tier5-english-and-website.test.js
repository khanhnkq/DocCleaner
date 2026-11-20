/**
 * DocCleaner v1.8.0 - Tier 5: English Marketing Assets & Website Integration Tests
 * Validates:
 * 1. All 5 English screenshots in store-assets/en/ (1280x800)
 * 2. English Marquee (1400x560) and Small Promo (440x280)
 * 3. English 1080p MP4 Demo Video and GIF in assets/demo/en/
 * 4. Website integration in index.html (English) and vi/index.html (Vietnamese)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const { parsePngHeader } = require('./helpers/image-inspector');
const { inspectMp4, inspectGif } = require('./helpers/media-inspector');
const { assertExactDimensions, assertSilentAudio } = require('./helpers/assert-utils');

const ROOT_DIR = path.resolve(__dirname, '../..');

async function runTests(options = {}) {
  const startTime = Date.now();
  let passed = 0;
  let failed = 0;
  let pending = 0;

  function test(name, fn) {
    try {
      fn();
      passed++;
      if (options.verbose) {
        console.log(`  ✓ ${name}`);
      }
    } catch (err) {
      failed++;
      console.error(`  ❌ FAIL: ${name}\n     ${err.message}`);
    }
  }

  // 1. English Screenshots (5 tests)
  for (let i = 1; i <= 5; i++) {
    test(`English screenshot ${i} (store-assets/en/screenshot${i}_1280x800.png) is 1280x800 PNG`, () => {
      const p = path.join(ROOT_DIR, `store-assets/en/screenshot${i}_1280x800.png`);
      assert.ok(fs.existsSync(p), `Missing ${p}`);
      const header = parsePngHeader(p);
      assertExactDimensions(header, 1280, 800, `EN Screenshot ${i}`);
      assert.strictEqual(header.bitDepth, 8, 'Must be 8-bit depth');
    });
  }

  // 2. English Marquee & Small Promo (2 tests)
  test('English marquee banner (store-assets/en/marquee_1400x560.png) is 1400x560', () => {
    const p = path.join(ROOT_DIR, 'store-assets/en/marquee_1400x560.png');
    assert.ok(fs.existsSync(p), `Missing ${p}`);
    const header = parsePngHeader(p);
    assertExactDimensions(header, 1400, 560, 'EN Marquee');
  });

  test('English small promo tile (store-assets/en/promo_small_440x280.png) is 440x280', () => {
    const p = path.join(ROOT_DIR, 'store-assets/en/promo_small_440x280.png');
    assert.ok(fs.existsSync(p), `Missing ${p}`);
    const header = parsePngHeader(p);
    assertExactDimensions(header, 440, 280, 'EN Small Promo');
  });

  // 3. English Video & GIF (2 tests)
  test('English 1080p MP4 demo video is 1920x1080, 16.0s, silent', () => {
    const p = path.join(ROOT_DIR, 'assets/demo/en/doccleaner_demo_1080p.mp4');
    assert.ok(fs.existsSync(p), `Missing ${p}`);
    const meta = inspectMp4(p);
    assert.strictEqual(meta.width, 1920, 'Width must be 1920');
    assert.strictEqual(meta.height, 1080, 'Height must be 1080');
    assert.ok(meta.duration >= 15.0 && meta.duration <= 20.0, `Duration ${meta.duration}s in range`);
    assertSilentAudio(meta.audioStreamCount, 'EN Demo Video');
  });

  test('English animated GIF is 800x450, <8MB, multi-frame with loop', () => {
    const p = path.join(ROOT_DIR, 'assets/demo/en/doccleaner_demo.gif');
    assert.ok(fs.existsSync(p), `Missing ${p}`);
    const meta = inspectGif(p);
    assert.strictEqual(meta.width, 800, 'Width must be 800');
    assert.strictEqual(meta.height, 450, 'Height must be 450');
    assert.ok(meta.sizeBytes < 8 * 1024 * 1024, `Size ${meta.sizeBytes} must be < 8MB`);
    assert.strictEqual(meta.hasLoopExtension, true, 'Must loop infinitely');
  });

  // 4. Website Integration: index.html (English) (1 test)
  test('index.html integrates English hero GIF, before/after preview, and all 5 screenshots', () => {
    const p = path.join(ROOT_DIR, 'index.html');
    const content = fs.readFileSync(p, 'utf8');
    assert.ok(content.includes('assets/demo/en/doccleaner_demo.gif'), 'Hero should use English demo GIF');
    assert.ok(content.includes('store-assets/en/screenshot1_1280x800.png'), 'Preview should use EN screenshot 1');
    for (let i = 1; i <= 5; i++) {
      assert.ok(
        content.includes(`store-assets/en/screenshot${i}_1280x800.png`),
        `Gallery must reference EN screenshot ${i}`
      );
    }
  });

  // 5. Website Integration: vi/index.html (Vietnamese) (1 test)
  test('vi/index.html integrates Vietnamese hero GIF, before/after preview, and all 5 screenshots', () => {
    const p = path.join(ROOT_DIR, 'vi/index.html');
    const content = fs.readFileSync(p, 'utf8');
    assert.ok(content.includes('assets/demo/doccleaner_demo.gif'), 'Hero should use Vietnamese demo GIF');
    assert.ok(content.includes('store-assets/screenshot1_1280x800.png'), 'Preview should use VN screenshot 1');
    for (let i = 1; i <= 5; i++) {
      assert.ok(
        content.includes(`store-assets/screenshot${i}_1280x800.png`),
        `Gallery must reference VN screenshot ${i}`
      );
    }
  });

  return {
    tier: 'Tier 5 (English & Website)',
    total: passed + failed + pending,
    passed,
    failed,
    pending,
    durationMs: Date.now() - startTime
  };
}

if (require.main === module) {
  runTests({ verbose: true }).then((res) => {
    console.log(`\nTier 5 Finished: ${res.passed} passed, ${res.pending} pending, ${res.failed} failed (${res.durationMs}ms)`);
    process.exit(res.failed > 0 ? 1 : 0);
  }).catch((err) => {
    console.error('Fatal Tier 5 execution error:', err);
    process.exit(2);
  });
}

module.exports = { runTests };
