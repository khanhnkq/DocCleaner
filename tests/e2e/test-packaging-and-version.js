/**
 * Tier 4 E2E Integration Tests: Packaging, Manifest Configuration & Version Lock
 * Coverage: Manifest V3 validation, strict version 1.8.0 lock, permissions audit, packaging pipeline with --no-bump.
 * Requirements: Plan §5.1, Survey Reports, Follow-up User Constraint
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

async function runTests() {
  console.log('--- Running test-packaging-and-version.js ---');
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

  const manifestPath = path.resolve(__dirname, '../../manifest.json');
  const packageScriptPath = path.resolve(__dirname, '../../scripts/package-extension.sh');
  const bumpScriptPath = path.resolve(__dirname, '../../scripts/bump-version.js');

  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
  assert.ok(fs.existsSync(packageScriptPath), 'scripts/package-extension.sh must exist');
  assert.ok(fs.existsSync(bumpScriptPath), 'scripts/bump-version.js must exist');

  // =========================================================================
  // TIER 4: MANIFEST V3 CONFIGURATION & STRICT VERSION 1.8.0 LOCK
  // =========================================================================

  await test('Tier 4: manifest.json is valid JSON and manifest_version is 3', async () => {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
  });

  await test('Tier 4: manifest.json version is strictly locked to "1.8.0"', async () => {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    assert.strictEqual(
      manifest.version,
      '1.8.0',
      'Manifest version must be strictly 1.8.0 per user constraint (do NOT bump to 1.9.0)'
    );
  });

  await test('Tier 4: Required permissions are declared in manifest.json', async () => {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    const perms = manifest.permissions || [];

    assert.ok(perms.includes('storage'), 'Missing "storage" permission');
    assert.ok(perms.includes('cookies'), 'Missing "cookies" permission');
    assert.ok(perms.includes('activeTab'), 'Missing "activeTab" permission');
    assert.ok(perms.includes('scripting'), 'Missing "scripting" permission');
    assert.ok(perms.includes('webNavigation'), 'Missing "webNavigation" permission');
  });

  await test('Tier 4: Host permissions cover Studocu and Scribd domains', async () => {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    const hosts = manifest.host_permissions || [];

    const hasStudocu = hosts.some((h) => h.includes('studocu.com'));
    const hasStudocuVn = hosts.some((h) => h.includes('studocu.vn'));
    const hasScribd = hosts.some((h) => h.includes('scribd.com'));

    assert.ok(hasStudocu, 'host_permissions must include studocu.com');
    assert.ok(hasStudocuVn, 'host_permissions must include studocu.vn');
    assert.ok(hasScribd, 'host_permissions must include scribd.com');
  });

  // =========================================================================
  // TIER 4: SCRIPTS & PACKAGING PIPELINE WITH --no-bump
  // =========================================================================

  await test('Tier 4: scripts/bump-version.js --no-bump preserves version 1.8.0', async () => {
    const out = execSync(`node "${bumpScriptPath}" --no-bump`, { encoding: 'utf8' });
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    assert.strictEqual(manifest.version, '1.8.0', 'Version must remain 1.8.0');
  });

  await test('Tier 4: scripts/package-extension.sh --no-bump produces DocCleaner-v1.8.0.zip', async () => {
    const projectDir = path.resolve(__dirname, '../..');
    const outputZipPath = path.resolve(projectDir, 'DocCleaner-v1.8.0.zip');
    const distZipPath = path.resolve(projectDir, 'dist/DocCleaner-v1.8.0.zip');

    // Run packaging script with --no-bump
    const out = execSync(`bash "${packageScriptPath}" --no-bump`, {
      cwd: projectDir,
      encoding: 'utf8'
    });

    assert.ok(
      fs.existsSync(outputZipPath),
      `DocCleaner-v1.8.0.zip must exist at root: ${outputZipPath}`
    );
    assert.ok(
      fs.existsSync(distZipPath),
      `DocCleaner-v1.8.0.zip must exist in dist/: ${distZipPath}`
    );

    const stat = fs.statSync(outputZipPath);
    assert.ok(stat.size > 50000, `ZIP package size should be > 50KB (got ${stat.size} bytes)`);
  });

  await test('Tier 4: Packaged zip contains necessary extension files and excludes dev files', async () => {
    const projectDir = path.resolve(__dirname, '../..');
    const outputZipPath = path.resolve(projectDir, 'DocCleaner-v1.8.0.zip');

    const zipList = execSync(`unzip -l "${outputZipPath}"`, { encoding: 'utf8' });

    // Required files in zip
    assert.ok(zipList.includes('manifest.json'), 'ZIP must contain manifest.json');
    assert.ok(zipList.includes('background.js'), 'ZIP must contain background.js');
    assert.ok(zipList.includes('popup.html'), 'ZIP must contain popup.html');
    assert.ok(zipList.includes('popup.css'), 'ZIP must contain popup.css');
    assert.ok(zipList.includes('popup.js'), 'ZIP must contain popup.js');

    // Excluded files
    assert.ok(
      !zipList.includes('tests/'),
      'ZIP must NOT contain tests/ (Defect in scripts/package-extension.sh: missing exclusion -x "tests/*")'
    );
    assert.ok(!zipList.includes('docs/'), 'ZIP must NOT contain docs/');
    assert.ok(!zipList.includes('scripts/'), 'ZIP must NOT contain scripts/');
    assert.ok(!zipList.includes('.git/'), 'ZIP must NOT contain .git/');
  });

  // =========================================================================
  // TIER 4: SYNTAX VALIDATION (node -c) ACROSS ALL PRODUCTION SCRIPTS
  // =========================================================================

  await test('Tier 4: All JavaScript files pass node -c syntax check without errors', async () => {
    const projectDir = path.resolve(__dirname, '../..');
    const jsFiles = [
      'background.js',
      'content.js',
      'popup.js',
      'scribd_handler.js',
      'welcome.js',
      'scripts/bump-version.js'
    ];

    if (fs.existsSync(path.resolve(projectDir, 'i18n.js'))) {
      jsFiles.push('i18n.js');
    }

    for (const file of jsFiles) {
      const fullPath = path.resolve(projectDir, file);
      if (fs.existsSync(fullPath)) {
        execSync(`node -c "${fullPath}"`);
      }
    }
  });

  console.log(`\nAll ${testCount} assertions in test-packaging-and-version.js passed successfully!`);
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
