// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDUfiHqBPQuFKrsHxoSDdR0j7DMvekfYiA",
    authDomain: "bazarena-725e4.firebaseapp.com",
    projectId: "bazarena-725e4",
    storageBucket: "bazarena-725e4.firebasestorage.app",
    messagingSenderId: "977750898059",
    appId: "1:977750898059:web:247e8513b48490ed622b8e"
});

const messaging = firebase.messaging();

// ═══════════════ استقبال الإشعارات في الخلفية ═══════════════
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 📩 وصل إشعار في الخلفية:', payload);

    const notificationTitle =
        (payload.notification && payload.notification.title) ||
        'بازارِنا 🛒';

    const notificationOptions = {
        body:
            (payload.notification && payload.notification.body) ||
            'لديك جديد في بازارِنا!',
        icon:
            (payload.notification && payload.notification.icon) ||
            'https://i.ibb.co/nNx71bCg/file-00000000d3748243bced1f2d4357a546.png',
        badge:
            'https://i.ibb.co/nNx71bCg/file-00000000d3748243bced1f2d4357a546.png',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [200, 100, 200],
        tag: (payload.data && payload.data.tag) || 'bazrena-general',
        renotify: true,
        requireInteraction: false,
        data: Object.assign({ url: '/' }, payload.data || {})
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ═══════════════ عند النقر على الإشعار ═══════════════
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 👆 تم الضغط على الإشعار:', event.notification.data);
    event.notification.close();

    // ⚠️ نقرأ الرابط من الـ Custom Data اللي بعته من Firebase
    const targetUrl =
        (event.notification.data && event.notification.data.url) ||
        'https://bazrena.vercel.app';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // لو الموقع مفتوح في تاب، نركز عليه ونوجهه
                for (const client of windowClients) {
                    if ('focus' in client) {
                        client.navigate(targetUrl);
                        return client.focus();
                    }
                }
                // لو مفيش تاب مفتوح، نفتح واحد جديد
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});

// ═══════════════ استقبال حدث push مباشرة (احتياطي) ═══════════════
self.addEventListener('push', (event) => {
    console.log('[SW] 📨 Push event:', event);
});
