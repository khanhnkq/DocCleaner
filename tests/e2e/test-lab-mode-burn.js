/**
 * Tier 3 & Tier 4 E2E Integration Tests: Lab PC Mode & "Clean & Burn" Protocol
 * Coverage: Lab mode toggle, session storage isolation, Clean & Burn message handler, cookie wipe, window-close listener.
 * Real-World Scenario: Campus Public Library Emergency Exit (Tier 4 Scenarios 1 & 5)
 * Requirements: Plan §2.4, TC-P2-07, TC-P2-08, TC-P2-09
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { createMockChrome, runInSandbox } = require('../harness');

async function runTests() {
  console.log('--- Running test-lab-mode-burn.js ---');
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

  const bgPath = path.resolve(__dirname, '../../background.js');
  assert.ok(fs.existsSync(bgPath), 'background.js must exist');

  function initBackground(initialStorage = {}) {
    const mockChrome = createMockChrome(initialStorage);
    const sandbox = {
      chrome: mockChrome,
      console,
      Date,
      Math,
      setTimeout,
      clearTimeout,
      URL,
      URLSearchParams
    };
    runInSandbox(bgPath, sandbox);
    return { mockChrome, sandbox };
  }

  // =========================================================================
  // TIER 3 & TC-P2-08: CLEAN & BURN PROTOCOL
  // =========================================================================

  await test('Tier 3 & TC-P2-08: EXECUTE_CLEAN_AND_BURN wipes storage, cookies, and broadcasts memory purge', async () => {
    const initialLocal = {
      dc_recent_docs: [
        { id: 'doc_1', title: 'Private Document 1', canonicalUrl: 'url1', platform: 'studocu' }
      ],
      dc_lab_mode: true
    };
    const initialSession = {
      session_docs: [
        { id: 'sess_1', title: 'Session Document 1', canonicalUrl: 'url2', platform: 'scribd' }
      ]
    };
    const initialCookies = [
      { domain: 'studocu.com', name: 'user_auth', path: '/', secure: true, storeId: '0' },
      { domain: '.studocu.vn', name: 'sess_vn', path: '/', secure: true, storeId: '0' },
      { domain: 'scribd.com', name: 'token_scr', path: '/', secure: true, storeId: '0' },
      { domain: 'google.com', name: 'unrelated', path: '/', secure: true, storeId: '0' }
    ];

    const { mockChrome } = initBackground({
      local: initialLocal,
      session: initialSession,
      cookies: initialCookies
    });

    // Send EXECUTE_CLEAN_AND_BURN message
    const res = await mockChrome.runtime.onMessage.dispatch({
      action: 'EXECUTE_CLEAN_AND_BURN'
    });

    if (!res || res.status !== 'BURN_SUCCESS') {
      throw new Error(
        'EXECUTE_CLEAN_AND_BURN handler not implemented or unsuccessful in background.js (Milestone 2 pending)'
      );
    }

    assert.strictEqual(res.status, 'BURN_SUCCESS', 'Response status must be BURN_SUCCESS');

    // 1. Verify dc_recent_docs is emptied in local storage
    const localData = await mockChrome.storage.local.get('dc_recent_docs');
    assert.deepStrictEqual(
      localData.dc_recent_docs,
      [],
      'dc_recent_docs must be completely emptied in local storage'
    );

    // 2. Verify session storage is cleared
    const sessionData = await mockChrome.storage.session.get('session_docs');
    assert.ok(
      !sessionData.session_docs || sessionData.session_docs.length === 0,
      'session_docs must be completely cleared'
    );

    // 3. Verify target cookies for studocu.com, studocu.vn, scribd.com are wiped
    const remainingStudocu = await mockChrome.cookies.getAll({ domain: 'studocu.com' });
    assert.strictEqual(remainingStudocu.length, 0, 'All studocu.com cookies must be purged');

    const remainingStudocuVn = await mockChrome.cookies.getAll({ domain: 'studocu.vn' });
    assert.strictEqual(remainingStudocuVn.length, 0, 'All studocu.vn cookies must be purged');

    const remainingScribd = await mockChrome.cookies.getAll({ domain: 'scribd.com' });
    assert.strictEqual(remainingScribd.length, 0, 'All scribd.com cookies must be purged');

    // 4. Verify non-target cookies (e.g. google.com) remain intact
    const remainingOther = await mockChrome.cookies.getAll({ domain: 'google.com' });
    assert.strictEqual(remainingOther.length, 1, 'Unrelated cookies must not be deleted');
  });

  // =========================================================================
  // TIER 3 & TC-P2-09: WINDOW CLOSE AUTO-PURGE IN LAB MODE
  // =========================================================================

  await test('Tier 3 & TC-P2-09: chrome.windows.onRemoved triggers auto-purge when dc_lab_mode is true', async () => {
    const { mockChrome } = initBackground({
      local: {
        dc_lab_mode: true,
        dc_recent_docs: [{ id: 'd1', title: 'Lab doc', platform: 'studocu' }]
      },
      session: {
        session_docs: [{ id: 's1', title: 'Session doc', platform: 'studocu' }]
      },
      cookies: [
        { domain: 'studocu.com', name: 'sess', path: '/', secure: true, storeId: '0' }
      ]
    });

    // Simulate browser window close event
    mockChrome.windows.onRemoved.dispatch(101);
    await new Promise((r) => setTimeout(r, 60));

    // Verify session data was purged
    const sessionData = await mockChrome.storage.session.get('session_docs');
    assert.ok(
      !sessionData.session_docs || sessionData.session_docs.length === 0,
      'Session docs must be automatically purged on window close in Lab Mode'
    );
  });

  await test('Tier 3: chrome.windows.onRemoved does NOT purge history when dc_lab_mode is false', async () => {
    const originalDocs = [{ id: 'keep_me', title: 'Personal Doc', platform: 'studocu' }];
    const { mockChrome } = initBackground({
      local: {
        dc_lab_mode: false,
        dc_recent_docs: originalDocs
      }
    });

    // Simulate window close
    mockChrome.windows.onRemoved.dispatch(102);
    await new Promise((r) => setTimeout(r, 60));

    // Verify local storage is preserved
    const localData = await mockChrome.storage.local.get('dc_recent_docs');
    assert.strictEqual(
      localData.dc_recent_docs.length,
      1,
      'Personal history must not be wiped on window close when Lab Mode is inactive'
    );
  });

  // =========================================================================
  // TIER 4: REAL-WORLD SCENARIO 1 & 5 — CAMPUS LAB FULL PRIVACY EVICTION
  // =========================================================================

  await test('Tier 4: Campus public PC workflow wipes all transient memory and cookies', async () => {
    const { mockChrome } = initBackground({
      local: {
        dc_lab_mode: true,
        dc_recent_docs: []
      },
      session: {
        session_docs: [
          { id: 'exam_review', title: 'Biology Final Review', platform: 'studocu' }
        ]
      },
      cookies: [
        { domain: 'studocu.com', name: 'student_token', path: '/', secure: true, storeId: '0' },
        { domain: 'scribd.com', name: 'book_session', path: '/', secure: true, storeId: '0' }
      ]
    });

    // Student executes Clean & Burn
    const res = await mockChrome.runtime.onMessage.dispatch({
      action: 'EXECUTE_CLEAN_AND_BURN'
    });

    assert.strictEqual(res.status, 'BURN_SUCCESS');

    // Confirm total zero footprint
    const local = await mockChrome.storage.local.get();
    const session = await mockChrome.storage.session.get();
    const cookies = await mockChrome.cookies.getAll({});

    assert.deepStrictEqual(local.dc_recent_docs, []);
    assert.ok(!session.session_docs || session.session_docs.length === 0);
    assert.strictEqual(
      cookies.filter((c) => c.domain.includes('studocu') || c.domain.includes('scribd')).length,
      0,
      'Zero study cookies must remain on public PC'
    );
  });

  console.log(`\nAll ${testCount} assertions in test-lab-mode-burn.js passed successfully!`);
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
