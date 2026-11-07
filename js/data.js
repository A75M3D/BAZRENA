/* ═══════════════════════════════════════════════════════════
   BranZar v9.16.0 — data.js
   Layer 2: Data Loading + Smart Stores + Smart Products
   ✅ v9.16.0: Category fetching uses store_id (stable) instead of store_name
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
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
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
    try { snapshot = await db.collection('stores').orderBy('created_at', 'desc').limit(INITIAL_FETCH_LIMIT).get(); }
    catch (err) { snapshot = await db.collection('stores').limit(INITIAL_FETCH_LIMIT).get(); }
    const initial = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    await dexieBulkUpsertStores(initial);
    stores = sortStoresLikeOriginal(initial);
    renderStoresFromMemory();
  } catch (error) {}
}

function startStoresLiveListener() {
  if (storesLiveUnsubscribe) return;
  try {
    storesLiveUnsubscribe = db.collection('stores').orderBy('created_at', 'desc').limit(LIVE_WINDOW)
      .onSnapshot({ includeMetadataChanges: false }, async (snapshot) => {
        const isFirstSync = !_storesFirstSyncDone;
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        let added = [];
        if (!isFirstSync) {
          for (const c of snapshot.docChanges()) {
            if (c.type === 'added') {
              let exists = false; if (bzrDB) { try { exists = !!(await bzrDB.stores.get(c.doc.id)); } catch (e) {} }
              if (!exists) added.push({ id: c.doc.id, ...c.doc.data() });
            }
          }
        }
        await dexieBulkUpsertStores(docs);
        let all = await dexieGetAllStores();
        stores = sortStoresLikeOriginal(all.length ? all : docs);
        if (!isFirstSync || stores.length > 0) renderStoresFromMemory();
        if (!isFirstSync && added.length > 0) {
          const names = added.map(s => s.name).filter(Boolean);
          showNewStoreToast(names.join(' • '));
        }
        if (isFirstSync) _storesFirstSyncDone = true;
      }, (error) => { storesLiveUnsubscribe = null; setTimeout(startStoresLiveListener, 5000); });
  } catch (error) { storesLiveUnsubscribe = null; }
}

document.getElementById('retryStoresBtn')?.addEventListener('click', () => {
  if (storesLiveUnsubscribe) { try { storesLiveUnsubscribe(); } catch(e){} storesLiveUnsubscribe = null; }
  _storesFirstSyncDone = false; loadStores(true);
});

function showNewStoreToast(storeName) {
  document.getElementById('bzrNewStoreToast')?.remove();
  // ... (كود التوست كامل كما هو لم يتغير، اختصاراً للنص)
  const toast = document.createElement('div'); toast.id = 'bzrNewStoreToast'; toast.className = 'bzr-new-store-toast';
  toast.innerHTML = `<span class="bzr-icon">🎉</span><div class="bzr-body"><span class="bzr-title">متجر جديد انضم إلى BranZar</span><span class="bzr-name">${storeName || 'مرحباً'}</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

/* ═══════════════════════════════════════════════════════════
   📦 SMART PRODUCTS SYSTEM (v9.16.0)
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
  loader?.classList.remove('hidden'); empty?.classList.add('hidden');
  if (grid) grid.innerHTML = ''; loadMoreBtn?.classList.add('hidden');
  allProductsLocal = []; lastVisibleDoc = null; hasMoreProducts = true;

  try {
    let local = force ? [] : await dexieGetRecentProducts(PRODUCTS_INITIAL_FETCH);
    if (local && local.length > 0) {
      const firstPage = local.slice(0, CONFIG.PRODUCTS_PER_PAGE);
      allProductsLocal = firstPage; hasMoreProducts = local.length > CONFIG.PRODUCTS_PER_PAGE;
      renderProductsBatch(firstPage, false);
      if (hasMoreProducts) loadMoreBtn?.classList.remove('hidden');
      loader?.classList.add('hidden');
    }
    if (!local || local.length === 0) await fetchInitialProducts();
    if (productsLiveUnsubscribe) { try { productsLiveUnsubscribe(); } catch (e) {} productsLiveUnsubscribe = null; }
    _productsFirstSyncDone = false;
    startProductsLiveListener();
  } catch (error) {
    if (grid) grid.innerHTML = '<p style="text-align:center;color:var(--c-text-soft);">تعذر تحميل المنتجات</p>';
  } finally { loader?.classList.add('hidden'); _isLoadingSmartProducts = false; }
}

async function fetchInitialProducts() {
  try {
    let snapshot;
    try { snapshot = await db.collection('products').orderBy('created_at', 'desc').limit(PRODUCTS_INITIAL_FETCH).get(); }
    catch (err) { snapshot = await db.collection('products').limit(PRODUCTS_INITIAL_FETCH).get(); }
    const initial = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    await dexieBulkUpsertProducts(initial);
    const firstPage = initial.slice(0, CONFIG.PRODUCTS_PER_PAGE);
    allProductsLocal = firstPage;
    if (snapshot.docs.length >= firstPage.length && firstPage.length > 0) lastVisibleDoc = snapshot.docs[firstPage.length - 1];
    else if (snapshot.docs.length > 0) lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    hasMoreProducts = initial.length > CONFIG.PRODUCTS_PER_PAGE;
    renderProductsBatch(firstPage, false);
    if (hasMoreProducts) document.getElementById('loadMoreProductsBtn')?.classList.remove('hidden');
  } catch (error) {}
}

function startProductsLiveListener() {
  if (productsLiveUnsubscribe) return;
  try {
    productsLiveUnsubscribe = db.collection('products').orderBy('created_at', 'desc').limit(PRODUCTS_LIVE_WINDOW)
      .onSnapshot({ includeMetadataChanges: false }, async (snapshot) => {
        const isFirstSync = !_productsFirstSyncDone;
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        let added = [];
        for (const c of snapshot.docChanges()) {
          if (c.type === 'added') {
            let exists = false; if (bzrDB) { try { exists = !!(await bzrDB.products.get(c.doc.id)); } catch (e) {} }
            if (!exists) added.push({ id: c.doc.id, ...c.doc.data() });
          }
        }
        await dexieBulkUpsertProducts(docs);
        if (currentCategory) { if (isFirstSync) _productsFirstSyncDone = true; return; }
        if (!isFirstSync && added.length > 0) {
          const existingIds = new Set(allProductsLocal.map(p => p.id));
          const trulyNew = added.filter(p => !existingIds.has(p.id));
          if (trulyNew.length > 0) {
            allProductsLocal = trulyNew.concat(allProductsLocal).slice(0, CONFIG.SEARCH_CAP);
            renderProductsBatch(trulyNew, true);
          }
        }
        if (isFirstSync) _productsFirstSyncDone = true;
      }, (error) => { productsLiveUnsubscribe = null; setTimeout(startProductsLiveListener, 5000); });
  } catch (error) { productsLiveUnsubscribe = null; }
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
  allProductsLocal = allProductsLocal.concat(newItems);
  if (!silent) renderProductsBatch(newItems);
  const loadButton = document.getElementById('loadMoreProductsBtn');
  const emptyElement = document.getElementById('allProductsEmpty');
  if (allProductsLocal.length === 0) { emptyElement?.classList.remove('hidden'); loadButton?.classList.add('hidden'); } 
  else { emptyElement?.classList.add('hidden'); if (hasMoreProducts) loadButton?.classList.remove('hidden'); else loadButton?.classList.add('hidden'); }
}

document.getElementById('loadMoreProductsBtn')?.addEventListener('click', async () => {
  const button = document.getElementById('loadMoreProductsBtn');
  if (button.disabled || !hasMoreProducts || _isLoadingSmartProducts) return;
  button.disabled = true; haptic('light');
  try {
    if (currentCategory) await fetchProductsByCategoryPage(lastVisibleDoc, false);
    else await fetchProductsPage(lastVisibleDoc, false);
  } catch (error) { showToast('تعذر تحميل المزيد'); }
  button.disabled = false;
});

async function applyProductsFilter(category) {
  currentCategory = category;
  const grid = document.getElementById('allProductsGrid');
  const emptyElement = document.getElementById('allProductsEmpty');
  const loadButton = document.getElementById('loadMoreProductsBtn');
  if (!category) {
    if (grid) grid.innerHTML = ''; allProductsLocal = []; lastVisibleDoc = null; hasMoreProducts = true;
    loadButton?.classList.add('hidden'); emptyElement?.classList.add('hidden');
    try {
      const recent = await dexieGetRecentProducts(PRODUCTS_INITIAL_FETCH);
      if (recent && recent.length > 0) {
        const firstPage = recent.slice(0, CONFIG.PRODUCTS_PER_PAGE);
        allProductsLocal = firstPage; hasMoreProducts = recent.length > CONFIG.PRODUCTS_PER_PAGE;
        renderProductsBatch(firstPage, false);
        if (hasMoreProducts) loadButton?.classList.remove('hidden');
        return;
      }
    } catch (e) {}
    try { await fetchInitialProducts(); } catch (e) {}
    return;
  }
  if (grid) grid.innerHTML = ''; allProductsLocal = []; lastVisibleDoc = null; hasMoreProducts = true;
  loadButton?.classList.add('hidden'); emptyElement?.classList.add('hidden');
  try { await fetchProductsByCategoryPage(null, false); } catch (error) { emptyElement?.classList.remove('hidden'); }
}

/* ═══════════════════════════════════════════════════════════
   🚀 v9.16.0: fetchProductsByCategoryPage uses store_id
   ═══════════════════════════════════════════════════════════ */
