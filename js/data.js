/* ═══════════════════════════════════════════════════════════
   BranZar v9.15.0 — data.js
   Layer 2: Data Loading + Follow System + Smart Stores + Smart Products + Deep Link

   🧠 Smart Stores Strategy:
     - المتاجر القديمة في IndexedDB (Dexie)
     - أحدث 10 متاجر عبر onSnapshot
     - فتح عادي: 10 قراءات

   🧠 Smart Products Strategy:
     - المنتجات القديمة في IndexedDB (Dexie)
     - أحدث 20 منتجاً عبر onSnapshot
     - فتح عادي: 20 قراءة
     - ظهور المنتجات الجديدة: ~1 ثانية
     - لا polling (تم حذف setInterval كلياً)
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

/* ═══════════════════════════════════════════════════════════
   🏪 SMART STORES SYSTEM (v9.14.0 — unchanged)
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
    if (category && String(category).trim() && !cats.includes(category)) {
      cats.push(category);
    }
  });

  categories = cats;
  displayCategories();
}

function sortStoresLikeOriginal(list) {
  return list.slice().sort((a, b) => {
    const followersA = Number(b.followers) || 0;
    const followersB = Number(a.followers) || 0;

    if (followersA !== followersB) {
      return followersB - followersA;
    }

    return String(b.created_at || '')
      .localeCompare(String(a.created_at || ''));
  });
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

/* ═══════════════════════════════════════════════════════════
   🚀 loadStores — نقطة الدخول الرئيسية
   ✅ v9.15.0: دعم force parameter
   ═══════════════════════════════════════════════════════════ */
async function loadStores(force) {
  if (_isLoadingStores) return;
  _isLoadingStores = true;

  const loader = document.getElementById('storesLoader');
  const empty = document.getElementById('storesEmpty');

  loader?.classList.remove('hidden');
  empty?.classList.add('hidden');

  try {
    // 1. اقرأ من IndexedDB — إلا إذا force=true
    let local = [];
    if (!force) {
      local = await dexieGetAllStores();
    }

    if (local && local.length > 0) {
      stores = sortStoresLikeOriginal(local);
      renderStoresFromMemory();
      console.log('[BZR] ⚡ Instant render:', local.length, 'stores from IDB (0 reads)');
      loader?.classList.add('hidden');
    }

    // 2. إذا كانت IDB فارغة (أول تثبيت أو force): اجلب دفعة أولية
    if (!local || local.length === 0) {
      await fetchInitialStores();
    }

    // 3. ابدأ المستمع الحي لأحدث 10
    startStoresLiveListener();
  } catch (error) {
    console.error('[BZR] loadStores failed:', error);
    const errorMessage = document.getElementById('storesErrorMessage');
    if (errorMessage) {
      errorMessage.textContent = '⚠️ تعذر تحميل المتاجر — تحقق من الاتصال';
    }
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
      snapshot = await db.collection('stores')
        .orderBy('created_at', 'desc')
        .limit(INITIAL_FETCH_LIMIT)
        .get();
    } catch (orderedError) {
      console.warn('[BZR] Ordered initial fetch failed, using fallback:', orderedError);
      snapshot = await db.collection('stores')
        .limit(INITIAL_FETCH_LIMIT)
        .get();
    }

    const initial = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    await dexieBulkUpsertStores(initial);
    await dexieSetMeta('stores_lastInitialFetch', Date.now());

    stores = sortStoresLikeOriginal(initial);
    renderStoresFromMemory();

    console.log('[BZR] 📥 Initial fetch:', initial.length, 'stores (one-time)');
  } catch (error) {
    console.warn('[BZR] fetchInitialStores failed:', error);
  }
}

