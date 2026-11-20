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
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        if (chrome.storage.local) {
          const lRes = await chrome.storage.local.get(['dc_recent_docs']);
          if (Array.isArray(lRes.dc_recent_docs) && lRes.dc_recent_docs.length > 0) {
            return lRes.dc_recent_docs;
          }
        }
        if (chrome.storage.session) {
          const sRes = await chrome.storage.session.get(['session_docs']);
          if (Array.isArray(sRes.session_docs) && sRes.session_docs.length > 0) {
            return sRes.session_docs;
          }
        }
      }
    } catch (e) {}
    return [];
  }

  async function toggleStarDoc(docId, canonicalUrl, title) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        if (chrome.storage.local) {
          const data = await chrome.storage.local.get(['dc_recent_docs']);
          const docs = Array.isArray(data.dc_recent_docs) ? data.dc_recent_docs : [];
          const target = docs.find((d) => d && (
            (docId && d.id === docId) ||
            (canonicalUrl && d.canonicalUrl === canonicalUrl) ||
            (title && d.title === title)
          ));
          if (target) {
            target.isStarred = !target.isStarred;
            await chrome.storage.local.set({ dc_recent_docs: docs });
          }
        }
        if (chrome.storage.session) {
          const data = await chrome.storage.session.get(['session_docs']);
          const docs = Array.isArray(data.session_docs) ? data.session_docs : [];
          const target = docs.find((d) => d && (
            (docId && d.id === docId) ||
            (canonicalUrl && d.canonicalUrl === canonicalUrl) ||
            (title && d.title === title)
          ));
          if (target) {
            target.isStarred = !target.isStarred;
            await chrome.storage.session.set({ session_docs: docs });
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
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

  async function removeShelfDoc(docId, canonicalUrl, title) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Clear from chrome.storage.local
        if (chrome.storage.local) {
          const lData = await chrome.storage.local.get(['dc_recent_docs']);
          if (Array.isArray(lData.dc_recent_docs)) {
            const filtered = lData.dc_recent_docs.filter((d) => {
              if (!d) return false;
              if (docId && d.id && d.id === docId) return false;
              if (canonicalUrl && d.canonicalUrl && d.canonicalUrl === canonicalUrl) return false;
              if (title && d.title && d.title === title) return false;
              return true;
            });
            await chrome.storage.local.set({ dc_recent_docs: filtered });
          }
        }

        // Clear from chrome.storage.session
        if (chrome.storage.session) {
          const sData = await chrome.storage.session.get(['session_docs']);
          if (Array.isArray(sData.session_docs)) {
            const filtered = sData.session_docs.filter((d) => {
              if (!d) return false;
              if (docId && d.id && d.id === docId) return false;
              if (canonicalUrl && d.canonicalUrl && d.canonicalUrl === canonicalUrl) return false;
              if (title && d.title && d.title === title) return false;
              return true;
            });
            await chrome.storage.session.set({ session_docs: filtered });
          }
        }
      }
    } catch (err) {
      console.error('Failed to remove shelf doc:', err);
    }

    await renderShelf();
  }

  async function clearAllShelfDocs() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        if (chrome.storage.local) {
          await chrome.storage.local.set({ dc_recent_docs: [] });
        }
        if (chrome.storage.session) {
          await chrome.storage.session.set({ session_docs: [] });
        }
      }
    } catch (err) {
      console.error('Failed to clear shelf:', err);
    }

    cachedDocsCount = 0;
    await renderShelf();
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

    const footerActions = document.getElementById('shelf-footer-actions');
    const clearBtn = document.getElementById('btn-clear-shelf');
    const confirmBar = document.getElementById('shelf-confirm-bar');

    if (docsToRender.length === 0) {
      if (footerActions) {
        footerActions.style.display = 'none';
      }
      if (confirmBar) {
        confirmBar.style.display = 'none';
      }
      if (clearBtn) {
        clearBtn.style.display = 'inline-flex';
      }
      if (docsList) {
        docsList.innerHTML = '';
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
      if (footerActions) {
        footerActions.style.display = 'flex';
      }
      if (confirmBar && confirmBar.style.display === 'flex') {
        if (clearBtn) clearBtn.style.display = 'none';
      } else {
        if (confirmBar) confirmBar.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'inline-flex';
      }
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      if (docsList) {
        docsList.innerHTML = '';
        docsList.style.display = 'flex';

        for (const doc of docsToRender) {
          if (!doc) continue;

          try {
            // Card Root (52px Touch-Friendly)
            const card = document.createElement('div');
            card.className = 'dc-doc-card study-card doc-item';
            card.setAttribute('data-id', doc.id || '');
            card.addEventListener('click', (e) => {
              if (e.target && e.target.closest && e.target.closest('.doc-action-btn')) {
                return;
              }
              launchDoc(doc.canonicalUrl);
            });

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

            // In-card Action Buttons: Star, 1-Click Launch & Delete
            const actions = document.createElement('div');
            actions.className = 'doc-actions';

            const starBtn = document.createElement('button');
            starBtn.className = 'dc-star-btn btn-star doc-action-btn' + (doc.isStarred ? ' starred' : '');
            starBtn.setAttribute('data-action', 'star');
            starBtn.setAttribute('data-id', doc.id || '');
            starBtn.setAttribute('title', doc.isStarred ? getT(currentLang, 'unstarDocument') : getT(currentLang, 'starDocument'));
            starBtn.innerHTML = doc.isStarred
              ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="#091b42" stroke="#091b42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
              : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5e6d8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
            starBtn.addEventListener('click', async (e) => {
              if (e) {
                if (typeof e.preventDefault === 'function') e.preventDefault();
                if (typeof e.stopPropagation === 'function') e.stopPropagation();
              }
              await toggleStarDoc(doc.id, doc.canonicalUrl, doc.title);
            });
            actions.appendChild(starBtn);

            const launchBtn = document.createElement('button');
            launchBtn.className = 'dc-launch-btn btn-launch doc-action-btn';
            launchBtn.setAttribute('data-action', 'launch');
            launchBtn.setAttribute('data-url', doc.canonicalUrl || '');
            launchBtn.setAttribute('title', getT(currentLang, 'launchCleanReader'));
            launchBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>';
            launchBtn.addEventListener('click', (e) => {
              if (e) {
                if (typeof e.preventDefault === 'function') e.preventDefault();
                if (typeof e.stopPropagation === 'function') e.stopPropagation();
              }
              launchDoc(doc.canonicalUrl);
            });
            actions.appendChild(launchBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'dc-delete-btn btn-delete doc-action-btn';
            deleteBtn.setAttribute('data-action', 'delete');
            deleteBtn.setAttribute('data-id', doc.id || '');
            deleteBtn.setAttribute('title', getT(currentLang, 'deleteDoc') || 'Remove from Shelf');
            deleteBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>';
            deleteBtn.addEventListener('click', async (e) => {
              if (e) {
                if (typeof e.preventDefault === 'function') e.preventDefault();
                if (typeof e.stopPropagation === 'function') e.stopPropagation();
              }
              card.style.opacity = '0.3';
              await removeShelfDoc(doc.id, doc.canonicalUrl, doc.title);
            });
            actions.appendChild(deleteBtn);

            card.appendChild(actions);

            docsList.appendChild(card);
          } catch (cardErr) {
            console.error('[DocCleaner] Error rendering shelf card:', cardErr, doc);
          }
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

    const clearBtn = document.getElementById('btn-clear-shelf');
    const confirmBar = document.getElementById('shelf-confirm-bar');
    const btnYes = document.getElementById('btn-confirm-clear-yes');
    const btnNo = document.getElementById('btn-confirm-clear-no');

    if (clearBtn && !clearBtn._dc_bound) {
      clearBtn._dc_bound = true;
      clearBtn.addEventListener('click', async () => {
        if (confirmBar) {
          clearBtn.style.display = 'none';
          confirmBar.style.display = 'flex';
        } else {
          await clearAllShelfDocs();
        }
      });
    }

    if (btnNo && !btnNo._dc_bound) {
      btnNo._dc_bound = true;
      btnNo.addEventListener('click', () => {
        if (confirmBar) confirmBar.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'inline-flex';
      });
    }

    if (btnYes && !btnYes._dc_bound) {
      btnYes._dc_bound = true;
      btnYes.addEventListener('click', async () => {
        if (confirmBar) confirmBar.style.display = 'none';
        await clearAllShelfDocs();
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
