<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#FF7A00">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="BranZar">
<meta name="mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://www.gstatic.com https://apis.google.com https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https:; connect-src 'self' https://firestore.googleapis.com https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://fcmregistrations.googleapis.com https://fcm.googleapis.com https://*.firebaseapp.com https://*.cloudfunctions.net https://firebasestorage.googleapis.com; frame-src 'self' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com; worker-src 'self' blob:; media-src 'self' https: blob:; object-src 'none'; base-uri 'self'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests;">
<title>BranZar – بران زار | أكبر سوق إلكتروني لأشهر البراندات</title>
<meta name="description" content="اكتشف أفضل المتاجر والبراندات السودانية والعالمية في مكان واحد.">
<meta property="og:type" content="website">
<meta property="og:title" content="BranZar | بران زار">
<meta property="og:image" content="https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png">
<meta property="og:url" content="https://branzar.vercel.app/">
<meta property="og:locale" content="ar_AR">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="manifest.json">
<link rel="icon" type="image/png" href="https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<style>
/* ═══════════════════════════════════════════
   BranZar v6.1 — Native App Design System
   ═══════════════════════════════════════════ */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --app-bar-h: 58px;
  --search-bar-h: 56px;
  --bottom-nav-h: 66px;
  --c-bg: #F8FAFC;
  --c-surface: #FFFFFF;
  --c-surface-2: #F1F5F9;
  --c-text: #0F172A;
  --c-text-soft: #64748B;
  --c-border: #E2E8F0;
  --c-primary: #FF7A00;
  --c-primary-dark: #E06B00;
  --c-primary-soft: #FFF7ED;
  --c-secondary: #1E40AF;
  --c-secondary-soft: #DBEAFE;
}
body.theme-dark {
  --c-bg: #0F172A;
  --c-surface: #1E293B;
  --c-surface-2: #334155;
  --c-text: #F1F5F9;
  --c-text-soft: #94A3B8;
  --c-border: #334155;
  --c-primary-soft: #3B2410;
  --c-secondary-soft: #1E3A8A;
}
body.theme-dark { background: var(--c-bg); color: var(--c-text); }
body.theme-dark .bzr-app-bar { background: rgba(15,23,42,0.85); border-color: rgba(255,255,255,0.06); }
body.theme-dark #bzrBottomNav { background: rgba(15,23,42,0.94); border-color: rgba(255,255,255,0.06); }
body.theme-dark .bzr-search-bar-wrap { background: rgba(15,23,42,0.9); border-color: rgba(255,255,255,0.06); }
body.theme-dark .icon-btn { background: #334155; color: #F1F5F9; }
body.theme-dark .chip { background: #1E293B; border-color: #334155; color: #CBD5E1; }
body.theme-dark .store-card, body.theme-dark .product-card, body.theme-dark .store-product-card { background: var(--c-surface); border-color: var(--c-border); }
body.theme-dark .search-panel { background: var(--c-surface); }
body.theme-dark #cartSidebar { background: var(--c-surface); }
body.theme-dark #cartSidebar > div { background: var(--c-surface) !important; border-color: var(--c-border) !important; }
body.theme-dark .fullscreen-modal .modal-content { background: var(--c-surface); }
body.theme-dark .product-modal .product-modal-content { background: var(--c-surface); }
body.theme-dark .product-modal-image-wrapper { background: var(--c-surface-2); border-color: var(--c-border); }
body.theme-dark .store-info-card { background: var(--c-surface); }
body.theme-dark .store-meta-category { background: var(--c-secondary-soft); color: #93C5FD; }
body.theme-dark .btn-ghost { background: #334155; color: #93C5FD; border-color: #475569; }
body.theme-dark .scroll-btn { background: #1E293B; border-color: #334155; color: #CBD5E1; }
body.theme-dark #toast { background: #F1F5F9; color: #0F172A; }
body.theme-dark .notif-btn-dismiss { background: #334155; color: #CBD5E1; }
body.theme-dark .followed-store-name { color: #F1F5F9; }
body.theme-dark #bzrSplash { background: linear-gradient(160deg, #0F172A 0%, #1E293B 55%, #3B2410 100%); }
body.theme-dark .bzr-splash-logo { background: #1E293B; }
body.theme-dark .account-avatar { background: #1E293B; }

* { font-family: 'Cairo', sans-serif; -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body {
  background: var(--c-bg);
  color: var(--c-text);
  direction: rtl;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  touch-action: pan-y;
  min-height: 100vh;
  padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 12px);
  transition: background-color 0.3s ease, color 0.3s ease;
}
body.modal-open { overflow: hidden; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,122,0,0.3); border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: #FF7A00; }
.bzr-container { max-width: 1400px; margin: 0 auto; padding: 0 16px; }

/* ═══ SPLASH ═══ */
#bzrSplash {
  position: fixed; inset: 0; z-index: 2147483647;
  background: linear-gradient(160deg, #FFFFFF 0%, #FFF7ED 55%, #FFEDD5 100%);
  display: flex; align-items: center; justify-content: center; flex-direction: column;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}
#bzrSplash.hide { opacity: 0; visibility: hidden; pointer-events: none; }
.bzr-splash-logo { width: 120px; height: 120px; border-radius: 50%; background: #fff; padding: 8px; box-shadow: 0 20px 60px rgba(255,122,0,0.35), 0 0 0 8px rgba(255,122,0,0.08); animation: bzrLogoPulse 2s ease-in-out infinite; }
@keyframes bzrLogoPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
.bzr-splash-title { margin-top: 1.5rem; font-size: 1.5rem; font-weight: 900; color: var(--c-text); }
.bzr-splash-title span { color: #FF7A00; }
.bzr-splash-subtitle { margin-top: 0.35rem; font-size: 0.85rem; color: var(--c-text-soft); font-weight: 600; }
.bzr-splash-loader { margin-top: 2rem; width: 140px; height: 4px; border-radius: 4px; background: rgba(255,122,0,0.15); overflow: hidden; position: relative; }
.bzr-splash-loader::after { content: ''; position: absolute; top: 0; right: 0; height: 100%; width: 40%; background: linear-gradient(90deg, #FF7A00, #FFA64D); border-radius: 4px; animation: bzrLoad 1.2s ease-in-out infinite; }
@keyframes bzrLoad { 0% { right: 100%; width: 40%; } 50% { right: 30%; width: 40%; } 100% { right: -40%; width: 40%; } }

/* ═══ APP BAR ═══ */
.bzr-app-bar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.88);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--c-border);
  padding-top: var(--safe-top);
}
.bzr-app-bar-inner { height: var(--app-bar-h); max-width: 1400px; margin: 0 auto; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.bzr-logo-btn { background: transparent; border: none; padding: 0; display: flex; align-items: center; gap: 10px; cursor: pointer; flex-shrink: 0; }
.bzr-logo-circle { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; background: #fff; box-shadow: 0 4px 12px rgba(255,122,0,0.25); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.bzr-logo-btn:active .bzr-logo-circle { transform: scale(0.92); }
.bzr-logo-circle img { width: 100%; height: 100%; object-fit: contain; }
.bzr-brand-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.1; }
.bzr-brand-text strong { font-size: 1rem; font-weight: 900; color: var(--c-text); }
.bzr-brand-text small { font-size: 0.65rem; font-weight: 700; color: #FF7A00; letter-spacing: 0.6px; }
@media (max-width: 400px) { .bzr-brand-text { display: none; } }
.bzr-app-actions { display: flex; align-items: center; gap: 6px; }
.icon-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--c-surface-2); border: none; display: inline-flex; align-items: center; justify-content: center; color: var(--c-text-soft); font-size: 1rem; cursor: pointer; position: relative; transition: background 0.2s, color 0.2s, transform 0.15s; overflow: hidden; }
.icon-btn:active { transform: scale(0.9); }
.icon-btn:hover { background: var(--c-secondary-soft); color: var(--c-secondary); }
.view-toggle-pill { display: inline-flex; align-items: center; background: var(--c-surface-2); border-radius: 9999px; padding: 3px; gap: 2px; height: 38px; }
.view-toggle-pill button { width: 34px; height: 32px; border-radius: 9999px; border: none; background: transparent; color: var(--c-text-soft); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.view-toggle-pill button.active { background: linear-gradient(135deg, #FF7A00, #FFA64D); color: #fff; box-shadow: 0 4px 12px -4px rgba(255,122,0,0.6); }
.view-toggle-pill button:active { transform: scale(0.88); }
.bzr-cart-btn { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #FF7A00 0%, #FFA64D 100%); border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 1.05rem; position: relative; box-shadow: 0 6px 18px -6px rgba(255,122,0,0.75); transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s; }
.bzr-cart-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -6px rgba(255,122,0,0.9); }
.bzr-cart-btn:active { transform: scale(0.92); }
.bzr-cart-btn svg { width: 22px; height: 22px; }
.bzr-cart-badge { position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 5px; background: #EF4444; color: #fff; border-radius: 9999px; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 3px 8px rgba(239,68,68,0.5); }
body.theme-dark .bzr-cart-badge { border-color: #1E293B; }
@keyframes cartBounce { 0% { transform: scale(1) rotate(0); } 25% { transform: scale(1.15) rotate(-8deg); } 50% { transform: scale(1.2) rotate(8deg); } 75% { transform: scale(1.15) rotate(-4deg); } 100% { transform: scale(1) rotate(0); } }
.bzr-cart-btn.bounce { animation: cartBounce 0.6s ease; }

/* ═══ SEARCH BAR ═══ */
.bzr-search-bar-wrap { position: sticky; top: calc(var(--safe-top) + var(--app-bar-h)); z-index: 95; background: rgba(255,255,255,0.92); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); border-bottom: 1px solid var(--c-border); padding: 8px 0; }
.bzr-search-inner { max-width: 1400px; margin: 0 auto; padding: 0 12px; }
.bzr-search-input { display: flex; align-items: center; gap: 10px; background: var(--c-surface-2); border: 1.5px solid transparent; border-radius: 9999px; padding: 0 16px; height: 42px; transition: all 0.25s ease; }
.bzr-search-input:focus-within { border-color: #FF7A00; background: var(--c-surface); box-shadow: 0 0 0 4px rgba(255,122,0,0.12); }
.bzr-search-input i { color: var(--c-text-soft); font-size: 0.95rem; }
.bzr-search-input input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.92rem; color: var(--c-text); font-weight: 600; }
.bzr-search-input input::placeholder { color: var(--c-text-soft); font-weight: 500; }
.bzr-search-input .search-clear { width: 26px; height: 26px; border-radius: 50%; background: transparent; border: none; color: var(--c-text-soft); cursor: pointer; display: none; align-items: center; justify-content: center; }
.bzr-search-input.has-value .search-clear { display: inline-flex; }
.bzr-search-results { position: fixed; top: calc(var(--safe-top) + var(--app-bar-h) + var(--search-bar-h) + 12px); left: 50%; transform: translateX(-50%); width: calc(100% - 24px); max-width: 640px; max-height: 60vh; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 20px; padding: 1rem; overflow-y: auto; box-shadow: 0 20px 60px rgba(15,23,42,0.25); z-index: 200; display: none; animation: dropdownIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes dropdownIn { from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
.bzr-search-results.show { display: block; }

/* ═══ BOTTOM NAV ═══ */
#bzrBottomNav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 900; background: rgba(255,255,255,0.95); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); border-top: 1px solid var(--c-border); padding-bottom: var(--safe-bottom); box-shadow: 0 -2px 14px rgba(15,23,42,0.06); }
.bzr-nav-list { display: grid; grid-template-columns: repeat(4, 1fr); height: var(--bottom-nav-h); max-width: 640px; margin: 0 auto; }
.bzr-nav-item { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; background: transparent; border: none; cursor: pointer; color: #94A3B8; font-weight: 700; font-size: 0.68rem; transition: color 0.25s; padding: 0; overflow: hidden; }
.bzr-nav-item > i { font-size: 1.15rem; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.bzr-nav-item span:not(.bzr-nav-badge) { font-weight: 700; font-size: 0.66rem; }
.bzr-nav-item.active { color: #FF7A00; }
.bzr-nav-item.active > i { transform: translateY(-3px) scale(1.15); }
.bzr-nav-item.active::after { content: ''; position: absolute; top: 4px; right: 50%; transform: translateX(50%); width: 22px; height: 3px; border-radius: 3px; background: linear-gradient(90deg, #FF7A00, #FFA64D); }
.bzr-nav-item:active > i { transform: scale(0.85); }
.bzr-nav-item .bzr-nav-badge { position: absolute; top: 6px; right: calc(50% - 18px); min-width: 18px; height: 18px; padding: 0 5px; background: #EF4444; color: #fff; border-radius: 999px; font-size: 0.6rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

/* ═══ BUTTONS ═══ */
.btn-primary { background: linear-gradient(135deg, #FF7A00 0%, #FFA64D 100%); color: #fff; font-weight: 800; border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.25s; box-shadow: 0 6px 20px -6px rgba(255,122,0,0.6); position: relative; overflow: hidden; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px -6px rgba(255,122,0,0.75); }
.btn-primary:active { transform: translateY(0) scale(0.97); }
.ripple { position: relative; overflow: hidden; }
.ripple::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, transparent 60%); transform: scale(0); opacity: 0; pointer-events: none; }
.ripple.animate::after { animation: rippleAnim 0.6s ease; }
@keyframes rippleAnim { from { transform: scale(0); opacity: 0.7; } to { transform: scale(2); opacity: 0; } }

/* ═══ CARDS ═══ */
.store-card { width: 260px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(15,23,42,0.06); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s; cursor: pointer; flex-shrink: 0; }
@media (max-width: 380px) { .store-card { width: 220px; } }
body.view-desktop .store-card { width: 220px; }
body.view-desktop .store-card .cover-image { height: 120px; }
body.view-desktop .store-card .store-logo { width: 58px; height: 58px; margin-top: -29px; margin-right: 14px; border-width: 3px; }
body.view-desktop .store-card .store-info { padding: 0 14px 14px; }
body.view-desktop .store-card .store-name { font-size: 0.92rem; }
body.view-desktop .store-card .store-category { font-size: 0.75rem; }
.store-card:hover { transform: translateY(-6px); box-shadow: 0 14px 34px rgba(255,122,0,0.15); border-color: #FFE0BD; }
.store-card:active { transform: translateY(-2px) scale(0.98); }
.store-card .cover-image { height: 140px; width: 100%; object-fit: cover; display: block; }
.store-card .store-logo { width: 68px; height: 68px; border-radius: 50%; border: 4px solid var(--c-surface); object-fit: cover; margin-top: -34px; margin-right: 18px; position: relative; z-index: 2; background: var(--c-surface); box-shadow: 0 4px 12px rgba(15,23,42,0.12); }
.store-card .store-info { padding: 0 18px 18px; text-align: right; }
.store-card .store-name { font-weight: 800; font-size: 1.02rem; color: var(--c-text); display: flex; align-items: center; gap: 5px; margin-top: 6px; }
.store-card .store-category { color: var(--c-text-soft); font-size: 0.82rem; margin-top: 2px; }
.product-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 18px; overflow: hidden; box-shadow: 0 3px 12px rgba(15,23,42,0.05); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s; cursor: pointer; display: flex; flex-direction: column; }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(255,122,0,0.14); border-color: #FFE0BD; }
.product-card:active { transform: translateY(-1px) scale(0.98); }
.product-image-container { background: var(--c-surface-2); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; height: 140px; }
@media (min-width: 640px) { .product-image-container { height: 170px; } }
.product-image-container img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.35s ease; padding: 8px; }
.product-card:hover .product-image-container img { transform: scale(1.06); }
.verified-icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: linear-gradient(135deg, #3B82F6, #1E40AF); border-radius: 50%; color: #fff; font-size: 10px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(30,64,175,0.4); }
.all-products-total-badge { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #FF7A00, #FFA64D); color: #fff; border-radius: 9999px; padding: 0.4rem 0.9rem; font-size: 0.78rem; font-weight: 800; white-space: nowrap; box-shadow: 0 6px 16px -6px rgba(255,122,0,0.65); }

/* ═══ PRODUCTS GRID ═══ */
#allProductsGrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; }
body.view-desktop #allProductsGrid { grid-template-columns: repeat(3, 1fr); gap: 0.7rem; }
@media (min-width: 640px) { #allProductsGrid { grid-template-columns: repeat(3, 1fr); gap: 1rem; } body.view-desktop #allProductsGrid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { #allProductsGrid { grid-template-columns: repeat(4, 1fr); } body.view-desktop #allProductsGrid { grid-template-columns: repeat(5, 1fr); } }

/* ═══ SCROLL ═══ */
.stores-scroll-container { overflow-x: auto; overflow-y: hidden; display: flex; gap: 1rem; padding-bottom: 1rem; scrollbar-width: thin; direction: ltr; -webkit-overflow-scrolling: touch; scroll-behavior: auto; }
.stores-scroll-container > * { direction: rtl; }
.stores-scroll-container::-webkit-scrollbar { height: 6px; }
.stores-scroll-container::-webkit-scrollbar-thumb { background: #FF7A00; border-radius: 6px; }
.categories-scroll-container { overflow-x: auto; overflow-y: hidden; display: flex; gap: 0.7rem; padding-bottom: 0.5rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.categories-scroll-container::-webkit-scrollbar { display: none; }
.scroll-btn { width: 38px; height: 38px; border-radius: 50%; background: var(--c-surface); border: 1.5px solid var(--c-border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-text-soft); transition: all 0.25s; }
.scroll-btn:hover { background: #FF7A00; color: #fff; border-color: #FF7A00; transform: scale(1.08); }
.scroll-btn:active { transform: scale(0.92); }
.chip { padding: 0.55rem 1.1rem; border-radius: 9999px; background: var(--c-surface); border: 1.5px solid var(--c-border); font-weight: 700; font-size: 0.85rem; color: var(--c-text-soft); white-space: nowrap; cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); flex-shrink: 0; }
.chip:hover { border-color: #FF7A00; color: #FF7A00; background: var(--c-primary-soft); transform: translateY(-1px); }
.chip:active { transform: scale(0.95); }
.chip.active { background: linear-gradient(135deg, #FF7A00, #FFA64D); color: #fff; border-color: #FF7A00; box-shadow: 0 6px 16px -6px rgba(255,122,0,0.6); }

/* ═══ MODALS ═══ */
.fullscreen-modal { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.25s ease; }
.fullscreen-modal.hidden { display: none; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fullscreen-modal .modal-content { width: 100%; height: 100%; background: var(--c-surface); overflow-y: auto; display: flex; flex-direction: column; -webkit-overflow-scrolling: touch; animation: modalSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes modalSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.product-modal { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 0.75rem; background: rgba(15,23,42,0.6); backdrop-filter: blur(8px); animation: fadeIn 0.2s ease; }
.product-modal.hidden { display: none; }
.product-modal .product-modal-content { background: var(--c-surface); border-radius: 24px; max-width: 620px; width: 100%; max-height: 92vh; overflow-y: auto; padding: 1.25rem; animation: zoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes zoomIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.product-modal-image-wrapper { width: 100%; height: 320px; background: var(--c-surface-2); border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 1rem; border: 1px solid var(--c-border); position: relative; }
@media (min-width: 640px) { .product-modal-image-wrapper { height: 420px; } }
#productModalImage { width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease, opacity 0.3s ease; }
.color-swatch { width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2.5px solid var(--c-border); transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1); position: relative; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(15,23,42,0.08); }
.color-swatch:hover { transform: scale(1.1); }
.color-swatch.active { border-color: #FF7A00; box-shadow: 0 0 0 3px rgba(255,122,0,0.25); transform: scale(1.15); }
.color-swatch.active::after { content: '\f00c'; font-family: 'Font Awesome 6 Free'; font-weight: 900; color: #fff; font-size: 14px; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
.color-swatch.active.light-color::after { color: #0F172A; text-shadow: none; }
.card-color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid #fff; box-shadow: 0 1px 3px rgba(15,23,42,0.2); }

/* ═══ CART ═══ */
#cartSidebar { position: fixed; top: 0; left: 0; height: 100%; width: 100%; max-width: 420px; background: var(--c-surface); z-index: 1500; transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1); display: flex; flex-direction: column; box-shadow: -4px 0 30px rgba(15,23,42,0.15); }
#cartSidebar.open { transform: translateX(0); }
#cartSidebar .cart-overlay { display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); z-index: -1; }
#cartSidebar.open .cart-overlay { display: block; animation: fadeIn 0.3s ease; }
@media (max-width: 640px) { #cartSidebar { max-width: 92%; } }
.cart-item-image { width: 60px; height: 60px; object-fit: contain; background: var(--c-surface-2); border-radius: 12px; flex-shrink: 0; padding: 4px; }

/* ═══ STORE DETAIL ═══ */
.store-cover-wrap { position: relative; width: 100%; height: 200px; flex-shrink: 0; overflow: hidden; background: var(--c-surface-2); }
@media (min-width: 480px) { .store-cover-wrap { height: 240px; } }
@media (min-width: 768px) { .store-cover-wrap { height: 300px; } }
.store-cover-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.store-close-btn { position: absolute; top: 14px; right: 14px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); color: #0F172A; border: none; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; cursor: pointer; box-shadow: 0 6px 20px rgba(15,23,42,0.2); transition: all 0.25s; z-index: 10; }
.store-close-btn:active { transform: scale(0.92); }
.store-share-btn { position: absolute; top: 14px; left: 14px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); color: #FF7A00; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.95rem; box-shadow: 0 6px 20px rgba(15,23,42,0.2); transition: all 0.25s; z-index: 20; }
.store-share-btn:hover { background: #FF7A00; color: #fff; transform: scale(1.08); }
.store-info-card { position: relative; background: var(--c-surface); padding: 0 1rem 1.5rem; margin-top: -42px; z-index: 5; border-radius: 28px 28px 0 0; }
@media (min-width: 640px) { .store-info-card { padding: 0 1.75rem 2rem; margin-top: -52px; } }
.store-header-row { display: flex; align-items: flex-end; gap: 0.85rem; padding-top: 10px; }
.store-header-logo { width: 88px; height: 88px; border-radius: 50%; border: 4px solid var(--c-surface); object-fit: cover; background: var(--c-surface); box-shadow: 0 8px 24px rgba(15,23,42,0.15); flex-shrink: 0; }
@media (min-width: 640px) { .store-header-logo { width: 104px; height: 104px; } }
@media (min-width: 768px) { .store-header-logo { width: 116px; height: 116px; border-width: 5px; } }
.store-header-info { flex: 1; min-width: 0; padding-bottom: 4px; text-align: right; }
.store-header-name { font-size: 1.25rem; font-weight: 900; color: var(--c-text); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; line-height: 1.25; }
.store-header-meta { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 0.88rem; flex-wrap: wrap; }
.store-meta-rating { display: inline-flex; align-items: center; gap: 4px; color: #FF7A00; font-weight: 900; background: var(--c-primary-soft); border: 1px solid #FFE0BD; padding: 0.2rem 0.6rem; border-radius: 9999px; }
.store-meta-category { display: inline-flex; align-items: center; gap: 5px; color: var(--c-secondary); font-weight: 700; font-size: 0.82rem; background: var(--c-secondary-soft); padding: 0.25rem 0.7rem; border-radius: 9999px; }
.store-desc { text-align: center; color: var(--c-text-soft); font-size: 0.92rem; line-height: 1.9; margin: 1.1rem auto 0; max-width: 640px; }
.store-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; margin-top: 1.35rem; }
.store-action-btn { display: flex; align-items: center; justify-content: center; gap: 8px; height: 52px; padding: 0 0.75rem; border-radius: 9999px; border: 2px solid #FF7A00; background: var(--c-surface); color: #FF7A00; font-weight: 800; font-size: 0.88rem; cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); text-decoration: none; white-space: nowrap; overflow: hidden; }
.store-action-btn:hover { background: var(--c-primary-soft); transform: translateY(-2px); }
.store-action-btn:active { transform: scale(0.96); }
.store-action-btn.primary { background: linear-gradient(135deg, #FF7A00, #FFA64D); color: #fff; border-color: #FF7A00; }
.store-action-btn.primary.following { background: var(--c-surface); color: #FF7A00; }
.store-action-btn.static { cursor: default; pointer-events: none; }
.store-action-btn .icon-circle { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; font-size: 0.95rem; background: linear-gradient(135deg, #FF7A00, #FFA64D); }
.store-products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding-bottom: 1.5rem; }
@media (min-width: 640px) { .store-products-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; } }
@media (min-width: 1024px) { .store-products-grid { grid-template-columns: repeat(4, 1fr); } }
.store-product-card { position: relative; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 18px; overflow: hidden; box-shadow: 0 2px 10px rgba(15,23,42,0.05); transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); display: flex; flex-direction: column; cursor: pointer; }
.store-product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 26px rgba(255,122,0,0.15); border-color: #FFE0BD; }
.store-product-card:active { transform: scale(0.98); }
.store-product-img-wrap { width: 100%; height: 140px; background: var(--c-surface-2); display: flex; align-items: center; justify-content: center; padding: 8px; overflow: hidden; }
.store-product-img-wrap img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.3s ease; }
.store-product-info { padding: 0.6rem 0.85rem 0.9rem; display: flex; flex-direction: column; gap: 5px; flex: 1; }
.store-product-name { font-size: 0.92rem; font-weight: 800; color: var(--c-text); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.store-product-rating { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; color: #FF7A00; font-weight: 800; }
.store-product-price { font-size: 1rem; font-weight: 900; color: #FF7A00; text-align: right; margin-top: auto; }
.store-product-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 40px; background: linear-gradient(135deg, #FF7A00, #FFA64D); color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: all 0.25s ease; }
.store-product-btn:active { transform: scale(0.96); }
.store-product-fav { position: absolute; top: 10px; left: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.95); border: none; display: flex; align-items: center; justify-content: center; color: #FF7A00; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 8px rgba(15,23,42,0.1); transition: all 0.25s ease; z-index: 3; }
.store-product-fav.active { background: #FF7A00; color: #fff; }

/* ═══ ACCOUNT MODAL ═══ */
#accountModal { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.25s ease; }
#accountModal.hidden { display: none; }
#accountModal .account-overlay { position: absolute; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(8px); }
.account-sheet { position: relative; background: var(--c-surface); border-radius: 28px 28px 0 0; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; padding: 1.5rem 1.25rem calc(2rem + var(--safe-bottom)); animation: sheetUp 0.4s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.account-handle { width: 42px; height: 4px; border-radius: 4px; background: var(--c-border); margin: 0 auto 1.25rem; }
.account-close-btn { position: absolute; top: 14px; left: 14px; width: 36px; height: 36px; border-radius: 50%; background: var(--c-surface-2); border: none; color: var(--c-text-soft); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
.account-close-btn:hover { background: var(--c-border); }
.account-header { text-align: center; margin-bottom: 1.75rem; }
.account-avatar { width: 84px; height: 84px; border-radius: 50%; overflow: hidden; background: #fff; margin: 0 auto 1rem; padding: 6px; box-shadow: 0 12px 32px -8px rgba(255,122,0,0.5), 0 0 0 6px rgba(255,122,0,0.08); }
.account-avatar img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
.account-welcome { font-size: 0.85rem; color: var(--c-text-soft); font-weight: 700; margin-bottom: 0.3rem; }
.account-brand { font-size: 1.4rem; font-weight: 900; color: var(--c-text); }
.account-brand span { color: #FF7A00; }
.account-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem; }
.account-action-btn { display: flex; align-items: center; gap: 14px; padding: 1rem 1.1rem; border-radius: 18px; background: var(--c-surface); border: 1.5px solid var(--c-border); color: var(--c-text); text-decoration: none; cursor: pointer; font-family: 'Cairo', sans-serif; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); text-align: right; width: 100%; }
.account-action-btn:hover { transform: translateY(-2px); border-color: #FF7A00; box-shadow: 0 8px 22px -8px rgba(255,122,0,0.4); }
.account-action-btn:active { transform: scale(0.98); }
.account-action-btn.primary { background: linear-gradient(135deg, #FF7A00, #FFA64D); border-color: #FF7A00; color: #fff; box-shadow: 0 10px 26px -10px rgba(255,122,0,0.7); }
.account-action-btn.primary .action-icon { background: rgba(255,255,255,0.22); color: #fff; }
.account-action-btn.primary .action-info span { color: rgba(255,255,255,0.85); }
.account-action-btn.primary .action-arrow { color: rgba(255,255,255,0.85); }
.action-icon { width: 48px; height: 48px; border-radius: 14px; background: var(--c-primary-soft); color: #FF7A00; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.action-icon.secondary { background: var(--c-secondary-soft); color: var(--c-secondary); }
.action-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; text-align: right; }
.action-info strong { font-size: 0.98rem; font-weight: 800; }
.action-info span { font-size: 0.78rem; color: var(--c-text-soft); font-weight: 600; }
.action-arrow { color: var(--c-text-soft); font-size: 0.85rem; flex-shrink: 0; }
.account-section { background: var(--c-surface-2); border-radius: 20px; padding: 1.25rem 1rem; }
.account-section-title { font-size: 0.78rem; font-weight: 800; color: var(--c-text-soft); text-transform: uppercase; letter-spacing: 1px; margin: 0 4px 1rem; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--c-border); }
.setting-row:last-child { border-bottom: none; }
.setting-label { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 0.9rem; color: var(--c-text); }
.setting-label i { color: #FF7A00; width: 20px; text-align: center; font-size: 0.95rem; }
.switch { position: relative; width: 46px; height: 26px; border-radius: 999px; background: var(--c-border); cursor: pointer; transition: background 0.25s; flex-shrink: 0; }
.switch::after { content: ''; position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1); }
.switch.on { background: linear-gradient(135deg, #FF7A00, #FFA64D); }
.switch.on::after { transform: translateX(-20px); }

/* ═══ CREATE STORE MODAL ═══ */
#createStoreModal { position: fixed; inset: 0; z-index: 3100; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(15,23,42,0.7); backdrop-filter: blur(10px); animation: fadeIn 0.25s ease; }
#createStoreModal.hidden { display: none; }
.create-store-box { background: var(--c-surface); border-radius: 28px; width: 100%; max-width: 460px; padding: 2rem 1.5rem; text-align: center; animation: zoomIn 0.35s cubic-bezier(0.34,1.56,0.64,1); position: relative; }
.create-store-icon { width: 84px; height: 84px; border-radius: 50%; background: linear-gradient(135deg, #FF7A00, #FFA64D); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.25rem; box-shadow: 0 18px 40px -12px rgba(255,122,0,0.7); animation: bzrLogoPulse 2.5s ease-in-out infinite; }
.create-store-title { font-size: 1.3rem; font-weight: 900; color: var(--c-text); margin: 0 0 0.6rem; }
.create-store-title span { background: linear-gradient(135deg,#FF7A00,#FFA64D); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.create-store-desc { font-size: 0.9rem; color: var(--c-text-soft); line-height: 1.9; margin: 0 0 1.75rem; max-width: 340px; margin-inline: auto; }
.create-store-features { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 1.75rem; }
.create-store-features span { display: inline-flex; align-items: center; gap: 5px; background: var(--c-surface-2); color: var(--c-text); padding: 0.4rem 0.75rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; border: 1px solid var(--c-border); }
.create-store-features i { color: #FF7A00; font-size: 0.72rem; }
.create-store-wa-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 54px; background: linear-gradient(135deg,#25D366,#128C7E); color: #fff; border: none; border-radius: 16px; font-weight: 800; font-size: 0.98rem; text-decoration: none; box-shadow: 0 12px 28px -10px rgba(37,211,102,0.7); transition: all 0.25s; margin-bottom: 0.6rem; font-family: 'Cairo', sans-serif; }
.create-store-wa-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 34px -10px rgba(37,211,102,0.9); }
.create-store-cancel { width: 100%; height: 46px; background: var(--c-surface-2); color: var(--c-text-soft); border: none; border-radius: 14px; font-weight: 700; font-size: 0.88rem; cursor: pointer; font-family: 'Cairo', sans-serif; transition: all 0.2s; }
.create-store-cancel:hover { background: var(--c-border); color: var(--c-text); }

/* ═══ HERO ═══ */
.hero-section { position: relative; padding: 2rem 1rem 2.5rem; background: linear-gradient(180deg, #FFF7ED 0%, var(--c-bg) 100%); overflow: hidden; }
body.theme-dark .hero-section { background: linear-gradient(180deg, #1E293B 0%, var(--c-bg) 100%); }
.hero-section::before { content: ''; position: absolute; top: -100px; right: -100px; width: 320px; height: 320px; background: radial-gradient(circle, rgba(255,122,0,0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
.hero-section::after { content: ''; position: absolute; bottom: -120px; left: -120px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(30,64,175,0.08) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }

/* ═══ MISC ═══ */
.load-more-btn { background: var(--c-surface); color: #FF7A00; border: 2px solid #FF7A00; padding: 0.85rem 2.2rem; border-radius: 9999px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1); display: inline-flex; align-items: center; gap: 10px; }
.load-more-btn:hover { background: #FF7A00; color: #fff; transform: translateY(-3px); }
.load-more-btn:active { transform: scale(0.95); }
.load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.load-more-btn.hidden { display: none; }
.hidden { display: none !important; }
#installButtonFloating { position: fixed; bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px); right: 16px; z-index: 9999; background: linear-gradient(135deg, #1E40AF, #3B82F6); color: #fff; border: none; border-radius: 9999px; padding: 0.8rem 1.4rem; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 24px -6px rgba(30,64,175,0.6); transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); cursor: pointer; white-space: nowrap; opacity: 0; pointer-events: none; transform: translateY(20px); }
#installButtonFloating.show { opacity: 1; pointer-events: auto; transform: translateY(0); }

/* ═══════════════════════════════════════════
   UPDATE BUTTON — نسخة أنيقة v2
   ═══════════════════════════════════════════ */
#updateAvailableBtn {
  position: fixed;
  top: calc(var(--safe-top) + 12px);
  left: 50%;
  transform: translate(-50%, calc(-100% - 40px));
  z-index: 10002;
  background: linear-gradient(135deg, #FF7A00 0%, #FFA64D 100%);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 9999px;
  padding: 0.55rem 1.15rem 0.55rem 0.55rem;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 45px -12px rgba(255,122,0,0.85), 0 8px 20px -8px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, opacity 0.3s;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
  max-width: calc(100% - 24px);
  pointer-events: none;
  opacity: 0;
}
#updateAvailableBtn.show {
  transform: translate(-50%, 0);
  pointer-events: auto;
  opacity: 1;
  animation: updatePulse 2.5s ease-in-out infinite;
}
#updateAvailableBtn:hover {
  box-shadow: 0 25px 55px -12px rgba(255,122,0,1), 0 10px 25px -8px rgba(0,0,0,0.35);
}
#updateAvailableBtn:active { transform: translate(-50%, 0) scale(0.97); }
#updateAvailableBtn:disabled { cursor: wait; opacity: 0.9; }
.update-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.update-icon-wrap i {
  color: #fff;
  font-size: 1.15rem;
  animation: bounceUpdate 2s ease-in-out infinite;
}
@keyframes bounceUpdate {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.update-text-wrap {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  text-align: right;
}
.update-text-wrap strong {
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.2px;
}
.update-text-wrap span {
  font-size: 0.72rem;
  opacity: 0.92;
  font-weight: 600;
  margin-top: 2px;
}
.update-arrow {
  color: rgba(255,255,255,0.85);
  font-size: 0.75rem;
  flex-shrink: 0;
  animation: slideArrow 1.5s ease-in-out infinite;
}
@keyframes slideArrow {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
}
@keyframes updatePulse {
  0%, 100% { box-shadow: 0 20px 45px -12px rgba(255,122,0,0.85), 0 8px 20px -8px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 20px 50px -10px rgba(255,122,0,1), 0 8px 35px -4px rgba(255,122,0,0.7); }
}
@media (max-width: 480px) {
  #updateAvailableBtn { padding: 0.5rem 0.9rem 0.5rem 0.5rem; gap: 9px; }
  .update-icon-wrap { width: 38px; height: 38px; }
  .update-icon-wrap i { font-size: 1rem; }
  .update-text-wrap strong { font-size: 0.82rem; }
  .update-text-wrap span { font-size: 0.66rem; }
}

#notifPermissionBanner { position: fixed; bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px); left: 50%; transform: translate(-50%, 200%); z-index: 9998; background: var(--c-surface); border: 2px solid #FFE0BD; border-radius: 24px; padding: 18px; box-shadow: 0 25px 70px rgba(255,122,0,0.25); max-width: 440px; width: calc(100% - 32px); transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s; direction: rtl; opacity: 0; pointer-events: none; }
#notifPermissionBanner.show { transform: translate(-50%, 0); opacity: 1; pointer-events: auto; }
.notif-bell-icon { width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #FF7A00, #FFA64D); display: flex; align-items: center; justify-content: center; flex-shrink: 0; animation: bellRing 3s ease-in-out infinite; box-shadow: 0 10px 24px -6px rgba(255,122,0,0.6); }
@keyframes bellRing { 0%,100% { transform: rotate(0); } 5%,15%,25% { transform: rotate(-14deg); } 10%,20%,30% { transform: rotate(14deg); } 35% { transform: rotate(0); } }
.notif-bell-icon i { color: #fff; font-size: 1.5rem; }
.notif-btn-enable { display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; height: 46px; background: linear-gradient(135deg, #FF7A00, #FFA64D); color: #fff; border: none; border-radius: 9999px; font-weight: 800; font-size: 0.9rem; cursor: pointer; }
.notif-btn-dismiss { display: flex; align-items: center; justify-content: center; height: 46px; padding: 0 20px; background: var(--c-surface-2); color: var(--c-text-soft); border: none; border-radius: 9999px; font-weight: 700; font-size: 0.88rem; cursor: pointer; }
#pushToast { position: fixed; top: 20px; left: 50%; transform: translate(-50%, -200%); z-index: 10000; background: var(--c-surface); border: 2px solid #FF7A00; border-radius: 18px; padding: 14px 18px; box-shadow: 0 20px 50px rgba(255,122,0,0.35); max-width: 380px; width: calc(100% - 32px); display: flex; align-items: center; gap: 12px; transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); direction: rtl; }
#pushToast.show { transform: translate(-50%, 0); }
#pushToast .push-icon { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #FF7A00, #FFA64D); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
#pushToast .push-icon i { color: #fff; font-size: 1.1rem; }
#toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background: #0F172A; color: #fff; padding: 0.75rem 1.5rem; border-radius: 9999px; z-index: 3000; opacity: 0; pointer-events: none; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); font-weight: 700; font-size: 0.9rem; box-shadow: 0 15px 40px rgba(15,23,42,0.35); max-width: 90vw; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
#newStoreNotification { position: fixed; bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px); left: 16px; z-index: 9998; background: var(--c-surface); border-radius: 18px; padding: 12px 16px; box-shadow: 0 10px 40px rgba(255,122,0,0.18); border: 1.5px solid #FFE0BD; display: flex; align-items: center; gap: 12px; max-width: 360px; width: calc(100% - 32px); transform: translateX(-120%); transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); direction: rtl; cursor: pointer; overflow: hidden; }
#newStoreNotification.show { transform: translateX(0); }
.notif-pulse { position: absolute; top: 14px; left: 14px; width: 8px; height: 8px; background: #FF7A00; border-radius: 50%; box-shadow: 0 0 0 0 rgba(255,122,0,0.7); animation: pulseNotif 2s infinite; }
@keyframes pulseNotif { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,122,0,0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255,122,0,0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,122,0,0); } }
.followed-scroll-container { overflow-x: auto; overflow-y: hidden; display: flex; gap: 0.8rem; padding: 0.75rem 0 1rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.followed-scroll-container::-webkit-scrollbar { display: none; }
.followed-store-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; width: 80px; cursor: pointer; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.followed-store-item:active { transform: scale(0.92); }
.followed-store-avatar { width: 62px; height: 62px; border-radius: 50%; border: 3px solid #FF7A00; background: var(--c-surface); padding: 3px; box-shadow: 0 4px 12px rgba(255,122,0,0.25); overflow: hidden; }
.followed-store-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; pointer-events: none; }
.followed-store-name { font-size: 0.72rem; font-weight: 700; color: var(--c-text); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
@media print { body * { display: none !important; } body::before { content: '© 2026 BranZar | المحتوى محمي'; display: block !important; font-family: 'Cairo', sans-serif; color: #FF7A00; text-align: center; padding: 3rem; direction: rtl; font-weight: 900; } }
.bzr-page-fade { animation: pageFade 0.4s ease; }
@keyframes pageFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
</head>
<body class="font-cairo">

<!-- SPLASH -->
<div id="bzrSplash">
  <img src="https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png" class="bzr-splash-logo" alt="BranZar" fetchpriority="high">
  <div class="bzr-splash-title">بران زار <span>- BranZar</span></div>
  <div class="bzr-splash-subtitle">أكبر سوق إلكتروني للبراندات</div>
  <div class="bzr-splash-loader"></div>
</div>

<!-- SECURITY SHIELD -->
<script>
(function BZR_SHIELD(){
'use strict';
const _K = { b:[66,114,97,110,90,97,114], ar:[0x628,0x631,0x627,0x646,0x20,0x632,0x627,0x631], d:[98,114,97,110,122,97,114,46,118,101,114,99,101,108,46,97,112,112], s:'CORE-2026-SIG-v6', o:'BRANZAR-OWNER-2026' };
const _d = a => { let o=''; for(let i=0;i<a.length;i++) o += String.fromCharCode(a[i]); return o; };
const BRAND = _d(_K.b), BRAND_AR = _d(_K.ar), DOMAIN = _d(_K.d), OWNER = _K.o;
const _FULL_SIG = BRAND + '-' + _K.s;
const _BZR_NONCE = (Math.random().toString(36) + Date.now().toString(36)).slice(2, 18);
const ALLOWED_HOSTS = [DOMAIN, 'branzar.vercel.app', 'branzar.app', 'localhost', '127.0.0.1'];
const currentHost = location.hostname.toLowerCase();

try { if (window.location.protocol === 'view-source:') { document.documentElement.innerHTML = '<head><meta charset="UTF-8"><title>⛔ Protected</title></head><body style="margin:0;background:#0a0a0a;color:#FF7A00;font-family:Cairo,sans-serif;direction:rtl;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;"><div><div style="font-size:5rem;margin-bottom:1rem;">🛡️</div><h1>المصدر محمي</h1></div></body>'; window.stop(); return; } } catch(e){}
if (ALLOWED_HOSTS.indexOf(currentHost) === -1) { document.documentElement.innerHTML = '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:Cairo,sans-serif;text-align:center;padding:2rem;direction:rtl;z-index:2147483647;"><div><div style="font-size:5rem;margin-bottom:1rem;">🔒</div><h1 style="font-size:1.8rem;font-weight:900;color:#FF7A00;">الوصول غير مصرح به</h1></div></div>'; throw new Error('BZR_UNLICENSED'); }
try { if (window.self !== window.top) window.top.location = window.self.location.href; } catch(e){ throw new Error('BZR_IFRAME'); }
try { console.log('%c⚠️ توقف!', 'color:#FF7A00;font-size:22px;font-weight:900;'); console.log('%c© 2026 ' + BRAND, 'color:#FF7A00;font-weight:bold;'); } catch(e){}

const _blockedKeys = { 'F12':1,'u':1,'U':1,'s':1,'S':1,'p':1,'P':1,'a':1,'A':1,'c':1,'C':1,'v':1,'V':1,'x':1,'X':1 };
const _blockedShiftKeys = { 'I':1,'J':1,'C':1,'K':1,'E':1,'i':1,'j':1,'c':1,'k':1,'e':1 };
document.addEventListener('keydown', function(e){
  const k = e.key || '';
  const tag = (e.target && e.target.tagName || '').toLowerCase();
  const isInput = tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable);
  if (k === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
  if (e.ctrlKey && e.shiftKey && _blockedShiftKeys[k]) { e.preventDefault(); e.stopPropagation(); return false; }
  if (e.metaKey && e.altKey && _blockedShiftKeys[k]) { e.preventDefault(); e.stopPropagation(); return false; }
  if (e.ctrlKey && _blockedKeys[k] && !isInput) { e.preventDefault(); e.stopPropagation(); return false; }
  if (e.metaKey && _blockedKeys[k] && !isInput) { e.preventDefault(); e.stopPropagation(); return false; }
  return true;
}, true);
document.addEventListener('contextmenu', function(e){
  const t = (e.target && e.target.tagName || '').toLowerCase();
  if (t === 'input' || t === 'textarea') return;
  e.preventDefault(); return false;
}, false);
try { if (window.print) window.print = function(){ return false; }; } catch(e){}
window.addEventListener('beforeprint', function(e){ e.preventDefault(); try { if (document.body) { document.body.style.visibility = 'hidden'; setTimeout(() => { if (document.body) document.body.style.visibility = ''; }, 100); } } catch(err){} }, false);
document.addEventListener('copy', function(e){
  const t = (e.target && e.target.tagName || '').toLowerCase();
  if (t === 'input' || t === 'textarea') return true;
  e.preventDefault();
  try { if (e.clipboardData && e.clipboardData.setData) e.clipboardData.setData('text/plain', '\n\n© 2026 ' + BRAND + ' — ' + BRAND_AR + '\nhttps://' + DOMAIN + '\n'); } catch(err){}
  return false;
}, false);
document.addEventListener('cut', function(e){
  const t = (e.target && e.target.tagName || '').toLowerCase();
  if (t === 'input' || t === 'textarea') return true;
  e.preventDefault(); return false;
}, false);
document.addEventListener('dragstart', function(e){ if (e.target && e.target.tagName === 'IMG') e.preventDefault(); }, false);
const _origSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value){
  if (key === 'myStoresCart' || key === 'branzarFollowedStores') { try { JSON.parse(value); } catch(e){ return; } }
  return _origSetItem.call(this, key, value);
};
const _trustedHosts = ['cdn.tailwindcss.com','cdnjs.cloudflare.com','www.gstatic.com','cdn.jsdelivr.net','apis.google.com',currentHost];
try {
  const _guard = new MutationObserver(function(m){
    for (let i=0;i<m.length;i++) {
      const nodes = m[i].addedNodes;
      for (let j=0;j<nodes.length;j++) {
        const node = nodes[j];
        if (node.nodeType === 1 && node.tagName === 'SCRIPT' && node.src) {
          try { const url = new URL(node.src, window.location.href); if (_trustedHosts.indexOf(url.hostname) === -1) node.remove(); } catch(e){ node.remove(); }
        }
      }
    }
  });
  _guard.observe(document.documentElement, { childList: true, subtree: true });
} catch(e){}
document.addEventListener('submit', function(e){
  const form = e.target;
  if (form.action) {
    try { const url = new URL(form.action, window.location.href); if (ALLOWED_HOSTS.indexOf(url.hostname) === -1) e.preventDefault(); } catch(err){ e.preventDefault(); }
  }
}, true);
const _authAttempts = { count: 0, lastReset: Date.now() };
window.__bzrCheckAuthRate = function(){ const now = Date.now(); if (now - _authAttempts.lastReset > 60000) { _authAttempts.count = 0; _authAttempts.lastReset = now; } _authAttempts.count++; return _authAttempts.count <= 10; };
const _IK = '__bzr_t0', _now = Date.now(), _prev = parseInt(localStorage.getItem(_IK) || '0');
if (!_prev) localStorage.setItem(_IK, _now.toString());
else if (_now < _prev - 86400000) { try { console.warn('🛡️ clock anomaly'); } catch(e){} }
try {
  const _meta = Object.freeze({ brand: BRAND, brandAr: BRAND_AR, domain: DOMAIN, owner: OWNER, sig: _FULL_SIG, nonce: _BZR_NONCE, sealed: true, ts: 'BZR-SEAL-V6' });
  Object.defineProperty(window, '__BZR_META__', { value: _meta, writable: false, configurable: false, enumerable: false });
  Object.defineProperty(window, '__BZR_OWNER__', { value: OWNER, writable: false, configurable: false, enumerable: false });
  Object.defineProperty(window, '__BZR_SIG__', { value: _FULL_SIG, writable: false, configurable: false, enumerable: false });
  Object.defineProperty(window, '__BZR_NONCE__', { value: _BZR_NONCE, writable: false, configurable: false, enumerable: false });
} catch(e){}
try {
  const marker = document.createElement('meta');
  marker.name = 'x-bzr-mark';
  marker.content = BRAND + '|' + _BZR_NONCE;
  marker.setAttribute('data-bzr-sealed', 'true');
  document.head.appendChild(marker);
} catch(e){}
const _origTitle = document.title;
const _brandRx = new RegExp(BRAND + '|' + BRAND_AR.replace(/\s/g, '\\s*'), 'i');
function _verifyIdentity(){
  try {
    const meta = window.__BZR_META__;
    if (!meta || meta.brand !== BRAND || meta.brandAr !== BRAND_AR || meta.owner !== OWNER || meta.sig !== _FULL_SIG || meta.sealed !== true) return false;
    if (!window.__BZR_OWNER__ || window.__BZR_OWNER__ !== OWNER) return false;
    const wsig = window.__BZR_SIG__;
    if (typeof wsig !== 'string' || wsig.indexOf(BRAND) !== 0) return false;
    if (!window.__BZR_NONCE__ || window.__BZR_NONCE__ !== meta.nonce) return false;
    const marker = document.querySelector('meta[name="x-bzr-mark"]');
    if (!marker || marker.getAttribute('data-bzr-sealed') !== 'true' || marker.content.indexOf(BRAND) !== 0) return false;
    const pt = (document.title || '').trim();
    if (pt && pt.length > 2 && !_brandRx.test(pt)) return false;
    return true;
  } catch(e){ return false; }
}
function _tripwire(){
  try { document.documentElement.innerHTML = '<head><meta charset="UTF-8"><title>⛔ ' + BRAND + ' Protected</title></head><body style="margin:0;background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 100%);color:#FF7A00;font-family:Cairo,sans-serif;direction:rtl;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;"><div style="max-width:520px;"><div style="font-size:6rem;margin-bottom:1.5rem;">🛡️</div><h1 style="font-size:2rem;font-weight:900;color:#FF7A00;">تم إيقاف الموقع</h1><p style="color:#ccc;line-height:2;">تم اكتشاف محاولة تعديل غير مصرح بها.</p><a href="https://' + DOMAIN + '" style="display:inline-block;padding:1rem 2.5rem;background:linear-gradient(135deg,#FF7A00,#FFA64D);color:#fff;border-radius:9999px;text-decoration:none;font-weight:800;">← زيارة الموقع الرسمي</a></div></body>'; } catch(e){}
  throw new Error('BZR_TAMPER');
}
let _shieldPaused = false;
document.addEventListener('visibilitychange', function(){ _shieldPaused = document.hidden; }, false);
let _devCheckTick = 0, _identityFailCount = 0;
const _shieldStartTime = Date.now();
setInterval(function(){
  if (_shieldPaused) return;
  if (Date.now() - _shieldStartTime < 6000) return;
  _devCheckTick++;
  if (_devCheckTick % 2 === 0) {
    const wGap = window.outerWidth - window.innerWidth;
    const hGap = window.outerHeight - window.innerHeight;
    const detected = (wGap > 200 || hGap > 200);
    if (detected && !window.__devOpen) { window.__devOpen = true; try { console.clear(); } catch(e){} }
    else if (!detected) window.__devOpen = false;
  }
  const t = document.title || '';
  if (t && !_brandRx.test(t) && t.length > 2) document.title = _origTitle;
  if (!_verifyIdentity()) { _identityFailCount++; if (_identityFailCount >= 2) _tripwire(); }
  else _identityFailCount = 0;
}, 2500);
setTimeout(function(){
  if (!(window.__BZR_META__ && window.__BZR_META__.sealed === true && typeof window.__BZR_SIG__ === 'string')) {
    try { document.documentElement.innerHTML = '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:Cairo,sans-serif;text-align:center;padding:2rem;direction:rtl;z-index:2147483647;"><div><h1 style="font-weight:900;color:#FF7A00;">تم اكتشاف تعديل غير مصرح</h1></div></div>'; } catch(e){}
  }
}, 3000);
})();
</script>

<!-- APP BAR -->
<header class="bzr-app-bar">
  <div class="bzr-app-bar-inner">
    <button class="bzr-logo-btn" id="logoMenuBtn" aria-label="الرئيسية">
      <div class="bzr-logo-circle"><img src="https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png" alt="BranZar" fetchpriority="high"></div>
      <div class="bzr-brand-text"><strong>بران زار</strong><small>BRANZAR</small></div>
    </button>
    <div class="bzr-app-actions">
      <div class="view-toggle-pill" role="tablist" aria-label="وضع العرض">
        <button id="viewMobileBtn" data-view="mobile" role="tab" aria-label="وضع الهاتف" title="وضع الهاتف"><i class="fas fa-mobile-alt"></i></button>
        <button id="viewDesktopBtn" data-view="desktop" role="tab" aria-label="وضع سطح المكتب" title="وضع سطح المكتب"><i class="fas fa-desktop"></i></button>
      </div>
      <button id="themeToggleBtn" class="icon-btn" aria-label="تبديل الوضع الداكن" title="تبديل الوضع الداكن"><i class="fas fa-moon"></i></button>
      <button id="cartButton" class="bzr-cart-btn" aria-label="السلة">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M6 8V7a6 6 0 1 1 12 0v1h1.5a1.5 1.5 0 0 1 1.49 1.67l-1.2 10A2 2 0 0 1 17.8 21.5H6.2a2 2 0 0 1-1.99-1.83l-1.2-10A1.5 1.5 0 0 1 4.5 8H6Zm2 0h8V7a4 4 0 1 0-8 0v1Z" fill="currentColor"/>
        </svg>
        <span id="cartCount" class="bzr-cart-badge" style="display:none;">0</span>
      </button>
    </div>
  </div>
</header>

<!-- SEARCH BAR -->
<div class="bzr-search-bar-wrap">
  <div class="bzr-search-inner">
    <div class="bzr-search-input" id="bzrSearchWrapper">
      <i class="fas fa-search"></i>
      <input id="searchInput" type="search" placeholder="ابحث عن متجر، منتج أو فئة..." autocomplete="off">
      <button class="search-clear" id="searchClearBtn" aria-label="مسح"><i class="fas fa-times-circle"></i></button>
    </div>
  </div>
</div>
<div id="searchResults" class="bzr-search-results"></div>

<!-- MAIN -->
<main class="bzr-page-fade" id="mainContent">

  <!-- HERO -->
  <section class="hero-section">
    <div style="max-width:960px;margin:0 auto;text-align:center;position:relative;z-index:2;">
      <h1 style="font-size:clamp(1.75rem, 5vw, 3rem);font-weight:900;line-height:1.25;margin:0 0 0.75rem;color:var(--c-text);">
        اكتشف أفضل<br>
        <span style="background:linear-gradient(135deg, #FF7A00, #FFA64D);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">المتاجر والبراندات</span>
      </h1>
      <p style="font-size:clamp(0.9rem, 2.5vw, 1.05rem);color:var(--c-text-soft);max-width:520px;margin:0 auto 1.5rem;line-height:1.85;font-weight:600;">
        أفضل البراندات والمتاجر السودانية والعالمية في مكان واحد.
      </p>
      <div style="display:flex;justify-content:center;gap:0.65rem;flex-wrap:wrap;">
        <a href="#stores" class="btn-primary ripple" style="display:inline-flex;align-items:center;gap:10px;padding:0.85rem 1.5rem;border-radius:9999px;font-size:0.92rem;text-decoration:none;"><i class="fas fa-store"></i><span>تصفح المتاجر</span></a>
        <a href="#all-products" class="ripple" style="display:inline-flex;align-items:center;gap:10px;padding:0.85rem 1.5rem;border-radius:9999px;font-size:0.92rem;text-decoration:none;background:var(--c-surface);color:var(--c-secondary);border:1.5px solid var(--c-border);font-weight:800;"><i class="fas fa-boxes-stacked"></i><span>المنتجات</span></a>
      </div>
    </div>
  </section>

  <!-- FOLLOWED STORES -->
  <section id="followedStoresSection" class="hidden" style="padding:1rem 0 0.5rem;">
    <div class="bzr-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FF7A00,#FFA64D);display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.9rem;box-shadow:0 6px 16px -6px rgba(255,122,0,0.6);"><i class="fas fa-heart"></i></div>
          <div>
            <h2 style="font-size:1.1rem;font-weight:900;color:var(--c-text);margin:0;">المتاجر التي تتابعها</h2>
            <p style="font-size:0.75rem;color:var(--c-text-soft);margin:2px 0 0;font-weight:600;">وصولك السريع للمتاجر المفضلة</p>
          </div>
        </div>
        <span id="followedCountBadge" style="font-size:0.72rem;font-weight:800;background:var(--c-primary-soft);color:#FF7A00;border:1px solid #FFE0BD;padding:0.3rem 0.75rem;border-radius:9999px;"></span>
      </div>
      <div id="followedStoresContainer" class="followed-scroll-container"></div>
    </div>
  </section>

  <!-- STORES -->
  <section id="stores" style="padding:1.5rem 0 2rem;">
    <div class="bzr-container">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1.25rem;gap:1rem;flex-wrap:wrap;">
        <div>
          <h2 style="font-size:clamp(1.25rem,3vw,1.75rem);font-weight:900;color:var(--c-text);margin:0;">المتاجر المميزة</h2>
          <p style="color:var(--c-text-soft);font-size:0.85rem;font-weight:600;margin:0.25rem 0 0;">تصفح أفضل المتاجر الموثوقة</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="prevStoresBtn" class="scroll-btn"><i class="fas fa-chevron-right"></i></button>
          <button id="nextStoresBtn" class="scroll-btn"><i class="fas fa-chevron-left"></i></button>
        </div>
      </div>
      <div id="storesScrollContainer" class="stores-scroll-container"></div>
      <div id="storesLoader" class="hidden" style="text-align:center;padding:3rem 0;">
        <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF7A00;margin-bottom:0.75rem;display:block;"></i>
        <p style="color:var(--c-text-soft);font-weight:600;">جاري تحميل المتاجر...</p>
      </div>
      <div id="storesEmpty" class="hidden" style="text-align:center;padding:3rem 0;">
        <i class="fas fa-store-slash" style="font-size:3rem;color:#CBD5E1;margin-bottom:0.75rem;display:block;"></i>
        <p id="storesErrorMessage" style="color:var(--c-text-soft);margin-bottom:1rem;">لا توجد متاجر</p>
        <button id="retryStoresBtn" class="btn-primary ripple" style="padding:0.7rem 1.75rem;border-radius:9999px;">إعادة المحاولة</button>
      </div>
    </div>
  </section>

  <!-- CATEGORIES -->
  <section id="categories" style="padding:1.5rem 0 1rem;background:var(--c-surface);border-top:1px solid var(--c-border);border-bottom:1px solid var(--c-border);">
    <div class="bzr-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;gap:1rem;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:0.85rem;flex-wrap:wrap;">
          <h2 style="font-size:clamp(1.15rem,2.8vw,1.5rem);font-weight:900;color:var(--c-text);margin:0;">التصنيفات</h2>
          <span id="categoriesTotalBadge" class="all-products-total-badge"><i class="fas fa-boxes-stacked"></i><span id="categoriesTotalCount">0</span><span>منتج</span></span>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="prevCategoriesBtn" class="scroll-btn"><i class="fas fa-chevron-right"></i></button>
          <button id="nextCategoriesBtn" class="scroll-btn"><i class="fas fa-chevron-left"></i></button>
        </div>
      </div>
      <div id="categoriesContainer" class="categories-scroll-container"></div>
    </div>
  </section>

  <!-- ALL PRODUCTS -->
  <section id="all-products" style="padding:2rem 0 3rem;background:var(--c-surface);">
    <div class="bzr-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem;">
        <h2 style="font-size:clamp(1.25rem,3vw,1.75rem);font-weight:900;color:var(--c-text);margin:0;">جميع المنتجات</h2>
      </div>
      <div id="allProductsGrid"></div>
      <div id="allProductsLoader" class="hidden" style="text-align:center;padding:3rem 0;">
        <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF7A00;margin-bottom:0.75rem;display:block;"></i>
        <p style="color:var(--c-text-soft);font-weight:600;">جاري تحميل المنتجات...</p>
      </div>
      <div id="allProductsEmpty" class="hidden" style="text-align:center;padding:3rem 0;">
        <i class="fas fa-box-open" style="font-size:3rem;color:#CBD5E1;margin-bottom:0.75rem;display:block;"></i>
        <p style="color:var(--c-text-soft);font-weight:600;">لا توجد منتجات في هذه الفئة</p>
      </div>
      <div style="text-align:center;margin-top:2rem;">
        <button id="loadMoreProductsBtn" class="load-more-btn ripple hidden"><span>عرض المزيد</span><i class="fas fa-chevron-down"></i></button>
      </div>
    </div>
  </section>

</main>

<!-- STORE MODAL -->
<div id="storeModal" class="fullscreen-modal hidden">
  <div class="modal-content">
    <div class="store-cover-wrap">
      <img id="storeCoverImage" src="" alt="غلاف المتجر">
      <button id="closeStoreModal" class="store-close-btn" aria-label="إغلاق"><i class="fas fa-times"></i></button>
      <button id="storeShareBtn" class="store-share-btn" type="button" aria-label="مشاركة"><i class="fas fa-share-alt"></i></button>
    </div>
    <div class="store-info-card">
      <div class="store-header-row">
        <img id="storeLogo" class="store-header-logo" src="" alt="شعار المتجر">
        <div class="store-header-info">
          <h3 id="storeName" class="store-header-name"></h3>
          <div class="store-header-meta">
            <span class="store-meta-rating"><span id="storeRating">0.0</span><i class="fas fa-star"></i></span>
            <span class="store-meta-category" id="storeCategory"><i class="fas fa-tag"></i><span>عام</span></span>
          </div>
        </div>
      </div>
      <p id="storeDescription" class="store-desc"></p>
      <div class="store-actions-grid">
        <button id="storeFollowButton" class="store-action-btn primary ripple" type="button"><i class="fas fa-heart"></i><span id="storeFollowText">متابعة</span></button>
        <div class="store-action-btn static"><i class="fas fa-users"></i><span id="storeFollowers">0</span><span>متابع</span></div>
        <a id="storeWhatsAppButton" href="#" target="_blank" rel="noopener noreferrer" class="store-action-btn ripple"><span class="icon-circle"><i class="fab fa-whatsapp"></i></span><span>واتساب</span></a>
        <a id="storeCallButton" href="#" class="store-action-btn ripple"><span class="icon-circle"><i class="fas fa-phone"></i></span><span>اتصال</span></a>
      </div>
    </div>
    <div style="height:10px;background:var(--c-surface-2);margin:1.5rem 0;"></div>
    <div style="padding:0 1rem 2rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem;">
        <div style="display:flex;align-items:center;gap:10px;">
          <i class="fas fa-shopping-bag" style="color:#FF7A00;font-size:1.1rem;"></i>
          <h4 style="font-size:1.1rem;font-weight:900;color:var(--c-text);margin:0;">منتجات المتجر</h4>
        </div>
        <span style="display:inline-flex;align-items:center;gap:6px;background:var(--c-primary-soft);color:#FF7A00;border:1px solid #FFE0BD;border-radius:9999px;padding:0.35rem 0.85rem;font-size:0.78rem;font-weight:800;"><i class="fas fa-cube"></i><span id="storeProductsCount">0</span><span>منتج</span></span>
      </div>
      <div id="storeProductsGrid" class="store-products-grid"></div>
    </div>
  </div>
</div>

<!-- PRODUCT MODAL -->
<div id="productModal" class="product-modal hidden">
  <div class="product-modal-content" style="position:relative;">
    <button id="closeProductModal" class="icon-btn" style="position:absolute;top:14px;left:14px;z-index:10;" aria-label="إغلاق"><i class="fas fa-times"></i></button>
    <div style="display:flex;flex-direction:column;gap:1.5rem;" class="md:flex-row">
      <div class="md:w-1/2" style="width:100%;display:flex;flex-direction:column;align-items:center;">
        <div class="product-modal-image-wrapper"><img id="productModalImage" src="" alt="صورة المنتج"></div>
        <div id="productColorsContainer" class="hidden" style="margin-top:1rem;width:100%;flex-direction:column;align-items:center;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--c-text-soft);">اللون:</span>
            <span id="selectedColorName" style="font-size:0.85rem;font-weight:800;color:#FF7A00;background:var(--c-primary-soft);padding:4px 12px;border-radius:9999px;border:1px solid #FFE0BD;"></span>
          </div>
          <div id="productColorSwatches" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;"></div>
        </div>
      </div>
      <div class="md:w-1/2" style="display:flex;flex-direction:column;width:100%;">
        <h2 id="productModalName" style="font-size:1.25rem;font-weight:900;margin:0 0 0.5rem;color:var(--c-text);"></h2>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem;font-size:0.88rem;flex-wrap:wrap;">
          <span style="color:#FBBF24;"><i class="fas fa-star"></i></span>
          <span id="productModalRating" style="font-weight:800;color:var(--c-text);"></span>
          <span style="color:var(--c-border);">|</span>
          <span id="productModalStore" style="color:#FF7A00;font-weight:800;"></span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;flex-wrap:wrap;">
          <span id="productModalPrice" style="font-size:1.5rem;font-weight:900;color:#FF7A00;"></span>
          <span id="productModalOriginalPrice" style="font-size:1rem;text-decoration:line-through;color:var(--c-text-soft);font-weight:700;"></span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button id="addToCartFromModal" class="btn-primary ripple" style="width:100%;padding:0.9rem;border-radius:14px;font-weight:800;font-size:0.92rem;display:flex;align-items:center;justify-content:center;gap:10px;"><i class="fas fa-shopping-bag"></i><span>أضف إلى السلة</span></button>
          <button id="buyNowFromModal" class="ripple" style="width:100%;padding:0.9rem;border-radius:14px;font-weight:800;font-size:0.92rem;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;box-shadow:0 6px 20px -6px rgba(37,211,102,0.6);cursor:pointer;"><i class="fab fa-whatsapp"></i><span>شراء مباشر عبر واتساب</span></button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- CART SIDEBAR -->
<div id="cartSidebar">
  <div class="cart-overlay" id="cartOverlay"></div>
  <div style="padding:1.25rem;border-bottom:1px solid var(--c-border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FF7A00,#FFA64D);display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-shopping-bag"></i></div>
      <h2 style="font-size:1.05rem;font-weight:900;margin:0;color:var(--c-text);">سلة التسوق</h2>
    </div>
    <button id="closeCart" class="icon-btn" aria-label="إغلاق"><i class="fas fa-times"></i></button>
  </div>
  <div id="cartItems" style="flex:1;overflow-y:auto;padding:1rem;"></div>
  <div style="padding:1.25rem;border-top:1px solid var(--c-border);flex-shrink:0;">
    <div id="cartTotal" style="display:flex;justify-content:space-between;font-weight:800;font-size:1.05rem;margin-bottom:1rem;"><span style="color:var(--c-text);">المجموع:</span><span style="color:#FF7A00;">0 ج.س</span></div>
    <button id="continueShopping" class="ripple" style="width:100%;padding:0.85rem;border-radius:14px;margin-bottom:8px;font-size:0.9rem;background:var(--c-surface-2);color:var(--c-text);border:1.5px solid var(--c-border);font-weight:800;cursor:pointer;">مواصلة التسوق</button>
    <button id="whatsappOrder" class="ripple" style="width:100%;padding:0.9rem;border-radius:14px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:10px;font-size:0.9rem;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px -6px rgba(37,211,102,0.6);"><i class="fab fa-whatsapp"></i><span>طلب السلة عبر واتساب</span></button>
  </div>
</div>

<!-- ACCOUNT MODAL -->
<div id="accountModal" class="hidden">
  <div class="account-overlay" id="accountOverlay"></div>
  <div class="account-sheet">
    <div class="account-handle"></div>
    <button id="closeAccountModal" class="account-close-btn" aria-label="إغلاق"><i class="fas fa-times"></i></button>
    <div class="account-header">
      <div class="account-avatar"><img src="https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png" alt="BranZar"></div>
      <div class="account-welcome">مرحباً بك في</div>
      <div class="account-brand">بران زار <span>- BranZar</span></div>
    </div>
    <div class="account-actions">
      <a href="a.html" class="account-action-btn primary ripple">
        <div class="action-icon"><i class="fas fa-sign-in-alt"></i></div>
        <div class="action-info"><strong>تسجيل الدخول</strong><span>ادخل لإدارة منتجاتك ومتجرك</span></div>
        <i class="fas fa-chevron-left action-arrow"></i>
      </a>
      <button id="openCreateStoreBtn" class="account-action-btn ripple">
        <div class="action-icon secondary"><i class="fas fa-store"></i></div>
        <div class="action-info"><strong>إنشاء متجر خاص</strong><span>انضم كتاجر أو صاحب براند</span></div>
        <i class="fas fa-chevron-left action-arrow"></i>
      </button>
    </div>
    <div class="account-section">
      <div class="account-section-title">الإعدادات والتفضيلات</div>
      <div class="setting-row">
        <div class="setting-label"><i class="fas fa-moon"></i><span>الوضع الداكن</span></div>
        <div id="accountThemeSwitch" class="switch" role="switch" aria-label="الوضع الداكن" tabindex="0"></div>
      </div>
      <div class="setting-row">
        <div class="setting-label"><i class="fas fa-mobile-alt"></i><span>وضع العرض</span></div>
        <div class="view-toggle-pill">
          <button id="accountViewMobileBtn" data-view="mobile" aria-label="هاتف"><i class="fas fa-mobile-alt"></i></button>
          <button id="accountViewDesktopBtn" data-view="desktop" aria-label="سطح مكتب"><i class="fas fa-desktop"></i></button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- CREATE STORE MODAL -->
<div id="createStoreModal" class="hidden">
  <div class="create-store-box">
    <div class="create-store-icon"><i class="fas fa-crown"></i></div>
    <h3 class="create-store-title">هل تملك <span>براند خاص بك؟</span></h3>
    <p class="create-store-desc">للحصول على متجر احترافي بإسم البراند الخاص بك، تواصل مباشرة مع إدارة BranZar عبر واتساب وسنقوم بتفعيل متجرك في دقائق.</p>
    <div class="create-store-features">
      <span><i class="fas fa-check-circle"></i> إنشاء متجر احترافي</span>
      <span><i class="fas fa-bolt"></i> تفعيل فوري</span>
      <span><i class="fas fa-headset"></i> دعم متواصل</span>
      <span><i class="fas fa-chart-line"></i> آلاف العملاء</span>
      <span><i class="fas fa-gift"></i> مجاناً</span>
    </div>
    <a id="createStoreWaBtn" href="https://wa.me/249908280115?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D9%86%D8%B6%D9%85%D8%A7%D9%85%20%D9%83%D8%A8%D8%A7%D8%A6%D8%B9%20%D9%85%D8%AA%D8%AC%D8%B1%20%D9%81%D9%8A%20%D9%85%D9%86%D8%B5%D8%A9%20%D8%A8%D8%B1%D8%A7%D9%86%D8%B2%D8%A7%D8%B1%20%D8%A8%D8%A7%D8%B3%D9%85%20%D8%A7%D9%84%D8%A8%D8%B1%D8%A7%D9%86%D8%AF%20%D8%A7%D9%84%D8%AE%D8%A7%D8%B5%20%D8%A8%D9%8A" target="_blank" rel="noopener noreferrer" class="create-store-wa-btn ripple"><i class="fab fa-whatsapp"></i><span>تواصل مع الإدارة عبر واتساب</span></a>
    <button id="cancelCreateStore" class="create-store-cancel">إلغاء</button>
  </div>
</div>

<div id="toast"></div>

<!-- BOTTOM NAV -->
<nav id="bzrBottomNav" aria-label="التنقل الرئيسي">
  <div class="bzr-nav-list">
    <button class="bzr-nav-item active" data-nav="home" aria-label="الرئيسية"><i class="fas fa-home"></i><span>الرئيسية</span></button>
    <button class="bzr-nav-item" data-nav="followed" aria-label="المتابَعة"><i class="fas fa-heart"></i><span>المتابَعة</span></button>
    <button class="bzr-nav-item" data-nav="cart" aria-label="السلة"><i class="fas fa-shopping-bag"></i><span>السلة</span><span class="bzr-nav-badge" id="bottomNavCartBadge" style="display:none;">0</span></button>
    <button class="bzr-nav-item" data-nav="account" aria-label="حسابي"><i class="fas fa-user-circle"></i><span>حسابي</span></button>
  </div>
</nav>

<!-- ═══════════════════════════════════════════
     UPDATE BUTTON — نسخة أنيقة v2
     ═══════════════════════════════════════════ -->
<button id="updateAvailableBtn" class="hidden" type="button" aria-label="تحديث التطبيق">
  <div class="update-icon-wrap"><i class="fas fa-cloud-download-alt"></i></div>
  <div class="update-text-wrap">
    <strong>🎉 تحديث جديد متوفر</strong>
    <span>اضغط للتحديث الآن</span>
  </div>
  <i class="fas fa-chevron-left update-arrow"></i>
</button>

<!-- INSTALL BUTTON -->
<button id="installButtonFloating" class="hidden" title="تثبيت التطبيق"><i class="fas fa-download"></i><span>تثبيت التطبيق</span></button>

<!-- NOTIFICATION BANNER -->
<div id="notifPermissionBanner" class="hidden">
  <div style="display:flex;align-items:flex-start;gap:12px;">
    <div class="notif-bell-icon"><i class="fas fa-bell"></i></div>
    <div style="flex:1;min-width:0;">
      <div style="font-weight:800;color:var(--c-text);font-size:0.9rem;margin-bottom:4px;">🔔 فعّل إشعارات BranZar</div>
      <p style="font-size:0.78rem;color:var(--c-text-soft);line-height:1.7;margin:0 0 12px;">كن أول من يعرف عند نزول عروض حصرية</p>
      <div style="display:flex;gap:8px;">
        <button id="enableNotifBtn" class="notif-btn-enable ripple"><i class="fas fa-bell"></i><span>تفعيل</span></button>
        <button id="dismissNotifBtn" class="notif-btn-dismiss">لاحقاً</button>
      </div>
    </div>
  </div>
</div>

<!-- PUSH TOAST -->
<div id="pushToast">
  <div class="push-icon"><i class="fas fa-bell"></i></div>
  <div style="flex:1;min-width:0;text-align:right;">
    <div id="pushToastTitle" style="font-weight:800;font-size:0.9rem;color:var(--c-text);">إشعار جديد</div>
    <div id="pushToastBody" style="font-size:0.78rem;color:var(--c-text-soft);margin-top:2px;">لديك جديد</div>
  </div>
</div>

<!-- NEW STORE NOTIFICATION -->
<div id="newStoreNotification" class="hidden">
  <div class="notif-pulse"></div>
  <img id="notificationStoreLogo" src="" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #FFE0BD;flex-shrink:0;" alt="">
  <div style="flex:1;min-width:0;text-align:right;">
    <div style="font-size:11px;color:#FF7A00;font-weight:800;margin-bottom:2px;">انضم إلينا حديثاً!</div>
    <div id="notificationStoreName" style="font-weight:800;font-size:0.9rem;color:var(--c-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></div>
    <div id="notificationStoreCategory" style="font-size:11px;color:var(--c-text-soft);margin-top:2px;"></div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;">
    <button id="closeNotification" class="icon-btn" style="width:26px;height:26px;font-size:0.7rem;"><i class="fas fa-times"></i></button>
    <button id="viewNotificationStore" class="btn-primary" style="padding:6px 12px;border-radius:9999px;font-size:11px;font-weight:800;">تصفح</button>
  </div>
</div>

<!-- FIREBASE -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"></script>

<script>
/* ═══════════════════════════════════════════
   BranZar App Core v6.1
   ═══════════════════════════════════════════ */

/* Splash */
(function(){
  let hidden = false;
  function hideSplash(){
    if (hidden) return; hidden = true;
    const sp = document.getElementById('bzrSplash');
    if (sp && !sp.classList.contains('hide')) {
      sp.classList.add('hide');
      setTimeout(() => { try { sp.remove(); } catch(e){} }, 600);
    }
  }
  window.__bzrHideSplash = hideSplash;
  window.addEventListener('load', () => setTimeout(hideSplash, 700));
  setTimeout(hideSplash, 3000);
})();

const VAPID_PUBLIC_KEY = "BMwiHlrJ0w3ElDwAUgza1CPpKGS2JG6uabbYEITwwdZtb17cHndUcos7s9627B1NPtcb_LAZd5hLhdrACGegdOw";
const firebaseConfig = {
  apiKey: "AIzaSyDUfiHqBPQuFKrsHxoSDdR0j7DMvekfYiA",
  authDomain: "bazarena-725e4.firebaseapp.com",
  databaseURL: "https://bazarena-725e4-default-rtdb.firebaseio.com",
  projectId: "bazarena-725e4",
  storageBucket: "bazarena-725e4.firebasestorage.app",
  messagingSenderId: "977750898059",
  appId: "1:977750898059:web:247e8513b48490ed622b8e",
  measurementId: "G-JFL1RLKST6"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let isPageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => { isPageVisible = !document.hidden; }, { passive: true });

function haptic(type){
  if (!('vibrate' in navigator)) return;
  try {
    if (type === 'light') navigator.vibrate(8);
    else if (type === 'medium') navigator.vibrate(15);
    else if (type === 'heavy') navigator.vibrate([20, 30, 20]);
  } catch(e){}
}
function sanitizeHTML(str){ if (!str) return ''; const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function showToast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTO);
  window.__toastTO = setTimeout(() => t.classList.remove('show'), 2500);
}
function animateCartBounce(){
  const btn = document.getElementById('cartButton');
  if (!btn) return;
  btn.classList.add('bounce');
  setTimeout(() => btn.classList.remove('bounce'), 650);
}

/* Ripple */
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.ripple');
  if (!el) return;
  el.classList.remove('animate');
  void el.offsetWidth;
  el.classList.add('animate');
}, { passive: true });

/* ═══ Theme ═══ */
const THEME_KEY = 'branzar_theme';
const VIEW_KEY = 'branzar_view_mode';

function applyTheme(theme){
  document.body.classList.toggle('theme-dark', theme === 'dark');
  const mainIcon = document.querySelector('#themeToggleBtn i');
  if (mainIcon) mainIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  const accountSwitch = document.getElementById('accountThemeSwitch');
  if (accountSwitch) accountSwitch.classList.toggle('on', theme === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0F172A' : '#FF7A00');
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) { applyTheme(saved); return; }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}
function toggleTheme(){
  const current = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
  haptic('light');
}
document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
document.getElementById('accountThemeSwitch')?.addEventListener('click', toggleTheme);
document.getElementById('accountThemeSwitch')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
});
initTheme();

/* ═══ View Mode ═══ */
function applyViewMode(mode){
  document.body.classList.remove('view-mobile','view-desktop');
  document.body.classList.add('view-' + mode);
  document.querySelectorAll('.view-toggle-pill button').forEach(b => {
    b.classList.toggle('active', b.dataset.view === mode);
  });
  localStorage.setItem(VIEW_KEY, mode);
}
function initViewMode(){
  const saved = localStorage.getItem(VIEW_KEY);
  if (saved) { applyViewMode(saved); return; }
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent) || window.matchMedia('(max-width: 767px)').matches;
  applyViewMode(isMobile ? 'mobile' : 'desktop');
}
function setView(mode){ applyViewMode(mode); haptic('light'); }
document.getElementById('viewMobileBtn')?.addEventListener('click', () => setView('mobile'));
document.getElementById('viewDesktopBtn')?.addEventListener('click', () => setView('desktop'));
document.getElementById('accountViewMobileBtn')?.addEventListener('click', () => setView('mobile'));
document.getElementById('accountViewDesktopBtn')?.addEventListener('click', () => setView('desktop'));
initViewMode();

/* ═══ State ═══ */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('myStoresCart')) || []; } catch(e){ cart = []; }
let stores = [], categories = [], allProducts = [], filteredProducts = [];
let displayedProductsCount = 0, currentCategory = null;
const PRODUCTS_PER_PAGE = 10;
let currentStore = null, currentStoreId = null, currentFollowersCount = 0, isFollowing = false, isUpdatingFollow = false;
let productsUnsubscribe = null, storesUnsubscribe = null;
let isFirstProductsSnapshot = true, isFirstStoresSnapshot = true;
let lastProductsFingerprint = '';
let knownStoreIds = [];
try { knownStoreIds = JSON.parse(localStorage.getItem('branzarKnownStoreIds') || '[]'); } catch(e){ knownStoreIds = []; }
let isFirstVisit = !localStorage.getItem('branzarVisitedBefore');
let storeNotifTimeout = null;

/* ═══ Auth ═══ */
let authReady = false;
let authPromise = firebase.auth().signInAnonymously().then(uc => { authReady = true; return uc.user; }).catch(err => { console.error('Auth:', err); throw err; });
async function ensureAuth(){ if (authReady) return true; try { await authPromise; return true; } catch(e){ return false; } }

/* ═══ Cache ═══ */
const CACHE_DURATION = 30 * 60 * 1000, CACHE_PREFIX = 'branzar_cache_', CACHE_MAX_KEYS = 15;
let _cacheWriteQueue = new Map(), _cacheWriteTimer = null;
function _flushCacheWrites(){
  _cacheWriteQueue.forEach((value, key) => {
    try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ timestamp: Date.now(), value })); } catch(e){}
  });
  _cacheWriteQueue.clear(); _cacheWriteTimer = null;
}
const cacheManager = {
  set(key, value){ _cacheWriteQueue.set(key, value); if (!_cacheWriteTimer) _cacheWriteTimer = setTimeout(_flushCacheWrites, 800); },
  get(key){ try { const raw = localStorage.getItem(CACHE_PREFIX + key); if (!raw) return null; const d = JSON.parse(raw); if (Date.now() - d.timestamp > CACHE_DURATION) { localStorage.removeItem(CACHE_PREFIX + key); return null; } return d.value; } catch(e){ return null; } },
  remove(key){ localStorage.removeItem(CACHE_PREFIX + key); }
};
(function pruneCache(){ try { const keys = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(CACHE_PREFIX) === 0) keys.push(k); } if (keys.length <= CACHE_MAX_KEYS) return; keys.sort(); const r = keys.length - CACHE_MAX_KEYS; for (let i = 0; i < r; i++) localStorage.removeItem(keys[i]); } catch(e){} })();

async function fetchWithCache(key, fn, force){
  if (!force) { const c = cacheManager.get(key); if (c !== null) return c; }
  const data = await fn();
  cacheManager.set(key, data);
  return data;
}
function getProductFingerprint(products){
  let h = 0;
  for (let i = 0; i < products.length; i++) {
    const id = products[i].id || '';
    for (let j = 0; j < id.length; j++) h = ((h << 5) - h + id.charCodeAt(j)) | 0;
  }
  return products.length + ':' + h;
}

/* ═══ Followed / Favs ═══ */
const FOLLOWED_STORES_KEY = 'branzarFollowedStores', PRODUCT_FAVS_KEY = 'branzarProductFavs';
let _followedCache = null, _favsCache = null;
function getFollowedStores(){ if (_followedCache) return _followedCache; try { _followedCache = JSON.parse(localStorage.getItem(FOLLOWED_STORES_KEY) || '[]'); } catch(e){ _followedCache = []; } return _followedCache; }
function saveFollowedStores(list){ _followedCache = list; localStorage.setItem(FOLLOWED_STORES_KEY, JSON.stringify(list)); }
function isStoreFollowed(id){ return getFollowedStores().indexOf(id) > -1; }
function getStoreId(store){ return store.id || store.name; }
function getProductFavs(){ if (_favsCache) return _favsCache; try { _favsCache = JSON.parse(localStorage.getItem(PRODUCT_FAVS_KEY) || '[]'); } catch(e){ _favsCache = []; } return _favsCache; }
function saveProductFavs(list){ _favsCache = list; localStorage.setItem(PRODUCT_FAVS_KEY, JSON.stringify(list)); }
function isProductFav(id){ return getProductFavs().indexOf(id) > -1; }
function toggleProductFav(id){ const list = getProductFavs(); const idx = list.indexOf(id); if (idx > -1) list.splice(idx, 1); else list.push(id); saveProductFavs(list); return list.indexOf(id) > -1; }

/* ═══ Colors ═══ */
function normalizeArabicColorName(n){
  if (!n) return '';
  return String(n).replace(/[\u064B-\u0652\u0670\u0640]/g, '').replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ئ]/g, 'ي').replace(/ؤ/g, 'و').replace(/\s+/g, ' ').trim().toLowerCase();
}
const UNKNOWN_COLOR = '#9CA3AF';
const BASE_COLOR_MAP = { 'اسود':'#1A1A1A','ابيض':'#FFFFFF','رمادي':'#6B7280','احمر':'#EF4444','نبيتي':'#7F1D1D','خمري':'#831843','وردي':'#EC4899','ازرق':'#3B82F6','كحلي':'#1E3A8A','سماوي':'#38BDF8','تركواز':'#14B8A6','اخضر':'#22C55E','زيتي':'#4D7C0F','ليموني':'#A3E635','اصفر':'#EAB308','ذهبي':'#F59E0B','نحاسي':'#B87333','بني':'#78350F','شوكولاتي':'#5C3A21','جملي':'#C19A6B','بيج':'#E8D5B7','كريمي':'#FFF8DC','سكري':'#F5DEB3','بنفسجي':'#8B5CF6','موف':'#A855F7','لافندر':'#D8B4FE','ارجواني':'#7C3AED','برتقالي':'#F97316','فضي':'#9CA3AF','برونزي':'#CD7F32','black':'#1A1A1A','white':'#FFFFFF','gray':'#6B7280','red':'#EF4444','blue':'#3B82F6','green':'#22C55E','yellow':'#EAB308','brown':'#78350F','orange':'#F97316','pink':'#EC4899','purple':'#8B5CF6','gold':'#F59E0B','silver':'#9CA3AF','navy':'#1E3A8A','teal':'#14B8A6' };
const LIGHT_KEYWORDS = ['فاتح','فاتحة','فاتحه','باهت','باهتة','باهته','خفيف','خفيفة','خفيفه','light','pale'];
const DARK_KEYWORDS = ['غامق','غامقة','غامقه','داكن','داكنة','داكنه','عميق','عميقة','عميقه','قاتم','dark','deep'];
const _colorCache = new Map();
function hexToRgb(hex){ const c = String(hex).replace('#',''); if (c.length !== 6) return null; return { r: parseInt(c.substr(0,2),16), g: parseInt(c.substr(2,2),16), b: parseInt(c.substr(4,2),16) }; }
function rgbToHex(r,g,b){ const cl = v => Math.max(0, Math.min(255, Math.round(v))); const t = v => cl(v).toString(16).padStart(2,'0'); return '#' + t(r) + t(g) + t(b); }
function applyColorModifier(hex, mod){ if (!mod || !hex) return hex; const rgb = hexToRgb(hex); if (!rgb) return hex; let { r, g, b } = rgb; if (mod === 'light') { r = r + (255-r)*0.4; g = g + (255-g)*0.4; b = b + (255-b)*0.4; } else if (mod === 'dark') { r *= 0.6; g *= 0.6; b *= 0.6; } return rgbToHex(r,g,b); }
function getFallbackHex(colorName){
  if (!colorName) return UNKNOWN_COLOR;
  const cached = _colorCache.get(colorName);
  if (cached) return cached;
  const n = normalizeArabicColorName(colorName);
  let result = UNKNOWN_COLOR;
  if (!n) result = UNKNOWN_COLOR;
  else if (BASE_COLOR_MAP[n]) result = BASE_COLOR_MAP[n];
  else {
    let modifier = null, baseCandidate = n;
    const allMods = LIGHT_KEYWORDS.map(k => ({ word: normalizeArabicColorName(k), type: 'light' })).concat(DARK_KEYWORDS.map(k => ({ word: normalizeArabicColorName(k), type: 'dark' }))).sort((a,b) => b.word.length - a.word.length);
    for (let i = 0; i < allMods.length; i++) { const mod = allMods[i]; if (!mod.word) continue; if (n === mod.word) { modifier = mod.type; baseCandidate = ''; break; } if (n.indexOf(mod.word) > -1) { modifier = mod.type; baseCandidate = n.replace(mod.word, ' ').replace(/\s+/g,' ').trim(); break; } }
    if (baseCandidate && BASE_COLOR_MAP[baseCandidate]) result = applyColorModifier(BASE_COLOR_MAP[baseCandidate], modifier);
    else {
      const sorted = Object.keys(BASE_COLOR_MAP).sort((a,b) => b.length - a.length);
      for (let i = 0; i < sorted.length; i++) {
        if (n.indexOf(sorted[i]) > -1) { let inf = null; for (let j = 0; j < allMods.length; j++) { if (allMods[j].word && n.indexOf(allMods[j].word) > -1) { inf = allMods[j].type; break; } } result = applyColorModifier(BASE_COLOR_MAP[sorted[i]], inf); break; }
      }
    }
  }
  if (_colorCache.size > 100) _colorCache.clear();
  _colorCache.set(colorName, result);
  return result;
}

/* ═══════════════════════════════════════════
   AUTO-SCROLL STORES
   يبدأ من أول متجر → آخر متجر → يعود للأول
   يتوقف عند اللمس → يستأنف بعد 5 ثواني
   ═══════════════════════════════════════════ */
let isHoveringStores = false;
let lastStoresInteraction = 0;
let _scrollRAFId = null;
let _lastScrollFrame = 0;
const AUTO_SCROLL_RESUME = 5000;
const AUTO_SCROLL_INTERVAL = 32;
const SCROLL_STEP = 0.9;

function getStoresMaxScroll(){
  const c = document.getElementById('storesScrollContainer');
  return c ? Math.max(0, c.scrollWidth - c.clientWidth) : 0;
}
function _autoScrollLoop(ts){
  const c = document.getElementById('storesScrollContainer');
  if (!c) { _scrollRAFId = null; return; }
  if (!isPageVisible) { _scrollRAFId = requestAnimationFrame(_autoScrollLoop); return; }
  if (isHoveringStores || (Date.now() - lastStoresInteraction < AUTO_SCROLL_RESUME)) {
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
    return;
  }
  if (ts - _lastScrollFrame < AUTO_SCROLL_INTERVAL) {
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
    return;
  }
  _lastScrollFrame = ts;
  const max = getStoresMaxScroll();
  if (max <= 0) { _scrollRAFId = null; return; }
  if (c.scrollLeft >= max - 1) {
    c.scrollLeft = 0;
  } else {
    c.scrollLeft += SCROLL_STEP;
  }
  _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
}
function startAutoScroll(){
  stopAutoScroll();
  const c = document.getElementById('storesScrollContainer');
  if (!c) return;
  requestAnimationFrame(() => {
    c.scrollLeft = 0;
    _scrollRAFId = requestAnimationFrame(_autoScrollLoop);
  });
}
function stopAutoScroll(){
  if (_scrollRAFId) { cancelAnimationFrame(_scrollRAFId); _scrollRAFId = null; }
}

/* ═══ Notifications ═══ */
let messaging = null;
const FCM_TOKEN_KEY = 'branzarFcmToken', NOTIF_DISMISS_KEY = 'branzarNotifDismissed';
function isNotificationSupported(){ return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window; }
async function initFCM(){
  try {
    if (!isNotificationSupported()) return;
    messaging = firebase.messaging();
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    messaging.onMessage((payload) => {
      const title = (payload.notification && payload.notification.title) || 'إشعار جديد';
      const body = (payload.notification && payload.notification.body) || 'لديك جديد في BranZar';
      showPushToast(title, body);
    });
    if (Notification.permission === 'granted') await registerFCMToken(reg);
    else if (shouldShowNotifBanner()) setTimeout(showNotifBanner, 10000);
  } catch(err){ console.warn('FCM:', err); }
}
function shouldShowNotifBanner(){ if (!isNotificationSupported()) return false; const perm = Notification.permission; if (perm === 'granted' || perm === 'denied') return false; const dismissed = parseInt(localStorage.getItem(NOTIF_DISMISS_KEY) || '0'); if (dismissed && (Date.now() - dismissed) < 3 * 24 * 60 * 60 * 1000) return false; return true; }
function showNotifBanner(){ const b = document.getElementById('notifPermissionBanner'); if (!b) return; b.classList.remove('hidden'); requestAnimationFrame(() => setTimeout(() => b.classList.add('show'), 50)); }
function hideNotifBanner(){ const b = document.getElementById('notifPermissionBanner'); if (!b) return; b.classList.remove('show'); setTimeout(() => b.classList.add('hidden'), 600); }
async function registerFCMToken(reg){
  try { const token = await messaging.getToken({ vapidKey: VAPID_PUBLIC_KEY, serviceWorkerRegistration: reg }); if (!token) return null; localStorage.setItem(FCM_TOKEN_KEY, token); const prev = localStorage.getItem(FCM_TOKEN_KEY + '_saved'); if (prev !== token) { await db.collection('fcm_tokens').doc(token).set({ token, userAgent: navigator.userAgent, platform: navigator.platform || 'unknown', language: navigator.language || 'ar', createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastSeen: firebase.firestore.FieldValue.serverTimestamp(), active: true }, { merge: true }); localStorage.setItem(FCM_TOKEN_KEY + '_saved', token); } return token; } catch(err){ return null; }
}
function showPushToast(title, body){ const t = document.getElementById('pushToast'); if (!t) return; document.getElementById('pushToastTitle').textContent = title; document.getElementById('pushToastBody').textContent = body; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 5000); }
document.getElementById('enableNotifBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('enableNotifBtn'); btn.disabled = true;
  try { const perm = await Notification.requestPermission(); if (perm === 'granted') { const reg = await navigator.serviceWorker.ready; await registerFCMToken(reg); hideNotifBanner(); showToast('✅ تم تفعيل الإشعارات'); haptic('medium'); } else { hideNotifBanner(); localStorage.setItem(NOTIF_DISMISS_KEY, Date.now().toString()); } } catch(err){}
  btn.disabled = false;
});
document.getElementById('dismissNotifBtn')?.addEventListener('click', () => { hideNotifBanner(); localStorage.setItem(NOTIF_DISMISS_KEY, Date.now().toString()); });

/* ═══ Search ═══ */
const searchInput = document.getElementById('searchInput');
const searchWrapper = document.getElementById('bzrSearchWrapper');
const searchResults = document.getElementById('searchResults');
const searchClearBtn = document.getElementById('searchClearBtn');
let searchDebounce = null;
searchInput?.addEventListener('input', (e) => {
  if (searchInput.value.trim()) searchWrapper.classList.add('has-value');
  else searchWrapper.classList.remove('has-value');
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => performSearch(e.target.value), 200);
});
searchInput?.addEventListener('focus', () => { if (searchInput.value.trim()) performSearch(searchInput.value); });
searchClearBtn?.addEventListener('click', () => { searchInput.value = ''; searchWrapper.classList.remove('has-value'); searchResults.classList.remove('show'); searchInput.focus(); });
document.addEventListener('click', (e) => { if (!searchResults.contains(e.target) && !searchWrapper.contains(e.target)) searchResults.classList.remove('show'); });

function performSearch(query){
  query = (query || '').trim().toLowerCase();
  if (!query) { searchResults.classList.remove('show'); return; }
  const matchedCats = categories.filter(c => c.toLowerCase().indexOf(query) > -1);
  const matchedStores = stores.filter(s => (s.name || '').toLowerCase().indexOf(query) > -1 || (s.category || '').toLowerCase().indexOf(query) > -1);
  const matchedProducts = allProducts.filter(p => (p.name || '').toLowerCase().indexOf(query) > -1 || (p.store_name || '').toLowerCase().indexOf(query) > -1).slice(0, 8);
  searchResults.innerHTML = '';
  if (!matchedCats.length && !matchedStores.length && !matchedProducts.length) {
    searchResults.innerHTML = '<div style="text-align:center;padding:2rem 0;color:var(--c-text-soft);"><i class="fas fa-search" style="font-size:2rem;margin-bottom:0.5rem;display:block;color:#CBD5E1;"></i><p style="font-weight:700;">لا توجد نتائج</p></div>';
    searchResults.classList.add('show');
    return;
  }
  if (matchedCats.length) {
    const title = document.createElement('p'); title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:0 0 10px;'; title.textContent = 'الفئات'; searchResults.appendChild(title);
    const chips = document.createElement('div'); chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;';
    matchedCats.forEach(cat => { const chip = document.createElement('button'); chip.className = 'chip'; chip.textContent = cat; chip.addEventListener('click', () => { searchResults.classList.remove('show'); searchInput.value = ''; searchWrapper.classList.remove('has-value'); goToCategory(cat); }); chips.appendChild(chip); });
    searchResults.appendChild(chips);
  }
  if (matchedStores.length) {
    const title = document.createElement('p'); title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:0 0 10px;'; title.textContent = 'المتاجر (' + matchedStores.length + ')'; searchResults.appendChild(title);
    matchedStores.slice(0, 5).forEach(store => searchResults.appendChild(createSearchStoreRow(store)));
  }
  if (matchedProducts.length) {
    const title = document.createElement('p'); title.style.cssText = 'font-size:0.78rem;font-weight:800;color:var(--c-text-soft);margin:14px 0 10px;'; title.textContent = 'المنتجات (' + matchedProducts.length + ')'; searchResults.appendChild(title);
    matchedProducts.forEach(p => searchResults.appendChild(createSearchProductRow(p)));
  }
  searchResults.classList.add('show');
}
function createSearchStoreRow(store){
  const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;cursor:pointer;transition:background 0.2s;';
  row.onmouseover = () => row.style.background = 'var(--c-surface-2)'; row.onmouseout = () => row.style.background = '';
  const img = document.createElement('img'); img.style.cssText = 'width:42px;height:42px;border-radius:50%;object-fit:cover;background:var(--c-surface-2);flex-shrink:0;'; img.src = store.logo_url || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
  const nm = document.createElement('div'); nm.style.cssText = 'font-weight:800;font-size:0.88rem;color:var(--c-text);display:flex;align-items:center;gap:4px;'; nm.textContent = store.name || '';
  if (store.is_verified) { const v = document.createElement('span'); v.className = 'verified-icon'; v.innerHTML = '<i class="fas fa-check"></i>'; nm.appendChild(v); }
  const meta = document.createElement('div'); meta.style.cssText = 'font-size:0.72rem;color:var(--c-text-soft);margin-top:2px;'; meta.textContent = (store.category || 'عام') + ' • ' + (store.products_count || 0) + ' منتج';
  info.appendChild(nm); info.appendChild(meta);
  const arrow = document.createElement('i'); arrow.className = 'fas fa-chevron-left'; arrow.style.cssText = 'color:var(--c-text-soft);font-size:0.75rem;';
  row.appendChild(img); row.appendChild(info); row.appendChild(arrow);
  row.addEventListener('click', () => { searchResults.classList.remove('show'); searchInput.value = ''; searchWrapper.classList.remove('has-value'); openStoreModal(store); });
  return row;
}
function createSearchProductRow(product){
  const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;cursor:pointer;';
  row.onmouseover = () => row.style.background = 'var(--c-surface-2)'; row.onmouseout = () => row.style.background = '';
  const img = document.createElement('img'); img.style.cssText = 'width:42px;height:42px;border-radius:10px;object-fit:contain;background:var(--c-surface-2);padding:4px;flex-shrink:0;'; img.src = product.img_url || 'https://via.placeholder.com/100';
  const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
  const nm = document.createElement('div'); nm.style.cssText = 'font-weight:800;font-size:0.88rem;color:var(--c-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; nm.textContent = product.name || '';
  const meta = document.createElement('div'); meta.style.cssText = 'font-size:0.72rem;color:#FF7A00;margin-top:2px;font-weight:800;'; meta.textContent = (parseFloat(product.price) || 0).toLocaleString() + ' ج.س';
  info.appendChild(nm); info.appendChild(meta);
  row.appendChild(img); row.appendChild(info);
  row.addEventListener('click', () => {
    searchResults.classList.remove('show'); searchInput.value = ''; searchWrapper.classList.remove('has-value');
    openProductModal({ id: product.id, name: product.name, img_url: product.img_url, price: parseFloat(product.price) || 0, original_price: product.original_price ? parseFloat(product.original_price) : null, ratting: parseFloat(product.ratting) || 0, store_name: product.store_name, description: product.description || '', colors: product.colors || null });
  });
  return row;
}
function goToCategory(cat){
  currentCategory = cat;
  filterStoresByCategory(cat);
  const btns = Array.from(document.getElementById('categoriesContainer').querySelectorAll('button'));
  const target = btns.find(b => b.textContent.trim() === cat);
  if (target) highlightCategory(target);
  applyProductsFilter(cat);
  const s = document.getElementById('stores');
  if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══ Body Scroll Lock ═══ */
function updateBodyScroll(){
  const anyOpen = !document.getElementById('storeModal').classList.contains('hidden') ||
                  !document.getElementById('productModal').classList.contains('hidden') ||
                  document.getElementById('cartSidebar').classList.contains('open') ||
                  !document.getElementById('accountModal').classList.contains('hidden') ||
                  !document.getElementById('createStoreModal').classList.contains('hidden');
  document.body.style.overflow = anyOpen ? 'hidden' : '';
  document.body.classList.toggle('modal-open', anyOpen);
}

/* ═══ Bottom Nav ═══ */
const bottomNav = document.getElementById('bzrBottomNav');
const bottomNavBadge = document.getElementById('bottomNavCartBadge');
function setActiveNav(nav){
  if (!bottomNav) return;
  bottomNav.querySelectorAll('.bzr-nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === nav));
}
bottomNav?.addEventListener('click', (e) => {
  const btn = e.target.closest('.bzr-nav-item');
  if (!btn) return;
  haptic('light');
  const nav = btn.dataset.nav;
  if (nav === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveNav('home'); }
  else if (nav === 'followed') {
    const sec = document.getElementById('followedStoresSection');
    if (sec && !sec.classList.contains('hidden')) { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveNav('followed'); }
    else { showToast('💡 لم تتابع أي متجر بعد'); setActiveNav('home'); }
  }
  else if (nav === 'cart') { openCart(); setActiveNav('cart'); }
  else if (nav === 'account') { openAccountModal(); }
});
function updateBottomNavBadge(){
  if (!bottomNavBadge) return;
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  if (total > 0) { bottomNavBadge.textContent = total > 99 ? '99+' : total; bottomNavBadge.style.display = 'flex'; }
  else bottomNavBadge.style.display = 'none';
}

/* ═══ Account Modal ═══ */
const accountModal = document.getElementById('accountModal');
const createStoreModal = document.getElementById('createStoreModal');
function openAccountModal(){ accountModal.classList.remove('hidden'); updateBodyScroll(); haptic('light'); }
function closeAccountModal(){ accountModal.classList.add('hidden'); updateBodyScroll(); }
document.getElementById('closeAccountModal')?.addEventListener('click', closeAccountModal);
document.getElementById('accountOverlay')?.addEventListener('click', closeAccountModal);
document.getElementById('openCreateStoreBtn')?.addEventListener('click', () => { haptic('medium'); createStoreModal.classList.remove('hidden'); updateBodyScroll(); });
document.getElementById('cancelCreateStore')?.addEventListener('click', () => { createStoreModal.classList.add('hidden'); updateBodyScroll(); });
createStoreModal?.addEventListener('click', (e) => { if (e.target === createStoreModal) { createStoreModal.classList.add('hidden'); updateBodyScroll(); } });

/* ═══ Logo Menu ═══ */
document.getElementById('logoMenuBtn')?.addEventListener('click', () => { haptic('light'); window.scrollTo({ top: 0, behavior: 'smooth' }); });

/* ═══ PWA Install ═══ */
let deferredPrompt = null;
function isAppInstalled(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || localStorage.getItem('branzarInstalled') === 'true'; }
const installBtn = document.getElementById('installButtonFloating');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (!isAppInstalled()) installBtn.classList.add('show'); });
window.addEventListener('appinstalled', () => { localStorage.setItem('branzarInstalled', 'true'); installBtn.classList.remove('show'); deferredPrompt = null; showToast('تم تثبيت التطبيق بنجاح!'); haptic('heavy'); });
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) { showToast('التطبيق مثبت بالفعل'); return; }
  haptic('medium');
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') { localStorage.setItem('branzarInstalled', 'true'); installBtn.classList.remove('show'); }
  deferredPrompt = null;
});
if (isAppInstalled()) installBtn.classList.remove('show');

/* ═══════════════════════════════════════════
   Service Worker — Auto Update System v2
   ═══════════════════════════════════════════ */
let swRegistration = null;
let isReloading = false;
let updateCheckInterval = null;

function showUpdateButton() {
  const btn = document.getElementById('updateAvailableBtn');
  if (!btn || btn.classList.contains('show')) return;
  btn.classList.remove('hidden');
  requestAnimationFrame(() => {
    setTimeout(() => {
      btn.classList.add('show');
      try { haptic('medium'); } catch(e){}
    }, 50);
  });
}

function hideUpdateButton() {
  const btn = document.getElementById('updateAvailableBtn');
  if (!btn) return;
  btn.classList.remove('show');
  setTimeout(() => btn.classList.add('hidden'), 400);
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
    setTimeout(() => {
      if (!isReloading) { isReloading = true; window.location.reload(); }
    }, 3000);
  } else {
    window.location.reload();
  }
}

async function checkForUpdate() {
  if (!swRegistration) return;
  try {
    await swRegistration.update();
    if (swRegistration.waiting && navigator.serviceWorker.controller) {
      showUpdateButton();
    }
  } catch(err) { /* silent */ }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js', { scope: '/' })
      .then((reg) => {
        swRegistration = reg;
        console.log('[App] SW registered. Scope:', reg.scope);

        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateButton();
        }

        reg.addEventListener('updatefound', () => {
          console.log('[App] Update found — installing new SW');
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            console.log('[App] New SW state:', newWorker.state);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateButton();
              try { showToast('🎉 تحديث جديد متوفر!'); } catch(e){}
            }
          });
        });

        if (updateCheckInterval) clearInterval(updateCheckInterval);
        updateCheckInterval = setInterval(() => {
          if (isPageVisible) checkForUpdate();
        }, 30 * 1000);
      })
      .catch((err) => console.warn('[App] SW registration failed:', err));

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isReloading) return;
      isReloading = true;
      console.log('[App] Controller changed — reloading');
      window.location.reload();
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event.data || {};
      if (data.type === 'SW_ACTIVATED') {
        console.log('[App] SW activated version:', data.version);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkForUpdate();
    });
    window.addEventListener('focus', () => checkForUpdate());
    window.addEventListener('online', () => checkForUpdate());

    document.getElementById('bzrBottomNav')?.addEventListener('click', () => checkForUpdate(), { passive: true });
  });
}

document.getElementById('updateAvailableBtn')?.addEventListener('click', triggerUpdate);

setInterval(() => {
  if (isPageVisible && swRegistration) checkForUpdate();
}, 5 * 60 * 1000);

/* ═══ Data Loading ═══ */
async function loadStores(force){
  const loader = document.getElementById('storesLoader'), empty = document.getElementById('storesEmpty'), container = document.getElementById('storesScrollContainer');
  loader.classList.remove('hidden'); empty.classList.add('hidden'); container.innerHTML = '';
  try {
    const result = await fetchWithCache('stores_list', async () => {
      let snap; try { snap = await db.collection('stores').orderBy('created_at', 'desc').get(); } catch(e){ snap = await db.collection('stores').get(); }
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0) { const pSnap = await db.collection('products').get(); const counts = {}; pSnap.docs.forEach(d => { const sn = d.data().store_name; if (sn) counts[sn] = (counts[sn] || 0) + 1; }); return data.map(s => ({ ...s, products_count: counts[s.name] || 0 })); }
      return data;
    }, force);
    stores = result;
    if (stores.length === 0) { document.getElementById('storesErrorMessage').textContent = '⚠️ لا توجد متاجر متاحة'; empty.classList.remove('hidden'); renderFollowedStores(); }
    else {
      displayStores();
      startAutoScroll();
      renderFollowedStores();
      if (isFirstVisit) { localStorage.setItem('branzarVisitedBefore', 'true'); localStorage.setItem('branzarKnownStoreIds', JSON.stringify(stores.map(s => s.id))); isFirstVisit = false; }
    }
  } catch(err){
    document.getElementById('storesErrorMessage').textContent = 'تعذر تحميل المتاجر'; empty.classList.remove('hidden');
  } finally { loader.classList.add('hidden'); }
}
document.getElementById('retryStoresBtn')?.addEventListener('click', () => loadStores(true));

async function loadAllProducts(force){
  const loader = document.getElementById('allProductsLoader'), empty = document.getElementById('allProductsEmpty'), grid = document.getElementById('allProductsGrid');
  loader.classList.remove('hidden'); empty.classList.add('hidden'); grid.innerHTML = '';
  document.getElementById('loadMoreProductsBtn').classList.add('hidden');
  try {
    const data = await fetchWithCache('all_products', async () => {
      let snap; try { snap = await db.collection('products').orderBy('created_at', 'desc').get(); } catch(e){ snap = await db.collection('products').get(); }
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, force);
    allProducts = data;
    applyProductsFilter(currentCategory);
  } catch(err){ grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--c-text-soft);">تعذر تحميل المنتجات</p>'; }
  finally { loader.classList.add('hidden'); }
}

async function loadCategories(force){
  try {
    const storesData = await fetchWithCache('stores_list', async () => { const snap = await db.collection('stores').get(); return snap.docs.map(d => ({ id: d.id, ...d.data() })); }, force);
    const cats = [];
    storesData.forEach(s => { const c = s.category; if (c && String(c).trim() !== '' && cats.indexOf(c) === -1) cats.push(c); });
    categories = cats;
    displayCategories();
  } catch(err){ console.error(err); }
}

/* ═══ Render Stores ═══ */
function displayStores(){
  const c = document.getElementById('storesScrollContainer');
  c.innerHTML = '';
  const frag = document.createDocumentFragment();
  stores.forEach(s => frag.appendChild(createStoreCard(s)));
  c.appendChild(frag);
}
function createStoreCard(store){
  const storeId = getStoreId(store);
  const followed = isStoreFollowed(storeId);
  const card = document.createElement('div'); card.className = 'store-card';
  const cover = document.createElement('img'); cover.className = 'cover-image'; cover.loading = 'lazy'; cover.alt = store.name || '';
  cover.src = store.cover_url || 'https://via.placeholder.com/600x300/FF7A00/FFFFFF?text=Cover';
  cover.onerror = function(){ this.src = 'https://via.placeholder.com/600x300/FF7A00/FFFFFF?text=Cover'; };
  const logo = document.createElement('img'); logo.className = 'store-logo'; logo.loading = 'lazy'; logo.alt = store.name || '';
  logo.src = store.logo_url || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  logo.onerror = function(){ this.src = 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store'; };
  const info = document.createElement('div'); info.className = 'store-info';
  const nameRow = document.createElement('div'); nameRow.className = 'store-name'; nameRow.textContent = store.name || '';
  if (store.is_verified) { const v = document.createElement('span'); v.className = 'verified-icon'; v.innerHTML = '<i class="fas fa-check"></i>'; nameRow.appendChild(v); }
  const catRow = document.createElement('div'); catRow.className = 'store-category'; catRow.textContent = store.category || 'عام';
  const bottomRow = document.createElement('div'); bottomRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;';
  const count = document.createElement('div'); count.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--c-text-soft);font-weight:700;'; count.innerHTML = '<i class="fas fa-shopping-bag"></i><span>' + (store.products_count || 0) + '</span>';
  const actionsWrap = document.createElement('div'); actionsWrap.style.cssText = 'display:flex;align-items:center;gap:6px;';
  const followBtn = document.createElement('button'); followBtn.style.cssText = 'background:#FF7A00;color:#fff;border:1.5px solid #FF7A00;border-radius:9999px;padding:0.3rem 0.7rem;font-size:0.7rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all 0.25s;white-space:nowrap;';
  followBtn.dataset.storeId = storeId; setCardFollowState(followBtn, followed);
  followBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); haptic('light'); toggleFollowFromCard(store, followBtn); });
  const shareBtn = document.createElement('button'); shareBtn.style.cssText = 'width:30px;height:30px;border-radius:50%;background:var(--c-primary-soft);color:#FF7A00;border:1.5px solid #FFE0BD;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;transition:all 0.25s;padding:0;';
  shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
  shareBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); haptic('light'); shareStore(store); });
  actionsWrap.appendChild(followBtn); actionsWrap.appendChild(shareBtn);
  bottomRow.appendChild(count); bottomRow.appendChild(actionsWrap);
  info.appendChild(nameRow); info.appendChild(catRow); info.appendChild(bottomRow);
  card.appendChild(cover); card.appendChild(logo); card.appendChild(info);
  card.addEventListener('click', () => { haptic('light'); openStoreModal(store); });
  return card;
}
function setCardFollowState(btn, following){
  btn.classList.toggle('following', following);
  btn.innerHTML = following ? '<i class="fas fa-check"></i><span>متابَع</span>' : '<i class="fas fa-plus"></i><span>متابعة</span>';
  if (following) { btn.style.background = 'transparent'; btn.style.color = '#FF7A00'; }
  else { btn.style.background = '#FF7A00'; btn.style.color = '#fff'; }
}
async function toggleFollowFromCard(store, btn){
  const storeId = getStoreId(store);
  if (btn.disabled) return;
  btn.disabled = true;
  const wasFollowing = isStoreFollowed(storeId);
  try {
    const ref = db.collection('stores').doc(storeId);
    const snap = await ref.get();
    const cur = snap.exists ? (parseInt(snap.data()?.followers) || 0) : 0;
    const newCount = wasFollowing ? Math.max(0, cur - 1) : cur + 1;
    await ref.update({ followers: newCount });
    store.followers = newCount;
    const list = getFollowedStores();
    if (wasFollowing) { const i = list.indexOf(storeId); if (i > -1) list.splice(i, 1); }
    else if (list.indexOf(storeId) === -1) list.push(storeId);
    saveFollowedStores(list);
    updateCardFollowButtons(storeId);
    renderFollowedStores();
    if (currentStoreId === storeId) { isFollowing = !wasFollowing; currentFollowersCount = newCount; updateFollowersDisplay(); updateFollowButtonUI(); }
    showToast(wasFollowing ? 'تم إلغاء المتابعة' : 'تمت المتابعة بنجاح!');
    haptic('medium');
  } catch(err){ showToast('حدث خطأ'); }
  finally { btn.disabled = false; }
}
function updateCardFollowButtons(storeId){
  const following = isStoreFollowed(storeId);
  document.querySelectorAll('.store-card button[data-store-id]').forEach(btn => { if (btn.dataset.storeId === storeId) setCardFollowState(btn, following); });
}
function renderFollowedStores(){
  const section = document.getElementById('followedStoresSection'), container = document.getElementById('followedStoresContainer'), badge = document.getElementById('followedCountBadge');
  const ids = getFollowedStores();
  if (!ids.length) { section.classList.add('hidden'); container.innerHTML = ''; if (badge) badge.textContent = ''; return; }
  const followed = ids.map(id => stores.find(s => getStoreId(s) === id)).filter(Boolean);
  if (!followed.length) { section.classList.add('hidden'); container.innerHTML = ''; return; }
  section.classList.remove('hidden');
  if (badge) badge.textContent = followed.length + ' متجر';
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  followed.forEach(store => {
    const item = document.createElement('div'); item.className = 'followed-store-item';
    const avatar = document.createElement('div'); avatar.className = 'followed-store-avatar';
    const img = document.createElement('img'); img.loading = 'lazy'; img.alt = store.name || ''; img.draggable = false;
    img.src = store.logo_url || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
    img.onerror = function(){ this.src = 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store'; };
    avatar.appendChild(img);
    const nm = document.createElement('div'); nm.className = 'followed-store-name'; nm.textContent = store.name || '';
    item.appendChild(avatar); item.appendChild(nm);
    item.addEventListener('click', () => { haptic('light'); openStoreModal(store); });
    frag.appendChild(item);
  });
  container.appendChild(frag);
}
function filterStoresByCategory(cat){
  currentCategory = cat;
  const filtered = stores.filter(s => s.category === cat);
  const c = document.getElementById('storesScrollContainer');
  c.innerHTML = '';
  if (filtered.length === 0) c.innerHTML = '<div style="text-align:center;width:100%;padding:2.5rem 0;color:var(--c-text-soft);">لا توجد متاجر في هذه الفئة</div>';
  else { const frag = document.createDocumentFragment(); filtered.forEach(s => frag.appendChild(createStoreCard(s))); c.appendChild(frag); }
  lastStoresInteraction = Date.now();
  startAutoScroll();
}

/* ═══ Categories ═══ */
function displayCategories(){
  const c = document.getElementById('categoriesContainer');
  c.innerHTML = '';
  const frag = document.createDocumentFragment();
  const allBtn = document.createElement('button'); allBtn.className = 'chip active'; allBtn.textContent = 'الكل';
  allBtn.addEventListener('click', () => { haptic('light'); currentCategory = null; displayStores(); highlightCategory(allBtn); startAutoScroll(); applyProductsFilter(null); });
  frag.appendChild(allBtn);
  categories.forEach(cat => {
    const btn = document.createElement('button'); btn.className = 'chip'; btn.textContent = cat;
    btn.addEventListener('click', () => { haptic('light'); currentCategory = cat; filterStoresByCategory(cat); highlightCategory(btn); applyProductsFilter(cat); });
    frag.appendChild(btn);
  });
  c.appendChild(frag);
}
function highlightCategory(active){
  document.getElementById('categoriesContainer').querySelectorAll('button').forEach(b => b.classList.remove('active'));
  active.classList.add('active');
}

/* ═══ Products ═══ */
function applyProductsFilter(cat){
  if (!cat) filteredProducts = allProducts;
  else { const names = stores.filter(s => s.category === cat).map(s => s.name); filteredProducts = allProducts.filter(p => names.indexOf(p.store_name) > -1); }
  const el = document.getElementById('categoriesTotalCount');
  if (el) el.textContent = filteredProducts.length.toLocaleString();
  displayedProductsCount = 0;
  document.getElementById('allProductsGrid').innerHTML = '';
  renderNextProductsPage();
}
function renderNextProductsPage(){
  const grid = document.getElementById('allProductsGrid');
  const start = displayedProductsCount, end = start + PRODUCTS_PER_PAGE;
  const batch = filteredProducts.slice(start, end);
  if (batch.length > 0) displayProductsGrid(grid, batch, true);
  displayedProductsCount = end;
  const empty = document.getElementById('allProductsEmpty'), loadBtn = document.getElementById('loadMoreProductsBtn');
  if (filteredProducts.length === 0) { empty.classList.remove('hidden'); loadBtn.classList.add('hidden'); }
  else empty.classList.add('hidden');
  if (displayedProductsCount < filteredProducts.length) { loadBtn.classList.remove('hidden'); loadBtn.innerHTML = '<span>عرض المزيد (' + (filteredProducts.length - displayedProductsCount) + ')</span><i class="fas fa-chevron-down"></i>'; }
  else loadBtn.classList.add('hidden');
}
document.getElementById('loadMoreProductsBtn')?.addEventListener('click', () => {
  const btn = document.getElementById('loadMoreProductsBtn'); btn.disabled = true;
  haptic('light');
  setTimeout(() => { renderNextProductsPage(); btn.disabled = false; }, 150);
});
function displayProductsGrid(container, products, addStoreName){
  const frag = document.createDocumentFragment();
  products.forEach(product => {
    const price = parseFloat(product.price) || 0;
    const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
    const rating = parseFloat(product.ratting) || 0;
    const card = document.createElement('div'); card.className = 'product-card';
    const pm = { id: product.id, name: product.name, img_url: product.img_url, price, original_price: originalPrice, ratting: rating, store_name: product.store_name, description: product.description || '', colors: product.colors || null };
    let colorDots = '';
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      colorDots = '<div style="display:flex;gap:4px;margin-bottom:6px;justify-content:flex-end;">' + product.colors.slice(0, 4).map(c => '<div class="card-color-dot" style="background-color:' + (c.hex || getFallbackHex(c.name)) + '" title="' + c.name + '"></div>').join('') + (product.colors.length > 4 ? '<span style="font-size:10px;color:var(--c-text-soft);font-weight:800;align-self:center;">+' + (product.colors.length - 4) + '</span>' : '') + '</div>';
    }
    card.innerHTML = '<div class="product-image-container"><img src="' + (sanitizeHTML(product.img_url) || 'https://via.placeholder.com/300') + '" loading="lazy" alt="' + sanitizeHTML(product.name) + '">' +
      (originalPrice ? '<span style="position:absolute;top:8px;right:8px;background:linear-gradient(135deg,#FF7A00,#FFA64D);color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:9999px;box-shadow:0 3px 8px rgba(255,122,0,0.4);">خصم</span>' : '') +
      '</div><div style="padding:0.75rem;display:flex;flex-direction:column;gap:5px;flex:1;">' +
      '<h5 style="font-weight:800;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--c-text);margin:0;">' + sanitizeHTML(product.name) + '</h5>' +
      (addStoreName && product.store_name ? '<p style="font-size:0.72rem;color:#FF7A00;font-weight:800;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + sanitizeHTML(product.store_name) + '</p>' : '') +
      '<div style="display:flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:800;color:var(--c-text);"><i class="fas fa-star" style="color:#FBBF24;"></i> ' + rating + '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
      '<span style="font-weight:900;color:#FF7A00;font-size:0.9rem;">' + price.toLocaleString() + ' ج.س</span>' +
      (originalPrice ? '<span style="font-size:0.75rem;text-decoration:line-through;color:var(--c-text-soft);font-weight:700;">' + originalPrice.toLocaleString() + ' ج.س</span>' : '') +
      '</div>' + colorDots +
      '<button class="open-product-btn ripple" style="width:100%;background:linear-gradient(135deg,#FF7A00,#FFA64D);color:#fff;padding:0.6rem;border-radius:12px;font-size:0.82rem;font-weight:800;border:none;cursor:pointer;margin-top:auto;box-shadow:0 4px 12px -4px rgba(255,122,0,0.5);">عرض المنتج</button></div>';
    frag.appendChild(card);
    const btn = card.querySelector('.open-product-btn');
    btn.addEventListener('click', (e) => { e.stopPropagation(); haptic('light'); openProductModal(pm); });
    card.addEventListener('click', (e) => { if (e.target === btn) return; haptic('light'); openProductModal(pm); });
  });
  container.appendChild(frag);
}

/* ═══ Store Modal ═══ */
function openStoreModal(store){
  currentStore = store; currentStoreId = getStoreId(store);
  currentFollowersCount = parseInt(store.followers) || 0;
  isFollowing = isStoreFollowed(currentStoreId);
  document.getElementById('storeCoverImage').src = store.cover_url || 'https://via.placeholder.com/1200x600/FF7A00/FFFFFF?text=Cover';
  document.getElementById('storeLogo').src = store.logo_url || 'https://via.placeholder.com/150/FF7A00/FFFFFF?text=Store';
  document.getElementById('storeDescription').textContent = store.description || 'متجر مميز';
  document.getElementById('storeRating').textContent = (parseFloat(store.ratting) || 0).toFixed(1);
  document.getElementById('storeProductsCount').textContent = store.products_count || 0;
  const catVal = (store.category && String(store.category).trim()) ? store.category : 'عام';
  document.getElementById('storeCategory').innerHTML = '<i class="fas fa-tag"></i><span>' + sanitizeHTML(catVal) + '</span>';
  updateFollowersDisplay(); updateFollowButtonUI();
  if (store.is_verified) document.getElementById('storeName').innerHTML = sanitizeHTML(store.name) + ' <span class="verified-icon"><i class="fas fa-check"></i></span>';
  else document.getElementById('storeName').textContent = store.name || '';
  const phone = store.phone_number || '', wa = store.whatsapp_number || '';
  const callBtn = document.getElementById('storeCallButton'), waBtn = document.getElementById('storeWhatsAppButton');
  if (phone) { callBtn.href = 'tel:' + phone; callBtn.style.display = ''; } else callBtn.style.display = 'none';
  if (wa) { waBtn.href = 'https://wa.me/' + wa.replace(/[^0-9]/g, ''); waBtn.style.display = ''; } else waBtn.style.display = 'none';
  loadStoreProducts(store.name);
  document.getElementById('storeModal').classList.remove('hidden');
  updateBodyScroll();
  document.getElementById('storeModal').querySelector('.modal-content').scrollTop = 0;
}
function updateFollowersDisplay(){ document.getElementById('storeFollowers').textContent = currentFollowersCount.toLocaleString(); }
function updateFollowButtonUI(){
  const btn = document.getElementById('storeFollowButton'), txt = document.getElementById('storeFollowText');
  if (!btn || !txt) return;
  if (isFollowing) { btn.classList.add('following'); txt.textContent = 'متابَع'; btn.querySelector('i').className = 'fas fa-check'; }
  else { btn.classList.remove('following'); txt.textContent = 'متابعة'; btn.querySelector('i').className = 'fas fa-heart'; }
}
document.getElementById('storeFollowButton')?.addEventListener('click', async () => {
  if (!currentStoreId || isUpdatingFollow) return;
  isUpdatingFollow = true;
  const btn = document.getElementById('storeFollowButton'); btn.disabled = true;
  const wasFollowing = isFollowing;
  document.getElementById('storeFollowText').textContent = 'جاري...';
  haptic('light');
  try {
    const ref = db.collection('stores').doc(currentStoreId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('missing');
    const cur = parseInt(snap.data()?.followers) || 0;
    const newCount = wasFollowing ? Math.max(0, cur - 1) : cur + 1;
    await ref.update({ followers: newCount });
    if (wasFollowing) { isFollowing = false; const list = getFollowedStores(); const i = list.indexOf(currentStoreId); if (i > -1) list.splice(i, 1); saveFollowedStores(list); }
    else { isFollowing = true; const list = getFollowedStores(); if (list.indexOf(currentStoreId) === -1) list.push(currentStoreId); saveFollowedStores(list); }
    currentFollowersCount = newCount;
    updateFollowersDisplay(); updateFollowButtonUI();
    updateCardFollowButtons(currentStoreId); renderFollowedStores();
    showToast(isFollowing ? 'تمت المتابعة بنجاح!' : 'تم إلغاء المتابعة');
    if (currentStore) currentStore.followers = newCount;
  } catch(err){ showToast('حدث خطأ'); isFollowing = wasFollowing; updateFollowButtonUI(); updateFollowersDisplay(); }
  finally { isUpdatingFollow = false; btn.disabled = false; }
});
document.getElementById('closeStoreModal')?.addEventListener('click', () => { document.getElementById('storeModal').classList.add('hidden'); updateBodyScroll(); });

/* ═══ Store Products ═══ */
async function loadStoreProducts(storeName, force){
  const grid = document.getElementById('storeProductsGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem 0;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF7A00;"></i></div>';
  try {
    const data = await fetchWithCache('store_products_' + storeName, async () => {
      const snap = await db.collection('products').where('store_name', '==', storeName).get();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a,b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      return list;
    }, force);
    document.getElementById('storeProductsCount').textContent = data.length;
    if (currentStore) currentStore.products_count = data.length;
    if (!data || !data.length) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">لا توجد منتجات</div>';
    else renderStoreProducts(data);
  } catch(err){ grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">تعذر التحميل</div>'; }
}
function renderStoreProducts(products){
  const grid = document.getElementById('storeProductsGrid');
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  products.forEach(product => {
    const price = parseFloat(product.price) || 0;
    const rating = parseFloat(product.ratting) || 0;
    const fav = isProductFav(product.id);
    const pm = { id: product.id, name: product.name, img_url: product.img_url, price, original_price: product.original_price ? parseFloat(product.original_price) : null, ratting: rating, store_name: product.store_name, description: product.description || '', colors: product.colors || null };
    const card = document.createElement('div'); card.className = 'store-product-card';
    const favBtn = document.createElement('button');
    favBtn.className = 'store-product-fav' + (fav ? ' active' : '');
    favBtn.innerHTML = '<i class="' + (fav ? 'fas' : 'far') + ' fa-heart"></i>';
    favBtn.addEventListener('click', (e) => { e.stopPropagation(); haptic('light'); const now = toggleProductFav(product.id); favBtn.classList.toggle('active', now); favBtn.innerHTML = '<i class="' + (now ? 'fas' : 'far') + ' fa-heart"></i>'; showToast(now ? 'أُضيف للمفضلة' : 'أُزيل'); });
    const imgWrap = document.createElement('div'); imgWrap.className = 'store-product-img-wrap';
    const img = document.createElement('img'); img.loading = 'lazy'; img.alt = product.name || ''; img.src = product.img_url || 'https://via.placeholder.com/300';
    img.onerror = function(){ this.src = 'https://via.placeholder.com/300'; };
    imgWrap.appendChild(img);
    const info = document.createElement('div'); info.className = 'store-product-info';
    const nameEl = document.createElement('div'); nameEl.className = 'store-product-name'; nameEl.textContent = product.name || '';
    const ratingEl = document.createElement('div'); ratingEl.className = 'store-product-rating'; ratingEl.innerHTML = '<span>' + rating + '</span> <i class="fas fa-star"></i>';
    info.appendChild(nameEl); info.appendChild(ratingEl);
    const priceEl = document.createElement('div'); priceEl.className = 'store-product-price'; priceEl.textContent = price.toLocaleString() + ' ج.س';
    info.appendChild(priceEl);
    const viewBtn = document.createElement('button'); viewBtn.className = 'store-product-btn ripple'; viewBtn.innerHTML = '<span>عرض</span> <i class="fas fa-chevron-left"></i>';
    viewBtn.addEventListener('click', (e) => { e.stopPropagation(); haptic('light'); openProductModal(pm); });
    info.appendChild(viewBtn);
    card.appendChild(favBtn); card.appendChild(imgWrap); card.appendChild(info);
    card.addEventListener('click', () => { haptic('light'); openProductModal(pm); });
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ═══ Product Modal ═══ */
let currentModalProduct = null, selectedColorVariant = null;
function openProductModal(product){
  currentModalProduct = product; selectedColorVariant = null;
  const defaultImg = product.img_url || 'https://via.placeholder.com/600';
  const imgEl = document.getElementById('productModalImage');
  imgEl.src = defaultImg; imgEl.style.opacity = '1';
  imgEl.onerror = function(){ this.src = 'https://via.placeholder.com/600'; };
  document.getElementById('productModalName').textContent = product.name;
  document.getElementById('productModalRating').textContent = product.ratting || 0;
  document.getElementById('productModalStore').textContent = product.store_name || 'غير محدد';
  document.getElementById('productModalPrice').textContent = (product.price || 0).toLocaleString() + ' ج.س';
  const origEl = document.getElementById('productModalOriginalPrice');
  if (product.original_price) { origEl.textContent = product.original_price.toLocaleString() + ' ج.س'; origEl.classList.remove('hidden'); }
  else { origEl.textContent = ''; origEl.classList.add('hidden'); }
  const colorsContainer = document.getElementById('productColorsContainer'), swatchesContainer = document.getElementById('productColorSwatches'), selColorName = document.getElementById('selectedColorName');
  swatchesContainer.innerHTML = '';
  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    colorsContainer.classList.remove('hidden'); colorsContainer.style.display = 'flex';
    selectedColorVariant = product.colors[0];
    imgEl.src = selectedColorVariant.image || defaultImg;
    selColorName.textContent = selectedColorVariant.name;
    const frag = document.createDocumentFragment();
    product.colors.forEach((color, index) => {
      const swatch = document.createElement('div');
      const hex = color.hex || getFallbackHex(color.name);
      const isLight = ['#ffffff','#fff','#f8f9fa','white'].indexOf(hex.toLowerCase()) > -1;
      swatch.className = 'color-swatch ' + (isLight ? 'light-color' : '') + (index === 0 ? ' active' : '');
      swatch.style.backgroundColor = hex; swatch.title = color.name;
      swatch.addEventListener('click', () => {
        if (selectedColorVariant && selectedColorVariant.name === color.name) return;
        haptic('light');
        imgEl.style.opacity = '0';
        setTimeout(() => { selectedColorVariant = color; imgEl.src = color.image || defaultImg; imgEl.onload = () => { imgEl.style.opacity = '1'; }; }, 200);
        document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
        swatch.classList.add('active'); selColorName.textContent = color.name;
        updateModalActionButtons();
      });
      frag.appendChild(swatch);
    });
    swatchesContainer.appendChild(frag);
  } else { colorsContainer.classList.add('hidden'); colorsContainer.style.display = 'none'; }
  document.getElementById('productModal').classList.remove('hidden');
  updateBodyScroll();
  updateModalActionButtons();
}
function updateModalActionButtons(){
  const p = { ...currentModalProduct };
  if (selectedColorVariant) { p.selectedColor = selectedColorVariant.name; p.img_url = selectedColorVariant.image || currentModalProduct.img_url; }
  document.getElementById('addToCartFromModal').dataset.product = JSON.stringify(p);
  document.getElementById('buyNowFromModal').dataset.product = JSON.stringify(p);
}
document.getElementById('closeProductModal')?.addEventListener('click', () => { document.getElementById('productModal').classList.add('hidden'); updateBodyScroll(); });
document.getElementById('productModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('productModal')) { document.getElementById('productModal').classList.add('hidden'); updateBodyScroll(); } });
document.getElementById('addToCartFromModal')?.addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const p = JSON.parse(btn.dataset.product);
  addToCart(p);
  haptic('medium');
  btn.style.background = 'linear-gradient(135deg,#10B981,#059669)';
  btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
  setTimeout(() => { btn.style.background = ''; btn.innerHTML = '<i class="fas fa-shopping-bag"></i> أضف إلى السلة'; }, 1500);
});
document.getElementById('buyNowFromModal')?.addEventListener('click', (e) => {
  const p = JSON.parse(e.currentTarget.dataset.product);
  const store = stores.find(s => s.name === p.store_name);
  let wa = store && store.whatsapp_number ? store.whatsapp_number : '';
  if (!wa) { showToast('رقم الواتساب غير متوفر'); return; }
  haptic('medium');
  const msg = 'مرحباً، أريد شراء:\n\n' + p.name + '\n' + (p.selectedColor ? 'اللون: ' + p.selectedColor + '\n' : '') + 'السعر: ' + (p.price || 0).toLocaleString() + ' ج.س\n' + (p.store_name ? 'من متجر: ' + p.store_name : '');
  window.open('https://wa.me/' + wa.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
});

/* ═══ Cart ═══ */
function addToCart(product){
  const store = stores.find(s => s.name === product.store_name);
  const cartItemId = product.selectedColor ? product.id + '_' + product.selectedColor : product.id;
  const item = { ...product, cartItemId, quantity: 1, store_whatsapp: store?.whatsapp_number || '' };
  const existing = cart.find(i => (i.cartItemId || i.id) === cartItemId);
  if (existing) existing.quantity += 1; else cart.push(item);
  updateCartUI();
  localStorage.setItem('myStoresCart', JSON.stringify(cart));
  animateCartBounce();
  showToast('تمت الإضافة إلى السلة');
}
function updateCartUI(){
  const totalItems = cart.reduce((s,i) => s + i.quantity, 0);
  const cc = document.getElementById('cartCount');
  if (cc) { if (totalItems > 0) { cc.textContent = totalItems > 99 ? '99+' : totalItems; cc.style.display = 'flex'; } else cc.style.display = 'none'; }
  const items = document.getElementById('cartItems');
  items.innerHTML = '';
  if (cart.length === 0) items.innerHTML = '<div style="text-align:center;color:var(--c-text-soft);padding:2.5rem 0;"><i class="fas fa-shopping-bag" style="font-size:3rem;margin-bottom:1rem;display:block;color:#CBD5E1;"></i><p style="font-weight:700;">السلة فارغة</p></div>';
  else {
    const frag = document.createDocumentFragment();
    cart.forEach(item => {
      const div = document.createElement('div'); div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--c-border);';
      const itemId = item.cartItemId || item.id;
      div.innerHTML = '<img src="' + (sanitizeHTML(item.img_url) || 'https://via.placeholder.com/80') + '" class="cart-item-image" alt="" loading="lazy">' +
        '<div style="flex:1;min-width:0;"><h5 style="font-weight:800;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--c-text);margin:0;">' + sanitizeHTML(item.name) + '</h5>' +
        (item.store_name ? '<span style="font-size:0.72rem;color:#FF7A00;font-weight:800;display:block;">' + sanitizeHTML(item.store_name) + '</span>' : '') +
        (item.selectedColor ? '<span style="font-size:0.7rem;color:var(--c-text-soft);font-weight:700;background:var(--c-surface-2);padding:2px 8px;border-radius:6px;display:inline-block;margin-top:4px;">اللون: ' + sanitizeHTML(item.selectedColor) + '</span>' : '') +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;"><button class="decrease-btn" data-id="' + itemId + '" style="width:26px;height:26px;border-radius:50%;background:var(--c-surface-2);border:none;font-weight:800;cursor:pointer;color:var(--c-text);">−</button><span style="font-weight:800;color:var(--c-text);min-width:20px;text-align:center;">' + item.quantity + '</span><button class="increase-btn" data-id="' + itemId + '" style="width:26px;height:26px;border-radius:50%;background:var(--c-surface-2);border:none;font-weight:800;cursor:pointer;color:var(--c-text);">+</button></div></div>' +
        '<div style="text-align:left;flex-shrink:0;"><div style="font-weight:900;color:#FF7A00;">' + (item.price * item.quantity).toLocaleString() + ' ج.س</div>' +
        '<button class="remove-btn" data-id="' + itemId + '" style="color:#EF4444;margin-top:4px;background:none;border:none;cursor:pointer;font-size:0.85rem;"><i class="fas fa-trash"></i></button></div>';
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
function changeQuantity(id, delta){ const item = cart.find(i => (i.cartItemId || i.id) === id); if (!item) return; item.quantity = Math.max(1, item.quantity + delta); updateCartUI(); localStorage.setItem('myStoresCart', JSON.stringify(cart)); }
function removeFromCart(id){ cart = cart.filter(i => (i.cartItemId || i.id) !== id); updateCartUI(); localStorage.setItem('myStoresCart', JSON.stringify(cart)); showToast('تمت الإزالة'); }
function openCart(){ document.getElementById('cartSidebar').classList.add('open'); updateBodyScroll(); setActiveNav('cart'); }
function closeCart(){ document.getElementById('cartSidebar').classList.remove('open'); updateBodyScroll(); setActiveNav('home'); }
document.getElementById('cartButton')?.addEventListener('click', () => { haptic('light'); openCart(); });
document.getElementById('closeCart')?.addEventListener('click', closeCart);
document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
document.getElementById('continueShopping')?.addEventListener('click', closeCart);
document.getElementById('whatsappOrder')?.addEventListener('click', () => {
  if (cart.length === 0) { showToast('السلة فارغة'); return; }
  haptic('medium');
  const grouped = {};
  cart.forEach(item => { const wa = item.store_whatsapp || 'default'; if (!grouped[wa]) grouped[wa] = []; grouped[wa].push(item); });
  const numbers = Object.keys(grouped);
  if (numbers.length === 1) {
    const wa = numbers[0]; let msg = 'مرحباً، أريد طلب:\n\n';
    grouped[wa].forEach(item => { msg += item.name + ' (x' + item.quantity + ') - ' + (item.price * item.quantity).toLocaleString() + ' ج.س\n'; if (item.selectedColor) msg += 'اللون: ' + item.selectedColor + '\n'; if (item.store_name) msg += 'من متجر: ' + item.store_name + '\n'; });
    const total = cart.reduce((s,i) => s + i.price * i.quantity, 0); msg += '\nالمجموع: ' + total.toLocaleString() + ' ج.س';
    const finalWa = wa === 'default' ? '0924299798' : wa;
    window.open('https://wa.me/' + finalWa.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
  } else {
    showToast('إرسال لكل متجر على حدة...');
    numbers.forEach((wa, i) => { setTimeout(() => { let msg = 'مرحباً، أريد طلب:\n\n'; grouped[wa].forEach(item => { msg += item.name + ' (x' + item.quantity + ') - ' + (item.price * item.quantity).toLocaleString() + ' ج.س\n'; if (item.selectedColor) msg += 'اللون: ' + item.selectedColor + '\n'; }); const finalWa = wa === 'default' ? '0924299798' : wa; window.open('https://wa.me/' + finalWa.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer'); }, i * 500); });
  }
});

/* ═══ Share ═══ */
async function shareStore(store){
  if (!store) return;
  const storeId = String(getStoreId(store));
  const url = window.location.origin + window.location.pathname + '?store=' + encodeURIComponent(storeId);
  if (navigator.share) { try { await navigator.share({ title: store.name, text: 'اكتشف متجر ' + store.name, url }); haptic('medium'); return; } catch(err){ if (err && err.name === 'AbortError') return; } }
  try { if (navigator.clipboard) { await navigator.clipboard.writeText(url); showToast('✅ تم نسخ الرابط'); } } catch(err){ showToast('تعذر النسخ'); }
}

/* ═══ Realtime ═══ */
function setupRealtimeProducts(){
  if (productsUnsubscribe) return;
  productsUnsubscribe = db.collection('products').onSnapshot((snap) => {
    const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    fresh.sort((a,b) => { const ta = a.created_at?.seconds || 0; const tb = b.created_at?.seconds || 0; return tb - ta; });
    const fp = getProductFingerprint(fresh);
    if (isFirstProductsSnapshot) { isFirstProductsSnapshot = false; lastProductsFingerprint = fp; cacheManager.set('all_products', fresh); allProducts = fresh; applyProductsFilter(currentCategory); return; }
    if (fp === lastProductsFingerprint) return;
    lastProductsFingerprint = fp; allProducts = fresh; cacheManager.set('all_products', fresh); applyProductsFilter(currentCategory);
    if (currentStore && !document.getElementById('storeModal').classList.contains('hidden')) { loadStoreProductsFromLocal(fresh, currentStore.name); }
  }, err => console.warn('Products:', err));
}
function loadStoreProductsFromLocal(arr, name){
  const list = arr.filter(p => p.store_name === name);
  document.getElementById('storeProductsCount').textContent = list.length;
  if (currentStore) currentStore.products_count = list.length;
  if (!list.length) document.getElementById('storeProductsGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem 0;color:var(--c-text-soft);">لا توجد منتجات</div>';
  else renderStoreProducts(list);
}
function setupRealtimeStores(){
  if (storesUnsubscribe) return;
  storesUnsubscribe = db.collection('stores').onSnapshot((snap) => {
    const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (isFirstStoresSnapshot) { isFirstStoresSnapshot = false; return; }
    cacheManager.remove('stores_list');
    setTimeout(() => loadStores(true), 200);
  }, err => console.warn('Stores:', err));
}

/* ═══ Deep Link ═══ */
async function handleDeepLink(){
  try { const params = new URLSearchParams(window.location.search); let storeId = params.get('store'); if (!storeId) return; storeId = decodeURIComponent(storeId).trim(); await new Promise(r => setTimeout(r, 1500)); const store = stores.find(s => String(getStoreId(s)) === String(storeId)); if (store) { try { window.history.replaceState({}, document.title, window.location.origin + window.location.pathname); } catch(e){} setTimeout(() => openStoreModal(store), 300); } } catch(err){}
}

/* ═══ Escape ═══ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (searchResults.classList.contains('show')) { searchResults.classList.remove('show'); return; }
    if (!createStoreModal.classList.contains('hidden')) { createStoreModal.classList.add('hidden'); updateBodyScroll(); return; }
    if (!accountModal.classList.contains('hidden')) { closeAccountModal(); return; }
    if (!document.getElementById('productModal').classList.contains('hidden')) { document.getElementById('productModal').classList.add('hidden'); updateBodyScroll(); return; }
    if (!document.getElementById('storeModal').classList.contains('hidden')) { document.getElementById('storeModal').classList.add('hidden'); updateBodyScroll(); return; }
    if (document.getElementById('cartSidebar').classList.contains('open')) { closeCart(); return; }
  }
});

/* ═══ Category Wheel ═══ */
document.getElementById('categoriesContainer')?.addEventListener('wheel', (e) => { if (e.deltaY !== 0) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; } }, { passive: false });

/* ═══ Nav Buttons ═══ */
document.getElementById('prevStoresBtn')?.addEventListener('click', () => { const c = document.getElementById('storesScrollContainer'); lastStoresInteraction = Date.now(); c.scrollBy({ left: 300, behavior: 'smooth' }); });
document.getElementById('nextStoresBtn')?.addEventListener('click', () => { const c = document.getElementById('storesScrollContainer'); lastStoresInteraction = Date.now(); c.scrollBy({ left: -300, behavior: 'smooth' }); });
document.getElementById('prevCategoriesBtn')?.addEventListener('click', () => document.getElementById('categoriesContainer').scrollBy({ left: -200, behavior: 'smooth' }));
document.getElementById('nextCategoriesBtn')?.addEventListener('click', () => document.getElementById('categoriesContainer').scrollBy({ left: 200, behavior: 'smooth' }));

/* ═══ Auto-scroll interaction events ═══ */
const storesContainer = document.getElementById('storesScrollContainer');
if (storesContainer) {
  ['pointerdown','pointerup','pointercancel','touchstart','touchend','touchcancel','wheel','mousedown','mouseup'].forEach(evt => {
    storesContainer.addEventListener(evt, () => { lastStoresInteraction = Date.now(); }, { passive: true });
  });
  storesContainer.addEventListener('mouseenter', () => { isHoveringStores = true; }, { passive: true });
  storesContainer.addEventListener('mouseleave', () => { isHoveringStores = false; lastStoresInteraction = Date.now(); }, { passive: true });
}

/* ═══ Init ═══ */
async function initApp(){
  const ok = await ensureAuth();
  if (!ok) { window.__bzrHideSplash(); return; }
  updateCartUI();
  initFCM().catch(() => {});
  await Promise.all([loadStores(), loadCategories(), loadAllProducts()]);
  setupRealtimeProducts();
  setupRealtimeStores();
  handleDeepLink();
  setActiveNav('home');
  setTimeout(() => window.__bzrHideSplash(), 400);
}

window.addEventListener('beforeunload', () => {
  try {
    if (productsUnsubscribe) productsUnsubscribe();
    if (storesUnsubscribe) storesUnsubscribe();
    stopAutoScroll();
    if (_cacheWriteTimer) { clearTimeout(_cacheWriteTimer); _flushCacheWrites(); }
  } catch(e){}
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp, { once: true });
else initApp();

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const open = params.get('open');
  if (open === 'cart') setTimeout(openCart, 800);
});

window.BranZar = { version: '6.1.0', openStore: openStoreModal, openProduct: openProductModal, openCart, showToast, haptic, setTheme: applyTheme, setView: applyViewMode };
</script>
</body>
</html>
