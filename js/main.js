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

  /* ---------- NAV: mobile full-screen overlay ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    nav.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Close any open submenus
    var openSubs = document.querySelectorAll('.has-submenu.open');
    openSubs.forEach(function (el) { el.classList.remove('open'); });
  }

  function openMenu() {
    navLinks.classList.add('open');
    navToggle.classList.add('open');
    nav.classList.add('menu-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // lock scroll
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      if (navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on link click (skip Products toggle — it only opens submenu)
    navLinks.querySelectorAll('a').forEach(function (link) {
      if (link.classList.contains('nav-products-toggle')) return;
      link.addEventListener('click', closeMenu);
    });

    // Close when tapping the overlay background (not on a link)
    navLinks.addEventListener('click', function (e) {
      if (e.target === navLinks) closeMenu();
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- NAV: Products submenu toggle (mobile only) ---------- */
  var productsToggle = document.querySelector('.nav-products-toggle');
  if (productsToggle) {
    productsToggle.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentElement.classList.toggle('open');
    });

    // Desktop: close submenu when clicking outside
    document.addEventListener('click', function (e) {
      var submenu = document.querySelector('.has-submenu');
      if (submenu && submenu.classList.contains('open') && !submenu.contains(e.target)) {
        submenu.classList.remove('open');
      }
    });
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
      // Skip Products toggle — it only opens the submenu, not scrolls
      if (this.classList.contains('nav-products-toggle')) return;
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

  /* ---------- COPY EMAIL BUTTONS ---------- */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var email = this.getAttribute('data-email');
      navigator.clipboard.writeText(email).then(function () {
        btn.classList.add('copied');
        setTimeout(function () {
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

})();
