/* ═══════════════════════════════════════════════════════════
   BranZar v9.17.0 — core.js
   Layer 1: Config + Utils + Security + Fingerprint + Cache
            + Firebase + Dexie (IndexedDB) + Auth + State
   ✅ v9.17.0: Full store-rename support across Dexie layer
                - _bzrMillis() helper for Timestamp normalization
                - dexieBulkUpsertProducts auto-fills missing store_id
                - dexieGetProductsByStore uses numeric sort
                - dexieGetRecentProducts with safe fallback
                - __bzrHandleStoreRename() global helper
                - Duplicate-name detection in v3 migration
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ CONFIG ═══ */
const CONFIG = Object.freeze({
  PRODUCTS_PER_PAGE: 8,
  STORE_PRODUCTS_PER_PAGE: 20,
  STORE_ADDITIONAL_CATEGORY_PER_PAGE: 16,
  MAIN_CATEGORY_MAX_PRODUCTS: 15,
  ADDITIONAL_CATEGORY_MAX_PRODUCTS: 50,
  SEARCH_CAP: 800,
  SEARCH_DEBOUNCE_MS: 200,
  PRODUCT_DESCRIPTION_MAX: 100,
  CACHE_TTL_STORES: 10 * 60 * 1000,
  CACHE_TTL_PRODUCTS: 30 * 60 * 1000,
  CACHE_TTL_CATEGORIES: 30 * 60 * 60 * 1000,
  CACHE_PREFIX: 'branzar_cache_',
  CACHE_MAX_KEYS: 15,
  AUTO_SCROLL_RESUME: 5000,
  AUTO_SCROLL_INTERVAL: 32,
  SCROLL_STEP: 0.9,
  PRODUCTS_REFRESH_INTERVAL_MS: 60 * 60 * 1000,
  STORES_REFRESH_INTERVAL_MS: 30 * 60 * 1000,
  UPDATE_CHECK_INTERVAL_MS: 30 * 60 * 1000,
  UPDATE_CHECK_THROTTLE_MS: 10 * 60 * 1000,
  NOTIF_DISMISS_DAYS: 7,
  HAPTIC: { light: 8, medium: 15, heavy: [20, 30, 20] },
  VAPID: "BMwiHlrJ0w3ElDwAUgza1CPpKGS2JG6uabbYEITwwdZtb17cHndUcos7s9627B1NPtcb_LAZd5hLhdrACGegdOw",
  FIXED_WHATSAPP: "249908280115",
  DEFAULT_OG_IMAGE: "https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png",
  FP_STORAGE_KEY: 'branzar_device_id_v2',
  FP_COOKIE_NAME: 'bzr_did_v2',
  FP_IDB_NAME: 'branzar_idb',
  FP_IDB_STORE: 'device_store',
  FOLLOW_COOLDOWN_MS: 1500,
  RATE_MAX_PER_MINUTE: 30,
  RATE_MAX_PER_DAY: 2000,
  FOLLOW_MIN_GAP_MS: 2000,
  FOLLOW_PER_STORE_GAP_MS: 5000,
  FOLLOW_MAX_PER_MINUTE: 6,
  FOLLOW_MAX_PER_HOUR: 30,
  FOLLOW_MAX_PER_DAY: 100,
  FOLLOW_TOGGLE_BURST_LIMIT: 3,
  FOLLOW_TOGGLE_BURST_WINDOW_MS: 5 * 60 * 1000,
  FOLLOW_STRIKE_THRESHOLD: 3,
  FOLLOW_STRIKE_BLOCK_MS: 5 * 60 * 1000,
  FOLLOW_LONG_BLOCK_MS: 30 * 60 * 1000
});

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDUfiHqBPQuFKrsHxoSDdR0j7DMvekfYiA",
  authDomain: "bazarena-725e4.firebaseapp.com",
  databaseURL: "https://bazarena-725e4-default-rtdb.firebaseio.com",
  projectId: "bazarena-725e4",
  storageBucket: "bazarena-725e4.firebasestorage.app",
  messagingSenderId: "977750898059",
  appId: "1:977750898059:web:247e8513b48490ed622b8e",
  measurementId: "G-JFL1RLKST6"
};

const KEYS = Object.freeze({
  THEME: 'branzar_theme',
  VIEW: 'branzar_view_mode',
  CART: 'myStoresCart',
  FOLLOWED: 'branzarFollowedStores',
  FAVS: 'branzarProductFavs',
  FCM_TOKEN: 'branzarFcmToken',
  NOTIF_DISMISS: 'branzarNotifDismissed',
  VISITED: 'branzarVisitedBefore',
  INSTALLED: 'branzarInstalled',
  FOLLOW_DAILY: 'branzar_follow_daily_stats'
});

