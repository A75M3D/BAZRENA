/* ═══════════════════════════════════════════════════════════
   BranZar v9.18.0 — data.js
   Layer 2: Data Loading + Smart Stores + Smart Products
   ✅ v9.18.0: Subscription-aware filtering
                - _bzrComputeStoreSubStatus (server-time based)
                - _bzrStoreSubMap: instant store status lookup
                - _bzrIsStoreActive / _bzrIsStoreIdActive helpers
                - _bzrFilterProductsByActiveStores applied at every entry
                - _bzrStoresReady promise (avoids race with product load)
                - Auto-reload products when a store's sub state changes
   ✅ v9.17.0: Store rename propagation (kept intact)
   ═══════════════════════════════════════════════════════════ */
'use strict';

const STORE_FIELDS = Object.freeze({ EDITABLE: ['login_password'], READONLY: ['name', 'whatsapp_number', 'phone_number', 'logo_url', 'cover_url', 'description', 'location', 'category', 'categories'] });
const PRODUCT_FIELDS = Object.freeze({ DESCRIPTION_MAX: 100, DESCRIPTION_MIN: 0, DEFAULT_LOCATION: '' });
const SUPPORT_WHATSAPP = '249908280115';
const SUPPORT_MESSAGES = Object.freeze({
  general: 'السلام عليكم ورحمة الله 👋\nأرغب بالتواصل مع خدمة عملاء BranZar.',
  update_store: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث بيانات متجري على BranZar.\nشكراً لكم 🌸',
  location: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث موقع متجري على BranZar.\nشكراً لكم 🌸',
  description: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث وصف متجري على BranZar.\nشكراً لكم 🌸',
  verify: 'السلام عليكم ورحمة الله 👋\nأرغب بتوثيق حساب متجري على BranZar.',
  subscribe: 'السلام عليكم ورحمة الله 👋\nأرغب بالاشتراك في إحدى باقات BranZar.\nشكراً لكم 🌸'
});

/* ═══════════════════════════════════════════════════════════
   🔒 SUBSCRIPTION LAYER — central source of truth
   ═══════════════════════════════════════════════════════════ */

/** Map<storeId(string), { active, status, endsMs }> */
const _bzrStoreSubMap = new Map();

/** Promise that resolves on first successful store sync (or after safety timeout). */
let _bzrStoresReadyResolve;
const _bzrStoresReady = new Promise((resolve) => { _bzrStoresReadyResolve = resolve; });
let _bzrStoresReadyResolved = false;

/** Convert any Firestore timestamp-ish value to milliseconds (or null). */
function _bzrToMillis(val) {
  if (!val) return null;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (val.toDate && typeof val.toDate === 'function') {
    try { return val.toDate().getTime(); } catch (e) {}
  }
  if (typeof val.seconds === 'number') return val.seconds * 1000;
  if (typeof val._seconds === 'number') return val._seconds * 1000;
  return null;
}

/**
 * Compute effective subscription state from a store doc.
 * - Uses subscriptionEndsAt as the source of truth (server-side timestamps).
 * - Falls back to legacy `is_subscribed === true` only when no end date exists.
 * - Never trusts subscriptionStatus === 'active' alone.
 */
function _bzrComputeStoreSubStatus(data) {
  if (!data) return { active: false, status: 'none', endsMs: null };

  const s = String(data.subscriptionStatus || '').toLowerCase();
  const endsMs = _bzrToMillis(data.subscriptionEndsAt);

  if (s === 'cancelled')        return { active: false, status: 'cancelled', endsMs };
  if (s === 'pending_payment')  return { active: false, status: 'pending_payment', endsMs };

  if (endsMs !== null) {
    if (endsMs < Date.now()) return { active: false, status: 'expired', endsMs };
    return { active: true, status: 'active', endsMs };
  }

  // No end date: legacy stores only
  if (data.is_subscribed === true) return { active: true, status: 'legacy', endsMs: null };

  return { active: false, status: 'none', endsMs: null };
}