async function fetchProductsByCategoryPage(cursorDoc, silent) {
  const category = currentCategory;
  if (!category) return;
  if (!RateLimiter.canRequest('products_cat')) { if (!silent) throw new Error('rate_limit'); return; }

  // 🆕 استخدم الـ ID الثابت بدلاً من الاسم
  const storeIds = stores
    .filter((store) => store.category === category)
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
  const items = limited.map((doc) => ({ id: doc.id, ...doc.data() }));
  
  await dexieBulkUpsertProducts(items);
  const existingIds = new Set(allProductsLocal.map((product) => product.id));
  const newItems = items.filter((item) => !existingIds.has(item.id));
  allProductsLocal = allProductsLocal.concat(newItems);
  
  if (!silent) renderProductsBatch(newItems);
  if (allProductsLocal.length === 0) document.getElementById('allProductsEmpty').classList.remove('hidden');
  else document.getElementById('allProductsEmpty').classList.add('hidden');
  const loadButton = document.getElementById('loadMoreProductsBtn');
  if (hasMoreProducts) loadButton.classList.remove('hidden'); else loadButton.classList.add('hidden');
}

async function loadCategories(force) {
  if (force) {
    await dexieClearStores();
    _storesFirstSyncDone = false;
    if (storesLiveUnsubscribe) { try { storesLiveUnsubscribe(); } catch(e){} storesLiveUnsubscribe = null; }
    stores = []; await loadStores(true); return;
  }
  if (stores && stores.length) { rebuildStoreCategories(); return; }
  await loadStores();
}

