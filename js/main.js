/* ============================================
   AM3R GROUP — MAIN JS
   Nav scroll, kinetic hero, scroll reveals
   ============================================ */

(function () {
  'use strict';

  /* ---------- NAV: glass-on-scroll ---------- */
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on load

  /* ---------- NAV: mobile toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---------- KINETIC HERO TEXT ---------- */
  const heroTitle = document.getElementById('heroTitle');

  if (heroTitle) {
    // Split text into words and letters, preserving <br> tags
    const html = heroTitle.innerHTML;
    const parts = html.split(/(<br\s*\/?>)/gi);
    let letterIndex = 0;
    const BASE_DELAY = 0.55; // seconds before first letter starts
    const LETTER_DELAY = 0.03; // seconds between each letter

    heroTitle.innerHTML = parts.map(function (part) {
      if (/^<br/i.test(part)) {
        return part; // keep <br> as-is
      }
      // Wrap each non-space character in a span
      return part.split('').map(function (char) {
        if (char === ' ') return ' ';
        const delay = BASE_DELAY + letterIndex * LETTER_DELAY;
        letterIndex++;
        return '<span class="letter" style="animation-delay:' + delay.toFixed(3) + 's">' + char + '</span>';
      }).join('');
    }).join('');
  }

  /* ---------- SCROLL REVEAL (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // only animate once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all if IntersectionObserver not supported
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- SMOOTH ANCHOR SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();
