/* ═══════════════════════════════════════════════════════════
   BranZar App Core v9.0.0
   Single-file production build
   ✅ Cloudinary Image Optimization
   ✅ Dynamic Meta Tags for Store Sharing
   ✅ Multi-Layer Device Fingerprint Anti-Cheat (VPN-Proof)
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ═══ CONFIG ═══ */
const CONFIG = Object.freeze({
  PRODUCTS_PER_PAGE: 10,
  STORE_PRODUCTS_PER_PAGE: 40,
  SEARCH_CAP: 800,
  SEARCH_DEBOUNCE_MS: 200,
  CACHE_TTL_STORES: 15 * 60 * 1000,
  CACHE_TTL_PRODUCTS: 5 * 60 * 1000,
  CACHE_PREFIX: 'branzar_cache_',
  CACHE_MAX_KEYS: 15,
  AUTO_SCROLL_RESUME: 5000,
  AUTO_SCROLL_INTERVAL: 32,
  SCROLL_STEP: 0.9,
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
  FOLLOW_COOLDOWN_MS: 1500
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
  INSTALLED: 'branzarInstalled'
});

/* ✅ شارة التوثيق - Facebook Style (SVG) */
const VERIFIED_BADGE_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true"><path fill="#1877F2" d="M12 1l2.35 2.05 3.09-.41 1.13 2.92 2.92 1.13-.41 3.09L23 12l-2.05 2.35.41 3.09-2.92 1.13-1.13 2.92-3.09-.41L12 23l-2.35-2.05-3.09.41-1.13-2.92-2.92-1.13.41-3.09L1 12l2.05-2.35-.41-3.09 2.92-1.13 1.13-2.92 3.09.41L12 1z"/><path fill="#fff" d="M10.6 16.2l-3.8-3.8 1.4-1.4 2.4 2.4 6-6 1.4 1.4z"/></svg>';

/* ═══ UTILS ═══ */
function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function safeHex(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s;
  if (/^rgb(a)?\([0-9,\s.%]+\)$/.test(s)) return s;
  return null;
}
function haptic(type = 'light') {
  if (!('vibrate' in navigator)) return;
  try { navigator.vibrate(CONFIG.HAPTIC[type] || CONFIG.HAPTIC.light); } catch(e){}
}
function debounce(fn, wait) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/upload/q_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/');
}

/* ═══════════════════════════════════════════════════════════
   🛡️ DEVICE FINGERPRINT ANTI-CHEAT v2
   Multilayer protection - survives cache/cookie/IDB clearing
   ═══════════════════════════════════════════════════════════ */

/* FNV-1a hash - fast synchronous fallback */
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/* SHA-256 via WebCrypto (with FNV fallback) */
async function sha256Hex(str) {
  if (window.crypto && crypto.subtle && crypto.subtle.digest) {
    try {
      const buf = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
    } catch(e){}
  }
  // Fallback: FNV chained 4x for 32-char hex
  return fnv1a(str) + fnv1a(str + '|s1') + fnv1a(str + '|s2') + fnv1a(str + '|s3');
}

/* Canvas fingerprint - very stable */
function getCanvasFP() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 220; canvas.height = 30;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-ctx';
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BranZar🔒FP', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('BranZar🔒FP', 4, 17);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath(); ctx.arc(50, 50, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.beginPath(); ctx.arc(100, 50, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
    return canvas.toDataURL();
  } catch(e) { return 'canvas-error'; }
}

/* WebGL fingerprint - very stable */
function getWebGLFP() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : 'no-v';
    const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'no-r';
    const version = gl.getParameter(gl.VERSION) || '';
    const shading = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '';
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || '';
    return [vendor, renderer, version, shading, maxTex].join('|');
  } catch(e) { return 'webgl-error'; }
}

/* Audio fingerprint - stable, async */
function getAudioFP() {
  return new Promise((resolve) => {
    try {
      const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AC) return resolve('no-audio');
      const ctx = new AC(1, 44100, 44100);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 10000;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -50;
      comp.knee.value = 40;
      comp.ratio.value = 12;
      comp.attack.value = 0;
      comp.release.value = 0.25;
      osc.connect(comp);
      comp.connect(ctx.destination);
      osc.start(0);
      const timeout = setTimeout(() => resolve('audio-timeout'), 800);
      ctx.oncomplete = (e) => {
        clearTimeout(timeout);
        try {
          const buf = e.renderedBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 4500; i < 5000; i++) sum += Math.abs(buf[i]);
          resolve('audio_' + sum.toFixed(6));
        } catch(err) { resolve('audio-err'); }
      };
      ctx.startRendering();
    } catch(e) { resolve('audio-error'); }
  });
}

/* Font detection */
function getFontsFP() {
  try {
    if (!document.body) return 'no-body';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS',
                       'Verdana', 'Tahoma', 'Comic Sans MS', 'Impact', 'Segoe UI',
                       'Roboto', 'Ubuntu', 'Noto Sans Arabic', 'Cairo'];
    const testStr = 'mmmmmmmmmmlli';
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;left:-9999px;top:-9999px;font-size:72px;visibility:hidden;';
    span.textContent = testStr;
    document.body.appendChild(span);
    const baseWidths = {};
    baseFonts.forEach(bf => {
      span.style.fontFamily = bf;
      baseWidths[bf] = span.offsetWidth;
    });
    const detected = [];
    testFonts.forEach(font => {
      let found = false;
      for (let i = 0; i < baseFonts.length; i++) {
        span.style.fontFamily = '"' + font + '",' + baseFonts[i];
        if (span.offsetWidth !== baseWidths[baseFonts[i]]) { found = true; break; }
      }
      if (found) detected.push(font);
    });
    document.body.removeChild(span);
    return detected.join(',');
  } catch(e) { return 'fonts-error'; }
}

/* Compute full fingerprint */
async function computeDeviceFingerprint() {
  const audioFP = await getAudioFP();
  const components = [
    'screen:' + [Math.min(screen.width, screen.height), Math.max(screen.width, screen.height), screen.colorDepth, screen.pixelDepth].join('x'),
    'cores:' + (navigator.hardwareConcurrency || 0),
    'mem:' + (navigator.deviceMemory || 0),
    'platform:' + (navigator.platform || ''),
    'touch:' + (navigator.maxTouchPoints || 0),
    'tz:' + (new Date().getTimezoneOffset()),
    'lang:' + (navigator.language || ''),
    'canvas:' + fnv1a(getCanvasFP()),
    'webgl:' + fnv1a(getWebGLFP()),
    'fonts:' + fnv1a(getFontsFP()),
    'ua:' + navigator.userAgent,
    'audio:' + audioFP,
    'bzr-salt-v2-2025'
  ];
  const raw = components.join('|||');
  const hash = await sha256Hex(raw);
  return 'fp_' + hash.substring(0, 40);
}

/* ═══ Multi-Layer Storage (4 layers) ═══ */
function readFP_localStorage() {
  try { return localStorage.getItem(CONFIG.FP_STORAGE_KEY); } catch(e){ return null; }
}
function writeFP_localStorage(fp) {
  try { localStorage.setItem(CONFIG.FP_STORAGE_KEY, fp); return true; } catch(e){ return false; }
}
function readFP_cookie() {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + CONFIG.FP_COOKIE_NAME + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  } catch(e){ return null; }
}
function writeFP_cookie(fp) {
  try {
    const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = CONFIG.FP_COOKIE_NAME + '=' + encodeURIComponent(fp) + '; expires=' + exp + '; path=/; SameSite=Lax; Secure';
    return true;
  } catch(e){ return false; }
}
function openFP_IDB() {
  return new Promise((resolve) => {
    try {
      if (!window.indexedDB) return resolve(null);
      const req = indexedDB.open(CONFIG.FP_IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(CONFIG.FP_IDB_STORE)) {
          d.createObjectStore(CONFIG.FP_IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch(e) { resolve(null); }
  });
}
async function readFP_IDB() {
  try {
    const d = await openFP_IDB();
    if (!d) return null;
    return new Promise((resolve) => {
      try {
        const tx = d.transaction(CONFIG.FP_IDB_STORE, 'readonly');
        const req = tx.objectStore(CONFIG.FP_IDB_STORE).get(CONFIG.FP_STORAGE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch(e) { resolve(null); }
    });
  } catch(e){ return null; }
}
async function writeFP_IDB(fp) {
  try {
    const d = await openFP_IDB();
    if (!d) return false;
    return new Promise((resolve) => {
      try {
        const tx = d.transaction(CONFIG.FP_IDB_STORE, 'readwrite');
        tx.objectStore(CONFIG.FP_IDB_STORE).put(fp, CONFIG.FP_STORAGE_KEY);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch(e) { resolve(false); }
    });
  } catch(e){ return false; }
}
async function readFPFromAllStorage() {
  // Try in order of persistence
  let fp = readFP_localStorage();
  if (fp) return fp;
  fp = await readFP_IDB();
  if (fp) return fp;
  fp = readFP_cookie();
  if (fp) return fp;
  return null;
}
async function saveFPToAllStorage(fp) {
  writeFP_localStorage(fp);
  writeFP_cookie(fp);
  await writeFP_IDB(fp);
}

/* ═══ Main fingerprint getter (cached promise) ═══ */
let _fpCache = null;
let _fpPromise = null;
async function getDeviceFingerprint() {
  if (_fpCache) return _fpCache;
  if (_fpPromise) return _fpPromise;
  _fpPromise = (async () => {
    try {
      const stored = await readFPFromAllStorage();
      if (stored && stored.indexOf('fp_') === 0) {
        _fpCache = stored;
        saveFPToAllStorage(stored).catch(() => {});
        return stored;
      }
      const fp = await computeDeviceFingerprint();
      _fpCache = fp;
      await saveFPToAllStorage(fp);
      return fp;
    } catch(e) {
      const fb = 'fp_fb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      _fpCache = fb;
      return fb;
    }
  })();
  return _fpPromise;
}

/* ═══ STATE ═══ */
let cart = [];
try { cart = JSON.parse(localStorage.getItem(KEYS.CART)) || []; } catch(e){ cart = []; }
let stores = [], categories = [];
let currentCategory = null;
let currentStore = null, currentStoreId = null;
let currentFollowersCount = 0, isFollowing = false, isUpdatingFollow = false;
let allProductsLocal = [];
let lastVisibleDoc = null;
let hasMoreProducts = true;
let isLoadingProducts = false;
let allProductsUnsubscribe = null;
let storesPollInterval = null;
let storeProductsLastDoc = null;
let storeProductsHasMore = false;
let currentStoreNameForProducts = null;
let isPageVisible = !document.hidden;
let _followedCache = null, _favsCache = null;

// ✅ Server-side followed stores (source of truth)
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

document.addEventListener('visibilitychange', () => { isPageVisible = !document.hidden; }, { passive: true });

/* ═══ AUTH ═══ */
let authReady = false;
const authPromise = firebase.auth().signInAnonymously()
  .then(uc => { authReady = true; return uc.user; })
  .catch(err => { console.error('Auth:', err); throw err; });
async function ensureAuth() {
  if (authReady) return true;
  try { await authPromise; return true; } catch(e){ return false; }
}

/* ═══ SPLASH ═══ */
(function(){
  let hidden = false;
  function hideSplash(){
    if (hidden) return; hidden = true;
    const sp = document.getElementById('bzrSplash');
    if (sp && !sp.classList.contains('hide')) {
      sp.classList.add('hide');
      setTimeout(() => { try { sp.remove(); } catch(e){} }, 600);
    }
  }
  window.__bzrHideSplash = hideSplash;
  window.addEventListener('load', () => setTimeout(hideSplash, 700));
  setTimeout(hideSplash, 3000);
})();

/* ═══ TOAST ═══ */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTO);
  window.__toastTO = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ═══ RIPPLE ═══ */
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.ripple');
  if (!el) return;
  el.classList.remove('animate');
  void el.offsetWidth;
  el.classList.add('animate');
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
      const raw = localStorage.getItem(CONFIG.CACHE_PREFIX + key);
      if (!raw) return null;
      const d = JSON.parse(raw);
      const ttl = d.ttl || CONFIG.CACHE_TTL_PRODUCTS;
      if (Date.now() - d.timestamp > ttl) { localStorage.removeItem(CONFIG.CACHE_PREFIX + key); return null; }
      return d.value;
    } catch(e){ return null; }
  },
  remove(key) { try { localStorage.removeItem(CONFIG.CACHE_PREFIX + key); } catch(e){} }
};
(function pruneCache() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(CONFIG.CACHE_PREFIX) === 0) keys.push(k);
    }
    if (keys.length <= CONFIG.CACHE_MAX_KEYS) return;
    keys.sort();
    const r = keys.length - CONFIG.CACHE_MAX_KEYS;
    for (let i = 0; i < r; i++) localStorage.removeItem(keys[i]);
  } catch(e){}
})();
async function fetchWithCache(key, fn, force, ttl) {
  if (!force) { const c = cacheManager.get(key); if (c !== null) return c; }
  const data = await fn();
  cacheManager.set(key, data, ttl);
  return data;
}