/* ═══ FOLLOW SYSTEM & HELPERS (مختصر) ═══ */
async function syncFollowedStoresFromServer() {
  try {
    if (!await ensureAuth()) return;
    const userId = getUserIdentity(); if (!userId) return;
    const snapshot = await db.collection('store_follows').where('fingerprint', '==', userId).get();
    const serverIds = new Set(); snapshot.docs.forEach(doc => { if (doc.data()?.storeId) serverIds.add(String(doc.data().storeId)); });
    _followedFromServer = serverIds;
    const merged = new Set([...getFollowedStores().map(String), ...serverIds]);
    saveFollowedStores(Array.from(merged));
    renderFollowedStores();
  } catch (error) {}
}

async function performFollowToggle(store) {
  const storeId = String(getStoreId(store));
  await ensureAuth(); const userId = getUserIdentity();
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
  try { const userId = getUserIdentity(); if (!userId) return false; return (await db.collection('store_follows').doc(String(storeId) + '_' + userId).get()).exists; } catch (error) { return false; }
}

function setupRealtimeStores() { startStoresLiveListener(); }
function setupRealtimeProducts() { startProductsLiveListener(); }

async function handleDeepLink() {
  try {
    const params = new URLSearchParams(window.location.search);
    let storeId = params.get('store'); if (!storeId) return;
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

console.log('[BZR] data.js loaded ✅ v9.16.0 — Products by store_id');
