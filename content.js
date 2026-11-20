// Content script injected into Studocu & Scribd document pages
// Creates a floating "Tải PDF HD" button and initializes domain-specific cleaners

// =========================================================================
// DocCleaner Phase 2 - Metadata Extraction & In-Page Engine
// =========================================================================

/**
 * Deterministic 32-bit hash function (DJB2 variant)
 */
function computeDeterministicHash(str) {
    let hash = 0;
    if (!str || typeof str !== 'string') return '0';
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Normalizes document title using centralized i18n sanitizer or fallback regex
 */
function cleanDocTitle(rawTitle, platform) {
    if (!rawTitle) return '';
    let title = String(rawTitle).trim();
    if (typeof window !== 'undefined' && typeof window.sanitizeTitle === 'function') {
        title = window.sanitizeTitle(title);
    } else if (typeof sanitizeTitle === 'function') {
        title = sanitizeTitle(title);
    } else {
        if (platform === 'scribd') {
            title = title.replace(/\s*\|\s*Scribd.*$/i, '').trim();
        } else {
            title = title.replace(/\s*-\s*Studocu.*$/i, '').trim();
        }
    }
    return title;
}

/**
 * Normalizes canonical URL (strips query parameters, hash anchors, and trailing slashes)
 */
function getCanonicalUrl() {
    const loc = (typeof window !== 'undefined' && window.location) ? window.location : (typeof location !== 'undefined' ? location : null);
    if (!loc) return '';
    let url = '';
    if (loc.origin && loc.pathname) {
        const cleanPath = loc.pathname.replace(/\/+$/, '') || '/';
        url = loc.origin + cleanPath;
    } else if (loc.href) {
        url = loc.href.split('?')[0].split('#')[0];
    }
    if (!url) return '';
    return url.replace(/(?<!^https?:\/\/[^\/]+)\/+$/, '');
}

/**
 * Extracts document metadata for Studocu & Scribd
 * Conforms strictly to DocCleanerDocument interface
 * @param {string} [platform] - 'studocu' or 'scribd'
 * @returns {Object} DocCleanerDocument
 */
function extractPageMetadata(platform) {
    const loc = (typeof window !== 'undefined' && window.location) ? window.location : (typeof location !== 'undefined' ? location : null);
    const hostname = (loc && loc.hostname) ? loc.hostname.toLowerCase() : '';
    const resolvedPlatform = platform || (hostname.includes('scribd.com') ? 'scribd' : 'studocu');

    const canonicalUrl = getCanonicalUrl();
    let title = '';
    let pageCount = 0;

    const doc = (typeof document !== 'undefined') ? document : null;

    if (resolvedPlatform === 'studocu') {
        // Studocu Title extraction hierarchy:
        // 1. h1[data-qa="document-title"]
        // 2. meta[property="og:title"]
        // 3. __NEXT_DATA__
        // 4. document.title fallback
        const h1 = doc && doc.querySelector ? doc.querySelector('h1[data-qa="document-title"]') : null;
        if (h1 && (h1.innerText || h1.textContent)) {
            title = h1.innerText || h1.textContent;
        } else {
            const ogMeta = doc && doc.querySelector ? doc.querySelector('meta[property="og:title"]') : null;
            const ogContent = ogMeta ? (ogMeta.getAttribute('content') || ogMeta.content) : null;
            if (ogContent) {
                title = ogContent;
            } else {
                let nextTitle = '';
                const nextScript = doc ? (doc.getElementById ? doc.getElementById('__NEXT_DATA__') : (doc.querySelector ? doc.querySelector('#__NEXT_DATA__') : null)) : null;
                if (nextScript && nextScript.textContent) {
                    try {
                        const parsed = JSON.parse(nextScript.textContent);
                        nextTitle = parsed?.props?.pageProps?.document?.title || '';
                    } catch (e) {}
                }
                if (nextTitle) {
                    title = nextTitle;
                } else if (doc && doc.title) {
                    title = doc.title;
                }
            }
        }

        // Studocu Page count hierarchy:
        // 1. document.querySelectorAll('.pf, div[data-page-index]').length
        // 2. meta[name="doc:page_count"]
        // 3. __NEXT_DATA__
        // 4. Fallback 0
        const pageNodes = doc && doc.querySelectorAll ? doc.querySelectorAll('.pf, div[data-page-index]') : [];
        if (pageNodes && pageNodes.length > 0) {
            pageCount = pageNodes.length;
        } else {
            const metaCountEl = doc && doc.querySelector ? doc.querySelector('meta[name="doc:page_count"]') : null;
            const metaCount = metaCountEl ? (metaCountEl.getAttribute('content') || metaCountEl.content) : null;
            const parsedCount = metaCount ? parseInt(metaCount, 10) : NaN;
            if (!isNaN(parsedCount) && parsedCount > 0) {
                pageCount = parsedCount;
            } else {
                const nextScript = doc ? (doc.getElementById ? doc.getElementById('__NEXT_DATA__') : (doc.querySelector ? doc.querySelector('#__NEXT_DATA__') : null)) : null;
                if (nextScript && nextScript.textContent) {
                    try {
                        const parsed = JSON.parse(nextScript.textContent);
                        const pages = parsed?.props?.pageProps?.documentAccess?.signedQueryParams?.pages;
                        if (Array.isArray(pages) && pages.length > 0) {
                            pageCount = pages.length;
                        } else if (typeof parsed?.props?.pageProps?.document?.pagesCount === 'number') {
                            pageCount = parsed.props.pageProps.document.pagesCount;
                        }
                    } catch (e) {}
                }
            }
        }
    } else {
        // Scribd Title extraction hierarchy:
        // 1. .document_title, [class*="DocumentTitle"]
        // 2. meta[property="og:title"]
        // 3. h1
        // 4. document.title fallback
        const docTitleEl = doc && doc.querySelector ? doc.querySelector('.document_title, [class*="DocumentTitle"]') : null;
        if (docTitleEl && (docTitleEl.innerText || docTitleEl.textContent)) {
            title = docTitleEl.innerText || docTitleEl.textContent;
        } else {
            const ogMeta = doc && doc.querySelector ? doc.querySelector('meta[property="og:title"]') : null;
            const ogContent = ogMeta ? (ogMeta.getAttribute('content') || ogMeta.content) : null;
            if (ogContent) {
                title = ogContent;
            } else {
                const h1 = doc && doc.querySelector ? doc.querySelector('h1') : null;
                if (h1 && (h1.innerText || h1.textContent)) {
                    title = h1.innerText || h1.textContent;
                } else if (doc && doc.title) {
                    title = doc.title;
                }
            }
        }

        // Scribd Page count hierarchy:
        // 1. .page_counter, [class*="page_counter"] regex /of\s+(\d+)/i
        // 2. .outer_page, .document_page length
        // 3. Fallback 0
        const counterEl = doc && doc.querySelector ? doc.querySelector('.page_counter, [class*="page_counter"]') : null;
        if (counterEl) {
            const txt = counterEl.innerText || counterEl.textContent || '';
            const m = txt.match(/of\s+(\d+)/i);
            if (m && m[1]) {
                const parsed = parseInt(m[1], 10);
                if (!isNaN(parsed) && parsed > 0) pageCount = parsed;
            }
        }
        if (pageCount === 0) {
            const pages = doc && doc.querySelectorAll ? doc.querySelectorAll('.outer_page, .document_page') : [];
            if (pages && pages.length > 0) {
                pageCount = pages.length;
            }
        }
    }

    const sanitizedTitle = cleanDocTitle(title, resolvedPlatform);
    const prefix = resolvedPlatform === 'scribd' ? 'scr_' : 'stu_';
    const id = `${prefix}${computeDeterministicHash(canonicalUrl)}`;

    return {
        id,
        title: sanitizedTitle,
        canonicalUrl,
        platform: resolvedPlatform,
        pageCount: pageCount || 0,
        lastOpenedAt: Date.now(),
        isStarred: false
    };
}

/**
 * SPA Route Navigation Observer
 * Intercepts pushState, replaceState, popstate, and SPA_ROUTE_CHANGED messages
 * Debounces callbacks by 400ms for React hydration
 */
let spaTimer = null;
const spaListeners = [];

function triggerSpaDebounced(url) {
    if (spaTimer) {
        clearTimeout(spaTimer);
    }
    spaTimer = setTimeout(() => {
        spaTimer = null;
        const currentUrl = url || (typeof window !== 'undefined' && window.location ? window.location.href : '');
        for (const cb of spaListeners) {
            try {
                cb(currentUrl);
            } catch (err) {
                console.error('[DocCleaner] SPA navigation callback error:', err);
            }
        }
    }, 400);
}

function observeSpaNavigation(callback) {
    if (typeof callback !== 'function') return;
    spaListeners.push(callback);

    const win = typeof window !== 'undefined' ? window : null;
    const hist = win ? win.history : (typeof history !== 'undefined' ? history : null);

    if (hist && !hist.__dc_wrapped) {
        hist.__dc_wrapped = true;
        const origPush = hist.pushState;
        if (typeof origPush === 'function') {
            hist.pushState = function (...args) {
                const ret = origPush.apply(this, args);
                triggerSpaDebounced(args[2]);
                return ret;
            };
        }
        const origReplace = hist.replaceState;
        if (typeof origReplace === 'function') {
            hist.replaceState = function (...args) {
                const ret = origReplace.apply(this, args);
                triggerSpaDebounced(args[2]);
                return ret;
            };
        }
    }

    if (win && !win.__dc_popstate_attached && typeof win.addEventListener === 'function') {
        win.__dc_popstate_attached = true;
        win.addEventListener('popstate', () => {
            triggerSpaDebounced();
        });
    }

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage && !chrome.runtime.__dc_spa_listener) {
        const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
        if (!hostname.includes('scribd.com')) {
            chrome.runtime.__dc_spa_listener = true;
            chrome.runtime.onMessage.addListener((msg) => {
                if (msg && msg.action === 'SPA_ROUTE_CHANGED') {
                    const currentHost = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
                    if (currentHost.includes('scribd.com')) {
                        return;
                    }
                    triggerSpaDebounced(msg.url);
                }
            });
        }
    }
}

