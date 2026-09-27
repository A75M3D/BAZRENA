/* ═══════════════════════════════════════════════════════════
   BranZar Service Worker v7.0 — Performance Edition
   ═══════════════════════════════════════════════════════════ */
const SW_VERSION = 'branzar-v7.0.0';
const CACHE_STATIC = SW_VERSION + '-static';
const CACHE_IMAGES = SW_VERSION + '-images';
const CACHE_API = SW_VERSION + '-api';

const STATIC_ASSETS = [
  './',
  './index.html',
  './a.html',
  './about.html',
  './manifest.json',
  './firebase-messaging-sw.js'
];

// ⚡ الشعار الرسمي - يُخزّن للأبد
const LOGO_URL = 'https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => console.warn('SW install partial:', err));
    }).then(() => caches.open(CACHE_IMAGES).then(cache => {
      // ⚡ تخزين الشعار مسبقاً
      return cache.add(LOGO_URL).catch(() => {});
    }))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k.indexOf(SW_VERSION) === -1).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // ⚡ الشعار: Cache-First + تخزين دائم
  if (url.href === LOGO_URL || req.destination === 'image' && url.hostname.includes('i.ibb.co')) {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(cache =>
        cache.match(req).then(cached => {
          if (cached) return cached;
          return fetch(req).then(res => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached || new Response('', { status: 404 }));
        })
      )
    );
    return;
  }

  // صور أخرى
  if (req.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(cache =>
        cache.match(req).then(cached => {
          const network = fetch(req).then(res => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  // Firebase API: Network-First
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('identitytoolkit.googleapis.com') ||
      url.hostname.includes('securetoken.googleapis.com')) {
    event.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_API).then(cache => cache.put(req, clone)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Static Assets: Cache-First
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(res => {
          if (res.ok) caches.open(CACHE_STATIC).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});
