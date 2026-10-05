/* ═══════════════════════════════════════════════════════════
   BranZar v9.8.4 — data.js
   Layer 2: Data Loading + Follow System + Polling + Deep Link
   ✅ v9.8.4: إصلاح عرض منتجات الفئات (بدون composite index)
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ DATA LOADING ═══ */
async function loadStores(force) {
  const loader = document.getElementById('storesLoader');
  const empty = document.getElementById('storesEmpty');
  const container = document.getElementById('storesScrollContainer');
  loader.classList.remove('hidden');
  empty.classList.add('hidden');
  container.innerHTML = '';
  try {
    const result = await fetchWithCache('stores_list', async () => {
      let snap;
      try {
        snap = await db.collection('stores').orderBy('created_at', 'desc').limit(30).get();
      } catch(e) {
        snap = await db.collection('stores').limit(30).get();
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, force, CONFIG.CACHE_TTL_STORES);
    stores = result;
    const cats = [];
    stores.forEach(s => {
      const c = s.category;
      if (c && String(c).trim() && cats.indexOf(String(c).trim()) === -1) {
        cats.push(String(c).trim());
      }
    });
    categories = cats;
    displayCategories();
    if (stores.length === 0) {
      document.getElementById('storesErrorMessage').textContent = '⚠️ لا توجد متاجر متاحة حالياً';
      empty.classList.remove('hidden');
      renderFollowedStores();
    } else {
      displayStores();
      startAutoScroll();
      renderFollowedStores();
      localStorage.setItem(KEYS.VISITED, 'true');
    }
  } catch(err) {
    document.getElementById('storesErrorMessage').textContent =
      '⚠️ تعذر تحميل المتاجر — تحقق من الاتصال وحاول مجدداً';
    empty.classList.remove('hidden');
  } finally {
    loader.classList.add('hidden');
  }
}
document.getElementById('retryStoresBtn')?.addEventListener('click', () => loadStores(true));

async function loadAllProducts(force) {
  if (isLoadingProducts) return;
  isLoadingProducts = true;
  const loader = document.getElementById('allProductsLoader');
  const empty = document.getElementById('allProductsEmpty');
  const grid = document.getElementById('allProductsGrid');
  loader.classList.remove('hidden');
  empty.classList.add('hidden');
  grid.innerHTML = '';
  document.getElementById('loadMoreProductsBtn').classList.add('hidden');
  allProductsLocal = [];
  lastVisibleDoc = null;
  hasMoreProducts = true;
  if (!force) {
    const cached = cacheManager.get('all_products_page1');
    if (cached && Array.isArray(cached.items)) {
      allProductsLocal = cached.items;
      renderProductsBatch(allProductsLocal);
      hasMoreProducts = cached.hasMore !== false;
      if (hasMoreProducts) document.getElementById('loadMoreProductsBtn').classList.remove('hidden');
      loader.classList.add('hidden');
      isLoadingProducts = false;
      return;
    }
  }
  try { await fetchProductsPage(null, false); }
  catch(err) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--c-text-soft);">تعذر تحميل المنتجات</p>';
  } finally {
    loader.classList.add('hidden');
    isLoadingProducts = false;
  }
}

async function fetchProductsPage(cursorDoc, silent) {
  try {
    if (!RateLimiter.canRequest('products')) {
      if (silent) return;
      throw new Error('rate_limit');
    }
    let q = db.collection('products').orderBy('created_at', 'desc').limit(CONFIG.PRODUCTS_PER_PAGE);
    if (cursorDoc) {
      q = db.collection('products').orderBy('created_at', 'desc').startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
    }
    let snap;
    try { snap = await q.get(); }
    catch(e) {
      let q2 = db.collection('products').limit(CONFIG.PRODUCTS_PER_PAGE);
      if (cursorDoc) q2 = db.collection('products').startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
      snap = await q2.get();
    }
    const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (snap.docs.length > 0) lastVisibleDoc = snap.docs[snap.docs.length - 1];
    hasMoreProducts = snap.docs.length === CONFIG.PRODUCTS_PER_PAGE;
    const existingIds = new Set(allProductsLocal.map(p => p.id));
    const newItems = fresh.filter(p => !existingIds.has(p.id));
    allProductsLocal = allProductsLocal.concat(newItems);
    if (!silent) renderProductsBatch(fresh);
    const loadBtn = document.getElementById('loadMoreProductsBtn');
    const emptyEl = document.getElementById('allProductsEmpty');
    if (allProductsLocal.length === 0) { emptyEl.classList.remove('hidden'); loadBtn.classList.add('hidden'); }
    else emptyEl.classList.add('hidden');
    if (hasMoreProducts) loadBtn.classList.remove('hidden'); else loadBtn.classList.add('hidden');
    if (!cursorDoc) {
      cacheManager.set('all_products_page1',
        { items: allProductsLocal.slice(0, CONFIG.PRODUCTS_PER_PAGE), hasMore: hasMoreProducts },
        CONFIG.CACHE_TTL_PRODUCTS);
    }
  } catch(err) { throw err; }
}