/* ═══ FOLLOWED / FAVS (local cache) ═══ */
function getFollowedStores() {
  if (_followedCache) return _followedCache;
  try { _followedCache = JSON.parse(localStorage.getItem(KEYS.FOLLOWED) || '[]'); } catch(e){ _followedCache = []; }
  return _followedCache;
}
function saveFollowedStores(list) { _followedCache = list; try { localStorage.setItem(KEYS.FOLLOWED, JSON.stringify(list)); } catch(e){} }
function isStoreFollowed(id) {
  // Server state wins
  if (_followedFromServer && _followedFromServer.has(String(id))) return true;
  return getFollowedStores().indexOf(id) > -1;
}
function getStoreId(store) { return store.id || store.name; }
function getProductFavs() {
  if (_favsCache) return _favsCache;
  try { _favsCache = JSON.parse(localStorage.getItem(KEYS.FAVS) || '[]'); } catch(e){ _favsCache = []; }
  return _favsCache;
}
function saveProductFavs(list) { _favsCache = list; try { localStorage.setItem(KEYS.FAVS, JSON.stringify(list)); } catch(e){} }
function isProductFav(id) { return getProductFavs().indexOf(id) > -1; }
function toggleProductFav(id) {
  const list = getProductFavs();
  const idx = list.indexOf(id);
  if (idx > -1) list.splice(idx, 1); else list.push(id);
  saveProductFavs(list);
  return list.indexOf(id) > -1;
}

/* ═══ COLORS ═══ */
function normalizeArabicColorName(n) {
  if (!n) return '';
  return String(n)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[ئ]/g, 'ي').replace(/ؤ/g, 'و')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
const UNKNOWN_COLOR = '#9CA3AF';
const BASE_COLOR_MAP = {
  'اسود':'#1A1A1A','ابيض':'#FFFFFF','رمادي':'#6B7280','احمر':'#EF4444','نبيتي':'#7F1D1D','خمري':'#831843',
  'وردي':'#EC4899','ازرق':'#3B82F6','كحلي':'#1E3A8A','سماوي':'#38BDF8','تركواز':'#14B8A6','اخضر':'#22C55E',
  'زيتي':'#4D7C0F','ليموني':'#A3E635','اصفر':'#EAB308','ذهبي':'#F59E0B','نحاسي':'#B87333','بني':'#78350F',
  'شوكولاتي':'#5C3A21','جملي':'#C19A6B','بيج':'#E8D5B7','كريمي':'#FFF8DC','سكري':'#F5DEB3','بنفسجي':'#8B5CF6',
  'موف':'#A855F7','لافندر':'#D8B4FE','ارجواني':'#7C3AED','برتقالي':'#F97316','فضي':'#9CA3AF','برونزي':'#CD7F32',
  'black':'#1A1A1A','white':'#FFFFFF','gray':'#6B7280','red':'#EF4444','blue':'#3B82F6','green':'#22C55E',
  'yellow':'#EAB308','brown':'#78350F','orange':'#F97316','pink':'#EC4899','purple':'#8B5CF6','gold':'#F59E0B',
  'silver':'#9CA3AF','navy':'#1E3A8A','teal':'#14B8A6'
};
const LIGHT_KEYWORDS = ['فاتح','فاتحة','فاتحه','باهت','باهتة','باهته','خفيف','خفيفة','خفيفه','light','pale'];
const DARK_KEYWORDS = ['غامق','غامقة','غامقه','داكن','داكنة','داكنه','عميق','عميقة','عميقه','قاتم','dark','deep'];
const _colorCache = new Map();
function hexToRgb(hex) {
  const c = String(hex).replace('#','');
  if (c.length !== 6) return null;
  return { r: parseInt(c.substr(0,2),16), g: parseInt(c.substr(2,2),16), b: parseInt(c.substr(4,2),16) };
}
function rgbToHex(r,g,b) {
  const cl = v => Math.max(0, Math.min(255, Math.round(v)));
  const t = v => cl(v).toString(16).padStart(2,'0');
  return '#' + t(r) + t(g) + t(b);
}
function applyColorModifier(hex, mod) {
  if (!mod || !hex) return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  let { r, g, b } = rgb;
  if (mod === 'light') { r += (255-r)*0.4; g += (255-g)*0.4; b += (255-b)*0.4; }
  else if (mod === 'dark') { r *= 0.6; g *= 0.6; b *= 0.6; }
  return rgbToHex(r,g,b);
}
function getFallbackHex(colorName) {
  if (!colorName) return UNKNOWN_COLOR;
  const cached = _colorCache.get(colorName);
  if (cached) return cached;
  const n = normalizeArabicColorName(colorName);
  let result = UNKNOWN_COLOR;
  if (!n) result = UNKNOWN_COLOR;
  else if (BASE_COLOR_MAP[n]) result = BASE_COLOR_MAP[n];
  else {
    let modifier = null, baseCandidate = n;
    const allMods = LIGHT_KEYWORDS.map(k => ({ word: normalizeArabicColorName(k), type: 'light' }))
      .concat(DARK_KEYWORDS.map(k => ({ word: normalizeArabicColorName(k), type: 'dark' })))
      .sort((a,b) => b.word.length - a.word.length);
    for (let i = 0; i < allMods.length; i++) {
      const mod = allMods[i];
      if (!mod.word) continue;
      if (n === mod.word) { modifier = mod.type; baseCandidate = ''; break; }
      if (n.indexOf(mod.word) > -1) { modifier = mod.type; baseCandidate = n.replace(mod.word, ' ').replace(/\s+/g,' ').trim(); break; }
    }
    if (baseCandidate && BASE_COLOR_MAP[baseCandidate]) {
      result = applyColorModifier(BASE_COLOR_MAP[baseCandidate], modifier);
    } else {
      const sorted = Object.keys(BASE_COLOR_MAP).sort((a,b) => b.length - a.length);
      for (let i = 0; i < sorted.length; i++) {
        if (n.indexOf(sorted[i]) > -1) {
          let inf = null;
          for (let j = 0; j < allMods.length; j++) {
            if (allMods[j].word && n.indexOf(allMods[j].word) > -1) { inf = allMods[j].type; break; }
          }
          result = applyColorModifier(BASE_COLOR_MAP[sorted[i]], inf);
          break;
        }
      }
    }
  }
  if (_colorCache.size > 100) _colorCache.clear();
  _colorCache.set(colorName, result);
  return result;
}

/* ═══ THEME ═══ */
function applyTheme(theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  const mainIcon = document.querySelector('#themeToggleBtn i');
  if (mainIcon) mainIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  const accountSwitch = document.getElementById('accountThemeSwitch');
  if (accountSwitch) accountSwitch.classList.toggle('on', theme === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0F172A' : '#FF7A00');
}
function initTheme() {
  const saved = localStorage.getItem(KEYS.THEME);
  if (saved) { applyTheme(saved); return; }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}
function toggleTheme() {
  const current = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(KEYS.THEME, next);
  haptic('light');
}
document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
document.getElementById('accountThemeSwitch')?.addEventListener('click', toggleTheme);
document.getElementById('accountThemeSwitch')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
});

/* ═══ VIEW MODE ═══ */
function applyViewMode(mode) {
  document.body.classList.remove('view-mobile','view-desktop');
  document.body.classList.add('view-' + mode);
  $$('.view-toggle-pill button').forEach(b => b.classList.toggle('active', b.dataset.view === mode));
  localStorage.setItem(KEYS.VIEW, mode);
}
function initViewMode() {
  const saved = localStorage.getItem(KEYS.VIEW);
  if (saved) { applyViewMode(saved); return; }
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent) || window.matchMedia('(max-width: 767px)').matches;
  applyViewMode(isMobile ? 'mobile' : 'desktop');
}
function setView(mode) { applyViewMode(mode); haptic('light'); }
document.getElementById('viewMobileBtn')?.addEventListener('click', () => setView('mobile'));
document.getElementById('viewDesktopBtn')?.addEventListener('click', () => setView('desktop'));
document.getElementById('accountViewMobileBtn')?.addEventListener('click', () => setView('mobile'));
document.getElementById('accountViewDesktopBtn')?.addEventListener('click', () => setView('desktop'));

/* ═══ AUTO-SCROLL ═══ */
let isHoveringStores = false;
let lastStoresInteraction = 0;
let _scrollRAFId = null;
let _lastScrollFrame = 0;

function getStoresMaxScroll() {
  const c = document.getElementById('storesScrollContainer');
  return c ? Math.max(0, c.scrollWidth - c.clientWidth) : 0;
}
function _autoScrollLoop(ts) {
  const c = document.getElementById('storesScrollContainer');
  if (!c) { _scrollRAFId = null; return; }
  if (!isPageVisible) { _scrollRAFId = requestAnimationFrame(_autoScrollLoop); return; }
  if (isHoveringStores || (Date.now() - lastStoresInteraction < CONFIG.AUTO_SCROLL_RESUME)) {
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop); return;
  }
  if (ts - _lastScrollFrame < CONFIG.AUTO_SCROLL_INTERVAL) {
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop); return;
  }
  _lastScrollFrame = ts;
  const max = getStoresMaxScroll();
  if (max <= 0) { _scrollRAFId = null; return; }
  if (c.scrollLeft >= max - 1) c.scrollLeft = 0;
  else c.scrollLeft += CONFIG.SCROLL_STEP;
  _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
}
function startAutoScroll() {
  stopAutoScroll();
  const c = document.getElementById('storesScrollContainer');
  if (!c) return;
  requestAnimationFrame(() => {
    c.scrollLeft = 0;
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
  });
}
function stopAutoScroll() {
  if (_scrollRAFId) { cancelAnimationFrame(_scrollRAFId); _scrollRAFId = null; }
}

/* ═══ BODY SCROLL LOCK ═══ */
function updateBodyScroll() {
  const anyOpen = !document.getElementById('storeModal').classList.contains('hidden') ||
                  !document.getElementById('productModal').classList.contains('hidden') ||
                  document.getElementById('cartSidebar').classList.contains('open') ||
                  !document.getElementById('accountModal').classList.contains('hidden') ||
                  !document.getElementById('createStoreModal').classList.contains('hidden');
  document.body.style.overflow = anyOpen ? 'hidden' : '';
  document.body.classList.toggle('modal-open', anyOpen);
}

/* ═══ ANDROID BACK ═══ */
let _ignoreNextPop = false;
function bzrPushModal() { try { history.pushState({ bzrModal: Date.now() }, ''); } catch(e){} }
function bzrCloseModalUI() {
  if (history.state && history.state.bzrModal) {
    _ignoreNextPop = true;
    try { history.back(); } catch(e){ _ignoreNextPop = false; }
  }
}
function closeTopmostModal() {
  if (!document.getElementById('productModal').classList.contains('hidden')) { closeProductModalInternal(); return true; }
  if (!document.getElementById('createStoreModal').classList.contains('hidden')) { createStoreModal.classList.add('hidden'); updateBodyScroll(); return true; }
  if (!document.getElementById('accountModal').classList.contains('hidden')) { closeAccountModalInternal(); return true; }
  if (!document.getElementById('storeModal').classList.contains('hidden')) { closeStoreModalInternal(); return true; }
  if (document.getElementById('cartSidebar').classList.contains('open')) { closeCartInternal(); return true; }
  return false;
}
window.addEventListener('popstate', () => {
  if (_ignoreNextPop) { _ignoreNextPop = false; return; }
  closeTopmostModal();
});

