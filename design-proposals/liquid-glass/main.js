// Liquid Glass — progressive enhancement only. Page is fully readable without JS.
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js"); // CSS uses .js to hide-then-reveal .reveal elements

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // Entrance fade-up is handled by CSS (.js .reveal) so a static capture renders it.

  // Pointer tilt on glass panels — fine pointers only, respects reduced-motion
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!reduceMotion && finePointer) {
    var panels = Array.prototype.slice.call(
      document.querySelectorAll(".glass--hero, .card, .explore-card")
    );
    panels.forEach(function (panel) {
      panel.classList.add("tilt");
      panel.addEventListener("mousemove", function (ev) {
        var r = panel.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        var max = 5; // degrees
        panel.style.setProperty("--ry", (px * max).toFixed(2) + "deg");
        panel.style.setProperty("--rx", (-py * max).toFixed(2) + "deg");
      });
      panel.addEventListener("mouseleave", function () {
        panel.style.setProperty("--rx", "0deg");
        panel.style.setProperty("--ry", "0deg");
      });
    });
  }
})();
