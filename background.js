// =========================================================================
// DocCleaner - Background Service Worker (Manifest V3)
// =========================================================================

// Enable trusted/untrusted session storage access for content scripts if supported
if (
  typeof chrome !== 'undefined' &&
  chrome.storage &&
  chrome.storage.session &&
  typeof chrome.storage.session.setAccessLevel === 'function'
) {
  chrome.storage.session
    .setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
    .catch(() => {});
}

// =========================================================================
// 1. CONSTANTS & CONFIGURATION
// =========================================================================

const UNINSTALL_BASE_URL = 'https://khanhnkq.github.io/DocCleaner/uninstall.html';
const LRU_MAX_LOCAL = 25;
const LRU_MAX_SESSION = 15;
const TARGET_DOMAINS = ['studocu.com', 'studocu.vn', 'scribd.com'];

// =========================================================================
// 2. UNINSTALL URL & LIFECYCLE MANAGEMENT (Phase 1)
// =========================================================================

/**
 * Tạo và đăng ký Uninstall URL kèm các tham số ngữ cảnh ẩn danh
 */
async function setupUninstallURL() {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      return;
    }
    const data = await chrome.storage.local.get(['installedAt', 'lang']);
    const manifest = (chrome.runtime && typeof chrome.runtime.getManifest === 'function')
      ? chrome.runtime.getManifest()
      : {};
    const currentVersion = manifest.version || '1.8.0';

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
    if (chrome.runtime && typeof chrome.runtime.setUninstallURL === 'function') {
      if (fullUninstallUrl.length <= 1023) {
        await chrome.runtime.setUninstallURL(fullUninstallUrl);
      } else {
        console.warn('[DocCleaner] Uninstall URL exceeds 1023 limit, fallback to base URL.');
        await chrome.runtime.setUninstallURL(UNINSTALL_BASE_URL);
      }
    }
  } catch (err) {
    console.error('[DocCleaner] Error in setupUninstallURL:', err);
  }
}

// Lắng nghe sự kiện cài đặt / nâng cấp
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(async (details) => {
    try {
      const { installedAt } = await chrome.storage.local.get('installedAt');
      if (!installedAt) {
        await chrome.storage.local.set({ installedAt: Date.now() });
      }

      // Kích hoạt Day-0 Onboarding khi cài đặt mới
      if (details.reason === 'install') {
        await chrome.storage.local.set({
          isFirstRun: true,
          hasSeenPrintTip: false
        });
        if (chrome.tabs && typeof chrome.tabs.create === 'function') {
          chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
        }
      }

      await setupUninstallURL();
    } catch (e) {
      console.error('[DocCleaner] onInstalled setup error:', e);
    }
  });
}

// Lắng nghe khi người dùng đổi ngôn ngữ trong Popup (popup.js lưu key 'lang')
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.lang) {
      setupUninstallURL();
    }
  });
}

// Khởi chạy đồng bộ khi Service Worker thức dậy
setupUninstallURL();

// =========================================================================
// 3. COOKIE CLEANING & NAVIGATION OBSERVER (Phase 1)
// =========================================================================

// Auto-clear Studocu & Scribd cookies on beforeNavigate
if (typeof chrome !== 'undefined' && chrome.webNavigation && chrome.webNavigation.onBeforeNavigate) {
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
}

// Also clear cookies on tab update / reload
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
      if (tab.url.includes('studocu.com') || tab.url.includes('studocu.vn') || tab.url.includes('scribd.com')) {
        await clearTargetCookies(tab.url);
      }
    }
  });
}

async function clearTargetCookies(targetUrl) {
  try {
    if (typeof chrome === 'undefined' || !chrome.cookies || typeof chrome.cookies.getAll !== 'function') {
      return;
    }
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
        const url = `${protocol}//${cleanDomain}${cookie.path || '/'}`;
        await chrome.cookies.remove({ url: url, name: cookie.name, storeId: cookie.storeId });
      }
    }
  } catch (e) {
    console.error('DocCleaner - cookie clear error:', e);
  }
}

// =========================================================================
// 4. STORAGE LRU ENGINE & STAR PROTECTION (Milestone 2)
// =========================================================================

