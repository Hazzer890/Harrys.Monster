document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initSmoothScroll();
  initScrollAnimations();
  initActiveNavHighlight();
  initFooterYear();
  initFormHandler();
});

/* ---- Mobile Navigation ---- */
function initMobileNav() {
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.nav-link');

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- Smooth Scroll with Header Offset ---- */
function initSmoothScroll() {
  const headerHeight = document.querySelector('.header').offsetHeight;

  // Only intercept same-page anchor links (starting with # and no path)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.offsetTop - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---- Scroll Animations (staggered) ---- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  // Group elements by their parent section for staggered delays
  const sectionMap = new Map();
  elements.forEach(el => {
    const section = el.closest('.section') || el;
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section).push(el);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target.closest('.section') || entry.target;
        const siblings = sectionMap.get(section) || [entry.target];
        const index = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 0.1}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

/* ---- Active Nav Highlight (Scroll Spy) ---- */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('main .section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  // If there are no sections with IDs (e.g. timeline page), just keep the .active class from HTML
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}` || href === `index.html#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -60% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ---- Footer Year ---- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---- Contact Form Handler ---- */
function initFormHandler() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = form.getAttribute('action');

    // If no real form endpoint is configured yet, show a note
    if (!action || action === '#') {
      status.textContent = 'Form endpoint not configured yet. Update the form action with your Formspree URL.';
      status.className = 'form-status error';
      return;
    }

    const data = new FormData(form);
    status.textContent = 'Sending...';
    status.className = 'form-status';

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        status.textContent = 'Message sent! I\'ll get back to you soon.';
        status.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Failed');
      }
    } catch {
      status.textContent = 'Something went wrong. Please try again or email me directly.';
      status.className = 'form-status error';
    }
  });
}