/* ═══ BOTTOM NAV ═══ */
const bottomNav = document.getElementById('bzrBottomNav');
const bottomNavBadge = document.getElementById('bottomNavCartBadge');
function setActiveNav(nav) {
  if (!bottomNav) return;
  bottomNav.querySelectorAll('.bzr-nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === nav));
}
bottomNav?.addEventListener('click', (e) => {
  const btn = e.target.closest('.bzr-nav-item');
  if (!btn) return;
  haptic('light');
  const nav = btn.dataset.nav;
  if (nav === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveNav('home'); }
  else if (nav === 'categories') {
    const sec = document.getElementById('categories');
    if (sec) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav('categories');
    }
  }
  else if (nav === 'cart') { openCart(); }
  else if (nav === 'account') { openAccountModal(); }
});
function updateBottomNavBadge() {
  if (!bottomNavBadge) return;
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  if (total > 0) { bottomNavBadge.textContent = total > 99 ? '99+' : total; bottomNavBadge.style.display = 'flex'; }
  else bottomNavBadge.style.display = 'none';
}

/* ═══ ACCOUNT MODAL ═══ */
const accountModal = document.getElementById('accountModal');
const createStoreModal = document.getElementById('createStoreModal');
function openAccountModal() { accountModal.classList.remove('hidden'); updateBodyScroll(); haptic('light'); bzrPushModal(); }
function closeAccountModalInternal() { accountModal.classList.add('hidden'); updateBodyScroll(); }
function closeAccountModal() { closeAccountModalInternal(); bzrCloseModalUI(); }
document.getElementById('closeAccountModal')?.addEventListener('click', closeAccountModal);
document.getElementById('accountOverlay')?.addEventListener('click', closeAccountModal);
document.getElementById('openCreateStoreBtn')?.addEventListener('click', () => { haptic('medium'); createStoreModal.classList.remove('hidden'); updateBodyScroll(); bzrPushModal(); });
document.getElementById('cancelCreateStore')?.addEventListener('click', () => { createStoreModal.classList.add('hidden'); updateBodyScroll(); bzrCloseModalUI(); });
createStoreModal?.addEventListener('click', (e) => { if (e.target === createStoreModal) { createStoreModal.classList.add('hidden'); updateBodyScroll(); bzrCloseModalUI(); } });

document.getElementById('logoMenuBtn')?.addEventListener('click', () => { haptic('light'); window.scrollTo({ top: 0, behavior: 'smooth' }); });

/* ═══ PWA INSTALL ═══ */
let deferredPrompt = null;
function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || localStorage.getItem(KEYS.INSTALLED) === 'true';
}
const installBtn = document.getElementById('installButtonFloating');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (!isAppInstalled()) installBtn.classList.add('show'); });
window.addEventListener('appinstalled', () => { localStorage.setItem(KEYS.INSTALLED, 'true'); installBtn.classList.remove('show'); deferredPrompt = null; showToast('تم تثبيت التطبيق بنجاح!'); haptic('heavy'); });
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) { showToast('التطبيق مثبت بالفعل'); return; }
  haptic('medium');
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') { localStorage.setItem(KEYS.INSTALLED, 'true'); installBtn.classList.remove('show'); }
  deferredPrompt = null;
});
if (isAppInstalled()) installBtn.classList.remove('show');

/* ═══ NOTIFICATIONS (FCM) ═══ */
let messaging = null;
function isNotificationSupported() { return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window; }

async function initFCM() {
  try {
    if (!isNotificationSupported()) return;
    messaging = firebase.messaging();
    const reg = await navigator.serviceWorker.ready;

    messaging.onMessage((payload) => {
      const title = (payload.notification && payload.notification.title) || 'إشعار جديد';
      const body = (payload.notification && payload.notification.body) || 'لديك جديد في BranZar';
      showPushToast(title, body);
      if (Notification.permission === 'granted') {
        try {
          const n = new Notification(title, {
            body,
            icon: (payload.notification && payload.notification.icon) || CONFIG.DEFAULT_OG_IMAGE,
            dir: 'rtl', lang: 'ar',
            tag: (payload.data && payload.data.tag) || 'branzar-fg'
          });
          n.onclick = () => { window.focus(); window.location.href = (payload.data && payload.data.url) || 'https://branzar.vercel.app'; n.close(); };
        } catch(e){}
      }
    });

    if (Notification.permission === 'granted') await registerFCMToken(reg);
    else if (shouldShowNotifBanner()) setTimeout(showNotifBanner, 12000);
  } catch(err){ console.warn('FCM:', err); }
}
function shouldShowNotifBanner() {
  if (!isNotificationSupported()) return false;
  const perm = Notification.permission;
  if (perm === 'granted' || perm === 'denied') return false;
  const dismissed = parseInt(localStorage.getItem(KEYS.NOTIF_DISMISS) || '0');
  if (dismissed && (Date.now() - dismissed) < CONFIG.NOTIF_DISMISS_DAYS * 24 * 60 * 60 * 1000) return false;
  return true;
}
function showNotifBanner() { const b = document.getElementById('notifPermissionBanner'); if (!b) return; b.classList.remove('hidden'); requestAnimationFrame(() => setTimeout(() => b.classList.add('show'), 50)); }
function hideNotifBanner() { const b = document.getElementById('notifPermissionBanner'); if (!b) return; b.classList.remove('show'); setTimeout(() => b.classList.add('hidden'), 600); }
async function registerFCMToken(reg) {
  try {
    const token = await messaging.getToken({ vapidKey: CONFIG.VAPID, serviceWorkerRegistration: reg });
    if (!token) return null;
    localStorage.setItem(KEYS.FCM_TOKEN, token);
    const prev = localStorage.getItem(KEYS.FCM_TOKEN + '_saved');
    if (prev !== token) {
      await db.collection('fcm_tokens').doc(token).set({
        token, userAgent: navigator.userAgent, platform: navigator.platform || 'unknown',
        language: navigator.language || 'ar',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        active: true
      }, { merge: true });
      localStorage.setItem(KEYS.FCM_TOKEN + '_saved', token);
    }
    return token;
  } catch(err){ return null; }
}
function showPushToast(title, body) {
  const t = document.getElementById('pushToast');
  if (!t) return;
  document.getElementById('pushToastTitle').textContent = title;
  document.getElementById('pushToastBody').textContent = body;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5000);
}
document.getElementById('enableNotifBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('enableNotifBtn'); btn.disabled = true;
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      await registerFCMToken(reg);
      hideNotifBanner(); showToast('✅ تم تفعيل الإشعارات'); haptic('medium');
    } else { hideNotifBanner(); localStorage.setItem(KEYS.NOTIF_DISMISS, Date.now().toString()); }
  } catch(err){}
  btn.disabled = false;
});
document.getElementById('dismissNotifBtn')?.addEventListener('click', () => { hideNotifBanner(); localStorage.setItem(KEYS.NOTIF_DISMISS, Date.now().toString()); });

/* ═══ SEARCH ═══ */
const searchInput = document.getElementById('searchInput');
const searchWrapper = document.getElementById('bzrSearchWrapper');
const searchResults = document.getElementById('searchResults');
const searchClearBtn = document.getElementById('searchClearBtn');
const performSearchDebounced = debounce(performSearch, CONFIG.SEARCH_DEBOUNCE_MS);

searchInput?.addEventListener('input', (e) => {
  if (searchInput.value.trim()) searchWrapper.classList.add('has-value');
  else searchWrapper.classList.remove('has-value');
  performSearchDebounced(e.target.value);
});
searchInput?.addEventListener('focus', () => { if (searchInput.value.trim()) performSearch(searchInput.value); });
searchClearBtn?.addEventListener('click', () => { searchInput.value = ''; searchWrapper.classList.remove('has-value'); searchResults.classList.remove('show'); searchInput.focus(); });
document.addEventListener('click', (e) => { if (!searchResults.contains(e.target) && !searchWrapper.contains(e.target)) searchResults.classList.remove('show'); });

