/**
 * Tier 1 & Tier 2 Unit Tests: In-Page Metadata Extraction & SPA Observer
 * Coverage: Studocu & Scribd metadata extractors, canonical URL normalization, deterministic ID hashing, SPA route observer.
 * Requirements: Plan §2.3, TC-P2-01, TC-P2-05, TC-P2-06
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { createMockChrome, createMockDOM, runInSandbox } = require('../harness');

async function runTests() {
  console.log('--- Running test-metadata.js ---');
  let testCount = 0;

  function test(name, fn) {
    return (async () => {
      try {
        await fn();
        testCount++;
        console.log(`  ✓ ${name}`);
      } catch (err) {
        console.error(`  ✗ ${name}`);
        throw err;
      }
    })();
  }

  const contentJsPath = path.resolve(__dirname, '../../content.js');
  const scribdJsPath = path.resolve(__dirname, '../../scribd_handler.js');
  assert.ok(fs.existsSync(contentJsPath), 'content.js must exist');
  assert.ok(fs.existsSync(scribdJsPath), 'scribd_handler.js must exist');

  /**
   * Helper to load content script into a sandbox with given mock DOM
   */
  function setupExtractorEnvironment(mockDOM, platform = 'studocu') {
    const mockChrome = createMockChrome();
    const sandbox = {
      window: mockDOM.window,
      document: mockDOM.document,
      location: mockDOM.window.location,
      history: mockDOM.window.history,
      chrome: mockChrome,
      console,
      Date,
      Math,
      setTimeout: mockDOM.window.setTimeout,
      clearTimeout: mockDOM.window.clearTimeout
    };

    // Also load i18n so sanitizeTitle is available if needed
    const i18nPath = path.resolve(__dirname, '../../i18n.js');
    if (fs.existsSync(i18nPath)) {
      try {
        runInSandbox(i18nPath, sandbox);
      } catch (e) {}
    }

    const scriptPath = platform === 'studocu' ? contentJsPath : scribdJsPath;
    runInSandbox(scriptPath, sandbox);

    const extractFn = sandbox.extractPageMetadata
      || sandbox.window.extractPageMetadata
      || (sandbox.window.DocCleaner && sandbox.window.DocCleaner.extractPageMetadata);

    if (typeof extractFn !== 'function') {
      throw new Error(`extractPageMetadata not yet defined in ${path.basename(scriptPath)} (Milestone 3 pending)`);
    }

    return { extractFn, sandbox, mockChrome };
  }

  // =========================================================================
  // TIER 1 & TC-P2-01: STUDOCU METADATA EXTRACTION
  // =========================================================================

  await test('Tier 1 & TC-P2-01: Studocu title extraction from h1[data-qa="document-title"]', async () => {
    const mockDOM = createMockDOM({
      url: 'https://www.studocu.com/en/document/harvard-university/microeconomics/sample-doc/12345?ref=search',
      title: 'Fallback Studocu Title - Studocu'
    });

    const h1 = mockDOM.document.createElement('h1');
    h1.setAttribute('data-qa', 'document-title');
    h1.innerText = 'Principles of Microeconomics 2026';
    mockDOM.document.body.appendChild(h1);

    // Add 10 page elements
    for (let i = 0; i < 10; i++) {
      const page = mockDOM.document.createElement('div');
      page.setAttribute('data-page-index', i.toString());
      mockDOM.document.body.appendChild(page);
    }

    const { extractFn } = setupExtractorEnvironment(mockDOM, 'studocu');
    const meta = extractFn('studocu');

    assert.strictEqual(meta.platform, 'studocu');
    assert.strictEqual(meta.title, 'Principles of Microeconomics 2026');
    assert.strictEqual(meta.pageCount, 10);
    assert.strictEqual(
      meta.canonicalUrl,
      'https://www.studocu.com/en/document/harvard-university/microeconomics/sample-doc/12345'
    );
    assert.ok(meta.id.startsWith('stu_'), `ID should start with stu_: ${meta.id}`);
  });

  await test('Tier 2: Studocu extraction fallback hierarchy (og:title, NEXT_DATA, document.title)', async () => {
    // Priority 2: meta[property="og:title"]
    const mockDOM1 = createMockDOM({
      url: 'https://www.studocu.com/en/document/doc/999'
    });
    const metaTag = mockDOM1.document.createElement('meta');
    metaTag.setAttribute('property', 'og:title');
    metaTag.setAttribute('content', 'OG Title Study Guide');
    mockDOM1.document.body.appendChild(metaTag);

    const { extractFn: extract1 } = setupExtractorEnvironment(mockDOM1, 'studocu');
    const res1 = extract1('studocu');
    assert.strictEqual(res1.title, 'OG Title Study Guide');

    // Priority 3: __NEXT_DATA__
    const mockDOM2 = createMockDOM({
      url: 'https://www.studocu.com/en/document/doc/888'
    });
    const nextScript = mockDOM2.document.createElement('script');
    nextScript.id = '__NEXT_DATA__';
    nextScript.textContent = JSON.stringify({
      props: {
        pageProps: {
          document: { title: 'NextJS Hydrated Title' },
          documentAccess: { signedQueryParams: { pages: new Array(18).fill({}) } }
        }
      }
    });
    mockDOM2.document.body.appendChild(nextScript);

    const { extractFn: extract2 } = setupExtractorEnvironment(mockDOM2, 'studocu');
    const res2 = extract2('studocu');
    assert.strictEqual(res2.title, 'NextJS Hydrated Title');
    assert.strictEqual(res2.pageCount, 18);
  });

  // =========================================================================
  // TIER 1 & TC-P2-06: SCRIBD METADATA EXTRACTION
  // =========================================================================

  await test('Tier 1 & TC-P2-06: Scribd title and page count extraction', async () => {
    const mockDOM = createMockDOM({
      url: 'https://www.scribd.com/document/7654321/Fluid-Mechanics-Cheat-Sheet?token=xyz#page=2',
      title: 'Fluid Mechanics Cheat Sheet | Scribd'
    });

    const titleEl = mockDOM.document.createElement('div');
    titleEl.className = 'document_title';
    titleEl.innerText = 'Fluid Mechanics Cheat Sheet';
    mockDOM.document.body.appendChild(titleEl);

    const counter = mockDOM.document.createElement('span');
    counter.className = 'page_counter';
    counter.innerText = 'Page 2 of 28';
    mockDOM.document.body.appendChild(counter);

    const { extractFn } = setupExtractorEnvironment(mockDOM, 'scribd');
    const meta = extractFn('scribd');

    assert.strictEqual(meta.platform, 'scribd');
    assert.strictEqual(meta.title, 'Fluid Mechanics Cheat Sheet');
    assert.strictEqual(meta.pageCount, 28);
    assert.strictEqual(
      meta.canonicalUrl,
      'https://www.scribd.com/document/7654321/Fluid-Mechanics-Cheat-Sheet'
    );
    assert.ok(meta.id.startsWith('scr_'), `Scribd ID must start with scr_: ${meta.id}`);
  });

  await test('Tier 2 & TC-P2-06: Scribd title strips trailing " | Scribd" if using fallback document.title', async () => {
    const mockDOM = createMockDOM({
      url: 'https://www.scribd.com/document/112233/Advanced-Biochemistry',
      title: 'Advanced Biochemistry Final Exam | Scribd'
    });

    const { extractFn } = setupExtractorEnvironment(mockDOM, 'scribd');
    const meta = extractFn('scribd');

    assert.strictEqual(meta.title, 'Advanced Biochemistry Final Exam');
    assert.ok(!meta.title.includes('Scribd'), 'Must strip trailing brand');
  });

  // =========================================================================
  // TIER 1 & 2: CANONICAL URL & DETERMINISTIC ID HASHING
  // =========================================================================

  await test('Tier 1: Canonical URL normalizes by stripping tracking query params and hashes', async () => {
    const mockDOM = createMockDOM({
      url: 'https://www.studocu.com/vn/document/dh-kinh-te/kinh-te-vi-mo/de-thi-2025/998877?utm_source=chat&utm_medium=link#section-3'
    });
    const h1 = mockDOM.document.createElement('h1');
    h1.setAttribute('data-qa', 'document-title');
    h1.innerText = 'De Thi Kinh Te Vi Mo';
    mockDOM.document.body.appendChild(h1);

    const { extractFn } = setupExtractorEnvironment(mockDOM, 'studocu');
    const meta = extractFn('studocu');

    assert.strictEqual(
      meta.canonicalUrl,
      'https://www.studocu.com/vn/document/dh-kinh-te/kinh-te-vi-mo/de-thi-2025/998877',
      'Canonical URL must strip query parameters and hash anchors'
    );
  });

  await test('Tier 2: Deterministic ID produces identical ID for identical canonical URLs', async () => {
    const mockDOM1 = createMockDOM({
      url: 'https://www.studocu.com/en/document/test-course/lecture-1/1000?ref=1'
    });
    const mockDOM2 = createMockDOM({
      url: 'https://www.studocu.com/en/document/test-course/lecture-1/1000?ref=2#page=4'
    });
    mockDOM1.document.body.appendChild(mockDOM1.document.createElement('h1')).innerText = 'Doc 1';
    mockDOM2.document.body.appendChild(mockDOM2.document.createElement('h1')).innerText = 'Doc 1';

    const { extractFn: extract1 } = setupExtractorEnvironment(mockDOM1, 'studocu');
    const { extractFn: extract2 } = setupExtractorEnvironment(mockDOM2, 'studocu');

    const meta1 = extract1('studocu');
    const meta2 = extract2('studocu');

    assert.strictEqual(meta1.id, meta2.id, 'Identical canonical URLs must yield identical deterministic ID');
  });

  // =========================================================================
  // TIER 2 & TC-P2-05: SPA ROUTE OBSERVER
  // =========================================================================

  await test('Tier 2 & TC-P2-05: observeSpaNavigation triggers callback on pushState / replaceState with 400ms debounce', async () => {
    const mockDOM = createMockDOM({
      url: 'https://www.studocu.com/en/document/doc-one/1'
    });

    const sandbox = {
      window: mockDOM.window,
      document: mockDOM.document,
      location: mockDOM.window.location,
      history: mockDOM.window.history,
      chrome: createMockChrome(),
      console,
      Date,
      Math,
      setTimeout: (fn, ms) => setTimeout(fn, ms),
      clearTimeout: (id) => clearTimeout(id)
    };

    runInSandbox(contentJsPath, sandbox);

    const observeFn = sandbox.observeSpaNavigation
      || sandbox.window.observeSpaNavigation
      || (sandbox.window.DocCleaner && sandbox.window.DocCleaner.observeSpaNavigation);

    if (typeof observeFn !== 'function') {
      throw new Error('observeSpaNavigation not yet defined in content.js (Milestone 3 pending)');
    }

    let notifiedCount = 0;
    observeFn(() => {
      notifiedCount++;
    });

    // Simulate SPA navigation via pushState
    mockDOM.window.history.pushState({}, '', '/en/document/doc-two/2');

    // Before debounce (immediate), callback should not have fired yet
    assert.strictEqual(notifiedCount, 0, 'Should debounce for React hydration');

    // Wait for 500ms to allow 400ms debounce to fire
    await new Promise((r) => setTimeout(r, 500));
    assert.strictEqual(notifiedCount, 1, 'Callback should fire once after debounce');
  });

  console.log(`\nAll ${testCount} assertions in test-metadata.js passed successfully!`);
  return { passed: testCount, failed: 0 };
}

if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\nTest failed with error:', err.message);
      process.exit(1);
    });
}

module.exports = { runTests };