const VERIFIED_BADGE_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true"><path fill="#1877F2" d="M12 1l2.35 2.05 3.09-.41 1.13 2.92 2.92 1.13-.41 3.09L23 12l-2.05 2.35.41 3.09-2.92 1.13-1.13 2.92-3.09-.41L12 23l-2.35-2.05-3.09.41-1.13-2.92-2.92-1.13.41-3.09L1 12l2.05-2.35-.41-3.09 2.92-1.13 1.13-2.92 3.09.41L12 1z"/><path fill="#fff" d="M10.6 16.2l-3.8-3.8 1.4-1.4 2.4 2.4 6-6 1.4 1.4z"/></svg>';

/* ═══ Currency Normalization ═══ */
(function initCurrencyNormalizer() {
  var LEGACY = { 'ج.س': 'SDG', 'ج.س.': 'SDG', 'جنيه': 'SDG', 'جنية': 'SDG', 'sdg': 'SDG', 'usd': 'USD' };
  function normalize(sym) {
    if (!sym) return null;
    var s = String(sym).trim();
    if (LEGACY[s]) return LEGACY[s];
    var lower = s.toLowerCase();
    for (var k in LEGACY) { if (LEGACY.hasOwnProperty(k) && k.toLowerCase() === lower) return LEGACY[k]; }
    return s;
  }
  window.BZR_LEGACY_SYMBOLS = LEGACY;
  window.bzrNormalizeCurrencySymbol = normalize;
})();

/* ═══ UTILS ═══ */
function sanitizeHTML(str) { if (!str) return ''; const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function safeHex(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s;
  if (/^rgb(a)?\([0-9,\s.%]+\)$/.test(s)) return s;
  return null;
}
function haptic(type = 'light') { if (!('vibrate' in navigator)) return; try { navigator.vibrate(CONFIG.HAPTIC[type] || CONFIG.HAPTIC.light); } catch(e){} }
function debounce(fn, wait) {
  let t = null;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
}
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/upload/q_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/');
}
function truncateText(text, max) {
  if (text == null) return '';
  const str = String(text).trim();
  if (!max || max <= 0) return str;
  return str.length <= max ? str : str.slice(0, max);
}

/* ✅ v9.17.0 — Normalize Firestore Timestamp/Date/number/string to milliseconds */
function _bzrMillis(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') { const n = Number(v); return isNaN(n) ? 0 : n; }
  if (typeof v === 'object') {
    if (typeof v.toMillis === 'function') { try { return v.toMillis(); } catch(e){} }
    if (typeof v.seconds === 'number') return v.seconds * 1000;
    if (v instanceof Date) return v.getTime();
  }
  return 0;
}
window._bzrMillis = _bzrMillis;

/* ═══ RATE LIMITER ═══ */
const RateLimiter = {
  _counts: {}, _lastReset: Date.now(),
  canRequest(type = 'default') {
    const now = Date.now();
    if (now - this._lastReset > 60000) { this._counts = {}; this._lastReset = now; }
    const key = 'r_' + type;
    this._counts[key] = (this._counts[key] || 0) + 1;
    if (this._counts[key] > CONFIG.RATE_MAX_PER_MINUTE) { console.warn('[BZR] Rate limit:', type); return false; }
    try {
      const dayKey = 'bzr_daily_' + new Date().toDateString();
      const daily = parseInt(localStorage.getItem(dayKey) || '0') + 1;
      localStorage.setItem(dayKey, daily.toString());
      if (daily > CONFIG.RATE_MAX_PER_DAY) { console.warn('[BZR] Daily limit'); return false; }
    } catch(e){}
    return true;
  }
};

