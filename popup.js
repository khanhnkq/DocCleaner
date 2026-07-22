// Popup script for DocCleaner (Studocu & Scribd Helper)

document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const statusText = document.getElementById('status-text');
    const pdfDesc = document.getElementById('pdf-btn-desc');
    const statusBadge = document.getElementById('status-badge');
    const platformName = document.getElementById('platform-name');

    if (!tab || !tab.url) {
        updateStatus('Chế độ chờ...', false);
        return;
    }

    const url = new URL(tab.url);
    if (url.hostname.includes('scribd.com')) {
        updateStatus('Sẵn sàng diệt QC & Tải PDF Scribd HD', false);
        if (pdfDesc) pdfDesc.innerText = 'Preload & Xuất PDF Scribd HD';
        if (platformName) platformName.innerText = 'Scribd.com';
        if (statusBadge) statusBadge.className = 'card-badge scribd-theme';
    } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
        updateStatus('Sẵn sàng diệt QC & Tải PDF Studocu HD', false);
        if (pdfDesc) pdfDesc.innerText = 'Bypass giới hạn & Xuất PDF Studocu HD';
        if (platformName) platformName.innerText = 'Studocu.com';
        if (statusBadge) statusBadge.className = 'card-badge studocu-theme';
    } else {
        updateStatus('Vui lòng mở Studocu hoặc Scribd', false);
        if (platformName) platformName.innerText = 'Không hỗ trợ';
        if (statusBadge) statusBadge.className = 'card-badge idle-theme';
    }
});

function updateStatus(msg, isProcessing = false) {
    const statusText = document.getElementById('status-text');
    const statusBar = document.getElementById('status');

    if (statusText && statusBar) {
        statusText.innerText = msg;
        if (isProcessing) {
            statusBar.classList.add('processing');
        } else {
            statusBar.classList.remove('processing');
        }
    }
}

// Buy Me A Coffee Button Click
const coffeeBtn = document.getElementById('coffeeBtn');
if (coffeeBtn) {
    coffeeBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://khanhnkq.quizken.com/buy-me-a-coffee' });
    });
}

// Clear cookies & remove ads for active domain
document.getElementById('clearBtn').addEventListener('click', async () => {
    updateStatus("Đang quét & diệt quảng cáo...", true);

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;

        const url = new URL(tab.url);
        const allCookies = await chrome.cookies.getAll({});
        let count = 0;

        for (const cookie of allCookies) {
            if (cookie.domain.includes('studocu') || cookie.domain.includes('scribd')) {
                let cleanDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
                const protocol = cookie.secure ? "https:" : "http:";
                const cookieUrl = `${protocol}//${cleanDomain}${cookie.path}`;
                await chrome.cookies.remove({ url: cookieUrl, name: cookie.name, storeId: cookie.storeId });
                count++;
            }
        }

        // Also trigger DOM ad cleaner on page
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (typeof window.removeScribdAds === 'function') window.removeScribdAds();
                document.querySelectorAll('.promo_wrapper, .promo_border, .auto__doc_page_webpack_app_page_truncate_promo, #upgrade-overlay, #onetrust-consent-sdk')
                    .forEach(el => el.remove());
            }
        });

        updateStatus(`Đã xóa ${count} cookies & dọn sạch quảng cáo!`, false);

        setTimeout(() => {
            if (tab.id) chrome.tabs.reload(tab.id);
        }, 800);

    } catch (e) {
        updateStatus("Lỗi: " + e.message, false);
    }
});

// Trigger PDF Generation
document.getElementById('checkBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;

    const url = new URL(tab.url);

    if (url.hostname.includes('scribd.com')) {
        updateStatus("Đang xử lý tài liệu Scribd...", true);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (typeof window.runScribdCleaner === 'function') {
                    window.runScribdCleaner();
                } else {
                    alert("Đang khởi tạo bộ nạp Scribd, vui lòng thử lại sau 1 giây!");
                }
            }
        });
    } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
        updateStatus("Đang xử lý tài liệu Studocu...", true);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: runCleanViewer
        });
    } else {
        alert("Vui lòng mở một trang tài liệu trên Studocu hoặc Scribd để sử dụng!");
    }
});

async function runCleanViewer() {
    const pages = document.querySelectorAll('div[data-page-index]');
    if (pages.length === 0) {
        alert("⚠️ Không tìm thấy trang nào.\n(Hãy cuộn chuột xuống cuối tài liệu để web tải hết nội dung trước!)");
        return;
    }

    let signature = '';
    let baseDocPath = '';

    const allImgs = Array.from(document.querySelectorAll('div[data-page-index] img'));
    for (const img of allImgs) {
        const src = img.src || (img.dataset ? img.dataset.src : '');
        if (src && src.includes('/html/bg')) {
            try {
                const urlObj = new URL(src);
                signature = urlObj.search;
                const match = urlObj.href.match(/(https:\/\/[^\/]+\/[^\/]+)\/html\/bg/);
                if (match) {
                    baseDocPath = match[1];
                }
                break;
            } catch (e) { }
        }
    }

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

        if (imgEl.complete && imgEl.naturalWidth > 0) return;

        imagePromises.push(new Promise(resolve => {
            imgEl.addEventListener('load', resolve, { once: true });
            imgEl.addEventListener('error', resolve, { once: true });
            setTimeout(resolve, 3000);
        }));
    });

    if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
    }

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

        newPage.appendChild(pfClone);
        viewerContainer.appendChild(newPage);
    });

    const oldStyle = document.getElementById('clean-viewer-styles');
    if (oldStyle) oldStyle.remove();

    const viewerStyle = document.createElement('style');
    viewerStyle.id = 'clean-viewer-styles';
    viewerStyle.textContent = `
        body { background-color: #f6f7fb !important; margin: 0 !important; }
        body > *:not(#clean-viewer-container) { display: none !important; }
        #clean-viewer-container { position: absolute; top: 0; left: 0; width: 100%; display: flex; flex-direction: column; align-items: center; padding: 30px 0; z-index: 99999; }
        .std-page { position: relative !important; background-color: white; margin-bottom: 20px; overflow: hidden !important; border: none !important; }
        @media print {
            @page { margin: 0; size: A4 portrait; }
            html, body { background-color: white !important; margin: 0 !important; }
            #clean-viewer-container { position: static !important; display: block !important; width: 100% !important; }
            .std-page { position: relative !important; width: 100% !important; height: 100vh !important; page-break-after: always !important; }
        }
    `;
    document.head.appendChild(viewerStyle);
    document.body.appendChild(viewerContainer);

    setTimeout(() => {
        window.print();
    }, 800);
}