/** Upsert a store's subscription info into the in-memory map. */
function _bzrUpsertStoreSub(store) {
  if (!store || !store.id) return;
  const info = _bzrComputeStoreSubStatus(store);
  _bzrStoreSubMap.set(String(store.id), info);
}

/** True if the store (by id) is currently active. Unknown ids default to active. */
function _bzrIsStoreIdActive(storeId) {
  if (!storeId) return true;
  const info = _bzrStoreSubMap.get(String(storeId));
  if (!info) return true; // not loaded yet → safe fallback
  return info.active === true;
}

/** True if the store object is currently active. */
function _bzrIsStoreActive(store) {
  if (!store) return false;
  if (store.id) {
    const info = _bzrStoreSubMap.get(String(store.id));
    if (info) return info.active === true;
  }
  return _bzrComputeStoreSubStatus(store).active === true;
}

/** Returns a Set of active store IDs (strings). */
function _bzrGetActiveStoreIdsSet() {
  const set = new Set();
  _bzrStoreSubMap.forEach((info, id) => { if (info.active) set.add(id); });
  return set;
}

/**
 * Filter out products whose store is not active.
 * Products without `store_id` are kept (legacy data).
 */
function _bzrFilterProductsByActiveStores(products) {
  if (!Array.isArray(products) || products.length === 0) return products || [];
  return products.filter((p) => {
    const sid = p && p.store_id ? String(p.store_id) : '';
    if (!sid) return true;
    return _bzrIsStoreIdActive(sid);
  });
}

/** Wait for stores to load (with safety timeout so products never block forever). */
async function _bzrWaitForStores(timeoutMs = 2500) {
  if (_bzrStoresReadyResolved) return true;
  await Promise.race([
    _bzrStoresReady,
    new Promise((r) => setTimeout(r, timeoutMs))
  ]);
  return _bzrStoresReadyResolved;
}

/** Resolve the stores-ready promise (idempotent). */
function _bzrMarkStoresReady() {
  if (_bzrStoresReadyResolved) return;
  _bzrStoresReadyResolved = true;
  try { _bzrStoresReadyResolve(); } catch (e) {}
}

// Safety: never leave products blocked if stores never fire
setTimeout(_bzrMarkStoresReady, 4000);

/* Public API for the rest of the app */
window.bzrDataSub = {
  computeStatus: _bzrComputeStoreSubStatus,
  isActive: _bzrIsStoreActive,
  isActiveById: _bzrIsStoreIdActive,
  activeIds: _bzrGetActiveStoreIdsSet,
  filterProducts: _bzrFilterProductsByActiveStores,
  ready: () => _bzrStoresReadyResolved,
  waitStores: _bzrWaitForStores,
  getStatus: (storeId) => _bzrStoreSubMap.get(String(storeId)) || null,
  snapshot: () => {
    const out = {};
    _bzrStoreSubMap.forEach((v, k) => { out[k] = { ...v }; });
    return out;
  }
};

/* ═══════════════════════════════════════════════════════════
   🏪 SMART STORES SYSTEM
   ═══════════════════════════════════════════════════════════ */
const LIVE_WINDOW = 10;
const INITIAL_FETCH_LIMIT = 100;
let storesLiveUnsubscribe = null;
let _storesFirstSyncDone = false;
let _isLoadingStores = false;

function rebuildStoreCategories() {
  const cats = [];
  stores.forEach((store) => {
    const category = store.category;
    if (category && String(category).trim() && !cats.includes(category)) cats.push(category);
  });
  categories = cats;
  displayCategories();
}

function sortStoresLikeOriginal(list) {
  return list.slice().sort((a, b) => {
    const followersA = Number(b.followers) || 0, followersB = Number(a.followers) || 0;
    if (followersA !== followersB) return followersB - followersA;
    const tA = (typeof _bzrMillis === 'function') ? _bzrMillis(a.created_at) : 0;
    const tB = (typeof _bzrMillis === 'function') ? _bzrMillis(b.created_at) : 0;
    return tB - tA;
  });
}