/* ═══ FOLLOW GUARD ═══ */
const FollowGuard = {
  _actionHistory: [], _perStoreLastAction: {}, _perStoreToggleCount: {},
  _sessionCount: 0, _dailyCount: 0, _dailyResetDate: '', _blockedUntil: 0, _strikes: 0,
  init() {
    try {
      const raw = localStorage.getItem(KEYS.FOLLOW_DAILY); if (!raw) return;
      const data = JSON.parse(raw); const today = new Date().toDateString();
      if (data && data.date === today) { this._dailyCount = parseInt(data.count) || 0; this._dailyResetDate = today; }
      else { this._dailyCount = 0; this._dailyResetDate = today; }
    } catch(e) { this._dailyCount = 0; }
  },
  _saveDailyCount() { try { localStorage.setItem(KEYS.FOLLOW_DAILY, JSON.stringify({ date: this._dailyResetDate || new Date().toDateString(), count: this._dailyCount })); } catch(e){} },
  _ensureDailyReset() { const today = new Date().toDateString(); if (this._dailyResetDate !== today) { this._dailyCount = 0; this._dailyResetDate = today; this._saveDailyCount(); } },
  _addStrike(reason) {
    this._strikes++; console.warn('[BZR] Strike #' + this._strikes + ':', reason);
    if (this._strikes >= CONFIG.FOLLOW_STRIKE_THRESHOLD) {
      const d = this._strikes >= 6 ? CONFIG.FOLLOW_LONG_BLOCK_MS : CONFIG.FOLLOW_STRIKE_BLOCK_MS;
      this._blockedUntil = Date.now() + d; this._strikes = 0;
    }
  },
  canFollow(storeId) {
    const now = Date.now(); this._ensureDailyReset();
    if (this._blockedUntil > now) return { allowed: false, reason: 'blocked', remaining: this._blockedUntil - now, message: '⛔ تم حظر المتابعة مؤقتاً — حاول بعد ' + Math.ceil((this._blockedUntil - now) / 60000) + ' دقيقة' };
    if (this._actionHistory.length > 0) {
      const last = this._actionHistory[this._actionHistory.length - 1];
      if (now - last < CONFIG.FOLLOW_MIN_GAP_MS) return { allowed: false, reason: 'too_fast', remaining: CONFIG.FOLLOW_MIN_GAP_MS - (now - last), message: '⏳ انتظر لحظة' };
    }
    const lastForStore = this._perStoreLastAction[storeId] || 0;
    if (lastForStore > 0 && now - lastForStore < CONFIG.FOLLOW_PER_STORE_GAP_MS) { this._addStrike('rapid_same_store'); return { allowed: false, reason: 'same_store', remaining: CONFIG.FOLLOW_PER_STORE_GAP_MS - (now - lastForStore), message: '⏳ لا يمكن التبديل على نفس المتجر بسرعة' }; }
    const toggle = this._perStoreToggleCount[storeId] || { count: 0, windowStart: now };
    if (now - toggle.windowStart > CONFIG.FOLLOW_TOGGLE_BURST_WINDOW_MS) { toggle.count = 0; toggle.windowStart = now; }
    if (toggle.count >= CONFIG.FOLLOW_TOGGLE_BURST_LIMIT) { this._addStrike('toggle_burst'); this._addStrike('toggle_burst'); return { allowed: false, reason: 'toggle_burst', remaining: 0, message: '🚫 محاولات متكررة على نفس المتجر' }; }
    const minute = this._actionHistory.filter(t => now - t < 60000);
    if (minute.length >= CONFIG.FOLLOW_MAX_PER_MINUTE) { this._addStrike('rate_minute'); return { allowed: false, reason: 'rate_minute', remaining: 0, message: '🚫 محاولات كثيرة' }; }
    const hour = this._actionHistory.filter(t => now - t < 3600000);
    if (hour.length >= CONFIG.FOLLOW_MAX_PER_HOUR) { this._addStrike('rate_hour'); return { allowed: false, reason: 'rate_hour', remaining: 0, message: '🚫 تجاوزت الحد المسموح في الساعة' }; }
    if (this._dailyCount >= CONFIG.FOLLOW_MAX_PER_DAY) return { allowed: false, reason: 'daily_limit', remaining: 0, message: '🚫 وصلت للحد اليومي' };
    return { allowed: true };
  },
  recordAction(storeId) {
    const now = Date.now();
    this._actionHistory.push(now);
    this._actionHistory = this._actionHistory.filter(t => now - t < 3600000);
    this._perStoreLastAction[storeId] = now;
    const toggle = this._perStoreToggleCount[storeId] || { count: 0, windowStart: now };
    if (now - toggle.windowStart > CONFIG.FOLLOW_TOGGLE_BURST_WINDOW_MS) { toggle.count = 0; toggle.windowStart = now; }
    toggle.count++; this._perStoreToggleCount[storeId] = toggle;
    this._sessionCount++; this._dailyCount++; this._saveDailyCount();
  },
  isSuspiciousBot() { const now = Date.now(); return this._actionHistory.filter(t => now - t < 60000).length >= 5; }
};
FollowGuard.init();