/**
 * Displays a 3-second floating toast #dc-study-toast (Disabled per user request)
 */
async function showStudyShelfToast() {
    // Disabled per user request (no toast spam on document load / reload)
}

/**
 * Checks if the current page URL represents a valid Studocu or Scribd document
 */
function isDocumentUrl(platform) {
    const loc = (typeof window !== 'undefined' && window.location) ? window.location : (typeof location !== 'undefined' ? location : null);
    const href = loc ? (loc.href || loc.pathname || '') : '';
    const doc = (typeof document !== 'undefined') ? document : null;
    if (platform === 'scribd' || href.includes('scribd.com')) {
        return href.includes('/document/') || href.includes('/doc/') || Boolean(doc && doc.querySelector && doc.querySelector('.document_title, [class*="DocumentTitle"], .outer_page, .document_page'));
    }
    return href.includes('/document/') || Boolean(doc && doc.querySelector && doc.querySelector('h1[data-qa="document-title"], .pf, div[data-page-index]'));
}

let lastRecordedCanonicalUrl = '';

/**
 * Extracts metadata, dispatches RECORD_RECENT_DOC to background, and displays #dc-study-toast
 */
function autoRecordDocument(platform) {
    try {
        const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
        if (hostname.includes('scribd.com')) {
            // Leave Scribd auto-recording exclusively to scribd_handler.js
            return;
        }
        if (!isDocumentUrl(platform)) return;
        const metadata = extractPageMetadata(platform);
        if (!metadata || !metadata.title || !metadata.canonicalUrl) return;

        if (lastRecordedCanonicalUrl === metadata.canonicalUrl) {
            return;
        }
        lastRecordedCanonicalUrl = metadata.canonicalUrl;

        if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
            chrome.runtime.sendMessage({ action: 'RECORD_RECENT_DOC', doc: metadata }, () => {
                if (chrome.runtime.lastError) {}
            });
        }
    } catch (err) {
        console.warn('[DocCleaner] autoRecordDocument error:', err);
    }
}

// Memory Purge Listener for PURGE_TRANSIENT_MEMORY
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
    if (!hostname.includes('scribd.com')) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message && message.action === 'PURGE_TRANSIENT_MEMORY') {
                const currentHost = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
                if (currentHost.includes('scribd.com')) {
                    return;
                }
                if (typeof revokeStudocuObjectUrls === 'function') {
                    revokeStudocuObjectUrls();
                }
                const container = document.getElementById('clean-viewer-container');
                const bar = document.getElementById('doccleaner-reader-bar');
                if (container) container.remove();
                if (bar) bar.remove();
                if (typeof cleanupStudocuReaderMode === 'function') {
                    cleanupStudocuReaderMode();
                }
                if (typeof sendResponse === 'function') {
                    sendResponse({ status: 'PURGED' });
                }
                return true;
            }
        });
    }
}

// Global exports across browser window, sandbox context, and Node.js
if (typeof window !== 'undefined') {
    window.extractPageMetadata = extractPageMetadata;
    window.observeSpaNavigation = observeSpaNavigation;
    window.DocCleaner = window.DocCleaner || {};
    window.DocCleaner.extractPageMetadata = extractPageMetadata;
    window.DocCleaner.observeSpaNavigation = observeSpaNavigation;
    window.DocCleaner.autoRecordDocument = autoRecordDocument;
    window.DocCleaner.showStudyShelfToast = showStudyShelfToast;
}
if (typeof globalThis !== 'undefined') {
    globalThis.extractPageMetadata = extractPageMetadata;
    globalThis.observeSpaNavigation = observeSpaNavigation;
}
if (typeof this !== 'undefined') {
    this.extractPageMetadata = extractPageMetadata;
    this.observeSpaNavigation = observeSpaNavigation;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractPageMetadata,
        observeSpaNavigation,
        autoRecordDocument,
        showStudyShelfToast
    };
}

// Auto-record document on initial page load (debounced 500ms after DOM ready)
if (typeof setTimeout !== 'undefined') {
    setTimeout(() => {
        const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
        if (!hostname.includes('scribd.com')) {
            autoRecordDocument('studocu');
        }
    }, 500);
}

// Auto-record document on SPA route transitions
observeSpaNavigation(() => {
    const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
    if (!hostname.includes('scribd.com')) {
        autoRecordDocument('studocu');
    }
});

