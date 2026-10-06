/* ═══════════════════════════════════════════════════════════
   BranZar v10.1.0 — store-limits.js
   منطق التحقق من حدود إضافة المنتجات لكل فئة
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ أسماء الفئات (يجب أن تطابق ما في Firestore) ═══ */
async function getCategoryProductCount(storeId, category, isMainCategory) {
  try {
    /* ✅ 1. اقرأ وثيقة المتجر للحصول على الاسم */
    const storeDoc = await db.collection('stores').doc(String(storeId)).get();
    if (!storeDoc.exists) throw new Error('store_not_found');
    
    const storeData = storeDoc.data();
    const storeName = storeData.name;
    if (!storeName) throw new Error('store_name_missing');
    
    /* ✅ 2. اجلب منتجات المتجر */
    const snap = await db.collection('products')
      .where('store_name', '==', storeName)
      .get();
    
    /* ✅ 3. فلترة حسب نوع الفئة */
    const mainCat = String(storeData.category || '').trim();
    let count = 0;
    
    snap.docs.forEach(doc => {
      const p = doc.data();
      const pCat = String(p.category || '').trim();
      
      if (isMainCategory) {
        /* الفئة الرئيسية: المنتجات بدون category أو بـ category = mainCat */
        if (!pCat || pCat === mainCat) count++;
      } else {
        /* الفئة الإضافية: المنتجات بـ category = الفئة المطلوبة */
        if (pCat === category) count++;
      }
    });
    
    return count;
    
  } catch(err) {
    console.error('[BZR] getCategoryProductCount error:', err);
    return -1; /* فشل */
  }
}

/* ═══ التحقق قبل الإضافة ═══ */
async function canAddProductToCategory(storeId, category, isMainCategory) {
  /* ✅ 1. تحديد السقف */
  const limit = isMainCategory 
    ? CONFIG.MAIN_CATEGORY_MAX_PRODUCTS 
    : CONFIG.ADDITIONAL_CATEGORY_MAX_PRODUCTS;
  
  /* ✅ 2. جلب العدد الحالي */
  const currentCount = await getCategoryProductCount(storeId, category, isMainCategory);
  
  if (currentCount === -1) {
    return {
      allowed: false,
      reason: 'error',
      message: '❌ تعذر التحقق من عدد المنتجات — حاول مرة أخرى'
    };
  }
  
  /* ✅ 3. التحقق */
  if (currentCount >= limit) {
    const catLabel = isMainCategory ? 'الفئة الرئيسية' : `الفئة "${category}"`;
    return {
      allowed: false,
      reason: 'limit_reached',
      currentCount: currentCount,
      limit: limit,
      message: `🚫 وصلت للحد الأقصى في ${catLabel} (${limit} منتج) — لا يمكن إضافة المزيد`
    };
  }
  
  /* ✅ 4. مسموح */
  return {
    allowed: true,
    currentCount: currentCount,
    limit: limit,
    remaining: limit - currentCount
  };
}

/* ═══ دالة الإضافة المحسّنة (مع التحقق) ═══ */
async function addProductWithLimitCheck(productData) {
  try {
    /* ✅ 1. معرّف المتجر */
    const storeId = productData.store_id || currentStoreId || localStorage.getItem('bzr_owner_store_id');
    if (!storeId) {
      throw new Error('❌ يجب تسجيل الدخول أولاً');
    }
    
    /* ✅ 2. تحديد نوع الفئة */
    const storeDoc = await db.collection('stores').doc(String(storeId)).get();
    if (!storeDoc.exists) throw new Error('المتجر غير موجود');
    
    const storeData = storeDoc.data();
    const mainCat = String(storeData.category || '').trim();
    const productCat = String(productData.category || '').trim();
    const isMainCategory = !productCat || productCat === mainCat;
    
    /* ✅ 3. التحقق من الحد */
    const check = await canAddProductToCategory(storeId, productCat, isMainCategory);
    
    if (!check.allowed) {
      throw new Error(check.message);
    }
    
    /* ✅ 4. إضافة المنتج */
    const product = {
      name: String(productData.name || '').trim().slice(0, 200),
      price: parseFloat(productData.price) || 0,
      img_url: productData.img_url || '',
      description: productData.description || '',
      category: productCat || '', /* قد تكون فارغة للفئة الرئيسية */
      colors: Array.isArray(productData.colors) ? productData.colors : [],
      store_id: storeId,
      store_name: storeData.name,
      owner_uid: getUserIdentity() || null,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await db.collection('products').add(product);
    
    console.log('[BZR] Product added:', ref.id, '→ Total in category:', check.currentCount + 1, '/', check.limit);
    
    return {
      success: true,
      id: ref.id,
      currentCount: check.currentCount + 1,
      limit: check.limit,
      remaining: check.limit - (check.currentCount + 1)
    };
    
  } catch(err) {
    console.error('[BZR] addProductWithLimitCheck error:', err);
    return {
      success: false,
      message: err.message || '❌ تعذر إضافة المنتج'
    };
  }
}

console.log('[BZR] store-limits.js loaded ✅ v10.1.0');
