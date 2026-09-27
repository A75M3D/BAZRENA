/* ═══════════════════════════════════════════
   BranZar Service Worker v1.0.08
   🔥 Cache Icons + Fonts + Auto Update + FCM
   ⚠️ غيّر SW_VERSION فقط عند كل تحديث
   ═══════════════════════════════════════════ */

/* ─── Firebase ─── */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDUfiHqBPQuFKrsHxoSDdR0j7DMvekfYiA",
  authDomain: "bazarena-725e4.firebaseapp.com",
  databaseURL: "https://bazarena-725e4-default-rtdb.firebaseio.com",
  projectId: "bazarena-725e4",
  storageBucket: "bazarena-725e4.firebasestorage.app",
  messagingSenderId: "977750898059",
  appId: "1:977750898059:web:247e8513b48490ed622b8e"
});

const messaging = firebase.messaging();

/* ─── Background Messages Handler ─── */
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'BranZar';
  const options = {
    body: (payload.notification && payload.notification.body) || 'لديك إشعار جديد',
    icon: 'https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png',
    badge: 'https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png',
    dir: 'rtl',
    lang: 'ar',
    data: payload.data || {},
    tag: (payload.data && payload.data.tag) || 'branzar-bg'
  };
  return self.registration.showNotification(title, options);
});

/* ═══════════════════════════════════════════
   Cache & Version
   ═══════════════════════════════════════════ */
