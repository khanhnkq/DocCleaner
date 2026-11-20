# 🧪 TEST_READY: DocCleaner Phase 2 (Retention & UX Polish)

> **Status:** READY FOR VERIFICATION & CONTINUOUS INTEGRATION  
> **Author:** `test_writer_e2e` (E2E Testing Track)  
> **Date:** 2026-11-20  
> **Target Release:** `v1.8.0` (`DocCleaner-v1.8.0.zip`)

---

## 1. Test Infrastructure Overview

A lightweight, zero-dependency Node.js test infrastructure has been engineered under `tests/`. It features an isolated Chrome Extension API mock environment (`createMockChrome`), an in-memory DOM simulation (`createMockDOM`), and VM sandboxing (`runInSandbox`) to test real browser extension scripts (`i18n.js`, `background.js`, `content.js`, `scribd_handler.js`, `popup.js`, `popup.css`, `viewer_styles.css`) without browser dependencies or build tools.

### Test Architecture Layout
```
tests/
├── harness.js                        # Mock Chrome APIs, Mock DOM, VM runner
├── test-runner.js                    # Central test runner with exit code & reporting
├── unit/
│   ├── test-i18n.js                  # Tier 1 & 2: 4-locale dictionaries, t(), relative time, sanitizer
│   ├── test-lru-engine.js            # Tier 1 & 2: 25-item LRU, star immunity, deduplication, Lab PC
│   └── test-metadata.js              # Tier 1 & 2: Studocu & Scribd extractors, canonical URLs, SPA observer
└── e2e/
    ├── test-study-shelf-flow.js      # Tier 3 & 4: Auto-save -> Shelf UI -> Star toggle -> 1-click launch
    ├── test-lab-mode-burn.js         # Tier 3 & 4: Lab PC toggle, Clean & Burn, cookie wipe, window-close
    ├── test-popup-ui-and-i18n.js     # Tier 3 & 4: 320px viewport, 4-pill switch, tabs, flat CSS audit
    └── test-packaging-and-version.js # Tier 4: Manifest V3, version 1.8.0 lock, package pipeline
```

---

## 2. Test Execution Commands

### Run Full Test Suite
```bash
node tests/test-runner.js
```

### Run by Scope
```bash
node tests/test-runner.js unit     # Run all unit tests
node tests/test-runner.js e2e      # Run all E2E integration tests
node tests/test-runner.js i18n     # Run only i18n tests
```

### Run Individual Test Suites Directly
```bash
node tests/unit/test-i18n.js
node tests/unit/test-lru-engine.js
node tests/unit/test-metadata.js
node tests/e2e/test-study-shelf-flow.js
node tests/e2e/test-lab-mode-burn.js
node tests/e2e/test-popup-ui-and-i18n.js
node tests/e2e/test-packaging-and-version.js
```

---

## 3. Section 7 Test Scenarios & KPI Mapping

| Test Scenario | Description | Test Suite File | Assertions | Target Milestone | Current Status |
|---|---|---|:---:|:---:|:---:|
| **TC-P2-01** | First-Run Document Auto-Save | `tests/unit/test-metadata.js`<br>`tests/e2e/test-study-shelf-flow.js` | 8 | M3 & M4 | ⏳ PENDING (WORKER) |
| **TC-P2-02** | LRU Eviction Under Cap (25 items) | `tests/unit/test-lru-engine.js` | 7 | M2 | ⏳ PENDING (WORKER) |
| **TC-P2-03** | Starred Document Immunity & Fallback | `tests/unit/test-lru-engine.js`<br>`tests/e2e/test-study-shelf-flow.js` | 9 | M2 & M4 | ⏳ PENDING (WORKER) |
| **TC-P2-04** | Deduplication on Re-visit | `tests/unit/test-lru-engine.js`<br>`tests/e2e/test-study-shelf-flow.js` | 8 | M2 & M4 | ⏳ PENDING (WORKER) |
| **TC-P2-05** | SPA Navigation Extraction | `tests/unit/test-metadata.js` | 5 | M3 | ⏳ PENDING (WORKER) |
| **TC-P2-06** | Scribd Metadata Accuracy | `tests/unit/test-metadata.js` | 6 | M3 | ⏳ PENDING (WORKER) |
| **TC-P2-07** | Lab PC Mode Ephemeral Storage | `tests/unit/test-lru-engine.js`<br>`tests/e2e/test-lab-mode-burn.js` | 7 | M2 | ⏳ PENDING (WORKER) |
| **TC-P2-08** | 1-Click Clean & Burn Protocol | `tests/e2e/test-lab-mode-burn.js` | 8 | M2 | ⏳ PENDING (WORKER) |
| **TC-P2-09** | Window-Close Auto-Purge | `tests/e2e/test-lab-mode-burn.js` | 4 | M2 | ⏳ PENDING (WORKER) |
| **TC-P2-10** | 4-Language Switching (VN, EN, ES, FR) | `tests/unit/test-i18n.js`<br>`tests/e2e/test-popup-ui-and-i18n.js` | 14 | M1 & M4 | M1: ✅ PASS<br>M4: ⏳ PENDING |
| **TC-P2-11** | Graphic Poster Design Audit (0 Shadows/Filters) | `tests/e2e/test-popup-ui-and-i18n.js` | 6 | M4 | ⏳ PENDING (WORKER) |
| **TC-P2-12** | Memory & Performance SLA (<10KB storage) | `tests/unit/test-lru-engine.js` | 3 | M2 | ⏳ PENDING (WORKER) |

---

## 4. Current Test Results Baseline

```
================================================================
📊 TEST EXECUTION SUMMARY REPORT
================================================================
Total Suites: 7 | Passed: 1 | Pending Milestones: 5 | Failures: 1 | Time: 288ms

Suite Name                            Milestone   Status              Duration
--------------------------------------------------------------------------------
i18n & Localization                   [M1]        ✅ PASS              7ms
Storage LRU Engine & Star Immunity    [M2]        ⏳ PENDING (WORKER)  3ms
Studocu & Scribd Metadata Extractors  [M3]        ⏳ PENDING (WORKER)  4ms
Study Shelf E2E Flow                  [M4]        ⏳ PENDING (WORKER)  106ms
Lab PC Mode & Clean & Burn Protocol   [M2]        ⏳ PENDING (WORKER)  2ms
320px Popup UI & Graphic Poster CSS Audit[M4]        ⏳ PENDING (WORKER)  1ms
Packaging, Manifest & Version Lock (1.8.0)[M5]        ❌ FAIL              164ms
--------------------------------------------------------------------------------
```

---

## 5. Discovered Defect Escalation

### Defect #1: `scripts/package-extension.sh` missing `tests/*` exclusion
- **File:** `scripts/package-extension.sh` (lines 39-60)
- **Observed Behavior:** When packaging the extension, `tests/` directory is bundled into `DocCleaner-v1.8.0.zip`.
- **Expected Behavior:** Extension package for Chrome Web Store must exclude developer tests and test harnesses (`-x "tests/*"`).
- **Remediation Needed (for M5 worker):** Add `-x "tests/*"` to `zip -r -q "$OUTPUT_ZIP"` in `scripts/package-extension.sh`.
