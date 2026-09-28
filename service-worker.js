/* ═══════════════════════════════════════════════════════════
   BranZar Service Worker v7.0.0
   🔥 Cache + Auto Update + Firebase Messaging
   ⚠️ غيّر SW_VERSION فقط عند كل تحديث
   ═══════════════════════════════════════════════════════════ */

/* ─── Version (bump this to trigger update) ─── */
const SW_VERSION = '1.0.018';
const CACHE_NAME    = `branzar-${SW_VERSION}`;
const STATIC_CACHE  = `${CACHE_NAME}-static`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;
const IMAGE_CACHE   = `${CACHE_NAME}-images`;

/* ─── Firebase (optional — wrapped to never break SW) ─── */
let messaging = null;
try {
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
  messaging = firebase.messaging();

  /* ─── Background Messages ───
     ✅ مهم: لتجنّب الإشعارات المزدوجة، يُفضّل أن يرسل السيرفر
     حمولة من نوع data-only (بدون حقل notification).
     إذا أرسل notification، فإن المتصفح قد يعرضه تلقائياً
     وعندها نتجنّب العرض اليدوي لتفادي التكرار.
  ─── */
  messaging.onBackgroundMessage((payload) => {
    // إذا احتوت الحمولة على notification → المتصفح/الـSDK سيعرضه، لا تكرره
    if (payload && payload.notification && payload.notification.title) {
      // نعرض فقط إذا كان هناك flag صريح
      if (!(payload.data && payload.data.bzr_force_show === 'true')) return;
    }
    const data = payload.data || {};
    const notif = payload.notification || {};
    const title = notif.title || data.title || 'BranZar';
    const options = {
      body: notif.body || data.body || 'لديك إشعار جديد',
      icon: notif.icon || data.icon || './icons/icon-192.png',
      badge: './icons/icon-96.png',
      dir: 'rtl',
      lang: 'ar',
      tag: data.tag || 'branzar-bg',
      renotify: false,
      data: { url: data.url || './' }
    };
    return self.registration.showNotification(title, options);
  });
} catch (e) {
  console.warn('[SW] FCM init failed (non-fatal):', e);
}

/* ─── Precache shell (relative paths → TWA-safe) ─── */
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json'
];

/* ─── Hosts/paths to bypass (Firebase, analytics) ─── */
function shouldBypass(url) {
  const h = url.hostname;
  return h.includes('firestore.googleapis.com') ||
         h.includes('firebaseio.com') ||
         h.includes('identitytoolkit.googleapis.com') ||
         h.includes('securetoken.googleapis.com') ||
         h.includes('fcmregistrations.googleapis.com') ||
         h.includes('fcm.googleapis.com') ||
         h.includes('google-analytics.com') ||
         h.includes('googletagmanager.com') ||
         h === 'www.gstatic.com';
}

/* ─── Install ─── */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', SW_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      // ✅ كل ملف على حدة — فشل واحد لا يُسقط البقية
      Promise.all(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => console.warn('[SW] Precach fail:', asset, err))
        )
      )
    )
    // NO skipWaiting — waiting for user action (button in app)
  );
});

/* ─── Activate ─── */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', SW_VERSION);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(k))
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', version: SW_VERSION });
        });
      }))
  );
});

/* ─── Fetch ─── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:' || url.protocol === 'view-source:') return;
  if (shouldBypass(url)) return;

  // ── HTML / navigation → Network-first + offline fallback
  const accept = request.headers.get('accept') || '';
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) =>
            r || caches.match('./offline.html').then((o) => o || caches.match('./index.html'))
          )
        )
    );
    return;
  }

  // ── Images / fonts → Stale-While-Revalidate (handles cors + opaque)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf|otf|eot)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((res) => {
              // ✅ اقبل basic / cors / opaque — الصور الخارجية تُخزّن
              if (res && (res.status === 200 || res.type === 'opaque')) {
                cache.put(request, res.clone()).catch(() => {});
              }
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // ── JS / CSS → Stale-While-Revalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    /\.(js|css)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((res) => {
              if (res && (res.status === 200 || res.type === 'opaque')) {
                cache.put(request, res.clone()).catch(() => {});
              }
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // ── Everything else → Network-first (safer, avoids stale JSON)
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

/* ─── Messages ─── */
self.addEventListener('message', (event) => {
  const data = event.data || {};

  if (data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING — activating now');
    self.skipWaiting();
    return;
  }

  if (data.type === 'GET_VERSION') {
    if (event.source && event.source.postMessage) {
      event.source.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
    }
    return;
  }

  if (data.type === 'CHECK_UPDATE') {
    self.registration.update().catch(() => {});
    return;
  }
});

/* ─── Notification Click ─── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let targetUrl = (event.notification.data && event.notification.data.url) || './';

  // ✅ حوّل المسار النسبي إلى مطلق (مطلوب لـ openWindow)
  try {
    targetUrl = new URL(targetUrl, self.location.origin).href;
  } catch (e) {
    targetUrl = self.location.origin + '/';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // ✅ قارن بـ origin+pathname وليس النص الكامل (يتجاهل ?query و#hash)
      for (const client of clientList) {
        try {
          const c = new URL(client.url);
          const t = new URL(targetUrl);
          if (c.origin === t.origin && c.pathname === t.pathname && 'focus' in client) {
            return client.focus();
          }
        } catch (e) { /* skip malformed */ }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
