/* ═══════════════════════════════════════════════════════════
   BranZar v9.8.3 — ui.js
   Layer 3: UI + Theme + View + Search + Render + Modals + Cart + PWA + SW
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═══ THEME ═══ */
function applyTheme(theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  const mainIcon = document.querySelector('#themeToggleBtn i');
  if (mainIcon) mainIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  const accountSwitch = document.getElementById('accountThemeSwitch');
  if (accountSwitch) accountSwitch.classList.toggle('on', theme === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0F172A' : '#FF7A00');
}
function initTheme() {
  const saved = localStorage.getItem(KEYS.THEME);
  if (saved) { applyTheme(saved); return; }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}
function toggleTheme() {
  const current = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(KEYS.THEME, next);
  haptic('light');
}
document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
document.getElementById('accountThemeSwitch')?.addEventListener('click', toggleTheme);
document.getElementById('accountThemeSwitch')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
});

/* ═══ VIEW MODE ═══ */
function applyViewMode(mode) {
  document.body.classList.remove('view-mobile','view-desktop');
  document.body.classList.add('view-' + mode);
  $$('.view-toggle-pill button').forEach(b => b.classList.toggle('active', b.dataset.view === mode));
  localStorage.setItem(KEYS.VIEW, mode);
}
function initViewMode() {
  const saved = localStorage.getItem(KEYS.VIEW);
  if (saved) { applyViewMode(saved); return; }
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)
    || window.matchMedia('(max-width: 767px)').matches;
  applyViewMode(isMobile ? 'mobile' : 'desktop');
}
function setView(mode) { applyViewMode(mode); haptic('light'); }
document.getElementById('viewMobileBtn')?.addEventListener('click', () => setView('mobile'));
document.getElementById('viewDesktopBtn')?.addEventListener('click', () => setView('desktop'));
document.getElementById('accountViewMobileBtn')?.addEventListener('click', () => setView('mobile'));
document.getElementById('accountViewDesktopBtn')?.addEventListener('click', () => setView('desktop'));

/* ═══ AUTO-SCROLL ═══ */
let isHoveringStores = false;
let lastStoresInteraction = 0;
let _scrollRAFId = null;
let _lastScrollFrame = 0;

let isHoveringCategories = false;
let lastCategoriesInteraction = 0;
let _catScrollRAFId = null;
let _lastCatScrollFrame = 0;

function getStoresMaxScroll() {
  const c = document.getElementById('storesScrollContainer');
  return c ? Math.max(0, c.scrollWidth - c.clientWidth) : 0;
}
function getCategoriesMaxScroll() {
  const c = document.getElementById('categoriesContainer');
  return c ? Math.max(0, c.scrollWidth - c.clientWidth) : 0;
}
function _autoScrollLoop(ts) {
  const c = document.getElementById('storesScrollContainer');
  if (!c) { _scrollRAFId = null; return; }
  if (!isPageVisible) { _scrollRAFId = requestAnimationFrame(_autoScrollLoop); return; }
  if (isHoveringStores || (Date.now() - lastStoresInteraction < CONFIG.AUTO_SCROLL_RESUME)) {
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop); return;
  }
  if (ts - _lastScrollFrame < CONFIG.AUTO_SCROLL_INTERVAL) {
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop); return;
  }
  _lastScrollFrame = ts;
  const max = getStoresMaxScroll();
  if (max <= 0) { _scrollRAFId = null; return; }
  if (c.scrollLeft <= 1) c.scrollLeft = max;
  else c.scrollLeft -= CONFIG.SCROLL_STEP;
  _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
}
function startAutoScroll() {
  stopAutoScroll();
  const c = document.getElementById('storesScrollContainer');
  if (!c) return;
  requestAnimationFrame(() => {
    const max = getStoresMaxScroll();
    c.scrollLeft = max;
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
  });
}
function stopAutoScroll() {
  if (_scrollRAFId) { cancelAnimationFrame(_scrollRAFId); _scrollRAFId = null; }
}
function _categoriesAutoScrollLoop(ts) {
  const c = document.getElementById('categoriesContainer');
  if (!c) { _catScrollRAFId = null; return; }
  if (!isPageVisible) { _catScrollRAFId = requestAnimationFrame(_categoriesAutoScrollLoop); return; }
  if (isHoveringCategories || (Date.now() - lastCategoriesInteraction < CONFIG.AUTO_SCROLL_RESUME)) {
    _catScrollRAFId = requestAnimationFrame(_categoriesAutoScrollLoop); return;
  }
  if (ts - _lastCatScrollFrame < CONFIG.AUTO_SCROLL_INTERVAL) {
    _catScrollRAFId = requestAnimationFrame(_categoriesAutoScrollLoop); return;
  }
  _lastCatScrollFrame = ts;
  const max = getCategoriesMaxScroll();
  if (max <= 0) { _catScrollRAFId = null; return; }
  if (c.scrollLeft <= 1) c.scrollLeft = max;
  else c.scrollLeft -= CONFIG.SCROLL_STEP;
  _catScrollRAFId = requestAnimationFrame(_categoriesAutoScrollLoop);
}
function startCategoriesAutoScroll() {
  stopCategoriesAutoScroll();
  const c = document.getElementById('categoriesContainer');
  if (!c) return;
  requestAnimationFrame(() => {
    const max = getCategoriesMaxScroll();
    c.scrollLeft = max;
    _catScrollRAFId = requestAnimationFrame(_categoriesAutoScrollLoop);
  });
}
function stopCategoriesAutoScroll() {
  if (_catScrollRAFId) { cancelAnimationFrame(_catScrollRAFId); _catScrollRAFId = null; }
}

/* ═══ BODY SCROLL LOCK ═══ */
function updateBodyScroll() {
  const anyOpen = !document.getElementById('storeModal').classList.contains('hidden') ||
                  !document.getElementById('productModal').classList.contains('hidden') ||
                  document.getElementById('cartSidebar').classList.contains('open') ||
                  !document.getElementById('accountModal').classList.contains('hidden') ||
                  !document.getElementById('createStoreModal').classList.contains('hidden');
  document.body.style.overflow = anyOpen ? 'hidden' : '';
  document.body.classList.toggle('modal-open', anyOpen);
}

/* ═══ ANDROID BACK ═══ */
let _ignoreNextPop = false;
function bzrPushModal() { try { history.pushState({ bzrModal: Date.now() }, ''); } catch(e){} }
function bzrCloseModalUI() {
  if (history.state && history.state.bzrModal) {
    _ignoreNextPop = true;
    try { history.back(); } catch(e){ _ignoreNextPop = false; }
  }
}
function closeTopmostModal() {
  if (!document.getElementById('productModal').classList.contains('hidden')) { closeProductModalInternal(); return true; }
  if (!document.getElementById('createStoreModal').classList.contains('hidden')) { createStoreModal.classList.add('hidden'); updateBodyScroll(); return true; }
  if (!document.getElementById('accountModal').classList.contains('hidden')) { closeAccountModalInternal(); return true; }
  if (!document.getElementById('storeModal').classList.contains('hidden')) { closeStoreModalInternal(); return true; }
  if (document.getElementById('cartSidebar').classList.contains('open')) { closeCartInternal(); return true; }
  return false;
}
window.addEventListener('popstate', () => {
  if (_ignoreNextPop) { _ignoreNextPop = false; return; }
  closeTopmostModal();
});

