/* ═══════════════════════════════════════════════════════════
   BranZar v9.8.3 — app.js
   Layer 4: Init + Public API
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

  await loadStores();
  await Promise.all([loadCategories(), loadAllProducts()]);

  setupRealtimeProducts();
  setupRealtimeStores();
  handleDeepLink();
  setActiveNav('home');
  setTimeout(() => window.__bzrHideSplash(), 400);
  syncFollowedStoresFromServer().catch(() => {});

  /* ✅ iOS: إظهار زر التثبيت بعد 8 ثوانٍ */
  maybeShowIOSButton();
}

window.addEventListener('beforeunload', () => {
  try {
    if (allProductsUnsubscribe) clearInterval(allProductsUnsubscribe);
    if (storesPollInterval) clearInterval(storesPollInterval);
    stopAutoScroll();
    stopCategoriesAutoScroll();
    if (_cacheWriteTimer) { clearTimeout(_cacheWriteTimer); _flushCacheWrites(); }
  } catch(e){}
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp, { once: true });
else initApp();

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('open') === 'cart') setTimeout(openCart, 800);
});

/* ═══ PUBLIC API ═══ */
window.BranZar = {
  version: '9.8.3',
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
    cacheManager.remove('all_products_page1');
    cacheManager.remove('stores_list');
    await Promise.all([loadStores(true), loadAllProducts(true)]);
  }
};

console.log('[BZR] app.js loaded ✅ v9.8.3');