function performSearch(query) {
  query = (query || '').trim().toLowerCase().slice(0, 100);
  if (!query) { searchResults.classList.remove('show'); return; }
  const searchPool = allProductsLocal.slice(0, CONFIG.SEARCH_CAP);
  const matchedCats = categories.filter(c => c.toLowerCase().indexOf(query) > -1);
  const matchedStores = stores.filter(s => (s.name || '').toLowerCase().indexOf(query) > -1 || (s.category || '').toLowerCase().indexOf(query) > -1);
  const matchedProducts = searchPool.filter(p => (p.name || '').toLowerCase().indexOf(query) > -1 || (p.store_name || '').toLowerCase().indexOf(query) > -1).slice(0, 8);
  searchResults.innerHTML = '';
  if (!matchedCats.length && !matchedStores.length && !matchedProducts.length) {
    searchResults.innerHTML = '<div style="text-align:center;padding:2rem 0;color:var(--c-text-soft);"><i class="fas fa-search" style="font-size:2rem;margin-bottom:0.5rem;display:block;color:#CBD5E1;"></i><p style="font-weight:700;">لا توجد نتائج</p></div>';
    searchResults.classList.add('show'); return;
  }
  if (matchedCats.length) {
    const title = document.createElement('p'); title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:0 0 10px;'; title.textContent = 'الفئات'; searchResults.appendChild(title);
    const chips = document.createElement('div'); chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;';
    matchedCats.forEach(cat => {
      const chip = document.createElement('button'); chip.className = 'chip'; chip.textContent = cat;
      chip.addEventListener('click', () => { searchResults.classList.remove('show'); searchInput.value = ''; searchWrapper.classList.remove('has-value'); goToCategory(cat); });
      chips.appendChild(chip);
    });
    searchResults.appendChild(chips);
  }
  if (matchedStores.length) {
    const title = document.createElement('p'); title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:0 0 10px;'; title.textContent = 'المتاجر (' + matchedStores.length + ')'; searchResults.appendChild(title);
    matchedStores.slice(0, 5).forEach(store => searchResults.appendChild(createSearchStoreRow(store)));
  }
  if (matchedProducts.length) {
    const title = document.createElement('p'); title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:14px 0 10px;'; title.textContent = 'المنتجات (' + matchedProducts.length + ')'; searchResults.appendChild(title);
    matchedProducts.forEach(p => searchResults.appendChild(createSearchProductRow(p)));
  }
  searchResults.classList.add('show');
}
function createSearchStoreRow(store) {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;cursor:pointer;transition:background 0.2s;';
  row.onmouseover = () => row.style.background = 'var(--c-surface-2)';
  row.onmouseout = () => row.style.background = '';
  const img = document.createElement('img'); img.style.cssText = 'width:42px;height:42px;border-radius:50%;object-fit:cover;background:var(--c-surface-2);flex-shrink:0;'; img.src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
  const nm = document.createElement('div'); nm.style.cssText = 'font-weight:800;font-size:0.88rem;color:var(--c-text);display:flex;align-items:center;gap:4px;';
  if (store.is_verified) { const v = document.createElement('span'); v.className = 'verified-icon'; v.innerHTML = VERIFIED_BADGE_SVG; nm.appendChild(v); }
  const nameText = document.createElement('span'); nameText.textContent = store.name || ''; nm.appendChild(nameText);
  const meta = document.createElement('div'); meta.style.cssText = 'font-size:0.72rem;color:var(--c-text-soft);margin-top:2px;'; meta.textContent = (store.category || 'عام');
  info.appendChild(nm); info.appendChild(meta);
  const arrow = document.createElement('i'); arrow.className = 'fas fa-chevron-left'; arrow.style.cssText = 'color:var(--c-text-soft);font-size:0.75rem;';
  row.appendChild(img); row.appendChild(info); row.appendChild(arrow);
  row.addEventListener('click', () => { searchResults.classList.remove('show'); searchInput.value = ''; searchWrapper.classList.remove('has-value'); openStoreModal(store); });
  return row;
}
function createSearchProductRow(product) {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;cursor:pointer;';
  row.onmouseover = () => row.style.background = 'var(--c-surface-2)';
  row.onmouseout = () => row.style.background = '';
  const img = document.createElement('img'); img.style.cssText = 'width:42px;height:42px;border-radius:10px;object-fit:contain;background:var(--c-surface-2);padding:4px;flex-shrink:0;'; img.src = optimizeCloudinaryUrl(product.img_url) || 'https://via.placeholder.com/100';
  const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
  const nm = document.createElement('div'); nm.style.cssText = 'font-weight:800;font-size:0.88rem;color:var(--c-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; nm.textContent = product.name || '';
  const meta = document.createElement('div'); meta.style.cssText = 'font-size:0.72rem;color:#FF7A00;margin-top:2px;font-weight:800;'; meta.textContent = (parseFloat(product.price) || 0).toLocaleString() + ' ج.س';
  info.appendChild(nm); info.appendChild(meta);
  row.appendChild(img); row.appendChild(info);
  row.addEventListener('click', () => {
    searchResults.classList.remove('show'); searchInput.value = ''; searchWrapper.classList.remove('has-value');
    openProductModal({ id: product.id, name: product.name, img_url: product.img_url, price: parseFloat(product.price) || 0, original_price: product.original_price ? parseFloat(product.original_price) : null, ratting: parseFloat(product.ratting) || 0, store_name: product.store_name, description: product.description || '', colors: product.colors || null });
  });
  return row;
}
function goToCategory(cat) {
  currentCategory = cat;
  filterStoresByCategory(cat);
  const btns = Array.from(document.getElementById('categoriesContainer').querySelectorAll('button'));
  const target = btns.find(b => b.textContent.trim() === cat);
  if (target) highlightCategory(target);
  applyProductsFilter(cat);
  const s = document.getElementById('stores');
  if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══ DATA LOADING ═══ */
async function loadStores(force) {
  const loader = document.getElementById('storesLoader');
  const empty = document.getElementById('storesEmpty');
  const container = document.getElementById('storesScrollContainer');
  loader.classList.remove('hidden'); empty.classList.add('hidden'); container.innerHTML = '';
  try {
    const result = await fetchWithCache('stores_list', async () => {
      let snap;
      try { snap = await db.collection('stores').orderBy('created_at', 'desc').limit(50).get(); }
      catch(e){ snap = await db.collection('stores').limit(50).get(); }
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, force, CONFIG.CACHE_TTL_STORES);
    stores = result;
    if (stores.length === 0) {
      document.getElementById('storesErrorMessage').textContent = '⚠️ لا توجد متاجر متاحة';
      empty.classList.remove('hidden'); renderFollowedStores();
    } else {
      displayStores();
      startAutoScroll();
      renderFollowedStores();
      localStorage.setItem(KEYS.VISITED, 'true');
    }
  } catch(err){
    document.getElementById('storesErrorMessage').textContent = 'تعذر تحميل المتاجر';
    empty.classList.remove('hidden');
  } finally { loader.classList.add('hidden'); }
}
document.getElementById('retryStoresBtn')?.addEventListener('click', () => loadStores(true));

async function loadAllProducts(force) {
  if (isLoadingProducts) return;
  isLoadingProducts = true;
  const loader = document.getElementById('allProductsLoader');
  const empty = document.getElementById('allProductsEmpty');
  const grid = document.getElementById('allProductsGrid');
  loader.classList.remove('hidden'); empty.classList.add('hidden'); grid.innerHTML = '';
  document.getElementById('loadMoreProductsBtn').classList.add('hidden');
  allProductsLocal = []; lastVisibleDoc = null; hasMoreProducts = true;
  if (!force) {
    const cached = cacheManager.get('all_products_page1');
    if (cached && Array.isArray(cached.items)) {
      allProductsLocal = cached.items;
      renderProductsBatch(allProductsLocal);
      hasMoreProducts = cached.hasMore !== false;
      fetchProductsPage(null, true).catch(() => {});
      loader.classList.add('hidden');
      isLoadingProducts = false;
      return;
    }
  }
  try { await fetchProductsPage(null, false); }
  catch(err) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--c-text-soft);">تعذر تحميل المنتجات</p>'; }
  finally { loader.classList.add('hidden'); isLoadingProducts = false; }
}

async function fetchProductsPage(cursorDoc, silent) {
  try {
    let q = db.collection('products').orderBy('created_at', 'desc').limit(CONFIG.PRODUCTS_PER_PAGE);
    if (cursorDoc) q = db.collection('products').orderBy('created_at', 'desc').startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
    let snap;
    try { snap = await q.get(); }
    catch(e) {
      let q2 = db.collection('products').limit(CONFIG.PRODUCTS_PER_PAGE);
      if (cursorDoc) q2 = db.collection('products').startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
      snap = await q2.get();
    }
    const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (snap.docs.length > 0) lastVisibleDoc = snap.docs[snap.docs.length - 1];
    hasMoreProducts = snap.docs.length === CONFIG.PRODUCTS_PER_PAGE;
    const existingIds = new Set(allProductsLocal.map(p => p.id));
    const newItems = fresh.filter(p => !existingIds.has(p.id));
    allProductsLocal = allProductsLocal.concat(newItems);
    if (!silent) renderProductsBatch(fresh);
    const loadBtn = document.getElementById('loadMoreProductsBtn');
    const emptyEl = document.getElementById('allProductsEmpty');
    if (allProductsLocal.length === 0) { emptyEl.classList.remove('hidden'); loadBtn.classList.add('hidden'); }
    else emptyEl.classList.add('hidden');
    if (hasMoreProducts) loadBtn.classList.remove('hidden'); else loadBtn.classList.add('hidden');
    if (!cursorDoc) cacheManager.set('all_products_page1', { items: allProductsLocal.slice(0, CONFIG.PRODUCTS_PER_PAGE), hasMore: hasMoreProducts }, CONFIG.CACHE_TTL_PRODUCTS);
  } catch(err) { throw err; }
}

function renderProductsBatch(items) {
  const grid = document.getElementById('allProductsGrid');
  if (!items.length) return;
  const frag = document.createDocumentFragment();
  items.forEach(product => {
    const price = parseFloat(product.price) || 0;
    const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
    const rating = parseFloat(product.ratting) || 0;
    const card = document.createElement('div'); card.className = 'product-card';
    const pm = { id: product.id, name: product.name, img_url: product.img_url, price, original_price: originalPrice, ratting: rating, store_name: product.store_name, description: product.description || '', colors: product.colors || null };
    let colorDots = '';
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      const dots = product.colors.slice(0, 4).map(c => {
        const hex = safeHex(c && c.hex) || getFallbackHex(c && c.name);
        const name = sanitizeHTML((c && c.name) || '');
        return '<div class="card-color-dot" style="background-color:' + hex + '" title="' + name + '"></div>';
      }).join('');
      const extra = product.colors.length > 4 ? '<span style="font-size:10px;color:var(--c-text-soft);font-weight:800;align-self:center;">+' + (product.colors.length - 4) + '</span>' : '';
      colorDots = '<div style="display:flex;gap:4px;margin-bottom:6px;justify-content:flex-end;">' + dots + extra + '</div>';
    }
    card.innerHTML =
      '<div class="product-image-container">' +
        '<img src="' + sanitizeHTML(optimizeCloudinaryUrl(product.img_url) || 'https://via.placeholder.com/300') + '" loading="lazy" alt="' + sanitizeHTML(product.name) + '">' +
        (originalPrice ? '<span style="position:absolute;top:8px;right:8px;background:linear-gradient(135deg,#FF7A00,#FFA64D);color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:9999px;box-shadow:0 3px 8px rgba(255,122,0,0.4);">خصم</span>' : '') +
      '</div>' +
      '<div style="padding:0.75rem;display:flex;flex-direction:column;gap:5px;flex:1;">' +
        '<h5 style="font-weight:800;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--c-text);margin:0;">' + sanitizeHTML(product.name) + '</h5>' +
        (product.store_name ? '<p style="font-size:0.72rem;color:#FF7A00;font-weight:800;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + sanitizeHTML(product.store_name) + '</p>' : '') +
        '<div style="display:flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:800;color:var(--c-text);"><i class="fas fa-star" style="color:#FBBF24;"></i> ' + rating + '</div>' +
        '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
          '<span style="font-weight:900;color:#FF7A00;font-size:0.9rem;">' + price.toLocaleString() + ' ج.س</span>' +
          (originalPrice ? '<span style="font-size:0.75rem;text-decoration:line-through;color:var(--c-text-soft);font-weight:700;">' + originalPrice.toLocaleString() + ' ج.س</span>' : '') +
        '</div>' + colorDots +
        '<button class="open-product-btn ripple" style="width:100%;background:linear-gradient(135deg,#FF7A00,#FFA64D);color:#fff;padding:0.6rem;border-radius:12px;font-size:0.82rem;font-weight:800;border:none;cursor:pointer;margin-top:auto;box-shadow:0 4px 12px -4px rgba(255,122,0,0.5);">عرض المنتج</button>' +
      '</div>';
    frag.appendChild(card);
    const btn = card.querySelector('.open-product-btn');
    btn.addEventListener('click', (e) => { e.stopPropagation(); haptic('light'); openProductModal(pm); });
    card.addEventListener('click', (e) => { if (e.target === btn) return; haptic('light'); openProductModal(pm); });
  });
  grid.appendChild(frag);
}

document.getElementById('loadMoreProductsBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('loadMoreProductsBtn');
  if (btn.disabled || !hasMoreProducts || isLoadingProducts) return;
  btn.disabled = true;
  haptic('light');
  try {
    if (currentCategory) await fetchProductsByCategoryPage(lastVisibleDoc, false);
    else await fetchProductsPage(lastVisibleDoc, false);
  } catch(e){ showToast('تعذر تحميل المزيد'); }
  btn.disabled = false;
});

async function applyProductsFilter(cat) {
  currentCategory = cat;
  const grid = document.getElementById('allProductsGrid');
  const emptyEl = document.getElementById('allProductsEmpty');
  const loadBtn = document.getElementById('loadMoreProductsBtn');
  if (!cat) {
    grid.innerHTML = ''; allProductsLocal = []; lastVisibleDoc = null; hasMoreProducts = true;
    try { await fetchProductsPage(null, false); } catch(e){}
    return;
  }
  grid.innerHTML = ''; allProductsLocal = []; lastVisibleDoc = null; hasMoreProducts = true;
  loadBtn.classList.add('hidden'); emptyEl.classList.add('hidden');
  try { await fetchProductsByCategoryPage(null, false); }
  catch(e){ emptyEl.classList.remove('hidden'); }
}

async function fetchProductsByCategoryPage(cursorDoc, silent) {
  const cat = currentCategory;
  if (!cat) return;
  const storeNames = stores.filter(s => s.category === cat).map(s => s.name).filter(Boolean);
  if (!storeNames.length) {
    if (!silent) document.getElementById('allProductsGrid').innerHTML = '';
    document.getElementById('allProductsEmpty').classList.remove('hidden');
    document.getElementById('loadMoreProductsBtn').classList.add('hidden');
    hasMoreProducts = false;
    return;
  }
  const chunks = [];
  for (let i = 0; i < storeNames.length; i += 10) chunks.push(storeNames.slice(i, i + 10));
  const fetched = [];
  let newCursor = cursorDoc;
  for (const chunk of chunks) {
    try {
      let q = db.collection('products').where('store_name', 'in', chunk).limit(CONFIG.PRODUCTS_PER_PAGE);
      if (cursorDoc) q = db.collection('products').where('store_name', 'in', chunk).startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
      try { q = q.orderBy('created_at', 'desc'); } catch(e){}
      const snap = await q.get();
      snap.docs.forEach(d => fetched.push(d));
      if (snap.docs.length > 0) newCursor = snap.docs[snap.docs.length - 1];
    } catch(e) {
      try {
        let q2 = db.collection('products').where('store_name', 'in', chunk).limit(CONFIG.PRODUCTS_PER_PAGE);
        if (cursorDoc) q2 = q2.startAfter(cursorDoc);
        const s2 = await q2.get();
        s2.docs.forEach(d => fetched.push(d));
        if (s2.docs.length > 0) newCursor = s2.docs[s2.docs.length - 1];
      } catch(e2){}
    }
  }
  fetched.sort((a, b) => ((b.data().created_at?.seconds || 0) - (a.data().created_at?.seconds || 0)));
  const limited = fetched.slice(0, CONFIG.PRODUCTS_PER_PAGE);
  if (limited.length > 0) lastVisibleDoc = limited[limited.length - 1];
  hasMoreProducts = fetched.length >= CONFIG.PRODUCTS_PER_PAGE;
  const items = limited.map(d => ({ id: d.id, ...d.data() }));
  const existingIds = new Set(allProductsLocal.map(p => p.id));
  const newItems = items.filter(p => !existingIds.has(p.id));
  allProductsLocal = allProductsLocal.concat(newItems);
  if (!silent) renderProductsBatch(newItems);
  if (allProductsLocal.length === 0) document.getElementById('allProductsEmpty').classList.remove('hidden');
  else document.getElementById('allProductsEmpty').classList.add('hidden');
  const loadBtn = document.getElementById('loadMoreProductsBtn');
  if (hasMoreProducts) loadBtn.classList.remove('hidden'); else loadBtn.classList.add('hidden');
}

