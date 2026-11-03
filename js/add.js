
'use strict';
const FALLBACK_LOGO = 'https://branzar.vercel.app/b.webp';
const FALLBACK_ICON_SVG = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#FFF7ED"/><rect x="25" y="40" width="50" height="42" rx="4" fill="#FF7A00"/><circle cx="40" cy="55" r="3" fill="white"/><circle cx="60" cy="55" r="3" fill="white"/></svg>');

function applyImageFallback(img) {
  if (!img || img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  const isLogo = img.id === 'headerStoreLogo' || img.id === 'loginLogoImg' || img.closest('.login-logo') || img.closest('.header-brand-logo');
  img.src = isLogo ? FALLBACK_LOGO : FALLBACK_ICON_SVG;
  img.onerror = null;
}
function setupImageFallbacks() {
  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.fallbackSetup === '1') return;
    img.dataset.fallbackSetup = '1';
    img.addEventListener('error', () => applyImageFallback(img));
    if (img.complete && img.naturalWidth === 0 && img.src) applyImageFallback(img);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setupImageFallbacks(); setTimeout(setupImageFallbacks, 500); });
} else { setupImageFallbacks(); setTimeout(setupImageFallbacks, 500); }

const firebaseConfig = {
  apiKey: "AIzaSyDUfiHqBPQuFKrsHxoSDdR0j7DMvekfYiA",
  authDomain: "bazarena-725e4.firebaseapp.com",
  databaseURL: "https://bazarena-725e4-default-rtdb.firebaseio.com",
  projectId: "bazarena-725e4",
  storageBucket: "bazarena-725e4.firebasestorage.app",
  messagingSenderId: "977750898059",
  appId: "1:977750898059:web:247e8513b48490ed622b8e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
db.settings({ ignoreUndefinedProperties: true });
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

const STORES = 'stores';
const PRODUCTS = 'products';
const CLOUDINARY_CLOUD_NAME = 'n4qu1xfh';
const CLOUDINARY_UPLOAD_PRESET = 'branzar_unsigned';
const WHATSAPP_SUPPORT = '249908280115';
const DEFAULT_LOGO = FALLBACK_LOGO;
const INVOICE_APP_URL = 'invoice.html';
const PRODUCT_DESC_MAX = 100;
// ═══════════════════════════════════════════════════════
// 🛡️ حدود المنتجات — الفئة الرئيسية: 15 منتج كحد أقصى
// ═══════════════════════════════════════════════════════
const PRODUCT_LIMITS = { MAIN_CATEGORY_MAX: 15, ADDITIONAL_CATEGORY_MAX: 50, WARN_THRESHOLD: 3 };
const COOLDOWN_NAME_MS = 30 * 24 * 60 * 60 * 1000;
const COOLDOWN_DATA_MS = 7 * 24 * 60 * 60 * 1000;

const FIXED_CATEGORIES = ['إلكترونيات وتقنية','أزياء وموضة','جمال وعناية','منزل وديكور','أطعمة ومشروبات','سوبرماركت ومواد','سيارات وقطع','أطفال ومواليد','هدايا وإكسسوارات','رياضة ولياقة','بناء ومعدات','زراعة ومنتجات','تعليم وكتب','تعليم وتطوير','خدمات وأعمال','نقل وتوصيل','سفر وسياحة'];

const CURRENCIES = { SDG: { code: 'SDG', name: 'جنيه سوداني', symbol: 'SDG', flag: '🇸🇩' }, USD: { code: 'USD', name: 'دولار أمريكي', symbol: 'USD', flag: '🇺🇸' } };
const DEFAULT_CURRENCY_CODE = 'SDG';
const LEGACY_CURRENCY_SYMBOLS = { 'ج.س': 'SDG', 'ج.س.': 'SDG', 'جنيه': 'SDG', 'جنية': 'SDG' };

function normalizeCurrencySymbol(sym) { if (!sym) return null; const s = String(sym).trim(); if (LEGACY_CURRENCY_SYMBOLS[s]) return LEGACY_CURRENCY_SYMBOLS[s]; return s; }
function getCurrencyByCode(code) { if (!code) return CURRENCIES[DEFAULT_CURRENCY_CODE]; return CURRENCIES[String(code).toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY_CODE]; }
function getCurrencyBySymbol(sym) { if (!sym) return null; const s = normalizeCurrencySymbol(sym); for (const c of Object.values(CURRENCIES)) { if (c.symbol === s || c.code === s) return c; } return null; }
function getStoreCurrency() { return CURRENCIES[DEFAULT_CURRENCY_CODE]; }
function getProductCurrency(p) { if (p && p.currency) { const found = getCurrencyBySymbol(p.currency); if (found) return found; const raw = normalizeCurrencySymbol(p.currency); return { code: raw, name: raw, symbol: raw, flag: '💱' }; } return getStoreCurrency(); }
function updateProductCurrencyDisplay(currency) {
  const symEl = $('productCurrencySymbol'); const hiddenEl = $('product_currency');
  if (symEl) symEl.textContent = currency.symbol;
  if (hiddenEl) hiddenEl.value = currency.symbol;
  document.querySelectorAll('.currency-option').forEach(btn => { btn.classList.toggle('active', btn.getAttribute('data-currency') === currency.symbol); });
}
document.querySelectorAll('.currency-option').forEach(btn => {
  btn.addEventListener('click', () => { const found = getCurrencyBySymbol(btn.getAttribute('data-currency')); if (found) updateProductCurrencyDisplay(found); });
});

const COLOR_MAP = { 'أسود': '#000000','أبيض': '#FFFFFF','رمادي': '#808080','أحمر': '#EF4444','أزرق': '#3B82F6','أخضر': '#10B981','أصفر': '#F59E0B','برتقالي': '#FF7A00','بنفسجي': '#8B5CF6','وردي': '#EC4899','بني': '#78350F','ذهبي': '#FBBF24','فضي': '#D1D5DB','كحلي': '#1E3A8A','بيج': '#FDE68A','تركواز': '#06B6D4','نبيتي': '#991B1B','خمري': '#7F1D1D' };
function getColorHex(name) { if (!name) return '#E2E8F0'; const clean = name.trim().toLowerCase(); for (const [key, val] of Object.entries(COLOR_MAP)) { if (clean === key.toLowerCase() || clean.includes(key.toLowerCase())) return val; } return '#E2E8F0'; }

let currentStore = null, currentUser = null, productsData = [], isSavingProduct = false;
let productsUnsubscribe = null, storeUnsubscribe = null, lastProductsFingerprint = '';
let _cooldownTicker = null, isExplicitLoginAttempt = false, lastLoginAttemptAt = 0, hasPlayedIgnition = false;

const $ = id => document.getElementById(id);
const escapeHtml = s => { if (s == null) return ''; const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; };
const sanitize = s => !s ? '' : String(s).replace(/<[^>]*>/g, '').trim();
const toNumber = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
const getFp = ps => ps.map(p => p.id).sort().join('|');

async function playIgnitionSequence() {
  if (hasPlayedIgnition) return;
  hasPlayedIgnition = true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { $('loginOverlay').style.display = 'none'; $('dashboard').classList.remove('hidden'); $('dashboard').classList.add('revealed'); return; }
  $('igniteOverlay').classList.add('active');
  $('igniteFlash').classList.add('active');
  await new Promise(r => setTimeout(r, 1400));
  $('loginOverlay').style.display = 'none';
  $('dashboard').classList.remove('hidden');
  $('dashboard').classList.add('revealed');
  $('logoReveal').classList.add('active');
  await new Promise(r => setTimeout(r, 2400));
  $('igniteOverlay').classList.remove('active');
  $('igniteFlash').classList.remove('active');
  await new Promise(r => setTimeout(r, 400));
  $('logoReveal').classList.remove('active');
}

function showToast(msg, type = 'success') {
  const t = $('toast'); if (!t) return;
  t.textContent = msg; t.className = 'toast show';
  t.style.background = type === 'error' ? 'linear-gradient(135deg, #EF4444, #DC2626)' : type === 'warning' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : type === 'info' ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'linear-gradient(135deg, #10B981, #059669)';
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove('show'), 4000);
}
function setBtnLoad(btn, loading, text, normalHTML) {
  if (!btn) return;
  if (loading) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>' + text + '</span>'; }
  else { btn.disabled = false; btn.innerHTML = normalHTML; }
}
function setConn(ok, msg) { const dot = $('connectionStatusDot'), txt = $('connectionStatusText'); if (!dot || !txt) return; dot.className = 'connection-dot ' + (ok ? 'dot-green' : 'dot-red'); txt.textContent = (ok ? 'متصل ' : 'فشل الاتصال ') + (msg ? '• ' + msg : ''); }
function showMsg(id, msg) { const el = $(id); if (el) { el.textContent = msg; el.classList.add('show'); } }
function hideMsg(id) { const el = $(id); if (el) el.classList.remove('show'); }
function mapFbError(err) {
  const c = err && err.code ? String(err.code) : '';
  const m = {'auth/email-already-in-use':'البريد الإلكتروني مستخدم بالفعل','auth/invalid-email':'البريد الإلكتروني غير صحيح','auth/weak-password':'كلمة المرور ضعيفة (6 أحرف على الأقل)','auth/wrong-password':'البريد الإلكتروني أو كلمة المرور غير صحيحة','auth/invalid-credential':'البريد الإلكتروني أو كلمة المرور غير صحيحة','auth/user-not-found':'البريد الإلكتروني أو كلمة المرور غير صحيحة','auth/user-disabled':'هذا الحساب معطّل','auth/too-many-requests':'محاولات كثيرة، حاول لاحقاً','auth/network-request-failed':'تعذر الاتصال بالشبكة','permission-denied':'لا تملك صلاحية تنفيذ هذه العملية','unavailable':'الخدمة غير متاحة مؤقتاً'};
  return m[c] || (err && err.message) || 'حدث خطأ غير متوقع';
}
function formatDuration(ms) {
  if (ms <= 0) return '';
  const days = Math.floor(ms / 86400000), hours = Math.floor((ms % 86400000) / 3600000), minutes = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return days + ' يوم' + (hours > 0 ? ' و' + hours + ' ساعة' : '');
  if (hours > 0) return hours + ' ساعة' + (minutes > 0 ? ' و' + minutes + ' دقيقة' : '');
  return Math.max(1, minutes) + ' دقيقة';
}
function getCooldownStatus() {
  const now = Date.now();
  const last_name = currentStore && currentStore.last_name_update ? Number(currentStore.last_name_update) : 0;
  const last_data = currentStore && currentStore.last_data_update ? Number(currentStore.last_data_update) : 0;
  const nameRemaining = Math.max(0, last_name + COOLDOWN_NAME_MS - now);
  const dataRemaining = Math.max(0, last_data + COOLDOWN_DATA_MS - now);
  return { canUpdateName: nameRemaining <= 0, canUpdateData: dataRemaining <= 0, nameRemaining, dataRemaining };
}
function updateCooldownUI() {
  if (!currentStore) return;
  const status = getCooldownStatus();
  const nameNotice = $('nameCooldownNotice'), nameInput = $('store_name');
  if (nameNotice) {
    if (!status.canUpdateName) { nameNotice.classList.add('show'); nameNotice.innerHTML = '<i class="fas fa-clock"></i><div>لا يمكن تغيير <strong>اسم المتجر</strong> إلا بعد: <strong>' + formatDuration(status.nameRemaining) + '</strong></div>'; }
    else { nameNotice.classList.remove('show'); nameNotice.innerHTML = ''; }
  }
  if (nameInput) nameInput.classList.toggle('locked', !status.canUpdateName);
  const dataNotice = $('dataCooldownNotice');
  if (dataNotice) {
    if (!status.canUpdateData) { dataNotice.classList.add('show'); dataNotice.innerHTML = '<i class="fas fa-clock"></i><div>لا يمكن تعديل <strong>بيانات المتجر</strong> إلا بعد: <strong>' + formatDuration(status.dataRemaining) + '</strong></div>'; }
    else { dataNotice.classList.remove('show'); dataNotice.innerHTML = ''; }
  }
  const submitBtn = $('storeSubmitBtn');
  if (submitBtn && !status.canUpdateName && !status.canUpdateData) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-lock"></i><span>التعديل مقفل مؤقتاً</span>'; }
  else if (submitBtn && !submitBtn.dataset.saving) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-save"></i><span>حفظ التعديلات</span>'; }
}
if (_cooldownTicker) clearInterval(_cooldownTicker);
_cooldownTicker = setInterval(updateCooldownUI, 60000);

