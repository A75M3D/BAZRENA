/* BranZar — browser fallback for Android App Links
 * يوضع داخل <head> في index.html قبل بقية السكربتات.
 * لا يعتمد على assetlinks.json؛ assetlinks يفتح التطبيق عند التثبيت فقط.
 */
(function () {
  'use strict';

  var DOWNLOAD_PATH = '/download.html';
  var currentPath = window.location.pathname || '/';
  var currentUrl = new URL(window.location.href);
  var isDownloadPage = currentPath === DOWNLOAD_PATH;

  // داخل TWA/PWA المثبت: اترك التطبيق يعمل ولا تعِد التوجيه.
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;

  // بعض بيئات Android/TWA تضع android-app:// في referrer.
  var referrer = document.referrer || '';
  var cameFromInstalledApp =
    referrer.indexOf('android-app://') === 0 ||
    referrer.indexOf('app.vercel.branzar.twa') !== -1;

  // لا تعِد توجيه صفحة التحميل إلى نفسها.
  if (isDownloadPage || isStandalone || cameFromInstalledApp) return;

  // كل زيارة من المتصفح إلى نطاق BranZar تصبح صفحة تحميل.
  // يتم تمرير store كما هو حتى لا تضيع وجهة المتجر.
  var downloadUrl = new URL(DOWNLOAD_PATH, window.location.origin);
  currentUrl.searchParams.forEach(function (value, key) {
    downloadUrl.searchParams.set(key, value);
  });

  // يحتفظ بالمسار الأصلي للروابط غير الخاصة بالمتاجر، إذا احتاج التطبيق إليه لاحقاً.
  if (currentPath !== '/' && currentPath !== DOWNLOAD_PATH) {
    downloadUrl.searchParams.set(
      'next',
      currentPath + (currentUrl.search || '')
    );
  }

  window.location.replace(downloadUrl.pathname + downloadUrl.search);
})();