/**
 * Ghi nhận hoặc cập nhật tài liệu vào lịch sử gần đây với cơ chế LRU và bảo vệ mục yêu thích (Star Protection)
 * - Nếu Lab PC Mode kích hoạt (`dc_lab_mode === true`): ghi riêng vào `chrome.storage.session.session_docs` (tối đa 15 mục).
 * - Nếu chế độ bình thường: ghi vào `chrome.storage.local.dc_recent_docs` (tối đa 25 mục).
 *
 * @param {Object} doc - Thông tin tài liệu { id, title, canonicalUrl, platform, pageCount, lastOpenedAt, isStarred }
 * @returns {Promise<Array>} Mảng danh sách tài liệu sau khi cập nhật
 */
async function recordRecentDocument(doc) {
  if (!doc || typeof doc !== 'object') {
    return [];
  }

  // 1. Kiểm tra trạng thái Lab PC Mode
  const localSettings = (chrome.storage && chrome.storage.local)
    ? await chrome.storage.local.get(['dc_lab_mode'])
    : {};
  const isLabMode = Boolean(localSettings && localSettings.dc_lab_mode === true);

  // 2. Lấy danh sách tài liệu hiện tại từ khu vực lưu trữ tương ứng
  let currentDocs = [];
  const capacity = isLabMode ? LRU_MAX_SESSION : LRU_MAX_LOCAL;

  if (isLabMode) {
    if (chrome.storage && chrome.storage.session) {
      const sessionData = await chrome.storage.session.get(['session_docs']);
      currentDocs = Array.isArray(sessionData?.session_docs) ? [...sessionData.session_docs] : [];
    }
  } else {
    if (chrome.storage && chrome.storage.local) {
      const localData = await chrome.storage.local.get(['dc_recent_docs']);
      currentDocs = Array.isArray(localData?.dc_recent_docs) ? [...localData.dc_recent_docs] : [];
    }
  }

  // 3. Khử trùng lặp (Deduplication) theo `id` hoặc `canonicalUrl`
  let existingIndex = -1;
  for (let i = 0; i < currentDocs.length; i++) {
    const item = currentDocs[i];
    if (doc.id && item.id && doc.id === item.id) {
      existingIndex = i;
      break;
    }
    if (doc.canonicalUrl && item.canonicalUrl && doc.canonicalUrl === item.canonicalUrl) {
      existingIndex = i;
      break;
    }
  }

  if (existingIndex !== -1) {
    // Tài liệu đã tồn tại: Cắt ra khỏi vị trí cũ
    const existingDoc = currentDocs.splice(existingIndex, 1)[0];
    const isStarred = Boolean(existingDoc.isStarred);
    const updatedDoc = {
      ...existingDoc,
      ...doc,
      id: doc.id || existingDoc.id,
      title: (doc.title !== undefined && doc.title !== null && doc.title !== '')
        ? String(doc.title).trim()
        : existingDoc.title,
      canonicalUrl: doc.canonicalUrl || existingDoc.canonicalUrl,
      platform: doc.platform || existingDoc.platform || 'studocu',
      pageCount: (typeof doc.pageCount === 'number' && doc.pageCount > 0)
        ? doc.pageCount
        : (existingDoc.pageCount || 0),
      lastOpenedAt: (typeof doc.lastOpenedAt === 'number') ? doc.lastOpenedAt : Date.now(),
      isStarred: isStarred
    };
    currentDocs.unshift(updatedDoc);
  } else {
    // Tài liệu mới: Thêm mới vào vị trí đầu tiên (Index 0)
    const newDoc = {
      ...doc,
      id: doc.id || ('doc_' + Date.now().toString(36)),
      title: doc.title ? String(doc.title).trim() : '',
      canonicalUrl: doc.canonicalUrl || '',
      platform: doc.platform || 'studocu',
      pageCount: typeof doc.pageCount === 'number' ? doc.pageCount : 0,
      lastOpenedAt: (typeof doc.lastOpenedAt === 'number') ? doc.lastOpenedAt : Date.now(),
      isStarred: Boolean(doc.isStarred)
    };
    currentDocs.unshift(newDoc);
  }

  // 4. Thuật toán loại bỏ LRU có bảo vệ mục yêu thích (Star Protection Eviction)
  while (currentDocs.length > capacity) {
    let evictionIndex = -1;
    // Tìm tài liệu cũ nhất không được gắn sao từ cuối danh sách (i = length - 1 về 1)
    for (let i = currentDocs.length - 1; i >= 1; i--) {
      if (!currentDocs[i].isStarred) {
        evictionIndex = i;
        break;
      }
    }
    if (evictionIndex !== -1) {
      currentDocs.splice(evictionIndex, 1);
    } else {
      // Trường hợp tất cả các mục từ index 1 trở đi đều được gắn sao: Loại bỏ mục cũ nhất ở cuối
      currentDocs.splice(currentDocs.length - 1, 1);
    }
  }

  // 5. Lưu danh sách đã cập nhật vào bộ nhớ tương ứng
  if (isLabMode) {
    if (chrome.storage && chrome.storage.session && typeof chrome.storage.session.set === 'function') {
      await chrome.storage.session.set({ session_docs: currentDocs });
    }
  } else {
    if (chrome.storage && chrome.storage.local && typeof chrome.storage.local.set === 'function') {
      await chrome.storage.local.set({ dc_recent_docs: currentDocs });
    }
  }

  return currentDocs;
}