async function loadCategories(force) {
  try {
    const storesData = await fetchWithCache('stores_list', async () => {
      const snap = await db.collection('stores').limit(50).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, force, CONFIG.CACHE_TTL_STORES);
    const cats = [];
    storesData.forEach(s => { const c = s.category; if (c && String(c).trim() !== '' && cats.indexOf(c) === -1) cats.push(c); });
    categories = cats;
    displayCategories();
  } catch(err){ console.error(err); }
}

/* ═══════════════════════════════════════════════════════════
   🛡️ SERVER-BASED FOLLOW SYSTEM (Anti-Cheat)
   ═══════════════════════════════════════════════════════════ */

/* Sync followed stores from server (source of truth) */
async function syncFollowedStoresFromServer() {
  try {
    const ok = await ensureAuth();
    if (!ok) return;
    const fingerprint = await getDeviceFingerprint();
    const snap = await db.collection('store_follows')
      .where('fingerprint', '==', fingerprint)
      .get();
    const serverIds = new Set();
    snap.docs.forEach(d => {
      const data = d.data();
      if (data && data.storeId) serverIds.add(String(data.storeId));
    });
    _followedFromServer = serverIds;
    // Merge with local cache
    const localList = getFollowedStores();
    const merged = new Set([...localList.map(String), ...serverIds]);
    saveFollowedStores(Array.from(merged));
    // Migrate local-only follows to server (best-effort, one-time)
    const localOnly = localList.filter(id => !serverIds.has(String(id)));
    if (localOnly.length) {
      migrateLocalFollowsToServer(localOnly, fingerprint).catch(() => {});
    }
    // Refresh UI
    renderFollowedStores();
    document.querySelectorAll('.store-card button[data-store-id]').forEach(btn => {
      if (serverIds.has(String(btn.dataset.storeId))) {
        setCardFollowState(btn, true);
      }
    });
  } catch(err) {
    console.warn('[BZR] Sync follows failed:', err);
  }
}

/* Migrate local-only follows to server (one-time per device) */
async function migrateLocalFollowsToServer(storeIds, fingerprint) {
  try {
    const batch = db.batch();
    let count = 0;
    for (const sid of storeIds) {
      const docId = sid + '_' + fingerprint;
      const ref = db.collection('store_follows').doc(docId);
      batch.set(ref, {
        storeId: String(sid),
        fingerprint: fingerprint,
        ua: navigator.userAgent.substring(0, 200),
        lang: navigator.language || 'ar',
        platform: navigator.platform || 'unknown',
        tz: new Date().getTimezoneOffset(),
        migrated: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      count++;
      if (count >= 400) break; // batch limit
    }
    if (count > 0) await batch.commit();
    console.log('[BZR] Migrated ' + count + ' follows to server');
  } catch(err) {
    console.warn('[BZR] Migration failed:', err);
  }
}

/* Perform follow toggle via Firestore transaction (atomic) */
async function performFollowToggle(store) {
  const storeId = String(getStoreId(store));
  await ensureAuth();
  const fingerprint = await getDeviceFingerprint();
  const followDocId = storeId + '_' + fingerprint;
  const followRef = db.collection('store_follows').doc(followDocId);
  const storeRef = db.collection('stores').doc(storeId);

  return await db.runTransaction(async (transaction) => {
    const followDoc = await transaction.get(followRef);

    if (followDoc.exists) {
      // ✅ Unfollow
      transaction.delete(followRef);
      transaction.set(storeRef, {
        followers: firebase.firestore.FieldValue.increment(-1)
      }, { merge: true });
      return { action: 'unfollowed', storeId };
    } else {
      // ✅ Follow (new)
      transaction.set(followRef, {
        storeId: storeId,
        fingerprint: fingerprint,
        ua: navigator.userAgent.substring(0, 200),
        lang: navigator.language || 'ar',
        platform: navigator.platform || 'unknown',
        tz: new Date().getTimezoneOffset(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      transaction.set(storeRef, {
        followers: firebase.firestore.FieldValue.increment(1)
      }, { merge: true });
      return { action: 'followed', storeId };
    }
  });
}

/* Check follow status from server */
async function checkFollowStatusFromServer(storeId) {
  try {
    const fingerprint = await getDeviceFingerprint();
    const docId = String(storeId) + '_' + fingerprint;
    const doc = await db.collection('store_follows').doc(docId).get();
    return doc.exists;
  } catch(e) { return false; }
}

/* ═══ RENDER STORES ═══ */
function displayStores() {
  const c = document.getElementById('storesScrollContainer');
  c.innerHTML = '';
  const frag = document.createDocumentFragment();
  stores.forEach(s => frag.appendChild(createStoreCard(s)));
  c.appendChild(frag);
}
function createStoreCard(store) {
  const storeId = getStoreId(store);
  const followed = isStoreFollowed(storeId);
  const card = document.createElement('div'); card.className = 'store-card';
  const cover = document.createElement('img'); cover.className = 'cover-image'; cover.loading = 'lazy'; cover.alt = store.name || '';
  cover.src = optimizeCloudinaryUrl(store.cover_url) || 'https://via.placeholder.com/600x300/FF7A00/FFFFFF?text=Cover';
  cover.onerror = function(){ this.src = 'https://via.placeholder.com/600x300/FF7A00/FFFFFF?text=Cover'; };
  const logo = document.createElement('img'); logo.className = 'store-logo'; logo.loading = 'lazy'; logo.alt = '';
  logo.src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  logo.onerror = function(){ this.src = 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store'; };
  const info = document.createElement('div'); info.className = 'store-info';
  const nameRow = document.createElement('div'); nameRow.className = 'store-name';
  if (store.is_verified) { const v = document.createElement('span'); v.className = 'verified-icon'; v.innerHTML = VERIFIED_BADGE_SVG; nameRow.appendChild(v); }
  const nameText = document.createElement('span'); nameText.textContent = store.name || ''; nameRow.appendChild(nameText);
  const catRow = document.createElement('div'); catRow.className = 'store-category'; catRow.textContent = store.category || 'عام';
  const bottomRow = document.createElement('div'); bottomRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;';
  const followBtn = document.createElement('button'); followBtn.style.cssText = 'background:#FF7A00;color:#fff;border:1.5px solid #FF7A00;border-radius:9999px;padding:0.3rem 0.7rem;font-size:0.7rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all 0.25s;white-space:nowrap;';
  followBtn.dataset.storeId = storeId;
  setCardFollowState(followBtn, followed);
  followBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); haptic('light'); toggleFollowFromCard(store, followBtn); });
  const shareBtn = document.createElement('button'); shareBtn.style.cssText = 'width:30px;height:30px;border-radius:50%;background:var(--c-primary-soft);color:#FF7A00;border:1.5px solid #FFE0BD;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;transition:all 0.25s;padding:0;';
  shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
  shareBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); haptic('light'); shareStore(store); });
  bottomRow.appendChild(followBtn); bottomRow.appendChild(shareBtn);
  info.appendChild(nameRow); info.appendChild(catRow); info.appendChild(bottomRow);
  card.appendChild(cover); card.appendChild(logo); card.appendChild(info);
  card.addEventListener('click', () => { haptic('light'); openStoreModal(store); });
  return card;
}
function setCardFollowState(btn, following) {
  btn.classList.toggle('following', following);
  btn.innerHTML = following ? '<i class="fas fa-check"></i><span>متابَع</span>' : '<i class="fas fa-plus"></i><span>متابعة</span>';
  if (following) { btn.style.background = 'transparent'; btn.style.color = '#FF7A00'; }
  else { btn.style.background = '#FF7A00'; btn.style.color = '#fff'; }
}

/* ✅ Anti-cheat toggle with fingerprint + Firestore transaction */
async function toggleFollowFromCard(store, btn) {
  const storeId = String(getStoreId(store));
  if (btn.disabled) return;
  // Cooldown to prevent rapid-fire
  const now = Date.now();
  if (now - _lastFollowAction < CONFIG.FOLLOW_COOLDOWN_MS) {
    showToast('رجاء الانتظار قليلاً');
    return;
  }
  _lastFollowAction = now;
  btn.disabled = true;
  haptic('light');

  try {
    const result = await performFollowToggle(store);
    const action = result.action;
    const wasFollowing = (action === 'unfollowed');

    // Update server cache
    if (wasFollowing) _followedFromServer.delete(storeId);
    else _followedFromServer.add(storeId);

    // Update local list
    const list = getFollowedStores();
    if (wasFollowing) {
      const i = list.indexOf(storeId);
      if (i > -1) list.splice(i, 1);
      store.followers = Math.max(0, (parseInt(store.followers) || 0) - 1);
    } else {
      if (list.indexOf(storeId) === -1) list.push(storeId);
      store.followers = (parseInt(store.followers) || 0) + 1;
    }
    saveFollowedStores(list);

    updateCardFollowButtons(storeId);
    renderFollowedStores();

    if (currentStoreId === storeId) {
      isFollowing = !wasFollowing;
      currentFollowersCount = store.followers;
      updateFollowersDisplay();
      updateFollowButtonUI();
    }

    showToast(wasFollowing ? 'تم إلغاء المتابعة' : 'تمت المتابعة بنجاح!');
    haptic('medium');
  } catch(err) {
    console.error('[BZR] Follow error:', err);
    showToast('حدث خطأ، حاول مرة أخرى');
  } finally {
    btn.disabled = false;
  }
}

function updateCardFollowButtons(storeId) {
  const following = isStoreFollowed(storeId);
  document.querySelectorAll('.store-card button[data-store-id]').forEach(btn => { if (btn.dataset.storeId === storeId) setCardFollowState(btn, following); });
}
function renderFollowedStores() {
  const section = document.getElementById('followedStoresSection');
  const container = document.getElementById('followedStoresContainer');
  const badge = document.getElementById('followedCountBadge');
  const ids = getFollowedStores();
  if (!ids.length) { section.classList.add('hidden'); container.innerHTML = ''; if (badge) badge.textContent = ''; return; }
  const followed = ids.map(id => stores.find(s => getStoreId(s) === id)).filter(Boolean);
  if (!followed.length) { section.classList.add('hidden'); container.innerHTML = ''; return; }
  section.classList.remove('hidden');
  if (badge) badge.textContent = followed.length + ' متجر';
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  followed.forEach(store => {
    const item = document.createElement('div'); item.className = 'followed-store-item';
    const avatar = document.createElement('div'); avatar.className = 'followed-store-avatar';
    const img = document.createElement('img'); img.loading = 'lazy'; img.alt = ''; img.draggable = false;
    img.src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
    img.onerror = function(){ this.src = 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store'; };
    avatar.appendChild(img);
    const nm = document.createElement('div'); nm.className = 'followed-store-name'; nm.textContent = store.name || '';
    item.appendChild(avatar); item.appendChild(nm);
    item.addEventListener('click', () => { haptic('light'); openStoreModal(store); });
    frag.appendChild(item);
  });
  container.appendChild(frag);
}
function filterStoresByCategory(cat) {
  currentCategory = cat;
  const filtered = stores.filter(s => s.category === cat);
  const c = document.getElementById('storesScrollContainer');
  c.innerHTML = '';
  if (filtered.length === 0) c.innerHTML = '<div style="text-align:center;width:100%;padding:2.5rem 0;color:var(--c-text-soft);">لا توجد متاجر في هذه الفئة</div>';
  else { const frag = document.createDocumentFragment(); filtered.forEach(s => frag.appendChild(createStoreCard(s))); c.appendChild(frag); }
  lastStoresInteraction = Date.now();
  startAutoScroll();
}

/* ═══ CATEGORIES ═══ */
function displayCategories() {
  const c = document.getElementById('categoriesContainer');
  c.innerHTML = '';
  const frag = document.createDocumentFragment();
  const allBtn = document.createElement('button'); allBtn.className = 'chip active'; allBtn.textContent = 'الكل';
  allBtn.addEventListener('click', () => {
    haptic('light');
    currentCategory = null;
    displayStores();
    highlightCategory(allBtn);
    startAutoScroll();
    applyProductsFilter(null);
  });
  frag.appendChild(allBtn);
  categories.forEach(cat => {
    const btn = document.createElement('button'); btn.className = 'chip'; btn.textContent = cat;
    btn.addEventListener('click', () => { haptic('light'); filterStoresByCategory(cat); highlightCategory(btn); applyProductsFilter(cat); });
    frag.appendChild(btn);
  });
  c.appendChild(frag);
}
function highlightCategory(active) {
  document.getElementById('categoriesContainer').querySelectorAll('button').forEach(b => b.classList.remove('active'));
  active.classList.add('active');
}

/* ═══ STORE MODAL ═══ */
function openStoreModal(store) {
  currentStore = store;
  currentStoreId = String(getStoreId(store));
  currentFollowersCount = parseInt(store.followers) || 0;
  isFollowing = isStoreFollowed(currentStoreId);
  document.getElementById('storeCoverImage').src = optimizeCloudinaryUrl(store.cover_url) || 'https://via.placeholder.com/1200x600/FF7A00/FFFFFF?text=Cover';
  document.getElementById('storeLogo').src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  document.getElementById('storeDescription').textContent = store.description || 'متجر مميز';
  document.getElementById('storeRating').textContent = (parseFloat(store.ratting) || 0).toFixed(1);
  const catVal = (store.category && String(store.category).trim()) ? store.category : 'عام';
  document.getElementById('storeCategory').innerHTML = '<i class="fas fa-tag"></i><span>' + sanitizeHTML(catVal) + '</span>';
  updateFollowersDisplay(); updateFollowButtonUI();
  if (store.is_verified) {
    const storeNameEl = document.getElementById('storeName');
    storeNameEl.innerHTML = '';
    const badge = document.createElement('span');
    badge.className = 'verified-icon';
    badge.style.cssText = 'display:inline-flex;width:20px;height:20px;flex-shrink:0;';
    badge.innerHTML = VERIFIED_BADGE_SVG;
    const nameTxt = document.createElement('span');
    nameTxt.textContent = store.name || '';
    storeNameEl.appendChild(badge);
    storeNameEl.appendChild(nameTxt);
  } else {
    document.getElementById('storeName').textContent = store.name || '';
  }
  const phone = store.phone_number || '', wa = store.whatsapp_number || '';
  const callBtn = document.getElementById('storeCallButton');
  const waBtn = document.getElementById('storeWhatsAppButton');
  if (phone) { callBtn.href = 'tel:' + phone; callBtn.style.display = ''; } else callBtn.style.display = 'none';
  if (wa) { waBtn.href = 'https://wa.me/' + wa.replace(/[^0-9]/g, ''); waBtn.style.display = ''; } else waBtn.style.display = 'none';
  loadStoreProducts(store.name);
  document.getElementById('storeModal').classList.remove('hidden');
  updateBodyScroll();
  document.getElementById('storeModal').querySelector('.modal-content').scrollTop = 0;
  bzrPushModal();

  // ✅ Sync follow status with server in background
  const storeIdSnapshot = currentStoreId;
  checkFollowStatusFromServer(storeIdSnapshot).then(serverFollowing => {
    if (currentStoreId !== storeIdSnapshot) return; // modal changed
    if (serverFollowing !== isFollowing) {
      isFollowing = serverFollowing;
      if (serverFollowing) _followedFromServer.add(storeIdSnapshot);
      else _followedFromServer.delete(storeIdSnapshot);
      // Update localStorage too
      const list = getFollowedStores();
      if (serverFollowing && list.indexOf(storeIdSnapshot) === -1) {
        list.push(storeIdSnapshot); saveFollowedStores(list);
      } else if (!serverFollowing) {
        const i = list.indexOf(storeIdSnapshot);
        if (i > -1) { list.splice(i, 1); saveFollowedStores(list); }
      }
      updateFollowButtonUI();
      updateCardFollowButtons(storeIdSnapshot);
      renderFollowedStores();
    }
  }).catch(() => {});
}
function closeStoreModalInternal() {
  document.getElementById('storeModal').classList.add('hidden');
  updateBodyScroll();
  currentStore = null; currentStoreId = null;
}
function closeStoreModal() { closeStoreModalInternal(); bzrCloseModalUI(); }
document.getElementById('closeStoreModal')?.addEventListener('click', closeStoreModal);
function updateFollowersDisplay() { document.getElementById('storeFollowers').textContent = currentFollowersCount.toLocaleString(); }
function updateFollowButtonUI() {
  const btn = document.getElementById('storeFollowButton');
  const txt = document.getElementById('storeFollowText');
  if (!btn || !txt) return;
  if (isFollowing) { btn.classList.add('following'); txt.textContent = 'متابَع'; btn.querySelector('i').className = 'fas fa-check'; }
  else { btn.classList.remove('following'); txt.textContent = 'متابعة'; btn.querySelector('i').className = 'fas fa-heart'; }
}

/* ✅ Anti-cheat follow from Store Modal */
document.getElementById('storeFollowButton')?.addEventListener('click', async () => {
  if (!currentStoreId || isUpdatingFollow || !currentStore) return;
  const now = Date.now();
  if (now - _lastFollowAction < CONFIG.FOLLOW_COOLDOWN_MS) {
    showToast('رجاء الانتظار قليلاً');
    return;
  }
  _lastFollowAction = now;
  isUpdatingFollow = true;
  const btn = document.getElementById('storeFollowButton'); 
  btn.disabled = true;
  const wasFollowing = isFollowing;
  document.getElementById('storeFollowText').textContent = 'جاري...';
  haptic('light');

  try {
    const result = await performFollowToggle(currentStore);
    const action = result.action;
    const nowFollowing = (action === 'followed');
    isFollowing = nowFollowing;

    if (nowFollowing) _followedFromServer.add(currentStoreId);
    else _followedFromServer.delete(currentStoreId);

    // Update local list
    const list = getFollowedStores();
    if (!nowFollowing) {
      const i = list.indexOf(currentStoreId);
      if (i > -1) list.splice(i, 1);
      currentFollowersCount = Math.max(0, currentFollowersCount - 1);
    } else {
      if (list.indexOf(currentStoreId) === -1) list.push(currentStoreId);
      currentFollowersCount = currentFollowersCount + 1;
    }
    saveFollowedStores(list);

    updateFollowersDisplay(); 
    updateFollowButtonUI();
    updateCardFollowButtons(currentStoreId); 
    renderFollowedStores();
    showToast(nowFollowing ? 'تمت المتابعة بنجاح!' : 'تم إلغاء المتابعة');
    if (currentStore) currentStore.followers = currentFollowersCount;
  } catch(err) {
    console.error('[BZR] Follow error:', err);
    showToast('حدث خطأ');
    isFollowing = wasFollowing; 
    updateFollowButtonUI(); 
    updateFollowersDisplay();
  } finally { 
    isUpdatingFollow = false; 
    btn.disabled = false; 
  }
});

/* ═══ STORE PRODUCTS ═══ */
async function loadStoreProducts(storeName) {
  const grid = document.getElementById('storeProductsGrid');
  const loadMoreBtn = document.getElementById('loadMoreStoreProductsBtn');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem 0;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF7A00;"></i></div>';
  loadMoreBtn.classList.add('hidden');
  currentStoreNameForProducts = storeName;
  storeProductsLastDoc = null;
  storeProductsHasMore = false;
  const cacheKey = 'store_products_page1_' + storeName;
  const cached = cacheManager.get(cacheKey);
  if (cached && Array.isArray(cached.items)) {
    if (!cached.items.length) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">لا توجد منتجات</div>';
    else renderStoreProducts(cached.items);
    storeProductsHasMore = cached.hasMore === true;
    if (storeProductsHasMore) loadMoreBtn.classList.remove('hidden');
    return;
  }
  try {
    let q = db.collection('products').where('store_name', '==', storeName).limit(CONFIG.STORE_PRODUCTS_PER_PAGE);
    try { q = q.orderBy('created_at', 'desc'); } catch(e){}
    const snap = await q.get();
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (snap.docs.length > 0) storeProductsLastDoc = snap.docs[snap.docs.length - 1];
    storeProductsHasMore = snap.docs.length === CONFIG.STORE_PRODUCTS_PER_PAGE;
    if (!list.length) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">لا توجد منتجات</div>';
    else {
      renderStoreProducts(list);
      if (storeProductsHasMore) loadMoreBtn.classList.remove('hidden');
      cacheManager.set(cacheKey, { items: list, hasMore: storeProductsHasMore }, CONFIG.CACHE_TTL_PRODUCTS);
    }
  } catch(err) {
    try {
      const snap = await db.collection('products').where('store_name', '==', storeName).limit(CONFIG.STORE_PRODUCTS_PER_PAGE).get();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (snap.docs.length > 0) storeProductsLastDoc = snap.docs[snap.docs.length - 1];
      storeProductsHasMore = snap.docs.length === CONFIG.STORE_PRODUCTS_PER_PAGE;
      if (!list.length) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">لا توجد منتجات</div>';
      else { renderStoreProducts(list); if (storeProductsHasMore) loadMoreBtn.classList.remove('hidden'); }
    } catch(e2){ grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">تعذر التحميل</div>'; }
  }
}
document.getElementById('loadMoreStoreProductsBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('loadMoreStoreProductsBtn');
  if (btn.disabled || !storeProductsHasMore || !currentStoreNameForProducts || !storeProductsLastDoc) return;
  btn.disabled = true;
  haptic('light');
  try {
    let q = db.collection('products').where('store_name', '==', currentStoreNameForProducts).startAfter(storeProductsLastDoc).limit(CONFIG.STORE_PRODUCTS_PER_PAGE);
    try { q = q.orderBy('created_at', 'desc'); } catch(e){}
    const snap = await q.get();
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (snap.docs.length > 0) storeProductsLastDoc = snap.docs[snap.docs.length - 1];
    storeProductsHasMore = snap.docs.length === CONFIG.STORE_PRODUCTS_PER_PAGE;
    if (list.length) renderStoreProducts(list, true);
    if (!storeProductsHasMore) btn.classList.add('hidden');
  } catch(e){ showToast('تعذر تحميل المزيد'); }
  btn.disabled = false;
});
function renderStoreProducts(products, append) {
  const grid = document.getElementById('storeProductsGrid');
  if (!append) grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  products.forEach(product => {
    const price = parseFloat(product.price) || 0;
    const rating = parseFloat(product.ratting) || 0;
    const fav = isProductFav(product.id);
    const pm = { id: product.id, name: product.name, img_url: product.img_url, price, original_price: product.original_price ? parseFloat(product.original_price) : null, ratting: rating, store_name: product.store_name, description: product.description || '', colors: product.colors || null };
    const card = document.createElement('div'); card.className = 'store-product-card';
    const favBtn = document.createElement('button');
    favBtn.className = 'store-product-fav' + (fav ? ' active' : '');
    favBtn.innerHTML = '<i class="' + (fav ? 'fas' : 'far') + ' fa-heart"></i>';
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation(); haptic('light');
      const now = toggleProductFav(product.id);
      favBtn.classList.toggle('active', now);
      favBtn.innerHTML = '<i class="' + (now ? 'fas' : 'far') + ' fa-heart"></i>';
      showToast(now ? 'أُضيف للمفضلة' : 'أُزيل');
    });
    const imgWrap = document.createElement('div'); imgWrap.className = 'store-product-img-wrap';
    const img = document.createElement('img'); img.loading = 'lazy'; img.alt = product.name || ''; img.src = optimizeCloudinaryUrl(product.img_url) || 'https://via.placeholder.com/300';
    img.onerror = function(){ this.src = 'https://via.placeholder.com/300'; };
    imgWrap.appendChild(img);
    const info = document.createElement('div'); info.className = 'store-product-info';
    const nameEl = document.createElement('div'); nameEl.className = 'store-product-name'; nameEl.textContent = product.name || '';
    const ratingEl = document.createElement('div'); ratingEl.className = 'store-product-rating'; ratingEl.innerHTML = '<span>' + rating + '</span> <i class="fas fa-star"></i>';
    info.appendChild(nameEl); info.appendChild(ratingEl);
    const priceEl = document.createElement('div'); priceEl.className = 'store-product-price'; priceEl.textContent = price.toLocaleString() + ' ج.س';
    info.appendChild(priceEl);
    const viewBtn = document.createElement('button'); viewBtn.className = 'store-product-btn ripple'; viewBtn.innerHTML = '<span>عرض</span> <i class="fas fa-chevron-left"></i>';
    viewBtn.addEventListener('click', (e) => { e.stopPropagation(); haptic('light'); openProductModal(pm); });
    info.appendChild(viewBtn);
    card.appendChild(favBtn); card.appendChild(imgWrap); card.appendChild(info);
    card.addEventListener('click', () => { haptic('light'); openProductModal(pm); });
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ═══════════════════════════════════════════════════════════
   ✅ PRODUCT MODAL — with original image button
   ═══════════════════════════════════════════════════════════ */
let currentModalProduct = null, selectedColorVariant = null;

function openProductModal(product) {
  currentModalProduct = product;
  selectedColorVariant = null;

  const defaultImg = optimizeCloudinaryUrl(product.img_url) || 'https://via.placeholder.com/600';
  const imgEl = document.getElementById('productModalImage');

  imgEl.src = defaultImg;
  imgEl.style.opacity = '1';
  imgEl.onerror = function(){ this.src = 'https://via.placeholder.com/600'; };

  document.getElementById('productModalName').textContent = product.name;
  document.getElementById('productModalRating').textContent = product.ratting || 0;
  document.getElementById('productModalStore').textContent = product.store_name || 'غير محدد';
  document.getElementById('productModalPrice').textContent = (product.price || 0).toLocaleString() + ' ج.س';

  const origEl = document.getElementById('productModalOriginalPrice');
  if (product.original_price) { origEl.textContent = product.original_price.toLocaleString() + ' ج.س'; origEl.classList.remove('hidden'); }
  else { origEl.textContent = ''; origEl.classList.add('hidden'); }

  const colorsContainer = document.getElementById('productColorsContainer');
  const swatchesContainer = document.getElementById('productColorSwatches');
  const selColorName = document.getElementById('selectedColorName');
  swatchesContainer.innerHTML = '';

  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    colorsContainer.classList.remove('hidden');
    colorsContainer.style.display = 'flex';
    selColorName.textContent = 'الأصلي';
    const frag = document.createDocumentFragment();

    const originalBtn = document.createElement('div');
    originalBtn.className = 'color-swatch active';
    originalBtn.title = 'الصورة الأصلية';
    originalBtn.style.cssText = 'background:linear-gradient(135deg,#FF7A00,#FFA64D);display:flex;align-items:center;justify-content:center;position:relative;';
    originalBtn.innerHTML = '<i class="fas fa-image" style="color:#fff;font-size:14px;pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,0.3);"></i>';
    originalBtn.addEventListener('click', () => {
      if (selectedColorVariant === null) return;
      haptic('light');
      imgEl.style.opacity = '0';
      setTimeout(() => {
        selectedColorVariant = null;
        imgEl.src = defaultImg;
        imgEl.onload = () => { imgEl.style.opacity = '1'; };
      }, 200);
      document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
      originalBtn.classList.add('active');
      selColorName.textContent = 'الأصلي';
      updateModalActionButtons();
    });
    frag.appendChild(originalBtn);

    product.colors.forEach((color) => {
      const swatch = document.createElement('div');
      const hex = safeHex(color && color.hex) || getFallbackHex(color && color.name);
      const isLight = ['#ffffff','#fff','#f8f9fa','white'].indexOf(String(hex).toLowerCase()) > -1;
      swatch.className = 'color-swatch ' + (isLight ? 'light-color' : '');
      swatch.style.backgroundColor = hex;
      swatch.title = String(color && color.name || '');
      swatch.addEventListener('click', () => {
        if (selectedColorVariant && selectedColorVariant.name === color.name) return;
        haptic('light');
        imgEl.style.opacity = '0';
        setTimeout(() => {
          selectedColorVariant = color;
          imgEl.src = optimizeCloudinaryUrl(color.image) || defaultImg;
          imgEl.onload = () => { imgEl.style.opacity = '1'; };
        }, 200);
        document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
        swatch.classList.add('active');
        selColorName.textContent = color.name;
        updateModalActionButtons();
      });
      frag.appendChild(swatch);
    });
    swatchesContainer.appendChild(frag);
  } else {
    colorsContainer.classList.add('hidden');
    colorsContainer.style.display = 'none';
  }

  document.getElementById('productModal').classList.remove('hidden');
  updateBodyScroll();
  updateModalActionButtons();
  bzrPushModal();
}
function closeProductModalInternal() { document.getElementById('productModal').classList.add('hidden'); updateBodyScroll(); }
function closeProductModal() { closeProductModalInternal(); bzrCloseModalUI(); }
function updateModalActionButtons() {
  const p = { ...currentModalProduct };
  if (selectedColorVariant) { p.selectedColor = selectedColorVariant.name; p.img_url = selectedColorVariant.image || currentModalProduct.img_url; }
  document.getElementById('addToCartFromModal').dataset.product = JSON.stringify(p);
  document.getElementById('buyNowFromModal').dataset.product = JSON.stringify(p);
}
document.getElementById('closeProductModal')?.addEventListener('click', closeProductModal);
document.getElementById('productModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('productModal')) closeProductModal(); });
document.getElementById('addToCartFromModal')?.addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const p = JSON.parse(btn.dataset.product);
  addToCart(p);
  haptic('medium');
  btn.style.background = 'linear-gradient(135deg,#10B981,#059669)';
  btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
  setTimeout(() => { btn.style.background = ''; btn.innerHTML = '<i class="fas fa-shopping-bag"></i> أضف إلى السلة'; }, 1500);
});
document.getElementById('buyNowFromModal')?.addEventListener('click', (e) => {
  const p = JSON.parse(e.currentTarget.dataset.product);
  const store = stores.find(s => s.name === p.store_name);
  let wa = store && store.whatsapp_number ? store.whatsapp_number : '';
  if (!wa) { showToast('رقم الواتساب غير متوفر'); return; }
  haptic('medium');
  const msg = 'مرحباً، أريد شراء:\n\n' + p.name + '\n' + (p.selectedColor ? 'اللون: ' + p.selectedColor + '\n' : '') + 'السعر: ' + (p.price || 0).toLocaleString() + ' ج.س\n' + (p.store_name ? 'من متجر: ' + p.store_name : '');
  window.open('https://wa.me/' + wa.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
});

/* ═══ CART ═══ */
function addToCart(product) {
  const store = stores.find(s => s.name === product.store_name);
  const cartItemId = product.selectedColor ? product.id + '_' + product.selectedColor : product.id;
  const item = { ...product, cartItemId, quantity: 1, store_whatsapp: store?.whatsapp_number || '' };
  const existing = cart.find(i => (i.cartItemId || i.id) === cartItemId);
  if (existing) existing.quantity += 1; else cart.push(item);
  updateCartUI();
  try { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch(e){}
  animateCartBounce();
  showToast('تمت الإضافة إلى السلة');
}
function animateCartBounce() {
  const btn = document.getElementById('cartButton');
  if (!btn) return;
  btn.classList.add('bounce');
  setTimeout(() => btn.classList.remove('bounce'), 650);
}
function updateCartUI() {
  const totalItems = cart.reduce((s,i) => s + i.quantity, 0);
  const cc = document.getElementById('cartCount');
  if (cc) { if (totalItems > 0) { cc.textContent = totalItems > 99 ? '99+' : totalItems; cc.style.display = 'flex'; } else cc.style.display = 'none'; }
  const items = document.getElementById('cartItems');
  items.innerHTML = '';
  if (cart.length === 0) items.innerHTML = '<div style="text-align:center;color:var(--c-text-soft);padding:2.5rem 0;"><i class="fas fa-shopping-bag" style="font-size:3rem;margin-bottom:1rem;display:block;color:#CBD5E1;"></i><p style="font-weight:700;">السلة فارغة</p></div>';
  else {
    const frag = document.createDocumentFragment();
    cart.forEach(item => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--c-border);';
      const itemId = item.cartItemId || item.id;
      div.innerHTML = '<img src="' + sanitizeHTML(optimizeCloudinaryUrl(item.img_url) || 'https://via.placeholder.com/80') + '" class="cart-item-image" alt="" loading="lazy">' +
        '<div style="flex:1;min-width:0;"><h5 style="font-weight:800;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--c-text);margin:0;">' + sanitizeHTML(item.name) + '</h5>' +
        (item.store_name ? '<span style="font-size:0.72rem;color:#FF7A00;font-weight:800;display:block;">' + sanitizeHTML(item.store_name) + '</span>' : '') +
        (item.selectedColor ? '<span style="font-size:0.7rem;color:var(--c-text-soft);font-weight:700;background:var(--c-surface-2);padding:2px 8px;border-radius:6px;display:inline-block;margin-top:4px;">اللون: ' + sanitizeHTML(item.selectedColor) + '</span>' : '') +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;"><button class="decrease-btn" data-id="' + itemId + '" style="width:26px;height:26px;border-radius:50%;background:var(--c-surface-2);border:none;font-weight:800;cursor:pointer;color:var(--c-text);">−</button><span style="font-weight:800;color:var(--c-text);min-width:20px;text-align:center;">' + item.quantity + '</span><button class="increase-btn" data-id="' + itemId + '" style="width:26px;height:26px;border-radius:50%;background:var(--c-surface-2);border:none;font-weight:800;cursor:pointer;color:var(--c-text);">+</button></div></div>' +
        '<div style="text-align:left;flex-shrink:0;"><div style="font-weight:900;color:#FF7A00;">' + (item.price * item.quantity).toLocaleString() + ' ج.س</div>' +
        '<button class="remove-btn" data-id="' + itemId + '" style="color:#EF4444;margin-top:4px;background:none;border:none;cursor:pointer;font-size:0.85rem;"><i class="fas fa-trash"></i></button></div>';
      frag.appendChild(div);
    });
    items.appendChild(frag);
    items.querySelectorAll('.decrease-btn').forEach(b => b.onclick = () => { haptic('light'); changeQuantity(b.dataset.id, -1); });
    items.querySelectorAll('.increase-btn').forEach(b => b.onclick = () => { haptic('light'); changeQuantity(b.dataset.id, 1); });
    items.querySelectorAll('.remove-btn').forEach(b => b.onclick = () => { haptic('light'); removeFromCart(b.dataset.id); });
  }
  const total = cart.reduce((s,i) => s + i.price * i.quantity, 0);
  const ct = document.getElementById('cartTotal');
  if (ct) ct.querySelector('span:last-child').textContent = total.toLocaleString() + ' ج.س';
  updateBottomNavBadge();
}
function changeQuantity(id, delta) {
  const item = cart.find(i => (i.cartItemId || i.id) === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  updateCartUI();
  try { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch(e){}
}
function removeFromCart(id) {
  cart = cart.filter(i => (i.cartItemId || i.id) !== id);
  updateCartUI();
  try { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch(e){}
  showToast('تمت الإزالة');
}
function openCart() { document.getElementById('cartSidebar').classList.add('open'); updateBodyScroll(); setActiveNav('cart'); bzrPushModal(); }
function closeCartInternal() { document.getElementById('cartSidebar').classList.remove('open'); updateBodyScroll(); setActiveNav('home'); }
function closeCart() { closeCartInternal(); bzrCloseModalUI(); }
document.getElementById('cartButton')?.addEventListener('click', () => { haptic('light'); openCart(); });
document.getElementById('closeCart')?.addEventListener('click', closeCart);
document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
document.getElementById('continueShopping')?.addEventListener('click', closeCart);

/* ═══ CART - WhatsApp Order ═══ */
document.getElementById('whatsappOrder')?.addEventListener('click', () => {
  if (cart.length === 0) { showToast('السلة فارغة'); return; }
  haptic('medium');

  let msg = '🛒 *طلب جديد من BranZar*\n\n';
  msg += '📋 *تفاصيل الطلب:*\n';
  msg += '━━━━━━━━━━━━━━\n';

  cart.forEach((item, index) => {
    msg += `${index + 1}. *${item.name}*\n`;
    msg += `   • الكمية: ${item.quantity}\n`;
    msg += `   • السعر: ${(item.price * item.quantity).toLocaleString()} ج.س\n`;
    if (item.selectedColor) msg += `   • اللون: ${item.selectedColor}\n`;
    if (item.store_name) msg += `   • المتجر: ${item.store_name}\n`;
    msg += '\n';
  });

  msg += '━━━━━━━━━━━━━━\n';
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  msg += `💰 *المجموع الكلي:* ${total.toLocaleString()} ج.س\n\n`;
  msg += `📦 عدد المنتجات: ${cart.reduce((s, i) => s + i.quantity, 0)}\n\n`;
  msg += `شكراً لاستخدامكم BranZar 🌟`;

  const whatsappUrl = 'https://wa.me/' + CONFIG.FIXED_WHATSAPP + '?text=' + encodeURIComponent(msg);
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});

/* ═══ SHARE STORE + DYNAMIC META TAGS ═══ */
function updateMetaTagsForStore(store) {
  if (!store) return;
  const storeName = store.name || 'BranZar';
  const storeDesc = (store.description && String(store.description).trim()) 
    ? store.description 
    : 'اكتشف أفضل المتاجر والبراندات السودانية والعالمية في مكان واحد. تسوق الآن🛒🛍️';
  const storeImage = optimizeCloudinaryUrl(store.cover_url) 
    || optimizeCloudinaryUrl(store.logo_url) 
    || CONFIG.DEFAULT_OG_IMAGE;
  const storeUrl = window.location.origin + window.location.pathname + '?store=' + encodeURIComponent(String(getStoreId(store)));

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', storeName + ' | BranZar');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', storeDesc);
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute('content', storeImage);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', storeUrl);

  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', storeName + ' | BranZar');
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', storeDesc);
  const twImage = document.querySelector('meta[name="twitter:image"]');
  if (twImage) twImage.setAttribute('content', storeImage);

  document.title = storeName + ' | BranZar';
}

document.getElementById('storeShareBtn')?.addEventListener('click', () => { if (currentStore) shareStore(currentStore); });

async function shareStore(store) {
  if (!store) return;
  updateMetaTagsForStore(store);
  const storeId = String(getStoreId(store));
  const url = window.location.origin + window.location.pathname + '?store=' + encodeURIComponent(storeId);
  const shareText = `اكتشف متجر ${store.name} على BranZar 🛒🛍️\n${store.description || 'أفضل المنتجات والبراندات في مكان واحد'}`;

  if (navigator.share) {
    try { 
      await navigator.share({ title: store.name + ' | BranZar', text: shareText, url }); 
      haptic('medium'); 
      return; 
    }
    catch(err){ if (err && err.name === 'AbortError') return; }
  }
  try {
    if (navigator.clipboard) { 
      await navigator.clipboard.writeText(url); 
      showToast('✅ تم نسخ الرابط'); 
    }
  } catch(err){ showToast('تعذر النسخ'); }
}

/* ═══ REALTIME ═══ */
function setupRealtimeProducts() {
  if (allProductsUnsubscribe) return;
  try {
    allProductsUnsubscribe = db.collection('products').orderBy('created_at', 'desc').limit(30).onSnapshot((snap) => {
      snap.docChanges().forEach(change => {
        const doc = change.doc;
        const data = { id: doc.id, ...doc.data() };
        const idx = allProductsLocal.findIndex(p => p.id === data.id);
        if (change.type === 'added' || change.type === 'modified') {
          if (idx > -1) allProductsLocal[idx] = data;
          else allProductsLocal.unshift(data);
        } else if (change.type === 'removed') {
          if (idx > -1) allProductsLocal.splice(idx, 1);
        }
      });
      if (allProductsLocal.length > CONFIG.SEARCH_CAP) allProductsLocal = allProductsLocal.slice(0, CONFIG.SEARCH_CAP);
      cacheManager.set('all_products_page1', { items: allProductsLocal.slice(0, CONFIG.PRODUCTS_PER_PAGE), hasMore: hasMoreProducts }, CONFIG.CACHE_TTL_PRODUCTS);
    }, err => console.warn('[BZR] Products realtime:', err));
  } catch(e){ console.warn('[BZR] realtime setup failed:', e); }
}
function setupRealtimeStores() {
  if (storesPollInterval) return;
  const POLL_MS = 10 * 60 * 1000;
  function startPoll() {
    if (storesPollInterval) clearInterval(storesPollInterval);
    storesPollInterval = setInterval(() => {
      if (!isPageVisible) return;
      cacheManager.remove('stores_list');
      loadStores(true);
    }, POLL_MS);
  }
  startPoll();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) startPoll();
    else if (storesPollInterval) { clearInterval(storesPollInterval); storesPollInterval = null; }
  });
}

