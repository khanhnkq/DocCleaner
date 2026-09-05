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
    const brandName = isScribd ? 'Scribd' : (isStudocu ? 'Studocu' : 'Doc');

    const fabStyle = document.createElement('style');
    fabStyle.id = 'studocu-fab-styles';
    fabStyle.textContent = `
        #studocu-fab-btn {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 999999;
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

    let currentBtnText = 'Download HD PDF';

    async function updateFabLabel() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const { lang } = await chrome.storage.local.get({ lang: 'en' });
                currentBtnText = lang === 'vi' ? 'Tải PDF HD' : 'Download HD PDF';
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

    if (document.body) {
        document.body.appendChild(fabBtn);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(fabBtn);
        });
    }
})();

// ==========================================================================
// STUDOCU SPECIFIC CLEANER & AD BLOCKER
// ==========================================================================

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

    const observer = new MutationObserver((mutations) => {
        let shouldClean = false;
        for (const mutation of mutations) {
            // Ignore mutations caused by our own Clean Viewer, FAB button, or Overlay
            if (mutation.target && (
                mutation.target.id === 'clean-viewer-container' ||
                mutation.target.id === 'studocu-fab-btn' ||
                mutation.target.id === 'studocu-preload-overlay' ||
                (mutation.target.closest && (
                    mutation.target.closest('#clean-viewer-container') ||
                    mutation.target.closest('#studocu-fab-btn') ||
                    mutation.target.closest('#studocu-preload-overlay')
                ))
            )) {
                continue;
            }
            if (mutation.addedNodes.length > 0) {
                shouldClean = true;
                break;
            }
        }
        if (shouldClean) {
            if (cleanDebounceTimer) clearTimeout(cleanDebounceTimer);
            cleanDebounceTimer = setTimeout(removeStudocuAds, 120);
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

async function runStudocuCleanViewer() {
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

            capturedPages.push(clone);

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

        // 6. Embed All Images as Data URIs (Base64) to Guarantee 100% Print Preview Reliability
        overlayUI.update(72, totalPages, totalPages, isVi ? 'Đang chuyển đổi & nhúng ảnh HD vào RAM...' : 'Embedding HD images into RAM...');

        async function embedImagesAsDataUris(pagesList, onProgress) {
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
                                const dataUri = await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onload = () => resolve(reader.result);
                                    reader.onerror = () => resolve(null);
                                    reader.readAsDataURL(blob);
                                });
                                if (dataUri) {
                                    urlMap[url] = dataUri;
                                }
                            }
                        } else if (res.status === 403 || res.status === 404) {
                            // If full page unblurred webp was 403/404, fallback to blurred preview if available
                            if (url.includes('/html/pages/page')) {
                                const fallbackUrl = url.replace('/html/pages/page', '/html/pages/blurred/page');
                                try {
                                    const fbRes = await fetch(fallbackUrl, { credentials: 'omit' });
                                    if (fbRes.ok) {
                                        const fbBlob = await fbRes.blob();
                                        const fbDataUri = await new Promise((resolve) => {
                                            const reader = new FileReader();
                                            reader.onload = () => resolve(reader.result);
                                            reader.onerror = () => resolve(null);
                                            reader.readAsDataURL(fbBlob);
                                        });
                                        if (fbDataUri) urlMap[url] = fbDataUri;
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

            // Replace img src attributes with Data URIs
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
            body { 
                background-color: #f6f7fb !important; 
                margin: 0 !important; 
                overflow: auto !important; 
            }
            body > *:not(#clean-viewer-container) { 
                display: none !important; 
            }
            #clean-viewer-container {
                position: absolute !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 100% !important; 
                display: flex !important; 
                flex-direction: column !important; 
                align-items: center !important; 
                padding: 30px 0 !important; 
                z-index: 99999 !important; 
                opacity: 1 !important; 
                visibility: visible !important; 
                background-color: #f6f7fb !important; 
            }
            #clean-viewer-container .pf {
                position: relative !important; 
                background: #ffffff !important; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; 
                margin: 0 auto 20px auto !important; 
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
            @media print {
                @page { 
                    margin: 0; 
                    size: auto; 
                }
                html, body { 
                    background: #ffffff !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    width: 100% !important; 
                    height: auto !important; 
                    max-height: none !important; 
                    overflow: visible !important; 
                    position: static !important; 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                }
                body > *:not(#clean-viewer-container) { 
                    display: none !important; 
                }
                #clean-viewer-container { 
                    position: static !important; 
                    display: block !important; 
                    width: 100% !important; 
                    height: auto !important; 
                    max-height: none !important; 
                    padding: 0 !important; 
                    margin: 0 !important; 
                    opacity: 1 !important; 
                    visibility: visible !important; 
                    overflow: visible !important; 
                    background: #ffffff !important; 
                }
                #clean-viewer-container .pf { 
                    margin: 0 auto !important; 
                    box-shadow: none !important; 
                    page-break-after: always !important; 
                    break-after: page !important; 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: block !important; 
                    visibility: visible !important; 
                    opacity: 1 !important; 
                    filter: none !important; 
                    overflow: hidden !important; 
                    background: #ffffff !important; 
                }
                #clean-viewer-container .pf:last-child { 
                    page-break-after: auto !important; 
                    break-after: auto !important; 
                }
                #clean-viewer-container .page-content,
                #clean-viewer-container .pc { 
                    display: block !important; 
                    visibility: visible !important; 
                    opacity: 1 !important; 
                    filter: none !important; 
                }
                #clean-viewer-container .t { 
                    visibility: visible !important; 
                    opacity: 1 !important; 
                    z-index: 5 !important; 
                }
                #clean-viewer-container img.bi,
                #clean-viewer-container .pf img { 
                    z-index: 1 !important; 
                    display: block !important; 
                    visibility: visible !important; 
                    opacity: 1 !important; 
                }
            }
        `;
        document.head.appendChild(viewerStyle);
        document.body.appendChild(viewerContainer);

        if (overlayUI) {
            overlayUI.remove();
        }

        setTimeout(() => {
            window.addEventListener('afterprint', cleanupStudocuAfterPrint, { once: true });
            window.print();
            setTimeout(cleanupStudocuAfterPrint, 2500);
        }, 500);

    } catch (err) {
        console.error('DocCleaner Studocu error:', err);
        if (overlayUI) overlayUI.remove();
        cleanupStudocuAfterPrint();
        alert('Error: ' + (err && err.message ? err.message : err));
    }
}

/**
 * Removes the clean viewer container, styles, and preload overlay
 * to restore the original page UI after printing.
 */
function cleanupStudocuAfterPrint() {
    const v = document.getElementById('clean-viewer-container');
    const s = document.getElementById('clean-viewer-styles');
    const o = document.getElementById('studocu-preload-overlay');
    if (v) v.remove();
    if (s) s.remove();
    if (o) o.remove();
}

// Export functions to window scope so popup.js and router can call it
window.runStudocuCleanViewer = runStudocuCleanViewer;
window.cleanupStudocuAfterPrint = cleanupStudocuAfterPrint;

