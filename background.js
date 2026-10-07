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