function openSupportChat(ctx) {
  const msgs = { general: 'السلام عليكم ورحمة الله 👋\nأرغب بالتواصل مع خدمة عملاء BranZar.', welcome: 'السلام عليكم ورحمة الله 👋\nأنا صاحب متجر على BranZar.', limit: 'السلام عليكم ورحمة الله 👋\nوصلت إلى الحد الأقصى للمنتجات.' };
  window.open('https://wa.me/' + WHATSAPP_SUPPORT + '?text=' + encodeURIComponent(msgs[ctx] || msgs.general), '_blank', 'noopener,noreferrer');
}
window.openSupportChat = openSupportChat;
window.openInvoiceApp = function () { try { window.open(INVOICE_APP_URL, '_blank', 'noopener,noreferrer'); } catch (e) { window.location.href = INVOICE_APP_URL; } };

(function setupPasswordToggle() {
  const i = $('loginPassword'), b = $('loginPasswordToggle'), ic = $('loginPasswordToggleIcon');
  if (!i || !b || !ic) return;
  b.addEventListener('click', () => { const isPwd = i.type === 'password'; i.type = isPwd ? 'text' : 'password'; ic.classList.toggle('fa-eye', !isPwd); ic.classList.toggle('fa-eye-slash', isPwd); });
})();

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMsg('loginError'); hideMsg('loginSuccess');
  const email = sanitize($('loginEmail').value).toLowerCase();
  const password = String($('loginPassword').value);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { showMsg('loginError', '⚠️ البريد الإلكتروني غير صحيح'); return; }
  if (!password || password.length < 6) { showMsg('loginError', '⚠️ كلمة المرور غير صحيحة'); return; }
  isExplicitLoginAttempt = true; lastLoginAttemptAt = Date.now(); hasPlayedIgnition = false;
  setBtnLoad($('loginSubmitBtn'), true, 'جارٍ التحقق...', '<i class="fas fa-sign-in-alt"></i> <span>تسجيل الدخول</span>');
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    if (!cred.user.emailVerified) {
      try { await cred.user.sendEmailVerification(); } catch (e) {}
      showMsg('loginError', '⚠️ يجب تأكيد بريدك الإلكتروني أولاً');
      await auth.signOut(); isExplicitLoginAttempt = false;
    }
  } catch (err) {
    console.error('[Login]', err);
    isExplicitLoginAttempt = false;
    let msg = '❌ البريد أو كلمة المرور غير صحيحة';
    if (err.code === 'auth/too-many-requests') msg = '🔒 طلبات كثيرة — حاول لاحقاً';
    if (err.code === 'auth/network-request-failed') msg = '⚠️ تحقق من اتصالك بالإنترنت';
    showMsg('loginError', msg);
    $('loginPassword').value = '';
  } finally { setBtnLoad($('loginSubmitBtn'), false, '', '<i class="fas fa-sign-in-alt"></i> <span>تسجيل الدخول</span>'); }
});

