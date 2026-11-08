/* ═══════════════════════════════════════════════════════════
   BranZar v9.16.1 — app.js
   Layer 4: Init + Public API
   ✅ v9.16.1: Smart Path (Fast vs Slow loading)
                - Cache Hit: Instant content (no splash, no 5s delay)
                - Cache Miss: 5s Cinematic + Loader → Content
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ INIT ═══ */
async function initApp() {
  initTheme();
  initViewMode();
  
  try {
    // 🔍 الخطوة 1: فحص الكاش أولاً (بدون شبكة)
    let hasCachedContent = false;
    try {
      const cachedStores = await dexieGetAllStores();
      hasCachedContent = cachedStores && cachedStores.length > 0;
    } catch (e) {
      hasCachedContent = false;
    }
    
    if (hasCachedContent) {
      // ⚡ المسار السريع: المحتوى موجود في الكاش
      console.log('[BZR] ⚡ Fast Path: Cache Hit → Rendering instantly');
      
      // 1. ارسم المتاجر والمنتجات من الكاش أولاً (يستغرق < 50ms)
      await loadStores();
      await Promise.all([loadCategories(), loadAllProducts()]);
      
      // 2. الآن المحتوى جاهز، نخفي شاشة التحميل بسلاسة (بدون أنيميشن 5 ثوانٍ)
      if (window.__bzrHideSplash) window.__bzrHideSplash();
      
      // 3. تشغيل المراقبة الحية (onSnapshot) في الخلفية
      setupRealtimeStores();
      setupRealtimeProducts();
      
      // 4. تشغيل المصادقة والإشعارات في الخلفية (بدون تعطيل واجهة المستخدم)
      ensureAuth().then(ok => {
        if (!ok) return;
        updateCartUI();
        initFCM().catch(() => {});
        getDeviceFingerprint().catch(() => {});
        syncFollowedStoresFromServer().catch(() => {});
      }).catch(() => {});
      
    } else {
      // 🐢 المسار البطيء: لا يوجد كاش، جلب من Firebase لأول مرة
      console.log('[BZR] 🐢 Slow Path: Cache Miss → Fetching from Firestore');
      
      // 1. تشغيل أنيميشن الشعار السينمائي (5 ثوانٍ)
      if (window.__bzrPlayCinematic) window.__bzrPlayCinematic();
      
      // 2. التأكد من تسجيل الدخول
      const ok = await ensureAuth();
      if (!ok) throw new Error('Auth failed');
      
      updateCartUI();
      initFCM().catch(() => {});
      getDeviceFingerprint().catch(() => {});
      
      // 3. جلب البيانات من Firebase
      await loadStores();
      await Promise.all([loadCategories(), loadAllProducts()]);
      
      // 4. تشغيل المراقبة الحية
      setupRealtimeStores();
      setupRealtimeProducts();
      
      // 5. إخفاء شاشة التحميل بعد اكتمال كل شيء (قد يكون الأنيميشن انتهى أو لا يزال يعمل)
      if (window.__bzrHideSplash) window.__bzrHideSplash();
      
      syncFollowedStoresFromServer().catch(() => {});
    }
    
    // تشغيل الروابط العميقة وتحديد القائمة السفلية
    handleDeepLink();
    setActiveNav('home');
    
  } catch (error) {
    console.error('[BZR] Init failed:', error);
    // في حال حدوث خطأ، نخفي الشاشة حتى لا يعلق المستخدم
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
  version: '9.16.1',

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

console.log('[BZR] app.js loaded ✅ v9.16.1 — Smart Path (Instant on Cache, 5s on First Visit)');