/* ═══ DEEP LINK ═══ */
async function handleDeepLink() {
  try {
    const params = new URLSearchParams(window.location.search);
    let storeId = params.get('store');
    if (!storeId) return;
    storeId = decodeURIComponent(storeId).trim();
    await new Promise(r => setTimeout(r, 1500));
    const store = stores.find(s => String(getStoreId(s)) === String(storeId));
    if (store) {
      updateMetaTagsForStore(store);
      try { window.history.replaceState({}, document.title, window.location.origin + window.location.pathname); } catch(e){}
      setTimeout(() => openStoreModal(store), 300);
    }
  } catch(err){}
}

/* ═══ KEYBOARD ═══ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (searchResults.classList.contains('show')) { searchResults.classList.remove('show'); return; }
    closeTopmostModal();
  }
});

/* ═══ NAV CONTROLS ═══ */
document.getElementById('categoriesContainer')?.addEventListener('wheel', (e) => {
  if (e.deltaY !== 0) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; }
}, { passive: false });
document.getElementById('prevStoresBtn')?.addEventListener('click', () => { const c = document.getElementById('storesScrollContainer'); lastStoresInteraction = Date.now(); c.scrollBy({ left: 300, behavior: 'smooth' }); });
document.getElementById('nextStoresBtn')?.addEventListener('click', () => { const c = document.getElementById('storesScrollContainer'); lastStoresInteraction = Date.now(); c.scrollBy({ left: -300, behavior: 'smooth' }); });
document.getElementById('prevCategoriesBtn')?.addEventListener('click', () => document.getElementById('categoriesContainer').scrollBy({ left: -200, behavior: 'smooth' }));
document.getElementById('nextCategoriesBtn')?.addEventListener('click', () => document.getElementById('categoriesContainer').scrollBy({ left: 200, behavior: 'smooth' }));

