/**
 * Tier 1 & Tier 2 Unit Tests: Centralized i18n Localization System
 * Coverage: Dictionaries (en, vi, es, fr), 21 core keys, interpolation, relative time, title sanitization.
 * Requirements: Plan §4.2, §2.3, TC-P2-10
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { runInSandbox } = require('../harness');

function runTests() {
  const i18nPath = path.resolve(__dirname, '../../i18n.js');
  assert.ok(fs.existsSync(i18nPath), 'i18n.js must exist in project root');

  // Load i18n module (supports CommonJS or browser global)
  let i18n;
  try {
    i18n = require(i18nPath);
  } catch (e) {
    const sandbox = { window: {}, globalThis: {} };
    runInSandbox(i18nPath, sandbox);
    i18n = sandbox.window.I18N_DICTIONARY ? sandbox.window : sandbox.globalThis;
  }

  const { I18N_DICTIONARY, t, formatRelativeTime, sanitizeTitle } = i18n;

  console.log('--- Running test-i18n.js ---');
  let testCount = 0;

  function test(name, fn) {
    try {
      fn();
      testCount++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}`);
      throw err;
    }
  }

  // =========================================================================
  // TIER 1: DICTIONARY INTEGRITY & KEY COMPLETENESS
  // =========================================================================

  test('Tier 1: All 4 language dictionaries exist (en, vi, es, fr)', () => {
    assert.ok(I18N_DICTIONARY, 'I18N_DICTIONARY must be defined');
    assert.ok(I18N_DICTIONARY.en, 'English dictionary must exist');
    assert.ok(I18N_DICTIONARY.vi, 'Vietnamese dictionary must exist');
    assert.ok(I18N_DICTIONARY.es, 'Spanish dictionary must exist');
    assert.ok(I18N_DICTIONARY.fr, 'French dictionary must exist');
  });

  const CORE_21_KEYS = [
    'brandSubtitle',
    'tabActions',
    'tabRecents',
    'filterAll',
    'filterStarred',
    'emptyRecentsTitle',
    'emptyRecentsDesc',
    'btnFormatPrint',
    'btnCleanView',
    'btnCleanAndBurn',
    'burnConfirm',
    'burnSuccessToast',
    'toastDocSaved',
    'labModeToggle',
    'labModeActiveBadge',
    'pages',
    'justNow',
    'hoursAgo',
    'daysAgo',
    'exitReader',
    'printPdf'
  ];

  test('Tier 1: All 21 core keys are present and non-empty in English (en)', () => {
    for (const key of CORE_21_KEYS) {
      assert.ok(
        I18N_DICTIONARY.en[key] && typeof I18N_DICTIONARY.en[key] === 'string' && I18N_DICTIONARY.en[key].trim().length > 0,
        `Missing or empty core key in en: ${key}`
      );
    }
  });

  test('Tier 1: All 21 core keys are present and non-empty in Vietnamese (vi)', () => {
    for (const key of CORE_21_KEYS) {
      assert.ok(
        I18N_DICTIONARY.vi[key] && typeof I18N_DICTIONARY.vi[key] === 'string' && I18N_DICTIONARY.vi[key].trim().length > 0,
        `Missing or empty core key in vi: ${key}`
      );
    }
  });

  test('Tier 1: All 21 core keys are present and non-empty in Spanish (es)', () => {
    for (const key of CORE_21_KEYS) {
      assert.ok(
        I18N_DICTIONARY.es[key] && typeof I18N_DICTIONARY.es[key] === 'string' && I18N_DICTIONARY.es[key].trim().length > 0,
        `Missing or empty core key in es: ${key}`
      );
    }
  });

  test('Tier 1: All 21 core keys are present and non-empty in French (fr)', () => {
    for (const key of CORE_21_KEYS) {
      assert.ok(
        I18N_DICTIONARY.fr[key] && typeof I18N_DICTIONARY.fr[key] === 'string' && I18N_DICTIONARY.fr[key].trim().length > 0,
        `Missing or empty core key in fr: ${key}`
      );
    }
  });

  // =========================================================================
  // TIER 1 & 2: TRANSLATION HELPER t() & INTERPOLATION
  // =========================================================================

  test('Tier 1: t() returns correct translation for each language', () => {
    assert.strictEqual(t('en', 'tabActions'), 'Quick Actions');
    assert.strictEqual(t('vi', 'tabActions'), 'Công Cụ');
    assert.strictEqual(t('es', 'tabActions'), 'Acciones');
    assert.strictEqual(t('fr', 'tabActions'), 'Actions');

    assert.strictEqual(t('en', 'tabRecents'), 'Study Shelf');
    assert.strictEqual(t('vi', 'tabRecents'), 'Góc Học Tập');
    assert.strictEqual(t('es', 'tabRecents'), 'Mi Biblioteca');
    assert.strictEqual(t('fr', 'tabRecents'), 'Mes Documents');
  });

  test('Tier 2: t() placeholder interpolation replaces {param}', () => {
    const resEn = t('en', 'statusCleared', { count: 4 });
    assert.ok(resEn.includes('4'), `Expected count 4 to be interpolated: ${resEn}`);
    assert.ok(!resEn.includes('{count}'), 'Placeholder {count} should be replaced');
  });

  test('Tier 2: t() fallback mechanism on missing key or invalid language', () => {
    // If unsupported language provided, fallback to 'en'
    assert.strictEqual(t('de', 'tabActions'), 'Quick Actions');
    assert.strictEqual(t(null, 'tabActions'), 'Quick Actions');
    assert.strictEqual(t('', 'tabActions'), 'Quick Actions');

    // If key missing in language, fallback to English
    // If completely nonexistent, returns the key itself
    assert.strictEqual(t('en', 'nonExistentKey123'), 'nonExistentKey123');
    assert.strictEqual(t('fr', 'nonExistentKey123'), 'nonExistentKey123');
  });

  // =========================================================================
  // TIER 1 & 2: formatRelativeTime()
  // =========================================================================

  test('Tier 1: formatRelativeTime() returns "just now" for timestamps under 60 seconds', () => {
    const now = Date.now();
    assert.strictEqual(formatRelativeTime(now - 10000, 'en'), 'just now');
    assert.strictEqual(formatRelativeTime(now - 20000, 'vi'), 'vừa xong');
    assert.strictEqual(formatRelativeTime(now - 5000, 'es'), 'ahora mismo');
    assert.strictEqual(formatRelativeTime(now - 15000, 'fr'), "à l'instant");
  });

  test('Tier 1: formatRelativeTime() returns hours ago for timestamps within 24 hours', () => {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const resEn = formatRelativeTime(twoHoursAgo, 'en');
    assert.ok(/2\s*h ago/i.test(resEn), `Expected "2 h ago", got "${resEn}"`);

    const resVi = formatRelativeTime(twoHoursAgo, 'vi');
    assert.ok(resVi.includes('2') && (resVi.includes('giờ') || resVi.includes('h')), `Expected Vietnamese hours, got "${resVi}"`);

    const resEs = formatRelativeTime(twoHoursAgo, 'es');
    assert.ok(resEs.includes('2') && (resEs.includes('antes') || resEs.includes('h')), `Expected Spanish hours, got "${resEs}"`);

    const resFr = formatRelativeTime(twoHoursAgo, 'fr');
    assert.ok(resFr.includes('2') && (resFr.includes('tôt') || resFr.includes('h')), `Expected French hours, got "${resFr}"`);
  });

  test('Tier 1: formatRelativeTime() returns days ago for timestamps older than 24 hours', () => {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    const resEn = formatRelativeTime(threeDaysAgo, 'en');
    assert.ok(/3\s*d ago/i.test(resEn), `Expected "3 d ago", got "${resEn}"`);

    const resVi = formatRelativeTime(threeDaysAgo, 'vi');
    assert.ok(resVi.includes('3') && (resVi.includes('ngày') || resVi.includes('d')), `Expected Vietnamese days, got "${resVi}"`);
  });

  test('Tier 2: formatRelativeTime() boundary conditions (0, negative, future, invalid)', () => {
    // 0 or null timestamp should return empty string or safe fallback without throwing
    assert.strictEqual(formatRelativeTime(0, 'en'), '');
    assert.strictEqual(formatRelativeTime(null, 'en'), '');
    assert.strictEqual(formatRelativeTime(undefined, 'en'), '');
    assert.strictEqual(formatRelativeTime(NaN, 'en'), '');

    // Future timestamp (clock skew): diff <= 0 should yield "just now"
    const futureTime = Date.now() + 60000;
    assert.strictEqual(formatRelativeTime(futureTime, 'en'), 'just now');
  });

  // =========================================================================
  // TIER 1 & 2: sanitizeTitle()
  // =========================================================================

  test('Tier 1: sanitizeTitle() preserves normal document titles', () => {
    const title = 'Macroeconomics Midterm Review 2026';
    assert.strictEqual(sanitizeTitle(title), 'Macroeconomics Midterm Review 2026');
  });

  test('Tier 1: sanitizeTitle() strips trailing platform branding suffixes', () => {
    assert.strictEqual(
      sanitizeTitle('Linear Algebra Lecture Notes 04 - Studocu'),
      'Linear Algebra Lecture Notes 04'
    );
    assert.strictEqual(
      sanitizeTitle('Linear Algebra Lecture Notes 04 - Studocu VN'),
      'Linear Algebra Lecture Notes 04'
    );
    assert.strictEqual(
      sanitizeTitle('Fluid Mechanics Formula Sheet | Scribd'),
      'Fluid Mechanics Formula Sheet'
    );
    assert.strictEqual(
      sanitizeTitle('Organic Chemistry Final — Studocu'),
      'Organic Chemistry Final'
    );
  });

  test('Tier 2: sanitizeTitle() strips embedded scripts and HTML tags (XSS protection)', () => {
    const dirty = '<script>alert("xss")</script>Physics 101<b> Notes</b><img src=x onerror=alert(1)>';
    const clean = sanitizeTitle(dirty);
    assert.strictEqual(clean, 'Physics 101 Notes');
    assert.ok(!clean.includes('<'), 'Must contain no HTML tags');
    assert.ok(!clean.includes('alert'), 'Must strip script tags and content');
  });

  test('Tier 2: sanitizeTitle() decodes common HTML entities', () => {
    const entityTitle = 'Tom &amp; Jerry &quot;Classic&quot; &#39;Notes&#39;';
    const clean = sanitizeTitle(entityTitle);
    assert.strictEqual(clean, 'Tom & Jerry "Classic" \'Notes\'');
  });

  test('Tier 2: sanitizeTitle() normalizes whitespace and trims', () => {
    const spaced = '   Biology   101     Exam    Prep   ';
    assert.strictEqual(sanitizeTitle(spaced), 'Biology 101 Exam Prep');
  });

  test('Tier 2: sanitizeTitle() caps length at exactly 120 characters', () => {
    const veryLong = 'A'.repeat(200);
    const clean = sanitizeTitle(veryLong);
    assert.strictEqual(clean.length, 120, 'Title must be capped at 120 characters');
  });

  test('Tier 2: sanitizeTitle() handles empty, null, and non-string inputs safely', () => {
    assert.strictEqual(sanitizeTitle(''), '');
    assert.strictEqual(sanitizeTitle(null), '');
    assert.strictEqual(sanitizeTitle(undefined), '');
    assert.strictEqual(sanitizeTitle(12345), '12345');
  });

  console.log(`\nAll ${testCount} assertions in test-i18n.js passed successfully!`);
  return { passed: testCount, failed: 0 };
}

if (require.main === module) {
  try {
    const result = runTests();
    process.exit(0);
  } catch (err) {
    console.error('\nTest failed with error:', err);
    process.exit(1);
  }
}

module.exports = { runTests };