function renderStoresFromMemory() {
  const empty = document.getElementById('storesEmpty');
  const errorMessage = document.getElementById('storesErrorMessage');
  rebuildStoreCategories();
  if (!stores.length) {
    if (errorMessage) errorMessage.textContent = '⚠️ لا توجد متاجر متاحة حالياً';
    empty?.classList.remove('hidden');
    renderFollowedStores();
    return;
  }
  empty?.classList.add('hidden');
  displayStores();
  startAutoScroll();
  renderFollowedStores();
  localStorage.setItem(KEYS.VISITED, 'true');
}

async function loadStores(force) {
  if (_isLoadingStores) return;
  _isLoadingStores = true;
  const loader = document.getElementById('storesLoader');
  const empty = document.getElementById('storesEmpty');
  loader?.classList.remove('hidden');
  empty?.classList.add('hidden');
  try {
    let local = force ? [] : await dexieGetAllStores();
    if (local && local.length > 0) {
      stores = sortStoresLikeOriginal(local);
      // 🔒 Register subscription info from Dexie cache
      local.forEach(_bzrUpsertStoreSub);
      renderStoresFromMemory();
      loader?.classList.add('hidden');
    }
    if (!local || local.length === 0) await fetchInitialStores();
    startStoresLiveListener();
  } catch (error) {
    console.error('[BZR] loadStores failed:', error);
    empty?.classList.remove('hidden');
  } finally {
    loader?.classList.add('hidden');
    _isLoadingStores = false;
  }
}

async function fetchInitialStores() {
  try {
    let snapshot;
    try {
      snapshot = await db.collection('stores').orderBy('created_at', 'desc').limit(INITIAL_FETCH_LIMIT).get();
    } catch (err) {
      snapshot = await db.collection('stores').limit(INITIAL_FETCH_LIMIT).get();
    }
    const initial = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    await dexieBulkUpsertStores(initial);
    // 🔒 Register subscription info
    initial.forEach(_bzrUpsertStoreSub);
    stores = sortStoresLikeOriginal(initial);
    renderStoresFromMemory();
    // Resolve first-ready as soon as initial stores arrive (live sync may take longer)
    if (!_bzrStoresReadyResolved) _bzrMarkStoresReady();
  } catch (error) {}
}

/* ✅ v9.18.0 — also reacts to subscription-status changes */
function startStoresLiveListener() {
  if (storesLiveUnsubscribe) return;
  try {
    storesLiveUnsubscribe = db.collection('stores').orderBy('created_at', 'desc').limit(LIVE_WINDOW)
      .onSnapshot({ includeMetadataChanges: false }, async (snapshot) => {
        const isFirstSync = !_storesFirstSyncDone;
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // 🆕 Detect renames BEFORE upserting (compare against old Dexie state)
        const renames = [];
        if (!isFirstSync && bzrDB) {
          for (const c of snapshot.docChanges()) {
            if (c.type === 'modified') {
              try {
                const oldStore = await bzrDB.stores.get(c.doc.id);
                const newName = String(c.doc.data().name || '').trim();
                const oldName = oldStore ? String(oldStore.name || '').trim() : '';
                if (oldName && newName && oldName !== newName) {
                  renames.push({ id: c.doc.id, oldName, newName });
                }
              } catch (e) {}
            }
          }
        }

        let added = [];
        if (!isFirstSync) {
          for (const c of snapshot.docChanges()) {
            if (c.type === 'added') {
              let exists = false;
              if (bzrDB) { try { exists = !!(await bzrDB.stores.get(c.doc.id)); } catch (e) {} }
              if (!exists) added.push({ id: c.doc.id, ...c.doc.data() });
            }
          }
        }

        // 🆕 Snapshot the previous subscription map to detect changes
        const prevSubMap = new Map(_bzrStoreSubMap);

        await dexieBulkUpsertStores(docs);

        // 🔒 Update subscription map for every incoming store
        docs.forEach(_bzrUpsertStoreSub);

        // 🆕 Detect any active↔inactive transitions in this snapshot
        let subStateChanged = false;
        for (const doc of docs) {
          const prev = prevSubMap.get(String(doc.id));
          const next = _bzrStoreSubMap.get(String(doc.id));
          if (!prev) continue; // new store → handled by added path
          if (!next) continue;
          if (prev.active !== next.active) {
            subStateChanged = true;
            break;
          }
        }

        // 🆕 Apply renames — updates products Dexie + clears caches
        for (const r of renames) {
          if (typeof window.__bzrHandleStoreRename === 'function') {
            await window.__bzrHandleStoreRename(r.id, r.newName);
            console.log('[BZR] Store rename synced:', r.oldName, '→', r.newName);
          } else {
            console.warn('[BZR] ⚠️ __bzrHandleStoreRename missing — Dexie products may show stale names');
          }
        }

        let all = await dexieGetAllStores();
        stores = sortStoresLikeOriginal(all.length ? all : docs);
        if (!isFirstSync || stores.length > 0) renderStoresFromMemory();
        if (!isFirstSync && added.length > 0) {
          const names = added.map(s => s.name).filter(Boolean);
          showNewStoreToast(names.join(' • '));
        }

        // 🔒 If any store changed subscription state → refresh products
        if (subStateChanged && typeof loadAllProducts === 'function') {
          console.log('[BZR] Subscription state changed → reloading products');
          setTimeout(() => { try { loadAllProducts(true); } catch (e) {} }, 300);
        }

        if (isFirstSync) {
          _storesFirstSyncDone = true;
          _bzrMarkStoresReady();
        }
      }, (error) => {
        storesLiveUnsubscribe = null;
        setTimeout(startStoresLiveListener, 5000);
      });
  } catch (error) {
    storesLiveUnsubscribe = null;
  }
}

