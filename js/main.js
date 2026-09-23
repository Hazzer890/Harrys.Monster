// Progressive enhancement only — every page is fully readable with zero JS.
(function () {
  'use strict';

  /* ---- Pinned photo: fallback where CSS scroll timelines are missing ----
     Firefox and Zen only. The numbers mirror the tunables on .bg-sky in
     css/layout.css; change them together:
       TRAVEL        --sky-travel  420svh
       WIDE, TALL    --sky-h       max(150vw, 170svh)
       START, LIFT   --sky-start   --sky-h * 0.265 - 40svh
     Browsers with the CSS path run none of this. Reduced motion pins the photo
     at the start position here too, and is re-read if the OS setting changes. */
  var sky = document.querySelector('.bg-sky');
  if (sky && !CSS.supports('animation-timeline: scroll()')) {
    var TRAVEL = 4.2, WIDE = 1.5, TALL = 1.7, START = 0.265, LIFT = 0.4;
    var still = matchMedia('(prefers-reduced-motion: reduce)'), pending = false;
    var drawSky = function () {
      pending = false;
      var vh = innerHeight, h = Math.max(innerWidth * WIDE, vh * TALL);
      var start = h * START - vh * LIFT;
      var t = still.matches ? 0 : Math.min(1, scrollY / (vh * TRAVEL));
      sky.style.transform = 'translateY(' + (start + (h - vh - start) * t).toFixed(1) + 'px)';
    };
    var queueSky = function () {
      if (!pending) { pending = true; requestAnimationFrame(drawSky); }
    };
    addEventListener('scroll', queueSky, { passive: true });
    addEventListener('resize', queueSky);
    still.addEventListener('change', queueSky);
    drawSky();
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Mobile nav toggle ---- */
  var header = document.querySelector('.header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Scroll spy: highlight the nav link for the section in view ----
     Only on pages whose nav actually has same-page (#hash) links — i.e. index.
     Interior pages link out to index.html#… and keep a static .active pill, so
     running the spy there would just clear it as unrelated sections scroll by. */
  var spySections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  var hasHashNav = Array.prototype.some.call(navLinks, function (link) {
    return (link.getAttribute('href') || '').charAt(0) === '#';
  });
  if (hasHashNav && spySections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          var href = link.getAttribute('href');
          link.classList.toggle('active', href === '#' + id || href === 'index.html#' + id);
        });
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Contact form: AJAX submit with inline status ---- */
  var form = document.querySelector('.contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var action = form.getAttribute('action');
      if (!action || action === '#') {
        if (status) {
          status.textContent = 'Form endpoint not configured yet.';
          status.className = 'form-status error';
        }
        return;
      }
      if (status) {
        status.textContent = 'Sending...';
        status.className = 'form-status';
      }
      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('Failed');
        if (status) {
          status.textContent = "Message sent! I'll get back to you soon.";
          status.className = 'form-status success';
        }
        form.reset();
      }).catch(function () {
        if (status) {
          status.textContent = 'Something went wrong. Please try again or email me directly.';
          status.className = 'form-status error';
        }
      });
    });
  }
})();