const storesContainer = document.getElementById('storesScrollContainer');
if (storesContainer) {
  ['pointerdown','pointerup','pointercancel','touchstart','touchend','touchcancel','wheel','mousedown','mouseup'].forEach(evt => {
    storesContainer.addEventListener(evt, () => { lastStoresInteraction = Date.now(); }, { passive: true });
  });
  storesContainer.addEventListener('mouseenter', () => { isHoveringStores = true; }, { passive: true });
  storesContainer.addEventListener('mouseleave', () => { isHoveringStores = false; lastStoresInteraction = Date.now(); }, { passive: true });
}

/* ═══ SERVICE WORKER ═══ */
let swRegistration = null;
let isReloading = false;
let updateCheckInterval = null;
let _updateButtonShownThisLoad = false;
let _lastUpdateCheck = 0;

function getSWVersionFromWorker(worker) {
  return new Promise((resolve) => {
    if (!worker) return resolve(null);
    const timeout = setTimeout(() => resolve(null), 1500);
    try {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => {
        clearTimeout(timeout);
        const v = e.data && e.data.version;
        resolve(typeof v === 'string' ? v : null);
      };
      worker.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
    } catch(e) {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}
function showUpdateButton() {
  const btn = document.getElementById('updateAvailableBtn');
  if (!btn || btn.classList.contains('show')) return;
  btn.classList.remove('hidden');
  requestAnimationFrame(() => {
    setTimeout(() => { btn.classList.add('show'); try { haptic('medium'); } catch(e){} }, 50);
  });
}
function triggerUpdate() {
  const btn = document.getElementById('updateAvailableBtn');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  const iconEl = btn.querySelector('.update-icon-wrap i');
  if (iconEl) { iconEl.className = 'fas fa-spinner fa-spin'; iconEl.style.animation = 'none'; }
  const strongEl = btn.querySelector('.update-text-wrap strong');
  const spanEl = btn.querySelector('.update-text-wrap span');
  if (strongEl) strongEl.textContent = '⏳ جاري التحديث...';
  if (spanEl) spanEl.textContent = 'لحظة من فضلك';
  const reg = swRegistration;
  if (reg && reg.waiting) {
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => { if (!isReloading) { isReloading = true; window.location.reload(); } }, 2000);
  } else { window.location.reload(); }
}
async function maybeShowUpdate() {
  if (_updateButtonShownThisLoad) return;
  if (!swRegistration) return;
  const waiting = swRegistration.waiting;
  const active = navigator.serviceWorker.controller;
  if (!waiting || !active) return;
  try {
    const [newV, oldV] = await Promise.all([
      getSWVersionFromWorker(waiting),
      getSWVersionFromWorker(active)
    ]);
    if (newV && oldV && newV === oldV) return;
    if (!newV) return;
    _updateButtonShownThisLoad = true;
    showUpdateButton();
    try { showToast('🎉 تحديث جديد متوفر!'); } catch(e){}
  } catch(e){ /* silent */ }
}
async function checkForUpdate() {
  if (!swRegistration || document.hidden) return;
  try {
    await swRegistration.update();
    await maybeShowUpdate();
  } catch(err){}
}
function throttledCheckForUpdate() {
  const now = Date.now();
  if (now - _lastUpdateCheck < CONFIG.UPDATE_CHECK_THROTTLE_MS) return;
  _lastUpdateCheck = now;
  checkForUpdate();
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => {
        swRegistration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) maybeShowUpdate();
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setTimeout(() => maybeShowUpdate(), 500);
            }
          });
        });
        if (updateCheckInterval) clearInterval(updateCheckInterval);
        updateCheckInterval = setInterval(() => {
          if (!document.hidden) checkForUpdate();
        }, CONFIG.UPDATE_CHECK_INTERVAL_MS);
      })
      .catch((err) => console.warn('[BZR] SW registration failed:', err));
    let hadControllerAtLoad = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadControllerAtLoad) { hadControllerAtLoad = true; return; }
      if (isReloading) return;
      isReloading = true;
      window.location.reload();
    });
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event.data || {};
      if (data.type === 'SW_ACTIVATED') _updateButtonShownThisLoad = false;
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) throttledCheckForUpdate();
    });
  });
}
document.getElementById('updateAvailableBtn')?.addEventListener('click', triggerUpdate);

