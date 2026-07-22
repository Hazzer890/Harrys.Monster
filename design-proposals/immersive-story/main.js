/* ============================================================
   Immersive Story — Harry Cassidy
   Kinetic reveals + ambient flow-field canvas.
   All continuous motion is gated on prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- split display lines into animatable words ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var words = el.textContent.split(/(\s+)/);
    el.textContent = "";
    words.forEach(function (w) {
      if (w.trim() === "") { el.appendChild(document.createTextNode(w)); return; }
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = w;
      el.appendChild(span);
    });
  });

  /* ---------- reveal on scroll (IntersectionObserver) ---------- */
  var revealables = document.querySelectorAll("[data-reveal], [data-split]");
  function revealAll() {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px 12% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
    // Safety net: a static full-page render (and any screenshotter) never
    // scrolls, so below-fold sections would stay hidden. Reveal anything the
    // observer hasn't caught shortly after load — real visitors have already
    // scroll-triggered the early sections by then.
    window.addEventListener("load", function () { setTimeout(revealAll, 1100); });
  } else {
    revealAll();
  }

  /* ---------- scroll progress rail ---------- */
  var bar = document.getElementById("progress-bar");
  var ticking = false;
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
    ticking = false;
    return p;
  }
  var scrollProgress = 0;
  window.addEventListener("scroll", function () {
    scrollProgress = (document.documentElement.scrollTop || window.scrollY) /
      Math.max(1, document.documentElement.scrollHeight - document.documentElement.clientHeight);
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* ============================================================
     Ambient flow-field canvas
     ============================================================ */
  var canvas = document.getElementById("field");
  if (!canvas || reduceMotion) return;      // reduced motion → no canvas animation
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var COUNT = 0;
  var pointer = { x: 0.5, y: 0.5, active: false };
  var t = 0;

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
    ctx.fillStyle = "#08090a";
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
    ctx.fillStyle = "rgba(8,9,10,0.11)";
    ctx.fillRect(0, 0, W, H);

    // accent shifts subtly from lime toward cyan as you descend
    var g = Math.round(255 - scrollProgress * 90);
    var b = Math.round(62 + scrollProgress * 150);
    ctx.strokeStyle = "rgba(216," + g + "," + b + ",0.16)";
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
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  window.addEventListener("pointermove", function (e) {
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = e.clientY / window.innerHeight;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener("pointerleave", function () { pointer.active = false; });

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });

  resize();
  start();
})();
