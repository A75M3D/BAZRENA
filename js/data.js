/* ═══════════════════════════════════════════════════════════
   BranZar v9.10.0 — data.js
   Layer 2: Data Loading + Follow System + Polling + Deep Link
   ✅ Cache-first stores loading
   ✅ Firebase listener for newest stores only
   ═══════════════════════════════════════════════════════════ */
'use strict';

const STORE_FIELDS = Object.freeze({
  EDITABLE: ['login_password'],
  READONLY: [
    'name', 'whatsapp_number', 'phone_number', 'logo_url', 'cover_url',
    'description', 'location', 'category', 'categories'
  ]
});

const PRODUCT_FIELDS = Object.freeze({
  DESCRIPTION_MAX: 100,
  DESCRIPTION_MIN: 0,
  DEFAULT_LOCATION: ''
});

const SUPPORT_WHATSAPP = '249908280115';

const SUPPORT_MESSAGES = Object.freeze({
  general: 'السلام عليكم ورحمة الله 👋\nأرغب بالتواصل مع خدمة عملاء BranZar.',
  update_store: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث بيانات متجري على BranZar.\nأرجو منكم مساعدتي في تحديث البيانات.\nشكراً لكم 🌸',
  location: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث موقع متجري على BranZar.\nأرجو منكم إضافة الموقع الصحيح.\nشكراً لكم 🌸',
  description: 'السلام عليكم ورحمة الله 👋\nأرغب بتحديث وصف متجري على BranZar.\nأرجو منكم مساعدتي في تحديث الوصف.\nشكراً لكم 🌸',
  verify: 'السلام عليكم ورحمة الله 👋\nأرغب بتوثيق حساب متجري على BranZar.',
  subscribe: 'السلام عليكم ورحمة الله 👋\nأرغب بالاشتراك في إحدى باقات BranZar.\nأرجو موافاتي بالتفاصيل والأسعار.\nشكراً لكم 🌸'
});

/* ═══ STORES: CACHE-FIRST + NEW STORES LISTENER ═══ */
const NEW_STORES_CHECK_LIMIT = 10;
let storesChangesUnsubscribe = null;

function rebuildStoreCategories() {
  const cats = [];

  stores.forEach((store) => {
    const category = store.category;
    if (category && String(category).trim() && !cats.includes(category)) {
      cats.push(category);
    }
  });

  categories = cats;
  displayCategories();
}

