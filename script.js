/* ═══════════════════════════════════════════════════════════
   BranZar — Utilities Library
   Version: 3.0.0
   ───────────────────────────────────────────────────────────
   🎯 Pure utilities — لا يحتوي على منطق التطبيق
   🎯 لا يُنفّذ أي شيء عند التحميل — يُنشئ window.BZR فقط
   🎯 لا يتعارض مع index.html / a.html / about.html
   🎯 Tree-shakeable يدوياً — استخدم فقط ما تحتاجه
   ═══════════════════════════════════════════════════════════ */

(function (window, document) {
  'use strict';

  /* ─── منع التهيئة المتكررة ─── */
  if (window.BZR && window.BZR.__v) return;

  const VERSION = '3.0.0';
  const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  /* ═══════════════════════════════════════════
     1. Logger — يعمل فقط في وضع التطوير
     ═══════════════════════════════════════════ */
  const log   = IS_DEV ? console.log.bind(console,   '%c[BZR]', 'color:#FF7A00;font-weight:bold;') : () => {};
  const warn  = IS_DEV ? console.warn.bind(console,  '%c[BZR]', 'color:#F59E0B;font-weight:bold;') : () => {};
  const error = console.error.bind(console, '%c[BZR]', 'color:#EF4444;font-weight:bold;');

  /* ═══════════════════════════════════════════
     2. Storage — Wrapper آمن
     ═══════════════════════════════════════════ */
  const Storage = (() => {
    const PREFIX = 'bzr_';
    let _available = null;

    function _check() {
      if (_available !== null) return _available;
      try {
        const k = '__bzr_test_' + Date.now();
        localStorage.setItem(k, '1');
        localStorage.removeItem(k);
        _available = true;
      } catch (e) { _available = false; }
      return _available;
    }

    function _serialize(v) {
      if (typeof v === 'string') return v;
      try { return JSON.stringify(v); } catch (e) { return String(v); }
    }

    function _deserialize(v) {
      if (v === null || v === undefined) return null;
      try { return JSON.parse(v); } catch (e) { return v; }
    }

    return {
      available: _check,

      /** قراءة مع كشف JSON تلقائي */
      get(key, fallback = null) {
        if (!_check()) return fallback;
        try {
          const v = localStorage.getItem(key);
          return v === null ? fallback : _deserialize(v);
        } catch (e) { return fallback; }
      },

      /** كتابة مع تحويل تلقائي لـ JSON */
      set(key, value) {
        if (!_check()) return false;
        try { localStorage.setItem(key, _serialize(value)); return true; }
        catch (e) { warn('Storage.set failed:', key, e); return false; }
      },

      remove(key) {
        if (!_check()) return false;
        try { localStorage.removeItem(key); return true; } catch (e) { return false; }
      },

      clear() {
        if (!_check()) return false;
        try { localStorage.clear(); return true; } catch (e) { return false; }
      },

      /** مساحة مخصصة للتطبيق بـ prefix */
      app: {
        get: (key, fallback) => Storage.get(PREFIX + key, fallback),
        set: (key, value)       => Storage.set(PREFIX + key, value),
        remove: (key)           => Storage.remove(PREFIX + key),
        keys() {
          if (!_check()) return [];
          const result = [];
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.indexOf(PREFIX) === 0) result.push(k.slice(PREFIX.length));
            }
          } catch (e) {}
          return result;
        },
        clear() {
          this.keys().forEach(k => Storage.remove(PREFIX + k));
        }
      }
    };
  })();

  /* ═══════════════════════════════════════════
     3. String Helpers
     ═══════════════════════════════════════════ */
  const Str = {
    /**
     * تهريب النص ليكون آمناً عند الإدراج في HTML
     * @example escape('<script>') → '&lt;script&gt;'
     */
    escape(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /** إزالة كل وسوم HTML من نص */
    stripTags(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]*>/g, '').trim();
    },

    /** قطع نص طويل مع إضافة '...' */
    truncate(str, max = 50, suffix = '…') {
      if (!str) return '';
      const s = String(str);
      return s.length <= max ? s : s.slice(0, max).trim() + suffix;
    },

    /** تحويل لكلمة URL-friendly */
    slugify(str) {
      if (!str) return '';
      return String(str)
        .trim()
        .toLowerCase()
        .replace(/[\s\u0640]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]+/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    },

    /** تنسيق أرقام بفواصل عربية */
    formatNumber(num, locale = 'ar-EG') {
      const n = parseFloat(num);
      if (isNaN(n)) return '0';
      try { return n.toLocaleString(locale); }
      catch (e) { return n.toString(); }
    },

    /** تحويل إلى CamelCase */
    camelCase(str) {
      return String(str || '')
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^(.)/, c => c.toLowerCase());
    },

    /** تنقية المسافات الزائدة */
    normalizeSpaces(str) {
      return String(str || '').replace(/\s+/g, ' ').trim();
    }
  };

  /* ═══════════════════════════════════════════
     4. DOM Helpers
     ═══════════════════════════════════════════ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /**
   * إنشاء عنصر DOM آمن من نص (بدون innerHTML)
   */
  function createEl(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.text !== undefined) el.textContent = options.text;
    if (options.html && IS_DEV) warn('createEl: use .text instead of .html for safety');
    if (options.className) el.className = options.className;
    if (options.id) el.id = options.id;
    if (options.style) {
      if (typeof options.style === 'string') el.style.cssText = options.style;
      else Object.assign(el.style, options.style);
    }
    if (options.attrs) {
      Object.keys(options.attrs).forEach(k => {
        if (options.attrs[k] !== null && options.attrs[k] !== undefined) {
          el.setAttribute(k, options.attrs[k]);
        }
      });
    }
    if (options.dataset) {
      Object.keys(options.dataset).forEach(k => { el.dataset[k] = options.dataset[k]; });
    }
    if (options.on) {
      Object.keys(options.on).forEach(evt => el.addEventListener(evt, options.on[evt]));
    }
    if (options.children) {
      (Array.isArray(options.children) ? options.children : [options.children])
        .forEach(child => child && el.appendChild(child));
    }
    return el;
  }

  /** إضافة element listener وإرجاع دالة للتنظيف */
  function on(el, evt, handler, options) {
    if (!el || !el.addEventListener) return () => {};
    el.addEventListener(evt, handler, options);
    return () => el.removeEventListener(evt, handler, options);
  }

  /** Event Delegation — إرجاع دالة للتنظيف */
  function delegate(root, selector, evt, handler) {
    if (!root) return () => {};
    const wrapped = (e) => {
      const target = e.target.closest(selector);
      if (target && root.contains(target)) handler.call(target, e, target);
    };
    root.addEventListener(evt, wrapped);
    return () => root.removeEventListener(evt, wrapped);
  }

  /* ═══════════════════════════════════════════
     5. Performance Utilities
     ═══════════════════════════════════════════ */
  /** تأخير تنفيذ حتى يتوقف المستخدم عن الاستدعاء */
  function debounce(fn, wait = 250, immediate = false) {
    let timeout = null;
    function debounced(...args) {
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) fn.apply(this, args);
      }, wait);
      if (callNow) fn.apply(this, args);
    }
    debounced.cancel = () => { clearTimeout(timeout); timeout = null; };
    return debounced;
  }

  /** تنفيذ بحد أقصى مرة كل `wait` ms */
  function throttle(fn, wait = 250) {
    let last = 0, timeout = null;
    function throttled(...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        if (timeout) { clearTimeout(timeout); timeout = null; }
        last = now;
        fn.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          last = Date.now();
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    }
    throttled.cancel = () => { clearTimeout(timeout); timeout = null; };
    return throttled;
  }

  /** تنفيذ مرة واحدة فقط */
  function once(fn) {
    let called = false, result;
    return function (...args) {
      if (called) return result;
      called = true;
      result = fn.apply(this, args);
      return result;
    };
  }

  /** تنفيذ في وقت الخمول (idle) */
  function idle(fn, timeout = 2000) {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(fn, { timeout });
    }
    return setTimeout(fn, 1);
  }

  /** تأخير Promise */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** إعادة المحاولة عند الفشل */
  async function retry(fn, attempts = 3, delay = 500, backoff = 2) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try { return await fn(); }
      catch (e) {
        lastErr = e;
        if (i < attempts - 1) await wait(delay * Math.pow(backoff, i));
      }
    }
    throw lastErr;
  }

  /* ═══════════════════════════════════════════
     6. Device Detection
     ═══════════════════════════════════════════ */
  const Device = {
    isMobile() {
      return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)
          || (window.matchMedia && window.matchMedia('(max-width: 767px)').matches);
    },
    isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },
    isAndroid() {
      return /Android/i.test(navigator.userAgent);
    },
    isStandalone() {
      return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
          || window.navigator.standalone === true;
    },
    isTouch() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    isOnline() {
      return navigator.onLine !== false;
    },
    prefersDark() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    prefersReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    supports: {
      share:         () => typeof navigator.share === 'function',
      clipboard:     () => !!(navigator.clipboard && navigator.clipboard.writeText),
      notifications: () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window,
      vibrate:       () => 'vibrate' in navigator,
      storage:       () => Storage.available(),
      sw:            () => 'serviceWorker' in navigator,
      intersection:  () => 'IntersectionObserver' in window,
      resizeObs:     () => 'ResizeObserver' in window,
      webShareFiles: () => navigator.canShare && navigator.canShare({ files: [] })
    }
  };

  /* ═══════════════════════════════════════════
     7. Haptic Feedback
     ═══════════════════════════════════════════ */
  const VIBRATION_PATTERNS = {
    light:   8,
    medium:  15,
    heavy:   [20, 30, 20],
    success: [10, 40, 10],
    error:   [30, 20, 30, 20, 30],
    warning: [20, 40, 20]
  };

  function haptic(type = 'light') {
    if (!Device.supports.vibrate()) return;
    try {
      const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.light;
      navigator.vibrate(pattern);
    } catch (e) { /* silent */ }
  }

  /* ═══════════════════════════════════════════
     8. Formatters
     ═══════════════════════════════════════════ */
  const Format = {
    /** تنسيق السعر */
    price(value, currency = 'ج.س') {
      const n = parseFloat(value) || 0;
      return Str.formatNumber(n) + ' ' + currency;
    },

    /** تنسيق نسبة الخصم */
    discount(original, current) {
      const o = parseFloat(original), c = parseFloat(current);
      if (!o || !c || o <= c) return '';
      return '-' + Math.round(((o - c) / o) * 100) + '%';
    },

    /** تنسيق التاريخ بالعربية */
    date(input, options = {}) {
      if (!input) return '';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d.getTime())) return '';
      try {
        return d.toLocaleDateString('ar-EG', {
          year: 'numeric', month: 'long', day: 'numeric', ...options
        });
      } catch (e) { return d.toISOString().slice(0, 10); }
    },

    /** الوقت النسبي (منذ 5 دقائق...) */
    relativeTime(input) {
      if (!input) return '';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d.getTime())) return '';
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return 'الآن';
      if (diff < 3600) return 'منذ ' + Math.floor(diff / 60) + ' دقيقة';
      if (diff < 86400) return 'منذ ' + Math.floor(diff / 3600) + ' ساعة';
      if (diff < 604800) return 'منذ ' + Math.floor(diff / 86400) + ' يوم';
      return Format.date(d);
    },

    /** تنسيق رقم هاتف سوداني */
    phone(raw) {
      if (!raw) return '';
      const digits = String(raw).replace(/\D/g, '');
      if (digits.length === 10 && digits.startsWith('0')) {
        return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
      }
      if (digits.length === 12 && digits.startsWith('249')) {
        return '+' + digits.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3 $4');
      }
      return digits;
    },

    /** تنسيق حجم الملف */
    fileSize(bytes) {
      if (!bytes) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    }
  };

  /* ═══════════════════════════════════════════
     9. Validators
     ═══════════════════════════════════════════ */
  const Validator = {
    email(str) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str || '').trim());
    },
    /** أرقام سودانية: 09XXXXXXXX أو +2499XXXXXXXX أو 2499XXXXXXXX */
    sudanPhone(str) {
      const d = String(str || '').replace(/\D/g, '');
      return /^(0\d{9}|249\d{9})$/.test(d);
    },
    url(str) {
      try { new URL(str); return true; } catch (e) { return false; }
    },
    /** التحقق من صحة كائن JSON */
    json(str) {
      try { JSON.parse(str); return true; } catch (e) { return false; }
    },
    isEmpty(str) {
      return !str || String(str).trim().length === 0;
    },
    lengthBetween(str, min, max) {
      const len = String(str || '').length;
      return len >= min && len <= max;
    }
  };

  /* ═══════════════════════════════════════════
     10. URL Helpers
     ═══════════════════════════════════════════ */
  const Url = {
    /** قراءة query param */
    get(name, url = location.href) {
      try {
        return new URL(url).searchParams.get(name);
      } catch (e) { return null; }
    },

    /** قراءة كل query params ككائن */
    all(url = location.href) {
      try {
        const result = {};
        new URL(url).searchParams.forEach((v, k) => { result[k] = v; });
        return result;
      } catch (e) { return {}; }
    },

    /** بناء URL مع query params */
    build(base, params = {}) {
      try {
        const url = new URL(base, location.origin);
        Object.keys(params).forEach(k => {
          if (params[k] !== null && params[k] !== undefined) {
            url.searchParams.set(k, params[k]);
          }
        });
        return url.toString();
      } catch (e) { return base; }
    },

    /** إضافة param للـ URL الحالي */
    withParam(name, value) {
      return Url.build(location.href, { [name]: value });
    },

    /** إزالة param من الـ URL الحالي */
    withoutParam(...names) {
      try {
        const url = new URL(location.href);
        names.forEach(n => url.searchParams.delete(n));
        return url.toString();
      } catch (e) { return location.href; }
    }
  };

  /* ═══════════════════════════════════════════
     11. Clipboard — مع Fallback
     ═══════════════════════════════════════════ */
  const Clipboard = {
    async copy(text) {
      const value = String(text || '');
      // 1. Modern API
      if (Device.supports.clipboard() && window.isSecureContext) {
        try { await navigator.clipboard.writeText(value); return true; }
        catch (e) { /* fallback */ }
      }
      // 2. Fallback — textarea
      try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, value.length);
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e) { return false; }
    },

    async read() {
      if (!Device.supports.clipboard()) return null;
      try { return await navigator.clipboard.readText(); }
      catch (e) { return null; }
    }
  };

  /* ═══════════════════════════════════════════
     12. Share — Native + Fallback
     ═══════════════════════════════════════════ */
  const Share = {
    /**
     * مشاركة مع سقوط تلقائي إلى الحافظة
     * @returns {Promise<'shared'|'copied'|'cancelled'|'failed'>}
     */
    async share({ title, text, url } = {}) {
      if (Device.supports.share()) {
        try {
          await navigator.share({ title, text, url });
          return 'shared';
        } catch (e) {
          if (e && e.name === 'AbortError') return 'cancelled';
        }
      }
      // Fallback: نسخ الرابط
      if (url) {
        const ok = await Clipboard.copy(url);
        return ok ? 'copied' : 'failed';
      }
      return 'failed';
    }
  };

  /* ═══════════════════════════════════════════
     13. Color Utilities
     ═══════════════════════════════════════════ */
  const Color = {
    hexToRgb(hex) {
      const c = String(hex || '').replace('#', '');
      if (c.length !== 6 && c.length !== 3) return null;
      const full = c.length === 3 ? c.split('').map(x => x + x).join('') : c;
      return {
        r: parseInt(full.substr(0, 2), 16),
        g: parseInt(full.substr(2, 2), 16),
        b: parseInt(full.substr(4, 2), 16)
      };
    },
    rgbToHex(r, g, b) {
      const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
      const toHex = v => clamp(v).toString(16).padStart(2, '0');
      return '#' + toHex(r) + toHex(g) + toHex(b);
    },
    /** تفتيح/تغميق لون بنسبة (0-1) */
    lighten(hex, amount = 0.4) {
      const rgb = Color.hexToRgb(hex);
      if (!rgb) return hex;
      return Color.rgbToHex(
        rgb.r + (255 - rgb.r) * amount,
        rgb.g + (255 - rgb.g) * amount,
        rgb.b + (255 - rgb.b) * amount
      );
    },
    darken(hex, amount = 0.4) {
      const rgb = Color.hexToRgb(hex);
      if (!rgb) return hex;
      return Color.rgbToHex(rgb.r * (1 - amount), rgb.g * (1 - amount), rgb.b * (1 - amount));
    },
    /** كشف إذا كان اللون فاتحاً */
    isLight(hex) {
      const rgb = Color.hexToRgb(hex);
      if (!rgb) return false;
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      return luminance > 0.7;
    }
  };

  /* ═══════════════════════════════════════════
     14. Fetch Wrapper — مع Timeout + Retry
     ═══════════════════════════════════════════ */
  async function fetchJSON(url, options = {}) {
    const { timeout = 15000, retries = 0, ...fetchOpts } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...fetchOpts, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const err = new Error('HTTP ' + response.status);
        err.status = response.status;
        throw err;
      }
      return await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      if (retries > 0 && e.name !== 'AbortError') {
        await wait(500);
        return fetchJSON(url, { ...options, retries: retries - 1 });
      }
      throw e;
    }
  }

  /* ═══════════════════════════════════════════
     15. DOM Ready
     ═══════════════════════════════════════════ */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      setTimeout(fn, 0);
    }
  }

  /* ═══════════════════════════════════════════
     16. Global Key Events (helpers)
     ═══════════════════════════════════════════ */
  function onKey(key, handler, options = {}) {
    const target = options.target || document;
    const wrapped = (e) => {
      if (e.key !== key) return;
      if (options.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (options.shift && !e.shiftKey) return;
      if (options.alt && !e.altKey) return;
      handler(e);
    };
    target.addEventListener('keydown', wrapped);
    return () => target.removeEventListener('keydown', wrapped);
  }

  function onEscape(handler) {
    return onKey('Escape', handler);
  }

  /* ═══════════════════════════════════════════
     17. Arrays / Objects Helpers
     ═══════════════════════════════════════════ */
  const Arr = {
    /** تفريد مع مفتاح */
    uniqueBy(arr, keyFn) {
      const seen = new Set();
      return (arr || []).filter(item => {
        const k = keyFn(item);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    },
    /** تجميع حسب مفتاح */
    groupBy(arr, keyFn) {
      return (arr || []).reduce((acc, item) => {
        const k = keyFn(item);
        (acc[k] = acc[k] || []).push(item);
        return acc;
      }, {});
    },
    /** ترتيب حسب مفتاح */
    sortBy(arr, keyFn, direction = 'asc') {
      const sorted = [...(arr || [])];
      const dir = direction === 'asc' ? 1 : -1;
      return sorted.sort((a, b) => {
        const ka = keyFn(a), kb = keyFn(b);
        if (ka < kb) return -1 * dir;
        if (ka > kb) return  1 * dir;
        return 0;
      });
    },
    /** خلط عشوائي (Fisher-Yates) */
    shuffle(arr) {
      const result = [...(arr || [])];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }
  };

  const Obj = {
    /** نسخة عميقة آمنة */
    deepClone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (typeof structuredClone === 'function') {
        try { return structuredClone(obj); } catch (e) {}
      }
      return JSON.parse(JSON.stringify(obj));
    },
    /** دمج آمن للكائنات */
    merge(target, ...sources) {
      return Object.assign({}, target, ...sources);
    },
    /** اختيار مفاتيح محددة فقط */
    pick(obj, ...keys) {
      const result = {};
      keys.forEach(k => { if (k in obj) result[k] = obj[k]; });
      return result;
    },
    /** حذف مفاتيح محددة */
    omit(obj, ...keys) {
      const result = { ...obj };
      keys.forEach(k => { delete result[k]; });
      return result;
    }
  };

  /* ═══════════════════════════════════════════
     18. Construction — تصدير API
     ═══════════════════════════════════════════ */
  const API = Object.freeze({
    __v: VERSION,
    __initialized: true,

    // Logging (dev only)
    log, warn, error,

    // Core
    $, $$,
    createEl, on, delegate,
    ready,
    wait, once, idle, retry,

    // Performance
    debounce, throttle,

    // Device
    Device,

    // Haptic
    haptic,

    // Storage
    Storage,

    // String
    Str,

    // Format
    Format,

    // Validation
    Validator,

    // URL
    Url,

    // Clipboard & Share
    Clipboard,
    Share,

    // Color
    Color,

    // Network
    fetchJSON,

    // Keyboard
    onKey, onEscape,

    // Collections
    Arr, Obj
  });

  /* ─── تصدير آمن (بدون تجاوز) ─── */
  if (window.BZR) {
    warn('BZR already exists — skipping re-initialization');
    return;
  }
  Object.defineProperty(window, 'BZR', {
    value: API,
    writable: false,
    configurable: false,
    enumerable: false
  });

  log('Utilities loaded — v' + VERSION);
  log('API available at: window.BZR');

})(window, document);