$('forgotPasswordLink').addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'reset-password.html'; });

$('logoutBtn').addEventListener('click', async () => {
  if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
  if (productsUnsubscribe) { productsUnsubscribe(); productsUnsubscribe = null; }
  if (storeUnsubscribe) { storeUnsubscribe(); storeUnsubscribe = null; }
  try { await auth.signOut(); } catch (e) {}
  hasPlayedIgnition = false;
  $('loginOverlay').style.display = '';
  $('loginOverlay').classList.remove('igniting');
  $('dashboard').classList.add('hidden');
  $('dashboard').classList.remove('revealed');
  $('igniteOverlay').classList.remove('active');
  $('igniteFlash').classList.remove('active');
  $('logoReveal').classList.remove('active');
});

async function findStoreByUid(uid) {
  const snap = await db.collection(STORES).where('owner_uid', '==', uid).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

auth.onAuthStateChanged(async (user) => {
  if (!user) { currentUser = null; currentStore = null; isExplicitLoginAttempt = false; return; }
  currentUser = user;
  setConn(true, user.email || '');
  try {
    const store = await findStoreByUid(user.uid);
    if (!store) {
      const wasExplicitLogin = isExplicitLoginAttempt && (Date.now() - lastLoginAttemptAt < 20000);
      isExplicitLoginAttempt = false;
      if (wasExplicitLogin) showMsg('loginError', '❌ لا يوجد متجر مرتبط بهذا الحساب');
      try { await auth.signOut(); } catch (e) {}
      return;
    }
    const wasExplicitLogin = isExplicitLoginAttempt && (Date.now() - lastLoginAttemptAt < 20000);
    isExplicitLoginAttempt = false;
    currentStore = store;
    await enterDashboard();
    if (wasExplicitLogin) { await playIgnitionSequence(); }
    else { $('loginOverlay').style.display = 'none'; $('dashboard').classList.remove('hidden'); }
  } catch (err) {
    console.error('[AuthState]', err);
    isExplicitLoginAttempt = false;
    showToast('تعذر تحميل المتجر: ' + mapFbError(err), 'error');
    try { await auth.signOut(); } catch (e) {}
  }
});

async function enterDashboard() {
  $('welcomeStoreName').textContent = currentStore.name || '—';
  updateHeaderLogo(currentStore);
  populateCategorySelect();
  fillStoreForm(currentStore);
  $('product_store_name').value = currentStore.name || '';
  $('product_store_name_display').value = currentStore.name || '';
  setupStoreListener();
  await loadMyProducts();
  setConn(true, currentStore.name);
  updateCooldownUI();
  updateProductCurrencyDisplay(getStoreCurrency());
  setTimeout(setupImageFallbacks, 200);
}

function updateHeaderLogo(store) {
  const im = $('headerStoreLogo'); if (!im) return;
  const url = store && store.logo_url ? String(store.logo_url).trim() : '';
  delete im.dataset.fallbackApplied;
  if (url) { im.src = url; im.onerror = () => { if (im.dataset.fallbackApplied === '1') return; im.dataset.fallbackApplied = '1'; im.src = FALLBACK_LOGO; im.onerror = null; }; }
  else { im.src = FALLBACK_LOGO; im.onerror = null; }
}

function populateCategorySelect() {
  const sel = $('store_category'); if (!sel) return;
  const current = currentStore && currentStore.category ? String(currentStore.category).trim() : '';
  sel.innerHTML = '<option value="">— اختر الفئة —</option>';
  const set = new Set(FIXED_CATEGORIES);
  if (current) set.add(current);
  Array.from(set).sort((a, b) => a.localeCompare(b, 'ar')).forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); });
  if (current) sel.value = current;
}