document.getElementById('retryStoresBtn')?.addEventListener('click', () => {
  if (storesLiveUnsubscribe) { try { storesLiveUnsubscribe(); } catch(e){} storesLiveUnsubscribe = null; }
  _storesFirstSyncDone = false;
  loadStores(true);
});

function showNewStoreToast(storeName) {
  document.getElementById('bzrNewStoreToast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'bzrNewStoreToast';
  toast.className = 'bzr-new-store-toast';
  toast.innerHTML = `<span class="bzr-icon">🎉</span><div class="bzr-body"><span class="bzr-title">متجر جديد انضم إلى BranZar</span><span class="bzr-name">${storeName || 'مرحباً'}</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

/* ═══════════════════════════════════════════════════════════
   📦 SMART PRODUCTS SYSTEM (v9.18.0 — subscription-aware)
   ═══════════════════════════════════════════════════════════ */
const PRODUCTS_LIVE_WINDOW = 20;
const PRODUCTS_INITIAL_FETCH = 100;

async function loadAllProducts(force) {
  if (_isLoadingSmartProducts) return;
  _isLoadingSmartProducts = true;
  const loader = document.getElementById('allProductsLoader');
  const empty = document.getElementById('allProductsEmpty');
  const grid = document.getElementById('allProductsGrid');
  const loadMoreBtn = document.getElementById('loadMoreProductsBtn');
  loader?.classList.remove('hidden');
  empty?.classList.add('hidden');
  if (grid) grid.innerHTML = '';
  loadMoreBtn?.classList.add('hidden');
  allProductsLocal = [];
  lastVisibleDoc = null;
  hasMoreProducts = true;
  try {
    // 🔒 Ensure store subscription status is known before rendering products
    await _bzrWaitForStores(2500);

    let local = force ? [] : await dexieGetRecentProducts(PRODUCTS_INITIAL_FETCH);

    // 🔒 Filter expired-store products from cached data
    if (local && local.length > 0) {
      local = _bzrFilterProductsByActiveStores(local);
    }

    if (local && local.length > 0) {
      const firstPage = local.slice(0, CONFIG.PRODUCTS_PER_PAGE);
      allProductsLocal = firstPage;
      hasMoreProducts = local.length > CONFIG.PRODUCTS_PER_PAGE;
      renderProductsBatch(firstPage, false);
      if (hasMoreProducts) loadMoreBtn?.classList.remove('hidden');
      loader?.classList.add('hidden');
    }
    if (!local || local.length === 0) await fetchInitialProducts();

    if (productsLiveUnsubscribe) {
      try { productsLiveUnsubscribe(); } catch (e) {}
      productsLiveUnsubscribe = null;
    }
    _productsFirstSyncDone = false;
    startProductsLiveListener();
  } catch (error) {
    if (grid) grid.innerHTML = '<p style="text-align:center;color:var(--c-text-soft);">تعذر تحميل المنتجات</p>';
  } finally {
    loader?.classList.add('hidden');
    _isLoadingSmartProducts = false;
  }
}

async function fetchInitialProducts() {
  try {
    // 🔒 Defense-in-depth: wait for stores even if called standalone
    await _bzrWaitForStores(2500);

    let snapshot;
    try {
      snapshot = await db.collection('products').orderBy('created_at', 'desc').limit(PRODUCTS_INITIAL_FETCH).get();
    } catch (err) {
      snapshot = await db.collection('products').limit(PRODUCTS_INITIAL_FETCH).get();
    }
    let initial = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Save all to Dexie (so we keep cache for later when store renews)
    await dexieBulkUpsertProducts(initial);

    // 🔒 Filter what we render
    const visible = _bzrFilterProductsByActiveStores(initial);

    const firstPage = visible.slice(0, CONFIG.PRODUCTS_PER_PAGE);
    allProductsLocal = firstPage;
    if (visible.length >= firstPage.length && firstPage.length > 0) {
      // Best-effort cursor: use the last visible doc (still not a perfect cursor, but consistent)
      const lastVisibleId = firstPage[firstPage.length - 1].id;
      const found = snapshot.docs.find(d => d.id === lastVisibleId);
      lastVisibleDoc = found || snapshot.docs[snapshot.docs.length - 1];
    } else if (snapshot.docs.length > 0) {
      lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    }
    hasMoreProducts = visible.length > CONFIG.PRODUCTS_PER_PAGE;
    renderProductsBatch(firstPage, false);
    if (hasMoreProducts) document.getElementById('loadMoreProductsBtn')?.classList.remove('hidden');
  } catch (error) {}
}

/* ✅ v9.18.0 — filters added products by active stores */
function startProductsLiveListener() {
  if (productsLiveUnsubscribe) return;
  try {
    productsLiveUnsubscribe = db.collection('products').orderBy('created_at', 'desc').limit(PRODUCTS_LIVE_WINDOW)
      .onSnapshot({ includeMetadataChanges: false }, async (snapshot) => {
        const isFirstSync = !_productsFirstSyncDone;
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        let added = [], modified = [];
        for (const c of snapshot.docChanges()) {
          if (c.type === 'added') {
            let exists = false;
            if (bzrDB) { try { exists = !!(await bzrDB.products.get(c.doc.id)); } catch (e) {} }
            if (!exists) added.push({ id: c.doc.id, ...c.doc.data() });
          } else if (c.type === 'modified') {
            modified.push({ id: c.doc.id, ...c.doc.data() });
          }
        }
        await dexieBulkUpsertProducts(docs);
        if (currentCategory) {
          if (isFirstSync) _productsFirstSyncDone = true;
          return;
        }
        if (!isFirstSync && modified.length > 0) {
          // 🔒 Filter modified products: only apply if their store is still active
          const modMap = new Map(
            _bzrFilterProductsByActiveStores(modified).map(p => [p.id, p])
          );
          let anyChange = false;
          allProductsLocal = allProductsLocal.map(p => {
            if (modMap.has(p.id)) { anyChange = true; return { ...p, ...modMap.get(p.id) }; }
            return p;
          });
          if (anyChange) {
            const grid = document.getElementById('allProductsGrid');
            if (grid) grid.innerHTML = '';
            if (typeof renderProductsBatch === 'function' && allProductsLocal.length > 0) {
              renderProductsBatch(allProductsLocal, 'replace');
            }
          }
        }
        if (!isFirstSync && added.length > 0) {
          const existingIds = new Set(allProductsLocal.map(p => p.id));
          const trulyNew = added.filter(p => !existingIds.has(p.id));
          // 🔒 Filter added products by active stores
          const visibleNew = _bzrFilterProductsByActiveStores(trulyNew);
          if (visibleNew.length > 0) {
            allProductsLocal = visibleNew.concat(allProductsLocal).slice(0, CONFIG.SEARCH_CAP);
            renderProductsBatch(visibleNew, true);
          }
        }
        if (isFirstSync) _productsFirstSyncDone = true;
      }, (error) => {
        productsLiveUnsubscribe = null;
        setTimeout(startProductsLiveListener, 5000);
      });
  } catch (error) {
    productsLiveUnsubscribe = null;
  }
}

async function fetchProductsPage(cursorDoc, silent) {
  if (!RateLimiter.canRequest('products')) { if (silent) return; throw new Error('rate_limit'); }
  let query, skipCount = 0;
  if (cursorDoc) {
    query = db.collection('products').orderBy('created_at', 'desc').startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
  } else if (allProductsLocal.length > 0) {
    skipCount = allProductsLocal.length;
    query = db.collection('products').orderBy('created_at', 'desc').limit(skipCount + CONFIG.PRODUCTS_PER_PAGE);
  } else {
    query = db.collection('products').orderBy('created_at', 'desc').limit(CONFIG.PRODUCTS_PER_PAGE);
  }
  let snapshot;
  try { snapshot = await query.get(); }
  catch (error) {
    let fallbackQuery = db.collection('products').limit(skipCount + CONFIG.PRODUCTS_PER_PAGE || CONFIG.PRODUCTS_PER_PAGE);
    if (cursorDoc) fallbackQuery = db.collection('products').startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
    snapshot = await fallbackQuery.get();
  }
  const usableDocs = snapshot.docs.slice(skipCount);
  if (snapshot.docs.length > 0) lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
  hasMoreProducts = usableDocs.length >= CONFIG.PRODUCTS_PER_PAGE;
  const fresh = usableDocs.map(doc => ({ id: doc.id, ...doc.data() }));
  await dexieBulkUpsertProducts(fresh);
  const existingIds = new Set(allProductsLocal.map(p => p.id));
  const newItems = fresh.filter(p => !existingIds.has(p.id));
  // 🔒 Filter new page items by active stores
  const visibleNew = _bzrFilterProductsByActiveStores(newItems);
  allProductsLocal = allProductsLocal.concat(visibleNew);
  if (!silent) renderProductsBatch(visibleNew);
  const loadButton = document.getElementById('loadMoreProductsBtn');
  const emptyElement = document.getElementById('allProductsEmpty');
  if (allProductsLocal.length === 0) {
    emptyElement?.classList.remove('hidden');
    loadButton?.classList.add('hidden');
  } else {
    emptyElement?.classList.add('hidden');
    if (hasMoreProducts) loadButton?.classList.remove('hidden');
    else loadButton?.classList.add('hidden');
  }
}

document.getElementById('loadMoreProductsBtn')?.addEventListener('click', async () => {
  const button = document.getElementById('loadMoreProductsBtn');
  if (button.disabled || !hasMoreProducts || _isLoadingSmartProducts) return;
  button.disabled = true;
  haptic('light');
  try {
    if (currentCategory) await fetchProductsByCategoryPage(lastVisibleDoc, false);
    else await fetchProductsPage(lastVisibleDoc, false);
  } catch (error) {
    showToast('تعذر تحميل المزيد');
  }
  button.disabled = false;
});

async function applyProductsFilter(category) {
  currentCategory = category;
  const grid = document.getElementById('allProductsGrid');
  const emptyElement = document.getElementById('allProductsEmpty');
  const loadButton = document.getElementById('loadMoreProductsBtn');

  if (!category) {
    if (grid) grid.innerHTML = '';
    allProductsLocal = [];
    lastVisibleDoc = null;
    hasMoreProducts = true;
    loadButton?.classList.add('hidden');
    emptyElement?.classList.add('hidden');
    try {
      await _bzrWaitForStores(2500);
      let recent = await dexieGetRecentProducts(PRODUCTS_INITIAL_FETCH);
      recent = _bzrFilterProductsByActiveStores(recent || []);
      if (recent && recent.length > 0) {
        const firstPage = recent.slice(0, CONFIG.PRODUCTS_PER_PAGE);
        allProductsLocal = firstPage;
        hasMoreProducts = recent.length > CONFIG.PRODUCTS_PER_PAGE;
        renderProductsBatch(firstPage, false);
        if (hasMoreProducts) loadButton?.classList.remove('hidden');
        return;
      }
    } catch (e) {}
    try { await fetchInitialProducts(); } catch (e) {}
    return;
  }

  if (grid) grid.innerHTML = '';
  allProductsLocal = [];
  lastVisibleDoc = null;
  hasMoreProducts = true;
  loadButton?.classList.add('hidden');
  emptyElement?.classList.add('hidden');
  try {
    await _bzrWaitForStores(2500);
    await fetchProductsByCategoryPage(null, false);
  } catch (error) {
    emptyElement?.classList.remove('hidden');
  }
}

async function fetchProductsByCategoryPage(cursorDoc, silent) {
  const category = currentCategory;
  if (!category) return;
  if (!RateLimiter.canRequest('products_cat')) { if (!silent) throw new Error('rate_limit'); }

  // 🔒 Only include stores whose subscriptions are currently active
  const storeIds = stores
    .filter((store) => store.category === category)
    .filter((store) => _bzrIsStoreActive(store))
    .map((store) => String(store.id))
    .filter(Boolean);

  if (!storeIds.length) {
    if (!silent) document.getElementById('allProductsGrid').innerHTML = '';
    document.getElementById('allProductsEmpty').classList.remove('hidden');
    document.getElementById('loadMoreProductsBtn').classList.add('hidden');
    hasMoreProducts = false;
    return;
  }

  const chunks = [];
  for (let i = 0; i < storeIds.length; i += 10) chunks.push(storeIds.slice(i, i + 10));
  const fetched = [];
  let newCursor = cursorDoc;
  for (const chunk of chunks) {
    try {
      let query = db.collection('products').where('store_id', 'in', chunk).limit(CONFIG.PRODUCTS_PER_PAGE);
      if (cursorDoc) query = db.collection('products').where('store_id', 'in', chunk).startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
      try { query = query.orderBy('created_at', 'desc'); } catch (error) {}
      const snapshot = await query.get();
      snapshot.docs.forEach((doc) => fetched.push(doc));
      if (snapshot.docs.length > 0) newCursor = snapshot.docs[snapshot.docs.length - 1];
    } catch (error) {
      try {
        let fallbackQuery = db.collection('products').where('store_id', 'in', chunk).limit(CONFIG.PRODUCTS_PER_PAGE);
        if (cursorDoc) fallbackQuery = fallbackQuery.startAfter(cursorDoc);
        const snapshot = await fallbackQuery.get();
        snapshot.docs.forEach((doc) => fetched.push(doc));
        if (snapshot.docs.length > 0) newCursor = snapshot.docs[snapshot.docs.length - 1];
      } catch (fallbackError) {}
    }
  }
  fetched.sort((a, b) => (b.data().created_at?.seconds || 0) - (a.data().created_at?.seconds || 0));
  const limited = fetched.slice(0, CONFIG.PRODUCTS_PER_PAGE);
  if (limited.length > 0) lastVisibleDoc = limited[limited.length - 1];
  hasMoreProducts = fetched.length >= CONFIG.PRODUCTS_PER_PAGE;
  let items = limited.map((doc) => ({ id: doc.id, ...doc.data() }));
  await dexieBulkUpsertProducts(items);
  // 🔒 Filter by active stores (belt & suspenders — even if storeId matched, verify map)
  items = _bzrFilterProductsByActiveStores(items);
  const existingIds = new Set(allProductsLocal.map((product) => product.id));
  const newItems = items.filter((item) => !existingIds.has(item.id));
  allProductsLocal = allProductsLocal.concat(newItems);
  if (!silent) renderProductsBatch(newItems);
  if (allProductsLocal.length === 0) document.getElementById('allProductsEmpty').classList.remove('hidden');
  else document.getElementById('allProductsEmpty').classList.add('hidden');
  const loadButton = document.getElementById('loadMoreProductsBtn');
  if (hasMoreProducts) loadButton.classList.remove('hidden');
  else loadButton.classList.add('hidden');
}

async function loadCategories(force) {
  if (force) {
    await dexieClearStores();
    _storesFirstSyncDone = false;
    if (storesLiveUnsubscribe) { try { storesLiveUnsubscribe(); } catch(e){} storesLiveUnsubscribe = null; }
    stores = [];
    await loadStores(true);
    return;
  }
  if (stores && stores.length) { rebuildStoreCategories(); return; }
  await loadStores();
}

/* ═══ FOLLOW SYSTEM ═══ */
async function syncFollowedStoresFromServer() {
  try {
    if (!await ensureAuth()) return;
    const userId = getUserIdentity();
    if (!userId) return;
    const snapshot = await db.collection('store_follows').where('fingerprint', '==', userId).get();
    const serverIds = new Set();
    snapshot.docs.forEach(doc => { if (doc.data()?.storeId) serverIds.add(String(doc.data().storeId)); });
    _followedFromServer = serverIds;
    const merged = new Set([...getFollowedStores().map(String), ...serverIds]);
    saveFollowedStores(Array.from(merged));
    renderFollowedStores();
  } catch (error) {}
}

async function performFollowToggle(store) {
  const storeId = String(getStoreId(store));
  await ensureAuth();
  const userId = getUserIdentity();
  if (!userId) throw new Error('no_auth_identity');
  const followRef = db.collection('store_follows').doc(storeId + '_' + userId);
  const storeRef = db.collection('stores').doc(storeId);
  return await db.runTransaction(async (transaction) => {
    const followDoc = await transaction.get(followRef);
    if (followDoc.exists) {
      transaction.delete(followRef);
      transaction.set(storeRef, { followers: firebase.firestore.FieldValue.increment(-1) }, { merge: true });
      return { action: 'unfollowed', storeId };
    }
    transaction.set(followRef, { storeId, fingerprint: userId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    transaction.set(storeRef, { followers: firebase.firestore.FieldValue.increment(1) }, { merge: true });
    return { action: 'followed', storeId };
  });
}

async function checkFollowStatusFromServer(storeId) {
  try {
    const userId = getUserIdentity();
    if (!userId) return false;
    return (await db.collection('store_follows').doc(String(storeId) + '_' + userId).get()).exists;
  } catch (error) { return false; }
}

function setupRealtimeStores() { startStoresLiveListener(); }
function setupRealtimeProducts() { startProductsLiveListener(); }

async function handleDeepLink() {
  try {
    const params = new URLSearchParams(window.location.search);
    let storeId = params.get('store');
    if (!storeId) return;
    storeId = decodeURIComponent(storeId).trim();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const store = stores.find(item => String(getStoreId(item)) === String(storeId));
    if (store) {
      updateMetaTagsForStore(store);
      try { window.history.replaceState({}, document.title, window.location.origin + window.location.pathname); } catch (error) {}
      setTimeout(() => openStoreModal(store), 300);
    }
  } catch (error) {}
}

function getStoreLocation(store) { return (store?.location && String(store.location).trim()) || ''; }
function hasStoreLocation(store) { return getStoreLocation(store).length > 0; }
function getProductDescription(product) { return ((product?.description && String(product.description).trim()) || '').slice(0, PRODUCT_FIELDS.DESCRIPTION_MAX); }
function hasProductDescription(product) { return getProductDescription(product).length > 0; }
function openSupportWhatsApp(context) { window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(SUPPORT_MESSAGES[context] || SUPPORT_MESSAGES.general)}`, '_blank'); }

console.log('[BZR] data.js loaded ✅ v9.18.0 — subscription-aware filtering enabled');