/* ═══ DEVICE FINGERPRINT ═══ */
function fnv1a(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
async function sha256Hex(str) {
  if (window.crypto && crypto.subtle && crypto.subtle.digest) {
    try { const buf = new TextEncoder().encode(str); const hash = await crypto.subtle.digest('SHA-256', buf); return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''); } catch(e){}
  }
  return fnv1a(str) + fnv1a(str + '|s1') + fnv1a(str + '|s2') + fnv1a(str + '|s3');
}
function getCanvasFP() {
  try {
    const c = document.createElement('canvas'); c.width = 220; c.height = 30;
    const ctx = c.getContext('2d'); if (!ctx) return 'no-ctx';
    ctx.textBaseline = 'top'; ctx.font = '14px "Arial"';
    ctx.fillStyle = '#f60'; ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069'; ctx.fillText('BranZar🔒FP', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)'; ctx.fillText('BranZar🔒FP', 4, 17);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)'; ctx.beginPath(); ctx.arc(50, 50, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgb(0,255,255)'; ctx.beginPath(); ctx.arc(100, 50, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
    return c.toDataURL();
  } catch(e) { return 'canvas-error'; }
}
function getWebGLFP() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : 'no-v';
    const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'no-r';
    return [vendor, renderer, gl.getParameter(gl.VERSION) || '', gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '', gl.getParameter(gl.MAX_TEXTURE_SIZE) || ''].join('|');
  } catch(e) { return 'webgl-error'; }
}
function getAudioFP() {
  return new Promise((resolve) => {
    try {
      const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AC) return resolve('no-audio');
      const ctx = new AC(1, 44100, 44100);
      const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = 10000;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -50; comp.knee.value = 40; comp.ratio.value = 12; comp.attack.value = 0; comp.release.value = 0.25;
      osc.connect(comp); comp.connect(ctx.destination); osc.start(0);
      const timeout = setTimeout(() => resolve('audio-timeout'), 800);
      ctx.oncomplete = (e) => {
        clearTimeout(timeout);
        try { const buf = e.renderedBuffer.getChannelData(0); let sum = 0; for (let i = 4500; i < 5000; i++) sum += Math.abs(buf[i]); resolve('audio_' + sum.toFixed(6)); } catch(err) { resolve('audio-err'); }
      };
      ctx.startRendering();
    } catch(e) { resolve('audio-error'); }
  });
}
function getFontsFP() {
  try {
    if (!document.body) return 'no-body';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Tahoma', 'Comic Sans MS', 'Impact', 'Segoe UI', 'Roboto', 'Ubuntu', 'Noto Sans Arabic', 'Cairo'];
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;left:-9999px;top:-9999px;font-size:72px;visibility:hidden;';
    span.textContent = 'mmmmmmmmmmlli'; document.body.appendChild(span);
    const baseWidths = {}; baseFonts.forEach(bf => { span.style.fontFamily = bf; baseWidths[bf] = span.offsetWidth; });
    const detected = []; testFonts.forEach(font => { let found = false; for (let i = 0; i < baseFonts.length; i++) { span.style.fontFamily = '"' + font + '",' + baseFonts[i]; if (span.offsetWidth !== baseWidths[baseFonts[i]]) { found = true; break; } } if (found) detected.push(font); });
    document.body.removeChild(span); return detected.join(',');
  } catch(e) { return 'fonts-error'; }
}
async function computeDeviceFingerprint() {
  const audioFP = await getAudioFP();
  const components = ['screen:' + [Math.min(screen.width, screen.height), Math.max(screen.width, screen.height), screen.colorDepth, screen.pixelDepth].join('x'), 'cores:' + (navigator.hardwareConcurrency || 0), 'mem:' + (navigator.deviceMemory || 0), 'platform:' + (navigator.platform || ''), 'touch:' + (navigator.maxTouchPoints || 0), 'tz:' + (new Date().getTimezoneOffset()), 'lang:' + (navigator.language || ''), 'canvas:' + fnv1a(getCanvasFP()), 'webgl:' + fnv1a(getWebGLFP()), 'fonts:' + fnv1a(getFontsFP()), 'ua:' + navigator.userAgent, 'audio:' + audioFP, 'bzr-salt-v2-2025'];
  const hash = await sha256Hex(components.join('|||'));
  return 'fp_' + hash.substring(0, 40);
}
function readFP_localStorage() { try { return localStorage.getItem(CONFIG.FP_STORAGE_KEY); } catch(e){ return null; } }
function writeFP_localStorage(fp) { try { localStorage.setItem(CONFIG.FP_STORAGE_KEY, fp); return true; } catch(e){ return false; } }
function readFP_cookie() { try { const m = document.cookie.match(new RegExp('(?:^|; )' + CONFIG.FP_COOKIE_NAME + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : null; } catch(e){ return null; } }
function writeFP_cookie(fp) { try { const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(); document.cookie = CONFIG.FP_COOKIE_NAME + '=' + encodeURIComponent(fp) + '; expires=' + exp + '; path=/; SameSite=Lax; Secure'; return true; } catch(e){ return false; } }
function openFP_IDB() {
  return new Promise((resolve) => {
    try {
      if (!window.indexedDB) return resolve(null);
      const req = indexedDB.open(CONFIG.FP_IDB_NAME, 1);
      req.onupgradeneeded = () => { const d = req.result; if (!d.objectStoreNames.contains(CONFIG.FP_IDB_STORE)) d.createObjectStore(CONFIG.FP_IDB_STORE); };
      req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); req.onblocked = () => resolve(null);
    } catch(e) { resolve(null); }
  });
}
async function readFP_IDB() {
  try { const d = await openFP_IDB(); if (!d) return null; return new Promise((resolve) => { try { const tx = d.transaction(CONFIG.FP_IDB_STORE, 'readonly'); const req = tx.objectStore(CONFIG.FP_IDB_STORE).get(CONFIG.FP_STORAGE_KEY); req.onsuccess = () => resolve(req.result || null); req.onerror = () => resolve(null); } catch(e) { resolve(null); } }); } catch(e){ return null; }
}
async function writeFP_IDB(fp) {
  try { const d = await openFP_IDB(); if (!d) return false; return new Promise((resolve) => { try { const tx = d.transaction(CONFIG.FP_IDB_STORE, 'readwrite'); tx.objectStore(CONFIG.FP_IDB_STORE).put(fp, CONFIG.FP_STORAGE_KEY); tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); } catch(e) { resolve(false); } }); } catch(e){ return false; }
}
async function readFPFromAllStorage() { let fp = readFP_localStorage(); if (fp) return fp; fp = await readFP_IDB(); if (fp) return fp; fp = readFP_cookie(); if (fp) return fp; return null; }
async function saveFPToAllStorage(fp) { writeFP_localStorage(fp); writeFP_cookie(fp); await writeFP_IDB(fp); }
let _fpCache = null, _fpPromise = null;
async function getDeviceFingerprint() {
  if (_fpCache) return _fpCache;
  if (_fpPromise) return _fpPromise;
  _fpPromise = (async () => {
    try {
      const stored = await readFPFromAllStorage();
      if (stored && stored.indexOf('fp_') === 0) { _fpCache = stored; saveFPToAllStorage(stored).catch(() => {}); return stored; }
      const fp = await computeDeviceFingerprint(); _fpCache = fp; await saveFPToAllStorage(fp); return fp;
    } catch(e) { const fb = 'fp_fb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); _fpCache = fb; return fb; }
  })();
  return _fpPromise;
}

/* ═══ STATE ═══ */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem(KEYS.CART)) || [];
  if (Array.isArray(cart) && typeof window.bzrNormalizeCurrencySymbol === 'function') {
    var _cartMigrated = false;
    cart.forEach(function (it) { if (it && it.currency) { var norm = window.bzrNormalizeCurrencySymbol(it.currency); if (norm && norm !== it.currency) { it.currency = norm; _cartMigrated = true; } } });
    if (_cartMigrated) { try { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch(e){} }
  }
} catch(e){ cart = []; }