function startStoresLiveListener() {
  if (storesLiveUnsubscribe) return;

  try {
    storesLiveUnsubscribe = db.collection('stores')
      .orderBy('created_at', 'desc')
      .limit(LIVE_WINDOW)
      .onSnapshot(
        { includeMetadataChanges: false },
        async (snapshot) => {
          const isFirstSync = !_storesFirstSyncDone;
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

          let added = [];
          if (!isFirstSync) {
            for (const c of snapshot.docChanges()) {
              if (c.type === 'added') {
                let exists = false;
                if (bzrDB) {
                  try {
                    const row = await bzrDB.stores.get(c.doc.id);
                    exists = !!row;
                  } catch (e) {}
                }
                if (!exists) {
                  added.push({ id: c.doc.id, ...c.doc.data() });
                }
              }
            }
          }

          await dexieBulkUpsertStores(docs);

          let all = await dexieGetAllStores();
          if (!all || !all.length) {
            all = docs;
          }

          stores = sortStoresLikeOriginal(all);

          if (!isFirstSync || stores.length > 0) {
            renderStoresFromMemory();
          }

          if (!isFirstSync && added.length > 0) {
            const names = added.map(s => s.name).filter(Boolean);
            if (names.length === 1) showNewStoreToast(names[0]);
            else if (names.length > 1) showNewStoreToast(names.slice(0, 3).join(' • '));
            else showNewStoreToast('');
            console.log('[BZR] 🆕 Truly new stores:', added.length);
          }

          if (isFirstSync) {
            _storesFirstSyncDone = true;
            console.log('[BZR] Stores listener: first sync done (' + docs.length + ' watched)');
          }
        },
        (error) => {
          console.warn('[BZR] Stores listener error:', error);
          storesLiveUnsubscribe = null;
          setTimeout(() => {
            if (!storesLiveUnsubscribe) startStoresLiveListener();
          }, 5000);
        }
      );
  } catch (error) {
    console.warn('[BZR] Cannot start stores listener:', error);
    storesLiveUnsubscribe = null;
  }
}

document.getElementById('retryStoresBtn')?.addEventListener('click', () => {
  if (storesLiveUnsubscribe) {
    try { storesLiveUnsubscribe(); } catch(e){}
    storesLiveUnsubscribe = null;
  }
  _storesFirstSyncDone = false;
  loadStores(true);
});

/* ─── NEW STORE TOAST ─── */
function showNewStoreToast(storeName) {
  document.getElementById('bzrNewStoreToast')?.remove();

  if (!document.getElementById('bzrNewStoreToastStyles')) {
    const style = document.createElement('style');
    style.id = 'bzrNewStoreToastStyles';
    style.textContent = `
      @keyframes bzrToastIn {
        0%   { opacity: 0; transform: translate(-50%, -40px) scale(0.85); }
        60%  { opacity: 1; transform: translate(-50%, 4px) scale(1.02); }
        100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
      @keyframes bzrToastOut {
        0%   { opacity: 1; transform: translate(-50%, 0) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -30px) scale(0.9); }
      }
      @keyframes bzrShine {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes bzrPulse {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.15); }
      }
      .bzr-new-store-toast {
        position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
        z-index: 99999; display: flex; align-items: center; gap: 12px;
        padding: 12px 20px 12px 18px; border-radius: 20px;
        background: linear-gradient(135deg, #6a5cff 0%, #a855f7 50%, #ec4899 100%);
        color: #fff; font-family: inherit; direction: rtl;
        max-width: min(92vw, 420px);
        box-shadow: 0 14px 40px rgba(124, 58, 237, 0.45),
                    0 4px 14px rgba(0, 0, 0, 0.18),
                    inset 0 1px 0 rgba(255, 255, 255, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.18);
        animation: bzrToastIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        overflow: hidden;
      }
      .bzr-new-store-toast::before {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(circle at 20% 0%, rgba(255,255,255,0.25), transparent 60%);
        pointer-events: none;
      }
      .bzr-new-store-toast.hide { animation: bzrToastOut 0.4s ease forwards; }
      .bzr-new-store-toast .bzr-icon {
        font-size: 26px; line-height: 1;
        animation: bzrPulse 1.6s ease-in-out infinite;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
      }
      .bzr-new-store-toast .bzr-body {
        display: flex; flex-direction: column; gap: 2px;
        line-height: 1.35; min-width: 0;
      }
      .bzr-new-store-toast .bzr-title {
        font-size: 12px; font-weight: 500; opacity: 0.92; letter-spacing: 0.2px;
      }
      .bzr-new-store-toast .bzr-name {
        font-size: 15px; font-weight: 800;
        background: linear-gradient(90deg, #ffffff 0%, #ffe9b8 30%, #ffffff 60%, #ffe9b8 100%);
        background-size: 200% auto;
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: bzrShine 2.5s linear infinite;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 68vw;
      }
      @media (max-width: 380px) {
        .bzr-new-store-toast { padding: 10px 14px; gap: 10px; }
        .bzr-new-store-toast .bzr-icon { font-size: 22px; }
        .bzr-new-store-toast .bzr-name { font-size: 14px; }
      }
    `;
    document.head.appendChild(style);
  }

  const toast = document.createElement('div');
  toast.id = 'bzrNewStoreToast';
  toast.className = 'bzr-new-store-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = document.createElement('span');
  icon.className = 'bzr-icon';
  icon.textContent = '🎉';

  const body = document.createElement('div');
  body.className = 'bzr-body';

  const title = document.createElement('span');
  title.className = 'bzr-title';
  title.textContent = 'متجر جديد انضم إلى BranZar';

  const name = document.createElement('span');
  name.className = 'bzr-name';
  name.textContent = (storeName && String(storeName).trim())
    ? String(storeName).trim()
    : 'مرحباً بك ✨';

  body.appendChild(title);
  body.appendChild(name);

  toast.appendChild(icon);
  toast.appendChild(body);
  document.body.appendChild(toast);

  toast.addEventListener('click', () => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 380);
  }, { once: true });

  setTimeout(() => {
    if (!toast.isConnected) return;
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 380);
  }, 4200);
}