function setupStoreListener() {
  if (!currentStore || storeUnsubscribe) return;
  storeUnsubscribe = db.collection(STORES).doc(currentStore.id).onSnapshot((doc) => {
    if (!doc.exists) return;
    const fresh = { ...doc.data(), id: doc.id };
    const subChanged = (fresh.is_subscribed === true) !== (currentStore.is_subscribed === true);
    const verChanged = (fresh.is_verified === true) !== (currentStore.is_verified === true);
    const catChanged = (fresh.category || '') !== (currentStore.category || '');
    currentStore = fresh;
    if (catChanged || subChanged || verChanged) {
      populateCategorySelect(); fillStoreForm(currentStore);
      if (subChanged) showToast(fresh.is_subscribed ? '🎉 تم تفعيل اشتراكك!' : '⚠️ تم إيقاف اشتراكك', fresh.is_subscribed ? 'success' : 'warning');
    }
    updateCooldownUI();
  }, (err) => console.warn('Store listener:', err));
}

function fillStoreForm(store) {
  if (!store) return;
  $('store_id').value = store.id || '';
  $('store_name').value = store.name || '';
  $('store_category').value = store.category || '';
  $('store_description').value = store.description || '';
  $('store_location').value = store.location || '';
  $('store_whatsapp').value = store.whatsapp_number || '';
  $('store_phone').value = store.phone_number || '';
  $('store_logo').value = store.logo_url || '';
  $('store_cover').value = store.cover_url || '';
  $('ro_followers').textContent = (parseInt(store.followers) || 0).toLocaleString();
  $('ro_products_count').textContent = parseInt(store.products_count) || 0;
  $('ro_verified').innerHTML = store.is_verified ? '<i class="fas fa-check-circle" style="color:#10B981;"></i> موثّق' : '<i class="fas fa-circle-xmark" style="color:#9CA3AF;"></i> غير موثّق';
  const lp = $('store_logo_preview');
  if (store.logo_url) { lp.src = store.logo_url; lp.classList.remove('hidden'); lp.onerror = () => { lp.src = FALLBACK_ICON_SVG; lp.onerror = null; }; }
  else lp.classList.add('hidden');
  const cp = $('store_cover_preview');
  if (store.cover_url) { cp.src = store.cover_url; cp.classList.remove('hidden'); cp.onerror = () => { cp.src = FALLBACK_ICON_SVG; cp.onerror = null; }; }
  else cp.classList.add('hidden');
  updateHeaderLogo(store);
  updateCooldownUI();
  setTimeout(setupImageFallbacks, 100);
}