(function initDocHelper() {
    // Prevent duplicate injection
    if (document.getElementById('studocu-fab-btn')) return;

    const hostname = window.location.hostname;
    const isScribd = hostname.includes('scribd.com');
    const isStudocu = hostname.includes('studocu.com') || hostname.includes('studocu.vn');

    // 1. Initialize Ad Blocker & Page Cleaners immediately
    if (isScribd && typeof window.initScribdAdBlocker === 'function') {
        window.initScribdAdBlocker();
    } else if (isStudocu) {
        initStudocuAdBlocker();
    }

    // 2. Inject styles for the floating action button (FAB) - Graphic Poster Theme
    const fabBadgeBg = isScribd ? '#58c474' : '#c6eb34';
    const brandName = isScribd ? 'Better Scribd · Free' : (isStudocu ? 'Better Studocu · Free' : 'DocCleaner');

    const fabStyle = document.createElement('style');
    fabStyle.id = 'studocu-fab-styles';
    fabStyle.textContent = `
        #studocu-fab-btn {
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            z-index: 2147483647 !important;
            width: 44px !important;
            height: 44px !important;
            padding: 0 !important;
            background-color: ${fabBadgeBg} !important;
            color: #091b42 !important;
            border-radius: 12px !important;
            border: 1.5px solid #091b42 !important;
            cursor: pointer !important;
            box-shadow: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s ease !important;
            user-select: none !important;
            outline: none !important;
        }

        #studocu-fab-btn:hover {
            transform: translateY(-2px) scale(1.06) !important;
            filter: brightness(0.96) !important;
        }

        #studocu-fab-btn:active {
            transform: scale(0.94) !important;
        }

        #studocu-fab-btn .fab-icon-spinner {
            display: none;
        }

        #studocu-fab-btn .fab-icon-download {
            display: block;
        }

        #studocu-fab-btn.processing {
            background-color: #293856 !important;
            color: #f6f7ef !important;
            cursor: wait !important;
            opacity: 0.95 !important;
        }

        #studocu-fab-btn.processing .fab-icon-download {
            display: none;
        }

        #studocu-fab-btn.processing .fab-icon-spinner {
            display: block;
            animation: fabSpin 0.85s linear infinite;
        }

        @keyframes fabSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
            #studocu-fab-btn {
                transition-duration: 0.01ms !important;
                transform: none !important;
            }
            #studocu-fab-btn.processing .fab-icon-spinner {
                animation: none !important;
            }
        }

        @media print {
            #studocu-fab-btn { display: none !important; }
            #dc-fab-tooltip, #dc-print-toast { display: none !important; }
        }

        /* Day-0 Onboarding: Flat Tooltip & Outline Pulse (No Shadow, No Blur) */
        #dc-fab-tooltip {
            position: fixed !important;
            bottom: 78px !important;
            right: 24px !important;
            z-index: 2147483647 !important;
            background-color: #091b42 !important;
            color: #f6f7ef !important;
            border: 1.5px solid #c6eb34 !important;
            border-radius: 12px !important;
            padding: 9px 14px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            pointer-events: none !important;
            user-select: none !important;
            transition: opacity 0.25s ease, transform 0.25s ease !important;
        }

        #dc-fab-tooltip.hiding {
            opacity: 0 !important;
            transform: translateY(6px) !important;
        }

        #dc-fab-tooltip::after {
            content: '' !important;
            position: absolute !important;
            bottom: -6px !important;
            right: 24px !important;
            width: 0 !important;
            height: 0 !important;
            border-left: 6px solid transparent !important;
            border-right: 6px solid transparent !important;
            border-top: 6px solid #c6eb34 !important;
            box-shadow: none !important;
            filter: none !important;
        }

        @keyframes dcFlatPulse {
            0%, 100% {
                outline: 2px solid transparent;
                outline-offset: 0px;
            }
            50% {
                outline: 2.5px solid #c6eb34;
                outline-offset: 3.5px;
            }
        }

        #studocu-fab-btn.first-run-pulse {
            animation: dcFlatPulse 1.2s ease-in-out 3 !important;
            box-shadow: none !important;
        }

        /* Day-0 Onboarding: Flat Print Tips Toast (No Shadow, No Blur) */
        #dc-print-toast {
            position: fixed !important;
            bottom: 24px !important;
            left: 24px !important;
            z-index: 2147483647 !important;
            max-width: 380px !important;
            background-color: #091b42 !important;
            color: #f6f7ef !important;
            border: 1.5px solid #c6eb34 !important;
            border-radius: 14px !important;
            padding: 12px 16px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
            user-select: none !important;
            transition: opacity 0.25s ease, transform 0.25s ease !important;
        }

        #dc-print-toast.hiding {
            opacity: 0 !important;
            transform: translateY(8px) !important;
        }

        .dc-toast-icon {
            width: 22px !important;
            height: 22px !important;
            flex-shrink: 0 !important;
            background-color: #c6eb34 !important;
            color: #091b42 !important;
            border-radius: 6px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .dc-toast-body {
            flex: 1 !important;
        }

        .dc-toast-body strong {
            color: #c6eb34 !important;
            font-weight: 800 !important;
        }

        .dc-toast-close {
            background: transparent !important;
            border: none !important;
            color: #8fa0c0 !important;
            cursor: pointer !important;
            font-size: 16px !important;
            line-height: 1 !important;
            padding: 2px !important;
            margin-left: 4px !important;
        }

        .dc-toast-close:hover {
            color: #ffffff !important;
        }
    `;
    document.head.appendChild(fabStyle);

    // 3. Create floating action button (Compact Icon-Only FAB)
    const fabBtn = document.createElement('button');
    fabBtn.id = 'studocu-fab-btn';
    fabBtn.setAttribute('aria-label', 'Format for Print');
    fabBtn.title = 'Format for Print A4 (DocCleaner)';

    async function updateFabLabel() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const { lang } = await chrome.storage.local.get({ lang: 'en' });
                const titleText = lang === 'vi' ? 'Định dạng in A4 (DocCleaner)' : 'Format for Print A4 (DocCleaner)';
                fabBtn.title = titleText;
                fabBtn.setAttribute('aria-label', titleText);
            }
        } catch (e) {}
    }

    fabBtn.innerHTML = `
        <svg class="fab-icon-download" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 15V3"></path>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <path d="m7 10 5 5 5-5"></path>
        </svg>
        <svg class="fab-icon-spinner" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
    `;

    updateFabLabel();

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.lang) {
                updateFabLabel();
            }
        });
    }

    // =========================================================================
    // DAY-0 ONBOARDING: FLAT TOOLTIP & PULSE
    // =========================================================================
    let fabTooltipEl = null;
    let tooltipTimer = null;

    function hideFabTooltip() {
        if (tooltipTimer) {
            clearTimeout(tooltipTimer);
            tooltipTimer = null;
        }
        if (fabTooltipEl) {
            fabTooltipEl.classList.add('hiding');
            setTimeout(() => {
                if (fabTooltipEl) {
                    fabTooltipEl.remove();
                    fabTooltipEl = null;
                }
            }, 250);
        }
        if (fabBtn) {
            fabBtn.classList.remove('first-run-pulse');
        }
    }

    async function checkFirstRunTooltip() {
        try {
            if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
            const data = await chrome.storage.local.get(['isFirstRun', 'lang']);
            if (data.isFirstRun && !document.getElementById('dc-fab-tooltip') && document.body) {
                const isVi = data.lang === 'vi';
                fabTooltipEl = document.createElement('div');
                fabTooltipEl.id = 'dc-fab-tooltip';
                fabTooltipEl.innerText = isVi ? 'Bấm đây để dọn trang & in PDF A4' : 'Click here to clean & print A4 PDF';
                document.body.appendChild(fabTooltipEl);

                fabBtn.classList.add('first-run-pulse');

                tooltipTimer = setTimeout(() => {
                    hideFabTooltip();
                }, 8000);
            }
        } catch (e) {
            console.warn('[DocCleaner] checkFirstRunTooltip error:', e);
        }
    }

    fabBtn.addEventListener('click', async () => {
        if (fabBtn.classList.contains('processing')) return;

        // Dismiss first-run tooltip and persist completion
        hideFabTooltip();
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ isFirstRun: false });
            }
        } catch (e) {}

        fabBtn.classList.add('processing');

        const statusCallback = (msg) => {
            fabBtn.title = msg;
        };

        try {
            if (isScribd) {
                if (typeof window.runScribdCleaner === 'function') {
                    await window.runScribdCleaner(statusCallback);
                } else {
                    alert('Error: Scribd Handler is not ready.');
                }
            } else if (isStudocu) {
                fabBtn.title = 'Processing Studocu...';
                await runStudocuCleanViewer();
            } else {
                alert('Current web page is not supported.');
            }
        } catch (e) {
            console.error('DocCleaner error:', e);
            alert('Error: ' + e.message);
        } finally {
            fabBtn.classList.remove('processing');
            updateFabLabel();
        }
    });

    const attachFab = () => {
        if (!document.getElementById('studocu-fab-btn') && document.body) {
            document.body.appendChild(fabBtn);
            checkFirstRunTooltip();
        }
    };

    if (document.body) {
        attachFab();
    } else {
        document.addEventListener('DOMContentLoaded', attachFab);
    }

    // Continuous safeguard for dynamic SPA route transitions (Scribd & Studocu)
    setInterval(attachFab, 1500);
})();

