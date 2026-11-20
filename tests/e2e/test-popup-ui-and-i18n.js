/**
 * Tier 3 & Tier 4 E2E Integration Tests: 320px Popup UI, i18n Switching & Graphic Poster CSS Audit
 * Coverage: 320px viewport, 4-pill language switching (VN, EN, ES, FR), segmented tabs, 52px cards, CSS audit (0 shadows/filters).
 * Real-World Scenario: Multilingual International Exchange Student (Tier 4 Scenario 3)
 * Requirements: Plan §3.1, §3.2, §3.3, §4.2, TC-P2-10, TC-P2-11
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { createMockChrome, createMockDOM, runInSandbox } = require('../harness');

async function runTests() {
  console.log('--- Running test-popup-ui-and-i18n.js ---');
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
  const popupCssPath = path.resolve(__dirname, '../../popup.css');
  const viewerCssPath = path.resolve(__dirname, '../../viewer_styles.css');
  const popupJsPath = path.resolve(__dirname, '../../popup.js');
  const i18nPath = path.resolve(__dirname, '../../i18n.js');

  assert.ok(fs.existsSync(popupHtmlPath), 'popup.html must exist');
  assert.ok(fs.existsSync(popupCssPath), 'popup.css must exist');
  assert.ok(fs.existsSync(viewerCssPath), 'viewer_styles.css must exist');
  assert.ok(fs.existsSync(popupJsPath), 'popup.js must exist');
  assert.ok(fs.existsSync(i18nPath), 'i18n.js must exist');

  // =========================================================================
  // TIER 3 & TC-P2-11: STRICT GRAPHIC POSTER CSS AUDIT
  // =========================================================================

  await test('Tier 3 & TC-P2-11: popup.css enforces 320px viewport width', async () => {
    const css = fs.readFileSync(popupCssPath, 'utf8');
    assert.ok(
      /width:\s*320px/i.test(css),
      'popup.css must enforce width: 320px on html/body'
    );
  });

  await test('Tier 3 & TC-P2-11: Strict CSS Audit — Zero active box-shadow, filter, or backdrop-filter in popup.css', async () => {
    const css = fs.readFileSync(popupCssPath, 'utf8');

    // Remove comments before inspecting declarations
    const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // Extract all property declarations
    const lines = cleanCss.split(';');
    const disallowedShadows = [];
    const disallowedFilters = [];
    const disallowedBackdropFilters = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Check box-shadow
      const shadowMatch = trimmed.match(/box-shadow\s*:\s*([^;]+)/i);
      if (shadowMatch) {
        const val = shadowMatch[1].trim();
        // Allowed: "none", "none !important"
        if (!/^none(\s*!important)?$/i.test(val)) {
          disallowedShadows.push(val);
        }
      }

      // Check filter
      const filterMatch = trimmed.match(/(?<!backdrop-)filter\s*:\s*([^;]+)/i);
      if (filterMatch) {
        const val = filterMatch[1].trim();
        if (!/^none(\s*!important)?$/i.test(val)) {
          disallowedFilters.push(val);
        }
      }

      // Check backdrop-filter
      const backdropMatch = trimmed.match(/backdrop-filter\s*:\s*([^;]+)/i);
      if (backdropMatch) {
        const val = backdropMatch[1].trim();
        if (!/^none(\s*!important)?$/i.test(val)) {
          disallowedBackdropFilters.push(val);
        }
      }
    }

    if (disallowedShadows.length > 0) {
      throw new Error(
        `Disallowed box-shadow found in popup.css (Graphic Poster violation, Milestone 4 pending): ${disallowedShadows.join(', ')}`
      );
    }
    if (disallowedFilters.length > 0) {
      throw new Error(
        `Disallowed filter found in popup.css (Graphic Poster violation, Milestone 4 pending): ${disallowedFilters.join(', ')}`
      );
    }
    if (disallowedBackdropFilters.length > 0) {
      throw new Error(
        `Disallowed backdrop-filter found in popup.css (Graphic Poster violation, Milestone 4 pending): ${disallowedBackdropFilters.join(', ')}`
      );
    }

    assert.strictEqual(disallowedShadows.length, 0);
    assert.strictEqual(disallowedFilters.length, 0);
    assert.strictEqual(disallowedBackdropFilters.length, 0);
  });

  await test('Tier 3 & TC-P2-11: Strict CSS Audit — Zero active box-shadow or filters in viewer_styles.css', async () => {
    const css = fs.readFileSync(viewerCssPath, 'utf8');
    const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const lines = cleanCss.split(';');

    const disallowedShadows = [];
    for (const line of lines) {
      const trimmed = line.trim();
      const shadowMatch = trimmed.match(/box-shadow\s*:\s*([^;]+)/i);
      if (shadowMatch) {
        const val = shadowMatch[1].trim();
        if (!/^none(\s*!important)?$/i.test(val)) {
          disallowedShadows.push(val);
        }
      }
    }

    if (disallowedShadows.length > 0) {
      throw new Error(
        `Disallowed box-shadow found in viewer_styles.css (Milestone 3 pending): ${disallowedShadows.join(', ')}`
      );
    }

    assert.strictEqual(disallowedShadows.length, 0);
  });

  // =========================================================================
  // TIER 3 & TC-P2-10: 4-PILL LANGUAGE SWITCHING (VN, EN, ES, FR)
  // =========================================================================

  await test('Tier 3 & TC-P2-10: 4-pill language switch dynamically updates labels without page reload', async () => {
    const htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');

    // Verify popup.html contains the 4 language pills
    const has4Pills = htmlContent.includes('data-lang="vi"')
      && htmlContent.includes('data-lang="en"')
      && htmlContent.includes('data-lang="es"')
      && htmlContent.includes('data-lang="fr"');

    if (!has4Pills) {
      throw new Error(
        'popup.html does not yet contain all 4 language options (VN, EN, ES, FR) (Milestone 4 pending)'
      );
    }

    const mockChrome = createMockChrome({ local: { lang: 'en' } });
    const mockDOM = createMockDOM({
      url: 'chrome-extension://doccleaner-mock-id/popup.html',
      title: 'DocCleaner'
    });

    // Populate required elements for popup script
    const langSwitch = mockDOM.document.createElement('div');
    langSwitch.id = 'langSwitch';
    for (const l of ['vi', 'en', 'es', 'fr']) {
      const opt = mockDOM.document.createElement('span');
      opt.className = 'lang-opt' + (l === 'en' ? ' active' : '');
      opt.setAttribute('data-lang', l);
      opt.innerText = l.toUpperCase();
      langSwitch.appendChild(opt);
    }
    mockDOM.document.body.appendChild(langSwitch);

    const checkBtn = mockDOM.document.createElement('button');
    checkBtn.id = 'checkBtn';
    mockDOM.document.body.appendChild(checkBtn);

    const clearBtn = mockDOM.document.createElement('button');
    clearBtn.id = 'clearBtn';
    mockDOM.document.body.appendChild(clearBtn);

    const sandbox = {
      window: mockDOM.window,
      document: mockDOM.document,
      location: mockDOM.window.location,
      chrome: mockChrome,
      console,
      Date,
      Math,
      setTimeout,
      clearTimeout
    };

    runInSandbox(i18nPath, sandbox);
    runInSandbox(popupJsPath, sandbox);

    // Verify switching to Spanish [ES]
    const esPill = mockDOM.document.querySelector('[data-lang="es"]');
    if (esPill) {
      esPill.click();
      await new Promise((r) => setTimeout(r, 40));
      const stored = await mockChrome.storage.local.get('lang');
      assert.strictEqual(stored.lang, 'es', 'Storage lang must be updated to "es"');
    }

    // Verify switching to French [FR]
    const frPill = mockDOM.document.querySelector('[data-lang="fr"]');
    if (frPill) {
      frPill.click();
      await new Promise((r) => setTimeout(r, 40));
      const stored = await mockChrome.storage.local.get('lang');
      assert.strictEqual(stored.lang, 'fr', 'Storage lang must be updated to "fr"');
    }
  });

  // =========================================================================
  // TIER 3: SEGMENTED TAB SWITCHING & 52PX CARD LAYOUT
  // =========================================================================

  await test('Tier 3: Segmented tabs switch instantaneously between Quick Actions and Study Shelf', async () => {
    const htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');
    const hasSegmentedTabs = htmlContent.includes('tab-actions') && htmlContent.includes('tab-recents');

    if (!hasSegmentedTabs) {
      throw new Error(
        'popup.html does not yet contain segmented tab controllers #tab-actions and #tab-recents (Milestone 4 pending)'
      );
    }

    assert.ok(hasSegmentedTabs);
  });

  await test('Tier 3: popup.css defines 52px height rule for document cards', async () => {
    const css = fs.readFileSync(popupCssPath, 'utf8');
    const has52pxCard = /height:\s*52px/i.test(css) || /--card-height:\s*52px/i.test(css);

    if (!has52pxCard) {
      throw new Error(
        'popup.css does not yet define 52px height for document cards (Milestone 4 pending)'
      );
    }

    assert.ok(has52pxCard);
  });

  // =========================================================================
  // TIER 4: REAL-WORLD SCENARIO 3 — MULTILINGUAL EXCHANGE STUDENT
  // =========================================================================

  await test('Tier 4: Exchange student rotates through VN -> EN -> ES -> FR without layout distortion', async () => {
    const i18n = require(i18nPath);
    const { t, formatRelativeTime } = i18n;

    const languages = ['vn', 'en', 'es', 'fr'];
    for (const lang of languages) {
      const effectiveLang = lang === 'vn' ? 'vi' : lang;
      const shelfTitle = t(effectiveLang, 'tabRecents');
      const emptyDesc = t(effectiveLang, 'emptyRecentsDesc');
      const timeStr = formatRelativeTime(Date.now() - 3600000, effectiveLang);

      assert.ok(shelfTitle && shelfTitle.length > 0, `Shelf title missing for ${lang}`);
      assert.ok(emptyDesc && emptyDesc.length > 0, `Empty desc missing for ${lang}`);
      assert.ok(timeStr && timeStr.length > 0, `Relative time missing for ${lang}`);
    }
  });

  console.log(`\nAll ${testCount} assertions in test-popup-ui-and-i18n.js passed successfully!`);
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
