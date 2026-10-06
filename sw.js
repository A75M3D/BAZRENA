/* BranZar Service Worker v1.0.018 */
const SW_VERSION = '1.12.118';
const CACHE_NAME = `branzar-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

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
  messaging.onBackgroundMessage((payload) => {
    if (payload && payload.notification && payload.notification.title) {
      if (!(payload.data && payload.data.bzr_force_show === 'true')) return;
    }
    const data = payload.data || {};
    const notif = payload.notification || {};
    const title = notif.title || data.title || 'BranZar';
    const options = {
      body: notif.body || data.body || 'لديك إشعار جديد',
      icon: notif.icon || data.icon || 'https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png',
      dir: 'rtl', lang: 'ar',
      tag: data.tag || 'branzar-bg',
      renotify: false,
      data: { url: data.url || './' }
    };
    return self.registration.showNotification(title, options);
  });
} catch (e) { console.warn('[SW] FCM init failed (non-fatal):', e); }

const STATIC_ASSETS = ['./', './index.html', './offline.html', './manifest.json', './styles.css', './app.js','onboarding.html',];

function shouldBypass(url) {
  const h = url.hostname;
  return h.includes('firestore.googleapis.com') || h.includes('firebaseio.com') ||
         h.includes('identitytoolkit.googleapis.com') || h.includes('securetoken.googleapis.com') ||
         h.includes('fcmregistrations.googleapis.com') || h.includes('fcm.googleapis.com') ||
         h.includes('google-analytics.com') || h.includes('googletagmanager.com') ||
         h === 'www.gstatic.com';
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.all(STATIC_ASSETS.map((asset) => cache.add(asset).catch((err) => console.warn('[SW] Precach fail:', asset))))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(k)).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED', version: SW_VERSION }));
      }))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:' || url.protocol === 'view-source:') return;
  if (shouldBypass(url)) return;

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
        .catch(() => caches.match(request).then((r) => r || caches.match('./offline.html').then((o) => o || caches.match('./index.html'))))
    );
    return;
  }

  if (request.destination === 'image' || request.destination === 'font' || /\.(png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf|otf|eot)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((res) => {
              if (res && (res.status === 200 || res.type === 'opaque')) cache.put(request, res.clone()).catch(() => {});
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  if (request.destination === 'script' || request.destination === 'style' || /\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((res) => {
              if (res && (res.status === 200 || res.type === 'opaque')) cache.put(request, res.clone()).catch(() => {});
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

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

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (data.type === 'GET_VERSION') {
    const payload = { type: 'SW_VERSION', version: SW_VERSION };
    if (event.ports && event.ports[0]) { try { event.ports[0].postMessage(payload); } catch(e){} }
    else if (event.source && event.source.postMessage) { try { event.source.postMessage(payload); } catch(e){} }
    return;
  }
  if (data.type === 'CHECK_UPDATE') { self.registration.update().catch(() => {}); return; }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let targetUrl = (event.notification.data && event.notification.data.url) || './';
  try { targetUrl = new URL(targetUrl, self.location.origin).href; }
  catch(e) { targetUrl = self.location.origin + '/'; }
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const c = new URL(client.url);
          const t = new URL(targetUrl);
          if (c.origin === t.origin && c.pathname === t.pathname && 'focus' in client) return client.focus();
        } catch(e){}
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