/* ═══ BOTTOM NAV ═══ */
const bottomNav = document.getElementById('bzrBottomNav');
const bottomNavBadge = document.getElementById('bottomNavCartBadge');
function setActiveNav(nav) {
  if (!bottomNav) return;
  bottomNav.querySelectorAll('.bzr-nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === nav));
}
bottomNav?.addEventListener('click', (e) => {
  const btn = e.target.closest('.bzr-nav-item');
  if (!btn) return;
  haptic('light');
  const nav = btn.dataset.nav;
  if (nav === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveNav('home'); }
  else if (nav === 'categories') {
    const sec = document.getElementById('categories');
    if (sec) { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveNav('categories'); }
  }
  else if (nav === 'cart') { openCart(); }
  else if (nav === 'account') { openAccountModal(); }
});
function updateBottomNavBadge() {
  if (!bottomNavBadge) return;
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  if (total > 0) { bottomNavBadge.textContent = total > 99 ? '99+' : total; bottomNavBadge.style.display = 'flex'; }
  else bottomNavBadge.style.display = 'none';
}

/* ═══ ACCOUNT MODAL ═══ */
const accountModal = document.getElementById('accountModal');
const createStoreModal = document.getElementById('createStoreModal');
function openAccountModal() { accountModal.classList.remove('hidden'); updateBodyScroll(); haptic('light'); bzrPushModal(); }
function closeAccountModalInternal() { accountModal.classList.add('hidden'); updateBodyScroll(); }
function closeAccountModal() { closeAccountModalInternal(); bzrCloseModalUI(); }
document.getElementById('closeAccountModal')?.addEventListener('click', closeAccountModal);
document.getElementById('accountOverlay')?.addEventListener('click', closeAccountModal);
document.getElementById('openCreateStoreBtn')?.addEventListener('click', () => { haptic('medium'); createStoreModal.classList.remove('hidden'); updateBodyScroll(); bzrPushModal(); });
document.getElementById('cancelCreateStore')?.addEventListener('click', () => { createStoreModal.classList.add('hidden'); updateBodyScroll(); bzrCloseModalUI(); });
createStoreModal?.addEventListener('click', (e) => {
  if (e.target === createStoreModal) { createStoreModal.classList.add('hidden'); updateBodyScroll(); bzrCloseModalUI(); }
});
document.getElementById('logoMenuBtn')?.addEventListener('click', () => { haptic('light'); window.scrollTo({ top: 0, behavior: 'smooth' }); });

/* ═══════════════════════════════════════════════════════════
   📱 PWA INSTALL — Enhanced Multi-Platform
   ═══════════════════════════════════════════════════════════ */
let deferredPrompt = null;
const INSTALL_DISMISS_KEY = 'branzar_install_dismissed_v2';
const INSTALL_DISMISS_DAYS = 3;

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || document.referrer.indexOf('android-app://') === 0;
}
function isIOS() {
  const ua = navigator.userAgent || '';
  const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return /iPhone|iPod/i.test(ua) || isIPad;
}
function isFirefox() { return /Firefox/i.test(navigator.userAgent); }
function wasInstallDismissed() {
  try {
    const dismissed = parseInt(localStorage.getItem(INSTALL_DISMISS_KEY) || '0');
    if (!dismissed) return false;
    const daysPassed = (Date.now() - dismissed) / (1000 * 60 * 60 * 24);
    return daysPassed < INSTALL_DISMISS_DAYS;
  } catch(e) { return false; }
}
function markInstallDismissed() { try { localStorage.setItem(INSTALL_DISMISS_KEY, Date.now().toString()); } catch(e){} }
function clearInstallDismissed() { try { localStorage.removeItem(INSTALL_DISMISS_KEY); } catch(e){} }
function isAppInstalled() { return isStandaloneMode() || localStorage.getItem(KEYS.INSTALLED) === 'true'; }
function showInstallButton() {
  const btn = document.getElementById('installButtonFloating');
  if (!btn) return;
  btn.classList.remove('hidden');
  requestAnimationFrame(() => btn.classList.add('show'));
}
function hideInstallButton() {
  const btn = document.getElementById('installButtonFloating');
  if (!btn) return;
  btn.classList.remove('show');
  setTimeout(() => btn.classList.add('hidden'), 350);
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (isStandaloneMode()) return;
  if (localStorage.getItem(KEYS.INSTALLED) === 'true') return;
  if (wasInstallDismissed()) return;
  showInstallButton();
});
window.addEventListener('appinstalled', () => {
  try { localStorage.setItem(KEYS.INSTALLED, 'true'); } catch(e){}
  clearInstallDismissed();
  hideInstallButton();
  deferredPrompt = null;
  showToast('✅ تم تثبيت التطبيق بنجاح!');
  haptic('heavy');
});
function showIOSInstallInstructions() {
  let modal = document.getElementById('iosInstallModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'iosInstallModal';
    modal.className = 'pwa-ios-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="pwa-ios-overlay"></div>' +
      '<div class="pwa-ios-sheet">' +
        '<div class="pwa-ios-handle"></div>' +
        '<h3 class="pwa-ios-title">📱 تثبيت التطبيق على iPhone</h3>' +
        '<p class="pwa-ios-desc">لتثبيت BranZar كتطبيق على جهازك، اتبع الخطوات التالية:</p>' +
        '<ol class="pwa-ios-steps">' +
          '<li>' +
            '<span class="pwa-ios-step-num">1</span>' +
            '<div>' +
              '<strong>اضغط زر المشاركة</strong>' +
              '<span>في شريط Safari السفلي</span>' +
            '</div>' +
            '<i class="fas fa-share-square" style="font-size:1.3rem;color:#007AFF;"></i>' +
          '</li>' +
          '<li>' +
            '<span class="pwa-ios-step-num">2</span>' +
            '<div>' +
              '<strong>اختر "إضافة إلى الشاشة الرئيسية"</strong>' +
              '<span>Add to Home Screen</span>' +
            '</div>' +
            '<i class="fas fa-plus-square" style="font-size:1.3rem;color:#FF7A00;"></i>' +
          '</li>' +
          '<li>' +
            '<span class="pwa-ios-step-num">3</span>' +
            '<div>' +
              '<strong>اضغط "إضافة"</strong>' +
              '<span>سيظهر التطبيق على شاشتك الرئيسية</span>' +
            '</div>' +
            '<i class="fas fa-check-circle" style="font-size:1.3rem;color:#10B981;"></i>' +
          '</li>' +
        '</ol>' +
        '<button id="pwaIosCloseBtn" class="pwa-ios-close">فهمت، شكراً</button>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('.pwa-ios-overlay').addEventListener('click', closeIOSInstructions);
    document.getElementById('pwaIosCloseBtn').addEventListener('click', closeIOSInstructions);
  }
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  haptic('medium');
}
function closeIOSInstructions() {
  const modal = document.getElementById('iosInstallModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
  markInstallDismissed();
  hideInstallButton();
}
document.getElementById('installButtonFloating')?.addEventListener('click', async () => {
  haptic('medium');
  if (isStandaloneMode()) {
    showToast('✅ التطبيق مثبت بالفعل');
    hideInstallButton();
    return;
  }
  if (isIOS() && !deferredPrompt) {
    showIOSInstallInstructions();
    return;
  }
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        try { localStorage.setItem(KEYS.INSTALLED, 'true'); } catch(e){}
        showToast('🎉 جاري تثبيت التطبيق...');
        hideInstallButton();
      } else {
        markInstallDismissed();
        hideInstallButton();
        showToast('يمكنك التثبيت لاحقاً من القائمة');
      }
      deferredPrompt = null;
    } catch(err) {
      console.warn('[BZR] Install prompt error:', err);
      showToast('تعذر بدء التثبيت، حاول مرة أخرى');
    }
    return;
  }
  if (isFirefox()) {
    showToast('لتثبيت التطبيق، استخدم Chrome أو Edge');
    return;
  }
  showToast('التثبيت غير متاح على هذا المتصفح');
});
function maybeShowIOSButton() {
  if (isStandaloneMode()) return;
  if (!isIOS()) return;
  if (wasInstallDismissed()) return;
  if (localStorage.getItem(KEYS.INSTALLED) === 'true') return;
  setTimeout(() => { if (!isStandaloneMode()) showInstallButton(); }, 8000);
}
if (isStandaloneMode()) {
  try { localStorage.setItem(KEYS.INSTALLED, 'true'); } catch(e){}
  hideInstallButton();
}

/* ═══ NOTIFICATIONS (FCM) ═══ */
let messaging = null;
function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}
async function initFCM() {
  try {
    if (!isNotificationSupported()) return;
    messaging = firebase.messaging();
    const reg = await navigator.serviceWorker.ready;
    messaging.onMessage((payload) => {
      const title = (payload.notification && payload.notification.title) || 'إشعار جديد';
      const body = (payload.notification && payload.notification.body) || 'لديك جديد في BranZar';
      showPushToast(title, body);
      if (Notification.permission === 'granted') {
        try {
          const n = new Notification(title, {
            body,
            icon: (payload.notification && payload.notification.icon) || CONFIG.DEFAULT_OG_IMAGE,
            dir: 'rtl', lang: 'ar',
            tag: (payload.data && payload.data.tag) || 'branzar-fg'
          });
          n.onclick = () => {
            window.focus();
            window.location.href = (payload.data && payload.data.url) || 'https://branzar.vercel.app';
            n.close();
          };
        } catch(e){}
      }
    });
    if (Notification.permission === 'granted') await registerFCMToken(reg);
    else if (shouldShowNotifBanner()) setTimeout(showNotifBanner, 12000);
  } catch(err){ console.warn('FCM:', err); }
}
function shouldShowNotifBanner() {
  if (!isNotificationSupported()) return false;
  const perm = Notification.permission;
  if (perm === 'granted' || perm === 'denied') return false;
  const dismissed = parseInt(localStorage.getItem(KEYS.NOTIF_DISMISS) || '0');
  if (dismissed && (Date.now() - dismissed) < CONFIG.NOTIF_DISMISS_DAYS * 24 * 60 * 60 * 1000) return false;
  return true;
}
function showNotifBanner() {
  const b = document.getElementById('notifPermissionBanner');
  if (!b) return;
  b.classList.remove('hidden');
  requestAnimationFrame(() => setTimeout(() => b.classList.add('show'), 50));
}
function hideNotifBanner() {
  const b = document.getElementById('notifPermissionBanner');
  if (!b) return;
  b.classList.remove('show');
  setTimeout(() => b.classList.add('hidden'), 600);
}
async function registerFCMToken(reg) {
  try {
    const token = await messaging.getToken({ vapidKey: CONFIG.VAPID, serviceWorkerRegistration: reg });
    if (!token) return null;
    localStorage.setItem(KEYS.FCM_TOKEN, token);
    const prev = localStorage.getItem(KEYS.FCM_TOKEN + '_saved');
    if (prev !== token) {
      await db.collection('fcm_tokens').doc(token).set({
        token,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        active: true
      }, { merge: true });
      localStorage.setItem(KEYS.FCM_TOKEN + '_saved', token);
    }
    return token;
  } catch(err){ return null; }
}
function showPushToast(title, body) {
  const t = document.getElementById('pushToast');
  if (!t) return;
  document.getElementById('pushToastTitle').textContent = title;
  document.getElementById('pushToastBody').textContent = body;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5000);
}
document.getElementById('enableNotifBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('enableNotifBtn'); btn.disabled = true;
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      await registerFCMToken(reg);
      hideNotifBanner(); showToast('✅ تم تفعيل الإشعارات'); haptic('medium');
    } else { hideNotifBanner(); localStorage.setItem(KEYS.NOTIF_DISMISS, Date.now().toString()); }
  } catch(err){}
  btn.disabled = false;
});
document.getElementById('dismissNotifBtn')?.addEventListener('click', () => {
  hideNotifBanner(); localStorage.setItem(KEYS.NOTIF_DISMISS, Date.now().toString());
});

