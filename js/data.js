/* ═══════════════════════════════════════════════════════════
   BranZar v9.10.0 — data.js
   Layer 2: Data Loading + Follow System + Polling + Deep Link
   ✅ v9.10.0: إضافة ثوابت الموقع ووصف المنتج
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══════════════════════════════════════════════════════════
   🆕 v9.10.0: ثوابت الحقول الجديدة
   ═══════════════════════════════════════════════════════════ */

/**
 * حقول المتجر — تُحدّد ما يمكن للمستخدم تعديله وما لا يمكن
 */
const STORE_FIELDS = Object.freeze({
  // الحقول التي يمكن للمستخدم تعديلها بنفسه
  EDITABLE: ['login_password'],
  // الحقول للقراءة فقط — تُعدَّل عبر خدمة العملاء فقط
  READONLY: [
    'name',
    'whatsapp_number',
    'phone_number',
    'logo_url',
    'cover_url',
    'description',
    'location',
    'category',
    'categories'
  ]
});

/**
 * حقول المنتج الجديدة
 */
const PRODUCT_FIELDS = Object.freeze({
  DESCRIPTION_MAX: 100,
  DESCRIPTION_MIN: 0,
  DEFAULT_LOCATION: ''
});

/**
 * رقم خدمة العملاء (واتساب)
 */
const SUPPORT_WHATSAPP = '249908280115';

/**
 * رسائل جاهزة لخدمة العملاء (WhatsApp)
 */
const SUPPORT_MESSAGES = Object.freeze({
  general: 'السلام عليكم ورحمة الله 👋\nأرغب بالتواصل مع خدمة عملاء BranZar.',
  update_store: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث بيانات متجري على BranZar.\nأرجو منكم مساعدتي في تحديث البيانات.\nشكراً لكم 🌸',
  location: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث موقع متجري على BranZar.\nأرجو منكم إضافة الموقع الصحيح.\nشكراً لكم 🌸',
  description: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث وصف متجري على BranZar.\nشكراً لكم 🌸',
  verify: 'السلام عليكم ورحمة الله 👋\nأرغب بتوثيق حساب متجري على BranZar.',
  subscribe: 'السلام عليكم ورحمة الله 👋\nأرغب بالاشتراك في إحدى باقات BranZar.\nأرجو موافاتي بالتفاصيل والأسعار.\nشكراً لكم 🌸'
});

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
      if (c && String(c).trim() && cats.indexOf(c) === -1) cats.push(c);
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
      q = db.collection('products').orderBy('created_at', 'desc')
        .startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
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

async function applyProductsFilter(cat) {
  currentCategory = cat;
  const grid = document.getElementById('allProductsGrid');
  const emptyEl = document.getElementById('allProductsEmpty');
  const loadBtn = document.getElementById('loadMoreProductsBtn');
  if (!cat) {
    grid.innerHTML = '';
    allProductsLocal = [];
    lastVisibleDoc = null;
    hasMoreProducts = true;
    try { await fetchProductsPage(null, false); } catch(e){}
    return;
  }
  grid.innerHTML = '';
  allProductsLocal = [];
  lastVisibleDoc = null;
  hasMoreProducts = true;
  loadBtn.classList.add('hidden');
  emptyEl.classList.add('hidden');
  try { await fetchProductsByCategoryPage(null, false); }
  catch(e){ emptyEl.classList.remove('hidden'); }
}