// ==========================================================================
// DAY-0 ONBOARDING: PRINT TIPS TOAST (PURE FLAT, ZERO SHADOW / BLUR)
// ==========================================================================
window.__dcShowPrintToast = async function() {
    try {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
        const data = await chrome.storage.local.get(['hasSeenPrintTip', 'lang']);
        if (data.hasSeenPrintTip) return;

        if (document.getElementById('dc-print-toast')) return;

        const isVi = data.lang === 'vi';
        const toast = document.createElement('div');
        toast.id = 'dc-print-toast';
        toast.innerHTML = `
            <div class="dc-toast-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="9" y1="18" x2="15" y2="18"></line>
                    <line x1="10" y1="22" x2="14" y2="22"></line>
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
            </div>
            <div class="dc-toast-body">
                ${isVi 
                    ? '<strong>Mẹo in đẹp:</strong> Trong hộp thoại in, chọn Margins <strong>"None"</strong> và bật <strong>"Background graphics"</strong> để bản in chuẩn khổ A4 không trang trắng.'
                    : '<strong>Pro Tip:</strong> In Chrome print dialog, set Margins to <strong>"None"</strong> and check <strong>"Background graphics"</strong> for crisp zero-blank A4 prints.'
                }
            </div>
            <button class="dc-toast-close" title="Close" aria-label="Close">✕</button>
        `;

        document.body.appendChild(toast);

        // Mark as seen
        chrome.storage.local.set({ hasSeenPrintTip: true });

        const closeBtn = toast.querySelector('.dc-toast-close');
        const dismissToast = () => {
            toast.classList.add('hiding');
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 250);
        };

        if (closeBtn) closeBtn.addEventListener('click', dismissToast);
        setTimeout(dismissToast, 9000);
    } catch (e) {
        console.warn('[DocCleaner] showPrintToast error:', e);
    }
};

// ==========================================================================
// STUDOCU SPECIFIC CLEANER & AD BLOCKER
// ==========================================================================

// Module-level tracking for transient Blob Object URLs to prevent RAM bloat
let studocuObjectUrls = [];

function revokeStudocuObjectUrls() {
    if (studocuObjectUrls.length > 0) {
        studocuObjectUrls.forEach(url => {
            try {
                URL.revokeObjectURL(url);
            } catch (e) {}
        });
        studocuObjectUrls = [];
    }
}

/**
 * Accurately measures the browser's CSS pixel equivalent for A4 dimensions (210mm x 296mm).
 * Uses a 296mm height (1mm safety margin below 297mm) to prevent 1px subpixel overflow.
 */
function getA4DimensionsPx() {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:210mm;height:296mm;visibility:hidden;pointer-events:none;';
    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    const w = rect.width || (210 * 96 / 25.4);
    const h = rect.height || (296 * 96 / 25.4);
    probe.remove();
    return { a4WidthPx: w, a4HeightPx: h };
}

/**
 * Wraps a captured page DOM node in an exact A4 container with mathematical scaling.
 */
function wrapInA4Page(contentNode, origWidth, origHeight, pageIndex, a4W, a4H) {
    const validA4W = (typeof a4W === 'number' && isFinite(a4W) && a4W > 0) ? a4W : (210 * 96 / 25.4);
    const validA4H = (typeof a4H === 'number' && isFinite(a4H) && a4H > 0) ? a4H : (296 * 96 / 25.4);
    const validOrigW = (typeof origWidth === 'number' && isFinite(origWidth) && origWidth > 0) ? origWidth : validA4W;
    const validOrigH = (typeof origHeight === 'number' && isFinite(origHeight) && origHeight > 0) ? origHeight : validA4H;

    const scaleW = validA4W / validOrigW;
    const scaleH = validA4H / validOrigH;
    const scaleRatio = Math.min(scaleW, scaleH);
    const safeScale = Math.floor(scaleRatio * 10000) / 10000;

    const scaledW = validOrigW * safeScale;
    const scaledH = validOrigH * safeScale;
    const offsetX = Math.max(0, (validA4W - scaledW) / 2);
    const offsetY = Math.max(0, (validA4H - scaledH) / 2);

    const wrapper = document.createElement('div');
    wrapper.className = 'clean-page-wrapper';
    wrapper.dataset.pageIndex = pageIndex.toString();

    const scaledContainer = document.createElement('div');
    scaledContainer.className = 'scaled-content';
    scaledContainer.style.width = validOrigW + 'px';
    scaledContainer.style.height = validOrigH + 'px';
    scaledContainer.style.transformOrigin = 'top left';
    scaledContainer.style.transform = `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px) scale(${safeScale.toFixed(4)})`;

    contentNode.style.width = validOrigW + 'px';
    contentNode.style.height = validOrigH + 'px';
    contentNode.style.margin = '0 auto';

    scaledContainer.appendChild(contentNode);
    wrapper.appendChild(scaledContainer);
    return wrapper;
}