function renderStoresFromMemory() {
  const empty = document.getElementById('storesEmpty');
  const errorMessage = document.getElementById('storesErrorMessage');

  rebuildStoreCategories();

  if (!stores.length) {
    if (errorMessage) {
      errorMessage.textContent = '⚠️ لا توجد متاجر متاحة حالياً';
    }

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

function mergeLatestStores(latestStores) {
  if (!Array.isArray(latestStores) || !latestStores.length) {
    return false;
  }

  const existingById = new Map(
    stores.map((store) => [String(getStoreId(store)), store])
  );

  const previousIds = new Set(existingById.keys());
  let hasNewStore = false;

  latestStores.forEach((freshStore) => {
    const id = String(getStoreId(freshStore));

    if (!previousIds.has(id)) {
      hasNewStore = true;
    }

    existingById.set(id, {
      ...(existingById.get(id) || {}),
      ...freshStore
    });
  });

  const latestIds = new Set(
    latestStores.map((store) => String(getStoreId(store)))
  );

  // أحدث المتاجر أولاً، ثم بقية المتاجر القديمة من الكاش.
  const latestPart = latestStores.map((store) =>
    existingById.get(String(getStoreId(store)))
  );

  const cachedPart = Array.from(existingById.values()).filter(
    (store) => !latestIds.has(String(getStoreId(store)))
  );

  stores = latestPart.concat(cachedPart);

  // تحديث الكاش بالقائمة المدمجة بدون إعادة جلب المتاجر القديمة.
  cacheManager.set(
    'stores_list',
    stores,
    CONFIG.CACHE_TTL_STORES
  );

  return hasNewStore;
}

function startStoresChangesListener() {
  if (storesChangesUnsubscribe) return;

  try {
    storesChangesUnsubscribe = db.collection('stores')
      .orderBy('created_at', 'desc')
      .limit(NEW_STORES_CHECK_LIMIT)
      .onSnapshot((snapshot) => {
        const latestStores = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        const hasNewStore = mergeLatestStores(latestStores);

        // لا نعيد الرسم عند أول اتصال إلا إذا وُجد متجر جديد فعلاً.
        if (hasNewStore) {
          renderStoresFromMemory();
          showToast('✅ تم إضافة متجر جديد');
        }
      }, (error) => {
        console.warn('[BZR] New stores listener failed:', error);
      });
  } catch (error) {
    console.warn('[BZR] Cannot start stores listener:', error);
  }
}

async function loadStores() {
  const loader = document.getElementById('storesLoader');
  const empty = document.getElementById('storesEmpty');
  const container = document.getElementById('storesScrollContainer');

  loader?.classList.remove('hidden');
  empty?.classList.add('hidden');

  try {
    const cachedStores = cacheManager.get('stores_list');

    if (Array.isArray(cachedStores) && cachedStores.length) {
      // عرض المتاجر القديمة فوراً من الكاش.
      stores = cachedStores;
      renderStoresFromMemory();

      // مراقبة أحدث 10 متاجر فقط في Firebase.
      startStoresChangesListener();
      return;
    }

    // أول تشغيل فقط: لا يوجد كاش، لذلك نجلب أول 30 متجراً.
    let snapshot;

    try {
      snapshot = await db.collection('stores')
        .orderBy('created_at', 'desc')
        .limit(30)
        .get();
    } catch (error) {
      console.warn('[BZR] Ordered stores query failed:', error);
      snapshot = await db.collection('stores')
        .limit(30)
        .get();
    }

    stores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    // الحفاظ على ترتيب التطبيق الحالي عند أول تحميل.
    stores.sort((a, b) => {
      const followersA = Number(a.followers) || 0;
      const followersB = Number(b.followers) || 0;

      if (followersA !== followersB) {
        return followersB - followersA;
      }

      return String(b.created_at || '')
        .localeCompare(String(a.created_at || ''));
    });

    cacheManager.set(
      'stores_list',
      stores,
      CONFIG.CACHE_TTL_STORES
    );

    renderStoresFromMemory();
    startStoresChangesListener();
  } catch (error) {
    console.error('[BZR] Stores loading failed:', error);

    const errorMessage = document.getElementById('storesErrorMessage');
    if (errorMessage) {
      errorMessage.textContent =
        '⚠️ تعذر تحميل المتاجر — تحقق من الاتصال وحاول مجدداً';
    }

    empty?.classList.remove('hidden');
  } finally {
    loader?.classList.add('hidden');
  }
}

document.getElementById('retryStoresBtn')?.addEventListener('click', () => {
  // إعادة المحاولة لا تعيد تحميل كل المتاجر؛ تعيد تشغيل مراقبة الجديد فقط.
  startStoresChangesListener();
});

/* ═══ PRODUCTS ═══ */
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

      if (hasMoreProducts) {
        document.getElementById('loadMoreProductsBtn').classList.remove('hidden');
      }

      loader.classList.add('hidden');
      isLoadingProducts = false;
      return;
    }
  }

  try {
    await fetchProductsPage(null, false);
  } catch (error) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--c-text-soft);">تعذر تحميل المنتجات</p>';
  } finally {
    loader.classList.add('hidden');
    isLoadingProducts = false;
  }
}

