/**
 * DocCleaner - popup.js
 * Controller for 320px Graphic Poster Popup Interface
 * Features:
 * - 4-Pill Dynamic Language Switcher (VN, EN, ES, FR) with zero-reload re-rendering
 * - Segmented Tabs ("Quick Actions" vs "Study Shelf")
 * - Study Shelf Controller: 52px Document Cards, Star Toggling, Sub-Filter Pills, 1-Click Launch
 * - Public Lab PC Mode Toggle (`dc_lab_mode`) & "Clean & Burn" Protocol Trigger
 * - Quick Actions: Print Formatter, Clutter Cleaner, Coffee Support
 */

(function () {
  'use strict';

  // State
  let currentLang = 'en';
  let currentFilter = 'all'; // 'all' | 'starred'
  let cachedDocsCount = 0;
  let isInitialized = false;

  // Safe i18n accessors
  function getT(lang, key, params) {
    if (typeof window !== 'undefined' && typeof window.t === 'function') {
      return window.t(lang, key, params);
    }
    if (typeof globalThis !== 'undefined' && typeof globalThis.t === 'function') {
      return globalThis.t(lang, key, params);
    }
    return key || '';
  }

  function getRelativeTime(timestamp, lang) {
    if (typeof window !== 'undefined' && typeof window.formatRelativeTime === 'function') {
      return window.formatRelativeTime(timestamp, lang);
    }
    if (typeof globalThis !== 'undefined' && typeof globalThis.formatRelativeTime === 'function') {
      return globalThis.formatRelativeTime(timestamp, lang);
    }
    return '';
  }

  function sanitizeDocTitle(title) {
    if (typeof window !== 'undefined' && typeof window.sanitizeTitle === 'function') {
      return window.sanitizeTitle(title);
    }
    if (typeof globalThis !== 'undefined' && typeof globalThis.sanitizeTitle === 'function') {
      return globalThis.sanitizeTitle(title);
    }
    return title || '';
  }

  function normalizeDocLang(lang) {
    if (typeof window !== 'undefined' && typeof window.normalizeLang === 'function') {
      return window.normalizeLang(lang);
    }
    if (typeof globalThis !== 'undefined' && typeof globalThis.normalizeLang === 'function') {
      return globalThis.normalizeLang(lang);
    }
    if (!lang) return 'en';
    const clean = String(lang).toLowerCase().trim().replace(/_/g, '-');
    if (clean === 'vn' || clean.startsWith('vn-')) return 'vi';
    if (['en', 'vi', 'es', 'fr'].includes(clean)) return clean;
    const primary = clean.split('-')[0];
    if (['en', 'vi', 'es', 'fr'].includes(primary)) return primary;
    return 'en';
  }

  // Shelf Storage Helpers
  async function loadShelfDocs() {
    let isLabMode = false;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const res = await chrome.storage.local.get(['dc_lab_mode']);
        isLabMode = !!res.dc_lab_mode;
      }
    } catch (e) {}

    if (isLabMode) {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session) {
          const sRes = await chrome.storage.session.get(['session_docs']);
          return Array.isArray(sRes.session_docs) ? sRes.session_docs : [];
        }
      } catch (e) {}
    } else {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const lRes = await chrome.storage.local.get(['dc_recent_docs']);
          return Array.isArray(lRes.dc_recent_docs) ? lRes.dc_recent_docs : [];
        }
      } catch (e) {}
    }
    return [];
  }

  async function toggleStarDoc(docId) {
    let isLabMode = false;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const res = await chrome.storage.local.get(['dc_lab_mode']);
        isLabMode = !!res.dc_lab_mode;
      }
    } catch (e) {}

    const storageArea = (isLabMode && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session)
      ? chrome.storage.session
      : (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ? chrome.storage.local : null);
    const key = isLabMode ? 'session_docs' : 'dc_recent_docs';

    if (storageArea) {
      try {
        const data = await storageArea.get([key]);
        const docs = Array.isArray(data[key]) ? data[key] : [];
        const targetDoc = docs.find((d) => d && d.id === docId);
        if (targetDoc) {
          targetDoc.isStarred = !targetDoc.isStarred;
          await storageArea.set({ [key]: docs });
        }
      } catch (err) {
        console.error('Failed to toggle star:', err);
      }
    }

    await renderShelf();
  }

  function launchDoc(canonicalUrl) {
    if (!canonicalUrl) return;
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: canonicalUrl });
    } else if (typeof window !== 'undefined' && window.open) {
      window.open(canonicalUrl, '_blank');
    }
  }

  function updateShelfTabBadge(count) {
    const tabRecents = document.getElementById('tab-recents');
    if (!tabRecents) return;
    const baseLabel = getT(currentLang, 'tabRecents') || 'Study Shelf';
    const finalCount = count !== undefined ? count : cachedDocsCount;
    if (finalCount > 0) {
      tabRecents.innerText = `${baseLabel} (${finalCount})`;
    } else {
      tabRecents.innerText = baseLabel;
    }
  }

  // Render Study Shelf Cards
  async function renderShelf() {
    const docsList = document.getElementById('recent-docs-list');
    const emptyState = document.getElementById('shelf-empty-state');
    if (!docsList && !emptyState) return;

    const allDocs = await loadShelfDocs();
    cachedDocsCount = allDocs.length;
    updateShelfTabBadge(allDocs.length);

    const docsToRender = (currentFilter === 'starred')
      ? allDocs.filter((d) => d && Boolean(d.isStarred))
      : allDocs;

    if (docsToRender.length === 0) {
      if (docsList) {
        docsList.innerHTML = '';
        if (docsList.children) docsList.children = [];
        docsList.style.display = 'none';
      }
      if (emptyState) {
        emptyState.style.display = 'block';
        const emptyTitle = document.getElementById('empty-state-title');
        const emptyDesc = document.getElementById('empty-state-desc');
        if (emptyTitle) {
          emptyTitle.innerText = getT(currentLang, currentFilter === 'starred' ? 'emptyStarredTitle' : 'emptyRecentsTitle');
        }
        if (emptyDesc) {
          emptyDesc.innerText = getT(currentLang, currentFilter === 'starred' ? 'emptyStarredDesc' : 'emptyRecentsDesc');
        }
      }
    } else {
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      if (docsList) {
        docsList.innerHTML = '';
        if (docsList.children) docsList.children = [];
        docsList.style.display = 'flex';

        for (const doc of docsToRender) {
          if (!doc) continue;

          // Card Root (52px Touch-Friendly)
          const card = document.createElement('div');
          card.className = 'dc-doc-card study-card doc-item';
          card.setAttribute('data-id', doc.id || '');

          // Platform Monogram Badge (ST Lime #c6eb34 or SC Green #58c474)
          const isStudocu = (doc.platform === 'studocu');
          const badge = document.createElement('div');
          badge.className = 'doc-badge ' + (isStudocu ? 'studocu' : 'scribd');
          badge.innerText = isStudocu ? 'ST' : 'SC';
          card.appendChild(badge);

          // Document Info (Title & Meta)
          const info = document.createElement('div');
          info.className = 'doc-info';

          const titleEl = document.createElement('div');
          titleEl.className = 'doc-title';
          titleEl.innerText = sanitizeDocTitle(doc.title || '');
          info.appendChild(titleEl);

          const metaEl = document.createElement('div');
          metaEl.className = 'doc-meta';
          const pageLabel = getT(currentLang, 'pages') || 'pgs';
          const pageCountStr = doc.pageCount ? `${doc.pageCount} ${pageLabel}` : '';
          const timeStr = doc.lastOpenedAt ? getRelativeTime(doc.lastOpenedAt, currentLang) : '';
          metaEl.innerText = pageCountStr && timeStr ? `${pageCountStr} · ${timeStr}` : (pageCountStr || timeStr || '');
          info.appendChild(metaEl);

          card.appendChild(info);

          // In-card Action Buttons: Star & 1-Click Launch
          const actions = document.createElement('div');
          actions.className = 'doc-actions';

          const starBtn = document.createElement('button');
          starBtn.className = 'dc-star-btn btn-star doc-action-btn' + (doc.isStarred ? ' starred' : '');
          starBtn.setAttribute('data-action', 'star');
          starBtn.setAttribute('data-id', doc.id || '');
          starBtn.setAttribute('title', doc.isStarred ? getT(currentLang, 'unstarDocument') : getT(currentLang, 'starDocument'));
          starBtn.innerText = doc.isStarred ? '★' : '☆';
          starBtn.addEventListener('click', async (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            await toggleStarDoc(doc.id);
          });
          actions.appendChild(starBtn);

          const launchBtn = document.createElement('button');
          launchBtn.className = 'dc-launch-btn btn-launch doc-action-btn';
          launchBtn.setAttribute('data-action', 'launch');
          launchBtn.setAttribute('data-url', doc.canonicalUrl || '');
          launchBtn.setAttribute('title', getT(currentLang, 'launchCleanReader'));
          launchBtn.innerText = '↗';
          launchBtn.addEventListener('click', (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            launchDoc(doc.canonicalUrl);
          });
          actions.appendChild(launchBtn);

          card.appendChild(actions);

          docsList.appendChild(card);
        }
      }
    }
  }

  // Translation Application Engine
  function applyTranslations(lang) {
    const norm = normalizeDocLang(lang);
    currentLang = norm;
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = norm;
    }

    // Update .lang-opt active state
    const langOptions = document.querySelectorAll('.lang-opt');
    langOptions.forEach((opt) => {
      const optLang = opt.getAttribute('data-lang');
      const optNorm = normalizeDocLang(optLang);
      if (optNorm === norm || optLang === norm || (norm === 'vi' && (optLang === 'vn' || optLang === 'vi'))) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    // Update all elements with data-i18n
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const val = getT(norm, key);
        if (val) el.innerText = val;
      }
    });

    // Update tab labels
    const tabActions = document.getElementById('tab-actions');
    if (tabActions) {
      tabActions.innerText = getT(norm, 'tabActions');
    }
    updateShelfTabBadge();

    // Update filter pills
    const filterAll = document.getElementById('filter-all');
    if (filterAll) {
      filterAll.innerText = getT(norm, 'filterAll');
    }
    const filterStarred = document.getElementById('filter-starred');
    if (filterStarred) {
      filterStarred.innerText = getT(norm, 'filterStarred');
    }

    // Update empty state text
    const emptyTitle = document.getElementById('empty-state-title');
    const emptyDesc = document.getElementById('empty-state-desc');
    if (emptyTitle) {
      emptyTitle.innerText = getT(norm, currentFilter === 'starred' ? 'emptyStarredTitle' : 'emptyRecentsTitle');
    }
    if (emptyDesc) {
      emptyDesc.innerText = getT(norm, currentFilter === 'starred' ? 'emptyStarredDesc' : 'emptyRecentsDesc');
    }
  }

  // Context & Tab Status
  async function updateTabContext() {
    try {
      if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) return;
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs && tabs[0];
      const pdfDesc = document.getElementById('pdf-btn-desc');
      const statusBadge = document.getElementById('status-badge');
      const platformName = document.getElementById('platform-name');

      if (!tab || !tab.url) {
        updateStatus(getT(currentLang, 'statusStandby'), false);
        return;
      }

      const url = new URL(tab.url);
      if (url.hostname.includes('scribd.com')) {
        updateStatus(getT(currentLang, 'statusScribdReady'), false);
        if (pdfDesc) pdfDesc.innerText = getT(currentLang, 'scribdPdfDesc');
        if (platformName) platformName.innerText = 'Scribd.com';
        if (statusBadge) statusBadge.className = 'card-badge scribd-theme';
      } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
        updateStatus(getT(currentLang, 'statusStudocuReady'), false);
        if (pdfDesc) pdfDesc.innerText = getT(currentLang, 'studocuPdfDesc');
        if (platformName) platformName.innerText = 'Studocu.com';
        if (statusBadge) statusBadge.className = 'card-badge studocu-theme';
      } else {
        updateStatus(getT(currentLang, 'statusNotSupported'), false);
        if (platformName) platformName.innerText = getT(currentLang, 'notSupported');
        if (statusBadge) statusBadge.className = 'card-badge idle-theme';
      }
    } catch (e) {
      // Standby fallback
    }
  }

  function updateStatus(msg, isProcessing = false) {
    const statusText = document.getElementById('status-text');
    const statusBar = document.getElementById('status');

    if (statusText) {
      statusText.innerText = msg;
    }
    if (statusBar) {
      if (isProcessing) {
        statusBar.classList.add('processing');
      } else {
        statusBar.classList.remove('processing');
      }
    }
  }

  // Component Setup Functions
  function setupLanguageSwitcher() {
    const langOptions = document.querySelectorAll('.lang-opt');
    langOptions.forEach((opt) => {
      if (opt._dc_bound) return;
      opt._dc_bound = true;
      opt.addEventListener('click', async () => {
        const selected = opt.getAttribute('data-lang');
        if (selected) {
          const norm = normalizeDocLang(selected);
          currentLang = norm;
          try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              await chrome.storage.local.set({ lang: norm });
            }
          } catch (e) {}
          applyTranslations(norm);
          await updateTabContext();
          await renderShelf();
        }
      });
    });

    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch && !langSwitch._dc_bound) {
      langSwitch._dc_bound = true;
      langSwitch.addEventListener('click', async (e) => {
        let target = e.target;
        if (target && typeof target.closest === 'function') {
          target = target.closest('.lang-opt');
        } else if (target && typeof target.classList !== 'undefined' && !target.classList.contains('lang-opt')) {
          target = null;
        }
        if (!target) return;
        const selected = target.getAttribute('data-lang');
        if (selected) {
          const norm = normalizeDocLang(selected);
          currentLang = norm;
          try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              await chrome.storage.local.set({ lang: norm });
            }
          } catch (e) {}
          applyTranslations(norm);
          await updateTabContext();
          await renderShelf();
        }
      });
    }
  }

  function setupSegmentedTabs() {
    const tabActions = document.getElementById('tab-actions');
    const tabRecents = document.getElementById('tab-recents');
    const panelActions = document.getElementById('panel-actions');
    const panelRecents = document.getElementById('panel-recents');

    if (tabActions && !tabActions._dc_bound) {
      tabActions._dc_bound = true;
      tabActions.addEventListener('click', () => {
        tabActions.classList.add('active');
        if (tabRecents) tabRecents.classList.remove('active');
        if (panelActions) {
          panelActions.classList.add('active');
          panelActions.style.display = 'block';
        }
        if (panelRecents) {
          panelRecents.classList.remove('active');
          panelRecents.style.display = 'none';
        }
      });
    }

    if (tabRecents && !tabRecents._dc_bound) {
      tabRecents._dc_bound = true;
      tabRecents.addEventListener('click', async () => {
        tabRecents.classList.add('active');
        if (tabActions) tabActions.classList.remove('active');
        if (panelRecents) {
          panelRecents.classList.add('active');
          panelRecents.style.display = 'block';
        }
        if (panelActions) {
          panelActions.classList.remove('active');
          panelActions.style.display = 'none';
        }
        await renderShelf();
      });
    }
  }

  function setupShelfFilters() {
    const filterAll = document.getElementById('filter-all');
    const filterStarred = document.getElementById('filter-starred');

    if (filterAll && !filterAll._dc_bound) {
      filterAll._dc_bound = true;
      filterAll.addEventListener('click', async () => {
        currentFilter = 'all';
        filterAll.classList.add('active');
        if (filterStarred) filterStarred.classList.remove('active');
        await renderShelf();
      });
    }

    if (filterStarred && !filterStarred._dc_bound) {
      filterStarred._dc_bound = true;
      filterStarred.addEventListener('click', async () => {
        currentFilter = 'starred';
        filterStarred.classList.add('active');
        if (filterAll) filterAll.classList.remove('active');
        await renderShelf();
      });
    }
  }

  function setupLabMode() {
    const toggle = document.getElementById('toggle-lab-mode');
    const badge = document.getElementById('lab-mode-badge');
    if (!toggle || toggle._dc_bound) return;
    toggle._dc_bound = true;

    const handler = async () => {
      const isChecked = toggle.checked;
      if (badge) {
        badge.style.display = isChecked ? 'inline-block' : 'none';
      }
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ dc_lab_mode: isChecked });
        }
      } catch (err) {}
      await renderShelf();
    };

    toggle.addEventListener('change', handler);
    toggle.addEventListener('click', handler);
  }

  function setupCleanAndBurn() {
    const burnBtn = document.getElementById('btn-clean-burn');
    if (!burnBtn || burnBtn._dc_bound) return;
    burnBtn._dc_bound = true;

    burnBtn.addEventListener('click', async () => {
      const confirmMsg = getT(currentLang, 'burnConfirm') || 'This will permanently wipe all local history, cached documents, and session cookies. Proceed?';
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        const ok = window.confirm(confirmMsg);
        if (!ok) return;
      }
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          await chrome.runtime.sendMessage({ action: 'EXECUTE_CLEAN_AND_BURN' });
        }
        const successToast = getT(currentLang, 'burnSuccessToast') || 'All session traces permanently wiped!';
        updateStatus(successToast, false);
        if (typeof alert === 'function') {
          alert(successToast);
        }
        await renderShelf();
      } catch (err) {
        console.error('Clean & Burn error:', err);
      }
    });
  }

  function setupActionButtons() {
    // Buy Me A Coffee Button
    const coffeeBtn = document.getElementById('coffeeBtn');
    if (coffeeBtn && !coffeeBtn._dc_bound) {
      coffeeBtn._dc_bound = true;
      coffeeBtn.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: 'https://khanhnkq.quizken.com/buy-me-a-coffee' });
        } else if (typeof window !== 'undefined' && window.open) {
          window.open('https://khanhnkq.quizken.com/buy-me-a-coffee', '_blank');
        }
      });
    }

    // Clear cookies & remove ads button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn && !clearBtn._dc_bound) {
      clearBtn._dc_bound = true;
      clearBtn.addEventListener('click', async () => {
        updateStatus(getT(currentLang, 'statusScanning'), true);

        try {
          if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) return;
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab || !tab.url) return;

          const url = new URL(tab.url);
          const targetDomains = [];
          if (url.hostname.includes('scribd.com')) {
            targetDomains.push('scribd.com');
          } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
            targetDomains.push('studocu.com', 'studocu.vn');
          } else {
            updateStatus(getT(currentLang, 'statusNotSupported'), false);
            if (typeof alert === 'function') alert(getT(currentLang, 'alertOpenDoc'));
            return;
          }

          let count = 0;
          if (chrome.cookies && chrome.cookies.getAll && chrome.cookies.remove) {
            for (const domain of targetDomains) {
              const cookies = await chrome.cookies.getAll({ domain });
              for (const cookie of cookies) {
                const cleanDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
                const protocol = cookie.secure ? 'https:' : 'http:';
                const cookieUrl = `${protocol}//${cleanDomain}${cookie.path}`;
                await chrome.cookies.remove({ url: cookieUrl, name: cookie.name, storeId: cookie.storeId });
                count++;
              }
            }
          }

          // Trigger DOM ad cleaner
          if (chrome.scripting && chrome.scripting.executeScript && tab.id) {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                if (typeof window.removeScribdAds === 'function') window.removeScribdAds();
                document.querySelectorAll('.promo_wrapper, .promo_border, .auto__doc_page_webpack_app_page_truncate_promo, #upgrade-overlay, #onetrust-consent-sdk')
                  .forEach((el) => el.remove());
              }
            });
          }

          const clearedMsg = getT(currentLang, 'statusCleared', { count });
          updateStatus(clearedMsg, false);

          setTimeout(() => {
            if (tab && tab.id && chrome.tabs && chrome.tabs.reload) {
              chrome.tabs.reload(tab.id);
            }
          }, 800);
        } catch (e) {
          updateStatus('Error: ' + e.message, false);
        }
      });
    }

    // Format & Print PDF Button
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn && !checkBtn._dc_bound) {
      checkBtn._dc_bound = true;
      checkBtn.addEventListener('click', async () => {
        if (checkBtn.classList && checkBtn.classList.contains('processing')) return;
        if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) return;

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;

        const url = new URL(tab.url);
        if (checkBtn.classList) checkBtn.classList.add('processing');

        try {
          if (url.hostname.includes('scribd.com')) {
            updateStatus(getT(currentLang, 'statusProcessingScribd'), true);
            if (chrome.scripting && chrome.scripting.executeScript) {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (errorMsg) => {
                  if (typeof window.runScribdCleaner === 'function') {
                    window.runScribdCleaner();
                  } else if (typeof alert === 'function') {
                    alert(errorMsg || 'Initializing Scribd loader, please try again in 1 second!');
                  }
                },
                args: [getT(currentLang, 'alertScribdInit')]
              });
            }
          } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
            updateStatus(getT(currentLang, 'statusProcessingStudocu'), true);
            if (chrome.scripting && chrome.scripting.executeScript) {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (errorMsg) => {
                  if (typeof window.runStudocuCleanViewer === 'function') {
                    window.runStudocuCleanViewer();
                  } else if (typeof alert === 'function') {
                    alert(errorMsg || 'Initializing Studocu loader, please try again in 1 second!');
                  }
                },
                args: [getT(currentLang, 'alertStudocuInit')]
              });
            }
          } else {
            if (typeof alert === 'function') alert(getT(currentLang, 'alertOpenDoc'));
          }
        } catch (e) {
          updateStatus('Error: ' + e.message, false);
        } finally {
          setTimeout(() => {
            if (checkBtn.classList) checkBtn.classList.remove('processing');
          }, 1500);
        }
      });
    }
  }

  async function loadInitialState() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get(['lang', 'dc_lab_mode']);
        if (stored.lang) {
          currentLang = normalizeDocLang(stored.lang);
        }
        const toggle = document.getElementById('toggle-lab-mode');
        const badge = document.getElementById('lab-mode-badge');
        if (toggle) {
          toggle.checked = !!stored.dc_lab_mode;
        }
        if (badge) {
          badge.style.display = stored.dc_lab_mode ? 'inline-block' : 'none';
        }
      }
    } catch (e) {}

    applyTranslations(currentLang);
    await updateTabContext();
    await renderShelf();
  }

  function initPopup() {
    setupLanguageSwitcher();
    setupSegmentedTabs();
    setupShelfFilters();
    setupLabMode();
    setupCleanAndBurn();
    setupActionButtons();
    loadInitialState();
  }

  // Execute immediately (handles pre-populated DOM / test runners)
  initPopup();

  // Also bind to DOMContentLoaded if document is still in loading state
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', () => {
      initPopup();
    });
  }
})();
