/* ═══════════════════════════════════════════
   BranZar Service Worker v1.0.05
   🔥 Cache + Auto Update + Firebase Messaging
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

/* ─── Background Messages Handler ───
   ✅ هذا هو المُعالج الوحيد للإشعارات
   ✅ لا حاجة لمستمع push منفصل (FCM يدير الأمر داخلياً)
   ✅ نُرجع الـ Promise لضمان الانتظار
─── */
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
  // ✅ إرجاع الـ Promise ضروري
  return self.registration.showNotification(title, options);
});

/* ─── Cache & Version ─── */
const SW_VERSION = '1.0.07';
const CACHE_NAME = `branzar-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;

const STATIC_ASSETS = [
  '/manifest.json',
  'https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png'
];

const DYNAMIC_FILES = ['', '/', '/index.html', '/about.html', '/a.html', '/script.js'];

/* ─── Install ─── */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', SW_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
    // ✅ NO skipWaiting — ينتظر أمر المستخدم
  );
});

/* ─── Activate ─── */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', SW_VERSION);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
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

  // Firebase scripts — دائماً من الشبكة
  if (url.hostname === 'www.gstatic.com') return;

  const isDynamic = DYNAMIC_FILES.some((f) => url.pathname.endsWith(f) || url.pathname === f);

  if (isDynamic) {
    // Network First للملفات الديناميكية
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 })))
    );
  } else {
    // Cache First للثوابت
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
          return response;
        }).catch(() => new Response('Offline', { status: 503 }));
      })
    );
  }
});

/* ─── Messages ─── */
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
});

/* ─── Notification Click ─── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
