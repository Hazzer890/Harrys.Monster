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
    var still = matchMedia('(prefers-reduced-motion: reduce)'), pending = false;
    var drawBg = function () {
      pending = false;
      var y = still.matches ? 0 : scrollY;
      var wrap = 2 * sky.firstElementChild.getBoundingClientRect().height;
      sky.style.transform = 'translateY(' + Math.round(y * SKY_SPEED % wrap) + 'px)';
      var t = 'translateY(' + Math.round(y * SEA_SPEED) + 'px)';
      // Looked up each frame: the island <img> is swapped for inline SVG after load
      document.querySelectorAll('.bg-sea, .hero-island').forEach(function (el) { el.style.transform = t; });
    };
    var queueBg = function () {
      if (!pending) { pending = true; requestAnimationFrame(drawBg); }
    };
    addEventListener('scroll', queueBg, { passive: true });
    addEventListener('resize', queueBg);
    still.addEventListener('change', queueBg);
    drawBg();
  }

  /* ---- Island: dots swell a little under the mouse ----
     The <img> paints first; with a mouse and motion allowed, the same (cached)
     SVG is fetched and swapped in inline so its dots can be scaled. Only runs
     frames while dots are still settling. */
  var isl = document.querySelector('img.hero-island');
  if (isl && matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
    fetch(isl.src).then(function (res) { return res.text(); }).then(function (text) {
      var svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
      svg.setAttribute('class', isl.className);
      svg.setAttribute('aria-hidden', 'true');
      svg.style.transform = isl.style.transform;
      isl.replaceWith(svg);
      var dots = Array.prototype.map.call(svg.querySelectorAll('circle'), function (c) {
        // k scatters the growth so neighbouring dots swell by different amounts
        return { el: c, x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), r: +c.getAttribute('r'), s: 1, k: 0.3 + Math.random() * 1.4 };
      });
      var REACH = 24, GROW = 0.18; // in dot-grid units; GROW is the extra size at the centre
      var mouse = null, frame = 0;
      var step = function () {
        frame = 0;
        var busy = false;
        dots.forEach(function (d) {
          var t = 1;
          if (mouse) {
            var f = Math.max(0, 1 - Math.hypot(d.x - mouse.x, d.y - mouse.y) / REACH);
            t = 1 + GROW * d.k * f * f * (3 - 2 * f);
          }
          if (Math.abs(t - d.s) < 0.003) {
            if (d.s !== t) { d.s = t; d.el.setAttribute('r', d.r * t); }
            return;
          }
          d.s += (t - d.s) * 0.06; // eases in and out over about a second
          d.el.setAttribute('r', (d.r * d.s).toFixed(3));
          busy = true;
        });
        if (busy) frame = requestAnimationFrame(step);
      };
      addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var b = svg.getBoundingClientRect();
        mouse = { x: (e.clientX - b.left) * 96 / b.width, y: (e.clientY - b.top) * 65 / b.height };
        if (!frame) frame = requestAnimationFrame(step);
      });
      document.documentElement.addEventListener('pointerleave', function () {
        mouse = null;
        if (!frame) frame = requestAnimationFrame(step);
      });
    }).catch(function () {}); // the static image stays
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
    document.querySelectorAll('a.nav-link, .nav-tile').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Nav dropdowns: one open at a time. With a mouse on desktop they open on
     hover and close when the pointer moves to another top-row item or leaves the
     pill; click (and Enter/Space)
     toggles everywhere else. Outside click or Escape closes. ---- */
  var drops = document.querySelectorAll('.nav-drop');
  var hoverNav = window.matchMedia('(hover: hover) and (min-width: 641px)');
  function setDrop(b, open) {
    b.setAttribute('aria-expanded', open);
    document.getElementById(b.getAttribute('aria-controls')).parentNode.classList.toggle('open', open);
  }
  function closeDrops(except) {
    drops.forEach(function (b) { if (b !== except) setDrop(b, false); });
  }
  drops.forEach(function (b) {
    b.addEventListener('mouseenter', function () {
      if (!hoverNav.matches) return;
      closeDrops(b);
      setDrop(b, true);
    });
    b.addEventListener('click', function (e) {
      // A mouse click on a menu hover already opened shouldn't shut it again
      var open = (hoverNav.matches && e.detail > 0) || b.getAttribute('aria-expanded') !== 'true';
      closeDrops(b);
      setDrop(b, open);
    });
  });
  // Hovering anything else in the top row (plain links, logo, CV) closes them
  document.querySelectorAll('a.nav-link, .nav-logo, .nav-cta').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      if (hoverNav.matches) closeDrops();
    });
  });
  var navEl = document.querySelector('.nav');
  if (navEl) navEl.addEventListener('mouseleave', function () {
    if (hoverNav.matches) closeDrops();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav')) closeDrops();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrops();
  });

  /* ---- Nav hover chip: slides to the hovered link, fades in fresh on entry ---- */
  var nav = document.querySelector('.nav');
  if (nav && window.matchMedia('(hover: hover)').matches) {
    var glide = document.createElement('span');
    glide.className = 'nav-glide';
    nav.appendChild(glide);
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        // Coming from hidden, jump into place rather than slide from the last link
        glide.style.transition = glide.style.opacity === '1' ? '' : 'opacity 0.15s';
        glide.style.width = link.offsetWidth + 'px';
        glide.style.height = link.offsetHeight + 'px';
        glide.style.transform = 'translate(' + link.offsetLeft + 'px,' + link.offsetTop + 'px)';
        glide.style.opacity = '1';
      });
    });
    function hideGlide() { glide.style.opacity = '0'; }
    nav.addEventListener('mouseleave', hideGlide);
    nav.querySelectorAll('.nav-menu').forEach(function (m) { m.addEventListener('mouseenter', hideGlide); });
  }

  /* ---- Scroll spy: highlight the nav link for the section in view ----
     Only on pages whose nav actually has same-page (#hash) links — i.e. index.
     Interior pages link out to index.html#… and keep a static .active pill, so
     running the spy there would just clear it as unrelated sections scroll by. */
  var spySections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('a.nav-link');
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
