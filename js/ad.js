/* ═══════════════════════════════════════════════════════════
   BranZar — ad.js
   Hero Slider + Account Button
   ✅ 5 صور تتحرك تلقائياً (كل 5 ثواني)
   ✅ Swipe + Arrows + Dots
   ✅ إيقاف ذكي عند التفاعل
   ✅ دعم الوضع الداكن
   ✅ معالج زر "حسابي" في الهيدر
   ═══════════════════════════════════════════════════════════ */
'use strict';

(function () {

  /* ═════════════════════════════════════════════════════════
     ⚙️ CONFIG
     ═════════════════════════════════════════════════════════ */
  var CONFIG = {
    AUTO_DELAY: 5000,                  // 5 ثواني بين كل صورة
    PAUSE_AFTER_INTERACTION: 8000,     // 8 ثواني توقف بعد تفاعل المستخدم
    SWIPE_THRESHOLD: 50,               // حساسية السحب (بكسل)
    TRANSITION_MS: 850,                // مدة الانتقال (يجب مطابقة CSS)
    START_INDEX: 0
  };


  /* ═════════════════════════════════════════════════════════
     🎯 HERO SLIDER
     ═════════════════════════════════════════════════════════ */
  function initHeroSlider() {
    var slider = document.getElementById('bzrSlider');
    var track = document.getElementById('bzrSliderTrack');
    if (!slider || !track) return;

    var dots = slider.querySelectorAll('.bzr-slider-dot');
    var prevBtn = document.getElementById('bzrSliderPrev');
    var nextBtn = document.getElementById('bzrSliderNext');
    var total = dots.length;

    if (total === 0) return;

    var index = CONFIG.START_INDEX;
    var autoTimer = null;
    var pausedUntil = 0;
    var isHovering = false;
    var isDragging = false;
    var isTransitioning = false;

    /* ─────── دوال أساسية ─────── */
    function goTo(i, animate) {
      if (animate === undefined) animate = true;

      /* Wrap around */
      index = ((i % total) + total) % total;

      if (!animate) {
        track.style.transition = 'none';
      }

      track.style.transform = 'translateX(-' + (index * 100) + '%)';

      /* تحديث الـ dots */
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === index);
      });

      /* إعادة تشغيل الـ transition */
      if (!animate) {
        void track.offsetWidth;
        track.style.transition = '';
      }
    }

    function next() {
      if (isTransitioning) return;
      isTransitioning = true;
      goTo(index + 1);
      setTimeout(function () { isTransitioning = false; }, CONFIG.TRANSITION_MS);
    }

    function prev() {
      if (isTransitioning) return;
      isTransitioning = true;
      goTo(index - 1);
      setTimeout(function () { isTransitioning = false; }, CONFIG.TRANSITION_MS);
    }

    function pauseTemporary() {
      pausedUntil = Date.now() + CONFIG.PAUSE_AFTER_INTERACTION;
    }

    function isPaused() {
      return isHovering || Date.now() < pausedUntil;
    }

    /* ─────── Auto-play ─────── */
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () {
        /* لا تتحرك إذا:
           - المستخدم يمرر الماوس
           - تم التفاعل مؤخراً
           - التاب مخفي */
        if (isPaused()) return;
        if (document.hidden) return;
        if (isTransitioning) return;
        next();
      }, CONFIG.AUTO_DELAY);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    /* ─────── Controls: Arrows ─────── */
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        prev();
        pauseTemporary();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        next();
        pauseTemporary();
      });
    }

    /* ─────── Controls: Dots ─────── */
    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        var i = parseInt(this.getAttribute('data-index'), 10) || 0;
        goTo(i);
        pauseTemporary();
      });
    });

    /* ─────── Touch Swipe (RTL-aware) ─────── */
    var touchStartX = 0;
    var touchStartY = 0;
    var touchEndX = 0;
    var touchEndY = 0;
    var touchActive = false;

    slider.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchActive = true;
      isHovering = true; /* نعتبره مثل hover */
      pauseTemporary();
    }, { passive: true });

    slider.addEventListener('touchmove', function (e) {
      if (!touchActive || !e.touches || !e.touches[0]) return;
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }, { passive: true });

    slider.addEventListener('touchend', function (e) {
      if (!touchActive) return;
      touchActive = false;
      isHovering = false;

      var dx = touchEndX - touchStartX;
      var dy = touchEndY - touchStartY;
      var absDx = Math.abs(dx);
      var absDy = Math.abs(dy);

      /* نتحقق أن السحب أفقي وليس عمودي */
      if (absDx > absDy && absDx > CONFIG.SWIPE_THRESHOLD) {
        /* RTL:
           - السحب لليمين (dx > 0) = الصورة السابقة
           - السحب لليسار  (dx < 0) = الصورة التالية
           (في الإنجليزية يكون العكس) */
        if (dx > 0) prev();
        else next();
      }

      /* إعادة تعيين */
      touchStartX = touchStartY = touchEndX = touchEndY = 0;
    }, { passive: true });

    /* ─────── Mouse hover pause (Desktop) ─────── */
    slider.addEventListener('mouseenter', function () {
      isHovering = true;
    });
    slider.addEventListener('mouseleave', function () {
      isHovering = false;
    });

    /* ─────── Visibility: توقف عند إخفاء التاب ─────── */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAuto();
      } else {
        /* استئناف بعد 500ms من عودة المستخدم */
        setTimeout(startAuto, 500);
      }
    });

    /* ─────── Keyboard accessibility ─────── */
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        /* RTL: السهم الأيمن = السابق */
        prev();
        pauseTemporary();
      } else if (e.key === 'ArrowLeft') {
        /* RTL: السهم الأيسر = التالي */
        next();
        pauseTemporary();
      }
    });

    /* ─────── Prevent image drag ─────── */
    slider.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    /* ─────── Init ─────── */
    goTo(CONFIG.START_INDEX, false);
    startAuto();

    /* ─────── Cleanup عند مغادرة الصفحة ─────── */
    window.addEventListener('beforeunload', function () {
      stopAuto();
    });

    /* ─────── كل 30 ثانية: إعادة تشغيل آمنة (اختياري) ─────── */
    setInterval(function () {
      if (!autoTimer && !document.hidden) {
        startAuto();
      }
    }, 30000);
  }


  /* ═════════════════════════════════════════════════════════
     🎯 Account Button (الهيدر)
     ═════════════════════════════════════════════════════════ */
  function initAccountButton() {
    var btn = document.getElementById('openAccountBtn');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();

      /* Haptic feedback */
      if ('vibrate' in navigator) {
        try { navigator.vibrate(8); } catch (err) {}
      }

      /* فتح نافذة الحساب */
      var modal = document.getElementById('accountModal');
      if (!modal) return;

      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');

      /* إذا كانت هناك دالة openAccountModal من ui.js، استخدمها */
      if (typeof window.openAccountModal === 'function') {
        try { window.openAccountModal(); } catch (err) {}
      }
    });
  }


  /* ═════════════════════════════════════════════════════════
     🚀 INIT (بعد تحميل DOM)
     ═════════════════════════════════════════════════════════ */
  function init() {
    initHeroSlider();
    initAccountButton();
    console.log('[BZR] ad.js loaded ✅ — Slider + Account Button');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
