/* ═══════════════════════════════════════════════════════════
   BranZar v9.16.2 — app.js
   Layer 4: Init + Public API
   ✅ v9.16.2: Cache Hit → ONLY 5s Cinematic (NO Loader)
               Cache Miss → Loader + 5s Cinematic → Content
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ INIT ═══ */
async function initApp() {
  initTheme();
  initViewMode();

  try {
    // 🔍 الخطوة 1: فحص الكاش
    let hasCachedContent = false;
    try {
      const cachedStores = await dexieGetAllStores();
      hasCachedContent = !!(cachedStores && cachedStores.length > 0);
    } catch (e) {
      hasCachedContent = false;
    }

    if (hasCachedContent) {
      // ⚡ المسار السريع: محتوى موجود في الكاش
      console.log('[BZR] ⚡ Fast Path: Cache Hit → Only Cinematic, no loader');

      // 1. إخفاء اللودر فوراً (بدون transition — لمنع ظهوره أثناء الأنيميشن)
      const splash = document.getElementById('bzrSplash');
      if (splash) {
        splash.style.transition = 'none';
        splash.style.opacity = '0';
        splash.style.pointerEvents = 'none';
        splash.classList.add('hide');
        setTimeout(() => { try { splash.remove(); } catch(e){} }, 30);
      }

      // 2. ارسم المحتوى من الكاش فوراً
      await loadStores();
      await Promise.all([loadCategories(), loadAllProducts()]);

      // 3. شغّل أنيميشن الشعار السينمائي 5 ثوانٍ فوق المحتوى الجاهز
      if (window.__bzrPlayCinematic) window.__bzrPlayCinematic();

      // 4. مزامنة البيانات والمصادقة في الخلفية (بصمت)
      ensureAuth().then(ok => {
        if (!ok) return;
        updateCartUI();
        initFCM().catch(() => {});
        getDeviceFingerprint().catch(() => {});
        syncFollowedStoresFromServer().catch(() => {});
      }).catch(() => {});

      setupRealtimeStores();
      setupRealtimeProducts();

    } else {
      // 🐢 المسار البطيء: لا يوجد كاش (زيارة أولى)
      console.log('[BZR] 🐢 Slow Path: Cache Miss → Loader + Cinematic + Fetch');

      // 1. شغّل أنيميشن الشعار (5 ثوانٍ) بالتوازي مع اللودر
      if (window.__bzrPlayCinematic) window.__bzrPlayCinematic();

      // 2. تسجيل الدخول
      const ok = await ensureAuth();
      if (!ok) throw new Error('Auth failed');

      updateCartUI();
      initFCM().catch(() => {});
      getDeviceFingerprint().catch(() => {});

      // 3. جلب البيانات من Firebase
      await loadStores();
      await Promise.all([loadCategories(), loadAllProducts()]);

      // 4. المراقبة الحية
      setupRealtimeStores();
      setupRealtimeProducts();

      // 5. إخفاء اللودر بعد اكتمال كل شيء
      if (window.__bzrHideSplash) window.__bzrHideSplash();

      syncFollowedStoresFromServer().catch(() => {});
    }

    handleDeepLink();
    setActiveNav('home');

  } catch (error) {
    console.error('[BZR] Init failed:', error);
    if (window.__bzrHideSplash) window.__bzrHideSplash();
    if (typeof showToast === 'function') showToast('⚠️ تعذر تحميل البيانات. تحقق من اتصالك.');
    const empty = document.getElementById('storesEmpty');
    if (empty) empty.classList.remove('hidden');
  }
}

/* ═══ CLEANUP (on unload) ═══ */
window.addEventListener('beforeunload', () => {
  try {
    if (typeof storesLiveUnsubscribe !== 'undefined' && storesLiveUnsubscribe) {
      try { storesLiveUnsubscribe(); } catch(e){}
    }
    if (typeof productsLiveUnsubscribe !== 'undefined' && productsLiveUnsubscribe) {
      try { productsLiveUnsubscribe(); } catch(e){}
    }
    stopAutoScroll();
    stopCategoriesAutoScroll();
    if (_cacheWriteTimer) { clearTimeout(_cacheWriteTimer); _flushCacheWrites(); }
  } catch(e){}
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
  initApp();
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('open') === 'cart') setTimeout(openCart, 800);
});

/* ═══ PUBLIC API ═══ */
window.BranZar = {
  version: '9.16.2',
  openStore: openStoreModal,
  openProduct: openProductModal,
  openCart,
  showToast,
  haptic,
  setTheme: applyTheme,
  setView: applyViewMode,
  getFingerprint: getDeviceFingerprint,
  syncFollows: syncFollowedStoresFromServer,

  refreshAll: async () => {
    try {
      cacheManager.remove('all_products_page1');
      cacheManager.remove('stores_list');
      if (typeof dexieClearProducts === 'function') await dexieClearProducts();
      if (typeof dexieClearStores === 'function') await dexieClearStores();
      if (typeof storesLiveUnsubscribe !== 'undefined' && storesLiveUnsubscribe) {
        try { storesLiveUnsubscribe(); } catch(e){}
      }
      if (typeof productsLiveUnsubscribe !== 'undefined' && productsLiveUnsubscribe) {
        try { productsLiveUnsubscribe(); } catch(e){}
      }
      await Promise.all([loadStores(true), loadAllProducts(true)]);
    } catch (e) {
      console.warn('[BZR] refreshAll failed:', e);
    }
  },

  clearProductsCache: async () => {
    if (typeof window.__bzrClearProductsCache === 'function') {
      return window.__bzrClearProductsCache();
    }
    if (typeof dexieClearProducts === 'function') {
      await dexieClearProducts();
      cacheManager.remove('all_products_page1');
      return true;
    }
    return false;
  }
};

console.log('[BZR] app.js loaded ✅ v9.16.2 — Fast Path: Cinematic Only (no loader)');