let stores = [], categories = [];
let currentCategory = null;
let currentStore = null, currentStoreId = null;
let currentFollowersCount = 0, isFollowing = false, isUpdatingFollow = false;
let allProductsLocal = [];
let lastVisibleDoc = null;
let hasMoreProducts = true;
let isLoadingProducts = false;
let productsLiveUnsubscribe = null;
let _productsFirstSyncDone = false;
let _isLoadingSmartProducts = false;
let allProductsUnsubscribe = null;
let storesPollInterval = null;
let storeProductsLastDoc = null;
let storeProductsHasMore = false;
let currentStoreNameForProducts = null;
let currentStoreCategoryForProducts = null;
let isPageVisible = !document.hidden;
let _followedCache = null, _favsCache = null;
let _followedFromServer = new Set();
let _lastFollowAction = 0;

/* ═══ FIREBASE ═══ */
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
try {
  db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    if (err && err.code === 'failed-precondition') console.warn('[BZR] Persistence: multi-tab');
    else if (err && err.code === 'unimplemented') console.warn('[BZR] Persistence: not supported');
  });
} catch(e){}

/* ═══════════════════════════════════════════════════════════
   🗄️ Dexie.js — Local IndexedDB Cache (v9.17.0)
   ═══════════════════════════════════════════════════════════ */
let bzrDB = null;

if (typeof Dexie !== 'undefined') {
  try {
    bzrDB = new Dexie('branzar_v1');
    bzrDB.version(1).stores({ stores: 'id, created_at, followers, category, name', meta: 'key' });
    bzrDB.version(2).stores({ stores: 'id, created_at, followers, category, name', meta: 'key', products: 'id, created_at, store_name, category' });

    // 🆕 v3: store_id index + migration with duplicate-name warning
    bzrDB.version(3).stores({
      stores: 'id, created_at, followers, category, name',
      meta: 'key',
      products: 'id, created_at, store_id, store_name, category'
    }).upgrade(async (tx) => {
      console.log('[BZR] Upgrading Dexie to v3: mapping store_name → store_id...');
      try {
        const allStores = await tx.table('stores').toArray();
        const nameCount = new Map();
        for (const s of allStores) { const n = String(s.name || '').trim(); if (n) nameCount.set(n, (nameCount.get(n) || 0) + 1); }
        const storeMap = new Map();
        for (const s of allStores) { const n = String(s.name || '').trim(); if (n && nameCount.get(n) === 1) storeMap.set(n, s.id); }
        const dupNames = Array.from(nameCount.entries()).filter(([, c]) => c > 1).map(([n]) => n);
        if (dupNames.length) console.warn('[BZR] ⚠️ Duplicate store names — products with these names will NOT be auto-migrated:', dupNames);
        await tx.table('products').toCollection().modify(product => {
          if (!product.store_id && product.store_name) {
            const cleanName = String(product.store_name).trim();
            if (storeMap.has(cleanName)) product.store_id = storeMap.get(cleanName);
          }
        });
        console.log('[BZR] Dexie migration v3 complete.');
      } catch (err) { console.warn('[BZR] Dexie migration warning:', err); }
    });

    bzrDB.open().then(() => console.log('[BZR] Dexie opened ✅ v3 (store_id indexed)')).catch((e) => console.warn('[BZR] Dexie open failed:', e));
  } catch (e) { console.warn('[BZR] Dexie init failed:', e); bzrDB = null; }
} else { console.warn('[BZR] ⚠️ Dexie.js not loaded.'); }

