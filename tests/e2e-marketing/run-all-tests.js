/**
 * Master E2E Test Suite Runner for Automated Marketing Asset Generation Pipeline
 * DocCleaner v1.8.0
 *
 * Orchestrates Tiers 1-4:
 *   - Tier 1: Feature Coverage (42 tests)
 *   - Tier 2: Boundary & Corner Cases (42 tests)
 *   - Tier 3: Cross-Feature Combinations (12 tests)
 *   - Tier 4: Real-World Scenarios (5 tests)
 *
 * Usage:
 *   node tests/e2e-marketing/run-all-tests.js               # Run all 4 tiers
 *   node tests/e2e-marketing/run-all-tests.js --tier=1      # Run only Tier 1
 *   node tests/e2e-marketing/run-all-tests.js --tier=2      # Run only Tier 2
 *   node tests/e2e-marketing/run-all-tests.js --tier=3      # Run only Tier 3
 *   node tests/e2e-marketing/run-all-tests.js --tier=4      # Run only Tier 4
 *   node tests/e2e-marketing/run-all-tests.js --verbose     # Detailed logging
 *   node tests/e2e-marketing/run-all-tests.js --json        # Machine-readable JSON
 *   node tests/e2e-marketing/run-all-tests.js --bail        # Halt on first failure
 */

const assert = require('node:assert');
const path = require('node:path');

const tier1 = require('./tier1-feature-coverage.test');
const tier2 = require('./tier2-boundary-corner.test');
const tier3 = require('./tier3-cross-feature.test');
const tier4 = require('./tier4-real-world-scenarios.test');

const { parsePngHeader, createSyntheticPngHeader } = require('./helpers/image-inspector');
const { inspectGif, createSyntheticGif } = require('./helpers/media-inspector');
const { assertExactDimensions, assertSilentAudio, assertNoEmojis } = require('./helpers/assert-utils');

/**
 * Runs suite self-tests to prove inspection helpers are 100% operational.
 */
function runSelfVerification() {
  // 1. Verify PNG Inspector & Dimension Assertion
  const validPng = createSyntheticPngHeader(1280, 800);
  const parsedPng = parsePngHeader(validPng);
  assertExactDimensions(parsedPng, 1280, 800, 'SelfTest PNG');

  // 2. Verify Dimension Rejection
  const badPng = createSyntheticPngHeader(1281, 800);
  assert.throws(
    () => assertExactDimensions(parsePngHeader(badPng), 1280, 800, 'SelfTest Bad PNG'),
    /Width mismatch/
  );

  // 3. Verify Silent Audio Assertion
  assert.doesNotThrow(() => assertSilentAudio(0, 'SelfTest Audio'));
  assert.throws(() => assertSilentAudio(1, 'SelfTest Bad Audio'), /Silent audio violation/);

  // 4. Verify Emoji Detector
  assert.doesNotThrow(() => assertNoEmojis('Hỗ Trợ Toàn Diện', 'SelfTest Copy'));
  assert.throws(() => assertNoEmojis('Hỗ Trợ ⭐', 'SelfTest Emoji'), /Emoji violation/);

  // 5. Verify GIF Inspector
  const testGif = createSyntheticGif(800, 450, { frames: 32, loop: true });
  const parsedGif = inspectGif(testGif);
  assert.strictEqual(parsedGif.frameCount, 32);
  assert.strictEqual(parsedGif.isUnder8MB, true);
}

