// Ambient flow-field canvas — scroll + pointer reactive.
// Lifted from the immersive-story proposal, recoloured for liquid glass.
// Reduced motion → no animation at all (transparent canvas over the CSS bg).
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.getElementById('field');
  if (!canvas || reduceMotion) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Per-theme field palette. trail(s) drifts colour with scroll progress.
  var THEMES = {
    dark: {
      base: '#0a0e1a',
      fade: 'rgba(10,14,26,0.10)',
      trail: function (s) { // cyan → magenta
        return 'rgba(' + Math.round(52 + s * 157) + ',' +
          Math.round(226 - s * 119) + ',' + Math.round(226 + s * 29) + ',0.20)';
      }
    },
    light: {
      base: '#eef1fa',
      fade: 'rgba(238,241,250,0.08)',
      trail: function (s) { // deep indigo → magenta, stronger contrast on white
        return 'rgba(' + Math.round(48 + s * 108) + ',' +
          Math.round(64 - s * 44) + ',' + Math.round(168 - s * 20) + ',0.30)';
      }
    }
  };
  var pal = THEMES[document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'];
  window.__setFieldTheme = function (t) {
    pal = THEMES[t === 'dark' ? 'dark' : 'light'];
    if (ctx) { ctx.fillStyle = pal.base; ctx.fillRect(0, 0, W, H); }
  };

  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var COUNT = 0;
  var pointer = { x: 0.5, y: 0.5, active: false };
  var t = 0;

  var scrollProgress = 0;
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    scrollProgress = (h.scrollTop || window.scrollY) /
      Math.max(1, h.scrollHeight - h.clientHeight);
  }, { passive: true });

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // particle density scaled to area, capped for perf
    COUNT = Math.min(260, Math.floor((W * H) / 7000));
    particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(spawn());
    ctx.fillStyle = pal.base;
    ctx.fillRect(0, 0, W, H);
  }

  function spawn(reset) {
    var p = reset || {};
    p.x = Math.random() * W;
    p.y = Math.random() * H;
    p.life = 40 + Math.random() * 160;
    p.age = 0;
    return p;
  }

  // Cheap curl-ish field: layered sines. Returns an angle.
  function fieldAngle(x, y) {
    var scale = 0.0016 + scrollProgress * 0.0014;
    var a = Math.sin(x * scale + t * 0.15) +
            Math.cos(y * scale - t * 0.12) +
            Math.sin((x + y) * scale * 0.6 + t * 0.08);
    var angle = a * 1.4;
    // pointer swirl
    if (pointer.active) {
      var dx = x - pointer.x * W, dy = y - pointer.y * H;
      var d2 = dx * dx + dy * dy;
      var influence = 26000 / (d2 + 26000);
      angle += influence * Math.atan2(dy, dx) * 0.9;
    }
    return angle;
  }

  function frame() {
    t += 0.02;
    // fade previous frame for trails
    ctx.fillStyle = pal.fade;
    ctx.fillRect(0, 0, W, H);

    // line colour drifts with scroll depth (per-theme)
    ctx.strokeStyle = pal.trail(scrollProgress);
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var ang = fieldAngle(p.x, p.y);
      var speed = 0.9 + scrollProgress * 1.3;
      var nx = p.x + Math.cos(ang) * speed;
      var ny = p.y + Math.sin(ang) * speed;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      p.x = nx; p.y = ny; p.age++;
      if (p.age > p.life || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
        spawn(p);
      }
    }
    ctx.stroke();
    raf = requestAnimationFrame(frame);
  }

  var raf = null;
  function start() { if (!raf) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  // pause when tab hidden (perf + battery)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  window.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = e.clientY / window.innerHeight;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', function () { pointer.active = false; });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });

  resize();
  start();
})();
