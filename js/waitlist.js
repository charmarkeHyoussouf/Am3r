/* ============================================
   WAITLIST FORM — Am3r Group
   Connects waitlist form to SliderCaptcha + API
   ============================================ */

(function () {
  'use strict';

  var API_BASE = ''; // Set to your API domain e.g. 'https://api.am3rgroup.com'

  var form = document.getElementById('waitlistForm');
  if (!form) return;

  var app = form.getAttribute('data-app');
  var emailInput = form.querySelector('input[type="email"]');
  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = document.getElementById('waitlistStatus');

  var captcha = new window.SliderCaptcha({
    theme: app,
    onSuccess: function (token) {
      submitToWaitlist(token);
    },
    onClose: function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Notify Me';
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = emailInput.value.trim();
    if (!email) return;

    // Basic client-side email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    statusEl.textContent = '';
    statusEl.className = 'waitlist-status';

    // Open CAPTCHA
    captcha.open();
  });

  function submitToWaitlist(token) {
    submitBtn.textContent = 'Submitting...';

    var body = JSON.stringify({
      email: emailInput.value.trim(),
      app: app,
      captchaToken: token
    });

    fetch(API_BASE + '/api/waitlist.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          showStatus(data.message || "You're on the list!", 'success');
          emailInput.value = '';
          submitBtn.textContent = 'Joined!';
          submitBtn.disabled = true;
        } else {
          showStatus(data.error || 'Something went wrong. Try again.', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Notify Me';
        }
      })
      .catch(function () {
        showStatus('Network error. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Notify Me';
      });
  }

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'waitlist-status waitlist-status-' + type;
  }

})();