$('storeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentStore || !currentUser) { showToast('يجب تسجيل الدخول', 'error'); return; }
  const newName = sanitize($('store_name').value);
  const newCategory = sanitize($('store_category').value);
  const newDescription = sanitize($('store_description').value).slice(0, 500);
  const newLocation = sanitize($('store_location').value).slice(0, 100);
  const newWhatsapp = sanitize($('store_whatsapp').value).replace(/[^\d+]/g, '');
  const newPhone = sanitize($('store_phone').value).replace(/[^\d+]/g, '');
  const newLogo = sanitize($('store_logo').value);
  const newCover = sanitize($('store_cover').value);
  if (newName.length < 3 || newName.length > 60) { showToast('اسم المتجر بين 3 و 60 حرف', 'error'); return; }
  if (!newCategory) { showToast('اختر فئة صحيحة', 'error'); return; }
  if (newWhatsapp.replace(/\D/g, '').length < 9) { showToast('رقم الواتساب غير صحيح', 'error'); return; }
  const nameChanged = newName !== (currentStore.name || '');
  const otherChanged = newCategory !== (currentStore.category || '') || newDescription !== (currentStore.description || '') || newLocation !== (currentStore.location || '') || newWhatsapp !== (currentStore.whatsapp_number || '') || newPhone !== (currentStore.phone_number || '') || newLogo !== (currentStore.logo_url || '') || newCover !== (currentStore.cover_url || '');
  if (!nameChanged && !otherChanged) { showToast('لم يتم إجراء أي تغيير', 'info'); return; }
  const status = getCooldownStatus();
  if (nameChanged && !status.canUpdateName) { showToast('⏱️ لا يمكن تغيير اسم المتجر إلا بعد ' + formatDuration(status.nameRemaining), 'error'); return; }
  if (otherChanged && !status.canUpdateData) { showToast('⏱️ لا يمكن تعديل بيانات المتجر إلا بعد ' + formatDuration(status.dataRemaining), 'error'); return; }
  const updates = {};
  if (nameChanged) updates.name = newName;
  if (newCategory !== (currentStore.category || '')) updates.category = newCategory;
  if (newDescription !== (currentStore.description || '')) updates.description = newDescription;
  if (newLocation !== (currentStore.location || '')) updates.location = newLocation;
  if (newWhatsapp !== (currentStore.whatsapp_number || '')) updates.whatsapp_number = newWhatsapp;
  if (newPhone !== (currentStore.phone_number || '')) updates.phone_number = newPhone;
  if (newLogo !== (currentStore.logo_url || '')) updates.logo_url = newLogo;
  if (newCover !== (currentStore.cover_url || '')) updates.cover_url = newCover;
  const now = Date.now();
  if (nameChanged) updates.last_name_update = now;
  if (otherChanged) updates.last_data_update = now;
  const submitBtn = $('storeSubmitBtn');
  submitBtn.dataset.saving = '1';
  setBtnLoad(submitBtn, true, 'جارٍ الحفظ...', '<i class="fas fa-save"></i> <span>حفظ التعديلات</span>');
  try {
    await db.collection(STORES).doc(currentStore.id).update(updates);
    currentStore = { ...currentStore, ...updates };
    updateHeaderLogo(currentStore);
    updateCooldownUI();
    showToast('✅ تم حفظ التعديلات بنجاح');
  } catch (err) {
    console.error('[Save]', err);
    showToast('فشل الحفظ: ' + mapFbError(err), 'error');
  } finally {
    submitBtn.dataset.saving = '';
    setBtnLoad(submitBtn, false, '', '<i class="fas fa-save"></i> <span>حفظ التعديلات</span>');
    updateCooldownUI();
  }
});

function getMainCat() { return currentStore && currentStore.category ? String(currentStore.category).trim() : ''; }
function isSubscribed() { return !!(currentStore && currentStore.is_subscribed === true); }
function getExtraCats() { if (!currentStore) return []; const main = getMainCat(); const arr = Array.isArray(currentStore.categories) ? currentStore.categories : []; return arr.map(c => String(c || '').trim()).filter(c => c && c.toLowerCase() !== main.toLowerCase()); }
function getMainProductsCount() { if (!currentStore || !productsData.length) return 0; const main = getMainCat(); if (!main) return 0; return productsData.filter(p => { const c = String(p.category || '').trim(); return !c || c === main; }).length; }

function populateProductCategories(preserve) {
  const sel = $('product_category'); if (!sel || !currentStore) return;
  const cur = preserve !== undefined ? preserve : sel.value;
  const main = getMainCat(), extras = getExtraCats(), sub = isSubscribed();
  sel.innerHTML = '';
  if (!main && extras.length === 0) { const o = document.createElement('option'); o.value = ''; o.textContent = '⚠️ لا توجد فئات'; sel.appendChild(o); sel.disabled = true; return; }
  sel.disabled = false;
  const ph = document.createElement('option'); ph.value = ''; ph.textContent = '— اختر الفئة —'; ph.disabled = true; sel.appendChild(ph);
  if (main) { const o = document.createElement('option'); o.value = main; o.textContent = '🟢 ' + main + ' (رئيسية)'; sel.appendChild(o); }
  extras.forEach(c => {
    const o = document.createElement('option'); o.value = c;
    if (sub) o.textContent = '⭐ ' + c; else { o.textContent = '🔒 ' + c; o.disabled = true; }
    sel.appendChild(o);
  });
  sel.value = cur || main || '';
}

async function loadMyProducts() {
  if (!currentStore) return;
  try {
    const snap = await db.collection(PRODUCTS).where('store_name', '==', currentStore.name).get();
    productsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    productsData.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
    updateProductsUI();
    setupProductsListener();
  } catch (err) {
    console.error('[Products]', err);
    $('productsList').innerHTML = '<div class="empty-state"><div class="empty-state-title" style="color:#EF4444;">تعذر تحميل المنتجات</div></div>';
  }
}

function setupProductsListener() {
  if (!currentStore) return;
  if (productsUnsubscribe) { productsUnsubscribe(); productsUnsubscribe = null; }
  productsUnsubscribe = db.collection(PRODUCTS).where('store_name', '==', currentStore.name).onSnapshot((snap) => {
    const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    fresh.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
    const fp = getFp(fresh);
    if (fp === lastProductsFingerprint) return;
    lastProductsFingerprint = fp;
    productsData = fresh;
    updateProductsUI();
  }, (err) => console.warn('Products listener:', err));
}

function updateProductsUI() {
  $('productsCount').textContent = productsData.length;
  $('productsCountBadge').textContent = productsData.length;
  $('ro_products_count').textContent = productsData.length;
  updateLimitsUI();
  renderProductsList();
}