/* ═══════════════════════════════════════════════════════════
   📦 SMART PRODUCTS SYSTEM (v9.15.0 — NEW!)
   ═══════════════════════════════════════════════════════════ */
const PRODUCTS_LIVE_WINDOW = 20;
const PRODUCTS_INITIAL_FETCH = 100;

/* ═══ loadAllProducts — نقطة الدخول الرئيسية ═══ */
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
    // 1. اقرأ من IndexedDB — إلا إذا force=true
    let local = [];
    if (!force) {
      local = await dexieGetRecentProducts(PRODUCTS_INITIAL_FETCH);
    }

    if (local && local.length > 0) {
      const firstPage = local.slice(0, CONFIG.PRODUCTS_PER_PAGE);
      allProductsLocal = firstPage;
      lastVisibleDoc = null; // need to fetch from Firestore on next "load more"
      hasMoreProducts = local.length > CONFIG.PRODUCTS_PER_PAGE;
      renderProductsBatch(firstPage, false);
      if (hasMoreProducts) loadMoreBtn?.classList.remove('hidden');

      console.log('[BZR] ⚡ Instant render:', firstPage.length, 'products from IDB (0 reads)');
      loader?.classList.add('hidden');
    }

    // 2. إذا كانت IDB فارغة: جلب دفعة أولية
    if (!local || local.length === 0) {
      await fetchInitialProducts();
    }

    // 3. ابدأ المستمع الحي
    if (productsLiveUnsubscribe) {
      try { productsLiveUnsubscribe(); } catch (e) {}
      productsLiveUnsubscribe = null;
    }
    _productsFirstSyncDone = false;
    startProductsLiveListener();
  } catch (error) {
    console.error('[BZR] loadAllProducts failed:', error);
    if (grid) {
      grid.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:var(--c-text-soft);">تعذر تحميل المنتجات</p>';
    }
  } finally {
    loader?.classList.add('hidden');
    _isLoadingSmartProducts = false;
  }
}

/* ─── جلب أولي (مرة واحدة — أول تثبيت أو force) ─── */
async function fetchInitialProducts() {
  try {
    const fetchCount = Math.max(PRODUCTS_INITIAL_FETCH, PRODUCTS_LIVE_WINDOW);
    let snapshot;
    try {
      snapshot = await db.collection('products')
        .orderBy('created_at', 'desc')
        .limit(fetchCount)
        .get();
    } catch (err) {
      console.warn('[BZR] Ordered products fetch failed, fallback:', err);
      snapshot = await db.collection('products')
        .limit(fetchCount)
        .get();
    }

    const initial = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // احفظ كل شيء في IDB (يغطي نافذة onSnapshot 20 + صفحة أولى 8)
    await dexieBulkUpsertProducts(initial);

    const firstPage = initial.slice(0, CONFIG.PRODUCTS_PER_PAGE);
    allProductsLocal = firstPage;

    // اضبط cursor للـ pagination
    if (snapshot.docs.length >= firstPage.length && firstPage.length > 0) {
      lastVisibleDoc = snapshot.docs[firstPage.length - 1];
    } else if (snapshot.docs.length > 0) {
      lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    }

    hasMoreProducts = initial.length > CONFIG.PRODUCTS_PER_PAGE;
    renderProductsBatch(firstPage, false);
    if (hasMoreProducts) {
      document.getElementById('loadMoreProductsBtn')?.classList.remove('hidden');
    }

    console.log('[BZR] 📥 Initial products fetch:', initial.length, '(one-time)');
  } catch (error) {
    console.warn('[BZR] fetchInitialProducts failed:', error);
  }
}