/* ═══ INIT ═══ */
async function initApp() {
  initTheme();
  initViewMode();
  const ok = await ensureAuth();
  if (!ok) { window.__bzrHideSplash(); return; }
  updateCartUI();
  initFCM().catch(() => {});

  // ✅ Pre-compute device fingerprint (async, non-blocking)
  getDeviceFingerprint().catch(() => {});

  await Promise.all([loadStores(), loadCategories(), loadAllProducts()]);
  setupRealtimeProducts();
  setupRealtimeStores();
  handleDeepLink();
  setActiveNav('home');
  setTimeout(() => window.__bzrHideSplash(), 400);

  // ✅ Sync followed stores from server (background)
  syncFollowedStoresFromServer().catch(() => {});
}
window.addEventListener('beforeunload', () => {
  try {
    if (allProductsUnsubscribe) allProductsUnsubscribe();
    if (storesPollInterval) clearInterval(storesPollInterval);
    stopAutoScroll();
    if (_cacheWriteTimer) { clearTimeout(_cacheWriteTimer); _flushCacheWrites(); }
  } catch(e){}
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp, { once: true });
else initApp();
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('open') === 'cart') setTimeout(openCart, 800);
});

/* ═══ PUBLIC API ═══ */
window.BranZar = {
  version: '9.0.0',
  openStore: openStoreModal,
  openProduct: openProductModal,
  openCart,
  showToast,
  haptic,
  setTheme: applyTheme,
  setView: applyViewMode,
  getFingerprint: getDeviceFingerprint,
  syncFollows: syncFollowedStoresFromServer
};

})();