/* ═══ Dexie Helpers — Stores ═══ */
async function dexieBulkUpsertStores(list) {
  if (!bzrDB || !Array.isArray(list) || !list.length) return;
  try { const now = Date.now(); await bzrDB.stores.bulkPut(list.map(s => ({ ...s, _fetchedAt: now }))); } catch (e) { console.warn('[BZR] dexieBulkUpsertStores failed:', e); }
}
async function dexieGetAllStores() { if (!bzrDB) return []; try { return await bzrDB.stores.toArray(); } catch (e) { return []; } }
async function dexieGetMeta(key) { if (!bzrDB) return null; try { const row = await bzrDB.meta.get(key); return row ? row.value : null; } catch (e) { return null; } }
async function dexieSetMeta(key, value) { if (!bzrDB) return; try { await bzrDB.meta.put({ key, value }); } catch (e) {} }
async function dexieClearStores() { if (!bzrDB) return; try { await bzrDB.stores.clear(); } catch (e) {} }

/* ═══ 🆕 v9.17.0: Dexie Products Helpers ═══ */
async function dexieBulkUpsertProducts(list) {
  if (!bzrDB || !Array.isArray(list) || !list.length) return;
  try {
    const now = Date.now();
    // 🆕 Build name→id map from stores to fill missing store_id
    let nameToId = new Map();
    try {
      const allStores = await bzrDB.stores.toArray();
      for (const s of allStores) { const n = String(s.name || '').trim(); if (n && s.id) nameToId.set(n, s.id); }
    } catch (e) {}
    const normalized = list.map(p => {
      let sid = p.store_id || null;
      if (!sid && p.store_name) sid = nameToId.get(String(p.store_name).trim()) || null;
      return {
        ...p,
        store_id: sid || p.store_id || null,
        created_at: _bzrMillis(p.created_at),  // ✅ numeric for sorting
        _fetchedAt: now
      };
    });
    await bzrDB.products.bulkPut(normalized);
  } catch (e) { console.warn('[BZR] dexieBulkUpsertProducts failed:', e); }
}

async function dexieGetRecentProducts(limit) {
  if (!bzrDB) return [];
  const cap = Math.max(1, parseInt(limit) || 100);
  try {
    return await bzrDB.products.orderBy('created_at').reverse().limit(cap).toArray();
  } catch (e) {
    try {
      const arr = await bzrDB.products.toArray();
      arr.sort((a, b) => _bzrMillis(b.created_at) - _bzrMillis(a.created_at));
      return arr.slice(0, cap);
    } catch (e2) { return []; }
  }
}

async function dexieGetProductsByStore(storeId, limit) {
  if (!bzrDB || !storeId) return [];
  try {
    const arr = await bzrDB.products.where('store_id').equals(String(storeId)).toArray();
    arr.sort((a, b) => _bzrMillis(b.created_at) - _bzrMillis(a.created_at));
    return (limit && limit > 0) ? arr.slice(0, limit) : arr;
  } catch (e) { return []; }
}
async function dexieGetProductById(id) { if (!bzrDB || !id) return null; try { return await bzrDB.products.get(String(id)); } catch (e) { return null; } }
async function dexieClearProducts() { if (!bzrDB) return; try { await bzrDB.products.clear(); } catch (e) {} }
async function dexieCountProducts() { if (!bzrDB) return 0; try { return await bzrDB.products.count(); } catch (e) { return 0; } }

/* 🧹 Manual product cache clear */
window.__bzrClearProductsCache = async function () {
  try {
    await dexieClearProducts();
    cacheManager.remove('all_products_page1');
    _productsFirstSyncDone = false;
    console.log('[BZR] ✅ Products cache cleared.');
    return true;
  } catch (e) { return false; }
};

/* ═══ VISIBILITY ═══ */
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
  if (isPageVisible) {
    if (typeof startAutoScroll === 'function') startAutoScroll();
    if (typeof startCategoriesAutoScroll === 'function') startCategoriesAutoScroll();
  } else {
    if (typeof stopAutoScroll === 'function') stopAutoScroll();
    if (typeof stopCategoriesAutoScroll === 'function') stopCategoriesAutoScroll();
  }
}, { passive: true });

/* ═══ AUTH ═══ */
let authReady = false;
const authPromise = firebase.auth().signInAnonymously().then(uc => { authReady = true; return uc.user; }).catch(err => { console.error('Auth:', err); throw err; });
async function ensureAuth() { if (authReady) return true; try { await authPromise; return true; } catch(e){ return false; } }
function getUserIdentity() { try { const user = firebase.auth().currentUser; return user ? user.uid : null; } catch(e) { return null; } }

/* ═══ SPLASH CONTROL ═══ */
let _splashHidden = false;
function __bzrHideSplash() {
  if (_splashHidden) return; _splashHidden = true;
  const sp = document.getElementById('bzrSplash');
  if (sp && !sp.classList.contains('hide')) { sp.classList.add('hide'); setTimeout(() => { try { sp.remove(); } catch(e){} }, 600); }
}
window.__bzrHideSplash = __bzrHideSplash;

/* ═══ TOAST ═══ */
function showToast(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__toastTO);
  window.__toastTO = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ═══ RIPPLE ═══ */
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.ripple'); if (!el) return;
  el.classList.remove('animate'); void el.offsetWidth; el.classList.add('animate');
}, { passive: true });