/* ─── المستمع الحي ─── */
function startProductsLiveListener() {
  if (productsLiveUnsubscribe) return;

  try {
    productsLiveUnsubscribe = db.collection('products')
      .orderBy('created_at', 'desc')
      .limit(PRODUCTS_LIVE_WINDOW)
      .onSnapshot(
        { includeMetadataChanges: false },
        async (snapshot) => {
          const isFirstSync = !_productsFirstSyncDone;
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

          // اكتشف الجديد الحقيقي (قبل حفظ IDB)
          let added = [];
          for (const c of snapshot.docChanges()) {
            if (c.type === 'added') {
              let exists = false;
              if (bzrDB) {
                try {
                  const row = await bzrDB.products.get(c.doc.id);
                  exists = !!row;
                } catch (e) {}
              }
              if (!exists) {
                added.push({ id: c.doc.id, ...c.doc.data() });
              }
            }
          }

          // احفظ كل شيء في IDB
          await dexieBulkUpsertProducts(docs);

          // إذا كان المستخدم مفلتراً بفئة → لا ترسم
          if (currentCategory) {
            if (isFirstSync) {
              _productsFirstSyncDone = true;
              console.log('[BZR] Products listener: first sync (filtered, hidden)');
            }
            return;
          }

          // إذا لم يكن أول sync وهناك منتجات جديدة → prepend
          if (!isFirstSync && added.length > 0) {
            const existingIds = new Set(allProductsLocal.map(p => p.id));
            const trulyNew = added.filter(p => !existingIds.has(p.id));

            if (trulyNew.length > 0) {
              allProductsLocal = trulyNew.concat(allProductsLocal).slice(0, CONFIG.SEARCH_CAP);
              renderProductsBatch(trulyNew, true); // prepend
              console.log('[BZR] 🆕 Truly new products prepended:', trulyNew.length);
            }
          }

          if (isFirstSync) {
            _productsFirstSyncDone = true;
            console.log('[BZR] Products listener: first sync done (' + docs.length + ' watched)');
          }
        },
        (error) => {
          console.warn('[BZR] Products listener error:', error);
          productsLiveUnsubscribe = null;
          setTimeout(() => {
            if (!productsLiveUnsubscribe) startProductsLiveListener();
          }, 5000);
        }
      );
  } catch (error) {
    console.warn('[BZR] Cannot start products listener:', error);
    productsLiveUnsubscribe = null;
  }
}

