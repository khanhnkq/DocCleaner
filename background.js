// =========================================================================
// 1. UNINSTALL URL & LIFECYCLE MANAGEMENT (Phase 1)
// =========================================================================

const UNINSTALL_BASE_URL = 'https://khanhnkq.github.io/DocCleaner/uninstall.html';

/**
 * Tạo và đăng ký Uninstall URL kèm các tham số ngữ cảnh ẩn danh
 */
async function setupUninstallURL() {
    try {
        const data = await chrome.storage.local.get(['installedAt', 'lang']);
        const manifest = chrome.runtime.getManifest();
        const currentVersion = manifest.version || '1.4';

        // Xác định ngôn ngữ: Ưu tiên thiết lập người dùng chọn -> Mặc định 'en'
        let userLang = data.lang || 'en';

        // Tính toán số ngày đã sử dụng
        let daysUsed = 0;
        if (data.installedAt && typeof data.installedAt === 'number') {
            const diffMs = Date.now() - data.installedAt;
            daysUsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }

        // Xây dựng URL an toàn bằng URLSearchParams
        const params = new URLSearchParams({
            v: currentVersion,
            lang: userLang,
            days: daysUsed.toString(),
            ref: 'ext_uninstall'
        });

        const fullUninstallUrl = `${UNINSTALL_BASE_URL}?${params.toString()}`;

        // Kiểm tra giới hạn tối đa 1023 ký tự theo quy chuẩn Chrome Extension API
        if (fullUninstallUrl.length <= 1023) {
            await chrome.runtime.setUninstallURL(fullUninstallUrl);
        } else {
            console.warn('[DocCleaner] Uninstall URL exceeds 1023 limit, fallback to base URL.');
            await chrome.runtime.setUninstallURL(UNINSTALL_BASE_URL);
        }
    } catch (err) {
        console.error('[DocCleaner] Error in setupUninstallURL:', err);
    }
}

// Lắng nghe sự kiện cài đặt / nâng cấp
chrome.runtime.onInstalled.addListener(async (details) => {
    try {
        const { installedAt } = await chrome.storage.local.get('installedAt');
        if (!installedAt) {
            await chrome.storage.local.set({ installedAt: Date.now() });
        }
        await setupUninstallURL();
    } catch (e) {
        console.error('[DocCleaner] onInstalled setup error:', e);
    }
});

// Lắng nghe khi người dùng đổi ngôn ngữ trong Popup (popup.js lưu key 'lang')
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.lang) {
        setupUninstallURL();
    }
});

// Khởi chạy đồng bộ khi Service Worker thức dậy
setupUninstallURL();

// =========================================================================
// 2. COOKIE CLEANING & NAVIGATION OBSERVER
// =========================================================================

// Auto-clear Studocu & Scribd cookies on beforeNavigate
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId !== 0) return;
    await clearTargetCookies(details.url);
}, {
    url: [
        { hostContains: 'studocu.com' },
        { hostContains: 'studocu.vn' },
        { hostContains: 'scribd.com' }
    ]
});

// Also clear cookies on tab update / reload
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        if (tab.url.includes('studocu.com') || tab.url.includes('studocu.vn') || tab.url.includes('scribd.com')) {
            await clearTargetCookies(tab.url);
        }
    }
});



async function clearTargetCookies(targetUrl) {
    try {
        const targetDomains = [];
        if (targetUrl.includes('scribd.com')) {
            targetDomains.push('scribd.com');
        }
        if (targetUrl.includes('studocu.com') || targetUrl.includes('studocu.vn')) {
            targetDomains.push('studocu.com', 'studocu.vn');
        }

        for (const domain of targetDomains) {
            const cookies = await chrome.cookies.getAll({ domain });
            for (const cookie of cookies) {
                let cleanDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
                const protocol = cookie.secure ? "https:" : "http:";
                const url = `${protocol}//${cleanDomain}${cookie.path}`;
                await chrome.cookies.remove({ url: url, name: cookie.name, storeId: cookie.storeId });
            }
        }
    } catch (e) {
        console.error('DocCleaner - cookie clear error:', e);
    }
}
