/**
 * DocCleaner Test Harness
 * Comprehensive mock environment for Chrome Extension APIs and DOM in Node.js
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

/**
 * Creates a complete mock Chrome Extension API environment
 */
function createMockChrome(initialState = {}) {
  const localStore = new Map(Object.entries(initialState.local || {}));
  const sessionStore = new Map(Object.entries(initialState.session || {}));
  const changeListeners = [];
  const messageListeners = [];
  const tabUpdateListeners = [];
  const windowRemovedListeners = [];
  const historyStateUpdatedListeners = [];
  const beforeNavigateListeners = [];
  const installedListeners = [];
  let uninstallUrl = '';

  const cookiesList = [...(initialState.cookies || [
    { domain: 'studocu.com', name: 'session_id', path: '/', secure: true, storeId: '0' },
    { domain: '.studocu.com', name: 'token', path: '/', secure: true, storeId: '0' },
    { domain: 'studocu.vn', name: 'user_auth', path: '/', secure: true, storeId: '0' },
    { domain: 'scribd.com', name: 'scribd_sess', path: '/', secure: true, storeId: '0' },
    { domain: 'other.com', name: 'other_cookie', path: '/', secure: true, storeId: '0' }
  ])];

  const storageApi = (store, areaName) => ({
    get: async (keys) => {
      const result = {};
      if (!keys) {
        for (const [k, v] of store.entries()) {
          result[k] = structuredClone(v);
        }
        return result;
      }
      if (typeof keys === 'string') {
        if (store.has(keys)) result[keys] = structuredClone(store.get(keys));
        return result;
      }
      if (Array.isArray(keys)) {
        for (const k of keys) {
          if (store.has(k)) result[k] = structuredClone(store.get(k));
        }
        return result;
      }
      if (typeof keys === 'object') {
        for (const [k, defaultVal] of Object.entries(keys)) {
          result[k] = store.has(k) ? structuredClone(store.get(k)) : defaultVal;
        }
        return result;
      }
      return result;
    },
    set: async (items) => {
      const changes = {};
      for (const [k, v] of Object.entries(items)) {
        const oldValue = store.has(k) ? store.get(k) : undefined;
        store.set(k, structuredClone(v));
        changes[k] = { oldValue, newValue: structuredClone(v) };
      }
      for (const listener of changeListeners) {
        try {
          listener(changes, areaName);
        } catch (e) {
          console.error('Error in storage onChanged listener:', e);
        }
      }
    },
    remove: async (keys) => {
      const keyList = Array.isArray(keys) ? keys : [keys];
      const changes = {};
      for (const k of keyList) {
        if (store.has(k)) {
          const oldValue = store.get(k);
          store.delete(k);
          changes[k] = { oldValue, newValue: undefined };
        }
      }
      for (const listener of changeListeners) {
        try {
          listener(changes, areaName);
        } catch (e) {
          console.error('Error in storage onChanged listener:', e);
        }
      }
    },
    clear: async () => {
      const changes = {};
      for (const [k, v] of store.entries()) {
        changes[k] = { oldValue: v, newValue: undefined };
      }
      store.clear();
      for (const listener of changeListeners) {
        try {
          listener(changes, areaName);
        } catch (e) {
          console.error('Error in storage onChanged listener:', e);
        }
      }
    },
    _rawStore: store
  });

  const chromeMock = {
    storage: {
      local: storageApi(localStore, 'local'),
      session: storageApi(sessionStore, 'session'),
      onChanged: {
        addListener: (fn) => changeListeners.push(fn),
        dispatch: (changes, area) => changeListeners.forEach((fn) => fn(changes, area))
      }
    },
    runtime: {
      getManifest: () => {
        try {
          const manifestPath = path.resolve(__dirname, '../manifest.json');
          if (fs.existsSync(manifestPath)) {
            return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          }
        } catch (e) {}
        return { version: '1.8.0', manifest_version: 3 };
      },
      getURL: (filePath) => `chrome-extension://doccleaner-mock-id/${filePath}`,
      setUninstallURL: async (url) => {
        uninstallUrl = url;
      },
      getUninstallURL: () => uninstallUrl,
      onInstalled: {
        addListener: (fn) => installedListeners.push(fn),
        dispatch: (details) => installedListeners.forEach((fn) => fn(details))
      },
      onMessage: {
        addListener: (fn) => messageListeners.push(fn),
        dispatch: async (message, sender = {}) => {
          for (const listener of messageListeners) {
            let responded = false;
            let responseData = undefined;
            const sendResponse = (res) => {
              responded = true;
              responseData = res;
            };
            const result = listener(message, sender, sendResponse);
            if (result === true) {
              // Wait for async response if a promise is returned or sendResponse is called
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            if (responded) return responseData;
          }
        }
      },
      sendMessage: async (message) => {
        return chromeMock.runtime.onMessage.dispatch(message);
      }
    },
    tabs: {
      _tabs: [
        { id: 1, url: 'https://www.studocu.com/en/document/test-doc/12345', active: true },
        { id: 2, url: 'https://www.scribd.com/doc/998877/test-book', active: false }
      ],
      query: async (queryInfo) => {
        return chromeMock.tabs._tabs.filter((t) => {
          if (queryInfo.active !== undefined && t.active !== queryInfo.active) return false;
          return true;
        });
      },
      create: async (props) => {
        const newTab = { id: chromeMock.tabs._tabs.length + 1, ...props, active: true };
        chromeMock.tabs._tabs.push(newTab);
        return newTab;
      },
      sendMessage: async (tabId, message) => {
        return { status: 'PURGED' };
      },
      onUpdated: {
        addListener: (fn) => tabUpdateListeners.push(fn),
        dispatch: (tabId, changeInfo, tab) => tabUpdateListeners.forEach((fn) => fn(tabId, changeInfo, tab))
      }
    },
    cookies: {
      cookies: cookiesList,
      getAll: async ({ domain }) => {
        if (!domain) return [...cookiesList];
        const cleanDomain = domain.startsWith('.') ? domain.substring(1) : domain;
        return cookiesList.filter((c) => {
          const cookieDomain = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
          return cookieDomain === cleanDomain || cookieDomain.endsWith(`.${cleanDomain}`) || cleanDomain.endsWith(`.${cookieDomain}`);
        });
      },
      remove: async ({ url, name, storeId }) => {
        const idx = cookiesList.findIndex((c) => {
          if (c.name !== name) return false;
          if (storeId && c.storeId !== storeId) return false;
          return url.includes(c.domain.replace(/^\./, ''));
        });
        if (idx !== -1) {
          const removed = cookiesList.splice(idx, 1)[0];
          return { url, name, storeId: removed.storeId };
        }
        return null;
      },
      set: async (cookie) => {
        cookiesList.push(cookie);
        return cookie;
      }
    },
    windows: {
      onRemoved: {
        addListener: (fn) => windowRemovedListeners.push(fn),
        dispatch: (windowId) => windowRemovedListeners.forEach((fn) => fn(windowId))
      }
    },
    webNavigation: {
      onBeforeNavigate: {
        addListener: (fn) => beforeNavigateListeners.push(fn),
        dispatch: (details) => beforeNavigateListeners.forEach((fn) => fn(details))
      },
      onHistoryStateUpdated: {
        addListener: (fn) => historyStateUpdatedListeners.push(fn),
        dispatch: (details) => historyStateUpdatedListeners.forEach((fn) => fn(details))
      }
    },
    scripting: {
      executeScript: async ({ target, func, args }) => {
        if (typeof func === 'function') {
          return [{ result: func(...(args || [])) }];
        }
        return [{ result: null }];
      }
    }
  };

  return chromeMock;
}

/**
 * Creates a lightweight Mock Element and DOM structure
 */
class MockElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.attributes = {};
    this.children = [];
    this.parentElement = null;
    this.listeners = {};
    this.style = {};
    this._innerText = '';
    this._innerHTML = '';
  }

  get id() {
    return this.attributes.id || '';
  }
  set id(val) {
    this.attributes.id = val;
  }

  get className() {
    return this.attributes.class || '';
  }
  set className(val) {
    this.attributes.class = val;
  }

  get classList() {
    return {
      add: (...classes) => {
        const current = (this.attributes.class || '').split(/\s+/).filter(Boolean);
        for (const cls of classes) {
          if (!current.includes(cls)) current.push(cls);
        }
        this.attributes.class = current.join(' ');
      },
      remove: (...classes) => {
        let current = (this.attributes.class || '').split(/\s+/).filter(Boolean);
        current = current.filter((cls) => !classes.includes(cls));
        this.attributes.class = current.join(' ');
      },
      contains: (cls) => {
        const current = (this.attributes.class || '').split(/\s+/).filter(Boolean);
        return current.includes(cls);
      },
      toggle: (cls, force) => {
        const has = this.classList.contains(cls);
        if (force === true || (force === undefined && !has)) {
          this.classList.add(cls);
          return true;
        } else {
          this.classList.remove(cls);
          return false;
        }
      }
    };
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  hasAttribute(name) {
    return this.attributes[name] !== undefined;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentElement = null;
    }
    return child;
  }

  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  get innerText() {
    if (this._innerText) return this._innerText;
    return this.children.map((c) => c.innerText || '').join(' ').trim();
  }

  set innerText(text) {
    this._innerText = String(text);
    this.children = [];
  }

  get textContent() {
    return this.innerText;
  }

  set textContent(text) {
    this.innerText = text;
  }

  get innerHTML() {
    return this._innerHTML || this._innerText;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((l) => l !== fn);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    event.target = this;
    for (const fn of list) {
      fn.call(this, event);
    }
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, defaultPrevented: false });
  }

  matches(selector) {
    const trimmed = selector.trim();
    if (trimmed.startsWith('#')) {
      return this.id === trimmed.substring(1);
    }
    if (trimmed.startsWith('.')) {
      return this.classList.contains(trimmed.substring(1));
    }
    // Attribute selector e.g. [data-lang="vi"], [data-page-index], h1[data-qa="document-title"]
    const attrMatch = trimmed.match(/^([a-zA-Z0-9_-]*)\[([a-zA-Z0-9_:-]+)(?:([*^$]?=)(["']?)([^"']*)\4)?\]$/);
    if (attrMatch) {
      const [, tag, attr, op, , val] = attrMatch;
      if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
      if (!this.hasAttribute(attr)) return false;
      if (val === undefined) return true;
      const attrVal = this.getAttribute(attr);
      if (!op || op === '=') return attrVal === val;
      if (op === '*=') return attrVal.includes(val);
      if (op === '^=') return attrVal.startsWith(val);
      if (op === '$=') return attrVal.endsWith(val);
    }
    // Tag selector
    return this.tagName.toLowerCase() === trimmed.toLowerCase();
  }

  querySelector(selector) {
    const selectors = selector.split(',').map((s) => s.trim());
    for (const sel of selectors) {
      const match = this._findFirst(sel);
      if (match) return match;
    }
    return null;
  }

  querySelectorAll(selector) {
    const selectors = selector.split(',').map((s) => s.trim());
    const results = [];
    for (const sel of selectors) {
      this._findAll(sel, results);
    }
    return results;
  }

  _findFirst(sel) {
    for (const child of this.children) {
      if (child.matches(sel)) return child;
      const found = child._findFirst(sel);
      if (found) return found;
    }
    return null;
  }

  _findAll(sel, acc) {
    for (const child of this.children) {
      if (child.matches(sel) && !acc.includes(child)) acc.push(child);
      child._findAll(sel, acc);
    }
  }
}

/**
 * Creates a complete mock DOM environment with window and document
 */
function createMockDOM(options = {}) {
  const url = options.url || 'https://www.studocu.com/en/document/harvard-university/microeconomics/sample-doc/12345';
  const parsedUrl = new URL(url);

  const listeners = {};
  const doc = {
    title: options.title || 'DocCleaner Mock Document',
    head: null,
    body: null,
    documentElement: { lang: 'en' },
    createElement: (tag) => new MockElement(tag, doc),
    getElementById: (id) => {
      const inBody = doc.body.querySelector(`#${id}`);
      if (inBody) return inBody;
      return doc.head.querySelector(`#${id}`);
    },
    querySelector: (sel) => {
      if (sel === 'head') return doc.head;
      if (sel === 'body' || sel === 'html') return doc.body;
      return doc.head.querySelector(sel) || doc.body.querySelector(sel);
    },
    querySelectorAll: (sel) => {
      const fromHead = doc.head.querySelectorAll(sel);
      const fromBody = doc.body.querySelectorAll(sel);
      return [...fromHead, ...fromBody];
    },
    addEventListener: (type, fn) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    removeEventListener: (type, fn) => {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter((l) => l !== fn);
    },
    dispatchEvent: (event) => {
      const list = listeners[event.type] || [];
      for (const fn of list) fn(event);
    }
  };

  doc.head = new MockElement('head', doc);
  doc.body = new MockElement('body', doc);

  const windowMock = {
    document: doc,
    location: {
      href: parsedUrl.href,
      origin: parsedUrl.origin,
      pathname: parsedUrl.pathname,
      hostname: parsedUrl.hostname,
      search: parsedUrl.search,
      hash: parsedUrl.hash
    },
    history: {
      pushState: (state, title, newUrl) => {
        if (newUrl) {
          const resolved = new URL(newUrl, windowMock.location.href);
          windowMock.location.href = resolved.href;
          windowMock.location.origin = resolved.origin;
          windowMock.location.pathname = resolved.pathname;
          windowMock.location.hostname = resolved.hostname;
        }
      },
      replaceState: (state, title, newUrl) => {
        windowMock.history.pushState(state, title, newUrl);
      }
    },
    addEventListener: (type, fn) => doc.addEventListener(type, fn),
    removeEventListener: (type, fn) => doc.removeEventListener(type, fn),
    dispatchEvent: (event) => doc.dispatchEvent(event),
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    },
    Event: class Event {
      constructor(type) {
        this.type = type;
      }
    },
    URL,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    MutationObserver: class MockMutationObserver {
      constructor(callback) { this.callback = callback; }
      observe(target, options) {}
      disconnect() {}
      takeRecords() { return []; }
    },
    console
  };

  return { document: doc, window: windowMock };
}

/**
 * Runs a JavaScript file or script in a clean isolated Node VM sandbox
 */
function runInSandbox(scriptPathOrCode, sandbox = {}, isCode = false) {
  let code = scriptPathOrCode;
  if (!isCode) {
    const fullPath = path.isAbsolute(scriptPathOrCode)
      ? scriptPathOrCode
      : path.resolve(__dirname, '..', scriptPathOrCode);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Script file not found: ${fullPath}`);
    }
    code = fs.readFileSync(fullPath, 'utf8');
  }

  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    URL,
    URLSearchParams,
    MutationObserver: class MockMutationObserver {
      constructor(callback) { this.callback = callback; }
      observe(target, options) {}
      disconnect() {}
      takeRecords() { return []; }
    },
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Promise,
    Map,
    Set,
    ...sandbox
  });

  vm.runInContext(code, context);
  return context;
}

module.exports = {
  createMockChrome,
  createMockDOM,
  MockElement,
  runInSandbox,
  assert
};