// =========================================================================
// 5. CLEAN & BURN PROTOCOL (Milestone 2)
// =========================================================================

/**
 * Xóa toàn bộ cookie của các domain mục tiêu: studocu.com, studocu.vn, scribd.com
 */
async function wipeTargetCookies() {
  if (typeof chrome === 'undefined' || !chrome.cookies || typeof chrome.cookies.getAll !== 'function') {
    return;
  }
  for (const domain of TARGET_DOMAINS) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      if (Array.isArray(cookies)) {
        for (const cookie of cookies) {
          const cleanDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
          const protocol = cookie.secure ? 'https:' : 'http:';
          const url = `${protocol}//${cleanDomain}${cookie.path || '/'}`;
          await chrome.cookies.remove({
            url: url,
            name: cookie.name,
            storeId: cookie.storeId
          });
        }
      }
    } catch (e) {
      console.error(`[DocCleaner] Error removing cookies for ${domain}:`, e);
    }
  }
}

/**
 * Phát tín hiệu PURGE_TRANSIENT_MEMORY tới tất cả các tab đang mở tài liệu Studocu hoặc Scribd
 */
async function broadcastPurgeTransientMemory() {
  if (typeof chrome === 'undefined' || !chrome.tabs || typeof chrome.tabs.query !== 'function') {
    return;
  }
  try {
    const tabs = await chrome.tabs.query({});
    if (Array.isArray(tabs)) {
      for (const tab of tabs) {
        if (!tab || !tab.url) continue;
        const urlLower = tab.url.toLowerCase();
        if (
          urlLower.includes('studocu.com') ||
          urlLower.includes('studocu.vn') ||
          urlLower.includes('scribd.com')
        ) {
          if (typeof chrome.tabs.sendMessage === 'function') {
            chrome.tabs.sendMessage(tab.id, { action: 'PURGE_TRANSIENT_MEMORY' }).catch(() => {});
          }
        }
      }
    }
  } catch (e) {
    console.error('[DocCleaner] Error broadcasting PURGE_TRANSIENT_MEMORY:', e);
  }
}

/**
 * Thực thi giao thức Clean & Burn:
 * 1. Xóa mảng lịch sử dc_recent_docs trong chrome.storage.local
 * 2. Xóa toàn bộ dữ liệu trong chrome.storage.session
 * 3. Xóa cookie các trang Studocu và Scribd
 * 4. Phát thông điệp giải phóng bộ nhớ tạm thời tới các tab
 */
async function executeCleanAndBurn() {
  try {
    // 1. Xóa lịch sử local storage
    if (chrome.storage && chrome.storage.local && typeof chrome.storage.local.set === 'function') {
      await chrome.storage.local.set({ dc_recent_docs: [] });
    }

    // 2. Xóa session storage
    if (chrome.storage && chrome.storage.session) {
      if (typeof chrome.storage.session.clear === 'function') {
        await chrome.storage.session.clear();
      } else if (typeof chrome.storage.session.set === 'function') {
        await chrome.storage.session.set({ session_docs: [] });
      }
    }

    // 3. Xóa cookie mục tiêu
    await wipeTargetCookies();

    // 4. Phát lệnh giải phóng bộ nhớ tạm trong tabs
    await broadcastPurgeTransientMemory();

    return { status: 'BURN_SUCCESS' };
  } catch (err) {
    console.error('[DocCleaner] executeCleanAndBurn error:', err);
    throw err;
  }
}

// =========================================================================
// 6. WINDOW-CLOSE AUTO-PURGE IN LAB MODE (Milestone 2)
// =========================================================================

