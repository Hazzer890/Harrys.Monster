// Progressive enhancement only — every page is fully readable with zero JS.
(function () {
  'use strict';

  /* ---- Moving background: fallback where CSS scroll timelines are missing ----
     Firefox and Zen only; browsers with the CSS path run none of this. The
     speeds are read from the tunables in css/layout.css, so they live in one
     place. The sky wraps back every two copies, as the CSS animation does.
     Reduced motion pins everything at scroll 0 here too, and is re-read if
     the OS setting changes. */
  var sky = document.querySelector('.bg-sky');
  if (sky && !CSS.supports('animation-timeline: scroll()')) {
    var root = getComputedStyle(document.documentElement);
    var SKY_SPEED = +root.getPropertyValue('--sky-speed');
    var SEA_SPEED = +root.getPropertyValue('--sea-speed');
    var sea = document.querySelectorAll('.bg-sea, .hero-island');
    var still = matchMedia('(prefers-reduced-motion: reduce)'), pending = false;
    var drawBg = function () {
      pending = false;
      var y = still.matches ? 0 : scrollY;
      var wrap = 2 * sky.firstElementChild.getBoundingClientRect().height;
      sky.style.transform = 'translateY(' + (y * SKY_SPEED % wrap).toFixed(1) + 'px)';
      var t = 'translateY(' + (y * SEA_SPEED).toFixed(1) + 'px)';
      sea.forEach(function (el) { el.style.transform = t; });
    };
    var queueBg = function () {
      if (!pending) { pending = true; requestAnimationFrame(drawBg); }
    };
    addEventListener('scroll', queueBg, { passive: true });
    addEventListener('resize', queueBg);
    still.addEventListener('change', queueBg);
    drawBg();
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