document.getElementById('loadMoreProductsBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('loadMoreProductsBtn');
  if (btn.disabled || !hasMoreProducts || isLoadingProducts) return;
  btn.disabled = true;
  haptic('light');
  try {
    if (currentCategory) await fetchProductsByCategoryPage(lastVisibleDoc, false);
    else await fetchProductsPage(lastVisibleDoc, false);
  } catch(e){ showToast('تعذر تحميل المزيد'); }
  btn.disabled = false;
});

/* ═══════════════════════════════════════════════════════════
   ✅ v9.8.4: applyProductsFilter — مُبسّط ومحسّن
   ═══════════════════════════════════════════════════════════ */
async function applyProductsFilter(cat) {
  currentCategory = cat;
  const grid = document.getElementById('allProductsGrid');
  const emptyEl = document.getElementById('allProductsEmpty');
  const loadBtn = document.getElementById('loadMoreProductsBtn');

  /* ─── حالة "الكل" ─── */
  if (!cat) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem 0;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF7A00;"></i></div>';
    allProductsLocal = [];
    lastVisibleDoc = null;
    hasMoreProducts = true;
    loadBtn.classList.add('hidden');
    emptyEl.classList.add('hidden');
    try {
      await fetchProductsPage(null, false);
    } catch(e) {
      console.error('[BZR] fetchProductsPage error:', e);
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--c-text-soft);">' +
        '<i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:#CBD5E1;display:block;margin-bottom:1rem;"></i>' +
        '<p style="font-weight:800;font-size:1rem;">تعذر تحميل المنتجات</p>' +
        '</div>';
    }
    return;
  }

  /* ─── حالة فئة محددة ─── */
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem 0;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF7A00;"></i></div>';
  allProductsLocal = [];
  lastVisibleDoc = null;
  hasMoreProducts = true;
  loadBtn.classList.add('hidden');
  emptyEl.classList.add('hidden');

  try {
    await fetchProductsByCategoryPage(null, false);
  } catch(e) {
    console.error('[BZR] fetchProductsByCategoryPage error:', e);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--c-text-soft);">' +
      '<i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:#CBD5E1;display:block;margin-bottom:1rem;"></i>' +
      '<p style="font-weight:800;font-size:1rem;">تعذر تحميل المنتجات</p>' +
      '</div>';
  }
}

/* ═══════════════════════════════════════════════════════════
   ✅ v9.8.4: fetchProductsByCategoryPage — مُصلح بالكامل
   ✅ مقارنة trim (تتجاهل المسافات)
   ✅ بدون orderBy (يتجنب composite index)
   ✅ fallback ذكي (متجر بمتجر)
   ✅ console.log للتشخيص
   ═══════════════════════════════════════════════════════════ */
