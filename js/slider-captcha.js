/* ============================================
   SLIDER PUZZLE CAPTCHA — Am3r Group
   Pure Canvas API, zero dependencies
   ============================================ */

(function () {
  'use strict';

  // ---- Config ----
  var CANVAS_W = 320;
  var CANVAS_H = 200;
  var PIECE_SIZE = 44;
  var TAB_R = 8;
  var TOLERANCE = 5;
  var API_BASE = ''; // Set to your API domain e.g. 'https://api.am3rgroup.com'

  // ---- i18n ----
  var STRINGS = {
    en: {
      title: 'Verify you\'re human',
      instruction: 'Drag the slider to complete the puzzle',
      success: 'Verified!',
      fail: 'Try again',
      close: 'Close'
    },
    ar: {
      title: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0647\u0648\u064a\u062a\u0643',
      instruction: '\u0627\u0633\u062d\u0628 \u0627\u0644\u0645\u0624\u0634\u0631 \u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0644\u063a\u0632',
      success: '\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642!',
      fail: '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
      close: '\u0625\u063a\u0644\u0627\u0642'
    }
  };

  // ---- Background images (generated via canvas patterns) ----
  function generateBgImage(canvas, theme) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    // Dark gradient base
    var grad = ctx.createLinearGradient(0, 0, w, h);
    if (theme === 'linguist') {
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(0.5, '#16213e');
      grad.addColorStop(1, '#0f3460');
    } else if (theme === 'deliber8') {
      grad.addColorStop(0, '#1a1a1a');
      grad.addColorStop(0.5, '#2d1810');
      grad.addColorStop(1, '#1a0a00');
    } else if (theme === 'phonediet') {
      grad.addColorStop(0, '#0a1a0a');
      grad.addColorStop(0.5, '#1a2e1a');
      grad.addColorStop(1, '#0f2f1f');
    } else {
      grad.addColorStop(0, '#1a1500');
      grad.addColorStop(0.5, '#2e2000');
      grad.addColorStop(1, '#1a1200');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative geometric shapes
    ctx.globalAlpha = 0.08;
    for (var i = 0; i < 12; i++) {
      var x = Math.random() * w;
      var y = Math.random() * h;
      var r = 20 + Math.random() * 60;
      ctx.beginPath();
      if (i % 3 === 0) {
        ctx.arc(x, y, r, 0, Math.PI * 2);
      } else if (i % 3 === 1) {
        ctx.rect(x - r / 2, y - r / 2, r, r);
      } else {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.lineTo(x - r, y + r);
        ctx.closePath();
      }
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }

    // Grid lines
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (var gy = 0; gy < h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Noise dots
    ctx.globalAlpha = 0.06;
    for (var d = 0; d < 200; d++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#f59e0b' : '#ffffff';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    ctx.globalAlpha = 1;
  }

  // ---- Jigsaw path ----
  function drawPiecePath(ctx, x, y, size, tabR) {
    var s = size;
    var t = tabR;
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Top edge with tab
    ctx.lineTo(x + s * 0.35, y);
    ctx.arc(x + s * 0.5, y, t, Math.PI, 0, false);
    ctx.lineTo(x + s, y);
    // Right edge with tab
    ctx.lineTo(x + s, y + s * 0.35);
    ctx.arc(x + s, y + s * 0.5, t, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(x + s, y + s);
    // Bottom edge
    ctx.lineTo(x, y + s);
    // Left edge
    ctx.lineTo(x, y);
    ctx.closePath();
  }

  // ---- Behavior scoring ----
  function computeBehaviorScore(trajectory, modalOpenTime) {
    if (!trajectory || trajectory.length < 3) return 0;

    var score = 0;
    var n = trajectory.length;

    // 1. Path straightness (weight 0.25) — avg perpendicular deviation
    var startY = trajectory[0].y;
    var totalDeviation = 0;
    for (var i = 0; i < n; i++) {
      totalDeviation += Math.abs(trajectory[i].y - startY);
    }
    var avgDev = totalDeviation / n;
    // Humans: 2–15px, bots: ~0px
    var straightScore;
    if (avgDev < 0.5) straightScore = 0; // too perfect = bot
    else if (avgDev <= 15) straightScore = 1;
    else if (avgDev <= 30) straightScore = 0.5;
    else straightScore = 0.2;
    score += straightScore * 0.25;

    // 2. Speed variance (weight 0.25) — coefficient of variation
    var velocities = [];
    for (var j = 1; j < n; j++) {
      var dt = trajectory[j].t - trajectory[j - 1].t;
      if (dt > 0) {
        var dx = Math.abs(trajectory[j].x - trajectory[j - 1].x);
        velocities.push(dx / dt);
      }
    }
    var speedScore = 0;
    if (velocities.length > 2) {
      var mean = velocities.reduce(function (a, b) { return a + b; }, 0) / velocities.length;
      if (mean > 0) {
        var variance = velocities.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / velocities.length;
        var cv = Math.sqrt(variance) / mean;
        // Humans: CV > 0.3, bots: CV ≈ 0
        if (cv > 0.3) speedScore = 1;
        else if (cv > 0.1) speedScore = 0.5;
        else speedScore = 0;
      }
    }
    score += speedScore * 0.25;

    // 3. Drag duration (weight 0.20)
    var duration = trajectory[n - 1].t - trajectory[0].t;
    var durationScore;
    if (duration >= 400 && duration <= 3000) durationScore = 1;
    else if (duration >= 200 && duration < 400) durationScore = 0.5;
    else if (duration > 3000 && duration <= 5000) durationScore = 0.5;
    else durationScore = 0;
    score += durationScore * 0.20;

    // 4. Start delay (weight 0.15) — time from modal open to first drag
    var startDelay = trajectory[0].t - modalOpenTime;
    var delayScore;
    if (startDelay > 300) delayScore = 1;
    else if (startDelay > 100) delayScore = 0.5;
    else delayScore = 0;
    score += delayScore * 0.15;

    // 5. Sample count (weight 0.15)
    var countScore;
    if (n >= 20) countScore = 1;
    else if (n >= 10) countScore = 0.6;
    else if (n >= 5) countScore = 0.3;
    else countScore = 0;
    score += countScore * 0.15;

    return Math.round(score * 100) / 100;
  }

  // ---- SliderCaptcha class ----
  function SliderCaptcha(options) {
    this.onSuccess = options.onSuccess || function () {};
    this.onClose = options.onClose || function () {};
    this.locale = options.locale || 'en';
    this.theme = options.theme || 'default';
    this.strings = STRINGS[this.locale] || STRINGS.en;
    this.isRtl = this.locale === 'ar';

    this.modal = null;
    this.canvas = null;
    this.ctx = null;
    this.pieceCanvas = null;
    this.pieceCtx = null;
    this.sliderHandle = null;
    this.sliderTrack = null;

    this.targetX = 0;
    this.pieceY = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.trajectory = [];
    this.modalOpenTime = 0;
    this.puzzleId = '';
    this.isOpen = false;

    this._buildDOM();
    this._bindEvents();
  }

  SliderCaptcha.prototype._buildDOM = function () {
    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'captcha-backdrop';
    this.backdrop.setAttribute('aria-hidden', 'true');

    // Modal
    this.modal = document.createElement('div');
    this.modal.className = 'captcha-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-label', this.strings.title);
    if (this.isRtl) this.modal.setAttribute('dir', 'rtl');

    // Header
    var header = document.createElement('div');
    header.className = 'captcha-header';

    var title = document.createElement('span');
    title.className = 'captcha-title';
    title.textContent = this.strings.title;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'captcha-close';
    closeBtn.setAttribute('aria-label', this.strings.close);
    closeBtn.innerHTML = '&times;';
    closeBtn.type = 'button';

    header.appendChild(title);
    header.appendChild(closeBtn);
    this.closeBtn = closeBtn;

    // Canvas container
    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'captcha-canvas-wrap';

    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.canvas.className = 'captcha-canvas';
    this.ctx = this.canvas.getContext('2d');

    this.pieceCanvas = document.createElement('canvas');
    this.pieceCanvas.width = PIECE_SIZE + TAB_R * 2;
    this.pieceCanvas.height = PIECE_SIZE + TAB_R * 2;
    this.pieceCanvas.className = 'captcha-piece';
    this.pieceCtx = this.pieceCanvas.getContext('2d');

    canvasWrap.appendChild(this.canvas);
    canvasWrap.appendChild(this.pieceCanvas);
    this.canvasWrap = canvasWrap;

    // Instruction
    var instruction = document.createElement('p');
    instruction.className = 'captcha-instruction';
    instruction.textContent = this.strings.instruction;
    this.instruction = instruction;

    // Slider
    var sliderWrap = document.createElement('div');
    sliderWrap.className = 'captcha-slider-wrap';

    this.sliderTrack = document.createElement('div');
    this.sliderTrack.className = 'captcha-slider-track';

    this.sliderFill = document.createElement('div');
    this.sliderFill.className = 'captcha-slider-fill';

    this.sliderHandle = document.createElement('div');
    this.sliderHandle.className = 'captcha-slider-handle';
    this.sliderHandle.setAttribute('role', 'slider');
    this.sliderHandle.setAttribute('aria-label', this.strings.instruction);
    this.sliderHandle.setAttribute('tabindex', '0');
    // Arrow icon
    this.sliderHandle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

    this.sliderTrack.appendChild(this.sliderFill);
    this.sliderTrack.appendChild(this.sliderHandle);
    sliderWrap.appendChild(this.sliderTrack);

    // Status
    this.statusEl = document.createElement('div');
    this.statusEl.className = 'captcha-status';

    // Assemble
    this.modal.appendChild(header);
    this.modal.appendChild(canvasWrap);
    this.modal.appendChild(instruction);
    this.modal.appendChild(sliderWrap);
    this.modal.appendChild(this.statusEl);

    this.backdrop.appendChild(this.modal);
  };

  SliderCaptcha.prototype._bindEvents = function () {
    var self = this;

    // Close
    this.closeBtn.addEventListener('click', function () { self.close(); });
    this.backdrop.addEventListener('click', function (e) {
      if (e.target === self.backdrop) self.close();
    });

    // Escape key
    this._escHandler = function (e) {
      if (e.key === 'Escape' && self.isOpen) self.close();
    };

    // Mouse drag
    this.sliderHandle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      self._startDrag(e.clientX);
    });
    document.addEventListener('mousemove', function (e) {
      if (self.isDragging) self._onDrag(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', function () {
      if (self.isDragging) self._endDrag();
    });

    // Touch drag
    this.sliderHandle.addEventListener('touchstart', function (e) {
      e.preventDefault();
      self._startDrag(e.touches[0].clientX);
    }, { passive: false });
    document.addEventListener('touchmove', function (e) {
      if (self.isDragging) self._onDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    document.addEventListener('touchend', function () {
      if (self.isDragging) self._endDrag();
    });
  };

  SliderCaptcha.prototype._startDrag = function (clientX) {
    this.isDragging = true;
    this.dragStartX = clientX;
    this.trajectory = [];
    this.sliderHandle.classList.add('active');
    this.trajectory.push({ x: 0, y: 0, t: Date.now() });
  };

  SliderCaptcha.prototype._onDrag = function (clientX, clientY) {
    var trackRect = this.sliderTrack.getBoundingClientRect();
    var handleW = 44;
    var maxDrag = trackRect.width - handleW;
    var dx = clientX - trackRect.left - handleW / 2;
    dx = Math.max(0, Math.min(dx, maxDrag));

    // Move handle
    this.sliderHandle.style.left = dx + 'px';
    this.sliderFill.style.width = (dx + handleW / 2) + 'px';

    // Move piece proportionally to canvas
    var ratio = dx / maxDrag;
    this.currentX = ratio * (CANVAS_W - PIECE_SIZE - TAB_R * 2);
    this.pieceCanvas.style.left = this.currentX + 'px';

    // Record trajectory
    this.trajectory.push({ x: dx, y: clientY, t: Date.now() });
  };

  SliderCaptcha.prototype._endDrag = function () {
    this.isDragging = false;
    this.sliderHandle.classList.remove('active');

    var diff = Math.abs(this.currentX - this.targetX);
    if (diff <= TOLERANCE) {
      this._onSolveSuccess();
    } else {
      this._onSolveFail();
    }
  };

  SliderCaptcha.prototype._onSolveSuccess = function () {
    var self = this;
    var score = computeBehaviorScore(this.trajectory, this.modalOpenTime);

    if (score < 0.4) {
      this._onSolveFail();
      return;
    }

    // Visual success
    this.canvasWrap.classList.add('captcha-success');
    this.statusEl.textContent = this.strings.success;
    this.statusEl.className = 'captcha-status captcha-status-success';

    // Request token from server
    var body = JSON.stringify({ score: score, puzzleId: this.puzzleId });
    fetch(API_BASE + '/api/captcha/generate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.token) {
          setTimeout(function () {
            self.close();
            self.onSuccess(data.token);
          }, 600);
        } else {
          self._onSolveFail();
        }
      })
      .catch(function () {
        // If server unreachable, generate client-side fallback token
        var fallback = btoa(JSON.stringify({ ts: Date.now(), score: score, pid: self.puzzleId, fallback: true }));
        setTimeout(function () {
          self.close();
          self.onSuccess(fallback);
        }, 600);
      });
  };

  SliderCaptcha.prototype._onSolveFail = function () {
    var self = this;
    this.canvasWrap.classList.add('captcha-fail');
    this.statusEl.textContent = this.strings.fail;
    this.statusEl.className = 'captcha-status captcha-status-fail';

    setTimeout(function () {
      self.canvasWrap.classList.remove('captcha-fail');
      self.statusEl.textContent = '';
      self.statusEl.className = 'captcha-status';
      self._reset();
    }, 1000);
  };

  SliderCaptcha.prototype._reset = function () {
    this.sliderHandle.style.left = '0px';
    this.sliderFill.style.width = '0px';
    this.pieceCanvas.style.left = '0px';
    this.currentX = 0;
    this.trajectory = [];
    this.canvasWrap.classList.remove('captcha-success');
    this._generatePuzzle();
  };

  SliderCaptcha.prototype._generatePuzzle = function () {
    this.puzzleId = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // Random target position (keep away from edges)
    this.targetX = 80 + Math.random() * (CANVAS_W - PIECE_SIZE - TAB_R * 2 - 100);
    this.pieceY = 30 + Math.random() * (CANVAS_H - PIECE_SIZE - TAB_R * 2 - 60);

    // Draw background
    generateBgImage(this.canvas, this.theme);

    // Draw cutout hole (darker)
    this.ctx.save();
    drawPiecePath(this.ctx, this.targetX, this.pieceY, PIECE_SIZE, TAB_R);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.restore();

    // Extract piece image
    var pieceW = PIECE_SIZE + TAB_R * 2;
    var pieceH = PIECE_SIZE + TAB_R * 2;
    this.pieceCanvas.width = pieceW;
    this.pieceCanvas.height = pieceH;

    // Redraw bg on temp canvas for clean extraction
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_W;
    tempCanvas.height = CANVAS_H;
    var tempCtx = tempCanvas.getContext('2d');
    generateBgImage(tempCanvas, this.theme);

    // Clip piece from background
    this.pieceCtx.clearRect(0, 0, pieceW, pieceH);
    this.pieceCtx.save();
    drawPiecePath(this.pieceCtx, TAB_R, TAB_R, PIECE_SIZE, TAB_R);
    this.pieceCtx.clip();
    this.pieceCtx.drawImage(tempCanvas, -(this.targetX - TAB_R), -(this.pieceY - TAB_R));
    this.pieceCtx.restore();

    // Piece border
    drawPiecePath(this.pieceCtx, TAB_R, TAB_R, PIECE_SIZE, TAB_R);
    this.pieceCtx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    this.pieceCtx.lineWidth = 2;
    this.pieceCtx.stroke();

    // Shadow on piece
    this.pieceCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.pieceCtx.shadowBlur = 8;

    // Position piece at left
    this.pieceCanvas.style.left = '0px';
    this.pieceCanvas.style.top = (this.pieceY - TAB_R) + 'px';
  };

  SliderCaptcha.prototype.open = function () {
    if (this.isOpen) return;
    this.isOpen = true;
    this.modalOpenTime = Date.now();
    document.body.appendChild(this.backdrop);
    document.addEventListener('keydown', this._escHandler);

    // Trigger animation
    var self = this;
    requestAnimationFrame(function () {
      self.backdrop.classList.add('captcha-visible');
    });

    this._reset();
    document.body.style.overflow = 'hidden';
  };

  SliderCaptcha.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.backdrop.classList.remove('captcha-visible');
    document.removeEventListener('keydown', this._escHandler);
    document.body.style.overflow = '';

    var self = this;
    setTimeout(function () {
      if (self.backdrop.parentNode) {
        self.backdrop.parentNode.removeChild(self.backdrop);
      }
    }, 300);

    this.onClose();
  };

  // ---- Expose globally ----
  window.SliderCaptcha = SliderCaptcha;

})();
