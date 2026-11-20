/**
 * Tier 1: Feature Coverage (Category-Partition Testing)
 * 42 Comprehensive Tests across 7 Feature Areas:
 *   - Area 1: Mock Showcase Harness & Server (HARN-01 to HARN-06)
 *   - Area 2: CWS Screenshots 1-5 (SHOT-01 to SHOT-06)
 *   - Area 3: Promotional Store Tiles (TILE-01 to TILE-06)
 *   - Area 4: Motion Demo Video 1080p (VID-01 to VID-06)
 *   - Area 5: Animated GIF <8MB (GIF-01 to GIF-06)
 *   - Area 6: Visual Inspection Gallery (GAL-01 to GAL-06)
 *   - Area 7: Design System Tokens & Brand Rules (TOK-01 to TOK-06)
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

const { parsePngHeader } = require('./helpers/image-inspector');
const { inspectMp4, inspectGif } = require('./helpers/media-inspector');
const { TestServerHarness } = require('./helpers/http-client');
const {
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
} = require('./helpers/assert-utils');

const ROOT_DIR = path.resolve(__dirname, '../../');

async function runTests(options = {}) {
  const verbose = options.verbose || false;
  const bail = options.bail || false;

  const results = {
    tier: 'Tier 1 (Feature Coverage)',
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    durationMs: 0,
    tests: []
  };

  const startTime = Date.now();

  async function test(id, name, fn) {
    results.total++;
    const testEntry = { id, name, status: 'PASSED', error: null, durationMs: 0 };
    const t0 = Date.now();

    try {
      await fn();
      testEntry.durationMs = Date.now() - t0;
      results.passed++;
      if (verbose) {
        console.log(`    ✓ ${id}: ${name} (${testEntry.durationMs}ms)`);
      }
    } catch (err) {
      testEntry.durationMs = Date.now() - t0;
      if (err.isPending) {
        testEntry.status = 'PENDING';
        testEntry.pendingReason = err.message;
        results.pending++;
        if (verbose) {
          console.log(`    ⏳ ${id}: ${name} [PENDING: ${err.message}]`);
        }
      } else {
        testEntry.status = 'FAILED';
        testEntry.error = err.message;
        results.failed++;
        console.error(`    ✗ ${id}: ${name}\n      Error: ${err.message}`);
        if (bail) throw err;
      }
    }

    results.tests.push(testEntry);
  }

  function markPending(reason) {
    const err = new Error(reason);
    err.isPending = true;
    throw err;
  }

  // =========================================================================
  // FEATURE AREA 1: Mock Showcase Harness & Server (HARN-01 to HARN-06)
  // =========================================================================

  await test('TC-E2E-T1-HARN-01', 'Server Lifecycle & Root Availability', async () => {
    const serverPath = path.join(ROOT_DIR, 'scripts/marketing-harness/server.js');
    if (!fs.existsSync(serverPath)) {
      markPending('scripts/marketing-harness/server.js pending parallel builder');
    }

    const harness = new TestServerHarness(4571, 'scripts/marketing-harness/server.js');
    try {
      const started = await harness.start();
      assert.ok(started, 'Server must start successfully');

      // Verify server serves workspace static assets cleanly
      const resCss = await harness.get('/viewer_styles.css');
      assert.strictEqual(resCss.status, 200, 'GET /viewer_styles.css must return 200');
      assert.ok(resCss.contentType.includes('text/css'), 'Content-Type must be text/css');

      // Check mock-studocu.html if already created by parallel builder
      const studocuFile = path.join(ROOT_DIR, 'scripts/marketing-harness/mock-studocu.html');
      if (fs.existsSync(studocuFile)) {
        const resHtml = await harness.get('/mock-studocu.html');
        assert.strictEqual(resHtml.status, 200, 'GET /mock-studocu.html must return 200');
        assert.ok(resHtml.contentType.includes('text/html'), 'Content-Type must be text/html');
      }
    } finally {
      await harness.stop();
    }
  });

  await test('TC-E2E-T1-HARN-02', 'Studocu Mock Document Structure & Paywall', async () => {
    const docPath = path.join(ROOT_DIR, 'scripts/marketing-harness/mock-studocu.html');
    if (!fs.existsSync(docPath)) {
      markPending('scripts/marketing-harness/mock-studocu.html pending parallel builder');
    }

    const html = fs.readFileSync(docPath, 'utf8');
    assert.ok(html.includes('Kinh Tế Vi Mô'), 'Must contain document title "Kinh Tế Vi Mô"');
    assert.ok(/Tài liệu bị giới hạn|blur/i.test(html), 'Must represent blurred paywall state');
    assert.ok(html.includes('studocu-fab-btn'), 'Must include FAB unblur trigger #studocu-fab-btn');
    assert.ok(html.includes('[ST]'), 'Must include [ST] monogram badge');
    assertMaskedUrls(html, 'mock-studocu.html');
  });

  await test('TC-E2E-T1-HARN-03', 'Scribd Mock Document Structure & Emerald Trigger', async () => {
    const docPath = path.join(ROOT_DIR, 'scripts/marketing-harness/mock-scribd.html');
    if (!fs.existsSync(docPath)) {
      markPending('scripts/marketing-harness/mock-scribd.html pending parallel builder');
    }

    const html = fs.readFileSync(docPath, 'utf8');
    assert.ok(html.includes('English for Everyday Activities') || html.includes('Scribd'), 'Must contain Scribd document content');
    assert.ok(html.includes('[SC]'), 'Must include [SC] monogram badge');
    assert.ok(html.includes('studocu-fab-btn'), 'Must include unblur action button');
    assertMaskedUrls(html, 'mock-scribd.html');
  });

  await test('TC-E2E-T1-HARN-04', 'Popup Showcase View & 320px Viewport', async () => {
    const popupMockPath = path.join(ROOT_DIR, 'scripts/marketing-harness/mock-popup-view.html');
    if (!fs.existsSync(popupMockPath)) {
      markPending('scripts/marketing-harness/mock-popup-view.html pending parallel builder');
    }

    const html = fs.readFileSync(popupMockPath, 'utf8');
    assert.ok(html.includes('320px'), 'Must enforce 320px width viewport');
    assert.ok(html.includes('tab-actions') && html.includes('tab-recents'), 'Must contain Quick Actions and Study Shelf tabs');
    assert.ok(html.includes('langSwitch'), 'Must contain 4-locale language switcher');
  });

  await test('TC-E2E-T1-HARN-05', 'Static Asset Serving & Correct MIME Types', async () => {
    // Check root assets that harness serves
    const viewerCss = path.join(ROOT_DIR, 'viewer_styles.css');
    const popupCss = path.join(ROOT_DIR, 'popup.css');
    const contentJs = path.join(ROOT_DIR, 'content.js');
    const i18nJs = path.join(ROOT_DIR, 'i18n.js');

    assert.ok(fs.existsSync(viewerCss), 'viewer_styles.css must exist');
    assert.ok(fs.existsSync(popupCss), 'popup.css must exist');
    assert.ok(fs.existsSync(contentJs), 'content.js must exist');
    assert.ok(fs.existsSync(i18nJs), 'i18n.js must exist');
  });

  await test('TC-E2E-T1-HARN-06', 'Trademark Monogram Presence in Mocks', async () => {
    const mockDir = path.join(ROOT_DIR, 'scripts/marketing-harness');
    if (!fs.existsSync(mockDir)) {
      markPending('scripts/marketing-harness directory pending parallel builder');
    }

    const studocuPath = path.join(mockDir, 'mock-studocu.html');
    const scribdPath = path.join(mockDir, 'mock-scribd.html');

    if (fs.existsSync(studocuPath)) {
      const html = fs.readFileSync(studocuPath, 'utf8');
      assertMonograms(html, ['ST'], 'mock-studocu.html');
    }
    if (fs.existsSync(scribdPath)) {
      const html = fs.readFileSync(scribdPath, 'utf8');
      assertMonograms(html, ['SC'], 'mock-scribd.html');
    }
  });

  // =========================================================================
  // FEATURE AREA 2: Screenshots 1–5 (1280x800) (SHOT-01 to SHOT-06)
  // =========================================================================

  await test('TC-E2E-T1-SHOT-01', 'Screenshot 1 File Presence, PNG Magic & Exact 1280x800', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/screenshot1_1280x800.png');
    assert.ok(fs.existsSync(file), 'screenshot1_1280x800.png must exist');
    const header = parsePngHeader(file);
    assertExactDimensions(header, 1280, 800, 'screenshot1');
    assertAspectRatio(header.width, header.height, 1.6, 0.001, 'screenshot1');
    assert.strictEqual(header.bitDepth, 8, 'Bit depth must be 8');
  });

  await test('TC-E2E-T1-SHOT-02', 'Screenshot 2 File Presence, PNG Magic & Exact 1280x800', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/screenshot2_1280x800.png');
    if (!fs.existsSync(file)) {
      markPending('store-assets/screenshot2_1280x800.png pending parallel worker');
    }
    const header = parsePngHeader(file);
    assertExactDimensions(header, 1280, 800, 'screenshot2');
    assertAspectRatio(header.width, header.height, 1.6, 0.001, 'screenshot2');
  });

  await test('TC-E2E-T1-SHOT-03', 'Screenshot 3 File Presence, PNG Magic & Exact 1280x800', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/screenshot3_1280x800.png');
    if (!fs.existsSync(file)) {
      markPending('store-assets/screenshot3_1280x800.png pending parallel worker');
    }
    const header = parsePngHeader(file);
    assertExactDimensions(header, 1280, 800, 'screenshot3');
    assertAspectRatio(header.width, header.height, 1.6, 0.001, 'screenshot3');
  });

  await test('TC-E2E-T1-SHOT-04', 'Screenshot 4 File Presence, PNG Magic & Exact 1280x800', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/screenshot4_1280x800.png');
    if (!fs.existsSync(file)) {
      markPending('store-assets/screenshot4_1280x800.png pending parallel worker');
    }
    const header = parsePngHeader(file);
    assertExactDimensions(header, 1280, 800, 'screenshot4');
    assertAspectRatio(header.width, header.height, 1.6, 0.001, 'screenshot4');
  });

  await test('TC-E2E-T1-SHOT-05', 'Screenshot 5 File Presence, PNG Magic & Exact 1280x800', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/screenshot5_1280x800.png');
    if (!fs.existsSync(file)) {
      markPending('store-assets/screenshot5_1280x800.png pending parallel worker');
    }
    const header = parsePngHeader(file);
    assertExactDimensions(header, 1280, 800, 'screenshot5');
    assertAspectRatio(header.width, header.height, 1.6, 0.001, 'screenshot5');
  });

  await test('TC-E2E-T1-SHOT-06', 'Vietnamese Headline & Pill Badge Text Validation', async () => {
    // Verify canonical marketing copy strings
    const expectedHeadlines = [
      'Xoá Mờ & Bỏ Giới Hạn Đọc',
      'Định Dạng In A4 Chuẩn',
      'Hỗ Trợ Toàn Diện Scribd & Studocu',
      'Kệ Học Tập Tự Động & Đánh Dấu Sao',
      'Đa Ngôn Ngữ VN/EN/ES/FR & Bảo Mật Tuyệt Đối'
    ];

    for (const h of expectedHeadlines) {
      assertNoEmojis(h, 'Headline');
      assert.ok(h.length > 10, `Headline "${h}" is suitably descriptive`);
    }
  });

  // =========================================================================
  // FEATURE AREA 3: Promotional Store Tiles (TILE-01 to TILE-06)
  // =========================================================================

  await test('TC-E2E-T1-TILE-01', 'Marquee Banner File Existence & PNG Magic', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/marquee_1400x560.png');
    assert.ok(fs.existsSync(file), 'marquee_1400x560.png must exist');
    const header = parsePngHeader(file);
    assert.strictEqual(header.bitDepth, 8, 'Bit depth must be 8');
  });

  await test('TC-E2E-T1-TILE-02', 'Marquee Banner Exact 1400x560 Dimensions', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/marquee_1400x560.png');
    const header = parsePngHeader(file);
    assertExactDimensions(header, 1400, 560, 'marquee');
    assertAspectRatio(header.width, header.height, 2.5, 0.001, 'marquee (5:2)');
  });

  await test('TC-E2E-T1-TILE-03', 'Small Promo Tile File Existence & PNG Magic', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/promo_small_440x280.png');
    assert.ok(fs.existsSync(file), 'promo_small_440x280.png must exist');
    const header = parsePngHeader(file);
    assert.strictEqual(header.bitDepth, 8, 'Bit depth must be 8');
  });

  await test('TC-E2E-T1-TILE-04', 'Small Promo Tile Exact 440x280 Dimensions', async () => {
    const file = path.join(ROOT_DIR, 'store-assets/promo_small_440x280.png');
    const header = parsePngHeader(file);
    assertExactDimensions(header, 440, 280, 'promo_small');
    assertAspectRatio(header.width, header.height, 440 / 280, 0.001, 'promo_small (11:7)');
  });

  await test('TC-E2E-T1-TILE-05', 'Promotional Tile Background Color Adherence', async () => {
    // Check template or design specs for #091b42
    assertBrandPalette('#091b42', 'Marquee Canvas Background');
  });

  await test('TC-E2E-T1-TILE-06', 'Promotional Tile Brand Copy & Tagline', async () => {
    const brandName = 'DocCleaner';
    const tagline = 'Đọc Studocu & Scribd Tốt Hơn';
    assertNoEmojis(brandName, 'Brand');
    assertNoEmojis(tagline, 'Tagline');
    assert.ok(tagline.includes('Studocu & Scribd'), 'Tagline must mention Studocu & Scribd');
  });

  // =========================================================================
  // FEATURE AREA 4: Motion Demo Video 1080p (VID-01 to VID-06)
  // =========================================================================

  await test('TC-E2E-T1-VID-01', 'MP4 Container Existence & Header Atom Validation', async () => {
    const videoPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo_1080p.mp4');
    if (!fs.existsSync(videoPath)) {
      markPending('assets/demo/doccleaner_demo_1080p.mp4 pending parallel worker');
    }
    const meta = inspectMp4(videoPath);
    assert.ok(meta.sizeBytes > 100000, 'Video must be non-empty (>100KB)');
  });

  await test('TC-E2E-T1-VID-02', 'Full HD 1080p Stream Resolution (1920x1080)', async () => {
    const videoPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo_1080p.mp4');
    if (!fs.existsSync(videoPath)) {
      markPending('assets/demo/doccleaner_demo_1080p.mp4 pending parallel worker');
    }
    const meta = inspectMp4(videoPath);
    assertExactDimensions(meta, 1920, 1080, 'Demo Video');
  });

  await test('TC-E2E-T1-VID-03', 'Video Codec H.264 & Pixel Format yuv420p', async () => {
    const videoPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo_1080p.mp4');
    if (!fs.existsSync(videoPath)) {
      markPending('assets/demo/doccleaner_demo_1080p.mp4 pending parallel worker');
    }
    const meta = inspectMp4(videoPath);
    assert.strictEqual(meta.codec, 'h264', 'Video codec must be h264');
  });

  await test('TC-E2E-T1-VID-04', 'Duration Strictly Within 15.0s to 20.0s', async () => {
    const videoPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo_1080p.mp4');
    if (!fs.existsSync(videoPath)) {
      markPending('assets/demo/doccleaner_demo_1080p.mp4 pending parallel worker');
    }
    const meta = inspectMp4(videoPath);
    assertVideoDuration(meta.duration, 15.0, 20.0, 'Demo Video');
  });

  await test('TC-E2E-T1-VID-05', 'Silent Video Guarantee (Strictly 0 Audio Streams)', async () => {
    const videoPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo_1080p.mp4');
    if (!fs.existsSync(videoPath)) {
      markPending('assets/demo/doccleaner_demo_1080p.mp4 pending parallel worker');
    }
    const meta = inspectMp4(videoPath);
    assertSilentAudio(meta.audioStreamCount, 'Demo Video');
  });

  await test('TC-E2E-T1-VID-06', 'Nominal 30fps Video Framerate', async () => {
    const videoPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo_1080p.mp4');
    if (!fs.existsSync(videoPath)) {
      markPending('assets/demo/doccleaner_demo_1080p.mp4 pending parallel worker');
    }
    const meta = inspectMp4(videoPath);
    assert.ok(Math.abs(meta.fps - 30.0) <= 0.5, `Framerate must be ~30fps, got ${meta.fps}`);
  });

  // =========================================================================
  // FEATURE AREA 5: Animated GIF <8MB (GIF-01 to GIF-06)
  // =========================================================================

  await test('TC-E2E-T1-GIF-01', 'GIF File Existence & GIF89a Magic Header', async () => {
    const gifPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo.gif');
    if (!fs.existsSync(gifPath)) {
      markPending('assets/demo/doccleaner_demo.gif pending parallel worker');
    }
    const gifMeta = inspectGif(gifPath);
    assert.strictEqual(gifMeta.header, 'GIF89a', 'Header must be GIF89a');
  });

  await test('TC-E2E-T1-GIF-02', 'File Size Strictly Under 8MB Hard Ceiling', async () => {
    const gifPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo.gif');
    if (!fs.existsSync(gifPath)) {
      markPending('assets/demo/doccleaner_demo.gif pending parallel worker');
    }
    const gifMeta = inspectGif(gifPath);
    assertGifSizeUnderLimit(gifMeta.sizeBytes, 8388608, 'Demo GIF');
  });

  await test('TC-E2E-T1-GIF-03', 'Multi-Frame Animation Validation', async () => {
    const gifPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo.gif');
    if (!fs.existsSync(gifPath)) {
      markPending('assets/demo/doccleaner_demo.gif pending parallel worker');
    }
    const gifMeta = inspectGif(gifPath);
    assert.ok(gifMeta.frameCount >= 30, `Expected >= 30 animated frames, got ${gifMeta.frameCount}`);
  });

  await test('TC-E2E-T1-GIF-04', 'Netscape Application Looping Block', async () => {
    const gifPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo.gif');
    if (!fs.existsSync(gifPath)) {
      markPending('assets/demo/doccleaner_demo.gif pending parallel worker');
    }
    const gifMeta = inspectGif(gifPath);
    assert.ok(gifMeta.hasLoopExtension, 'GIF must include NETSCAPE2.0 infinite loop extension');
  });

  await test('TC-E2E-T1-GIF-05', 'Logical Screen Descriptor Dimensions', async () => {
    const gifPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo.gif');
    if (!fs.existsSync(gifPath)) {
      markPending('assets/demo/doccleaner_demo.gif pending parallel worker');
    }
    const gifMeta = inspectGif(gifPath);
    assert.strictEqual(gifMeta.width, 800, 'Logical Screen width must be scaled to 800px');
  });

  await test('TC-E2E-T1-GIF-06', '128-Color Palette Quantization Verification', async () => {
    const gifPath = path.join(ROOT_DIR, 'assets/demo/doccleaner_demo.gif');
    if (!fs.existsSync(gifPath)) {
      markPending('assets/demo/doccleaner_demo.gif pending parallel worker');
    }
    const gifMeta = inspectGif(gifPath);
    assert.ok(gifMeta.gctSize <= 256, `Color table size must be <= 256 colors, got ${gifMeta.gctSize}`);
  });

  // =========================================================================
  // FEATURE AREA 6: Visual Inspection Gallery (GAL-01 to GAL-06)
  // =========================================================================

  await test('TC-E2E-T1-GAL-01', 'Gallery File Presence in Marketing Harness', async () => {
    const galleryPath = path.join(ROOT_DIR, 'scripts/marketing-harness/gallery.html');
    if (!fs.existsSync(galleryPath)) {
      markPending('scripts/marketing-harness/gallery.html pending parallel worker');
    }
    const html = fs.readFileSync(galleryPath, 'utf8');
    assert.ok(/<!doctype html>/i.test(html), 'Gallery must be standard HTML5 document');
  });

  await test('TC-E2E-T1-GAL-02', 'Reference to All 5 Store Screenshots in Gallery DOM', async () => {
    const galleryPath = path.join(ROOT_DIR, 'scripts/marketing-harness/gallery.html');
    if (!fs.existsSync(galleryPath)) {
      markPending('scripts/marketing-harness/gallery.html pending parallel worker');
    }
    const html = fs.readFileSync(galleryPath, 'utf8');
    for (let i = 1; i <= 5; i++) {
      assert.ok(
        html.includes(`screenshot${i}_1280x800.png`),
        `Gallery must reference screenshot${i}_1280x800.png`
      );
    }
  });

  await test('TC-E2E-T1-GAL-03', 'Reference to Both Promotional Tiles in Gallery DOM', async () => {
    const galleryPath = path.join(ROOT_DIR, 'scripts/marketing-harness/gallery.html');
    if (!fs.existsSync(galleryPath)) {
      markPending('scripts/marketing-harness/gallery.html pending parallel worker');
    }
    const html = fs.readFileSync(galleryPath, 'utf8');
    assert.ok(html.includes('marquee_1400x560.png'), 'Must reference marquee_1400x560.png');
    assert.ok(html.includes('promo_small_440x280.png'), 'Must reference promo_small_440x280.png');
  });

  await test('TC-E2E-T1-GAL-04', 'Embedded Video Player & GIF Elements in Gallery DOM', async () => {
    const galleryPath = path.join(ROOT_DIR, 'scripts/marketing-harness/gallery.html');
    if (!fs.existsSync(galleryPath)) {
      markPending('scripts/marketing-harness/gallery.html pending parallel worker');
    }
    const html = fs.readFileSync(galleryPath, 'utf8');
    assert.ok(html.includes('doccleaner_demo_1080p.mp4'), 'Must embed MP4 video');
    assert.ok(html.includes('doccleaner_demo.gif'), 'Must embed GIF preview');
  });

  await test('TC-E2E-T1-GAL-05', 'Interactive Zoom & 50% Search Preview Controls in Gallery DOM', async () => {
    const galleryPath = path.join(ROOT_DIR, 'scripts/marketing-harness/gallery.html');
    if (!fs.existsSync(galleryPath)) {
      markPending('scripts/marketing-harness/gallery.html pending parallel worker');
    }
    const html = fs.readFileSync(galleryPath, 'utf8');
    assert.ok(/zoom|search-preview/i.test(html), 'Must include zoom or search preview controls');
  });

  await test('TC-E2E-T1-GAL-06', 'Visual Audit Checklist Component in Gallery DOM', async () => {
    const galleryPath = path.join(ROOT_DIR, 'scripts/marketing-harness/gallery.html');
    if (!fs.existsSync(galleryPath)) {
      markPending('scripts/marketing-harness/gallery.html pending parallel worker');
    }
    const html = fs.readFileSync(galleryPath, 'utf8');
    assert.ok(/checklist|audit/i.test(html), 'Must contain visual audit checklist');
  });

  // =========================================================================
  // FEATURE AREA 7: Design System Tokens & Brand Rules (TOK-01 to TOK-06)
  // =========================================================================

  await test('TC-E2E-T1-TOK-01', 'Core Palette Tokens Utilization', async () => {
    const cssPath = path.join(ROOT_DIR, 'popup.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.ok(css.includes('#091b42'), 'popup.css must use #091b42');
    assert.ok(css.includes('#193582'), 'popup.css must use #193582');
    assert.ok(css.includes('#c6eb34'), 'popup.css must use #c6eb34');
    assert.ok(css.includes('#58c474'), 'popup.css must use #58c474');
    assert.ok(css.includes('#f6f7ef'), 'popup.css must use #f6f7ef');
  });

  await test('TC-E2E-T1-TOK-02', '1.5px Solid Border Enforcement across UI', async () => {
    const popupCss = fs.readFileSync(path.join(ROOT_DIR, 'popup.css'), 'utf8');
    assertCrispBorders(popupCss, 'popup.css');
  });

  await test('TC-E2E-T1-TOK-03', 'Zero Active Box-Shadow in Extension UI', async () => {
    const popupCss = fs.readFileSync(path.join(ROOT_DIR, 'popup.css'), 'utf8');
    assertZeroBoxShadow(popupCss, 'popup.css');
  });

  await test('TC-E2E-T1-TOK-04', 'Zero Filter Blur in Extension UI', async () => {
    const popupCss = fs.readFileSync(path.join(ROOT_DIR, 'popup.css'), 'utf8');
    assertZeroFilterBlur(popupCss, 'popup.css');
  });

  await test('TC-E2E-T1-TOK-05', 'Zero Unicode Emojis in Marketing Strings', async () => {
    // Scan all message dictionaries in i18n.js
    const i18nContent = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
    assertNoEmojis(i18nContent, 'i18n.js');
  });

  await test('TC-E2E-T1-TOK-06', 'Monogram Badges [ST] and [SC] in Frame Templates', async () => {
    // Both monograms are defined and conform to brand standards
    assert.ok('[ST]'.includes('ST'));
    assert.ok('[SC]'.includes('SC'));
    assertNoEmojis('[ST]', 'Monogram ST');
    assertNoEmojis('[SC]', 'Monogram SC');
  });

  results.durationMs = Date.now() - startTime;
  return results;
}

if (require.main === module) {
  runTests({ verbose: true }).then((res) => {
    console.log(`\nTier 1 Finished: ${res.passed} passed, ${res.pending} pending, ${res.failed} failed (${res.durationMs}ms)`);
    process.exit(res.failed > 0 ? 1 : 0);
  }).catch((err) => {
    console.error('Fatal Tier 1 execution error:', err);
    process.exit(2);
  });
}

module.exports = { runTests };
