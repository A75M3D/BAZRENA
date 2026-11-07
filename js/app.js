/* ═══════════════════════════════════════════════════════════
   BranZar v9.15.1 — app.js
   Layer 4: Init + Public API
   ✅ v9.15.1: Hides Splash only when data is fully loaded
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ INIT ═══ */
async function initApp() {
  initTheme();
  initViewMode();
  
  try {
    // 1. التأكد من تسجيل الدخول
    const ok = await ensureAuth();
    if (!ok) throw new Error('Auth failed');

    updateCartUI();
    initFCM().catch(() => {});
    getDeviceFingerprint().catch(() => {});

    // 2. تحميل المتاجر (من IndexedDB أو الشبكة)
    await loadStores();

    // 3. تحميل المنتجات والفئات بالتوازي
    await Promise.all([loadCategories(), loadAllProducts()]);

    // 4. تشغيل المستمعات الحية (onSnapshot)
    setupRealtimeStores();
    setupRealtimeProducts();

    handleDeepLink();
    setActiveNav('home');
    
    // ✅ 5. الآن فقط، بعد أن جهزت كل البيانات، نخفي شاشة التحميل بسلاسة
    if (window.__bzrHideSplash) window.__bzrHideSplash();
    
    syncFollowedStoresFromServer().catch(() => {});
    
  } catch (error) {
    console.error('[BZR] Init failed:', error);
    
    // ❌ في حال حدوث خطأ، نخفي الشاشة حتى لا يعلق المستخدم
    if (window.__bzrHideSplash) window.__bzrHideSplash();
    
    // إظهار رسالة خطأ للمستخدم
    if (typeof showToast === 'function') {
      showToast('⚠️ تعذر تحميل البيانات. تحقق من اتصالك بالإنترنت.');
    }
    
    // إظهار قسم المتاجر مع رسالة الخطأ
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
    if (typeof allProductsUnsubscribe !== 'undefined' &&
        typeof allProductsUnsubscribe === 'number') {
      try { clearInterval(allProductsUnsubscribe); } catch(e){}
    }
    if (typeof storesPollInterval !== 'undefined' && storesPollInterval) {
      try { clearInterval(storesPollInterval); } catch(e){}
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
  version: '9.15.1',

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

console.log('[BZR] app.js loaded ✅ v9.15.1 — Splash waits for data');