function initStudocuAdBlocker() {
    let cleanDebounceTimer = null;

    const removeStudocuAds = () => {
        const adSelectors = [
            '#upgrade-overlay',
            '.banner-wrapper',
            '[class*="paywall-overlay"]',
            '[class*="PaywallOverlay"]',
            '[class*="paywall_overlay"]',
            '.viewer-paywall-banner',
            '#onetrust-consent-sdk',
            '.onetrust-pc-dark-filter',
            '#didomi-host',
            '#credential_picker_container',
            '#credential_picker_iframe',
            'iframe[src*="accounts.google.com/gsi"]'
        ];
        adSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                try {
                    el.remove();
                } catch (e) {
                    el.style.display = 'none';
                }
            });
        });

        // Unblur document wrapper & pages safely and ensure display is block
        document.querySelectorAll('.pf, .pc, #document-wrapper').forEach(el => {
            el.style.filter = 'none';
            el.style.webkitFilter = 'none';
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.display = 'block';
        });
    };

    removeStudocuAds();

    const DOCCLEANER_IGNORE_SELECTOR = '#clean-viewer-container, #studocu-fab-btn, #studocu-preload-overlay, #scribd-preload-overlay, #clean-reader-bar, #doccleaner-reader-bar, #clean-viewer-styles';

    const observer = new MutationObserver((mutations) => {
        let shouldClean = false;
        for (const mutation of mutations) {
            const targetEl = mutation.target && mutation.target.nodeType === 1 
                ? mutation.target 
                : (mutation.target && mutation.target.parentElement);

            // Explicitly ignore mutations originating from or inside any DocCleaner UI component
            if (targetEl && targetEl.closest && targetEl.closest(DOCCLEANER_IGNORE_SELECTOR)) {
                continue;
            }

            // Check if any added node is from outside DocCleaner
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if (!node.matches(DOCCLEANER_IGNORE_SELECTOR) && (!node.closest || !node.closest(DOCCLEANER_IGNORE_SELECTOR))) {
                            shouldClean = true;
                            break;
                        }
                    } else if (node.nodeType === 3) {
                        if (!node.parentElement || !node.parentElement.closest(DOCCLEANER_IGNORE_SELECTOR)) {
                            shouldClean = true;
                            break;
                        }
                    }
                }
            }
            if (shouldClean) break;
        }

        if (shouldClean) {
            if (cleanDebounceTimer) clearTimeout(cleanDebounceTimer);
            // Debounced 300ms window to prevent rapid subtree re-evaluations
            cleanDebounceTimer = setTimeout(removeStudocuAds, 300);
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

async function runStudocuCleanViewer() {
    if (document.getElementById('clean-viewer-container')) {
        window.print();
        return;
    }

    // Auto-record document on clean reader activation
    try {
        autoRecordDocument('studocu');
    } catch (e) {}

    // 1. Identify all document pages
    let pageNodes = Array.from(document.querySelectorAll('.pf'));
    if (pageNodes.length === 0) {
        pageNodes = Array.from(document.querySelectorAll('div[data-page-index]'));
    }
    if (pageNodes.length === 0) {
        pageNodes = Array.from(document.querySelectorAll('.page-content, .pc'));
    }
    if (pageNodes.length === 0) {
        alert("Không tìm thấy trang nào.\n(Vui lòng mở một tài liệu Studocu để tải!)");
        return;
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const totalPages = pageNodes.length;
    let overlayUI = null;

    try {
        // Fullscreen solid progress overlay (user sees zero jumping/scrolling)
        function showStudocuOverlay(isVi) {
            const existing = document.getElementById('studocu-preload-overlay');
            if (existing) try { existing.remove(); } catch (e) {}

            const overlay = document.createElement('div');
            overlay.id = 'studocu-preload-overlay';
            overlay.style.cssText = `
                position: fixed !important; top: 0 !important; left: 0 !important;
                width: 100vw !important; height: 100vh !important;
                background: #091b42 !important;
                z-index: 2147483647 !important;
                display: flex !important; align-items: center !important; justify-content: center !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                color: #f6f7ef !important; user-select: none !important;
            `;
            overlay.innerHTML = `
                <div style="background:#11224d;border:1.5px solid #091b42;border-radius:20px;padding:32px 36px;max-width:440px;width:90%;text-align:center;box-shadow:none;display:flex;flex-direction:column;align-items:center;gap:16px;">
                    <div style="width:56px;height:56px;border-radius:18px;background:rgba(198,235,52,0.15);border:1px solid rgba(198,235,52,0.35);display:flex;align-items:center;justify-content:center;color:#c6eb34;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:stdSpin 0.9s linear infinite;">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 style="margin:0;font-size:17.5px;font-weight:700;color:#fff;letter-spacing:-0.2px;">
                            ${isVi ? 'Đang nạp & tối ưu PDF Studocu HD' : 'Loading & Optimizing Studocu HD PDF'}
                        </h3>
                        <p id="std-preload-subtitle" style="margin:6px 0 0 0;font-size:13px;color:rgba(246,247,239,0.75);font-weight:500;">
                            ${isVi ? 'Đang tự động nạp bảng biểu & hình ảnh ngầm...' : 'Loading tables & images in background...'}
                        </p>
                    </div>
                    <div style="width:100%;background:rgba(255,255,255,0.1);border-radius:999px;height:8px;overflow:hidden;margin-top:4px;">
                        <div id="std-preload-bar" style="width:3%;height:100%;background:linear-gradient(90deg,#c6eb34,#e0f77a);border-radius:999px;transition:width 0.15s ease;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;width:100%;font-size:12px;color:rgba(246,247,239,0.65);font-weight:600;">
                        <span id="std-preload-percent">3%</span>
                        <span id="std-preload-count">${isVi ? 'Đang khởi động...' : 'Initializing...'}</span>
                    </div>
                </div>
                <style>@keyframes stdSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
            `;
            document.body.appendChild(overlay);

            return {
                update(percent, current, total, customMsg) {
                    const bar = document.getElementById('std-preload-bar');
                    const pct = document.getElementById('std-preload-percent');
                    const cnt = document.getElementById('std-preload-count');
                    const sub = document.getElementById('std-preload-subtitle');
                    const clamped = Math.min(100, Math.max(0, Math.round(percent)));
                    if (bar) bar.style.width = clamped + '%';
                    if (pct) pct.textContent = clamped + '%';
                    if (cnt && total) cnt.textContent = isVi ? `Trang ${current || 1}/${total}` : `Page ${current || 1}/${total}`;
                    if (sub && customMsg) sub.textContent = customMsg;
                },
                remove() {
                    try { overlay.remove(); } catch (e) {}
                }
            };
        }

        // Detect language
        let isVi = false;
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const { lang } = await chrome.storage.local.get({ lang: 'en' });
                isVi = lang === 'vi';
            }
        } catch (e) {}

        // Show solid overlay immediately
        overlayUI = showStudocuOverlay(isVi);
        overlayUI.update(3, 1, totalPages, isVi ? 'Đang trích xuất cấu trúc tài liệu...' : 'Extracting document structure...');

        // 2. Extract Document Asset Pattern & CloudFront Signature
        function getStudocuImagePattern() {
            let baseDocPath = '';
            let bgParam = '';
            let blurParam = '';
            let pageParams = {};
            let hasTextLayer = false;

            try {
                const nextDataEl = document.querySelector('#__NEXT_DATA__');
                if (nextDataEl) {
                    const nd = JSON.parse(nextDataEl.textContent);
                    const da = nd.props?.pageProps?.documentAccess;
                    if (da) {
                        if (da.objectKey) {
                            baseDocPath = 'https://doc-assets.studocu.com/' + da.objectKey;
                        }
                        const sp = da.signedQueryParams || {};
                        bgParam = (typeof sp.png === 'string' && sp.png) || (typeof sp.global === 'string' && sp.global) || '';
                        blurParam = (typeof sp.blurredPage === 'string' && sp.blurredPage) || (typeof sp.global === 'string' && sp.global) || bgParam || '';
                        if (Array.isArray(sp.pages)) {
                            hasTextLayer = true;
                            sp.pages.forEach(pg => {
                                if (pg && pg.pageNumber && typeof pg.signedQueryParams === 'string') {
                                    pageParams[pg.pageNumber] = pg.signedQueryParams;
                                }
                            });
                        }
                    }
                }
            } catch (e) {}

            // Fallback: Scan DOM img tags
            if (!baseDocPath || !bgParam) {
                const imgs = document.querySelectorAll('img');
                for (const img of imgs) {
                    const s = img.src || (img.dataset ? img.dataset.src : '') || '';
                    if (s.includes('doc-assets.studocu.com') && (s.includes('/html/bg') || s.includes('/html/pages/'))) {
                        try {
                            const urlObj = new URL(s);
                            const sig = urlObj.search;
                            const m = s.match(/(https:\/\/doc-assets\.studocu\.com\/[^\/]+)/);
                            if (m) {
                                baseDocPath = m[1];
                                if (!bgParam) bgParam = sig;
                                if (!blurParam) blurParam = sig;
                                break;
                            }
                        } catch (e) {}
                    }
                }
            }

            if (baseDocPath && bgParam) {
                return {
                    baseDocPath,
                    bgPrefix: baseDocPath + '/html/bg',
                    bgSuffix: '.png' + bgParam,
                    pagePrefix: baseDocPath + '/html/pages/page',
                    pageSuffix: '.webp' + bgParam,
                    blurPrefix: baseDocPath + '/html/pages/blurred/page',
                    blurSuffix: '.webp' + blurParam,
                    pageParams,
                    hasTextLayer
                };
            }
            return null;
        }

        const pattern = getStudocuImagePattern();

        // 3. True Page Readiness Detection
        function pageRendered(pf) {
            if (!pf) return false;
            const hasSpans = pf.querySelectorAll('.t, span').length > 3;
            const img = pf.querySelector('img.bi') || pf.querySelector('img');
            const imgLoaded = img && img.complete && img.naturalWidth > 0;
            return (pf.innerHTML.length > 500 && hasSpans) || (imgLoaded && pf.innerHTML.length > 300);
        }

        function waitForPageReady(pf) {
            return new Promise((resolve) => {
                let lastLen = -1;
                let stable = 0;
                let tries = 0;
                function check() {
                    const len = pf.innerHTML.length;
                    if (pageRendered(pf)) {
                        if (len === lastLen) {
                            stable++;
                        } else {
                            stable = 0;
                            lastLen = len;
                        }
                        if (stable >= 2) {
                            resolve();
                            return;
                        }
                    }
                    if (tries++ > 16) { // max ~2 seconds per page
                        resolve();
                        return;
                    }
                    setTimeout(check, 120);
                }
                check();
            });
        }

        // 4. Scrolling Container Setup
        const container = document.getElementById('viewer-wrapper') ||
                          document.getElementById('document-wrapper') ||
                          document.scrollingElement || document.documentElement || document.body;
        const savedScrollTop = container ? container.scrollTop : (window.scrollY || 0);

        // 5. Targeted Page Capture Loop
        const capturedPages = [];
        const { a4WidthPx, a4HeightPx } = getA4DimensionsPx();

        for (let i = 0; i < totalPages; i++) {
            const pageNode = pageNodes[i];
            const pageNum = i + 1;
            const hexPage = pageNum.toString(16); // Hexadecimal page numbering for bg{hex}.png

            // Scroll page into viewport to trigger React virtualizer & IntersectionObserver
            if (pageNode) {
                pageNode.scrollIntoView({ behavior: 'instant', block: 'center' });
                if (container && container.dispatchEvent) {
                    container.dispatchEvent(new Event('scroll', { bubbles: true }));
                }
                window.dispatchEvent(new Event('scroll', { bubbles: true }));
            }

            // Wait until the page has truly rendered its text spans & images
            await waitForPageReady(pageNode);

            // Clone the page node (.pf or fallback)
            const pf = pageNode.matches('.pf') ? pageNode : (pageNode.querySelector('.pf') || pageNode);
            const clone = pf.cloneNode(true);

            // Strip ad banners, paywall overlays, or buttons
            clone.querySelectorAll('.download-button-1, .github-button, [data-studocuhack], [class*="paywall"], [class*="banner"], [class*="upgrade"]').forEach(el => {
                if (!el.matches('.pc, .pf, .t, img')) el.remove();
            });

            // Unhide any force-hidden elements inside clone
            clone.querySelectorAll('[style]').forEach(el => {
                const st = el.getAttribute('style') || '';
                if (/display:\s*none/i.test(st)) {
                    el.style.setProperty('display', 'block', 'important');
                }
            });

            // Ensure .page-content and .pc are visible
            clone.querySelectorAll('.page-content, .pc').forEach(pc => {
                pc.style.setProperty('display', 'block', 'important');
                pc.style.setProperty('filter', 'none', 'important');
                pc.style.setProperty('visibility', 'visible', 'important');
                pc.style.setProperty('opacity', '1', 'important');
            });

            // Ensure text layer (.t) is visible with high z-index
            clone.querySelectorAll('.t').forEach(tEl => {
                tEl.style.setProperty('visibility', 'visible', 'important');
                tEl.style.setProperty('opacity', '1', 'important');
                tEl.style.setProperty('filter', 'none', 'important');
                tEl.style.setProperty('z-index', '5', 'important');
            });

            // Handle background image layer
            const hasText = clone.querySelectorAll('.t').length > 5;
            let imgEl = clone.querySelector('img.bi') || clone.querySelector('img');
            if (!imgEl) {
                imgEl = document.createElement('img');
                imgEl.className = 'bi x0 y0 w1 h1';
                const pcEl = clone.querySelector('.pc') || clone;
                pcEl.insertBefore(imgEl, pcEl.firstChild);
            }

            let targetImgUrl = '';
            if (hasText) {
                // When page has real HTML text spans, use exact Hex-numbered bg{hex}.png figure layer
                if (pattern && pattern.bgPrefix) {
                    targetImgUrl = `${pattern.bgPrefix}${hexPage}${pattern.bgSuffix}`;
                }
            } else {
                // When page does NOT have text layer (gated/locked page),
                // use full-page Ultra HD pre-rendered raster page{pageNum}.webp (DECIMAL pageNum)
                if (pattern && pattern.pagePrefix) {
                    targetImgUrl = `${pattern.pagePrefix}${pageNum}${pattern.pageSuffix}`;
                }
            }

            // Fallback to existing src or deblurred url
            if (!targetImgUrl) {
                if (imgEl.dataset && imgEl.dataset.src) targetImgUrl = imgEl.dataset.src;
                else if (imgEl.src && imgEl.src.startsWith('http')) targetImgUrl = imgEl.src;
                if (targetImgUrl && targetImgUrl.includes('/blurred/')) {
                    targetImgUrl = targetImgUrl.replace('/pages/blurred/', '/pages/').replace('/blurred/', '/');
                }
            }

            if (targetImgUrl) {
                imgEl.setAttribute('src', targetImgUrl);
                imgEl.src = targetImgUrl;
                imgEl.removeAttribute('srcset');
                imgEl.removeAttribute('data-src');
                imgEl.setAttribute('loading', 'eager');
                imgEl.loading = 'eager';
            }

            imgEl.style.setProperty('z-index', '1', 'important');
            imgEl.style.setProperty('display', 'block', 'important');
            imgEl.style.setProperty('visibility', 'visible', 'important');
            imgEl.style.setProperty('opacity', '1', 'important');

            // Measure the ORIGINAL live element in DOM (pf or pageNode), NOT disconnected clone
            const pfEl = pageNode.matches('.pf') ? pageNode : (pageNode.querySelector('.pf') || pageNode);
            const pfStyle = window.getComputedStyle(pfEl);
            const pfRect = pfEl.getBoundingClientRect ? pfEl.getBoundingClientRect() : { width: 0, height: 0 };
            
            let origWidth = parseFloat(pfStyle.width) || pfRect.width || (pfEl.offsetWidth > 0 ? pfEl.offsetWidth : 0) || parseFloat(pfEl.style.width) || 0;
            let origHeight = parseFloat(pfStyle.height) || pfRect.height || (pfEl.offsetHeight > 0 ? pfEl.offsetHeight : 0) || parseFloat(pfEl.style.height) || 0;

            if (!origWidth || origWidth <= 0) {
                const pcChild = pfEl.querySelector('.pc');
                if (pcChild) {
                    const pcStyle = window.getComputedStyle(pcChild);
                    origWidth = parseFloat(pcStyle.width) || pcChild.offsetWidth || 0;
                }
            }
            if (!origHeight || origHeight <= 0) {
                const pcChild = pfEl.querySelector('.pc');
                if (pcChild) {
                    const pcStyle = window.getComputedStyle(pcChild);
                    origHeight = parseFloat(pcStyle.height) || pcChild.offsetHeight || 0;
                }
            }

            if (!origWidth || origWidth <= 0) origWidth = 892.5;
            if (!origHeight || origHeight <= 0) origHeight = 1262.25;

            clone.style.width = origWidth + 'px';
            clone.style.height = origHeight + 'px';
            clone.style.position = 'relative';
            clone.style.margin = '0 auto';

            const a4Wrapper = wrapInA4Page(clone, origWidth, origHeight, pageNum, a4WidthPx, a4HeightPx);
            capturedPages.push(a4Wrapper);

            const progress = 5 + Math.floor(((i + 1) / totalPages) * 65);
            overlayUI.update(
                progress,
                i + 1,
                totalPages,
                isVi ? `Đang nạp & bắt trọn trang ${i + 1}/${totalPages}...` : `Capturing page ${i + 1}/${totalPages}...`
            );
        }

        // Restore initial scroll position
        if (container) container.scrollTop = savedScrollTop;
        window.scrollTo({ top: savedScrollTop, behavior: 'instant' });

        // 6. Embed All Images as Transient Blob Object URLs to Guarantee 100% Print Preview Reliability
        overlayUI.update(72, totalPages, totalPages, isVi ? 'Đang chuyển đổi & nhúng ảnh HD vào RAM...' : 'Embedding HD images into RAM...');

        async function embedImagesAsDataUris(pagesList, onProgress) {
            // Revoke any previous Blob URLs before starting new embedding pass
            revokeStudocuObjectUrls();

            const urls = [];
            const urlMap = {};

            pagesList.forEach(p => {
                p.querySelectorAll('img').forEach(img => {
                    const src = img.getAttribute('src');
                    if (src && src.startsWith('http') && !urls.includes(src)) {
                        urls.push(src);
                    }
                });
            });

            if (urls.length === 0) return;

            let completed = 0;
            const CONCURRENCY = 6;
            let nextIdx = 0;

            async function worker() {
                while (nextIdx < urls.length) {
                    const url = urls[nextIdx++];
                    try {
                        const res = await fetch(url, { credentials: 'omit' });
                        if (res.ok) {
                            const blob = await res.blob();
                            if (blob && blob.size > 0) {
                                const objectUrl = URL.createObjectURL(blob);
                                urlMap[url] = objectUrl;
                                studocuObjectUrls.push(objectUrl);
                            }
                        } else if (res.status === 403 || res.status === 404) {
                            // If full page unblurred webp was 403/404, fallback to blurred preview if available
                            if (url.includes('/html/pages/page')) {
                                const fallbackUrl = url.replace('/html/pages/page', '/html/pages/blurred/page');
                                try {
                                    const fbRes = await fetch(fallbackUrl, { credentials: 'omit' });
                                    if (fbRes.ok) {
                                        const fbBlob = await fbRes.blob();
                                        if (fbBlob && fbBlob.size > 0) {
                                            const fbObjectUrl = URL.createObjectURL(fbBlob);
                                            urlMap[url] = fbObjectUrl;
                                            studocuObjectUrls.push(fbObjectUrl);
                                        }
                                    }
                                } catch (e) {}
                            }
                        }
                    } catch (err) {}
                    completed++;
                    if (typeof onProgress === 'function') {
                        onProgress(completed, urls.length);
                    }
                }
            }

            const workers = [];
            for (let c = 0; c < Math.min(CONCURRENCY, urls.length); c++) {
                workers.push(worker());
            }
            await Promise.all(workers);

            // Replace img src attributes with transient Blob Object URLs
            pagesList.forEach(p => {
                p.querySelectorAll('img').forEach(img => {
                    const s = img.getAttribute('src');
                    if (urlMap[s]) {
                        img.setAttribute('src', urlMap[s]);
                        img.src = urlMap[s];
                    }
                });
            });
        }

        await embedImagesAsDataUris(capturedPages, (done, total) => {
            const pct = 72 + Math.floor((done / total) * 23);
            overlayUI.update(
                pct,
                totalPages,
                totalPages,
                isVi ? `Đang nhúng ảnh HD (${done}/${total})...` : `Embedding HD images (${done}/${total})...`
            );
        });

        overlayUI.update(98, totalPages, totalPages, isVi ? 'Đang chuẩn bị hộp thoại in...' : 'Opening print dialog...');
        await sleep(150);

        // 7. Assemble Clean Viewer Container with strict .p2hv CSS scope
        const viewerContainer = document.createElement('div');
        viewerContainer.id = 'clean-viewer-container';
        viewerContainer.className = 'p2hv'; // Retains pdf2htmlEX style scope

        capturedPages.forEach(p => {
            viewerContainer.appendChild(p);
        });

        const oldStyle = document.getElementById('clean-viewer-styles');
        if (oldStyle) oldStyle.remove();

        const viewerStyle = document.createElement('style');
        viewerStyle.id = 'clean-viewer-styles';
        viewerStyle.textContent = `
            /* On-Screen Reader Mode */
            body { 
                background-color: #f6f7fb !important; 
                margin: 0 !important; 
                overflow-x: auto !important; 
                overflow-y: auto !important; 
            }
            body > *:not(#clean-viewer-container):not(#doccleaner-reader-bar) { 
                display: none !important; 
            }

            /* Fixed Top Reader Bar */
            #doccleaner-reader-bar {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 54px !important;
                background: #091b42 !important;
                border-bottom: 1.5px solid #091b42 !important;
                box-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                z-index: 2147483647 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 0 20px !important;
                box-sizing: border-box !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                user-select: none !important;
            }

            #doccleaner-reader-bar .dc-bar-brand {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
            }
            #doccleaner-reader-bar .dc-logo {
                font-size: 15.5px !important;
                font-weight: 800 !important;
                color: #ffffff !important;
                letter-spacing: -0.2px !important;
            }
            #doccleaner-reader-bar .dc-badge {
                font-size: 10.5px !important;
                font-weight: 900 !important;
                padding: 3px 8px !important;
                border-radius: 6px !important;
                letter-spacing: 0.3px !important;
                text-transform: uppercase !important;
                border: 1.5px solid #091b42 !important;
                box-shadow: none !important;
                filter: none !important;
            }
            #doccleaner-reader-bar .dc-badge.studocu {
                background-color: #c6eb34 !important;
                color: #091b42 !important;
            }
            #doccleaner-reader-bar .dc-badge.scribd {
                background-color: #58c474 !important;
                color: #091b42 !important;
            }

            #doccleaner-reader-bar .dc-bar-meta {
                display: flex !important;
                align-items: center !important;
            }
            #doccleaner-reader-bar #dc-page-counter {
                font-size: 13px !important;
                font-weight: 600 !important;
                color: #f6f7ef !important;
                background: #193582 !important;
                border: 1.5px solid #091b42 !important;
                padding: 4px 14px !important;
                border-radius: 999px !important;
                box-shadow: none !important;
                filter: none !important;
            }

            #doccleaner-reader-bar .dc-bar-actions {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
            }
            #doccleaner-reader-bar .dc-btn-primary {
                border: 1.5px solid #091b42 !important;
                font-size: 13px !important;
                font-weight: 800 !important;
                padding: 7px 16px !important;
                border-radius: 10px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                box-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                transition: transform 0.15s ease !important;
                outline: none !important;
            }
            #doccleaner-reader-bar .dc-btn-primary.studocu {
                background-color: #c6eb34 !important;
                color: #091b42 !important;
            }
            #doccleaner-reader-bar .dc-btn-primary.scribd {
                background-color: #58c474 !important;
                color: #091b42 !important;
            }
            #doccleaner-reader-bar .dc-btn-primary:hover {
                transform: translateY(-1.5px) !important;
                box-shadow: none !important;
            }
            #doccleaner-reader-bar .dc-btn-primary:active {
                transform: translateY(0) scale(0.98) !important;
                box-shadow: none !important;
            }

            #doccleaner-reader-bar .dc-btn-secondary {
                background: #193582 !important;
                color: #f6f7ef !important;
                border: 1.5px solid #091b42 !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                padding: 7px 14px !important;
                border-radius: 10px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                box-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                transition: background 0.15s ease !important;
                outline: none !important;
            }
            #doccleaner-reader-bar .dc-btn-secondary:hover {
                background: #2546a3 !important;
                box-shadow: none !important;
            }

            /* Clean Viewer Container & Centered A4 Pages */
            #clean-viewer-container {
                position: absolute !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 100% !important; 
                display: flex !important; 
                flex-direction: column !important; 
                align-items: center !important; 
                padding: 74px 0 40px 0 !important; /* 54px bar + 20px top padding */
                z-index: 99999 !important; 
                opacity: 1 !important; 
                visibility: visible !important; 
                background-color: #f6f7fb !important; 
                box-sizing: border-box !important;
                box-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
            }

            /* Outer A4 Page Wrapper */
            .clean-page-wrapper {
                width: 210mm !important;
                height: 296mm !important;
                max-height: 296mm !important;
                background: #ffffff !important;
                border: 1.5px solid #091b42 !important;
                box-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                margin: 0 auto 24px auto !important;
                position: relative !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            }

            /* Scaled Inner Content */
            .clean-page-wrapper .scaled-content {
                transform-origin: top left !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                overflow: hidden !important;
            }

            /* Studocu element overrides inside clean viewer */
            #clean-viewer-container .pf {
                position: relative !important; 
                background: #ffffff !important; 
                box-shadow: none !important; 
                margin: 0 auto !important; 
                display: block !important; 
                visibility: visible !important; 
                opacity: 1 !important; 
                filter: none !important; 
                -webkit-filter: none !important; 
                overflow: hidden !important; 
            }
            #clean-viewer-container .page-content,
            #clean-viewer-container .pc {
                display: block !important; 
                visibility: visible !important; 
                opacity: 1 !important; 
                filter: none !important; 
                -webkit-filter: none !important; 
            }
            #clean-viewer-container .t {
                visibility: visible !important; 
                opacity: 1 !important; 
                filter: none !important; 
                -webkit-filter: none !important; 
                z-index: 5 !important; 
            }
            #clean-viewer-container img.bi,
            #clean-viewer-container .pf img {
                z-index: 1 !important; 
                display: block !important; 
                visibility: visible !important; 
                opacity: 1 !important; 
                filter: none !important; 
                -webkit-filter: none !important; 
            }

            /* ==========================================================================
               PRINT ENGINE NORMALIZATION (Zero Blank Pages)
               ========================================================================== */
            @media print {
                @page { 
                    size: A4 portrait;
                    margin: 0; 
                }
                html, body { 
                    width: 210mm !important; 
                    height: 100% !important; 
                    background: #ffffff !important; 
                    margin: 0 auto !important; 
                    padding: 0 !important; 
                    overflow: visible !important; 
                    position: static !important; 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                }
                
                /* Strictly hide Reader Bar and all other website nodes */
                #doccleaner-reader-bar {
                    display: none !important; 
                }
                body > *:not(#clean-viewer-container) { 
                    display: none !important; 
                }
                
                #clean-viewer-container { 
                    position: static !important; 
                    display: block !important; 
                    width: 210mm !important; 
                    height: auto !important; 
                    max-height: none !important; 
                    padding: 0 !important; 
                    margin: 0 auto !important; 
                    opacity: 1 !important; 
                    visibility: visible !important; 
                    overflow: visible !important; 
                    background: #ffffff !important; 
                }
                
                .clean-page-wrapper { 
                    width: 210mm !important; 
                    height: 296mm !important; 
                    max-height: 296mm !important; 
                    margin: 0 auto !important; 
                    padding: 0 !important; 
                    box-shadow: none !important; 
                    page-break-after: always !important; 
                    break-after: page !important; 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    overflow: hidden !important; 
                    position: relative !important; 
                    box-sizing: border-box !important; 
                    background: #ffffff !important; 
                }
                
                .clean-page-wrapper:last-child { 
                    page-break-after: avoid !important; 
                    break-after: avoid !important; 
                }
                
                .clean-page-wrapper .scaled-content { 
                    transform-origin: top left !important; 
                    position: absolute !important; 
                    top: 0 !important; 
                    left: 0 !important; 
                }
            }
        `;
        document.head.appendChild(viewerStyle);
        document.body.appendChild(viewerContainer);

        // Inject Reader Bar
        const oldBar = document.getElementById('doccleaner-reader-bar');
        if (oldBar) oldBar.remove();

        const readerBar = document.createElement('div');
        readerBar.id = 'doccleaner-reader-bar';
        readerBar.innerHTML = `
            <div class="dc-bar-brand">
                <span class="dc-logo">DocCleaner</span>
                <span class="dc-badge studocu">${isVi ? 'Chế độ đọc' : 'Reader Mode'}</span>
            </div>
            <div class="dc-bar-meta">
                <span id="dc-page-counter">${isVi ? `Trang 1 / ${totalPages}` : `Page 1 of ${totalPages}`}</span>
            </div>
            <div class="dc-bar-actions">
                <button id="dc-print-btn" class="dc-btn-primary studocu" title="${isVi ? 'In hoặc lưu PDF (Ctrl/Cmd + P)' : 'Print or save document (Ctrl/Cmd + P)'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    <span>${isVi ? 'In / Lưu PDF (A4)' : 'Print / Save PDF (A4)'}</span>
                </button>
                <button id="dc-close-btn" class="dc-btn-secondary" title="${isVi ? 'Thoát chế độ đọc (Esc)' : 'Exit reader mode and return to original page (Esc)'}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>${isVi ? 'Thoát' : 'Exit Clean View'}</span>
                </button>
            </div>
        `;
        document.body.appendChild(readerBar);

        // Setup interaction events
        document.getElementById('dc-print-btn').addEventListener('click', () => {
            if (typeof window.__dcShowPrintToast === 'function') {
                window.__dcShowPrintToast();
            }
            window.print();
        });
        document.getElementById('dc-close-btn').addEventListener('click', () => {
            cleanupStudocuReaderMode();
        });

        // Escape key listener
        const keyHandler = (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                cleanupStudocuReaderMode();
            }
        };
        window.addEventListener('keydown', keyHandler);
        window.__dcStudocuKeyHandler = keyHandler;

        // Dynamic Page Counter via IntersectionObserver
        const counterEl = document.getElementById('dc-page-counter');
        if (counterEl && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = entry.target.dataset.pageIndex;
                        if (idx) {
                            counterEl.textContent = isVi 
                                ? `Trang ${idx} / ${totalPages}`
                                : `Page ${idx} of ${totalPages}`;
                        }
                    }
                }
            }, {
                threshold: 0.2
            });
            document.querySelectorAll('.clean-page-wrapper').forEach(el => observer.observe(el));
            window.__dcStudocuCounterObserver = observer;
        }

        if (overlayUI) {
            overlayUI.remove();
        }

        setTimeout(() => {
            window.print();
        }, 350);

    } catch (err) {
        console.error('DocCleaner Studocu error:', err);
        if (overlayUI) overlayUI.remove();
        cleanupStudocuReaderMode();
        alert('Error: ' + (err && err.message ? err.message : err));
    }
}

/**
 * Removes the clean viewer container, reader bar, styles, and preload overlay
 * to restore the original page UI after reading or printing.
 */
function cleanupStudocuReaderMode() {
    if (window.__dcStudocuCounterObserver) {
        window.__dcStudocuCounterObserver.disconnect();
        window.__dcStudocuCounterObserver = null;
    }
    if (window.__dcStudocuKeyHandler) {
        window.removeEventListener('keydown', window.__dcStudocuKeyHandler);
        window.__dcStudocuKeyHandler = null;
    }
    const bar = document.getElementById('doccleaner-reader-bar');
    const viewer = document.getElementById('clean-viewer-container');
    const styles = document.getElementById('clean-viewer-styles');
    const overlay = document.getElementById('studocu-preload-overlay');
    if (bar) bar.remove();
    if (viewer) viewer.remove();
    if (styles) styles.remove();
    if (overlay) overlay.remove();
    revokeStudocuObjectUrls();
}

// Export functions to window scope so popup.js and router can call it
window.runStudocuCleanViewer = runStudocuCleanViewer;
window.cleanupStudocuAfterPrint = cleanupStudocuReaderMode;
window.cleanupStudocuReaderMode = cleanupStudocuReaderMode;