/* ═══ SEARCH ═══ */
const searchInput = document.getElementById('searchInput');
const searchWrapper = document.getElementById('bzrSearchWrapper');
const searchResults = document.getElementById('searchResults');
const searchClearBtn = document.getElementById('searchClearBtn');
const performSearchDebounced = debounce(performSearch, CONFIG.SEARCH_DEBOUNCE_MS);

searchInput?.addEventListener('input', (e) => {
  if (searchInput.value.trim()) searchWrapper.classList.add('has-value');
  else searchWrapper.classList.remove('has-value');
  performSearchDebounced(e.target.value);
});
searchInput?.addEventListener('focus', () => { if (searchInput.value.trim()) performSearch(searchInput.value); });
searchClearBtn?.addEventListener('click', () => {
  searchInput.value = '';
  searchWrapper.classList.remove('has-value');
  searchResults.classList.remove('show');
  searchInput.focus();
});
document.addEventListener('click', (e) => {
  if (!searchResults.contains(e.target) && !searchWrapper.contains(e.target)) searchResults.classList.remove('show');
});
function performSearch(query) {
  query = (query || '').trim().toLowerCase().slice(0, 100);
  if (!query) { searchResults.classList.remove('show'); return; }
  const searchPool = allProductsLocal.slice(0, CONFIG.SEARCH_CAP);
  const matchedCats = categories.filter(c => c.toLowerCase().indexOf(query) > -1);
  const matchedStores = stores.filter(s =>
    (s.name || '').toLowerCase().indexOf(query) > -1 ||
    (s.category || '').toLowerCase().indexOf(query) > -1
  );
  const matchedProducts = searchPool.filter(p =>
    (p.name || '').toLowerCase().indexOf(query) > -1 ||
    (p.store_name || '').toLowerCase().indexOf(query) > -1
  ).slice(0, 8);
  searchResults.innerHTML = '';
  if (!matchedCats.length && !matchedStores.length && !matchedProducts.length) {
    searchResults.innerHTML = '<div style="text-align:center;padding:2rem 0;color:var(--c-text-soft);"><i class="fas fa-search" style="font-size:2rem;margin-bottom:0.5rem;display:block;color:#CBD5E1;"></i><p style="font-weight:700;">لا توجد نتائج</p></div>';
    searchResults.classList.add('show'); return;
  }
  if (matchedCats.length) {
    const title = document.createElement('p');
    title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:0 0 10px;';
    title.textContent = 'الفئات';
    searchResults.appendChild(title);
    const chips = document.createElement('div');
    chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;';
    matchedCats.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = cat;
      chip.addEventListener('click', () => {
        searchResults.classList.remove('show');
        searchInput.value = '';
        searchWrapper.classList.remove('has-value');
        goToCategory(cat);
      });
      chips.appendChild(chip);
    });
    searchResults.appendChild(chips);
  }
  if (matchedStores.length) {
    const title = document.createElement('p');
    title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:0 0 10px;';
    title.textContent = 'المتاجر (' + matchedStores.length + ')';
    searchResults.appendChild(title);
    matchedStores.slice(0, 5).forEach(store => searchResults.appendChild(createSearchStoreRow(store)));
  }
  if (matchedProducts.length) {
    const title = document.createElement('p');
    title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:14px 0 10px;';
    title.textContent = 'المنتجات (' + matchedProducts.length + ')';
    searchResults.appendChild(title);
    matchedProducts.forEach(p => searchResults.appendChild(createSearchProductRow(p)));
  }
  searchResults.classList.add('show');
}
function createSearchStoreRow(store) {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;cursor:pointer;transition:background 0.2s;';
  row.onmouseover = () => row.style.background = 'var(--c-surface-2)';
  row.onmouseout = () => row.style.background = '';
  const img = document.createElement('img');
  img.style.cssText = 'width:42px;height:42px;border-radius:50%;object-fit:cover;background:var(--c-surface-2);flex-shrink:0;';
  img.src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
  const nm = document.createElement('div');
  nm.style.cssText = 'font-weight:800;font-size:0.88rem;color:var(--c-text);display:flex;align-items:center;gap:4px;';
  if (store.is_verified) {
    const v = document.createElement('span');
    v.className = 'verified-icon';
    v.innerHTML = VERIFIED_BADGE_SVG;
    nm.appendChild(v);
  }
  const nameText = document.createElement('span'); nameText.textContent = store.name || ''; nm.appendChild(nameText);
  const meta = document.createElement('div');
  meta.style.cssText = 'font-size:0.72rem;color:var(--c-text-soft);margin-top:2px;';
  meta.textContent = (store.category || 'عام');
  info.appendChild(nm); info.appendChild(meta);
  const arrow = document.createElement('i');
  arrow.className = 'fas fa-chevron-left';
  arrow.style.cssText = 'color:var(--c-text-soft);font-size:0.75rem;';
  row.appendChild(img); row.appendChild(info); row.appendChild(arrow);
  row.addEventListener('click', () => {
    searchResults.classList.remove('show');
    searchInput.value = '';
    searchWrapper.classList.remove('has-value');
    openStoreModal(store);
  });
  return row;
}
function createSearchProductRow(product) {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;cursor:pointer;';
  row.onmouseover = () => row.style.background = 'var(--c-surface-2)';
  row.onmouseout = () => row.style.background = '';
  const img = document.createElement('img');
  img.style.cssText = 'width:42px;height:42px;border-radius:10px;object-fit:contain;background:var(--c-surface-2);padding:4px;flex-shrink:0;';
  img.src = optimizeCloudinaryUrl(product.img_url) || 'https://via.placeholder.com/100';
  const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
  const nm = document.createElement('div');
  nm.style.cssText = 'font-weight:800;font-size:0.88rem;color:var(--c-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
  nm.textContent = product.name || '';
  const meta = document.createElement('div');
  meta.style.cssText = 'font-size:0.72rem;color:#FF7A00;margin-top:2px;font-weight:800;';
  meta.textContent = (parseFloat(product.price) || 0).toLocaleString() + ' ج.س';
  info.appendChild(nm); info.appendChild(meta);
  row.appendChild(img); row.appendChild(info);
  row.addEventListener('click', () => {
    searchResults.classList.remove('show');
    searchInput.value = '';
    searchWrapper.classList.remove('has-value');
    openProductModal({
      id: product.id, name: product.name, img_url: product.img_url,
      price: parseFloat(product.price) || 0,
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      store_name: product.store_name,
      description: product.description || '',
      colors: product.colors || null,
      category: product.category || null
    });
  });
  return row;
}
function goToCategory(cat) {
  currentCategory = cat;
  filterStoresByCategory(cat);
  const btns = Array.from(document.getElementById('categoriesContainer').querySelectorAll('button'));
  const target = btns.find(b => b.textContent.trim() === cat);
  if (target) highlightCategory(target);
  applyProductsFilter(cat);
  const s = document.getElementById('stores');
  if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══ RENDER STORES ═══ */
function displayStores() {
  const c = document.getElementById('storesScrollContainer');
  c.innerHTML = '';
  const frag = document.createDocumentFragment();
  stores.forEach(s => frag.appendChild(createStoreCard(s)));
  c.appendChild(frag);
}
function createStoreCard(store) {
  const storeId = getStoreId(store);
  const followed = isStoreFollowed(storeId);
  const card = document.createElement('div'); card.className = 'store-card';
  const cover = document.createElement('img'); cover.className = 'cover-image'; cover.loading = 'lazy'; cover.alt = store.name || '';
  cover.src = optimizeCloudinaryUrl(store.cover_url) || 'https://via.placeholder.com/600x300/FF7A00/FFFFFF?text=Cover';
  cover.onerror = function(){ this.src = 'https://via.placeholder.com/600x300/FF7A00/FFFFFF?text=Cover'; };
  const logo = document.createElement('img'); logo.className = 'store-logo'; logo.loading = 'lazy'; logo.alt = '';
  logo.src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  logo.onerror = function(){ this.src = 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store'; };
  const info = document.createElement('div'); info.className = 'store-info';
  const nameRow = document.createElement('div'); nameRow.className = 'store-name';
  if (store.is_verified) {
    const v = document.createElement('span'); v.className = 'verified-icon'; v.innerHTML = VERIFIED_BADGE_SVG;
    nameRow.appendChild(v);
  }
  const nameText = document.createElement('span'); nameText.textContent = store.name || ''; nameRow.appendChild(nameText);
  const catRow = document.createElement('div'); catRow.className = 'store-category'; catRow.textContent = store.category || 'عام';
  const bottomRow = document.createElement('div');
  bottomRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;';
  const followBtn = document.createElement('button');
  followBtn.style.cssText = 'background:#FF7A00;color:#fff;border:1.5px solid #FF7A00;border-radius:9999px;padding:0.3rem 0.7rem;font-size:0.7rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all 0.25s;white-space:nowrap;';
  followBtn.dataset.storeId = storeId;
  setCardFollowState(followBtn, followed);
  followBtn.addEventListener('click', (e) => {
    e.stopPropagation(); e.preventDefault(); haptic('light');
    toggleFollowFromCard(store, followBtn);
  });
  const shareBtn = document.createElement('button');
  shareBtn.style.cssText = 'width:30px;height:30px;border-radius:50%;background:var(--c-primary-soft);color:#FF7A00;border:1.5px solid #FFE0BD;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;transition:all 0.25s;padding:0;';
  shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation(); e.preventDefault(); haptic('light'); shareStore(store);
  });
  bottomRow.appendChild(followBtn); bottomRow.appendChild(shareBtn);
  info.appendChild(nameRow); info.appendChild(catRow); info.appendChild(bottomRow);
  card.appendChild(cover); card.appendChild(logo); card.appendChild(info);
  card.addEventListener('click', () => { haptic('light'); openStoreModal(store); });
  return card;
}
function setCardFollowState(btn, following) {
  btn.classList.toggle('following', following);
  btn.innerHTML = following
    ? '<i class="fas fa-check"></i><span>متابَع</span>'
    : '<i class="fas fa-plus"></i><span>متابعة</span>';
  if (following) { btn.style.background = 'transparent'; btn.style.color = '#FF7A00'; }
  else { btn.style.background = '#FF7A00'; btn.style.color = '#fff'; }
}
async function toggleFollowFromCard(store, btn) {
  const storeId = String(getStoreId(store));
  if (btn.disabled) return;
  const guardCheck = FollowGuard.canFollow(storeId);
  if (!guardCheck.allowed) {
    haptic('heavy');
    showToast(guardCheck.message);
    btn.classList.add('blocked-flash');
    setTimeout(() => btn.classList.remove('blocked-flash'), 600);
    return;
  }
  btn.disabled = true;
  haptic('light');
  try {
    const result = await performFollowToggle(store);
    FollowGuard.recordAction(storeId);
    const action = result.action;
    const wasFollowing = (action === 'unfollowed');
    if (wasFollowing) _followedFromServer.delete(storeId);
    else _followedFromServer.add(storeId);
    const list = getFollowedStores();
    if (wasFollowing) {
      const i = list.indexOf(storeId);
      if (i > -1) list.splice(i, 1);
      store.followers = Math.max(0, (parseInt(store.followers) || 0) - 1);
    } else {
      if (list.indexOf(storeId) === -1) list.push(storeId);
      store.followers = (parseInt(store.followers) || 0) + 1;
    }
    saveFollowedStores(list);
    updateCardFollowButtons(storeId);
    renderFollowedStores();
    if (currentStoreId === storeId) {
      isFollowing = !wasFollowing;
      currentFollowersCount = store.followers;
      updateFollowersDisplay();
      updateFollowButtonUI();
    }
    showToast(wasFollowing ? 'تم إلغاء المتابعة' : 'تمت المتابعة بنجاح!');
    haptic('medium');
  } catch(err) {
    console.error('[BZR] Follow error:', err);
    showToast('حدث خطأ، حاول مرة أخرى');
  } finally {
    btn.disabled = false;
  }
}
function updateCardFollowButtons(storeId) {
  const following = isStoreFollowed(storeId);
  document.querySelectorAll('.store-card button[data-store-id]').forEach(btn => {
    if (btn.dataset.storeId === storeId) setCardFollowState(btn, following);
  });
}
function renderFollowedStores() {
  const section = document.getElementById('followedStoresSection');
  const container = document.getElementById('followedStoresContainer');
  const badge = document.getElementById('followedCountBadge');
  const ids = getFollowedStores();
  if (!ids.length) {
    section.classList.add('hidden');
    container.innerHTML = '';
    if (badge) badge.textContent = '';
    return;
  }
  const followed = ids.map(id => stores.find(s => getStoreId(s) === id)).filter(Boolean);
  if (!followed.length) {
    section.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  section.classList.remove('hidden');
  if (badge) badge.textContent = followed.length + ' متجر';
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  followed.forEach(store => {
    const item = document.createElement('div'); item.className = 'followed-store-item';
    const avatar = document.createElement('div'); avatar.className = 'followed-store-avatar';
    const img = document.createElement('img'); img.loading = 'lazy'; img.alt = ''; img.draggable = false;
    img.src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
    img.onerror = function(){ this.src = 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store'; };
    avatar.appendChild(img);
    const nm = document.createElement('div'); nm.className = 'followed-store-name'; nm.textContent = store.name || '';
    item.appendChild(avatar); item.appendChild(nm);
    item.addEventListener('click', () => { haptic('light'); openStoreModal(store); });
    frag.appendChild(item);
  });
  container.appendChild(frag);
}
function filterStoresByCategory(cat) {
  currentCategory = cat;
  const filtered = stores.filter(s => s.category === cat);
  const c = document.getElementById('storesScrollContainer');
  c.innerHTML = '';
  if (filtered.length === 0) {
    c.innerHTML = '<div style="text-align:center;width:100%;padding:2.5rem 0;color:var(--c-text-soft);">لا توجد متاجر في هذه الفئة</div>';
  } else {
    const frag = document.createDocumentFragment();
    filtered.forEach(s => frag.appendChild(createStoreCard(s)));
    c.appendChild(frag);
  }
  lastStoresInteraction = Date.now();
  startAutoScroll();
}

/* ═══ CATEGORIES ═══ */
function displayCategories() {
  const c = document.getElementById('categoriesContainer');
  c.innerHTML = '';
  const frag = document.createDocumentFragment();
  const allBtn = document.createElement('button');
  allBtn.className = 'chip active';
  allBtn.textContent = 'الكل';
  allBtn.addEventListener('click', () => {
    haptic('light');
    currentCategory = null;
    displayStores();
    highlightCategory(allBtn);
    startAutoScroll();
    applyProductsFilter(null);
  });
  frag.appendChild(allBtn);
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      haptic('light');
      filterStoresByCategory(cat);
      highlightCategory(btn);
      applyProductsFilter(cat);
    });
    frag.appendChild(btn);
  });
  c.appendChild(frag);
  startCategoriesAutoScroll();
}
function highlightCategory(active) {
  document.getElementById('categoriesContainer').querySelectorAll('button').forEach(b => b.classList.remove('active'));
  active.classList.add('active');
}

