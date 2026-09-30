/* ═══ Onboarding Redirect Check ═══ */
(function() {
  try {
    var seen = localStorage.getItem('branzar_onboarding_seen');
    var isOnboarding = location.pathname.indexOf('onboarding') > -1;
    var hasDeepLink = location.search.indexOf('store=') > -1;
    if (!seen && !isOnboarding && !hasDeepLink) {
      window.location.replace('/onboarding.html');
    }
  } catch(e) {}
})();