const SW_VERSION = '1.0.09';
const CACHE_NAME = `branzar-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const FONTS_CACHE = `${CACHE_NAME}-fonts`;
const IMAGES_CACHE = `${CACHE_NAME}-images`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;

/* الملفات الثابتة المحلية (تثبيت فوري عند تثبيت SW) */
const STATIC_ASSETS = [
  '/manifest.json',
  'https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png'
];

/* الخطوط التي نريد تسخين الكاش بها فوراً (Pre-cache) */
const FONT_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

/* نطاقات الخطوط والأيقونات — Cache First دائم */
const FONT_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

/* نطاقات الصور — Cache First مع TTL طويل */
const IMAGE_HOSTS = [
  'i.ibb.co',
  'via.placeholder.com',
  'firebasestorage.googleapis.com'
];

/* نطاقات Firebase — Network Only (لا نُخزّن بيانات حيّة) */
const FIREBASE_HOSTS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'fcmregistrations.googleapis.com',
  'fcm.googleapis.com',
  'www.gstatic.com',
  'apis.google.com'
];

/* ═══════════════════════════════════════════
   Install — Pre-cache الأصول الحرجة
   ═══════════════════════════════════════════ */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', SW_VERSION);
  event.waitUntil(
    Promise.all([
      // 1. Static assets (لا يفشل كل التثبيت لو فشل رابط)
      caches.open(STATIC_CACHE).then((cache) =>
        Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(new Request(url, { mode: 'no-cors' })).catch(() => null)
          )
        )
      ),
      // 2. الخطوط والأيقونات (pre-warm)
      caches.open(FONTS_CACHE).then((cache) =>
        Promise.allSettled(
          FONT_ASSETS.map((url) =>
            fetch(url, { mode: 'cors', credentials: 'omit' })
              .then((res) => { if (res && (res.ok || res.type === 'opaque')) return cache.put(url, res); })
              .catch(() => null)
          )
        )
      )
    ])
    // ✅ NO skipWaiting — ينتظر أمر المستخدم من الصفحة
  );
});

/* ═══════════════════════════════════════════
   Activate — تنظيف الكاشات القديمة
   ═══════════════════════════════════════════ */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', SW_VERSION);
  const validCaches = [STATIC_CACHE, FONTS_CACHE, IMAGES_CACHE, RUNTIME_CACHE];

  event.waitUntil(
    (async () => {
      // 1. احذف الكاشات القديمة
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('branzar-') && !validCaches.includes(k))
          .map((k) => caches.delete(k))
      );

      // 2. تحكم فوري بالصفحات المفتوحة
      await self.clients.claim();

      // 3. أخبر الصفحات المفتوحة بالإصدار الجديد
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({ type: 'SW_ACTIVATED', version: SW_VERSION });
      });
    })()
  );
});

/* ═══════════════════════════════════════════
   Helper — هل الطلب من ملفات التطبيق؟
   ═══════════════════════════════════════════ */
function isAppDocument(url, request) {
  // الصفحة الرئيسية / HTML
  if (request.mode === 'navigate') return true;
  if (request.destination === 'document') return true;
  const path = url.pathname;
  if (path === '/' || path === '' || path.endsWith('/index.html')) return true;
  if (path.endsWith('.html')) return true;
  return false;
}

function isAppScript(url) {
  return url.origin === self.location.origin &&
         (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'));
}

/* ═══════════════════════════════════════════
   Helper — Cache-First مع تخزين اختياري
   ═══════════════════════════════════════════ */
async function cacheFirst(request, cacheName, allowOpaque) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // اسمح للـ CDN (cors / opaque) بالدخول للكاش
    const cacheable =
      response &&
      (response.ok || response.type === 'opaque') &&
      (allowOpaque ? true : response.type === 'basic' || response.type === 'cors');

    if (cacheable) {
      // clone لكي لا يُستهلك الـ body
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    // Offline fallback
    const fallback = await cache.match(request);
    if (fallback) return fallback;
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

/* ═══════════════════════════════════════════
   Helper — Network-First مع cache خلفي
   ═══════════════════════════════════════════ */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok && response.type === 'basic') {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

/* ═══════════════════════════════════════════
   Fetch Handler
   ═══════════════════════════════════════════ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }

  // تجاهل البروتوكولات غير المدعومة
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.protocol === 'chrome-extension:' || url.protocol === 'view-source:') return;

  const host = url.hostname;

  // ─── 1. Firebase — Network Only (بيانات حيّة، لا cache) ───
  if (FIREBASE_HOSTS.includes(host) || host.endsWith('.googleapis.com')) {
    return; // اسمح للمتصفح بالتعامل مباشرة
  }

  // ─── 2. الخطوط والأيقونات CDN — Cache First (طويلة الأجل) ───
  if (FONT_HOSTS.includes(host)) {
    event.respondWith(cacheFirst(request, FONTS_CACHE, true));
    return;
  }

  // ─── 3. الصور — Cache First ───
  if (IMAGE_HOSTS.includes(host) || request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGES_CACHE, true));
    return;
  }

  // ─── 4. ملفات التطبيق (HTML) — Network First ───
  if (isAppDocument(url, request)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // ─── 5. JS/CSS محلية — Network First (لتحديث سريع) ───
  if (isAppScript(url)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // ─── 6. أي شيء آخر من نفس الأصل — Cache First ───
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE, false));
    return;
  }

  // ─── 7. مصادر خارجية أخرى — اتركها للمتصفح ───
});

/* ═══════════════════════════════════════════
   Messages
   ═══════════════════════════════════════════ */
self.addEventListener('message', (event) => {
  const data = event.data || {};

  if (data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING — activating now');
    self.skipWaiting();
  }

  if (data.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
  }

  if (data.type === 'CHECK_UPDATE') {
    self.registration.update().catch(() => {});
  }

  // مسح الكاش يدوياً من الصفحة
  if (data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('branzar-')).map((k) => caches.delete(k)))
      )
    );
  }
});

/* ═══════════════════════════════════════════
   Notification Click
   ═══════════════════════════════════════════ */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || '/';
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      // إن كانت هناك نافذة مفتوحة على نفس الموقع — ركّز عليها وانتقل
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin) {
          try {
            await client.focus();
            if ('navigate' in client) await client.navigate(absoluteUrl);
            return;
          } catch (e) {}
        }
      }

      // وإلا افتح نافذة جديدة
      if (self.clients.openWindow) {
        return self.clients.openWindow(absoluteUrl);
      }
    })()
  );
});
