/* ═══════════════════════════════════════════════════════════
   BranZar v9.15.0 — app.js
   Layer 4: Init + Public API
   ✅ v9.15.0: Smart products + stores (Dexie + onSnapshot)
                - Unsubscribe on unload (no clearInterval)
                - refreshAll clears Dexie + cache
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ INIT ═══ */
async function initApp() {
  initTheme();
  initViewMode();
  const ok = await ensureAuth();
  if (!ok) { window.__bzrHideSplash(); return; }

  updateCartUI();
  initFCM().catch(() => {});
  getDeviceFingerprint().catch(() => {});

  // المتاجر أولاً (لأن الفئات تعتمد عليها)
  await loadStores();

  // المنتجات + الفئات بالتوازي
  await Promise.all([loadCategories(), loadAllProducts()]);

  // مستمعات حية (onSnapshot)
  setupRealtimeStores();
  setupRealtimeProducts();

  handleDeepLink();
  setActiveNav('home');
  setTimeout(() => window.__bzrHideSplash(), 400);
  syncFollowedStoresFromServer().catch(() => {});
}

/* ═══ CLEANUP (on unload) ═══ */
window.addEventListener('beforeunload', () => {
  try {
    // 🆕 v9.15.0: unsubscribe من onSnapshot
    if (typeof storesLiveUnsubscribe !== 'undefined' && storesLiveUnsubscribe) {
      try { storesLiveUnsubscribe(); } catch(e){}
    }
    if (typeof productsLiveUnsubscribe !== 'undefined' && productsLiveUnsubscribe) {
      try { productsLiveUnsubscribe(); } catch(e){}
    }
    // توافق خلفي مع المتغيرات القديمة (لو بقيت)
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
  version: '9.15.0',

  openStore: openStoreModal,
  openProduct: openProductModal,
  openCart,
  showToast,
  haptic,
  setTheme: applyTheme,
  setView: applyViewMode,
  getFingerprint: getDeviceFingerprint,
  syncFollows: syncFollowedStoresFromServer,

  // 🆕 v9.15.0: مسح شامل (Dexie + localStorage) ثم إعادة تحميل
  refreshAll: async () => {
    try {
      // امسح localStorage cache
      cacheManager.remove('all_products_page1');
      cacheManager.remove('stores_list');

      // امسح IndexedDB (Dexie)
      if (typeof dexieClearProducts === 'function') await dexieClearProducts();
      if (typeof dexieClearStores === 'function') await dexieClearStores();

      // أوقف المستمعات القديمة
      if (typeof storesLiveUnsubscribe !== 'undefined' && storesLiveUnsubscribe) {
        try { storesLiveUnsubscribe(); } catch(e){}
      }
      if (typeof productsLiveUnsubscribe !== 'undefined' && productsLiveUnsubscribe) {
        try { productsLiveUnsubscribe(); } catch(e){}
      }

      // أعد التحميل
      await Promise.all([loadStores(true), loadAllProducts(true)]);
    } catch (e) {
      console.warn('[BZR] refreshAll failed:', e);
    }
  },

  // 🆕 v9.15.0: مسح كاش المنتجات فقط (للتطوير)
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

console.log('[BZR] app.js loaded ✅ v9.15.0 — Smart products + stores (Dexie + onSnapshot)');
