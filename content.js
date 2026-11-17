// Content script injected into Studocu & Scribd document pages
// Creates a floating "Tải PDF HD" button and initializes domain-specific cleaners

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
            bottom: 28px !important;
            right: 28px !important;
            z-index: 2147483647 !important;
            background-color: #193582;
            color: #f6f7ef;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13.5px;
            font-weight: 800;
            padding: 8px 16px 8px 8px;
            border-radius: 18px;
            border: 1.5px solid rgba(255, 255, 255, 0.15);
            cursor: pointer;
            box-shadow: 0 10px 28px rgba(9, 27, 66, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            outline: none;
        }

        #studocu-fab-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 34px rgba(9, 27, 66, 0.55), 0 6px 16px rgba(0, 0, 0, 0.25);
            background-color: #1f3e96;
        }

        #studocu-fab-btn:active {
            transform: translateY(-1px) scale(0.98);
        }

        .fab-icon-box {
            width: 34px;
            height: 34px;
            border-radius: 12px;
            background-color: ${fabBadgeBg};
            color: #091b42;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .fab-tag {
            font-size: 10px;
            font-weight: 900;
            background-color: ${fabBadgeBg};
            color: #091b42;
            padding: 3px 8px;
            border-radius: 10px;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }

        .fab-icon-box .fab-icon-spinner {
            display: none;
        }

        .fab-icon-box .fab-icon-download {
            display: block;
        }

        #studocu-fab-btn.processing {
            background-color: #293856;
            cursor: wait;
            opacity: 0.95;
        }

        #studocu-fab-btn.processing .fab-icon-box .fab-icon-download {
            display: none;
        }

        #studocu-fab-btn.processing .fab-icon-box .fab-icon-spinner {
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
            #studocu-fab-btn.processing .fab-icon-box .fab-icon-spinner {
                animation: none !important;
            }
        }

        @media print {
            #studocu-fab-btn { display: none !important; }
        }
    `;
    document.head.appendChild(fabStyle);

    // 3. Create floating action button
    const fabBtn = document.createElement('button');
    fabBtn.id = 'studocu-fab-btn';

    let currentBtnText = 'Format for Print';

    async function updateFabLabel() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const { lang } = await chrome.storage.local.get({ lang: 'en' });
                currentBtnText = lang === 'vi' ? 'Định dạng in' : 'Format for Print';
                const span = fabBtn.querySelector('.fab-text-label');
                if (span) span.innerText = currentBtnText;
            }
        } catch (e) {}
    }

    fabBtn.innerHTML = `
        <div class="fab-icon-box">
            <svg class="fab-icon-download" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <svg class="fab-icon-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="2.8" fill="none"></circle>
                <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.8" fill="none"></path>
            </svg>
        </div>
        <span class="fab-text-label">${currentBtnText}</span>
        <span class="fab-tag">${brandName}</span>
    `;

    updateFabLabel();

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.lang) {
                updateFabLabel();
            }
        });
    }

    fabBtn.addEventListener('click', async () => {
        if (fabBtn.classList.contains('processing')) return;

        fabBtn.classList.add('processing');
        const span = fabBtn.querySelector('.fab-text-label');

        const statusCallback = (msg) => {
            if (span) span.innerText = msg;
        };

        try {
            if (isScribd) {
                if (typeof window.runScribdCleaner === 'function') {
                    await window.runScribdCleaner(statusCallback);
                } else {
                    alert('Error: Scribd Handler is not ready.');
                }
            } else if (isStudocu) {
                if (span) span.innerText = currentBtnText.includes('Tải') ? 'Đang xử lý Studocu...' : 'Processing Studocu...';
                await runStudocuCleanViewer();
            } else {
                alert('Current web page is not supported.');
            }
        } catch (e) {
            console.error('DocCleaner error:', e);
            alert('Error: ' + e.message);
        } finally {
            fabBtn.classList.remove('processing');
            if (span) span.innerText = currentBtnText;
        }
    });

    const attachFab = () => {
        if (!document.getElementById('studocu-fab-btn') && document.body) {
            document.body.appendChild(fabBtn);
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
                <div style="background:#11224d;border:1.5px solid rgba(255,255,255,0.15);border-radius:20px;padding:32px 36px;max-width:440px;width:90%;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.55),0 0 35px rgba(198,235,52,0.2);display:flex;flex-direction:column;align-items:center;gap:16px;">
                    <div style="width:56px;height:56px;border-radius:18px;background:rgba(198,235,52,0.15);border:1px solid rgba(198,235,52,0.35);display:flex;align-items:center;justify-content:center;color:#c6eb34;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" style="animation:stdSpin 0.9s linear infinite;">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="2.8" fill="none"></circle>
                            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.8" fill="none"></path>
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
                    <div style="font-size:11.5px;color:rgba(246,247,239,0.45);margin-top:2px;">
                        ${isVi ? '⚡ Đợi load xong 100% trang & ảnh trước khi in' : '⚡ Waits until 100% pages & images are loaded before printing'}
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
                border-bottom: 1.5px solid rgba(255, 255, 255, 0.14) !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35) !important;
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
                border-radius: 8px !important;
                letter-spacing: 0.3px !important;
                text-transform: uppercase !important;
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
                color: rgba(246, 247, 239, 0.9) !important;
                background: rgba(255, 255, 255, 0.09) !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
                padding: 4px 14px !important;
                border-radius: 999px !important;
            }

            #doccleaner-reader-bar .dc-bar-actions {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
            }
            #doccleaner-reader-bar .dc-btn-primary {
                border: none !important;
                font-size: 13px !important;
                font-weight: 800 !important;
                padding: 7px 16px !important;
                border-radius: 12px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
                transition: transform 0.15s ease, box-shadow 0.15s ease !important;
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
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
            }
            #doccleaner-reader-bar .dc-btn-primary:active {
                transform: translateY(0) scale(0.98) !important;
            }

            #doccleaner-reader-bar .dc-btn-secondary {
                background: rgba(255, 255, 255, 0.12) !important;
                color: #f6f7ef !important;
                border: 1.5px solid rgba(255, 255, 255, 0.18) !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                padding: 7px 14px !important;
                border-radius: 12px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                transition: background 0.15s ease !important;
                outline: none !important;
            }
            #doccleaner-reader-bar .dc-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.22) !important;
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
            }

            /* Outer A4 Page Wrapper */
            .clean-page-wrapper {
                width: 210mm !important;
                height: 296mm !important;
                max-height: 296mm !important;
                background: #ffffff !important;
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12) !important;
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