async function fetchProductsByCategoryPage(cursorDoc, silent) {
  const cat = currentCategory;
  if (!cat) return;

  if (!RateLimiter.canRequest('products_cat')) {
    if (!silent) throw new Error('rate_limit');
    return;
  }

  /* ✅ 1. تنظيف اسم الفئة */
  const cleanCat = String(cat || '').trim();
  if (!cleanCat) return;

  /* ✅ 2. مقارنة مرنة (trim) */
  const matchingStores = stores.filter(s =>
    String(s.category || '').trim() === cleanCat
  );
  const storeNames = matchingStores.map(s => s.name).filter(Boolean);

  console.log('[BZR] fetchByCategory:', {
    category: cleanCat,
    matchingStores: matchingStores.length,
    storeNames: storeNames.slice(0, 5)
  });

  /* ✅ 3. لا متاجر في هذه الفئة */
  if (!storeNames.length) {
    if (!silent) {
      const grid = document.getElementById('allProductsGrid');
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--c-text-soft);">' +
        '<i class="fas fa-box-open" style="font-size:2.5rem;color:#CBD5E1;display:block;margin-bottom:1rem;"></i>' +
        '<p style="font-weight:800;font-size:1rem;">لا توجد متاجر في فئة "' + sanitizeHTML(cleanCat) + '"</p>' +
        '</div>';
    }
    document.getElementById('allProductsEmpty').classList.add('hidden');
    document.getElementById('loadMoreProductsBtn').classList.add('hidden');
    hasMoreProducts = false;
    return;
  }

  /* ✅ 4. تقسيم إلى chunks (10 كحد أقصى) */
  const chunks = [];
  for (let i = 0; i < storeNames.length; i += 10) {
    chunks.push(storeNames.slice(i, i + 10));
  }

  const fetched = [];

  /* ✅ 5. جلب بدون orderBy (يتجنب composite index) */
  for (const chunk of chunks) {
    try {
      const q = db.collection('products')
        .where('store_name', 'in', chunk)
        .limit(CONFIG.PRODUCTS_PER_PAGE * 3);

      const snap = await q.get();
      snap.docs.forEach(d => fetched.push(d));
      console.log('[BZR] Chunk:', chunk.length, 'stores →', snap.docs.length, 'products');

    } catch (err) {
      console.warn('[BZR] Chunk failed:', err.code, '- trying single stores');
      /* ✅ Fallback: متجر بمتجر */
      for (const singleStore of chunk) {
        try {
          const snap2 = await db.collection('products')
            .where('store_name', '==', singleStore)
            .limit(CONFIG.PRODUCTS_PER_PAGE)
            .get();
          snap2.docs.forEach(d => fetched.push(d));
          console.log('[BZR] Single store:', singleStore, '→', snap2.docs.length, 'products');
        } catch (e2) {
          console.error('[BZR] Single store failed:', singleStore, e2.code);
        }
      }
    }
  }

  console.log('[BZR] Total fetched:', fetched.length);

  /* ✅ 6. ترتيب حسب created_at (في JS) */
  fetched.sort((a, b) => {
    const aTime = a.data().created_at?.seconds || 0;
    const bTime = b.data().created_at?.seconds || 0;
    return bTime - aTime;
  });

  /* ✅ 7. تحديد الدفعة الحالية */
  const limited = fetched.slice(0, CONFIG.PRODUCTS_PER_PAGE);
  if (limited.length > 0) {
    lastVisibleDoc = limited[limited.length - 1];
  }
  hasMoreProducts = fetched.length > CONFIG.PRODUCTS_PER_PAGE;

  const items = limited.map(d => ({ id: d.id, ...d.data() }));
  const existingIds = new Set(allProductsLocal.map(p => p.id));
  const newItems = items.filter(p => !existingIds.has(p.id));
  allProductsLocal = allProductsLocal.concat(newItems);

  /* ✅ 8. عرض المنتجات */
  if (!silent && newItems.length) {
    renderProductsBatch(newItems);
  }

  /* ✅ 9. رسالة عدم وجود منتجات */
  const emptyEl = document.getElementById('allProductsEmpty');
  if (allProductsLocal.length === 0) {
    const grid = document.getElementById('allProductsGrid');
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--c-text-soft);">' +
      '<i class="fas fa-box-open" style="font-size:2.5rem;color:#CBD5E1;display:block;margin-bottom:1rem;"></i>' +
      '<p style="font-weight:800;font-size:1rem;">لا توجد منتجات في فئة "' + sanitizeHTML(cleanCat) + '"</p>' +
      '</div>';
    emptyEl.classList.add('hidden');
  } else {
    emptyEl.classList.add('hidden');
  }

  /* ✅ 10. زر "عرض المزيد" */
  const loadBtn = document.getElementById('loadMoreProductsBtn');
  if (hasMoreProducts) {
    loadBtn.classList.remove('hidden');
  } else {
    loadBtn.classList.add('hidden');
  }
}

