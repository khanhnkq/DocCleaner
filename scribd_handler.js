// Scribd Handler Module for DocCleaner & PDF Downloader
// Handles Scribd-specific ad removal, DOM unblurring, lazy-load auto-scrolling, and clean isolated PDF export.

(function () {
    'use strict';

    // Module-level tracking for transient Blob Object URLs to prevent RAM bloat
    let scribdObjectUrls = [];

    function revokeScribdObjectUrls() {
        if (scribdObjectUrls.length > 0) {
            scribdObjectUrls.forEach(url => {
                try {
                    URL.revokeObjectURL(url);
                } catch (e) {}
            });
            scribdObjectUrls = [];
        }
    }

    // =========================================================================
    // DocCleaner Phase 2 - Scribd Metadata Extraction & Purge Handler
    // =========================================================================

    /**
     * Deterministic 32-bit hash function (DJB2 variant)
     */
    function computeDeterministicHash(str) {
        let hash = 0;
        if (!str || typeof str !== 'string') return '0';
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
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
     * Extracts document metadata for Scribd & Studocu
     * Conforms strictly to DocCleanerDocument interface
     * @param {string} [platform] - 'scribd' or 'studocu'
     * @returns {Object} DocCleanerDocument
     */
    function extractPageMetadata(platform) {
        const loc = (typeof window !== 'undefined' && window.location) ? window.location : (typeof location !== 'undefined' ? location : null);
        const hostname = (loc && loc.hostname) ? loc.hostname.toLowerCase() : '';
        const resolvedPlatform = platform || (hostname.includes('studocu.com') || hostname.includes('studocu.vn') ? 'studocu' : 'scribd');

        const canonicalUrl = getCanonicalUrl();
        let title = '';
        let pageCount = 0;

        const doc = (typeof document !== 'undefined') ? document : null;

        if (resolvedPlatform === 'scribd') {
            // Scribd Title hierarchy:
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
        } else {
            // Studocu Title hierarchy fallback
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

            const pageNodes = doc && doc.querySelectorAll ? doc.querySelectorAll('.pf, div[data-page-index]') : [];
            if (pageNodes && pageNodes.length > 0) {
                pageCount = pageNodes.length;
            } else {
                const metaCountEl = doc && doc.querySelector ? doc.querySelector('meta[name="doc:page_count"]') : null;
                const metaCount = metaCountEl ? (metaCountEl.getAttribute('content') || metaCountEl.content) : null;
                const parsedCount = metaCount ? parseInt(metaCount, 10) : NaN;
                if (!isNaN(parsedCount) && parsedCount > 0) {
                    pageCount = parsedCount;
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
     * Displays a 3-second floating toast #dc-study-toast following Graphic Poster styling rules:
     * 1.5px solid #091b42, #f6f7ef background, #091b42 text, no box-shadow, auto-dismiss after 3s.
     */
    async function showStudyShelfToast() {
        try {
            if (typeof document === 'undefined' || !document.body) return;
            const existing = document.getElementById('dc-study-toast');
            if (existing) {
                try { existing.remove(); } catch (e) {}
            }

            let toastText = 'Saved to your Study Shelf';
            let lang = 'en';
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                try {
                    const data = await chrome.storage.local.get(['lang']);
                    if (data && data.lang) lang = data.lang;
                } catch (e) {}
            }

            if (typeof window !== 'undefined' && typeof window.t === 'function') {
                toastText = window.t(lang, 'toastDocSaved') || toastText;
            } else if (typeof t === 'function') {
                toastText = t(lang, 'toastDocSaved') || toastText;
            }

            const toast = document.createElement('div');
            toast.id = 'dc-study-toast';
            toast.textContent = toastText;
            toast.style.cssText = `
                position: fixed !important;
                top: 24px !important;
                right: 24px !important;
                z-index: 2147483647 !important;
                background-color: #f6f7ef !important;
                color: #091b42 !important;
                border: 1.5px solid #091b42 !important;
                border-radius: 12px !important;
                padding: 10px 18px !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                font-size: 13.5px !important;
                font-weight: 700 !important;
                box-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                text-shadow: none !important;
                user-select: none !important;
                pointer-events: none !important;
                transition: opacity 0.25s ease, transform 0.25s ease !important;
                opacity: 1 !important;
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                if (toast) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-6px)';
                    setTimeout(() => {
                        if (toast.parentNode) toast.remove();
                    }, 250);
                }
            }, 3000);
        } catch (err) {
            console.warn('[DocCleaner] showStudyShelfToast error:', err);
        }
    }

    /**
     * Checks if current URL is a valid Scribd document
     */
    function isScribdDocumentUrl() {
        const loc = (typeof window !== 'undefined' && window.location) ? window.location : (typeof location !== 'undefined' ? location : null);
        const href = loc ? (loc.href || loc.pathname || '') : '';
        const doc = (typeof document !== 'undefined') ? document : null;
        return href.includes('/document/') || href.includes('/doc/') || Boolean(doc && doc.querySelector && doc.querySelector('.document_title, [class*="DocumentTitle"], .outer_page, .document_page'));
    }

    let lastScribdRecordedUrl = '';

    /**
     * Dispatches RECORD_RECENT_DOC to background and shows toast
     */
    function autoRecordDocument(platform = 'scribd') {
        try {
            if (!isScribdDocumentUrl()) return;
            const metadata = extractPageMetadata(platform);
            if (!metadata || !metadata.title || !metadata.canonicalUrl) return;

            if (lastScribdRecordedUrl === metadata.canonicalUrl) {
                return;
            }
            lastScribdRecordedUrl = metadata.canonicalUrl;

            if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
                chrome.runtime.sendMessage({ action: 'RECORD_RECENT_DOC', doc: metadata }, () => {
                    if (chrome.runtime.lastError) {}
                });
            }

            showStudyShelfToast();
        } catch (err) {
            console.warn('[DocCleaner] Scribd autoRecordDocument error:', err);
        }
    }

    // Memory Purge Listener for PURGE_TRANSIENT_MEMORY
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message && message.action === 'PURGE_TRANSIENT_MEMORY') {
                revokeScribdObjectUrls();
                const container = document.getElementById('clean-viewer-container');
                const bar = document.getElementById('doccleaner-reader-bar');
                if (container) container.remove();
                if (bar) bar.remove();
                cleanupScribdReaderMode();
                if (typeof sendResponse === 'function') {
                    sendResponse({ status: 'PURGED' });
                }
                return true;
            }
        });
    }

    // Auto-record debounced 500ms after load
    if (typeof setTimeout !== 'undefined') {
        setTimeout(() => {
            autoRecordDocument('scribd');
        }, 500);
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

        scaledContainer.appendChild(contentNode);
        contentNode.style.width = validOrigW + 'px';
        contentNode.style.height = validOrigH + 'px';
        contentNode.style.margin = '0 auto';
        wrapper.appendChild(scaledContainer);
        return wrapper;
    }

    // List of CSS selectors targeting Scribd ads, promos, paywalls, and popups
    const SCRIBD_AD_SELECTORS = [
        '.promo_wrapper',
        '.promo_border',
        '.auto__doc_page_webpack_app_page_truncate_promo',
        '.auto__doc_page_webpack_doc_page_blur_promo',
        '.page_blur_promo',
        '.page-blur-promo',
        '.absolute_blur',
        '.autogenerated_promo',
        '.mobile_sticky_promo',
        '.sticky_archive_bar',
        '.page_blur_promo_wrapper',
        '.page_missing_explanation',
        '.between_page_portal_root',
        '[class*="PromoBanner"]',
        '[class*="AdWrapper"]',
        '[class*="MobileAppBanner"]',
        '[class*="modal_backdrop"]',
        '[class*="ModalBackdrop"]',
        '[class*="paywall_overlay"]',
        '[class*="PaywallOverlay"]',
        '[class*="BlurOverlay"]',
        '.promo_wrapper [class*="Button"]',
        '[class*="PromoBanner"] [class*="Button"]',
        '#credential_picker_container',
        '#credential_picker_iframe',
        'iframe[src*="accounts.google.com/gsi"]',
        'iframe[id*="credential_picker"]',
        '[id*="google-one-tap"]',
        'iframe[src*="google"]',
        'iframe[src*="doubleclick"]',
        'iframe[src*="adnxs"]',
        'div[id*="google_ads"]',
        'div[class*="google-ad"]',
        'div[class*="ad_wrapper"]',
        'div[class*="adsbygoogle"]'
    ];

    /**
     * Removes all Scribd ad elements and paywall overlays from the DOM
     */
    function removeScribdAds() {
        SCRIBD_AD_SELECTORS.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                try {
                    el.remove();
                } catch (e) {
                    el.style.display = 'none';
                }
            });
        });

        // Unblur page containers
        document.querySelectorAll('.outer_page, .document_page, .blurred_page').forEach(page => {
            page.style.filter = 'none';
            page.style.webkitFilter = 'none';
            page.style.opacity = '1';
            page.style.visibility = 'visible';
            page.classList.remove('blurred_page');
        });

        // Clear text blur shadows and unblur text layers without altering coordinates
        document.querySelectorAll('.text_layer, .text-layer').forEach(tl => {
            tl.style.filter = 'none';
            tl.style.webkitFilter = 'none';
        });

        document.querySelectorAll('.text_layer span, .text-layer span, [class^="ff"] span').forEach(el => {
            el.style.filter = 'none';
            el.style.webkitFilter = 'none';
            el.style.textShadow = 'none';
        });

        // Unblur document images
        document.querySelectorAll('.outer_page img, .document_page img').forEach(img => {
            img.style.filter = 'none';
            img.style.webkitFilter = 'none';
            img.style.opacity = '1';
        });

        // Hide watermarks & blur overlays
        document.querySelectorAll('[class*="Watermark"], [class*="watermark"], .watermark_overlay, .blur_overlay, .abs_blur')
            .forEach(el => {
                try {
                    el.remove();
                } catch (e) {
                    el.style.display = 'none';
                }
            });

        // Ensure sidebar and recommendation links ("You might also like") are interactive
        document.querySelectorAll('aside, [class*="sidebar"], [class*="Sidebar"], .right_column, .document_sidebar, [class*="recommendation"], [class*="Recommendation"]').forEach(sb => {
            sb.style.pointerEvents = 'auto';
        });
        document.querySelectorAll('aside a, aside button, [class*="sidebar"] a, [class*="sidebar"] button, [class*="Sidebar"] a, [class*="Sidebar"] button, .right_column a, .right_column button, .document_sidebar a, .document_sidebar button, [class*="recommendation"] a, [class*="recommendation"] button, [class*="Recommendation"] a, [class*="Recommendation"] button').forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.cursor = 'pointer';
        });

        // Restore body scrolling & text selection
        if (document.body) {
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';
            document.body.style.userSelect = 'text';
            document.body.style.webkitUserSelect = 'text';
        }
    }

    /**
     * Initializes MutationObserver with debounce to continuously strip newly injected ads & popups
     */
    let cleanDebounceTimer = null;
    function initScribdAdBlocker() {
        removeScribdAds();

        const SCRIBD_IGNORE_SELECTOR = '#clean-viewer-container, #studocu-fab-btn, #scribd-preload-overlay, #studocu-preload-overlay, #clean-reader-bar, #doccleaner-reader-bar, #clean-viewer-styles';

        const observer = new MutationObserver((mutations) => {
            let shouldClean = false;
            for (const mutation of mutations) {
                const targetEl = mutation.target && mutation.target.nodeType === 1 
                    ? mutation.target 
                    : (mutation.target && mutation.target.parentElement);

                // Explicitly ignore mutations originating from or inside any DocCleaner UI component
                if (targetEl && targetEl.closest && targetEl.closest(SCRIBD_IGNORE_SELECTOR)) {
                    continue;
                }

                // Check if any added node is from outside DocCleaner
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (!node.matches(SCRIBD_IGNORE_SELECTOR) && (!node.closest || !node.closest(SCRIBD_IGNORE_SELECTOR))) {
                                shouldClean = true;
                                break;
                            }
                        } else if (node.nodeType === 3) {
                            if (!node.parentElement || !node.parentElement.closest(SCRIBD_IGNORE_SELECTOR)) {
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
                cleanDebounceTimer = setTimeout(removeScribdAds, 300);
            }
        });

        const target = document.body || document.documentElement;
        if (target) {
            observer.observe(target, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
            });
        }
    }

    /**
     * Creates a high-end, full-screen background progress overlay so the user never
     * sees any visible page scrolling or flickering during preloading.
     */
    function showPreloadOverlay(isVi) {
        const existing = document.getElementById('scribd-preload-overlay');
        if (existing) {
            try { existing.remove(); } catch (e) {}
        }

        const overlay = document.createElement('div');
        overlay.id = 'scribd-preload-overlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #091b42 !important;
            box-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            color: #f6f7ef !important;
            user-select: none !important;
            opacity: 0;
            transition: opacity 0.25s ease !important;
        `;

        overlay.innerHTML = `
            <div style="
                background: #11224d;
                border: 1.5px solid #091b42;
                border-radius: 20px;
                padding: 32px 36px;
                max-width: 440px;
                width: 90%;
                text-align: center;
                box-shadow: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            ">
                <div style="
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    background: rgba(88, 196, 116, 0.15);
                    border: 1px solid rgba(88, 196, 116, 0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #58c474;
                ">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" style="animation: scribdSpin 0.9s linear infinite;">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="2.8" fill="none"></circle>
                        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.8" fill="none"></path>
                    </svg>
                </div>

                <div>
                    <h3 style="margin: 0; font-size: 17.5px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">
                        ${isVi ? 'Đang chuẩn bị PDF Scribd HD' : 'Preparing Scribd HD PDF'}
                    </h3>
                    <p id="scribd-preload-subtitle" style="margin: 6px 0 0 0; font-size: 13px; color: rgba(246, 247, 239, 0.75); font-weight: 500;">
                        ${isVi ? 'Đang tự động nạp & làm nét nội dung ngầm...' : 'Automatically loading & enhancing pages in background...'}
                    </p>
                </div>

                <div style="width: 100%; background: rgba(255, 255, 255, 0.1); border-radius: 999px; height: 8px; overflow: hidden; margin-top: 4px;">
                    <div id="scribd-preload-bar" style="width: 5%; height: 100%; background: linear-gradient(90deg, #58c474, #73e691); border-radius: 999px; transition: width 0.12s ease;"></div>
                </div>

                <div style="display: flex; justify-content: space-between; width: 100%; font-size: 12px; color: rgba(246, 247, 239, 0.65); font-weight: 600;">
                    <span id="scribd-preload-percent">5%</span>
                    <span id="scribd-preload-count">${isVi ? 'Đang xử lý...' : 'Processing...'}</span>
                </div>

                <div style="font-size: 11.5px; color: rgba(246, 247, 239, 0.45); margin-top: 2px;">
                    ${isVi ? 'Không cần cuộn chuột — hệ thống tự nạp 100% trang' : 'No manual scrolling needed — auto-loads 100% pages'}
                </div>
            </div>
            <style>
                @keyframes scribdSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        return {
            update(percent, current, total, customMsg) {
                const bar = document.getElementById('scribd-preload-bar');
                const pct = document.getElementById('scribd-preload-percent');
                const cnt = document.getElementById('scribd-preload-count');
                const sub = document.getElementById('scribd-preload-subtitle');

                const clamped = Math.min(100, Math.max(0, Math.round(percent)));
                if (bar) bar.style.width = clamped + '%';
                if (pct) pct.textContent = clamped + '%';
                if (cnt && total) {
                    cnt.textContent = isVi ? `Trang ${current || 1}/${total}` : `Page ${current || 1}/${total}`;
                }
                if (sub) {
                    if (customMsg) {
                        sub.textContent = customMsg;
                    } else if (clamped >= 88) {
                        sub.textContent = isVi ? 'Đang trích xuất đồ họa HD & chuẩn bị in...' : 'Extracting HD graphics & preparing print...';
                    }
                }
            },
            remove() {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    try { overlay.remove(); } catch (e) {}
                }, 220);
            }
        };
    }

    /**
     * Fast, invisible programmatic preloader for Scribd.
     * Uses instant scrolling (behavior: 'instant') behind the overlay to trigger
     * IntersectionObservers rapidly so that Scribd creates DOM nodes for all pages.
     */
    async function preloadAllScribdPages(onProgress, overlayUI, isVi) {
        return new Promise(async (resolve) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

            // Eagerly trigger any lazy images that have data-src
            document.querySelectorAll('.outer_page img, .document_page img').forEach((img) => {
                if (img.dataset) {
                    if (img.dataset.src && !img.src) img.src = img.dataset.src;
                    if (img.dataset.orig && (!img.src || img.src.includes('lowres'))) img.src = img.dataset.orig;
                }
                img.loading = 'eager';
                img.setAttribute('loading', 'eager');
            });

            // High-speed programmatic scroll pass
            const viewportHeight = window.innerHeight || 800;
            const scrollStep = Math.floor(viewportHeight * 1.5);
            let currentScroll = 0;
            let lastScrollHeight = 0;
            let sameHeightChecks = 0;

            while (true) {
                const totalHeight = Math.max(
                    document.documentElement.scrollHeight,
                    document.body.scrollHeight
                );

                currentScroll += scrollStep;
                window.scrollTo({ top: currentScroll, behavior: 'instant' });
                // removeScribdAds() decoupled from 15ms scroll loop to prevent layout thrashing

                // Count pages currently in DOM
                const currentPages = document.querySelectorAll('.outer_page, .document_page, div[id^="outer_page_"]');
                const pageCount = currentPages.length || 1;
                const progress = Math.min(45, 5 + Math.floor((currentScroll / totalHeight) * 40));

                if (typeof onProgress === 'function') onProgress(progress);
                if (overlayUI) overlayUI.update(progress, Math.floor((progress / 45) * pageCount), pageCount, isVi ? 'Đang kích hoạt nạp ngầm các trang...' : 'Activating page containers...');

                if (currentScroll >= totalHeight) {
                    if (totalHeight === lastScrollHeight) {
                        sameHeightChecks++;
                    } else {
                        sameHeightChecks = 0;
                        lastScrollHeight = totalHeight;
                    }

                    // Bottom reached and height settled
                    if (sameHeightChecks >= 2) {
                        break;
                    }
                }

                await sleep(15);
            }

            resolve();
        });
    }

    /**
     * Checks if a Scribd page has finished rendering text spans, canvas, and images.
     */
    function isScribdPageRendered(page) {
        if (!page) return false;
        const textSpans = page.querySelectorAll('.text_layer span, .text-layer span, [class^="ff"] span, span');
        const imgs = Array.from(page.querySelectorAll('img'));
        const canvases = Array.from(page.querySelectorAll('canvas'));

        const imgsReady = imgs.length === 0 || imgs.every(img => (img.complete && img.naturalWidth > 0) || img.getAttribute('src')?.startsWith('data:'));
        const canvasesReady = canvases.length === 0 || canvases.every(c => c.width > 0 && c.height > 0);
        const textReady = textSpans.length > 0 || page.innerHTML.length > 300;

        return imgsReady && canvasesReady && textReady;
    }

    /**
     * True Page Readiness Detection for Scribd:
     * Waits until the page's images, canvas, and text layer are completely stable and rendered.
     */
    function waitForScribdPageReady(page) {
        return new Promise((resolve) => {
            let lastLen = -1;
            let stable = 0;
            let tries = 0;

            // Trigger lazy images eagerly
            page.querySelectorAll('img').forEach(img => {
                if (img.dataset) {
                    if (img.dataset.src && !img.src) img.src = img.dataset.src;
                    if (img.dataset.orig && (!img.src || img.src.includes('lowres'))) img.src = img.dataset.orig;
                }
                img.setAttribute('loading', 'eager');
                img.loading = 'eager';
            });

            function check() {
                const len = page.innerHTML.length;
                if (isScribdPageRendered(page)) {
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
                if (tries++ > 15) { // max ~1.5s per page
                    resolve();
                    return;
                }
                setTimeout(check, 100);
            }
            check();
        });
    }

    /**
     * Embeds all image URLs as transient Blob Object URLs into memory.
     * Guarantees 100% print preview reliability without missing assets, blank images, or memory bloat.
     */
    async function embedImagesAsDataUris(pagesList, onProgress) {
        // Revoke any previous Blob URLs before starting new embedding pass
        revokeScribdObjectUrls();

        const urls = [];
        const urlMap = {};

        pagesList.forEach(p => {
            p.querySelectorAll('img').forEach(img => {
                let src = img.getAttribute('src');
                if (!src && img.dataset && img.dataset.src) {
                    src = img.dataset.src;
                    img.setAttribute('src', src);
                    img.src = src;
                }
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
                            scribdObjectUrls.push(objectUrl);
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

    /**
     * Main action executed when clicking "Tải PDF HD" on Scribd
     */
    async function runScribdCleaner(statusCallback) {
        if (document.getElementById('clean-viewer-container')) {
            window.print();
            return;
        }

        // Auto-record document on clean reader activation
        try {
            autoRecordDocument('scribd');
        } catch (e) {}

        const updateStatus = (msg) => {
            if (typeof statusCallback === 'function') statusCallback(msg);
        };

        let isVi = false;
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const { lang } = await chrome.storage.local.get({ lang: 'en' });
                isVi = lang === 'vi';
            }
        } catch (e) {}

        const initialScrollY = window.scrollY;
        let overlayUI = null;

        try {
            updateStatus(isVi ? 'Đang chuẩn bị...' : 'Preparing...');
            removeScribdAds();

            let pages = document.querySelectorAll('.outer_page, .document_page, div[id^="outer_page_"]');
            if (pages.length === 0) {
                pages = document.querySelectorAll('div[data-page-number], div[data-page-index], .page_container');
            }

            if (pages.length === 0) {
                alert(isVi ? 'Không tìm thấy trang tài liệu nào trên Scribd.\n(Vui lòng mở một trang đọc tài liệu Scribd để xuất PDF!)' : 'No document pages found on Scribd.\n(Please open a document page on Scribd to export PDF!)');
                return;
            }

            // Show sleek fullscreen progress overlay so user never sees page scrolling
            overlayUI = showPreloadOverlay(isVi);
            overlayUI.update(5, 1, pages.length, isVi ? 'Đang quét & kích hoạt trang ngầm...' : 'Scanning & activating pages...');

            // Step 1: Fast scroll pass to ensure Scribd injects all page containers into the DOM
            updateStatus(isVi ? 'Đang kích hoạt toàn bộ trang...' : 'Activating all pages...');
            await preloadAllScribdPages((percent) => {
                updateStatus(isVi ? `Đang nạp trang... ${percent}%` : `Loading pages... ${percent}%`);
            }, overlayUI, isVi);

            // Post-settle cleanup: scrub any ad containers injected during scroll before cloning
            removeScribdAds();

            // Re-query pages after lazy loading
            pages = document.querySelectorAll('.outer_page, .document_page, div[id^="outer_page_"]');
            if (pages.length === 0) {
                pages = document.querySelectorAll('div[data-page-number], div[data-page-index], .page_container');
            }

            const totalPages = pages.length;
            const capturedPages = [];
            const { a4WidthPx, a4HeightPx } = getA4DimensionsPx();

            // Step 2: Targeted page-by-page readiness check & deep capture
            for (let i = 0; i < totalPages; i++) {
                const page = pages[i];
                if (page) {
                    page.scrollIntoView({ behavior: 'instant', block: 'center' });
                    window.dispatchEvent(new Event('scroll', { bubbles: true }));
                }

                // Wait until page text, images, and canvas are 100% loaded
                await waitForScribdPageReady(page);

                const pageStyle = window.getComputedStyle(page);
                const rect = page.getBoundingClientRect ? page.getBoundingClientRect() : { width: 0, height: 0 };
                const parsedW = parseFloat(pageStyle.width);
                const width = (parsedW > 0) ? parsedW : (rect.width > 0 ? rect.width : 800);

                const parsedH = parseFloat(pageStyle.height);
                const height = (parsedH > 0) ? parsedH : (rect.height > 0 ? rect.height : 1050);

                const cleanPage = document.createElement('div');
                cleanPage.className = 'scribd-clean-page';
                cleanPage.id = `scribd-page-${i + 1}`;
                cleanPage.style.width = width + 'px';
                cleanPage.style.height = height + 'px';

                const clone = page.cloneNode(true);

                // Strip ad/promo banners inside clone
                clone.querySelectorAll(SCRIBD_AD_SELECTORS.join(',')).forEach(el => {
                    try { el.remove(); } catch (e) {}
                });

                // Convert Canvas to High-Res Image (or drawImage) for 100% print preview reliability
                const origCanvases = page.querySelectorAll('canvas');
                const cloneCanvases = clone.querySelectorAll('canvas');
                origCanvases.forEach((origCanvas, ci) => {
                    const cloneCanvas = cloneCanvases[ci];
                    if (cloneCanvas && origCanvas.width > 0 && origCanvas.height > 0) {
                        try {
                            const dataUrl = origCanvas.toDataURL('image/png');
                            if (dataUrl && dataUrl.startsWith('data:image')) {
                                const canvasImg = document.createElement('img');
                                canvasImg.src = dataUrl;
                                canvasImg.className = cloneCanvas.className;
                                canvasImg.style.cssText = cloneCanvas.style.cssText;
                                if (origCanvas.style.width) canvasImg.style.width = origCanvas.style.width;
                                if (origCanvas.style.height) canvasImg.style.height = origCanvas.style.height;
                                canvasImg.style.display = 'block';
                                canvasImg.style.visibility = 'visible';
                                canvasImg.style.opacity = '1';
                                cloneCanvas.parentNode.replaceChild(canvasImg, cloneCanvas);
                            } else {
                                cloneCanvas.width = origCanvas.width;
                                cloneCanvas.height = origCanvas.height;
                                const ctx = cloneCanvas.getContext('2d');
                                if (ctx) ctx.drawImage(origCanvas, 0, 0);
                            }
                        } catch (e) {
                            cloneCanvas.width = origCanvas.width;
                            cloneCanvas.height = origCanvas.height;
                            const ctx = cloneCanvas.getContext('2d');
                            if (ctx) {
                                try { ctx.drawImage(origCanvas, 0, 0); } catch (err) {}
                            }
                        }
                    }
                });

                // Ensure clone root container matches original size and coordinate space
                clone.style.width = width + 'px';
                clone.style.height = height + 'px';
                clone.style.position = 'relative';
                clone.style.top = '0';
                clone.style.left = '0';
                clone.style.margin = '0';
                clone.style.display = 'block';
                clone.style.visibility = 'visible';
                clone.style.opacity = '1';
                clone.style.filter = 'none';
                clone.style.webkitFilter = 'none';
                clone.classList.remove('blurred_page');

                // Ensure images are unblurred and loaded eagerly
                clone.querySelectorAll('img').forEach(img => {
                    if (img.dataset) {
                        if (img.dataset.src && !img.src) img.src = img.dataset.src;
                        if (img.dataset.orig && (!img.src || img.src.includes('lowres'))) img.src = img.dataset.orig;
                    }
                    img.setAttribute('loading', 'eager');
                    img.loading = 'eager';
                    img.style.filter = 'none';
                    img.style.webkitFilter = 'none';
                    img.style.opacity = '1';
                    img.style.visibility = 'visible';
                });

                // Remove blur and text shadows on text layers without modifying positioning coordinates
                clone.querySelectorAll('.text_layer, .text-layer').forEach(tl => {
                    tl.style.filter = 'none';
                    tl.style.webkitFilter = 'none';
                });
                clone.querySelectorAll('.text_layer span, .text-layer span, [class^="ff"] span').forEach(span => {
                    span.style.filter = 'none';
                    span.style.webkitFilter = 'none';
                    span.style.textShadow = 'none';
                });

                // Preserve table formatting and borders
                clone.querySelectorAll('table').forEach(tbl => {
                    tbl.style.borderCollapse = 'collapse';
                    tbl.style.webkitPrintColorAdjust = 'exact';
                });

                cleanPage.appendChild(clone);
                const a4Wrapper = wrapInA4Page(cleanPage, width, height, i + 1, a4WidthPx, a4HeightPx);
                capturedPages.push(a4Wrapper);

                const progress = 45 + Math.floor(((i + 1) / totalPages) * 30);
                overlayUI.update(
                    progress,
                    i + 1,
                    totalPages,
                    isVi ? `Đang nạp & tối ưu trang ${i + 1}/${totalPages}...` : `Optimizing page ${i + 1}/${totalPages}...`
                );
            }

            // Restore scroll position
            window.scrollTo({ top: initialScrollY, behavior: 'instant' });

            // Step 3: Embed All Images as Transient Blob Object URLs to Guarantee 100% Print Reliability
            overlayUI.update(76, totalPages, totalPages, isVi ? 'Đang chuyển đổi & nhúng ảnh HD/bảng biểu vào RAM...' : 'Embedding HD images & tables into RAM...');

            await embedImagesAsDataUris(capturedPages, (done, total) => {
                const pct = 76 + Math.floor((done / total) * 20);
                overlayUI.update(
                    pct,
                    totalPages,
                    totalPages,
                    isVi ? `Đang nhúng ảnh & bảng biểu HD (${done}/${total})...` : `Embedding HD images & tables (${done}/${total})...`
                );
            });

            // Step 4: Assemble Clean Viewer Container
            const oldViewer = document.getElementById('clean-viewer-container');
            if (oldViewer) oldViewer.remove();

            const viewerContainer = document.createElement('div');
            viewerContainer.id = 'clean-viewer-container';

            capturedPages.forEach(cleanPage => {
                viewerContainer.appendChild(cleanPage);
            });

            // Inject isolated Clean Viewer styles
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

                .scribd-clean-page {
                    position: relative !important;
                    background-color: white !important;
                    box-shadow: none !important;
                    margin: 0 auto !important;
                    overflow: hidden !important;
                    display: block !important;
                }
                .scribd-clean-page table,
                .scribd-clean-page tr,
                .scribd-clean-page td,
                .scribd-clean-page th,
                .scribd-clean-page svg {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
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

                    .scribd-clean-page table,
                    .scribd-clean-page tr,
                    .scribd-clean-page td,
                    .scribd-clean-page th {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .scribd-clean-page svg {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .scribd-clean-page img,
                    .scribd-clean-page canvas {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
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
                    <span class="dc-badge scribd">${isVi ? 'Chế độ đọc' : 'Reader Mode'}</span>
                </div>
                <div class="dc-bar-meta">
                    <span id="dc-page-counter">${isVi ? `Trang 1 / ${totalPages}` : `Page 1 of ${totalPages}`}</span>
                </div>
                <div class="dc-bar-actions">
                    <button id="dc-print-btn" class="dc-btn-primary scribd" title="${isVi ? 'In hoặc lưu PDF (Ctrl/Cmd + P)' : 'Print or save document (Ctrl/Cmd + P)'}">
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
                cleanupScribdReaderMode();
            });

            // Escape key listener
            const keyHandler = (e) => {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    cleanupScribdReaderMode();
                }
            };
            window.addEventListener('keydown', keyHandler);
            window.__dcScribdKeyHandler = keyHandler;

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
                window.__dcScribdCounterObserver = observer;
            }

            overlayUI.update(98, totalPages, totalPages, isVi ? 'Đang mở hộp thoại in PDF...' : 'Opening print window...');
            await new Promise(r => setTimeout(r, 150));

            if (overlayUI) {
                overlayUI.remove();
            }

            updateStatus(isVi ? 'Đang mở cửa sổ in PDF...' : 'Opening print window...');
            setTimeout(() => {
                window.print();
            }, 350);
        } catch (err) {
            console.error('DocCleaner Scribd error:', err);
            if (overlayUI) overlayUI.remove();
            cleanupScribdReaderMode();
            alert('Error: ' + (err && err.message ? err.message : err));
        }
    }

    /**
     * Removes the clean viewer container, reader bar, styles, and preload overlay
     * to restore the original page UI after reading or printing.
     */
    function cleanupScribdReaderMode() {
        if (window.__dcScribdCounterObserver) {
            window.__dcScribdCounterObserver.disconnect();
            window.__dcScribdCounterObserver = null;
        }
        if (window.__dcScribdKeyHandler) {
            window.removeEventListener('keydown', window.__dcScribdKeyHandler);
            window.__dcScribdKeyHandler = null;
        }
        const bar = document.getElementById('doccleaner-reader-bar');
        const viewer = document.getElementById('clean-viewer-container');
        const style = document.getElementById('clean-viewer-styles');
        const overlay = document.getElementById('scribd-preload-overlay');
        if (bar) bar.remove();
        if (viewer) viewer.remove();
        if (style) style.remove();
        if (overlay) overlay.remove();
        revokeScribdObjectUrls();
    }

    // Export functions to window scope
    window.extractPageMetadata = extractPageMetadata;
    window.DocCleaner = window.DocCleaner || {};
    window.DocCleaner.extractPageMetadata = extractPageMetadata;
    window.DocCleaner.autoRecordDocument = autoRecordDocument;
    window.DocCleaner.showStudyShelfToast = showStudyShelfToast;
    window.DocCleaner.revokeScribdObjectUrls = revokeScribdObjectUrls;
    window.initScribdAdBlocker = initScribdAdBlocker;
    window.runScribdCleaner = runScribdCleaner;
    window.removeScribdAds = removeScribdAds;
    window.cleanupAfterPrint = cleanupScribdReaderMode;
    window.cleanupScribdReaderMode = cleanupScribdReaderMode;

    if (typeof globalThis !== 'undefined') {
        globalThis.extractPageMetadata = extractPageMetadata;
    }
    if (typeof this !== 'undefined') {
        this.extractPageMetadata = extractPageMetadata;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            extractPageMetadata,
            autoRecordDocument,
            showStudyShelfToast,
            revokeScribdObjectUrls,
            initScribdAdBlocker,
            runScribdCleaner,
            removeScribdAds,
            cleanupScribdReaderMode
        };
    }

    // Self-initialize ad blocker on Scribd document pages
    initScribdAdBlocker();
})();
