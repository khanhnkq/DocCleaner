// Popup script for DocCleaner (Studocu & Scribd Helper)

const translations = {
    vi: {
        headerSub: 'Hỗ Trợ Studocu & Scribd',
        currentWebsite: 'Trang Web Hiện Tại',
        detecting: 'Đang nhận diện...',
        notSupported: 'Không hỗ trợ',
        downloadPdfTitle: 'Tải PDF Nét Cao (1-Click)',
        downloadPdfDesc: 'Tự động nạp trang và lưu file PDF',
        scribdPdfDesc: 'Preload & Xuất PDF Scribd HD',
        studocuPdfDesc: 'Bypass giới hạn & Xuất PDF Studocu HD',
        unblurTitle: 'Bỏ Mờ Trang & Xóa Quảng Cáo',
        unblurDesc: 'Xóa cookie để bỏ giới hạn lượt xem',
        coffeeTitle: 'Mời Tác Giả Ly Cà Phê',
        coffeeDesc: 'Ủng hộ để phát triển thêm tính năng',
        statusReady: 'Đã sẵn sàng hoạt động',
        statusStandby: 'Chế độ chờ...',
        statusScribdReady: 'Sẵn sàng diệt QC & Tải PDF Scribd HD',
        statusStudocuReady: 'Sẵn sàng diệt QC & Tải PDF Studocu HD',
        statusNotSupported: 'Vui lòng mở Studocu hoặc Scribd',
        statusScanning: 'Đang quét & diệt quảng cáo...',
        statusCleared: 'Đã xóa {count} cookies & dọn sạch quảng cáo!',
        statusProcessingScribd: 'Đang xử lý tài liệu Scribd...',
        statusProcessingStudocu: 'Đang xử lý tài liệu Studocu...',
        alertScribdInit: 'Đang khởi tạo bộ nạp Scribd, vui lòng thử lại sau 1 giây!',
        alertOpenDoc: 'Vui lòng mở một trang tài liệu trên Studocu hoặc Scribd để sử dụng!',
        authorLabel: 'Tác giả:'
    },
    en: {
        headerSub: 'Studocu & Scribd Helper',
        currentWebsite: 'Current Website',
        detecting: 'Detecting...',
        notSupported: 'Not supported',
        downloadPdfTitle: 'Download HD PDF (1-Click)',
        downloadPdfDesc: 'Auto-preload pages & save as PDF',
        scribdPdfDesc: 'Preload & Export Scribd HD PDF',
        studocuPdfDesc: 'Bypass limits & Export Studocu HD PDF',
        unblurTitle: 'Unblur Pages & Remove Ads',
        unblurDesc: 'Clear limit cookies & clean overlays',
        coffeeTitle: 'Buy the Author a Coffee',
        coffeeDesc: 'Support ongoing development',
        statusReady: 'Ready',
        statusStandby: 'Standby mode...',
        statusScribdReady: 'Ready to block ads & Download Scribd HD PDF',
        statusStudocuReady: 'Ready to block ads & Download Studocu HD PDF',
        statusNotSupported: 'Please open Studocu or Scribd',
        statusScanning: 'Scanning & removing ads...',
        statusCleared: 'Cleared {count} cookies & removed ads!',
        statusProcessingScribd: 'Processing Scribd document...',
        statusProcessingStudocu: 'Processing Studocu document...',
        alertScribdInit: 'Initializing Scribd loader, please try again in 1 second!',
        alertOpenDoc: 'Please open a document page on Studocu or Scribd to proceed!',
        authorLabel: 'Author:'
    }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const { lang } = await chrome.storage.local.get({ lang: 'en' });
            currentLang = lang || 'en';
        }
    } catch (e) {}

    applyLanguage(currentLang);

    // Language switch click listener
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
        langSwitch.addEventListener('click', async (e) => {
            const targetOpt = e.target.closest('.lang-opt');
            const selectedLang = targetOpt ? targetOpt.getAttribute('data-lang') : (currentLang === 'vi' ? 'en' : 'vi');
            if (selectedLang && selectedLang !== currentLang) {
                applyLanguage(selectedLang);
                try {
                    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                        await chrome.storage.local.set({ lang: selectedLang });
                    }
                } catch (err) {}
                await updateTabContext();
            }
        });
    }

    await updateTabContext();
});

function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    const dict = translations[lang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    document.querySelectorAll('#langSwitch .lang-opt').forEach((opt) => {
        if (opt.getAttribute('data-lang') === lang) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

async function updateTabContext() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pdfDesc = document.getElementById('pdf-btn-desc');
    const statusBadge = document.getElementById('status-badge');
    const platformName = document.getElementById('platform-name');
    const dict = translations[currentLang] || translations.en;

    if (!tab || !tab.url) {
        updateStatus(dict.statusStandby, false);
        return;
    }

    const url = new URL(tab.url);
    if (url.hostname.includes('scribd.com')) {
        updateStatus(dict.statusScribdReady, false);
        if (pdfDesc) pdfDesc.innerText = dict.scribdPdfDesc;
        if (platformName) platformName.innerText = 'Scribd.com';
        if (statusBadge) statusBadge.className = 'card-badge scribd-theme';
    } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
        updateStatus(dict.statusStudocuReady, false);
        if (pdfDesc) pdfDesc.innerText = dict.studocuPdfDesc;
        if (platformName) platformName.innerText = 'Studocu.com';
        if (statusBadge) statusBadge.className = 'card-badge studocu-theme';
    } else {
        updateStatus(dict.statusNotSupported, false);
        if (platformName) platformName.innerText = dict.notSupported;
        if (statusBadge) statusBadge.className = 'card-badge idle-theme';
    }
}

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
    const dict = translations[currentLang] || translations.en;
    updateStatus(dict.statusScanning, true);

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

        const clearedMsg = dict.statusCleared.replace('{count}', count);
        updateStatus(clearedMsg, false);

        setTimeout(() => {
            if (tab.id) chrome.tabs.reload(tab.id);
        }, 800);

    } catch (e) {
        updateStatus("Error: " + e.message, false);
    }
});

// Trigger PDF Generation
document.getElementById('checkBtn').addEventListener('click', async () => {
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn.classList.contains('processing')) return;

    const dict = translations[currentLang] || translations.en;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;

    const url = new URL(tab.url);

    checkBtn.classList.add('processing');

    try {
        if (url.hostname.includes('scribd.com')) {
            updateStatus(dict.statusProcessingScribd, true);
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (errorMsg) => {
                    if (typeof window.runScribdCleaner === 'function') {
                        window.runScribdCleaner();
                    } else {
                        alert(errorMsg || 'Initializing Scribd loader, please try again in 1 second!');
                    }
                },
                args: [dict.alertScribdInit]
            });
        } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
            updateStatus(dict.statusProcessingStudocu, true);
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: runCleanViewer
            });
        } else {
            alert(dict.alertOpenDoc);
        }
    } finally {
        setTimeout(() => {
            checkBtn.classList.remove('processing');
        }, 1500);
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