/* ═══ CACHE ═══ */
let _cacheWriteQueue = new Map(), _cacheWriteTimer = null;
function _flushCacheWrites() {
  _cacheWriteQueue.forEach((entry, key) => {
    try { localStorage.setItem(CONFIG.CACHE_PREFIX + key, JSON.stringify({ timestamp: Date.now(), value: entry.value, ttl: entry.ttl })); } catch(e){}
  });
  _cacheWriteQueue.clear(); _cacheWriteTimer = null;
}
const cacheManager = {
  set(key, value, ttl = CONFIG.CACHE_TTL_PRODUCTS) {
    _cacheWriteQueue.set(key, { value, ttl });
    if (!_cacheWriteTimer) _cacheWriteTimer = setTimeout(_flushCacheWrites, 800);
  },
  get(key) {
    try {
      const raw = localStorage.getItem(CONFIG.CACHE_PREFIX + key); if (!raw) return null;
      const d = JSON.parse(raw); const ttl = d.ttl || CONFIG.CACHE_TTL_PRODUCTS;
      if (Date.now() - d.timestamp > ttl) { localStorage.removeItem(CONFIG.CACHE_PREFIX + key); return null; }
      return d.value;
    } catch(e){ return null; }
  },
  remove(key) { try { localStorage.removeItem(CONFIG.CACHE_PREFIX + key); } catch(e){} }
};
(function pruneCache() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(CONFIG.CACHE_PREFIX) === 0) keys.push(k); }
    if (keys.length <= CONFIG.CACHE_MAX_KEYS) return;
    keys.sort(); const r = keys.length - CONFIG.CACHE_MAX_KEYS;
    for (let i = 0; i < r; i++) localStorage.removeItem(keys[i]);
  } catch(e){}
})();

const _inFlightRequests = new Map();
function fetchWithCache(key, fn, force, ttl) {
  if (!force) { const c = cacheManager.get(key); if (c !== null) return Promise.resolve(c); }
  if (_inFlightRequests.has(key)) return _inFlightRequests.get(key);
  const promise = (async () => {
    try {
      if (!RateLimiter.canRequest('cache_' + key)) { const stale = cacheManager.get(key); if (stale) return stale; throw new Error('rate_limit_exceeded'); }
      const data = await fn(); cacheManager.set(key, data, ttl); return data;
    } finally { _inFlightRequests.delete(key); }
  })();
  _inFlightRequests.set(key, promise);
  return promise;
}

/* ═══ FOLLOWED / FAVS ═══ */
function getFollowedStores() { if (_followedCache) return _followedCache; try { _followedCache = JSON.parse(localStorage.getItem(KEYS.FOLLOWED) || '[]'); } catch(e){ _followedCache = []; } return _followedCache; }
function saveFollowedStores(list) { _followedCache = list; try { localStorage.setItem(KEYS.FOLLOWED, JSON.stringify(list)); } catch(e){} }
function isStoreFollowed(id) { if (_followedFromServer && _followedFromServer.has(String(id))) return true; return getFollowedStores().indexOf(id) > -1; }
function getStoreId(store) { return store.id || store.name; }
function getProductFavs() { if (_favsCache) return _favsCache; try { _favsCache = JSON.parse(localStorage.getItem(KEYS.FAVS) || '[]'); } catch(e){ _favsCache = []; } return _favsCache; }
function saveProductFavs(list) { _favsCache = list; try { localStorage.setItem(KEYS.FAVS, JSON.stringify(list)); } catch(e){} }
function isProductFav(id) { return getProductFavs().indexOf(id) > -1; }
function toggleProductFav(id) { const list = getProductFavs(); const idx = list.indexOf(id); if (idx > -1) list.splice(idx, 1); else list.push(id); saveProductFavs(list); return list.indexOf(id) > -1; }