async function fetchProductsPage(cursorDoc, silent) {
  if (!RateLimiter.canRequest('products')) {
    if (silent) return;
    throw new Error('rate_limit');
  }

  let query = db.collection('products')
    .orderBy('created_at', 'desc')
    .limit(CONFIG.PRODUCTS_PER_PAGE);

  if (cursorDoc) {
    query = db.collection('products')
      .orderBy('created_at', 'desc')
      .startAfter(cursorDoc)
      .limit(CONFIG.PRODUCTS_PER_PAGE);
  }

  let snapshot;

  try {
    snapshot = await query.get();
  } catch (error) {
    let fallbackQuery = db.collection('products')
      .limit(CONFIG.PRODUCTS_PER_PAGE);

    if (cursorDoc) {
      fallbackQuery = db.collection('products')
        .startAfter(cursorDoc)
        .limit(CONFIG.PRODUCTS_PER_PAGE);
    }

    snapshot = await fallbackQuery.get();
  }

  const fresh = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  if (snapshot.docs.length > 0) {
    lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  hasMoreProducts = snapshot.docs.length === CONFIG.PRODUCTS_PER_PAGE;

  const existingIds = new Set(allProductsLocal.map((product) => product.id));
  const newItems = fresh.filter((product) => !existingIds.has(product.id));
  allProductsLocal = allProductsLocal.concat(newItems);

  if (!silent) {
    renderProductsBatch(fresh);
  }

  const loadButton = document.getElementById('loadMoreProductsBtn');
  const emptyElement = document.getElementById('allProductsEmpty');

  if (allProductsLocal.length === 0) {
    emptyElement.classList.remove('hidden');
    loadButton.classList.add('hidden');
  } else {
    emptyElement.classList.add('hidden');
  }

  if (hasMoreProducts) {
    loadButton.classList.remove('hidden');
  } else {
    loadButton.classList.add('hidden');
  }

  if (!cursorDoc) {
    cacheManager.set(
      'all_products_page1',
      {
        items: allProductsLocal.slice(0, CONFIG.PRODUCTS_PER_PAGE),
        hasMore: hasMoreProducts
      },
      CONFIG.CACHE_TTL_PRODUCTS
    );
  }
}

document.getElementById('loadMoreProductsBtn')?.addEventListener('click', async () => {
  const button = document.getElementById('loadMoreProductsBtn');
  if (button.disabled || !hasMoreProducts || isLoadingProducts) return;

  button.disabled = true;
  haptic('light');

  try {
    if (currentCategory) {
      await fetchProductsByCategoryPage(lastVisibleDoc, false);
    } else {
      await fetchProductsPage(lastVisibleDoc, false);
    }
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
    grid.innerHTML = '';
    allProductsLocal = [];
    lastVisibleDoc = null;
    hasMoreProducts = true;

    try {
      await fetchProductsPage(null, false);
    } catch (error) {}

    return;
  }

  grid.innerHTML = '';
  allProductsLocal = [];
  lastVisibleDoc = null;
  hasMoreProducts = true;
  loadButton.classList.add('hidden');
  emptyElement.classList.add('hidden');

  try {
    await fetchProductsByCategoryPage(null, false);
  } catch (error) {
    emptyElement.classList.remove('hidden');
  }
}

async function fetchProductsByCategoryPage(cursorDoc, silent) {
  const category = currentCategory;
  if (!category) return;

  if (!RateLimiter.canRequest('products_cat')) {
    if (!silent) throw new Error('rate_limit');
    return;
  }

  const storeNames = stores
    .filter((store) => store.category === category)
    .map((store) => store.name)
    .filter(Boolean);

  if (!storeNames.length) {
    if (!silent) {
      document.getElementById('allProductsGrid').innerHTML = '';
    }

    document.getElementById('allProductsEmpty').classList.remove('hidden');
    document.getElementById('loadMoreProductsBtn').classList.add('hidden');
    hasMoreProducts = false;
    return;
  }

  const chunks = [];
  for (let i = 0; i < storeNames.length; i += 10) {
    chunks.push(storeNames.slice(i, i + 10));
  }

  const fetched = [];
  let newCursor = cursorDoc;

  for (const chunk of chunks) {
    try {
      let query = db.collection('products')
        .where('store_name', 'in', chunk)
        .limit(CONFIG.PRODUCTS_PER_PAGE);

      if (cursorDoc) {
        query = db.collection('products')
          .where('store_name', 'in', chunk)
          .startAfter(cursorDoc)
          .limit(CONFIG.PRODUCTS_PER_PAGE);
      }

      try {
        query = query.orderBy('created_at', 'desc');
      } catch (error) {}

      const snapshot = await query.get();
      snapshot.docs.forEach((doc) => fetched.push(doc));

      if (snapshot.docs.length > 0) {
        newCursor = snapshot.docs[snapshot.docs.length - 1];
      }
    } catch (error) {
      try {
        let fallbackQuery = db.collection('products')
          .where('store_name', 'in', chunk)
          .limit(CONFIG.PRODUCTS_PER_PAGE);

        if (cursorDoc) {
          fallbackQuery = fallbackQuery.startAfter(cursorDoc);
        }

        const snapshot = await fallbackQuery.get();
        snapshot.docs.forEach((doc) => fetched.push(doc));

        if (snapshot.docs.length > 0) {
          newCursor = snapshot.docs[snapshot.docs.length - 1];
        }
      } catch (fallbackError) {}
    }
  }

  fetched.sort((a, b) =>
    (b.data().created_at?.seconds || 0) -
    (a.data().created_at?.seconds || 0)
  );

  const limited = fetched.slice(0, CONFIG.PRODUCTS_PER_PAGE);

  if (limited.length > 0) {
    lastVisibleDoc = limited[limited.length - 1];
  }

  hasMoreProducts = fetched.length >= CONFIG.PRODUCTS_PER_PAGE;

  const items = limited.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  const existingIds = new Set(allProductsLocal.map((product) => product.id));
  const newItems = items.filter((item) => !existingIds.has(item.id));
  allProductsLocal = allProductsLocal.concat(newItems);

  if (!silent) {
    renderProductsBatch(newItems);
  }

  if (allProductsLocal.length === 0) {
    document.getElementById('allProductsEmpty').classList.remove('hidden');
  } else {
    document.getElementById('allProductsEmpty').classList.add('hidden');
  }

  const loadButton = document.getElementById('loadMoreProductsBtn');
  if (hasMoreProducts) {
    loadButton.classList.remove('hidden');
  } else {
    loadButton.classList.add('hidden');
  }
}

async function loadCategories(force) {
  if (!force && stores && stores.length) {
    rebuildStoreCategories();
    return;
  }

  try {
    const storesData = await fetchWithCache(
      'stores_list',
      async () => {
        const snapshot = await db.collection('stores').limit(30).get();
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
      },
      force,
      CONFIG.CACHE_TTL_STORES
    );

    const cats = [];
    storesData.forEach((store) => {
      const category = store.category;
      if (category && String(category).trim() && !cats.includes(category)) {
        cats.push(category);
      }
    });

    categories = cats;
    displayCategories();
  } catch (error) {
    console.error('[BZR] loadCategories:', error);
  }
}

/* ═══ FOLLOW SYSTEM ═══ */
async function syncFollowedStoresFromServer() {
  try {
    const ok = await ensureAuth();
    if (!ok) return;

    const userId = getUserIdentity();
    if (!userId) return;

    const snapshot = await db.collection('store_follows')
      .where('fingerprint', '==', userId)
      .get();

    const serverIds = new Set();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data && data.storeId) {
        serverIds.add(String(data.storeId));
      }
    });

    _followedFromServer = serverIds;

    const localList = getFollowedStores();
    const merged = new Set([
      ...localList.map(String),
      ...serverIds
    ]);

    saveFollowedStores(Array.from(merged));

    const localOnly = localList.filter(
      (id) => !serverIds.has(String(id))
    );

    if (localOnly.length) {
      migrateLocalFollowsToServer(localOnly, userId).catch(() => {});
    }

    renderFollowedStores();

    document.querySelectorAll('.store-card button[data-store-id]')
      .forEach((button) => {
        if (serverIds.has(String(button.dataset.storeId))) {
          setCardFollowState(button, true);
        }
      });
  } catch (error) {
    console.warn('[BZR] Sync follows failed:', error);
  }
}