/* ═══ STORE CATEGORIES TABS ═══ */
function renderStoreCategoryTabs(store) {
  const container = document.getElementById('storeCategoriesTabs');
  if (!container) return;
  container.innerHTML = '';
  const mainCat = (store.category && String(store.category).trim()) ? String(store.category).trim() : '';
  const additional = Array.isArray(store.categories)
    ? store.categories.map(c => String(c || '').trim()).filter(c => c && c !== mainCat)
    : [];
  const subscribed = store.is_subscribed === true;
  if (!mainCat && !additional.length) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';
  if (mainCat) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'store-cat-tab main-tab active';
    tab.dataset.cat = mainCat;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'true');
    tab.innerHTML = '<i class="fas fa-tag"></i><span>' + sanitizeHTML(mainCat) + '</span>';
    tab.addEventListener('click', () => selectStoreCategoryTab(tab, mainCat));
    container.appendChild(tab);
  }
  additional.forEach(cat => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'store-cat-tab' + (subscribed ? '' : ' locked');
    tab.dataset.cat = cat;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'false');
    const icon = subscribed
      ? '<i class="fas fa-tag"></i>'
      : '<i class="fas fa-lock lock-icon" aria-hidden="true"></i>';
    tab.innerHTML = icon + '<span>' + sanitizeHTML(cat) + '</span>';
    if (!subscribed) tab.setAttribute('aria-label', cat + ' - مقفلة، تتطلب اشتراكاً');
    tab.addEventListener('click', () => {
      if (!subscribed) {
        haptic('medium');
        showToast('🔒 هذه الفئة متاحة في النسخة المدفوعة فقط');
        return;
      }
      selectStoreCategoryTab(tab, cat);
    });
    container.appendChild(tab);
  });
}
function selectStoreCategoryTab(tab, category) {
  const container = document.getElementById('storeCategoriesTabs');
  if (container) {
    container.querySelectorAll('.store-cat-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
  }
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  haptic('light');
  currentStoreCategoryForProducts = category || null;
  if (currentStore) loadStoreProducts(currentStore.name, currentStoreCategoryForProducts);
}
async function refreshStoreDataOnOpen(storeId) {
  if (!storeId) return;
  if (!RateLimiter.canRequest('store_refresh')) return;
  try {
    const doc = await db.collection('stores').doc(String(storeId)).get();
    if (!doc.exists) return;
    if (currentStoreId !== String(storeId)) return;
    const fresh = { id: doc.id, ...doc.data() };
    const oldMain = String(currentStore?.category || '');
    const newMain = String(fresh.category || '');
    const oldList = JSON.stringify(currentStore?.categories || []);
    const newList = JSON.stringify(fresh.categories || []);
    const oldSub = currentStore?.is_subscribed === true;
    const newSub = fresh.is_subscribed === true;
    if (oldMain !== newMain || oldList !== newList || oldSub !== newSub) {
      currentStore = { ...currentStore, ...fresh };
      const activeCat = currentStoreCategoryForProducts;
      const mainCat = (fresh.category && String(fresh.category).trim()) ? String(fresh.category).trim() : null;
      const isExtra = Array.isArray(fresh.categories) && fresh.categories.indexOf(activeCat) > -1;
      const locked = !newSub && isExtra;
      if (locked || (!mainCat && !isExtra)) currentStoreCategoryForProducts = mainCat;
      renderStoreCategoryTabs(fresh);
      loadStoreProducts(fresh.name, currentStoreCategoryForProducts);
      const catVal = (fresh.category && String(fresh.category).trim()) ? fresh.category : 'عام';
      document.getElementById('storeCategory').innerHTML = '<i class="fas fa-tag"></i><span>' + sanitizeHTML(catVal) + '</span>';
      cacheManager.remove('stores_list');
    }
  } catch(e) { /* silent */ }
}

/* ═══ STORE MODAL ═══ */
function openStoreModal(store) {
  currentStore = store;
  currentStoreId = String(getStoreId(store));
  currentFollowersCount = parseInt(store.followers) || 0;
  isFollowing = isStoreFollowed(currentStoreId);
  currentStoreCategoryForProducts = (store.category && String(store.category).trim()) ? String(store.category).trim() : null;
  document.getElementById('storeCoverImage').src = optimizeCloudinaryUrl(store.cover_url) || 'https://via.placeholder.com/1200x600/FF7A00/FFFFFF?text=Cover';
  document.getElementById('storeLogo').src = optimizeCloudinaryUrl(store.logo_url) || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  document.getElementById('storeDescription').textContent = store.description || 'متجر مميز';
  const catVal = (store.category && String(store.category).trim()) ? store.category : 'عام';
  document.getElementById('storeCategory').innerHTML = '<i class="fas fa-tag"></i><span>' + sanitizeHTML(catVal) + '</span>';
  updateFollowersDisplay();
  updateFollowButtonUI();
  if (store.is_verified) {
    const storeNameEl = document.getElementById('storeName');
    storeNameEl.innerHTML = '';
    const badge = document.createElement('span');
    badge.className = 'verified-icon';
    badge.style.cssText = 'display:inline-flex;width:20px;height:20px;flex-shrink:0;';
    badge.innerHTML = VERIFIED_BADGE_SVG;
    const nameTxt = document.createElement('span');
    nameTxt.textContent = store.name || '';
    storeNameEl.appendChild(badge);
    storeNameEl.appendChild(nameTxt);
  } else {
    document.getElementById('storeName').textContent = store.name || '';
  }
  const phone = store.phone_number || '', wa = store.whatsapp_number || '';
  const callBtn = document.getElementById('storeCallButton');
  const waBtn = document.getElementById('storeWhatsAppButton');
  if (phone) { callBtn.href = 'tel:' + phone; callBtn.style.display = ''; } else callBtn.style.display = 'none';
  if (wa) { waBtn.href = 'https://wa.me/' + wa.replace(/[^0-9]/g, ''); waBtn.style.display = ''; } else waBtn.style.display = 'none';
  renderStoreCategoryTabs(store);
  loadStoreProducts(store.name, currentStoreCategoryForProducts);
  document.getElementById('storeModal').classList.remove('hidden');
  updateBodyScroll();
  document.getElementById('storeModal').querySelector('.modal-content').scrollTop = 0;
  bzrPushModal();
  refreshStoreDataOnOpen(currentStoreId);
  const storeIdSnapshot = currentStoreId;
  checkFollowStatusFromServer(storeIdSnapshot).then(serverFollowing => {
    if (currentStoreId !== storeIdSnapshot) return;
    if (serverFollowing !== isFollowing) {
      isFollowing = serverFollowing;
      if (serverFollowing) _followedFromServer.add(storeIdSnapshot);
      else _followedFromServer.delete(storeIdSnapshot);
      const list = getFollowedStores();
      if (serverFollowing && list.indexOf(storeIdSnapshot) === -1) {
        list.push(storeIdSnapshot); saveFollowedStores(list);
      } else if (!serverFollowing) {
        const i = list.indexOf(storeIdSnapshot);
        if (i > -1) { list.splice(i, 1); saveFollowedStores(list); }
      }
      updateFollowButtonUI();
      updateCardFollowButtons(storeIdSnapshot);
      renderFollowedStores();
    }
  }).catch(() => {});
}
function closeStoreModalInternal() {
  document.getElementById('storeModal').classList.add('hidden');
  updateBodyScroll();
  currentStore = null;
  currentStoreId = null;
  currentStoreCategoryForProducts = null;
}
function closeStoreModal() { closeStoreModalInternal(); bzrCloseModalUI(); }
document.getElementById('closeStoreModal')?.addEventListener('click', closeStoreModal);
function updateFollowersDisplay() {
  document.getElementById('storeFollowers').textContent = currentFollowersCount.toLocaleString();
}
function updateFollowButtonUI() {
  const btn = document.getElementById('storeFollowButton');
  const txt = document.getElementById('storeFollowText');
  if (!btn || !txt) return;
  if (isFollowing) {
    btn.classList.add('following');
    txt.textContent = 'متابَع';
    btn.querySelector('i').className = 'fas fa-check';
  } else {
    btn.classList.remove('following');
    txt.textContent = 'متابعة';
    btn.querySelector('i').className = 'fas fa-heart';
  }
}
document.getElementById('storeFollowButton')?.addEventListener('click', async () => {
  if (!currentStoreId || isUpdatingFollow || !currentStore) return;
  const guardCheck = FollowGuard.canFollow(currentStoreId);
  if (!guardCheck.allowed) {
    haptic('heavy');
    showToast(guardCheck.message);
    const btn = document.getElementById('storeFollowButton');
    if (btn) {
      btn.classList.add('blocked-flash');
      setTimeout(() => btn.classList.remove('blocked-flash'), 600);
    }
    return;
  }
  isUpdatingFollow = true;
  const btn = document.getElementById('storeFollowButton');
  btn.disabled = true;
  const wasFollowing = isFollowing;
  document.getElementById('storeFollowText').textContent = 'جاري...';
  haptic('light');
  try {
    const result = await performFollowToggle(currentStore);
    FollowGuard.recordAction(currentStoreId);
    const action = result.action;
    const nowFollowing = (action === 'followed');
    isFollowing = nowFollowing;
    if (nowFollowing) _followedFromServer.add(currentStoreId);
    else _followedFromServer.delete(currentStoreId);
    const list = getFollowedStores();
    if (!nowFollowing) {
      const i = list.indexOf(currentStoreId);
      if (i > -1) list.splice(i, 1);
      currentFollowersCount = Math.max(0, currentFollowersCount - 1);
    } else {
      if (list.indexOf(currentStoreId) === -1) list.push(currentStoreId);
      currentFollowersCount = currentFollowersCount + 1;
    }
    saveFollowedStores(list);
    updateFollowersDisplay();
    updateFollowButtonUI();
    updateCardFollowButtons(currentStoreId);
    renderFollowedStores();
    showToast(nowFollowing ? 'تمت المتابعة بنجاح!' : 'تم إلغاء المتابعة');
    if (currentStore) currentStore.followers = currentFollowersCount;
  } catch(err) {
    console.error('[BZR] Follow error:', err);
    showToast('حدث خطأ');
    isFollowing = wasFollowing;
    updateFollowButtonUI();
    updateFollowersDisplay();
  } finally {
    isUpdatingFollow = false;
    btn.disabled = false;
  }
});

/* ═══ STORE PRODUCTS ═══ */
function filterStoreProductsByCategory(products, category) {
  if (!Array.isArray(products)) return [];
  if (!category) return products;
  const mainCat = (currentStore && currentStore.category && String(currentStore.category).trim())
    ? String(currentStore.category).trim()
    : null;
  if (category === mainCat) {
    return products.filter(p => {
      const pc = String(p.category || '').trim();
      return !pc || pc === mainCat;
    });
  }
  return products.filter(p => String(p.category || '').trim() === category);
}
async function loadStoreProducts(storeName, category) {
  const grid = document.getElementById('storeProductsGrid');
  const loadMoreBtn = document.getElementById('loadMoreStoreProductsBtn');
  loadMoreBtn.classList.add('hidden');
  loadMoreBtn.hidden = true;
  loadMoreBtn.disabled = false;
  loadMoreBtn.innerHTML = '<span>عرض المزيد</span><i class="fas fa-chevron-down" aria-hidden="true"></i>';
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem 0;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF7A00;"></i></div>';
  currentStoreNameForProducts = storeName;
  currentStoreCategoryForProducts = category || null;
  storeProductsLastDoc = null;
  storeProductsHasMore = false;
  const cacheKey = 'store_products_page1_' + storeName + '_' + (category || 'main');
  const cached = cacheManager.get(cacheKey);
  if (cached && Array.isArray(cached.items)) {
    const filtered = filterStoreProductsByCategory(cached.items, category);
    if (!filtered.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">لا توجد منتجات في هذه الفئة</div>';
      return;
    }
    renderStoreProducts(filtered);
    if (cached.hasMore === true) {
      storeProductsHasMore = true;
      loadMoreBtn.classList.remove('hidden');
      loadMoreBtn.hidden = false;
    }
    return;
  }
  if (!RateLimiter.canRequest('store_products')) return;
  try {
    let q = db.collection('products')
      .where('store_name', '==', storeName)
      .limit(CONFIG.STORE_PRODUCTS_PER_PAGE);
    try { q = q.orderBy('created_at', 'desc'); } catch(e){}
    let snap;
    try {
      snap = await q.get();
    } catch(innerErr) {
      snap = await db.collection('products')
        .where('store_name', '==', storeName)
        .limit(CONFIG.STORE_PRODUCTS_PER_PAGE)
        .get();
    }
    const rawList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (snap.docs.length > 0) storeProductsLastDoc = snap.docs[snap.docs.length - 1];
    storeProductsHasMore = (snap.docs.length === CONFIG.STORE_PRODUCTS_PER_PAGE);
    const filtered = filterStoreProductsByCategory(rawList, category);
    if (!filtered.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">لا توجد منتجات في هذه الفئة</div>';
    } else {
      renderStoreProducts(filtered);
      if (storeProductsHasMore) {
        loadMoreBtn.classList.remove('hidden');
        loadMoreBtn.hidden = false;
      }
    }
    cacheManager.set(cacheKey, { items: rawList, hasMore: storeProductsHasMore }, CONFIG.CACHE_TTL_PRODUCTS);
  } catch(err) {
    console.error('[BZR] loadStoreProducts error:', err);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">تعذر التحميل</div>';
  }
}
document.getElementById('loadMoreStoreProductsBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  if (btn.disabled) return;
  if (btn.classList.contains('hidden')) return;
  if (btn.hidden === true) return;
  if (!storeProductsHasMore) return;
  if (!currentStoreNameForProducts) return;
  if (!storeProductsLastDoc) return;
  if (!RateLimiter.canRequest('store_products')) {
    showToast('⏳ يرجى المحاولة بعد قليل');
    return;
  }
  btn.disabled = true;
  const originalHTML = '<span>عرض المزيد</span><i class="fas fa-chevron-down" aria-hidden="true"></i>';
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>جاري التحميل...</span>';
  haptic('light');
  try {
    let q = db.collection('products')
      .where('store_name', '==', currentStoreNameForProducts)
      .startAfter(storeProductsLastDoc)
      .limit(CONFIG.STORE_PRODUCTS_PER_PAGE);
    try { q = q.orderBy('created_at', 'desc'); } catch(e){}
    let snap;
    try {
      snap = await q.get();
    } catch(err) {
      snap = await db.collection('products')
        .where('store_name', '==', currentStoreNameForProducts)
        .startAfter(storeProductsLastDoc)
        .limit(CONFIG.STORE_PRODUCTS_PER_PAGE)
        .get();
    }
    const rawList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (snap.docs.length > 0) storeProductsLastDoc = snap.docs[snap.docs.length - 1];
    storeProductsHasMore = (snap.docs.length === CONFIG.STORE_PRODUCTS_PER_PAGE);
    const filtered = filterStoreProductsByCategory(rawList, currentStoreCategoryForProducts);
    if (filtered.length) renderStoreProducts(filtered, true);
    const cacheKey = 'store_products_page1_' + currentStoreNameForProducts + '_' + (currentStoreCategoryForProducts || 'main');
    const cached = cacheManager.get(cacheKey);
    const allItems = (cached && Array.isArray(cached.items)) ? cached.items.concat(rawList) : rawList;
    cacheManager.set(cacheKey, { items: allItems, hasMore: storeProductsHasMore }, CONFIG.CACHE_TTL_PRODUCTS);
    if (!storeProductsHasMore) {
      btn.classList.add('hidden');
      btn.hidden = true;
      btn.disabled = true;
      showToast('✅ عرضت جميع المنتجات');
    } else {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  } catch(err){
    console.error('[BZR] loadMore error:', err);
    showToast('❌ تعذر تحميل المزيد');
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
});
function renderStoreProducts(products, append) {
  const grid = document.getElementById('storeProductsGrid');
  if (!append) grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  products.forEach(product => {
    const price = parseFloat(product.price) || 0;
    const fav = isProductFav(product.id);
    const pm = {
      id: product.id, name: product.name, img_url: product.img_url,
      price,
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      store_name: product.store_name,
      description: product.description || '',
      colors: product.colors || null,
      category: product.category || null
    };
    const card = document.createElement('div'); card.className = 'store-product-card';
    const favBtn = document.createElement('button');
    favBtn.className = 'store-product-fav' + (fav ? ' active' : '');
    favBtn.innerHTML = '<i class="' + (fav ? 'fas' : 'far') + ' fa-heart"></i>';
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation(); haptic('light');
      const now = toggleProductFav(product.id);
      favBtn.classList.toggle('active', now);
      favBtn.innerHTML = '<i class="' + (now ? 'fas' : 'far') + ' fa-heart"></i>';
      showToast(now ? 'أُضيف للمفضلة' : 'أُزيل');
    });
    const imgWrap = document.createElement('div'); imgWrap.className = 'store-product-img-wrap';
    const img = document.createElement('img'); img.loading = 'lazy'; img.alt = product.name || '';
    img.src = optimizeCloudinaryUrl(product.img_url) || 'https://via.placeholder.com/300';
    img.onerror = function(){ this.src = 'https://via.placeholder.com/300'; };
    imgWrap.appendChild(img);
    const info = document.createElement('div'); info.className = 'store-product-info';
    const nameEl = document.createElement('div'); nameEl.className = 'store-product-name';
    nameEl.textContent = product.name || '';
    info.appendChild(nameEl);
    const priceEl = document.createElement('div'); priceEl.className = 'store-product-price';
    priceEl.textContent = price.toLocaleString() + ' ج.س';
    info.appendChild(priceEl);
    const viewBtn = document.createElement('button');
    viewBtn.className = 'store-product-btn ripple';
    viewBtn.innerHTML = '<span>عرض</span> <i class="fas fa-chevron-left"></i>';
    viewBtn.addEventListener('click', (e) => { e.stopPropagation(); haptic('light'); openProductModal(pm); });
    info.appendChild(viewBtn);
    card.appendChild(favBtn);
    card.appendChild(imgWrap);
    card.appendChild(info);
    card.addEventListener('click', () => { haptic('light'); openProductModal(pm); });
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ═══ PRODUCT MODAL ═══ */
let currentModalProduct = null, selectedColorVariant = null;
function openProductModal(product) {
  currentModalProduct = product;
  selectedColorVariant = null;
  const defaultImg = optimizeCloudinaryUrl(product.img_url) || 'https://via.placeholder.com/600';
  const imgEl = document.getElementById('productModalImage');
  imgEl.src = defaultImg;
  imgEl.style.opacity = '1';
  imgEl.onerror = function(){ this.src = 'https://via.placeholder.com/600'; };
  document.getElementById('productModalName').textContent = product.name;
  document.getElementById('productModalStore').textContent = product.store_name || 'غير محدد';
  document.getElementById('productModalPrice').textContent = (product.price || 0).toLocaleString() + ' ج.س';
  const origEl = document.getElementById('productModalOriginalPrice');
  if (product.original_price) {
    origEl.textContent = product.original_price.toLocaleString() + ' ج.س';
    origEl.classList.remove('hidden');
  } else {
    origEl.textContent = '';
    origEl.classList.add('hidden');
  }
  const colorsContainer = document.getElementById('productColorsContainer');
  const swatchesContainer = document.getElementById('productColorSwatches');
  const selColorName = document.getElementById('selectedColorName');
  swatchesContainer.innerHTML = '';
  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    colorsContainer.classList.remove('hidden');
    colorsContainer.style.display = 'flex';
    selColorName.textContent = 'الأصلي';
    const frag = document.createDocumentFragment();
    const originalBtn = document.createElement('div');
    originalBtn.className = 'color-swatch active';
    originalBtn.title = 'الصورة الأصلية';
    originalBtn.style.cssText = 'background:linear-gradient(135deg,#FF7A00,#FFA64D);display:flex;align-items:center;justify-content:center;position:relative;';
    originalBtn.innerHTML = '<i class="fas fa-image" style="color:#fff;font-size:14px;pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,0.3);"></i>';
    originalBtn.addEventListener('click', () => {
      if (selectedColorVariant === null) return;
      haptic('light');
      imgEl.style.opacity = '0';
      setTimeout(() => {
        selectedColorVariant = null;
        imgEl.src = defaultImg;
        imgEl.onload = () => { imgEl.style.opacity = '1'; };
      }, 200);
      document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
      originalBtn.classList.add('active');
      selColorName.textContent = 'الأصلي';
      updateModalActionButtons();
    });
    frag.appendChild(originalBtn);
    product.colors.forEach((color) => {
      const swatch = document.createElement('div');
      const hex = safeHex(color && color.hex) || getFallbackHex(color && color.name);
      const isLight = ['#ffffff','#fff','#f8f9fa','white'].indexOf(String(hex).toLowerCase()) > -1;
      swatch.className = 'color-swatch ' + (isLight ? 'light-color' : '');
      swatch.style.backgroundColor = hex;
      swatch.title = String(color && color.name || '');
      swatch.addEventListener('click', () => {
        if (selectedColorVariant && selectedColorVariant.name === color.name) return;
        haptic('light');
        imgEl.style.opacity = '0';
        setTimeout(() => {
          selectedColorVariant = color;
          imgEl.src = optimizeCloudinaryUrl(color.image) || defaultImg;
          imgEl.onload = () => { imgEl.style.opacity = '1'; };
        }, 200);
        document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
        swatch.classList.add('active');
        selColorName.textContent = color.name;
        updateModalActionButtons();
      });
      frag.appendChild(swatch);
    });
    swatchesContainer.appendChild(frag);
  } else {
    colorsContainer.classList.add('hidden');
    colorsContainer.style.display = 'none';
  }
  document.getElementById('productModal').classList.remove('hidden');
  updateBodyScroll();
  updateModalActionButtons();
  bzrPushModal();
}
function closeProductModalInternal() {
  document.getElementById('productModal').classList.add('hidden');
  updateBodyScroll();
}
function closeProductModal() { closeProductModalInternal(); bzrCloseModalUI(); }
function updateModalActionButtons() {
  const p = { ...currentModalProduct };
  if (selectedColorVariant) {
    p.selectedColor = selectedColorVariant.name;
    p.img_url = selectedColorVariant.image || currentModalProduct.img_url;
  }
  document.getElementById('addToCartFromModal').dataset.product = JSON.stringify(p);
  document.getElementById('buyNowFromModal').dataset.product = JSON.stringify(p);
}
document.getElementById('closeProductModal')?.addEventListener('click', closeProductModal);
document.getElementById('productModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('productModal')) closeProductModal();
});
document.getElementById('addToCartFromModal')?.addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const p = JSON.parse(btn.dataset.product);
  addToCart(p);
  haptic('medium');
  btn.style.background = 'linear-gradient(135deg,#10B981,#059669)';
  btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
  setTimeout(() => {
    btn.style.background = '';
    btn.innerHTML = '<i class="fas fa-shopping-bag"></i> أضف إلى السلة';
  }, 1500);
});
document.getElementById('buyNowFromModal')?.addEventListener('click', (e) => {
  const p = JSON.parse(e.currentTarget.dataset.product);
  const store = stores.find(s => s.name === p.store_name);
  let wa = store && store.whatsapp_number ? store.whatsapp_number : '';
  if (!wa) { showToast('رقم الواتساب غير متوفر'); return; }
  haptic('medium');
  const msg = 'مرحباً، أريد شراء:\n\n' + p.name + '\n'
    + (p.selectedColor ? 'اللون: ' + p.selectedColor + '\n' : '')
    + 'السعر: ' + (p.price || 0).toLocaleString() + ' ج.س\n'
    + (p.store_name ? 'من متجر: ' + p.store_name : '');
  window.open('https://wa.me/' + wa.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
});

/* ═══ CART ═══ */
function addToCart(product) {
  const store = stores.find(s => s.name === product.store_name);
  const cartItemId = product.selectedColor ? product.id + '_' + product.selectedColor : product.id;
  const item = { ...product, cartItemId, quantity: 1, store_whatsapp: store?.whatsapp_number || '' };
  const existing = cart.find(i => (i.cartItemId || i.id) === cartItemId);
  if (existing) existing.quantity += 1; else cart.push(item);
  updateCartUI();
  try { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch(e){}
  animateCartBounce();
  showToast('تمت الإضافة إلى السلة');
}
function animateCartBounce() {
  const btn = document.getElementById('cartButton');
  if (!btn) return;
  btn.classList.add('bounce');
  setTimeout(() => btn.classList.remove('bounce'), 650);
}
function updateCartUI() {
  const totalItems = cart.reduce((s,i) => s + i.quantity, 0);
  const cc = document.getElementById('cartCount');
  if (cc) {
    if (totalItems > 0) {
      cc.textContent = totalItems > 99 ? '99+' : totalItems;
      cc.style.display = 'flex';
    } else cc.style.display = 'none';
  }
  const items = document.getElementById('cartItems');
  items.innerHTML = '';
  if (cart.length === 0) {
    items.innerHTML = '<div style="text-align:center;color:var(--c-text-soft);padding:2.5rem 0;"><i class="fas fa-shopping-bag" style="font-size:3rem;margin-bottom:1rem;display:block;color:#CBD5E1;"></i><p style="font-weight:700;">السلة فارغة</p></div>';
  } else {
    const frag = document.createDocumentFragment();
    cart.forEach(item => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--c-border);';
      const itemId = item.cartItemId || item.id;
      div.innerHTML =
        '<img src="' + sanitizeHTML(optimizeCloudinaryUrl(item.img_url) || 'https://via.placeholder.com/80') + '" class="cart-item-image" alt="" loading="lazy">' +
        '<div style="flex:1;min-width:0;">' +
          '<h5 style="font-weight:800;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--c-text);margin:0;">' + sanitizeHTML(item.name) + '</h5>' +
          (item.store_name ? '<span style="font-size:0.72rem;color:#FF7A00;font-weight:800;display:block;">' + sanitizeHTML(item.store_name) + '</span>' : '') +
          (item.selectedColor ? '<span style="font-size:0.7rem;color:var(--c-text-soft);font-weight:700;background:var(--c-surface-2);padding:2px 8px;border-radius:6px;display:inline-block;margin-top:4px;">اللون: ' + sanitizeHTML(item.selectedColor) + '</span>' : '') +
          '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">' +
            '<button class="decrease-btn" data-id="' + itemId + '" style="width:26px;height:26px;border-radius:50%;background:var(--c-surface-2);border:none;font-weight:800;cursor:pointer;color:var(--c-text);">−</button>' +
            '<span style="font-weight:800;color:var(--c-text);min-width:20px;text-align:center;">' + item.quantity + '</span>' +
            '<button class="increase-btn" data-id="' + itemId + '" style="width:26px;height:26px;border-radius:50%;background:var(--c-surface-2);border:none;font-weight:800;cursor:pointer;color:var(--c-text);">+</button>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:left;flex-shrink:0;">' +
          '<div style="font-weight:900;color:#FF7A00;">' + (item.price * item.quantity).toLocaleString() + ' ج.س</div>' +
          '<button class="remove-btn" data-id="' + itemId + '" style="color:#EF4444;margin-top:4px;background:none;border:none;cursor:pointer;font-size:0.85rem;"><i class="fas fa-trash"></i></button>' +
        '</div>';
      frag.appendChild(div);
    });
    items.appendChild(frag);
    items.querySelectorAll('.decrease-btn').forEach(b => b.onclick = () => { haptic('light'); changeQuantity(b.dataset.id, -1); });
    items.querySelectorAll('.increase-btn').forEach(b => b.onclick = () => { haptic('light'); changeQuantity(b.dataset.id, 1); });
    items.querySelectorAll('.remove-btn').forEach(b => b.onclick = () => { haptic('light'); removeFromCart(b.dataset.id); });
  }
  const total = cart.reduce((s,i) => s + i.price * i.quantity, 0);
  const ct = document.getElementById('cartTotal');
  if (ct) ct.querySelector('span:last-child').textContent = total.toLocaleString() + ' ج.س';
  updateBottomNavBadge();
}
function changeQuantity(id, delta) {
  const item = cart.find(i => (i.cartItemId || i.id) === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  updateCartUI();
  try { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch(e){}
}
function removeFromCart(id) {
  cart = cart.filter(i => (i.cartItemId || i.id) !== id);
  updateCartUI();
  try { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch(e){}
  showToast('تمت الإزالة');
}
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  updateBodyScroll();
  setActiveNav('cart');
  bzrPushModal();
}
function closeCartInternal() {
  document.getElementById('cartSidebar').classList.remove('open');
  updateBodyScroll();
  setActiveNav('home');
}
function closeCart() { closeCartInternal(); bzrCloseModalUI(); }
document.getElementById('cartButton')?.addEventListener('click', () => { haptic('light'); openCart(); });
document.getElementById('closeCart')?.addEventListener('click', closeCart);
document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
document.getElementById('continueShopping')?.addEventListener('click', closeCart);

/* ═══ WHATSAPP ORDER ═══ */
document.getElementById('whatsappOrder')?.addEventListener('click', () => {
  if (cart.length === 0) { showToast('السلة فارغة'); return; }
  haptic('medium');
  let msg = '🛒 *طلب جديد من BranZar*\n\n';
  msg += '📋 *تفاصيل الطلب:*\n';
  msg += '━━━━━━━━━━━━━━\n';
  cart.forEach((item, index) => {
    msg += `${index + 1}. *${item.name}*\n`;
    msg += `   • الكمية: ${item.quantity}\n`;
    msg += `   • السعر: ${(item.price * item.quantity).toLocaleString()} ج.س\n`;
    if (item.selectedColor) msg += `   • اللون: ${item.selectedColor}\n`;
    if (item.store_name) msg += `   • المتجر: ${item.store_name}\n`;
    msg += '\n';
  });
  msg += '━━━━━━━━━━━━━━\n';
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  msg += `💰 *المجموع الكلي:* ${total.toLocaleString()} ج.س\n\n`;
  msg += `📦 عدد المنتجات: ${cart.reduce((s, i) => s + i.quantity, 0)}\n\n`;
  msg += `شكراً لاستخدامكم BranZar 🌟`;
  const whatsappUrl = 'https://wa.me/' + CONFIG.FIXED_WHATSAPP + '?text=' + encodeURIComponent(msg);
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});

/* ═══ SHARE STORE ═══ */
function updateMetaTagsForStore(store) {
  if (!store) return;
  const storeName = store.name || 'BranZar';
  const storeDesc = (store.description && String(store.description).trim())
    ? store.description
    : 'اكتشف أفضل المتاجر والبراندات السودانية والعالمية في مكان واحد. تسوق الآن🛒🛍️';
  const storeImage = optimizeCloudinaryUrl(store.cover_url)
    || optimizeCloudinaryUrl(store.logo_url)
    || CONFIG.DEFAULT_OG_IMAGE;
  const storeUrl = window.location.origin + window.location.pathname + '?store=' + encodeURIComponent(String(getStoreId(store)));
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', storeName + ' | BranZar');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', storeDesc);
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute('content', storeImage);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', storeUrl);
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', storeName + ' | BranZar');
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', storeDesc);
  const twImage = document.querySelector('meta[name="twitter:image"]');
  if (twImage) twImage.setAttribute('content', storeImage);
  document.title = storeName + ' | BranZar';
}
document.getElementById('storeShareBtn')?.addEventListener('click', () => { if (currentStore) shareStore(currentStore); });
async function shareStore(store) {
  if (!store) return;
  updateMetaTagsForStore(store);
  const storeId = String(getStoreId(store));
  const url = window.location.origin + window.location.pathname + '?store=' + encodeURIComponent(storeId);
  const shareText = `اكتشف متجر ${store.name} على BranZar 🛒🛍️\n${store.description || 'أفضل المنتجات والبراندات في مكان واحد'}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: store.name + ' | BranZar', text: shareText, url });
      haptic('medium');
      return;
    } catch(err){ if (err && err.name === 'AbortError') return; }
  }
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('✅ تم نسخ الرابط');
    }
  } catch(err){ showToast('تعذر النسخ'); }
}

/* ═══ KEYBOARD ═══ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (searchResults.classList.contains('show')) { searchResults.classList.remove('show'); return; }
    closeTopmostModal();
  }
});

/* ═══ NAV CONTROLS ═══ */
document.getElementById('categoriesContainer')?.addEventListener('wheel', (e) => {
  if (e.deltaY !== 0) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; }
}, { passive: false });
document.getElementById('prevStoresBtn')?.addEventListener('click', () => {
  const c = document.getElementById('storesScrollContainer');
  lastStoresInteraction = Date.now();
  c.scrollBy({ left: 300, behavior: 'smooth' });
});
document.getElementById('nextStoresBtn')?.addEventListener('click', () => {
  const c = document.getElementById('storesScrollContainer');
  lastStoresInteraction = Date.now();
  c.scrollBy({ left: -300, behavior: 'smooth' });
});
document.getElementById('prevCategoriesBtn')?.addEventListener('click', () => {
  const c = document.getElementById('categoriesContainer');
  lastCategoriesInteraction = Date.now();
  c.scrollBy({ left: -200, behavior: 'smooth' });
});
document.getElementById('nextCategoriesBtn')?.addEventListener('click', () => {
  const c = document.getElementById('categoriesContainer');
  lastCategoriesInteraction = Date.now();
  c.scrollBy({ left: 200, behavior: 'smooth' });
});
const storesContainer = document.getElementById('storesScrollContainer');
if (storesContainer) {
  ['pointerdown','pointerup','pointercancel','touchstart','touchend','touchcancel','wheel','mousedown','mouseup'].forEach(evt => {
    storesContainer.addEventListener(evt, () => { lastStoresInteraction = Date.now(); }, { passive: true });
  });
  storesContainer.addEventListener('mouseenter', () => { isHoveringStores = true; }, { passive: true });
  storesContainer.addEventListener('mouseleave', () => { isHoveringStores = false; lastStoresInteraction = Date.now(); }, { passive: true });
}
const categoriesScrollContainer = document.getElementById('categoriesContainer');
if (categoriesScrollContainer) {
  ['pointerdown','pointerup','pointercancel','touchstart','touchend','touchcancel','wheel','mousedown','mouseup'].forEach(evt => {
    categoriesScrollContainer.addEventListener(evt, () => { lastCategoriesInteraction = Date.now(); }, { passive: true });
  });
  categoriesScrollContainer.addEventListener('mouseenter', () => { isHoveringCategories = true; }, { passive: true });
  categoriesScrollContainer.addEventListener('mouseleave', () => { isHoveringCategories = false; lastCategoriesInteraction = Date.now(); }, { passive: true });
}

/* ═══ SERVICE WORKER ═══ */
let swRegistration = null;
let isReloading = false;
let updateCheckInterval = null;
let _updateButtonShownThisLoad = false;
let _lastUpdateCheck = 0;
function getSWVersionFromWorker(worker) {
  return new Promise((resolve) => {
    if (!worker) return resolve(null);
    const timeout = setTimeout(() => resolve(null), 1500);
    try {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => {
        clearTimeout(timeout);
        const v = e.data && e.data.version;
        resolve(typeof v === 'string' ? v : null);
      };
      worker.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
    } catch(e) { clearTimeout(timeout); resolve(null); }
  });
}
function showUpdateButton() {
  const btn = document.getElementById('updateAvailableBtn');
  if (!btn || btn.classList.contains('show')) return;
  btn.classList.remove('hidden');
  requestAnimationFrame(() => {
    setTimeout(() => { btn.classList.add('show'); try { haptic('medium'); } catch(e){} }, 50);
  });
}
function triggerUpdate() {
  const btn = document.getElementById('updateAvailableBtn');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  const iconEl = btn.querySelector('.update-icon-wrap i');
  if (iconEl) { iconEl.className = 'fas fa-spinner fa-spin'; iconEl.style.animation = 'none'; }
  const strongEl = btn.querySelector('.update-text-wrap strong');
  const spanEl = btn.querySelector('.update-text-wrap span');
  if (strongEl) strongEl.textContent = '⏳ جاري التحديث...';
  if (spanEl) spanEl.textContent = 'لحظة من فضلك';
  const reg = swRegistration;
  if (reg && reg.waiting) {
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => { if (!isReloading) { isReloading = true; window.location.reload(); } }, 2000);
  } else { window.location.reload(); }
}
async function maybeShowUpdate() {
  if (_updateButtonShownThisLoad) return;
  if (!swRegistration) return;
  const waiting = swRegistration.waiting;
  const active = navigator.serviceWorker.controller;
  if (!waiting || !active) return;
  try {
    const [newV, oldV] = await Promise.all([
      getSWVersionFromWorker(waiting),
      getSWVersionFromWorker(active)
    ]);
    if (newV && oldV && newV === oldV) return;
    if (!newV) return;
    _updateButtonShownThisLoad = true;
    showUpdateButton();
    try { showToast('🎉 تحديث جديد متوفر!'); } catch(e){}
  } catch(e){}
}
async function checkForUpdate() {
  if (!swRegistration || document.hidden) return;
  try {
    await swRegistration.update();
    await maybeShowUpdate();
  } catch(err){}
}
function throttledCheckForUpdate() {
  const now = Date.now();
  if (now - _lastUpdateCheck < CONFIG.UPDATE_CHECK_THROTTLE_MS) return;
  _lastUpdateCheck = now;
  checkForUpdate();
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => {
        swRegistration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) maybeShowUpdate();
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setTimeout(() => maybeShowUpdate(), 500);
            }
          });
        });
        if (updateCheckInterval) clearInterval(updateCheckInterval);
        updateCheckInterval = setInterval(() => {
          if (!document.hidden) checkForUpdate();
        }, CONFIG.UPDATE_CHECK_INTERVAL_MS);
      })
      .catch((err) => console.warn('[BZR] SW registration failed:', err));
    let hadControllerAtLoad = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadControllerAtLoad) { hadControllerAtLoad = true; return; }
      if (isReloading) return;
      isReloading = true;
      window.location.reload();
    });
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event.data || {};
      if (data.type === 'SW_ACTIVATED') _updateButtonShownThisLoad = false;
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) throttledCheckForUpdate();
    });
  });
}
document.getElementById('updateAvailableBtn')?.addEventListener('click', triggerUpdate);

/* ═══ MANUAL REFRESH BUTTON ═══ */
document.getElementById('refreshProductsBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const icon = btn.querySelector('i');
  if (btn.disabled) return;
  btn.disabled = true;
  if (icon) icon.classList.add('fa-spin');
  haptic('light');
  try {
    cacheManager.remove('all_products_page1');
    cacheManager.remove('stores_list');
    await Promise.all([loadStores(true), loadAllProducts(true)]);
    showToast('✅ تم تحديث البيانات');
  } catch(err) {
    showToast('تعذر التحديث، حاول مرة أخرى');
  } finally {
    if (icon) icon.classList.remove('fa-spin');
    btn.disabled = false;
  }
});

console.log('[BZR] ui.js loaded ✅');