/* ═══ COLORS ═══ */
function normalizeArabicColorName(n) { if (!n) return ''; return String(n).replace(/[\u064B-\u0652\u0670\u0640]/g, '').replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ئ]/g, 'ي').replace(/ؤ/g, 'و').replace(/\s+/g, ' ').trim().toLowerCase(); }
const UNKNOWN_COLOR = '#9CA3AF';
const BASE_COLOR_MAP = { 'اسود':'#1A1A1A','ابيض':'#FFFFFF','رمادي':'#6B7280','احمر':'#EF4444','نبيتي':'#7F1D1D','خمري':'#831843','وردي':'#EC4899','ازرق':'#3B82F6','كحلي':'#1E3A8A','سماوي':'#38BDF8','تركواز':'#14B8A6','اخضر':'#22C55E','زيتي':'#4D7C0F','ليموني':'#A3E635','اصفر':'#EAB308','ذهبي':'#F59E0B','نحاسي':'#B87333','بني':'#78350F','شوكولاتي':'#5C3A21','جملي':'#C19A6B','بيج':'#E8D5B7','كريمي':'#FFF8DC','سكري':'#F5DEB3','بنفسجي':'#8B5CF6','موف':'#A855F7','لافندر':'#D8B4FE','ارجواني':'#7C3AED','برتقالي':'#F97316','فضي':'#9CA3AF','برونزي':'#CD7F32','black':'#1A1A1A','white':'#FFFFFF','gray':'#6B7280','red':'#EF4444','blue':'#3B82F6','green':'#22C55E','yellow':'#EAB308','brown':'#78350F','orange':'#F97316','pink':'#EC4899','purple':'#8B5CF6','gold':'#F59E0B','silver':'#9CA3AF','navy':'#1E3A8A','teal':'#14B8A6' };
const LIGHT_KEYWORDS = ['فاتح','فاتحة','فاتحه','باهت','باهتة','باهته','خفيف','خفيفة','خفيفه','light','pale'];
const DARK_KEYWORDS = ['غامق','غامقة','غامقه','داكن','داكنة','داكنه','عميق','عميقة','عميقه','قاتم','dark','deep'];
const _colorCache = new Map();
function hexToRgb(hex) { const c = String(hex).replace('#',''); if (c.length !== 6) return null; return { r: parseInt(c.substr(0,2),16), g: parseInt(c.substr(2,2),16), b: parseInt(c.substr(4,2),16) }; }
function rgbToHex(r,g,b) { const cl = v => Math.max(0, Math.min(255, Math.round(v))); const t = v => cl(v).toString(16).padStart(2,'0'); return '#' + t(r) + t(g) + t(b); }
function applyColorModifier(hex, mod) { if (!mod || !hex) return hex; const rgb = hexToRgb(hex); if (!rgb) return hex; let { r, g, b } = rgb; if (mod === 'light') { r += (255-r)*0.4; g += (255-g)*0.4; b += (255-b)*0.4; } else if (mod === 'dark') { r *= 0.6; g *= 0.6; b *= 0.6; } return rgbToHex(r,g,b); }
function getFallbackHex(colorName) {
  if (!colorName) return UNKNOWN_COLOR;
  const cached = _colorCache.get(colorName); if (cached) return cached;
  const n = normalizeArabicColorName(colorName);
  let result = UNKNOWN_COLOR;
  if (!n) result = UNKNOWN_COLOR;
  else if (BASE_COLOR_MAP[n]) result = BASE_COLOR_MAP[n];
  else {
    let modifier = null, baseCandidate = n;
    const allMods = LIGHT_KEYWORDS.map(k => ({ word: normalizeArabicColorName(k), type: 'light' })).concat(DARK_KEYWORDS.map(k => ({ word: normalizeArabicColorName(k), type: 'dark' }))).sort((a,b) => b.word.length - a.word.length);
    for (let i = 0; i < allMods.length; i++) { const mod = allMods[i]; if (!mod.word) continue; if (n === mod.word) { modifier = mod.type; baseCandidate = ''; break; } if (n.indexOf(mod.word) > -1) { modifier = mod.type; baseCandidate = n.replace(mod.word, ' ').replace(/\s+/g,' ').trim(); break; } }
    if (baseCandidate && BASE_COLOR_MAP[baseCandidate]) result = applyColorModifier(BASE_COLOR_MAP[baseCandidate], modifier);
    else {
      const sorted = Object.keys(BASE_COLOR_MAP).sort((a,b) => b.length - a.length);
      for (let i = 0; i < sorted.length; i++) { if (n.indexOf(sorted[i]) > -1) { let inf = null; for (let j = 0; j < allMods.length; j++) { if (allMods[j].word && n.indexOf(allMods[j].word) > -1) { inf = allMods[j].type; break; } } result = applyColorModifier(BASE_COLOR_MAP[sorted[i]], inf); break; } }
    }
  }
  if (_colorCache.size > 100) _colorCache.clear();
  _colorCache.set(colorName, result);
  return result;
}

/* ═══════════════════════════════════════════════════════════
   🆕 v9.17.0 — Store Rename Sync Helper
   Called by data.js when a store's name changes.
   Updates Dexie stores + all linked products, clears cache.
   ═══════════════════════════════════════════════════════════ */
window.__bzrHandleStoreRename = async function (storeId, newName) {
  if (!bzrDB || !storeId || !newName) return false;
  try {
    const store = await bzrDB.stores.get(String(storeId));
    if (store) await bzrDB.stores.put({ ...store, name: newName, _fetchedAt: Date.now() });
    const updated = await bzrDB.products.where('store_id').equals(String(storeId)).modify(p => { p.store_name = newName; p._fetchedAt = Date.now(); });
    cacheManager.remove('all_products_page1');
    cacheManager.remove('stores_page1');
    cacheManager.remove('store_' + storeId);
    cacheManager.remove('store_products_page1_' + storeId + '_main');
    console.log('[BZR] ✅ Dexie rename synced:', storeId, '→', newName, '| products:', updated);
    return true;
  } catch (e) {
    console.warn('[BZR] __bzrHandleStoreRename failed:', e);
    return false;
  }
};

console.log('[BZR] core.js loaded ✅ v9.17.0 — store_id indexed, rename-aware');
