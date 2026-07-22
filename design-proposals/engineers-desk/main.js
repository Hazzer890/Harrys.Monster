/* Engineer's Desk × Glass — progressive enhancement only.
   Everything here is additive: the page is fully usable with this file absent. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Typed hero line ---------- */
  (function typeHero() {
    var el = document.getElementById('typed');
    var caret = document.getElementById('caret');
    if (!el) return;
    var text = el.getAttribute('data-text') || '';

    function finish() {
      el.textContent = text;
      if (caret) { caret.style.animationPlayState = 'running'; }
    }
    if (reduceMotion) { finish(); return; }

    var i = 0, done = false;
    function step() {
      if (done) return;
      el.textContent = text.slice(0, i);
      if (i >= text.length) { done = true; return; }
      i++;
      setTimeout(step, 55 + Math.random() * 45);
    }
    // Skippable: any key or click completes it instantly.
    function skip() { done = true; finish(); cleanup(); }
    function cleanup() {
      window.removeEventListener('keydown', skip, true);
      window.removeEventListener('click', skip, true);
    }
    window.addEventListener('keydown', skip, true);
    window.addEventListener('click', skip, true);
    step();
  })();

  /* ---------- 2. Reveal windows on scroll ---------- */
  (function revealOnScroll() {
    var items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    // Safety: reveal anything already in view on load.
    requestAnimationFrame(function () {
      items.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      });
    });
    // Failsafe: never let a window stay hidden if the observer misses it.
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('in'); });
    }, 2600);
  })();

  /* ---------- 3. Command palette ---------- */
  (function palette() {
    var overlay = document.getElementById('palette');
    var trigger = document.getElementById('palette-trigger');
    var input = document.getElementById('palette-input');
    var list = document.getElementById('palette-list');
    if (!overlay || !list) return;
    var options = Array.prototype.slice.call(list.querySelectorAll('[role="option"]'));
    var lastFocused = null;

    function visibleOptions() {
      return options.filter(function (o) { return !o.hidden; });
    }
    function setActive(idx) {
      var vis = visibleOptions();
      vis.forEach(function (o) { o.classList.remove('active'); });
      if (vis.length === 0) return;
      idx = (idx + vis.length) % vis.length;
      vis[idx].classList.add('active');
      vis[idx].scrollIntoView({ block: 'nearest' });
    }
    function activeIndex() {
      var vis = visibleOptions();
      for (var i = 0; i < vis.length; i++) if (vis[i].classList.contains('active')) return i;
      return -1;
    }
    function open() {
      lastFocused = document.activeElement;
      overlay.hidden = false;
      input.value = '';
      filter('');
      setActive(0);
      setTimeout(function () { input.focus(); }, 0);
    }
    function close() {
      overlay.hidden = true;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    function go(target) {
      close();
      if (!target) return;
      if (target.charAt(0) === '#') {
        var dest = document.querySelector(target);
        if (dest) {
          dest.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
          history.replaceState(null, '', target);
        }
      } else {
        window.location.href = target;
      }
    }
    function filter(q) {
      q = q.toLowerCase().trim();
      options.forEach(function (o) {
        o.hidden = q !== '' && o.textContent.toLowerCase().indexOf(q) === -1;
      });
      setActive(0);
    }

    if (trigger) trigger.addEventListener('click', open);

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        overlay.hidden ? open() : close();
      } else if (!overlay.hidden && e.key === 'Escape') {
        close();
      }
    });

    input.addEventListener('input', function () { filter(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex() + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex() - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var vis = visibleOptions();
        var cur = vis[activeIndex()] || vis[0];
        if (cur) go(cur.getAttribute('data-target'));
      }
    });

    list.addEventListener('click', function (e) {
      var li = e.target.closest('[role="option"]');
      if (li) go(li.getAttribute('data-target'));
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
  })();

  /* ---------- 4. Ambient desk background (drifting grid + slow motes) ---------- */
  (function ambient() {
    var canvas = document.getElementById('ambient');
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var w, h, dpr, motes = [];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(innerWidth * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      var count = Math.round((innerWidth * innerHeight) / 42000);
      motes = [];
      for (var i = 0; i < count; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (Math.random() * 1.4 + 0.4) * dpr,
          vx: (Math.random() - 0.5) * 0.12 * dpr,
          vy: (Math.random() - 0.5) * 0.12 * dpr,
          a: Math.random() * 0.4 + 0.15
        });
      }
    }

    var t = 0;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      t += 0.0016;

      // Drifting grid
      var gap = 46 * dpr;
      var ox = (Math.sin(t) * 20) * dpr;
      var oy = ((t * 8 * dpr) % gap);
      ctx.lineWidth = dpr;
      ctx.strokeStyle = 'rgba(120, 160, 200, 0.045)';
      ctx.beginPath();
      for (var x = (ox % gap); x < w; x += gap) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (var y = (oy % gap); y < h; y += gap) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // Slow amber motes
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx; m.y += m.vy;
        if (m.x < 0) m.x = w; if (m.x > w) m.x = 0;
        if (m.y < 0) m.y = h; if (m.y > h) m.y = 0;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 184, 94, ' + m.a + ')';
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    var raf;
    resize();
    frame();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(resize, 200);
    });
    // Pause when tab hidden — no point burning cycles.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(frame); }
    });
  })();
})();