async function runAllTests(cliArgs = process.argv.slice(2)) {
  const args = new Set(cliArgs.map((a) => a.toLowerCase().trim()));

  let tierFilter = null;
  for (const a of cliArgs) {
    const match = a.match(/^--tier=(\d+)$/i);
    if (match) {
      tierFilter = parseInt(match[1], 10);
      break;
    }
  }

  const verbose = args.has('--verbose') || args.has('-v');
  const bail = args.has('--bail') || args.has('-b');
  const jsonMode = args.has('--json');

  const options = { verbose, bail };

  if (!jsonMode) {
    console.log('================================================================');
    console.log('🧪 DocCleaner v1.8.0 Marketing E2E Test Runner');
    console.log('Requirement-Driven Opaque-Box Test Suite (Tiers 1 - 4)');
    if (tierFilter) {
      console.log(`Execution Scope: Tier ${tierFilter} only`);
    } else {
      console.log('Execution Scope: Complete Suite (All 4 Tiers)');
    }
    console.log('================================================================\n');
  }

  // Run Self-Verification first
  runSelfVerification();

  const tierSuites = [
    { tier: 1, name: 'Tier 1: Feature Coverage (42 tests)', runner: tier1.runTests },
    { tier: 2, name: 'Tier 2: Boundary & Corner Cases (42 tests)', runner: tier2.runTests },
    { tier: 3, name: 'Tier 3: Cross-Feature Combinations (12 tests)', runner: tier3.runTests },
    { tier: 4, name: 'Tier 4: Real-World Scenarios (5 tests)', runner: tier4.runTests }
  ];

  const targetSuites = tierFilter
    ? tierSuites.filter((s) => s.tier === tierFilter)
    : tierSuites;

  const suiteResults = [];
  const startSuiteTime = Date.now();

  for (const s of targetSuites) {
    if (!jsonMode) {
      console.log(`▶ Running ${s.name}...`);
    }

    const res = await s.runner(options);
    suiteResults.push(res);

    if (!jsonMode) {
      console.log(`  Summary: ${res.passed} passed, ${res.pending} pending, ${res.failed} failed (${res.durationMs}ms)\n`);
    }

    if (bail && res.failed > 0) {
      break;
    }
  }

  const totalDuration = Date.now() - startSuiteTime;

  const aggregate = {
    total: suiteResults.reduce((acc, r) => acc + r.total, 0),
    passed: suiteResults.reduce((acc, r) => acc + r.passed, 0),
    failed: suiteResults.reduce((acc, r) => acc + r.failed, 0),
    pending: suiteResults.reduce((acc, r) => acc + r.pending, 0),
    durationMs: totalDuration,
    suites: suiteResults
  };

  if (jsonMode) {
    console.log(JSON.stringify(aggregate, null, 2));
  } else {
    console.log('================================================================');
    console.log('📊 MARKETING ASSET E2E TEST REPORT');
    console.log('================================================================');
    console.log(
      'Tier'.padEnd(26) +
      'Total'.padStart(8) +
      'Passed'.padStart(9) +
      'Pending'.padStart(10) +
      'Failed'.padStart(9) +
      'Duration'.padStart(10)
    );
    console.log('----------------------------------------------------------------');

    for (const r of suiteResults) {
      console.log(
        r.tier.padEnd(26) +
        String(r.total).padStart(8) +
        String(r.passed).padStart(9) +
        String(r.pending).padStart(10) +
        String(r.failed).padStart(9) +
        `${r.durationMs}ms`.padStart(10)
      );
    }

    console.log('----------------------------------------------------------------');
    console.log(
      'TOTAL'.padEnd(26) +
      String(aggregate.total).padStart(8) +
      String(aggregate.passed).padStart(9) +
      String(aggregate.pending).padStart(10) +
      String(aggregate.failed).padStart(9) +
      `${aggregate.durationMs}ms`.padStart(10)
    );
    console.log('================================================================');

    if (aggregate.failed === 0) {
      console.log('RESULT: ✅ ALL EXECUTED MARKETING ASSET E2E TESTS PASSED');
      if (aggregate.pending > 0) {
        console.log(`NOTICE: ⏳ ${aggregate.pending} tests pending file generation by parallel workers`);
      }
    } else {
      console.log(`RESULT: ❌ ${aggregate.failed} TEST(S) FAILED`);
    }
    console.log('================================================================\n');
  }

  return aggregate;
}

if (require.main === module) {
  runAllTests()
    .then((res) => {
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal Test Runner Error:', err);
      process.exit(2);
    });
}

module.exports = {
  runAllTests,
  runSelfVerification
};