function updateLimitsUI() {
  const c = $('categoryLimitsInfo'); if (!c || !currentStore) return;
  const main = getMainCat();
  const cnt = getMainProductsCount();
  const lim = PRODUCT_LIMITS.MAIN_CATEGORY_MAX;
  const pct = Math.min(100, Math.round(cnt / lim * 100));
  let color = '#10B981';
  if (cnt >= lim) color = '#EF4444';
  else if (cnt >= lim - PRODUCT_LIMITS.WARN_THRESHOLD) color = '#F59E0B';
  c.innerHTML = '<div style="background:#fff;border:1.5px solid ' + (cnt >= lim ? '#FECACA' : '#E5E7EB') + ';border-radius:.9rem;padding:.85rem;margin-bottom:.75rem;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><strong style="font-size:.85rem;">' + escapeHtml(main || 'الفئة الرئيسية') + '</strong><span style="font-size:.78rem;font-weight:900;color:' + color + ';">' + cnt + ' / ' + lim + '</span></div><div style="background:#F3F4F6;height:6px;border-radius:6px;overflow:hidden;"><div style="background:' + color + ';height:100%;width:' + pct + '%;border-radius:6px;"></div></div></div>';
  const b = $('mainLimitBadge'), t = $('mainLimitText');
  if (b && t && main) { t.textContent = cnt + '/' + lim; b.style.display = 'inline-flex'; }

  // ═══════════════════════════════════════════════════════
  // 🛡️ تعطيل زر "حفظ المنتج" عند بلوغ الحد (للإضافة الجديدة فقط)
  // ═══════════════════════════════════════════════════════
  const productSubmitBtn = $('productSubmitBtn');
  if (productSubmitBtn && !isSavingProduct) {
    const isEditing = !!(document.getElementById('product_id') && document.getElementById('product_id').value);
    const selectedCat = document.getElementById('product_category') ? document.getElementById('product_category').value : '';
    const atLimit = main && cnt >= lim;
    const isAddingToMain = !isEditing && selectedCat === main;
    if (atLimit && isAddingToMain) {
      productSubmitBtn.disabled = true;
      productSubmitBtn.style.opacity = '0.6';
      productSubmitBtn.style.cursor = 'not-allowed';
    } else if (!productSubmitBtn.dataset.saving) {
      productSubmitBtn.disabled = false;
      productSubmitBtn.style.opacity = '';
      productSubmitBtn.style.cursor = '';
    }
  }
}

function renderProductsList() {
  if (productsData.length === 0) {
    $('productsList').innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-box-open"></i></div><div class="empty-state-title">لا توجد منتجات</div><div class="empty-state-text">ابدأ بإضافة أول منتج</div></div>';
    return;
  }
  const main = getMainCat();
  let html = '';
  productsData.forEach(p => {
    const price = parseFloat(p.price || 0);
    const curr = getProductCurrency(p);
    const hasImg = p.img_url && String(p.img_url).trim();
    const thumb = hasImg ? '<img src="' + escapeHtml(p.img_url) + '" class="product-thumb" alt="" loading="lazy" decoding="async">' : '<div class="product-thumb product-thumb-placeholder"><i class="fas fa-box"></i></div>';
    const isMain = !p.category || String(p.category).trim() === main;
    const catBadge = isMain ? '<span class="product-category-badge" style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);color:#059669;border-color:#A7F3D0;"><i class="fas fa-star" style="font-size:.6rem;"></i> ' + escapeHtml(main || 'رئيسية') + '</span>' : (p.category ? '<span class="product-category-badge"><i class="fas fa-tag" style="font-size:.6rem;"></i> ' + escapeHtml(p.category) + '</span>' : '');
    html += '<div class="product-row">' + thumb + '<div class="product-info"><div class="product-name">' + escapeHtml(p.name) + '</div>' + (p.description ? '<div class="product-description">' + escapeHtml(p.description) + '</div>' : '') + '<div class="product-meta"><span class="product-price">' + price.toLocaleString() + ' ' + escapeHtml(curr.symbol) + '</span>' + catBadge + '</div></div><div class="product-actions"><button type="button" class="icon-btn icon-btn-edit" onclick="editProduct(\'' + p.id + '\')"><i class="fas fa-pen"></i></button><button type="button" class="icon-btn icon-btn-delete" onclick="deleteProduct(\'' + p.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
  });
  $('productsList').innerHTML = html;
  setTimeout(setupImageFallbacks, 50);
}

