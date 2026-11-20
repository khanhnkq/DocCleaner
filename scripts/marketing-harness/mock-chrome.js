/**
 * Mock Chrome API Shim for DocCleaner Marketing Harness
 * scripts/marketing-harness/mock-chrome.js
 *
 * Provides a lightweight, reliable in-memory Chrome extension API implementation
 * supporting chrome.storage.local, chrome.storage.session, chrome.storage.onChanged,
 * chrome.runtime, chrome.tabs, chrome.scripting, chrome.cookies, and safe window.print.
 */
(function (root) {
  'use strict';

  if (typeof window === 'undefined') return;

  const storageListeners = new Set();
  const messageListeners = new Set();

  function getInitialDocs() {
    return [
      {
        id: 'doc_st_01',
        title: 'Kinh Tế Vi Mô - Đề Thi & Lời Giải Chi Tiết 2025',
        canonicalUrl: 'https://www.studocu.com/document/kinh-te-vi-mo-de-thi-loi-giai-chi-tiet-2025',
        platform: 'studocu',
        pageCount: 6,
        lastOpenedAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        isStarred: true
      },
      {
        id: 'doc_sc_01',
        title: 'English for Everyday Activities - Complete Study Guide',
        canonicalUrl: 'https://www.scribd.com/doc/english-for-everyday-activities',
        platform: 'scribd',
        pageCount: 5,
        lastOpenedAt: Date.now() - 2 * 3600 * 1000, // 2 hours ago
        isStarred: false
      },
      {
        id: 'doc_st_02',
        title: 'Toán Cao Cấp C1 - Giải Tích Đa Biến & Bài Tập',
        canonicalUrl: 'https://www.studocu.com/document/toan-cao-cap-c1-giai-tich-da-bien',
        platform: 'studocu',
        pageCount: 18,
        lastOpenedAt: Date.now() - 24 * 3600 * 1000, // 1 day ago
        isStarred: false
      },
      {
        id: 'doc_sc_02',
        title: 'Financial Management & Capital Structure Analysis',
        canonicalUrl: 'https://www.scribd.com/doc/financial-management-capital-structure',
        platform: 'scribd',
        pageCount: 35,
        lastOpenedAt: Date.now() - 3 * 24 * 3600 * 1000, // 3 days ago
        isStarred: true
      }
    ];
  }

  const initialLocalStorage = {
    lang: 'vi',
    isFirstRun: false,
    hasSeenPrintTip: true,
    dc_lab_mode: false,
    dc_recent_docs: getInitialDocs()
  };

  let localData = Object.assign({}, initialLocalStorage);
  try {
    const saved = window.localStorage.getItem('dc_mock_storage_local');
    if (saved) {
      const parsed = JSON.parse(saved);
      localData = Object.assign({}, initialLocalStorage, parsed);
    }
  } catch (e) {}

  let sessionData = {
    session_docs: []
  };

  function persistLocal() {
    try {
      window.localStorage.setItem('dc_mock_storage_local', JSON.stringify(localData));
    } catch (e) {}
  }

  function createStorageArea(dataStore, areaName, persistFn) {
    return {
      get: function (keys, callback) {
        return new Promise((resolve) => {
          let result = {};
          if (keys === null || typeof keys === 'undefined') {
            result = Object.assign({}, dataStore);
          } else if (typeof keys === 'string') {
            if (keys in dataStore && dataStore[keys] !== undefined) {
              result[keys] = dataStore[keys];
            }
          } else if (Array.isArray(keys)) {
            keys.forEach((k) => {
              if (typeof k === 'string' && k in dataStore && dataStore[k] !== undefined) {
                result[k] = dataStore[k];
              }
            });
          } else if (typeof keys === 'object') {
            for (const k in keys) {
              result[k] = (k in dataStore && dataStore[k] !== undefined) ? dataStore[k] : keys[k];
            }
          }
          if (typeof callback === 'function') callback(result);
          resolve(result);
        });
      },
      set: function (items, callback) {
        return new Promise((resolve) => {
          const changes = {};
          for (const key in items) {
            const oldValue = dataStore[key];
            const newValue = items[key];
            dataStore[key] = newValue;
            changes[key] = { oldValue, newValue };
          }
          if (persistFn) persistFn();

          for (const listener of storageListeners) {
            try {
              listener(changes, areaName);
            } catch (e) {
              console.error('[mock-chrome] storage listener error:', e);
            }
          }
          if (typeof callback === 'function') callback();
          resolve();
        });
      },
      remove: function (keys, callback) {
        return new Promise((resolve) => {
          const changes = {};
          const keyList = Array.isArray(keys) ? keys : [keys];
          keyList.forEach((k) => {
            if (k in dataStore) {
              const oldValue = dataStore[k];
              delete dataStore[k];
              changes[k] = { oldValue, newValue: undefined };
            }
          });
          if (persistFn) persistFn();

          for (const listener of storageListeners) {
            try {
              listener(changes, areaName);
            } catch (e) {}
          }
          if (typeof callback === 'function') callback();
          resolve();
        });
      },
      clear: function (callback) {
        return new Promise((resolve) => {
          const changes = {};
          for (const k in dataStore) {
            changes[k] = { oldValue: dataStore[k], newValue: undefined };
            delete dataStore[k];
          }
          if (persistFn) persistFn();

          for (const listener of storageListeners) {
            try {
              listener(changes, areaName);
            } catch (e) {}
          }
          if (typeof callback === 'function') callback();
          resolve();
        });
      }
    };
  }

  const localStorageArea = createStorageArea(localData, 'local', persistLocal);
  const sessionStorageArea = createStorageArea(sessionData, 'session', null);

  const storageOnChanged = {
    addListener: function (fn) {
      if (typeof fn === 'function') storageListeners.add(fn);
    },
    removeListener: function (fn) {
      storageListeners.delete(fn);
    },
    hasListener: function (fn) {
      return storageListeners.has(fn);
    }
  };

  const runtimeOnMessage = {
    addListener: function (fn) {
      if (typeof fn === 'function') messageListeners.add(fn);
    },
    removeListener: function (fn) {
      messageListeners.delete(fn);
    },
    hasListener: function (fn) {
      return messageListeners.has(fn);
    }
  };

  const runtime = {
    lastError: null,
    onMessage: runtimeOnMessage,
    sendMessage: function (message, callback) {
      return new Promise((resolve) => {
        let responseSent = false;
        const sendResponse = (res) => {
          if (!responseSent) {
            responseSent = true;
            if (typeof callback === 'function') callback(res);
            resolve(res);
          }
        };

        if (message && message.action === 'RECORD_RECENT_DOC' && message.doc) {
          const doc = message.doc;
          let docs = Array.isArray(localData.dc_recent_docs) ? localData.dc_recent_docs : [];
          const existing = docs.find((d) => d && (d.id === doc.id || d.canonicalUrl === doc.canonicalUrl));
          const isStarred = existing ? Boolean(existing.isStarred) : Boolean(doc.isStarred);
          docs = docs.filter((d) => d && d.id !== doc.id && d.canonicalUrl !== doc.canonicalUrl);
          docs.unshift({ ...(existing || {}), ...doc, isStarred });
          if (docs.length > 25) docs = docs.slice(0, 25);
          localStorageArea.set({ dc_recent_docs: docs }).then(() => {
            sendResponse({ success: true, count: docs.length });
          });
          return;
        }

        if (message && message.action === 'PURGE_TRANSIENT_MEMORY') {
          sessionStorageArea.set({ session_docs: [] }).then(() => {
            sendResponse({ success: true });
          });
          return;
        }

        let asyncResponse = false;
        for (const listener of messageListeners) {
          try {
            const result = listener(message, { id: 'mock-extension-id' }, sendResponse);
            if (result === true) asyncResponse = true;
          } catch (e) {
            console.error('[mock-chrome] onMessage listener error:', e);
          }
        }
        if (!asyncResponse && !responseSent) sendResponse({ ok: true });
      });
    },
    getURL: function (path) {
      return '/' + String(path || '').replace(/^\/+/, '');
    }
  };

  const tabs = {
    query: function (queryInfo, callback) {
      return new Promise((resolve) => {
        const currentTab = {
          id: 101,
          index: 0,
          active: true,
          currentWindow: true,
          url: window.location.href,
          title: document.title,
          status: 'complete'
        };
        const tabsList = [currentTab];
        if (typeof callback === 'function') callback(tabsList);
        resolve(tabsList);
      });
    },
    create: function (createProperties, callback) {
      return new Promise((resolve) => {
        const url = createProperties.url || '';
        const newTab = {
          id: Math.floor(Math.random() * 1000) + 200,
          url: url,
          active: createProperties.active !== false
        };
        console.log('[mock-chrome] tabs.create:', url);
        if (typeof callback === 'function') callback(newTab);
        resolve(newTab);
      });
    },
    reload: function (tabId, reloadProperties, callback) {
      return new Promise((resolve) => {
        if (typeof callback === 'function') callback();
        resolve();
      });
    },
    sendMessage: function (tabId, message, callback) {
      return runtime.sendMessage(message, callback);
    }
  };

  const scripting = {
    executeScript: function (injection, callback) {
      return new Promise((resolve) => {
        let result = null;
        if (typeof injection.func === 'function') {
          try {
            result = injection.func.apply(null, injection.args || []);
          } catch (e) {
            console.error('[mock-chrome] executeScript error:', e);
          }
        }
        const response = [{ result }];
        if (typeof callback === 'function') callback(response);
        resolve(response);
      });
    }
  };

  const cookies = {
    getAll: function (details, callback) {
      return new Promise((resolve) => {
        const cookiesList = [];
        if (typeof callback === 'function') callback(cookiesList);
        resolve(cookiesList);
      });
    },
    remove: function (details, callback) {
      return new Promise((resolve) => {
        const res = { url: details.url, name: details.name };
        if (typeof callback === 'function') callback(res);
        resolve(res);
      });
    }
  };

  // Safe window.print interception to prevent blocking print modal in automation
  if (!window.__dc_native_print) {
    window.__dc_native_print = window.print;
    window.print = function () {
      console.log('[mock-chrome] window.print() intercepted for test/automation capture.');
      window.__dc_last_printed_at = Date.now();
    };
  }

  // Reset helper for testing and demo inspection
  root.__resetMockStorage = function () {
    localData = Object.assign({}, initialLocalStorage, { dc_recent_docs: getInitialDocs() });
    try {
      window.localStorage.removeItem('dc_mock_storage_local');
    } catch (e) {}
    localStorageArea.set(localData).then(() => {
      if (typeof root.location?.reload === 'function') root.location.reload();
    });
  };

  root.chrome = {
    storage: {
      local: localStorageArea,
      session: sessionStorageArea,
      onChanged: storageOnChanged
    },
    runtime: runtime,
    tabs: tabs,
    scripting: scripting,
    cookies: cookies
  };

  console.log('[mock-chrome] Chrome API shim initialized successfully.');
})(typeof globalThis !== 'undefined' ? globalThis : window);
