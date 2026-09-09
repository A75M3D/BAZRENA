const CACHE_NAME = 'BAZRENA-بازارنا';
const urlsToCache = [
  '/script.js',
  '/login.html',
  '/manifest.json',
  '/register.html',
  // الملفات الثابتة اللي مش بتتغير
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // الملفات الديناميكية اللي بتتغير باستمرار
  const dynamicFiles = [
    '',
    '/index.html',
    '/about.html',
    '/D.html',
    
  ];
  
  const isDynamicFile = dynamicFiles.some(file => 
    event.request.url.includes(file)
  );

  // إذا كان طلب لملفات HTML الديناميكية
  if (isDynamicFile) {
    // Network First Strategy - النت أولاً
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // إذا نجح التحميل من النت، خزن النسخة الجديدة
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
                console.log('Service Worker: Dynamic File Updated -', event.request.url);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // إذا فشل التحميل من النت، جيب من الكاش
          console.log('Service Worker: Using Cached Version -', event.request.url);
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || new Response('Offline - No cached version available');
            });
        })
    );
  } else {
    // Cache First Strategy - الكاش أولاً للملفات الثابتة
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // إذا وجد في الكاش، ارجعه
          if (response) {
            console.log('Service Worker: Serving from Cache -', event.request.url);
            return response;
          }
          
          // إذا مش موجود في الكاش، حمله من النت وخزنه
          return fetch(event.request)
            .then((fetchResponse) => {
              // تحقق إذا كان الرد صالح للتخزين
              if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                return fetchResponse;
              }
              
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                  console.log('Service Worker: New File Cached -', event.request.url);
                });
              
              return fetchResponse;
            })
            .catch(() => {
              // إذا فشل التحميل من النت
              return new Response('Offline - Please check your connection');
            });
        })
    );
  }
});

// Listen for Messages from the Page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