async function loadCategories(force) {
  if (!force && stores && stores.length) {
    const cats = [];
    stores.forEach(s => {
      const c = s.category;
      if (c && String(c).trim() && cats.indexOf(String(c).trim()) === -1) {
        cats.push(String(c).trim());
      }
    });
    categories = cats;
    displayCategories();
    return;
  }
  try {
    const storesData = await fetchWithCache('stores_list', async () => {
      const snap = await db.collection('stores').limit(30).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, force, CONFIG.CACHE_TTL_STORES);
    const cats = [];
    storesData.forEach(s => {
      const c = s.category;
      if (c && String(c).trim() && cats.indexOf(String(c).trim()) === -1) {
        cats.push(String(c).trim());
      }
    });
    categories = cats;
    displayCategories();
  } catch(err){ console.error('[BZR] loadCategories:', err); }
}

/* ═══ FOLLOW SYSTEM ═══ */
async function syncFollowedStoresFromServer() {
  try {
    const ok = await ensureAuth();
    if (!ok) return;
    const userId = getUserIdentity();
    if (!userId) return;
    const snap = await db.collection('store_follows')
      .where('fingerprint', '==', userId).get();
    const serverIds = new Set();
    snap.docs.forEach(d => {
      const data = d.data();
      if (data && data.storeId) serverIds.add(String(data.storeId));
    });
    _followedFromServer = serverIds;
    const localList = getFollowedStores();
    const merged = new Set([...localList.map(String), ...serverIds]);
    saveFollowedStores(Array.from(merged));
    const localOnly = localList.filter(id => !serverIds.has(String(id)));
    if (localOnly.length) migrateLocalFollowsToServer(localOnly, userId).catch(() => {});
    renderFollowedStores();
    document.querySelectorAll('.store-card button[data-store-id]').forEach(btn => {
      if (serverIds.has(String(btn.dataset.storeId))) setCardFollowState(btn, true);
    });
  } catch(err) {
    console.warn('[BZR] Sync follows failed:', err);
  }
}

async function migrateLocalFollowsToServer(storeIds, userId) {
  try {
    const batch = db.batch();
    let count = 0;
    for (const sid of storeIds) {
      const docId = sid + '_' + userId;
      const ref = db.collection('store_follows').doc(docId);
      batch.set(ref, {
        storeId: String(sid),
        fingerprint: userId,
        migrated: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      count++;
      if (count >= 400) break;
    }
    if (count > 0) await batch.commit();
  } catch(err) {
    console.warn('[BZR] Migration failed:', err);
  }
}

async function performFollowToggle(store) {
  const storeId = String(getStoreId(store));
  await ensureAuth();
  const userId = getUserIdentity();
  if (!userId) throw new Error('no_auth_identity');
  const followDocId = storeId + '_' + userId;
  const followRef = db.collection('store_follows').doc(followDocId);
  const storeRef = db.collection('stores').doc(storeId);
  return await db.runTransaction(async (transaction) => {
    const followDoc = await transaction.get(followRef);
    if (followDoc.exists) {
      transaction.delete(followRef);
      transaction.set(storeRef, { followers: firebase.firestore.FieldValue.increment(-1) }, { merge: true });
      return { action: 'unfollowed', storeId };
    } else {
      transaction.set(followRef, {
        storeId: storeId,
        fingerprint: userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      transaction.set(storeRef, { followers: firebase.firestore.FieldValue.increment(1) }, { merge: true });
      return { action: 'followed', storeId };
    }
  });
}

async function checkFollowStatusFromServer(storeId) {
  try {
    const userId = getUserIdentity();
    if (!userId) return false;
    const docId = String(storeId) + '_' + userId;
    const doc = await db.collection('store_follows').doc(docId).get();
    return doc.exists;
  } catch(e) { return false; }
}

/* ═══ POLLING ═══ */
function setupRealtimeProducts() {
  if (allProductsUnsubscribe) return;
  const pollProducts = async () => {
    if (!isPageVisible) return;
    if (!RateLimiter.canRequest('poll_products')) return;
    try {
      const snap = await db.collection('products')
        .orderBy('created_at', 'desc')
        .limit(CONFIG.PRODUCTS_PER_PAGE)
        .get();
      const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!fresh.length) return;
      const topIds = allProductsLocal.slice(0, fresh.length).map(p => p.id).join(',');
      const freshIds = fresh.map(p => p.id).join(',');
      if (topIds !== freshIds) {
        const existing = new Set(fresh.map(p => p.id));
        allProductsLocal = fresh.concat(allProductsLocal.filter(p => !existing.has(p.id)));
      }
      cacheManager.set(
        'all_products_page1',
        { items: allProductsLocal.slice(0, CONFIG.PRODUCTS_PER_PAGE), hasMore: hasMoreProducts },
        CONFIG.CACHE_TTL_PRODUCTS
      );
    } catch(e) { /* silent */ }
  };
  allProductsUnsubscribe = setInterval(pollProducts, CONFIG.PRODUCTS_REFRESH_INTERVAL_MS);
}

function setupRealtimeStores() {
  if (storesPollInterval) return;
  const POLL_MS = CONFIG.STORES_REFRESH_INTERVAL_MS;
  function startPoll() {
    if (storesPollInterval) clearInterval(storesPollInterval);
    storesPollInterval = setInterval(() => {
      if (!isPageVisible) return;
      if (!RateLimiter.canRequest('poll_stores')) return;
      cacheManager.remove('stores_list');
      loadStores(true);
    }, POLL_MS);
  }
  startPoll();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) startPoll();
    else if (storesPollInterval) {
      clearInterval(storesPollInterval);
      storesPollInterval = null;
    }
  });
}

/* ═══ DEEP LINK ═══ */
async function handleDeepLink() {
  try {
    const params = new URLSearchParams(window.location.search);
    let storeId = params.get('store');
    if (!storeId) return;
    storeId = decodeURIComponent(storeId).trim();
    await new Promise(r => setTimeout(r, 1500));
    const store = stores.find(s => String(getStoreId(s)) === String(storeId));
    if (store) {
      updateMetaTagsForStore(store);
      try { window.history.replaceState({}, document.title, window.location.origin + window.location.pathname); } catch(e){}
      setTimeout(() => openStoreModal(store), 300);
    }
  } catch(err){}
}

console.log('[BZR] data.js loaded ✅ v9.8.4');
