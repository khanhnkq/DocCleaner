// Popup script for DocCleaner (Studocu & Scribd Helper)

const translations = {
    vi: {
        headerSub: 'Better Studocu & Scribd · Miễn Phí',
        currentWebsite: 'Trang Web Hiện Tại',
        detecting: 'Đang nhận diện...',
        notSupported: 'Không hỗ trợ',
        downloadPdfTitle: 'Định Dạng In (1-Click)',
        downloadPdfDesc: 'Dọn bố cục & mở hộp thoại in',
        scribdPdfDesc: 'Better Scribd — Dọn sạch & in PDF',
        studocuPdfDesc: 'Better Studocu — Dọn sạch & in PDF',
        unblurTitle: 'Chế Độ Đọc Sạch',
        unblurDesc: 'Dọn banner & làm mới bố cục trang',
        coffeeTitle: 'Mời Tác Giả Ly Cà Phê',
        coffeeDesc: 'Ủng hộ để phát triển thêm tính năng',
        statusReady: 'Sẵn sàng — Miễn phí 100%',
        statusStandby: 'Chế độ chờ...',
        statusScribdReady: 'Better Scribd — Sẵn sàng dọn sạch & in tài liệu',
        statusStudocuReady: 'Better Studocu — Sẵn sàng dọn sạch & in tài liệu',
        statusNotSupported: 'Vui lòng mở Studocu hoặc Scribd',
        statusScanning: 'Đang dọn dẹp giao diện...',
        statusCleared: 'Đã dọn sạch {count} cookies & làm mới bố cục!',
        statusProcessingScribd: 'Đang xử lý tài liệu Scribd...',
        statusProcessingStudocu: 'Đang xử lý tài liệu Studocu...',
        alertScribdInit: 'Đang khởi tạo bộ đọc Scribd, vui lòng thử lại sau 1 giây!',
        alertStudocuInit: 'Đang khởi tạo bộ đọc Studocu, vui lòng thử lại sau 1 giây!',
        alertOpenDoc: 'Vui lòng mở một trang tài liệu trên Studocu hoặc Scribd để sử dụng!',
        authorLabel: 'Tác giả:'
    },
    en: {
        headerSub: 'Better Studocu & Scribd · Free',
        currentWebsite: 'Current Website',
        detecting: 'Detecting...',
        notSupported: 'Not supported',
        downloadPdfTitle: 'Format for Print (1-Click)',
        downloadPdfDesc: 'Clean layout & open print dialog',
        scribdPdfDesc: 'Better Scribd — Clean & format for print',
        studocuPdfDesc: 'Better Studocu — Clean & format for print',
        unblurTitle: 'Clean View & Remove Clutter',
        unblurDesc: 'Strip banners & refresh page layout',
        coffeeTitle: 'Buy the Author a Coffee',
        coffeeDesc: 'Support ongoing development',
        statusReady: 'Ready — 100% Free',
        statusStandby: 'Standby mode...',
        statusScribdReady: 'Better Scribd — Ready to clean & format document',
        statusStudocuReady: 'Better Studocu — Ready to clean & format document',
        statusNotSupported: 'Please open Studocu or Scribd',
        statusScanning: 'Cleaning up the interface...',
        statusCleared: 'Cleaned {count} cookies & refreshed layout!',
        statusProcessingScribd: 'Processing Scribd document...',
        statusProcessingStudocu: 'Processing Studocu document...',
        alertScribdInit: 'Initializing Scribd reader, please try again in 1 second!',
        alertStudocuInit: 'Initializing Studocu reader, please try again in 1 second!',
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
        const targetDomains = [];
        if (url.hostname.includes('scribd.com')) {
            targetDomains.push('scribd.com');
        } else if (url.hostname.includes('studocu.com') || url.hostname.includes('studocu.vn')) {
            targetDomains.push('studocu.com', 'studocu.vn');
        } else {
            updateStatus(dict.statusNotSupported, false);
            alert(dict.alertOpenDoc);
            return;
        }

        let count = 0;
        for (const domain of targetDomains) {
            const cookies = await chrome.cookies.getAll({ domain });
            for (const cookie of cookies) {
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
                func: (errorMsg) => {
                    if (typeof window.runStudocuCleanViewer === 'function') {
                        window.runStudocuCleanViewer();
                    } else {
                        alert(errorMsg || 'Initializing Studocu loader, please try again in 1 second!');
                    }
                },
                args: [dict.alertStudocuInit]
            });
        } else {
            alert(dict.alertOpenDoc);
        }
    } catch (e) {
        updateStatus("Error: " + e.message, false);
    } finally {
        setTimeout(() => {
            checkBtn.classList.remove('processing');
        }, 1500);
    }
});
