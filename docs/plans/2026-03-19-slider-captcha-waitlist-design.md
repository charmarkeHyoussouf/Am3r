# Slider CAPTCHA + Waitlist System Design

**Date:** 2026-03-19
**Status:** Approved

## Overview

Add a custom slider puzzle CAPTCHA and per-app email waitlist to the Am3r Group website. No external CAPTCHA dependencies — pure Canvas API + vanilla JS on the frontend, PHP + MySQL on the backend (Namecheap shared hosting).

## Architecture

- **Frontend:** Vanilla JS slider CAPTCHA component (`slider-captcha.js`) + waitlist form on each app page
- **Backend:** PHP API on Namecheap shared hosting + MySQL
- **Static site** remains on GitHub Pages; API calls go to Namecheap-hosted `/api/` endpoints
- **CORS** restricted to `www.am3rgroup.com`

## 1. Slider CAPTCHA (Client-Side)

### Canvas Puzzle
- Canvas: 320x200 displaying a background image themed to each app
- Jigsaw-shaped puzzle piece: 44x44 with curved tabs via `arc()`
- Piece cut from random position, starts on left edge
- User drags slider handle horizontally to match cutout
- Position tolerance: 5px
- Success: green flash animation, checkmark, modal closes after 600ms
- Failure: red shake animation, resets with new puzzle after 1s
- Full touch + mouse support

### Behavioral Analysis (`computeBehaviorScore`)
Records `{x, y, t}` on every mousemove/touchmove during drag. Computes weighted score (0–1):

| Signal | Weight | Human Range | Bot Range |
|---|---|---|---|
| Path straightness | 0.25 | 2–15px deviation | ~0px |
| Speed variance | 0.25 | CV > 0.3 | CV ≈ 0 |
| Drag duration | 0.20 | 400–3000ms | <200ms or >5000ms |
| Start delay | 0.15 | >300ms | instant |
| Sample count | 0.15 | 20+ points | few points |

Pass threshold: score >= 0.4

### UI/UX
- Modal overlay, max-width 360px, dark backdrop
- Responsive and accessible (aria labels, Escape to close)
- English + Arabic (RTL) support
- Props/config: `open`, `onSuccess(token)`, `onClose`, `locale`

## 2. Token Flow

1. Client solves puzzle + score >= 0.4 → POSTs `{score, puzzleId}` to `/api/captcha/generate.php`
2. PHP creates token: `base64(JSON({ts, score, pid, sig}))` where `sig = HMAC-SHA256("ts|score|pid", CAPTCHA_SECRET)`
3. Client receives token, attaches as `captchaToken` in form submission
4. PHP verification checks:
   - (a) base64 decode + parse
   - (b) timestamp within 120s
   - (c) score >= 0.4
   - (d) HMAC signature via `hash_equals()`
   - (e) replay prevention via `captcha_tokens_used` table

Returns: `{valid: true}` or `{valid: false, reason: "malformed token" | "token expired" | "low behavior score" | "invalid signature" | "token already used"}`

## 3. Waitlist

- Each app page (Linguist, Deliber8, Phone Diet) gets a waitlist form: email input + submit button
- Form submit → `preventDefault()` → show SliderCaptcha → on success → POST to `/api/waitlist.php` with `{email, app, captchaToken}`
- PHP validates token, stores email in MySQL
- Success/error response shown inline

## 4. Rate Limiting

- `/api/captcha/generate.php`: 20 requests per 15 min per IP
- `/api/waitlist.php`: 10 requests per 15 min per IP
- Tracked via MySQL `rate_limits` table

## 5. Database Schema (MySQL)

```sql
CREATE TABLE waitlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  app VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45),
  UNIQUE KEY unique_email_app (email, app)
);

CREATE TABLE captcha_tokens_used (
  token_hash VARCHAR(64) PRIMARY KEY,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(45) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  window_start TIMESTAMP NOT NULL,
  count INT DEFAULT 1,
  UNIQUE KEY unique_ip_endpoint_window (ip, endpoint, window_start)
);
```

## 6. Security

- `CAPTCHA_SECRET` in PHP config file outside web root, never exposed to client
- Timing-safe HMAC comparison (`hash_equals()`)
- One-time token use (replay prevention)
- 120-second token expiry window
- Prepared statements for all SQL queries
- CORS headers restricting to `www.am3rgroup.com`
- Input validation and sanitization on all endpoints

## 7. File Structure

```
# On Namecheap shared hosting
/api/
  config.php              (CAPTCHA_SECRET, DB credentials — outside web root)
  captcha/generate.php
  captcha/verify.php
  waitlist.php
  includes/db.php
  includes/rate-limit.php
  includes/cors.php

# On GitHub Pages (Am3r repo)
/js/slider-captcha.js     (vanilla JS CAPTCHA component)
```

## 8. Form Integration Pattern

```
User clicks "Join Waitlist"
  → e.preventDefault()
  → Show <SliderCaptcha> modal
  → User solves puzzle
  → computeBehaviorScore() >= 0.4
  → POST /api/captcha/generate.php → receive token
  → POST /api/waitlist.php with {email, app, captchaToken}
  → Server verifies token → stores email
  → Show success message
```