async function fetchProductsByCategoryPage(cursorDoc, silent) {
  const cat = currentCategory;
  if (!cat) return;
  if (!RateLimiter.canRequest('products_cat')) {
    if (!silent) throw new Error('rate_limit');
    return;
  }
  const storeNames = stores.filter(s => s.category === cat).map(s => s.name).filter(Boolean);
  if (!storeNames.length) {
    if (!silent) document.getElementById('allProductsGrid').innerHTML = '';
    document.getElementById('allProductsEmpty').classList.remove('hidden');
    document.getElementById('loadMoreProductsBtn').classList.add('hidden');
    hasMoreProducts = false;
    return;
  }
  const chunks = [];
  for (let i = 0; i < storeNames.length; i += 10) chunks.push(storeNames.slice(i, i + 10));
  const fetched = [];
  let newCursor = cursorDoc;
  for (const chunk of chunks) {
    try {
      let q = db.collection('products').where('store_name', 'in', chunk).limit(CONFIG.PRODUCTS_PER_PAGE);
      if (cursorDoc) {
        q = db.collection('products').where('store_name', 'in', chunk)
          .startAfter(cursorDoc).limit(CONFIG.PRODUCTS_PER_PAGE);
      }
      try { q = q.orderBy('created_at', 'desc'); } catch(e){}
      const snap = await q.get();
      snap.docs.forEach(d => fetched.push(d));
      if (snap.docs.length > 0) newCursor = snap.docs[snap.docs.length - 1];
    } catch(e) {
      try {
        let q2 = db.collection('products').where('store_name', 'in', chunk).limit(CONFIG.PRODUCTS_PER_PAGE);
        if (cursorDoc) q2 = q2.startAfter(cursorDoc);
        const s2 = await q2.get();
        s2.docs.forEach(d => fetched.push(d));
        if (s2.docs.length > 0) newCursor = s2.docs[s2.docs.length - 1];
      } catch(e2){}
    }
  }
  fetched.sort((a, b) => ((b.data().created_at?.seconds || 0) - (a.data().created_at?.seconds || 0)));
  const limited = fetched.slice(0, CONFIG.PRODUCTS_PER_PAGE);
  if (limited.length > 0) lastVisibleDoc = limited[limited.length - 1];
  hasMoreProducts = fetched.length >= CONFIG.PRODUCTS_PER_PAGE;
  const items = limited.map(d => ({ id: d.id, ...d.data() }));
  const existingIds = new Set(allProductsLocal.map(p => p.id));
  const newItems = items.filter(p => !existingIds.has(p.id));
  allProductsLocal = allProductsLocal.concat(newItems);
  if (!silent) renderProductsBatch(newItems);
  if (allProductsLocal.length === 0) document.getElementById('allProductsEmpty').classList.remove('hidden');
  else document.getElementById('allProductsEmpty').classList.add('hidden');
  const loadBtn = document.getElementById('loadMoreProductsBtn');
  if (hasMoreProducts) loadBtn.classList.remove('hidden'); else loadBtn.classList.add('hidden');
}

async function loadCategories(force) {
  if (!force && stores && stores.length) {
    const cats = [];
    stores.forEach(s => {
      const c = s.category;
      if (c && String(c).trim() && cats.indexOf(c) === -1) cats.push(c);
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
      if (c && String(c).trim() && cats.indexOf(c) === -1) cats.push(c);
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

/* ═══════════════════════════════════════════════════════════
   🆕 v9.10.0: دوال مساعدة للحقول الجديدة
   ═══════════════════════════════════════════════════════════ */

/**
 * جلب موقع المتجر بشكل آمن
 * @param {object} store
 * @returns {string}
 */
function getStoreLocation(store) {
  if (!store) return '';
  return (store.location && String(store.location).trim()) || '';
}

/**
 * التحقق من أن المتجر يحتوي على موقع لعرضه
 * @param {object} store
 * @returns {boolean}
 */
function hasStoreLocation(store) {
  return getStoreLocation(store).length > 0;
}

/**
 * جلب وصف المنتج بشكل آمن مع التحقق من الطول
 * @param {object} product
 * @returns {string}
 */
function getProductDescription(product) {
  if (!product) return '';
  const desc = (product.description && String(product.description).trim()) || '';
  return desc.slice(0, PRODUCT_FIELDS.DESCRIPTION_MAX);
}

/**
 * التحقق من أن المنتج يحتوي على وصف لعرضه
 * @param {object} product
 * @returns {boolean}
 */
function hasProductDescription(product) {
  return getProductDescription(product).length > 0;
}

/**
 * فتح محادثة واتساب مع خدمة العملاء
 * @param {string} context - نوع الرسالة (general, update_store, location, etc)
 */
function openSupportWhatsApp(context) {
  const message = SUPPORT_MESSAGES[context] || SUPPORT_MESSAGES.general;
  const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

console.log('[BZR] data.js loaded ✅ v9.10.0');