async function migrateLocalFollowsToServer(storeIds, userId) {
  try {
    const batch = db.batch();
    let count = 0;

    for (const storeId of storeIds) {
      const docId = storeId + '_' + userId;
      const reference = db.collection('store_follows').doc(docId);

      batch.set(reference, {
        storeId: String(storeId),
        fingerprint: userId,
        migrated: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      count++;
      if (count >= 400) break;
    }

    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.warn('[BZR] Migration failed:', error);
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
      transaction.set(
        storeRef,
        { followers: firebase.firestore.FieldValue.increment(-1) },
        { merge: true }
      );

      return { action: 'unfollowed', storeId };
    }

    transaction.set(followRef, {
      storeId,
      fingerprint: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    transaction.set(
      storeRef,
      { followers: firebase.firestore.FieldValue.increment(1) },
      { merge: true }
    );

    return { action: 'followed', storeId };
  });
}

async function checkFollowStatusFromServer(storeId) {
  try {
    const userId = getUserIdentity();
    if (!userId) return false;

    const docId = String(storeId) + '_' + userId;
    const doc = await db.collection('store_follows').doc(docId).get();
    return doc.exists;
  } catch (error) {
    return false;
  }
}

/* ═══ POLLING ═══ */
function setupRealtimeProducts() {
  if (allProductsUnsubscribe) return;

  const pollProducts = async () => {
    if (!isPageVisible) return;
    if (!RateLimiter.canRequest('poll_products')) return;

    try {
      const snapshot = await db.collection('products')
        .orderBy('created_at', 'desc')
        .limit(CONFIG.PRODUCTS_PER_PAGE)
        .get();

      const fresh = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      if (!fresh.length) return;

      const topIds = allProductsLocal
        .slice(0, fresh.length)
        .map((product) => product.id)
        .join(',');

      const freshIds = fresh.map((product) => product.id).join(',');

      if (topIds !== freshIds) {
        const existing = new Set(fresh.map((product) => product.id));
        allProductsLocal = fresh.concat(
          allProductsLocal.filter((product) => !existing.has(product.id))
        );

        renderProductsBatch(fresh);
      }

      cacheManager.set(
        'all_products_page1',
        {
          items: allProductsLocal.slice(0, CONFIG.PRODUCTS_PER_PAGE),
          hasMore: hasMoreProducts
        },
        CONFIG.CACHE_TTL_PRODUCTS
      );
    } catch (error) {
      console.warn('[BZR] Products polling failed:', error);
    }
  };

  allProductsUnsubscribe = setInterval(
    pollProducts,
    CONFIG.PRODUCTS_REFRESH_INTERVAL_MS
  );
}

function setupRealtimeStores() {
  // لا تعيد تحميل كل المتاجر؛ راقب أحدث 10 متاجر فقط.
  startStoresChangesListener();
}

/* ═══ DEEP LINK ═══ */
async function handleDeepLink() {
  try {
    const params = new URLSearchParams(window.location.search);
    let storeId = params.get('store');
    if (!storeId) return;

    storeId = decodeURIComponent(storeId).trim();
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const store = stores.find(
      (item) => String(getStoreId(item)) === String(storeId)
    );

    if (store) {
      updateMetaTagsForStore(store);

      try {
        window.history.replaceState(
          {},
          document.title,
          window.location.origin + window.location.pathname
        );
      } catch (error) {}

      setTimeout(() => openStoreModal(store), 300);
    }
  } catch (error) {}
}

/* ═══ HELPERS ═══ */
function getStoreLocation(store) {
  if (!store) return '';
  return (store.location && String(store.location).trim()) || '';
}

function hasStoreLocation(store) {
  return getStoreLocation(store).length > 0;
}

function getProductDescription(product) {
  if (!product) return '';
  const description =
    (product.description && String(product.description).trim()) || '';
  return description.slice(0, PRODUCT_FIELDS.DESCRIPTION_MAX);
}

function hasProductDescription(product) {
  return getProductDescription(product).length > 0;
}

function openSupportWhatsApp(context) {
  const message = SUPPORT_MESSAGES[context] || SUPPORT_MESSAGES.general;
  const url =
    `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

console.log('[BZR] data.js loaded ✅ v9.10.0 — cache-first stores enabled');
