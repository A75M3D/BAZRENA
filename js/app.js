/* ═══════════════════════════════════════════════════════════
   ✅ fetchProductsByCategoryPage — v9.8.4 محسّن
   ✅ بدون orderBy (يتجنب مشكلة composite index)
   ✅ trim للمقارنة (يتجنب مشكلة المسافات)
   ✅ Fallback ذكي (متجر واحد إذا in فشل)
   ✅ ترتيب في JS
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

  console.log('[BZR] Filtering by category:', {
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
        .limit(CONFIG.PRODUCTS_PER_PAGE * 2); // نجلب أكثر ثم نرتب في JS

      const snap = await q.get();
      snap.docs.forEach(d => fetched.push(d));
      console.log('[BZR] Fetched chunk:', chunk.length, 'stores →', snap.docs.length, 'products');

    } catch (err) {
      console.warn('[BZR] Chunk failed, trying single stores:', err.code);

      /* ✅ Fallback: جرب كل متجر بشكل منفصل */
      for (const singleStore of chunk) {
        try {
          const snap2 = await db.collection('products')
            .where('store_name', '==', singleStore)
            .limit(CONFIG.PRODUCTS_PER_PAGE)
            .get();
          snap2.docs.forEach(d => fetched.push(d));
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

  /* ✅ 9. إظهار رسالة إذا ما فيه منتجات */
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

  /* ✅ 10. تحديث زر "عرض المزيد" */
  const loadBtn = document.getElementById('loadMoreProductsBtn');
  if (hasMoreProducts) {
    loadBtn.classList.remove('hidden');
  } else {
    loadBtn.classList.add('hidden');
  }
}