/* ─── fetchProductsPage — للـ load more (بدون تغيير جذري) ─── */
async function fetchProductsPage(cursorDoc, silent) {
  if (!RateLimiter.canRequest('products')) {
    if (silent) return;
    throw new Error('rate_limit');
  }

  let query;
  let skipCount = 0;

  if (cursorDoc) {
    // Pagination طبيعي
    query = db.collection('products')
      .orderBy('created_at', 'desc')
      .startAfter(cursorDoc)
      .limit(CONFIG.PRODUCTS_PER_PAGE);
  } else if (allProductsLocal.length > 0) {
    // Cache-hit state — need to skip already-shown items
    skipCount = allProductsLocal.length;
    query = db.collection('products')
      .orderBy('created_at', 'desc')
      .limit(skipCount + CONFIG.PRODUCTS_PER_PAGE);
  } else {
    // Fresh load
    query = db.collection('products')
      .orderBy('created_at', 'desc')
      .limit(CONFIG.PRODUCTS_PER_PAGE);
  }

  let snapshot;
  try {
    snapshot = await query.get();
  } catch (error) {
    // Fallback without orderBy
    let fallbackQuery = db.collection('products')
      .limit(skipCount + CONFIG.PRODUCTS_PER_PAGE || CONFIG.PRODUCTS_PER_PAGE);
    if (cursorDoc) {
      fallbackQuery = db.collection('products')
        .startAfter(cursorDoc)
        .limit(CONFIG.PRODUCTS_PER_PAGE);
    }
    snapshot = await fallbackQuery.get();
  }

  const usableDocs = snapshot.docs.slice(skipCount);

  // اضبط cursor دائماً على آخر وثيقة في الـ snapshot (كلها، وليس فقط usable)
  if (snapshot.docs.length > 0) {
    lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  hasMoreProducts = usableDocs.length >= CONFIG.PRODUCTS_PER_PAGE;

  const fresh = usableDocs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  await dexieBulkUpsertProducts(fresh);

  const existingIds = new Set(allProductsLocal.map(p => p.id));
  const newItems = fresh.filter(p => !existingIds.has(p.id));
  allProductsLocal = allProductsLocal.concat(newItems);

  if (!silent) {
    renderProductsBatch(newItems);
  }

  const loadButton = document.getElementById('loadMoreProductsBtn');
  const emptyElement = document.getElementById('allProductsEmpty');

  if (allProductsLocal.length === 0) {
    emptyElement?.classList.remove('hidden');
    loadButton?.classList.add('hidden');
  } else {
    emptyElement?.classList.add('hidden');
  }

  if (hasMoreProducts) {
    loadButton?.classList.remove('hidden');
  } else {
    loadButton?.classList.add('hidden');
  }

  // تحديث الكاش القديم (legacy)
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

/* ─── Load More button ─── */
document.getElementById('loadMoreProductsBtn')?.addEventListener('click', async () => {
  const button = document.getElementById('loadMoreProductsBtn');
  if (button.disabled || !hasMoreProducts || _isLoadingSmartProducts) return;

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

/* ─── applyProductsFilter ─── */
async function applyProductsFilter(category) {
  currentCategory = category;

  const grid = document.getElementById('allProductsGrid');
  const emptyElement = document.getElementById('allProductsEmpty');
  const loadButton = document.getElementById('loadMoreProductsBtn');

  // عرض الكل
  if (!category) {
    if (grid) grid.innerHTML = '';
    allProductsLocal = [];
    lastVisibleDoc = null;
    hasMoreProducts = true;
    loadButton?.classList.add('hidden');
    emptyElement?.classList.add('hidden');

    try {
      const recent = await dexieGetRecentProducts(PRODUCTS_INITIAL_FETCH);
      if (recent && recent.length > 0) {
        const firstPage = recent.slice(0, CONFIG.PRODUCTS_PER_PAGE);
        allProductsLocal = firstPage;
        hasMoreProducts = recent.length > CONFIG.PRODUCTS_PER_PAGE;
        renderProductsBatch(firstPage, false);
        if (hasMoreProducts) loadButton?.classList.remove('hidden');
        return;
      }
    } catch (e) {}

    // IDB empty — fallback
    try { await fetchInitialProducts(); } catch (e) {}
    return;
  }

  // فلترة بفئة → Firestore
  if (grid) grid.innerHTML = '';
  allProductsLocal = [];
  lastVisibleDoc = null;
  hasMoreProducts = true;
  loadButton?.classList.add('hidden');
  emptyElement?.classList.add('hidden');

  try {
    await fetchProductsByCategoryPage(null, false);
  } catch (error) {
    emptyElement?.classList.remove('hidden');
  }
}

/* ─── fetchProductsByCategoryPage (بدون تغيير) ─── */
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

  await dexieBulkUpsertProducts(items);

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

/* ─── loadCategories ─── */
async function loadCategories(force) {
  if (force) {
    await dexieClearStores();
    cacheManager.remove('stores_list');
    _storesFirstSyncDone = false;
    if (storesLiveUnsubscribe) {
      try { storesLiveUnsubscribe(); } catch(e){}
      storesLiveUnsubscribe = null;
    }
    stores = [];
    await loadStores(true);
    return;
  }

  if (stores && stores.length) {
    rebuildStoreCategories();
    return;
  }

  await loadStores();
}

/* ═══════════════════════════════════════════════════════════
   👥 FOLLOW SYSTEM (بدون تغيير)
   ═══════════════════════════════════════════════════════════ */
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
    const merged = new Set([...localList.map(String), ...serverIds]);

    saveFollowedStores(Array.from(merged));

    const localOnly = localList.filter(id => !serverIds.has(String(id)));

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

    if (count > 0) await batch.commit();
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
      transaction.set(storeRef, { followers: firebase.firestore.FieldValue.increment(-1) }, { merge: true });
      return { action: 'unfollowed', storeId };
    }

    transaction.set(followRef, {
      storeId,
      fingerprint: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    transaction.set(storeRef, { followers: firebase.firestore.FieldValue.increment(1) }, { merge: true });
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

/* ═══════════════════════════════════════════════════════════
   ⚡ Realtime Wrappers (متوافقة مع app.js)
   ═══════════════════════════════════════════════════════════ */
function setupRealtimeStores() {
  startStoresLiveListener();
}

function setupRealtimeProducts() {
  startProductsLiveListener();
}

/* ═══════════════════════════════════════════════════════════
   🔗 DEEP LINK (بدون تغيير)
   ═══════════════════════════════════════════════════════════ */
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
      try {
        window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
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
  const description = (product.description && String(product.description).trim()) || '';
  return description.slice(0, PRODUCT_FIELDS.DESCRIPTION_MAX);
}

function hasProductDescription(product) {
  return getProductDescription(product).length > 0;
}

function openSupportWhatsApp(context) {
  const message = SUPPORT_MESSAGES[context] || SUPPORT_MESSAGES.general;
  const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

console.log('[BZR] data.js loaded ✅ v9.15.0 — Smart Stores + Smart Products (IDB + onSnapshot)');
