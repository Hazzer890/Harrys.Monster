// Progressive enhancement only — every page is fully readable with zero JS.
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js'); // CSS gates all hidden/animated states on html.js

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Footer year ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Theme: light default, dark remembered (head script sets it pre-paint) ---- */
  var THEME_KEY = 'theme';
  var toggles = document.querySelectorAll('.theme-toggle');
  function applyTheme(t) {
    var dark = t === 'dark';
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0a0e1a' : '#f5f7fc');
    toggles.forEach(function (b) {
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    });
    if (window.__setFieldTheme) window.__setFieldTheme(dark ? 'dark' : 'light');
  }
  var stored;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(stored === 'dark' ? 'dark' : 'light');
  toggles.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  });

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

  /* ---- Scroll-choreographed reveals (index [data-reveal] + interior .fade-in) ---- */
  var revealables = document.querySelectorAll('[data-reveal], .fade-in');
  function revealAll() {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }
  if (revealables.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px 12% 0px' });
      revealables.forEach(function (el) { io.observe(el); });
      // Safety net: static captures and screenshotters never scroll, so
      // reveal anything the observer hasn't caught shortly after load.
      window.addEventListener('load', function () { setTimeout(revealAll, 1100); });
    } else {
      revealAll();
    }
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

  /* ---- Pointer tilt on glass panels — fine pointers, motion allowed ---- */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  if (!reduceMotion && finePointer) {
    document.querySelectorAll('.glass--hero, .card, .explore-card').forEach(function (panel) {
      panel.classList.add('tilt');
      panel.addEventListener('mousemove', function (ev) {
        var r = panel.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        var max = 5; // degrees
        panel.style.setProperty('--ry', (px * max).toFixed(2) + 'deg');
        panel.style.setProperty('--rx', (-py * max).toFixed(2) + 'deg');
      });
      panel.addEventListener('mouseleave', function () {
        panel.style.setProperty('--rx', '0deg');
        panel.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- Light parallax drift ([data-parallax="factor"] wrappers) ---- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!reduceMotion && parallaxEls.length) {
    var pTicking = false;
    var wideView = window.matchMedia('(min-width: 901px)'); // parallax els are static below this
    var updateParallax = function () {
      pTicking = false;
      if (!wideView.matches) {
        parallaxEls.forEach(function (el) { el.style.transform = ''; });
        return;
      }
      var y = window.scrollY || document.documentElement.scrollTop;
      parallaxEls.forEach(function (el) {
        var f = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = 'translateY(' + (-y * f).toFixed(1) + 'px)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!pTicking) { pTicking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
    updateParallax();
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