if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.onRemoved) {
  chrome.windows.onRemoved.addListener(async (windowId) => {
    try {
      if (!chrome.storage || !chrome.storage.local) return;
      const data = await chrome.storage.local.get('dc_lab_mode');
      if (data && data.dc_lab_mode === true) {
        if (typeof chrome.windows.getAll === 'function') {
          const remainingWindows = await chrome.windows.getAll();
          if (Array.isArray(remainingWindows) && remainingWindows.length > 0) {
            return;
          }
        }
        await executeCleanAndBurn();
      }
    } catch (e) {
      console.error('[DocCleaner] Window-close purge error:', e);
    }
  });
}

// =========================================================================
// 7. DUAL-LAYER SPA WEBNAVIGATION WATCHER (Milestone 2)
// =========================================================================

if (typeof chrome !== 'undefined' && chrome.webNavigation && chrome.webNavigation.onHistoryStateUpdated) {
  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details && details.frameId === 0 && details.url) {
      const urlLower = details.url.toLowerCase();
      if (
        urlLower.includes('studocu.com') ||
        urlLower.includes('studocu.vn') ||
        urlLower.includes('scribd.com')
      ) {
        if (chrome.tabs && typeof chrome.tabs.sendMessage === 'function') {
          chrome.tabs.sendMessage(details.tabId, {
            action: 'SPA_ROUTE_CHANGED',
            url: details.url
          }).catch(() => {});
        }
      }
    }
  }, {
    url: [
      { hostContains: 'studocu.com' },
      { hostContains: 'studocu.vn' },
      { hostContains: 'scribd.com' }
    ]
  });
}

// =========================================================================
// 8. RUNTIME MESSAGE DISPATCHER (Milestone 2)
// =========================================================================

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message !== 'object') return false;

    if (message.action === 'RECORD_RECENT_DOC') {
      recordRecentDocument(message.doc)
        .then((updatedDocs) => {
          sendResponse({
            success: true,
            count: Array.isArray(updatedDocs) ? updatedDocs.length : 0
          });
        })
        .catch((err) => {
          console.error('[DocCleaner] Error in RECORD_RECENT_DOC:', err);
          sendResponse({ success: false, error: err.message });
        });
      return true; // Giữ kết nối mở để trả lời async
    }

    if (message.action === 'EXECUTE_CLEAN_AND_BURN') {
      executeCleanAndBurn()
        .then(() => {
          sendResponse({ status: 'BURN_SUCCESS' });
        })
        .catch((err) => {
          console.error('[DocCleaner] Error in EXECUTE_CLEAN_AND_BURN:', err);
          sendResponse({ status: 'BURN_ERROR', error: err.message });
        });
      return true; // Giữ kết nối mở để trả lời async
    }

    return false;
  });
}

// =========================================================================
// 9. UNIVERSAL EXPORTS (Node.js Unit Testing & Sandbox Harness)
// =========================================================================

if (typeof globalThis !== 'undefined') {
  globalThis.LRU_MAX_LOCAL = LRU_MAX_LOCAL;
  globalThis.LRU_MAX_SESSION = LRU_MAX_SESSION;
  globalThis.TARGET_DOMAINS = TARGET_DOMAINS;
  globalThis.recordRecentDocument = recordRecentDocument;
  globalThis.executeCleanAndBurn = executeCleanAndBurn;
  globalThis.wipeTargetCookies = wipeTargetCookies;
  globalThis.clearTargetCookies = clearTargetCookies;
  globalThis.broadcastPurgeTransientMemory = broadcastPurgeTransientMemory;
}

if (typeof self !== 'undefined') {
  self.LRU_MAX_LOCAL = LRU_MAX_LOCAL;
  self.LRU_MAX_SESSION = LRU_MAX_SESSION;
  self.TARGET_DOMAINS = TARGET_DOMAINS;
  self.recordRecentDocument = recordRecentDocument;
  self.executeCleanAndBurn = executeCleanAndBurn;
  self.wipeTargetCookies = wipeTargetCookies;
  self.clearTargetCookies = clearTargetCookies;
  self.broadcastPurgeTransientMemory = broadcastPurgeTransientMemory;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LRU_MAX_LOCAL,
    LRU_MAX_SESSION,
    TARGET_DOMAINS,
    recordRecentDocument,
    executeCleanAndBurn,
    wipeTargetCookies,
    clearTargetCookies,
    broadcastPurgeTransientMemory,
    setupUninstallURL
  };
}
