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

        #studocu-fab-btn.processing {
            background-color: #293856;
            cursor: wait;
            opacity: 0.95;
        }

        #studocu-fab-btn.processing .fab-icon-box svg {
            animation: fabSpin 1s linear infinite;
        }

        @keyframes fabSpin {
            100% { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
            #studocu-fab-btn {
                transition-duration: 0.01ms !important;
                transform: none !important;
            }
            #studocu-fab-btn.processing .fab-icon-box svg {
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
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
    const removeStudocuAds = () => {
        const adSelectors = [
            '#upgrade-overlay',
            '.banner-wrapper',
            '[class*="paywall"]',
            '[class*="overlay"]',
            '#onetrust-consent-sdk',
            '.onetrust-pc-dark-filter',
            '#didomi-host'
        ];
        adSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });
    };

    removeStudocuAds();
    const observer = new MutationObserver(removeStudocuAds);
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

async function runStudocuCleanViewer() {
    const pages = document.querySelectorAll('div[data-page-index]');
    if (pages.length === 0) {
        alert("Không tìm thấy trang nào.\n(Vui lòng cuộn chuột xuống cuối tài liệu để nạp nội dung trước!)");
        return;
    }

    // STEP 1: Extract CloudFront signature and base URL from any loaded page image
    let signature = '';
    let baseDocPath = '';

    const allImgs = Array.from(document.querySelectorAll('div[data-page-index] img'));
    for (const img of allImgs) {
        const src = img.src || (img.dataset ? img.dataset.src : '');
        if (src && src.includes('/html/bg')) {
            try {
                const urlObj = new URL(src);
                signature = urlObj.search; // ?Policy=...&Signature=...
                const match = urlObj.href.match(/(https:\/\/[^\/]+\/[^\/]+)\/html\/bg/);
                if (match) {
                    baseDocPath = match[1];
                }
                break;
            } catch (e) { }
        }
    }

    // STEP 2: Force HD unblurred bgN.png images on ALL pages (including off-screen and locked pages)
    console.log("DocCleaner: Loading all HD page images...");

    const imagePromises = [];
    pages.forEach((page, index) => {
        const pageNum = index + 1;
        let imgEl = page.querySelector('img.bi') || page.querySelector('img');

        if (!imgEl) {
            imgEl = document.createElement('img');
            imgEl.className = 'bi';
            const pf = page.querySelector('.pf') || page.querySelector('.pc') || page;
            pf.insertBefore(imgEl, pf.firstChild);
        }

        // Construct guaranteed HD unblurred URL for this page
        let targetSrc = '';
        if (baseDocPath && signature) {
            targetSrc = `${baseDocPath}/html/bg${pageNum}.png${signature}`;
        } else if (imgEl.dataset && imgEl.dataset.src) {
            targetSrc = imgEl.dataset.src;
        } else {
            targetSrc = imgEl.src;
        }

        imgEl.src = targetSrc;
        imgEl.setAttribute('loading', 'eager');
        imgEl.loading = 'eager';
        imgEl.style.display = 'block';
        imgEl.style.visibility = 'visible';
        imgEl.style.opacity = '1';

        if (imgEl.complete && imgEl.naturalWidth > 0) {
            return;
        }

        imagePromises.push(new Promise(resolve => {
            imgEl.addEventListener('load', resolve, { once: true });
            imgEl.addEventListener('error', resolve, { once: true });
            setTimeout(resolve, 3000);
        }));
    });

    if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
    }

    // STEP 3: Find wrapper element to copy its dynamic scoping class (e.g. .p2hv)
    const wrapper = document.querySelector('#page-container-wrapper')
        || document.querySelector('[id*="page-container"]')
        || document.querySelector('[class*="Viewer_page-container"]');

    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'clean-viewer-container';
    if (wrapper) {
        const classes = wrapper.className.split(' ').filter(c => !c.includes('Viewer_page-container'));
        viewerContainer.className = classes.join(' ');
    }

    pages.forEach((page, index) => {
        const pf = page.querySelector('.pf') || page;
        const pc = page.querySelector('.pc') || pf;

        const style = window.getComputedStyle(pc);
        const rect = pc.getBoundingClientRect();

        let width = parseFloat(style.width) || rect.width || 612;
        let height = parseFloat(style.height) || rect.height || 792;

        const scaleFactor = Math.min(775 / width, 1060 / height);

        const newPage = document.createElement('div');
        newPage.className = 'std-page';
        newPage.id = `page-${index + 1}`;
        newPage.setAttribute('data-page-number', index + 1);
        newPage.style.width = '100%';
        newPage.style.height = (height * scaleFactor) + 'px';

        const pfClone = pf.cloneNode(true);
        pfClone.style.transform = `scale(${scaleFactor})`;
        pfClone.style.transformOrigin = 'center center';
        pfClone.style.margin = '0 auto';
        pfClone.style.top = '0';
        pfClone.style.left = '0';
        pfClone.style.display = 'block';
        pfClone.style.visibility = 'visible';
        pfClone.style.opacity = '1';

        pfClone.querySelectorAll('.page-content, .pc, .pf').forEach(el => {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.style.filter = 'none';
        });

        pfClone.querySelectorAll('img').forEach(imgEl => {
            imgEl.style.display = 'block';
            imgEl.style.visibility = 'visible';
            imgEl.style.opacity = '1';
        });

        newPage.appendChild(pfClone);
        viewerContainer.appendChild(newPage);
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
            position: absolute; 
            top: 0; left: 0; 
            width: 100%;
            display: flex; 
            flex-direction: column; 
            align-items: center;
            padding: 30px 0; 
            z-index: 99999;
            opacity: 1 !important;
            visibility: visible !important;
        }
        .std-page {
            position: relative !important; 
            background-color: white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            margin-bottom: 20px;
            overflow: hidden !important; 
            border: none !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        .std-page .pf,
        .std-page .pc,
        .std-page .page-content {
            position: relative !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            filter: none !important;
            top: 0 !important;
            left: 0 !important;
        }
        @media print {
            @page { 
                margin: 0; 
                size: A4 portrait; 
            }
            html, body { 
                background-color: white !important; 
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                position: static !important;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
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
            }
            .std-page { 
                position: relative !important;
                width: 100% !important;
                height: 100vh !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important; 
                padding: 0 !important;
                box-shadow: none !important; 
                page-break-after: always !important; 
                break-after: page !important; 
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                border: none !important; 
                opacity: 1 !important; 
                visibility: visible !important; 
                overflow: hidden !important;
                background: white !important;
            }
            .std-page .pf {
                position: relative !important;
                margin: 0 auto !important;
                display: block !important; 
                visibility: visible !important; 
                opacity: 1 !important; 
                filter: none !important; 
            }
            .std-page .pc,
            .std-page .page-content { 
                display: block !important; 
                visibility: visible !important; 
                opacity: 1 !important; 
                filter: none !important; 
            }
        }
    `;
    document.head.appendChild(viewerStyle);
    document.body.appendChild(viewerContainer);

    setTimeout(() => {
        window.print();
    }, 800);
}
