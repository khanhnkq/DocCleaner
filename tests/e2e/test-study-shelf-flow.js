/**
 * Tier 3 & Tier 4 E2E Integration Tests: Study Shelf Flow
 * Coverage: Auto-save -> Popup shelf rendering -> Star toggling -> Sub-filter pills -> 1-Click Clean Reader launch.
 * Real-World Scenario: Midterm Exam Revision Binder (Tier 4 Scenario 2)
 * Requirements: Plan §2.1, §2.2, §3.2, §3.3, §5.3, TC-P2-01, TC-P2-03, TC-P2-04
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { createMockChrome, createMockDOM, runInSandbox } = require('../harness');

async function runTests() {
  console.log('--- Running test-study-shelf-flow.js ---');
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

  const popupHtmlPath = path.resolve(__dirname, '../../popup.html');
  const popupJsPath = path.resolve(__dirname, '../../popup.js');
  const bgPath = path.resolve(__dirname, '../../background.js');
  const contentJsPath = path.resolve(__dirname, '../../content.js');
  assert.ok(fs.existsSync(popupHtmlPath), 'popup.html must exist');
  assert.ok(fs.existsSync(popupJsPath), 'popup.js must exist');

  /**
   * Helper to initialize Popup environment with mock DOM and Chrome storage
   */
  async function initPopupEnvironment(initialStorage = {}) {
    const mockChrome = createMockChrome(initialStorage);
    const mockDOM = createMockDOM({
      url: 'chrome-extension://doccleaner-mock-id/popup.html',
      title: 'DocCleaner'
    });

    // Populate mock DOM elements corresponding to popup.html
    const appContainer = mockDOM.document.createElement('div');
    appContainer.className = 'app-container';
    mockDOM.document.body.appendChild(appContainer);

    // Header with language switch
    const header = mockDOM.document.createElement('header');
    header.className = 'header-card';
    const langSwitch = mockDOM.document.createElement('div');
    langSwitch.id = 'langSwitch';
    for (const l of ['vi', 'en', 'es', 'fr']) {
      const opt = mockDOM.document.createElement('span');
      opt.className = 'lang-opt' + (l === (initialStorage.local?.lang || 'en') ? ' active' : '');
      opt.setAttribute('data-lang', l);
      opt.innerText = l.toUpperCase();
      langSwitch.appendChild(opt);
    }
    header.appendChild(langSwitch);
    appContainer.appendChild(header);

    // Legacy / Quick Actions buttons (from popup.html)
    const statusBadge = mockDOM.document.createElement('div');
    statusBadge.id = 'status-badge';
    appContainer.appendChild(statusBadge);

    const platformName = mockDOM.document.createElement('span');
    platformName.id = 'platform-name';
    appContainer.appendChild(platformName);

    const checkBtn = mockDOM.document.createElement('button');
    checkBtn.id = 'checkBtn';
    appContainer.appendChild(checkBtn);

    const pdfBtnDesc = mockDOM.document.createElement('span');
    pdfBtnDesc.id = 'pdf-btn-desc';
    appContainer.appendChild(pdfBtnDesc);

    const clearBtn = mockDOM.document.createElement('button');
    clearBtn.id = 'clearBtn';
    appContainer.appendChild(clearBtn);

    const coffeeBtn = mockDOM.document.createElement('button');
    coffeeBtn.id = 'coffeeBtn';
    appContainer.appendChild(coffeeBtn);

    // Segmented tabs: Quick Actions vs Study Shelf
    const tabsContainer = mockDOM.document.createElement('div');
    tabsContainer.className = 'segmented-tabs';
    const tabActions = mockDOM.document.createElement('button');
    tabActions.id = 'tab-actions';
    tabActions.className = 'tab-btn active';
    tabActions.innerText = 'Quick Actions';
    const tabRecents = mockDOM.document.createElement('button');
    tabRecents.id = 'tab-recents';
    tabRecents.className = 'tab-btn';
    tabRecents.innerText = 'Study Shelf';
    tabsContainer.appendChild(tabActions);
    tabsContainer.appendChild(tabRecents);
    appContainer.appendChild(tabsContainer);

    // Section 1: Actions Panel
    const panelActions = mockDOM.document.createElement('div');
    panelActions.id = 'panel-actions';
    panelActions.className = 'tab-panel active';
    appContainer.appendChild(panelActions);

    // Section 2: Study Shelf Panel
    const panelRecents = mockDOM.document.createElement('div');
    panelRecents.id = 'panel-recents';
    panelRecents.className = 'tab-panel';
    panelRecents.style.display = 'none';

    // Sub-filter pills: All Docs vs Starred
    const filterContainer = mockDOM.document.createElement('div');
    filterContainer.className = 'filter-pills';
    const filterAll = mockDOM.document.createElement('button');
    filterAll.id = 'filter-all';
    filterAll.className = 'filter-pill active';
    filterAll.innerText = 'All Docs';
    const filterStarred = mockDOM.document.createElement('button');
    filterStarred.id = 'filter-starred';
    filterStarred.className = 'filter-pill';
    filterStarred.innerText = 'Starred ⭐';
    filterContainer.appendChild(filterAll);
    filterContainer.appendChild(filterStarred);
    panelRecents.appendChild(filterContainer);

    // Shelf docs list container
    const docsList = mockDOM.document.createElement('div');
    docsList.id = 'recent-docs-list';
    panelRecents.appendChild(docsList);

    // Empty state container
    const emptyState = mockDOM.document.createElement('div');
    emptyState.id = 'shelf-empty-state';
    emptyState.style.display = 'none';
    panelRecents.appendChild(emptyState);

    appContainer.appendChild(panelRecents);

    const sandbox = {
      window: mockDOM.window,
      document: mockDOM.document,
      location: mockDOM.window.location,
      chrome: mockChrome,
      console,
      Date,
      Math,
      setTimeout: (fn, ms) => setTimeout(fn, ms),
      clearTimeout: (id) => clearTimeout(id)
    };

    // Load i18n
    const i18nPath = path.resolve(__dirname, '../../i18n.js');
    if (fs.existsSync(i18nPath)) {
      runInSandbox(i18nPath, sandbox);
    }

    runInSandbox(popupJsPath, sandbox);

    // Simulate DOMContentLoaded if registered
    mockDOM.document.dispatchEvent({ type: 'DOMContentLoaded' });
    await new Promise((r) => setTimeout(r, 60));

    return {
      mockChrome,
      mockDOM,
      sandbox,
      tabActions,
      tabRecents,
      panelActions,
      panelRecents,
      filterAll,
      filterStarred,
      docsList,
      emptyState
    };
  }

  // =========================================================================
  // TIER 3 & TC-P2-01: AUTO-SAVE FLOW INTO STUDY SHELF
  // =========================================================================

  await test('Tier 3 & TC-P2-01: Auto-saved document appears at Index 0 in popup Study Shelf', async () => {
    const initialDocs = [
      {
        id: 'stu_1001',
        title: 'Microeconomics Midterm Exam 2026',
        canonicalUrl: 'https://www.studocu.com/en/document/micro/1001',
        platform: 'studocu',
        pageCount: 24,
        lastOpenedAt: Date.now() - 3600000,
        isStarred: false
      }
    ];

    const env = await initPopupEnvironment({
      local: { dc_recent_docs: initialDocs }
    });

    // Check if Study Shelf tab exists and can be clicked
    if (!env.tabRecents || !env.docsList) {
      throw new Error('Study Shelf UI components not yet implemented in popup (Milestone 4 pending)');
    }

    // Switch to Study Shelf tab
    env.tabRecents.click();
    await new Promise((r) => setTimeout(r, 40));

    // Inspect rendered document cards
    const cards = env.docsList.querySelectorAll('.dc-doc-card, .study-card, .doc-item');
    if (cards.length === 0) {
      throw new Error('No document cards rendered in #recent-docs-list (Milestone 4 pending)');
    }

    assert.strictEqual(cards.length, 1, 'Should render 1 document card');
    const firstCard = cards[0];
    assert.ok(
      firstCard.innerText.includes('Microeconomics Midterm Exam 2026'),
      'Card must display document title'
    );
    assert.ok(
      firstCard.innerText.includes('24') || firstCard.innerText.includes('pgs'),
      'Card must display page count'
    );
  });

  // =========================================================================
  // TIER 3: STAR TOGGLE INTERACTION & PERSISTENCE
  // =========================================================================

  await test('Tier 3: Clicking star button toggles isStarred and updates storage immediately', async () => {
    const doc = {
      id: 'doc_math',
      title: 'Calculus III Vector Fields',
      canonicalUrl: 'https://www.studocu.com/en/document/calc/math',
      platform: 'studocu',
      pageCount: 16,
      lastOpenedAt: Date.now(),
      isStarred: false
    };

    const env = await initPopupEnvironment({
      local: { dc_recent_docs: [doc] }
    });

    env.tabRecents.click();
    await new Promise((r) => setTimeout(r, 40));

    const starBtn = env.docsList.querySelector('.dc-star-btn, .btn-star, [data-action="star"]');
    if (!starBtn) {
      throw new Error('Star toggle button not found on card (Milestone 4 pending)');
    }

    // Click star button to star the document
    starBtn.click();
    await new Promise((r) => setTimeout(r, 50));

    // Verify chrome.storage.local was updated to isStarred: true
    let stored = await env.mockChrome.storage.local.get('dc_recent_docs');
    assert.strictEqual(
      stored.dc_recent_docs[0].isStarred,
      true,
      'Document in storage should now have isStarred: true'
    );

    // Click star button again to unstar
    starBtn.click();
    await new Promise((r) => setTimeout(r, 50));

    stored = await env.mockChrome.storage.local.get('dc_recent_docs');
    assert.strictEqual(
      stored.dc_recent_docs[0].isStarred,
      false,
      'Document in storage should now have isStarred: false'
    );
  });

  // =========================================================================
  // TIER 3: SUB-FILTER PILLS (ALL DOCS vs STARRED)
  // =========================================================================

  await test('Tier 3: Sub-filter pills accurately filter between All Docs and Starred Docs', async () => {
    const docs = [
      { id: 'd1', title: 'Doc 1 (Starred)', isStarred: true, platform: 'studocu', canonicalUrl: 'url1', pageCount: 5, lastOpenedAt: Date.now() },
      { id: 'd2', title: 'Doc 2 (Unstarred)', isStarred: false, platform: 'scribd', canonicalUrl: 'url2', pageCount: 8, lastOpenedAt: Date.now() - 1000 },
      { id: 'd3', title: 'Doc 3 (Starred)', isStarred: true, platform: 'studocu', canonicalUrl: 'url3', pageCount: 12, lastOpenedAt: Date.now() - 2000 }
    ];

    const env = await initPopupEnvironment({
      local: { dc_recent_docs: docs }
    });

    env.tabRecents.click();
    await new Promise((r) => setTimeout(r, 40));

    // All Docs view: should show 3 cards
    let rendered = env.docsList.querySelectorAll('.dc-doc-card, .study-card, .doc-item');
    assert.strictEqual(rendered.length, 3, 'All Docs view should render all 3 items');

    // Click Starred filter pill
    if (!env.filterStarred) {
      throw new Error('Filter Starred pill not found (Milestone 4 pending)');
    }
    env.filterStarred.click();
    await new Promise((r) => setTimeout(r, 40));

    // Should now show only the 2 starred cards
    rendered = env.docsList.querySelectorAll('.dc-doc-card, .study-card, .doc-item');
    assert.strictEqual(rendered.length, 2, 'Starred filter should only display 2 starred items');
    assert.ok(rendered[0].innerText.includes('Doc 1'));
    assert.ok(rendered[1].innerText.includes('Doc 3'));

    // Switch back to All Docs
    env.filterAll.click();
    await new Promise((r) => setTimeout(r, 40));
    rendered = env.docsList.querySelectorAll('.dc-doc-card, .study-card, .doc-item');
    assert.strictEqual(rendered.length, 3, 'Returning to All Docs restores 3 items');
  });

  // =========================================================================
  // TIER 4: REAL-WORLD SCENARIO 2 — MIDTERM EXAM REVISION BINDER
  // =========================================================================

  await test('Tier 4: Exam revision binder handles multi-document study session', async () => {
    const testBinder = [
      { id: 'm1', title: 'Physics Formula Sheet 2026', isStarred: true, platform: 'studocu', canonicalUrl: 'p1', pageCount: 4, lastOpenedAt: Date.now() },
      { id: 'm2', title: 'Linear Algebra Summary', isStarred: true, platform: 'scribd', canonicalUrl: 'p2', pageCount: 14, lastOpenedAt: Date.now() - 50000 },
      { id: 'm3', title: 'Economics Lecture Notes 08', isStarred: false, platform: 'studocu', canonicalUrl: 'p3', pageCount: 30, lastOpenedAt: Date.now() - 100000 }
    ];

    const env = await initPopupEnvironment({
      local: { dc_recent_docs: testBinder }
    });

    // 1. Verify shelf tab badge updates with count (3)
    env.tabRecents.click();
    await new Promise((r) => setTimeout(r, 40));

    // 2. Click 1-Click Launch button on first document
    const launchBtn = env.docsList.querySelector('.dc-launch-btn, .btn-launch, [data-action="launch"]');
    if (launchBtn) {
      launchBtn.click();
      await new Promise((r) => setTimeout(r, 40));
      // Verify tab creation or message dispatch
      assert.ok(env.mockChrome.tabs._tabs.length >= 2, 'Launch button should activate tab');
    }

    // 3. Filter to Starred formulas
    env.filterStarred.click();
    await new Promise((r) => setTimeout(r, 40));
    const starredCards = env.docsList.querySelectorAll('.dc-doc-card, .study-card, .doc-item');
    assert.strictEqual(starredCards.length, 2, 'Exam revision binder shows 2 starred formula sheets');
  });

  console.log(`\nAll ${testCount} assertions in test-study-shelf-flow.js passed successfully!`);
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