/* ═══════ صور الألوان - زر رفع فقط ═══════ */
function addColorRow(name, image) {
  const c = $('productColorsContainer'); if (!c) return;
  const row = document.createElement('div');
  row.className = 'color-row';
  const uid = 'ci_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
  row.innerHTML =
    '<div class="color-row-top">' +
      '<div class="color-dot-preview" title="اللون التلقائي"></div>' +
      '<input type="text" class="color-name" list="colorList" placeholder="اسم اللون" autocomplete="off" value="' + (name || '') + '">' +
      '<button type="button" class="remove-color-btn" aria-label="حذف اللون"><i class="fas fa-trash"></i></button>' +
    '</div>' +
    '<div class="color-image-upload-wrap">' +
      '<input type="hidden" id="' + uid + '" class="color-image" value="' + (image || '') + '">' +
      '<button type="button" class="color-upload-btn" data-upload-target="' + uid + '" aria-label="رفع صورة اللون">' +
        '<i class="fas fa-cloud-arrow-up"></i>' +
        '<span>رفع صورة اللون</span>' +
      '</button>' +
      '<div class="product-img-preview-wrapper hidden">' +
        '<img class="product-img-preview" alt="">' +
        '<button type="button" class="remove-img-btn" aria-label="حذف صورة اللون"><i class="fas fa-times"></i></button>' +
      '</div>' +
    '</div>';
  const nameInput = row.querySelector('.color-name');
  const dotPreview = row.querySelector('.color-dot-preview');
  const im = row.querySelector('.color-image');
  const wrapper = row.querySelector('.product-img-preview-wrapper');
  const previewImg = row.querySelector('.product-img-preview');
  const removeImgBtn = row.querySelector('.remove-img-btn');
  const removeRowBtn = row.querySelector('.remove-color-btn');
  const updateDotColor = () => { const colorHex = getColorHex(nameInput.value); dotPreview.style.background = colorHex; dotPreview.style.borderColor = colorHex === '#FFFFFF' ? '#D1D5DB' : colorHex; };
  const updateImagePreview = () => {
    const url = (im.value || '').trim();
    if (url) { previewImg.src = url; wrapper.classList.remove('hidden'); previewImg.onerror = () => { previewImg.src = FALLBACK_ICON_SVG; previewImg.onerror = null; }; }
    else { wrapper.classList.add('hidden'); previewImg.removeAttribute('src'); }
  };
  nameInput.addEventListener('input', updateDotColor);
  im.addEventListener('input', updateImagePreview);
  removeImgBtn.addEventListener('click', () => { im.value = ''; updateImagePreview(); im.dispatchEvent(new Event('input', { bubbles: true })); });
  removeRowBtn.addEventListener('click', () => row.remove());
  c.appendChild(row);
  updateDotColor();
  updateImagePreview();
}

const prodImgInput = $('product_img_url');
const prodImgWrapper = $('product_img_preview_wrapper');
const prodImgPreview = $('product_img_preview');
const removeProdImgBtn = $('removeProductImgBtn');

function updateMainImgPreview() {
  if (!prodImgInput || !prodImgWrapper || !prodImgPreview) return;
  const val = prodImgInput.value.trim();
  if (val) { prodImgPreview.src = val; prodImgWrapper.classList.remove('hidden'); prodImgPreview.onerror = () => { prodImgPreview.src = FALLBACK_ICON_SVG; prodImgPreview.onerror = null; }; }
  else { prodImgWrapper.classList.add('hidden'); prodImgPreview.removeAttribute('src'); }
}
if (prodImgInput) prodImgInput.addEventListener('input', updateMainImgPreview);
if (removeProdImgBtn) { removeProdImgBtn.addEventListener('click', () => { prodImgInput.value = ''; updateMainImgPreview(); prodImgInput.dispatchEvent(new Event('input', { bubbles: true })); }); }

if ($('addColorBtn')) $('addColorBtn').addEventListener('click', () => addColorRow());
if ($('product_description')) { $('product_description').addEventListener('input', (e) => { $('productDescCounter').textContent = e.target.value.length + ' / ' + PRODUCT_DESC_MAX; }); }

// ═══════════════════════════════════════════════════════
// 🛡️ مراقبة تغيير الفئة لتحديث حالة زر الحفظ فوراً
// ═══════════════════════════════════════════════════════
if ($('product_category')) {
  $('product_category').addEventListener('change', () => {
    if (!isSavingProduct) updateLimitsUI();
  });
}

$('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSavingProduct || !currentStore || !currentUser) return;
  const id = $('product_id').value;
  const name = sanitize($('product_name').value);
  const description = sanitize($('product_description').value).slice(0, PRODUCT_DESC_MAX);
  const price = toNumber($('product_price').value);
  const category = sanitize($('product_category').value);
  const rawCurrencySymbol = sanitize($('product_currency').value) || getStoreCurrency().symbol;
  const currencySymbol = normalizeCurrencySymbol(rawCurrencySymbol) || getStoreCurrency().symbol;
  if (!name) { showToast('اسم المنتج مطلوب', 'error'); return; }
  if (!category) { showToast('اختر الفئة', 'error'); return; }
  if (price <= 0) { showToast('السعر > صفر', 'error'); return; }

  // ═══════════════════════════════════════════════════════
  // 🛡️ التحقق من حد الفئة الرئيسية (15 منتج كحد أقصى)
  // ═══════════════════════════════════════════════════════
  const mainCat = getMainCat();
  if (mainCat && category === mainCat) {
    const mainCount = getMainProductsCount();
    let wouldExceed = false;
    if (id) {
      // حالة التعديل: اسمح إذا كان المنتج أصلاً في الفئة الرئيسية
      const existing = productsData.find(p => p.id === id);
      const wasInMain = !existing || !existing.category || String(existing.category).trim() === mainCat;
      wouldExceed = !wasInMain && mainCount >= PRODUCT_LIMITS.MAIN_CATEGORY_MAX;
    } else {
      // حالة الإضافة الجديدة: تحقق مباشر
      wouldExceed = mainCount >= PRODUCT_LIMITS.MAIN_CATEGORY_MAX;
    }
    if (wouldExceed) {
      showToast('⚠️ وصلت للحد الأقصى ' + PRODUCT_LIMITS.MAIN_CATEGORY_MAX + ' منتج في الفئة الرئيسية', 'error');
      return;
    }
  }

  const colors = [];
  document.querySelectorAll('#productColorsContainer .color-row').forEach((r) => {
    const cn = sanitize(r.querySelector('.color-name').value);
    const ci = sanitize(r.querySelector('.color-image').value);
    if (cn) colors.push({ name: cn, image: ci });
  });
  const data = { name, description, category, store_name: currentStore.name, store_id: currentStore.id, owner_uid: currentUser.uid, price, currency: currencySymbol, img_url: sanitize($('product_img_url').value), colors: colors.length > 0 ? colors : null };
  isSavingProduct = true;
  setBtnLoad($('productSubmitBtn'), true, id ? 'جارٍ التعديل...' : 'جارٍ الحفظ...', '<i class="fas fa-save"></i> <span>حفظ</span>');
  try {
    if (id) {
      const ex = await db.collection(PRODUCTS).doc(id).get();
      if (!ex.exists || ex.data().store_name !== currentStore.name) throw new Error('no_permission');
      await db.collection(PRODUCTS).doc(id).update(data);
      showToast('تم تعديل المنتج ✅');
    } else {
      data.created_at = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection(PRODUCTS).add(data);
      showToast('تمت إضافة المنتج ✅');
    }
    resetProductForm();
  } catch (err) { console.error('[Product save]', err); showToast('فشل: ' + mapFbError(err), 'error'); }
  finally { isSavingProduct = false; setBtnLoad($('productSubmitBtn'), false, '', '<i class="fas fa-save"></i> <span>حفظ</span>'); updateLimitsUI(); }
});

