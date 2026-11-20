/**
 * Tier 1 & Tier 2 Unit Tests: Storage LRU Engine & Star Protection
 * Coverage: 25-item cap, LRU eviction, star immunity, fallback eviction, revisit deduplication, Lab PC session storage.
 * Requirements: Plan §2.1, §2.2, §2.4, TC-P2-02, TC-P2-03, TC-P2-04, TC-P2-07, TC-P2-12
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { createMockChrome, runInSandbox } = require('../harness');

async function runTests() {
  console.log('--- Running test-lru-engine.js ---');
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
  assert.ok(fs.existsSync(bgPath), 'background.js must exist in project root');

  /**
   * Helper to load background.js in a fresh sandbox and execute recordDoc
   */
  function initBackground(initialStorage = {}) {
    const mockChrome = createMockChrome(initialStorage);
    const sandbox = {
      chrome: mockChrome,
      console,
      Date,
      Math,
      setTimeout,
      clearTimeout
    };
    runInSandbox(bgPath, sandbox);

    async function recordDoc(doc) {
      if (typeof sandbox.recordRecentDocument === 'function') {
        await sandbox.recordRecentDocument(doc);
        return { success: true };
      }
      const res = await mockChrome.runtime.onMessage.dispatch({
        action: 'RECORD_RECENT_DOC',
        doc
      });
      if (!res || !res.success) {
        throw new Error(
          'RECORD_RECENT_DOC handler not implemented or unsuccessful in background.js (Milestone 2 pending)'
        );
      }
      return res;
    }

    return { mockChrome, sandbox, recordDoc };
  }

  // =========================================================================
  // TIER 1 & TC-P2-02: 25-ITEM CAPACITY & LRU EVICTION
  // =========================================================================

  await test('Tier 1: recordDoc inserts a single document into dc_recent_docs', async () => {
    const { mockChrome, recordDoc } = initBackground();
    const doc = {
      id: 'stu_1001',
      title: 'Introduction to Microeconomics',
      canonicalUrl: 'https://www.studocu.com/en/document/intro-micro/1001',
      platform: 'studocu',
      pageCount: 15,
      lastOpenedAt: Date.now(),
      isStarred: false
    };

    await recordDoc(doc);
    const stored = await mockChrome.storage.local.get('dc_recent_docs');
    const docs = stored.dc_recent_docs;
    assert.ok(Array.isArray(docs), 'dc_recent_docs must be an array');
    assert.strictEqual(docs.length, 1, 'Must contain exactly 1 document');
    assert.strictEqual(docs[0].id, 'stu_1001');
    assert.strictEqual(docs[0].title, 'Introduction to Microeconomics');
  });

  await test('Tier 1 & TC-P2-02: 25-item LRU capacity cap and oldest unstarred eviction', async () => {
    const { mockChrome, recordDoc } = initBackground();

    // Insert 25 documents with monotonically increasing timestamps
    const baseTime = 1700000000000;
    for (let i = 1; i <= 25; i++) {
      await recordDoc({
        id: `doc_${i}`,
        title: `Document ${i}`,
        canonicalUrl: `https://www.studocu.com/en/document/doc-${i}`,
        platform: i % 2 === 0 ? 'scribd' : 'studocu',
        pageCount: i * 2,
        lastOpenedAt: baseTime + (i * 1000),
        isStarred: false
      });
    }

    let stored = await mockChrome.storage.local.get('dc_recent_docs');
    assert.strictEqual(stored.dc_recent_docs.length, 25, 'Storage must have reached 25 items');
    assert.strictEqual(stored.dc_recent_docs[0].id, 'doc_25', 'Newest doc must be at Index 0');
    assert.strictEqual(stored.dc_recent_docs[24].id, 'doc_1', 'Oldest doc must be at Index 24');

    // Insert 26th document: doc_26
    await recordDoc({
      id: 'doc_26',
      title: 'Document 26',
      canonicalUrl: 'https://www.studocu.com/en/document/doc-26',
      platform: 'studocu',
      pageCount: 50,
      lastOpenedAt: baseTime + (26 * 1000),
      isStarred: false
    });

    stored = await mockChrome.storage.local.get('dc_recent_docs');
    const docs = stored.dc_recent_docs;
    assert.strictEqual(docs.length, 25, 'Storage must remain strictly capped at 25 items');
    assert.strictEqual(docs[0].id, 'doc_26', 'Newest document 26 must be at Index 0');
    assert.strictEqual(
      docs.find((d) => d.id === 'doc_1'),
      undefined,
      'Oldest document (doc_1) must be evicted'
    );
    assert.ok(
      docs.some((d) => d.id === 'doc_2'),
      'doc_2 should remain in cache'
    );
  });

  // =========================================================================
  // TIER 1 & TC-P2-03: STAR PROTECTION IMMUNITY
  // =========================================================================

  await test('Tier 1 & TC-P2-03: Starred document is immune from LRU eviction', async () => {
    const { mockChrome, recordDoc } = initBackground();
    const baseTime = 1700000000000;

    // Prepopulate 25 items where doc_1 is starred
    const initialDocs = [];
    for (let i = 25; i >= 1; i--) {
      initialDocs.push({
        id: `doc_${i}`,
        title: `Document ${i}`,
        canonicalUrl: `https://www.studocu.com/en/document/doc-${i}`,
        platform: 'studocu',
        pageCount: 10,
        lastOpenedAt: baseTime + (i * 1000),
        isStarred: i === 1 // doc_1 is the OLDEST but STARRED!
      });
    }
    await mockChrome.storage.local.set({ dc_recent_docs: initialDocs });

    // Insert 5 new unstarred documents: doc_26 to doc_30
    for (let i = 26; i <= 30; i++) {
      await recordDoc({
        id: `doc_${i}`,
        title: `Document ${i}`,
        canonicalUrl: `https://www.studocu.com/en/document/doc-${i}`,
        platform: 'studocu',
        pageCount: 20,
        lastOpenedAt: baseTime + (i * 1000),
        isStarred: false
      });
    }

    const stored = await mockChrome.storage.local.get('dc_recent_docs');
    const docs = stored.dc_recent_docs;
    assert.strictEqual(docs.length, 25, 'Array length must remain 25');

    // doc_1 MUST NOT be evicted because isStarred: true
    const doc1 = docs.find((d) => d.id === 'doc_1');
    assert.ok(doc1, 'Starred doc_1 MUST be retained under star protection immunity');
    assert.strictEqual(doc1.isStarred, true, 'isStarred status must remain true');

    // The oldest UNSTARRED documents (doc_2, doc_3, doc_4, doc_5, doc_6) must have been evicted instead
    assert.strictEqual(docs.find((d) => d.id === 'doc_2'), undefined, 'doc_2 should be evicted');
    assert.strictEqual(docs.find((d) => d.id === 'doc_3'), undefined, 'doc_3 should be evicted');
    assert.strictEqual(docs.find((d) => d.id === 'doc_4'), undefined, 'doc_4 should be evicted');
    assert.strictEqual(docs.find((d) => d.id === 'doc_5'), undefined, 'doc_5 should be evicted');
    assert.strictEqual(docs.find((d) => d.id === 'doc_6'), undefined, 'doc_6 should be evicted');
  });

  await test('Tier 2 & TC-P2-03 Edge Case: All 25 docs starred -> fallback evicts oldest doc', async () => {
    const { mockChrome, recordDoc } = initBackground();
    const baseTime = 1700000000000;

    // Prepopulate 25 items all starred
    const initialDocs = [];
    for (let i = 25; i >= 1; i--) {
      initialDocs.push({
        id: `doc_${i}`,
        title: `Document ${i}`,
        canonicalUrl: `https://www.studocu.com/en/document/doc-${i}`,
        platform: 'studocu',
        pageCount: 10,
        lastOpenedAt: baseTime + (i * 1000),
        isStarred: true
      });
    }
    await mockChrome.storage.local.set({ dc_recent_docs: initialDocs });

    // Insert 26th document
    await recordDoc({
      id: 'doc_26',
      title: 'Document 26',
      canonicalUrl: 'https://www.studocu.com/en/document/doc-26',
      platform: 'studocu',
      pageCount: 10,
      lastOpenedAt: baseTime + (26 * 1000),
      isStarred: false
    });

    const stored = await mockChrome.storage.local.get('dc_recent_docs');
    const docs = stored.dc_recent_docs;
    assert.strictEqual(docs.length, 25, 'Array length must stay at 25');
    assert.strictEqual(docs[0].id, 'doc_26', 'doc_26 inserted at index 0');
    // Fallback: oldest doc_1 evicted since all were starred
    assert.strictEqual(docs.find((d) => d.id === 'doc_1'), undefined, 'doc_1 evicted as fallback');
  });

  // =========================================================================
  // TIER 1 & TC-P2-04: REVISIT DEDUPLICATION
  // =========================================================================

  await test('Tier 1 & TC-P2-04: Revisit existing doc moves to Index 0 and refreshes timestamp', async () => {
    const { mockChrome, recordDoc } = initBackground();
    const baseTime = 1700000000000;

    // Insert 3 documents
    await recordDoc({ id: 'doc_A', title: 'Doc A', canonicalUrl: 'url_A', platform: 'studocu', pageCount: 10, lastOpenedAt: baseTime });
    await recordDoc({ id: 'doc_B', title: 'Doc B', canonicalUrl: 'url_B', platform: 'studocu', pageCount: 20, lastOpenedAt: baseTime + 1000 });
    await recordDoc({ id: 'doc_C', title: 'Doc C', canonicalUrl: 'url_C', platform: 'studocu', pageCount: 30, lastOpenedAt: baseTime + 2000 });

    let stored = await mockChrome.storage.local.get('dc_recent_docs');
    assert.strictEqual(stored.dc_recent_docs[0].id, 'doc_C');
    assert.strictEqual(stored.dc_recent_docs[1].id, 'doc_B');
    assert.strictEqual(stored.dc_recent_docs[2].id, 'doc_A');

    // Re-visit doc_A with updated pageCount
    const revisitTime = baseTime + 50000;
    await recordDoc({
      id: 'doc_A',
      title: 'Doc A Updated',
      canonicalUrl: 'url_A',
      platform: 'studocu',
      pageCount: 15,
      lastOpenedAt: revisitTime
    });

    stored = await mockChrome.storage.local.get('dc_recent_docs');
    const docs = stored.dc_recent_docs;
    assert.strictEqual(docs.length, 3, 'Zero duplicates allowed');
    assert.strictEqual(docs[0].id, 'doc_A', 'Revisited doc_A must be moved to Index 0');
    assert.strictEqual(docs[0].title, 'Doc A Updated', 'Title must be updated');
    assert.strictEqual(docs[0].pageCount, 15, 'Page count must be updated');
    assert.strictEqual(docs[1].id, 'doc_C');
    assert.strictEqual(docs[2].id, 'doc_B');
  });

  await test('Tier 2 & TC-P2-04: Revisit preserves existing isStarred status', async () => {
    const { mockChrome, recordDoc } = initBackground();

    // Insert and star doc_A
    await recordDoc({ id: 'doc_A', title: 'Doc A', canonicalUrl: 'url_A', platform: 'studocu', pageCount: 10, isStarred: false });
    // Manually star it in storage (e.g. from popup star click)
    let stored = await mockChrome.storage.local.get('dc_recent_docs');
    stored.dc_recent_docs[0].isStarred = true;
    await mockChrome.storage.local.set({ dc_recent_docs: stored.dc_recent_docs });

    // Insert doc_B
    await recordDoc({ id: 'doc_B', title: 'Doc B', canonicalUrl: 'url_B', platform: 'scribd', pageCount: 20, isStarred: false });

    // Re-visit doc_A where newDoc has isStarred: false (default when viewing page)
    await recordDoc({ id: 'doc_A', title: 'Doc A', canonicalUrl: 'url_A', platform: 'studocu', pageCount: 10, isStarred: false });

    stored = await mockChrome.storage.local.get('dc_recent_docs');
    const docA = stored.dc_recent_docs[0];
    assert.strictEqual(docA.id, 'doc_A');
    assert.strictEqual(docA.isStarred, true, 'isStarred: true must be preserved across revisits');
  });

  // =========================================================================
  // TIER 1 & TC-P2-07: LAB PC MODE SESSION STORAGE ISOLATION
  // =========================================================================

  await test('Tier 1 & TC-P2-07: When dc_lab_mode is true, history is written exclusively to session storage', async () => {
    const { mockChrome, recordDoc } = initBackground({
      local: { dc_lab_mode: true, dc_recent_docs: [] },
      session: { session_docs: [] }
    });

    const doc1 = { id: 'lab_doc_1', title: 'Lab Doc 1', canonicalUrl: 'url_lab_1', platform: 'studocu', pageCount: 5 };
    const doc2 = { id: 'lab_doc_2', title: 'Lab Doc 2', canonicalUrl: 'url_lab_2', platform: 'scribd', pageCount: 12 };

    await recordDoc(doc1);
    await recordDoc(doc2);

    // Verify local storage remains completely empty
    const localData = await mockChrome.storage.local.get('dc_recent_docs');
    assert.deepStrictEqual(localData.dc_recent_docs, [], 'Local dc_recent_docs must remain empty in Lab Mode');

    // Verify session storage has the 2 documents
    const sessionData = await mockChrome.storage.session.get('session_docs');
    const sessionDocs = sessionData.session_docs;
    assert.ok(Array.isArray(sessionDocs), 'session_docs must be an array');
    assert.strictEqual(sessionDocs.length, 2, 'session_docs must contain 2 items');
    assert.strictEqual(sessionDocs[0].id, 'lab_doc_2', 'Index 0 must be lab_doc_2');
    assert.strictEqual(sessionDocs[1].id, 'lab_doc_1', 'Index 1 must be lab_doc_1');
  });

  await test('Tier 2: Lab PC Mode session storage caps at 15 items', async () => {
    const { mockChrome, recordDoc } = initBackground({
      local: { dc_lab_mode: true }
    });

    for (let i = 1; i <= 20; i++) {
      await recordDoc({
        id: `lab_${i}`,
        title: `Lab Document ${i}`,
        canonicalUrl: `url_${i}`,
        platform: 'studocu',
        pageCount: 10
      });
    }

    const sessionData = await mockChrome.storage.session.get('session_docs');
    assert.strictEqual(sessionData.session_docs.length, 15, 'Session docs must be capped at 15 items');
    assert.strictEqual(sessionData.session_docs[0].id, 'lab_20');
  });

  // =========================================================================
  // TIER 2 & TC-P2-12: STORAGE FOOTPRINT SLA
  // =========================================================================

  await test('Tier 2 & TC-P2-12: 25-item storage footprint is < 10KB', async () => {
    const { mockChrome, recordDoc } = initBackground();

    for (let i = 1; i <= 25; i++) {
      await recordDoc({
        id: `stu_${i.toString(16).padStart(8, '0')}`,
        title: `Document ${i} with realistic academic title for course ECON101 and Macroeconomics Review`,
        canonicalUrl: `https://www.studocu.com/en/document/harvard-university/microeconomics/sample-doc-${i}/12345678`,
        platform: 'studocu',
        pageCount: 42,
        lastOpenedAt: Date.now(),
        isStarred: i % 5 === 0
      });
    }

    const stored = await mockChrome.storage.local.get('dc_recent_docs');
    const serialized = JSON.stringify(stored.dc_recent_docs);
    const sizeInBytes = Buffer.byteLength(serialized, 'utf8');
    assert.ok(
      sizeInBytes < 10240,
      `Storage footprint for 25 items must be < 10KB (got ${sizeInBytes} bytes)`
    );
  });

  console.log(`\nAll ${testCount} assertions in test-lru-engine.js passed successfully!`);
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