function resetProductForm() {
  $('productForm').reset();
  $('product_id').value = '';
  $('productFormTitle').textContent = 'إضافة منتج جديد';
  $('cancelEditProduct').classList.add('hidden');
  if (prodImgWrapper) prodImgWrapper.classList.add('hidden');
  if (prodImgPreview) prodImgPreview.removeAttribute('src');
  $('productColorsContainer').innerHTML = '';
  $('productDescCounter').textContent = '0 / ' + PRODUCT_DESC_MAX;
  updateProductCurrencyDisplay(getStoreCurrency());
  populateProductCategories('');
  updateLimitsUI();
}
if ($('cancelEditProduct')) $('cancelEditProduct').addEventListener('click', resetProductForm);

window.editProduct = async (id) => {
  try {
    const s = await db.collection(PRODUCTS).doc(id).get();
    if (!s.exists || s.data().store_name !== currentStore.name) throw new Error('no_permission');
    const d = { id: s.id, ...s.data() };
    $('product_id').value = d.id;
    $('product_name').value = d.name || '';
    $('product_description').value = d.description || '';
    $('product_price').value = d.price || 0;
    $('product_img_url').value = d.img_url || '';
    $('productDescCounter').textContent = (d.description || '').length + ' / ' + PRODUCT_DESC_MAX;
    populateProductCategories(d.category || '');
    const prodCurr = getProductCurrency(d);
    updateProductCurrencyDisplay(prodCurr);
    updateMainImgPreview();
    $('productColorsContainer').innerHTML = '';
    if (Array.isArray(d.colors)) d.colors.forEach(x => addColorRow(x.name, x.image));
    $('productFormTitle').textContent = 'تعديل: ' + d.name;
    $('cancelEditProduct').classList.remove('hidden');
    $('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateLimitsUI();
  } catch (err) { showToast('فشل: ' + mapFbError(err), 'error'); }
};

window.deleteProduct = async (id) => {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
  try {
    const s = await db.collection(PRODUCTS).doc(id).get();
    if (!s.exists || s.data().store_name !== currentStore.name) throw new Error('no_permission');
    await db.collection(PRODUCTS).doc(id).delete();
    showToast('تم حذف المنتج ✅');
  } catch (err) { showToast('فشل: ' + mapFbError(err), 'error'); }
};

$('tabStore').addEventListener('click', () => { $('tabStore').classList.add('active'); $('tabProducts').classList.remove('active'); $('storeSection').classList.remove('hidden'); $('productsSection').classList.add('hidden'); });
$('tabProducts').addEventListener('click', () => { $('tabProducts').classList.add('active'); $('tabStore').classList.remove('active'); $('productsSection').classList.remove('hidden'); $('storeSection').classList.add('hidden'); populateProductCategories(); loadMyProducts(); updateLimitsUI(); });

['store_logo', 'store_cover'].forEach((id) => {
  const inp = $(id); if (!inp) return;
  inp.addEventListener('input', (e) => {
    const p = $(id + '_preview'); if (!p) return;
    if (e.target.value) { p.src = e.target.value; p.classList.remove('hidden'); p.onerror = () => { p.src = FALLBACK_ICON_SVG; p.onerror = null; }; }
    else p.classList.add('hidden');
  });
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-upload-target]');
  if (!btn) return;
  e.preventDefault();
  const targetId = btn.getAttribute('data-upload-target');
  const target = document.getElementById(targetId);
  if (!target) return;
  const fi = document.createElement('input');
  fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
  fi.addEventListener('change', async () => {
    const file = fi.files && fi.files[0];
    if (!file) { fi.remove(); return; }
    if (!file.type.startsWith('image/')) { showToast('❌ يجب اختيار صورة', 'error'); fi.remove(); return; }
    if (file.size > 8 * 1024 * 1024) { showToast('❌ الحجم أكبر من 8 ميجا', 'error'); fi.remove(); return; }
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      fd.append('folder', 'branzar/stores');
      const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/image/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('upload_failed');
      const data = await res.json();
      if (!data.secure_url) throw new Error('no_url');
      target.value = data.secure_url;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      showToast('✅ تم رفع الصورة');
    } catch (err) { console.error('[Upload]', err); showToast('❌ فشل الرفع', 'error'); }
    finally { btn.disabled = false; btn.innerHTML = origHTML; fi.remove(); }
  });
  document.body.appendChild(fi);
  fi.click();
});

if ($('supportFloat')) $('supportFloat').addEventListener('click', () => openSupportChat('general'));

console.log('%c🔥 BranZar v11.1 — Main Category Limit: 15','color:#FF7A00;font-weight:bold;font-size:14px');
