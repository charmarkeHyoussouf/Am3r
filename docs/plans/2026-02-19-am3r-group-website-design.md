# Am3r Group — Company Website Design Doc
**Date:** 2026-02-19
**Type:** Public Marketing Site
**Stack:** Pure HTML / CSS / JavaScript (no build tools)

---

## Overview

A public-facing marketing site for **Am3r Group**, a software company founded in 2011. The site showcases the company and its three products: Linguits, Deliber8, and Phone Diet Bootcamp.

Design aesthetic: **Dark Glassmorphism + Bento Grid** — the dominant 2026 web design trend. Dark near-black background, frosted-glass card panels, gold/amber accent system, grain texture overlay, and scroll-driven CSS animations.

---

## Site Architecture

| File | Description |
|---|---|
| `index.html` | Homepage (single-scroll, all sections) |
| `linguits.html` | Linguits app dedicated page |
| `deliber8.html` | Deliber8 app dedicated page |
| `phonediet.html` | Phone Diet Bootcamp dedicated page |
| `css/style.css` | Shared stylesheet |
| `js/main.js` | Shared JS (nav, scroll animations) |
| `assets/` | Images, icons, noise texture SVG |

---

## Homepage Sections (in order)

1. **Navigation** — Sticky glass nav bar. Logo (Am3r Group wordmark) on the left, links (About, Products, each app) on the right. `backdrop-filter: blur(16px)` on scroll.
2. **Hero** — Full-viewport dark section. Kinetic gold headline animates letter-by-letter on load. Tagline and "Founded 2011" badge beneath.
3. **About** — 2-column layout: left is a brief 3–4 sentence company description, right is a stat strip (year founded, apps built, etc.)
4. **Products (Bento Grid)** — Asymmetric 2-column CSS grid showcasing 3 app cards. Linguits occupies the large left tile; Deliber8 and Phone Diet Bootcamp stack on the right. Each card is a glass panel with gold border glow on hover.
5. **Footer** — Company name, copyright 2011–2026, nav links.

---

## Individual App Pages

Each app page shares the same nav and footer and follows this structure:

1. **App Hero** — Full-bleed dark hero with large app name, icon/emoji, tagline, and status badge (Live / In Development).
2. **Feature Highlights** — 3 glass cards in a row, each with a short title and 1-sentence description.
3. **CTA Strip** — "Back to Am3r Group" link and optional app store / download placeholder button.

### App Content

**Linguits** — Language Translator
- Tagline: *"Break the language barrier, instantly."*
- Features: 50+ Languages Supported / Real-time Translation / Offline Mode Ready
- Status: In Development

**Deliber8** — Debate App
- Tagline: *"Where every argument finds its answer."*
- Features: Structured Debate Rooms / AI-Assisted Scoring / Public & Private Debates
- Status: In Development

**Phone Diet Bootcamp** — Phone Locking / Digital Wellbeing
- Tagline: *"Reclaim your time. Lock the distraction."*
- Features: Scheduled Lock Sessions / Progress Tracking / Streak Rewards
- Status: In Development

---

## Visual Design System

### Colors
```
--bg:           #0c0c0c          /* near-black background */
--surface:      rgba(255,255,255,0.05)  /* glass card fill */
--border:       rgba(245,158,11,0.25)  /* gold glow border */
--accent:       #f59e0b          /* amber gold — primary CTA, highlights */
--accent-dark:  #d97706          /* deep gold — hover states */
--text:         #f5f5f5          /* primary text */
--muted:        #9ca3af          /* secondary/muted text */
```

### Typography
- **Headlines:** "Space Grotesk" (Google Fonts) — geometric, modern, techy
- **Body:** "Inter" (Google Fonts) — clean and readable
- Hero headline: `font-size: clamp(3rem, 8vw, 7rem)`, gold gradient fill, animates in letter-by-letter via JS + CSS

### Key Visual Effects
- `backdrop-filter: blur(16px)` on all glass cards and sticky nav
- Grain/noise texture overlay via `noise.svg` at 4% opacity on `body::after`
- Ambient radial gold glow behind hero headline (CSS radial-gradient pseudo-element)
- Card hover: `box-shadow: 0 0 30px rgba(245,158,11,0.3)`, subtle `translateY(-4px)` lift
- Scroll-driven fade+slide animations: `IntersectionObserver` triggers `.is-visible` class

### Bento Grid Layout (Products Section)
```
┌─────────────────────┬───────────────┐
│                     │               │
│   Linguits          │  Deliber8     │
│   (wide + tall)     │  (tall)       │
│                     ├───────────────┤
│                     │  Phone Diet   │
├─────────────────────┤  Bootcamp     │
│   "Est. 2011" badge │               │
└─────────────────────┴───────────────┘
```
CSS Grid: `grid-template-columns: 2fr 1fr`, Linguits spans 2 rows via `grid-row: span 2`.

---

## Content

**Hero Headline:** *"Building the software that shapes how the world communicates."*
**Hero Subline:** `Est. 2011 · Software that matters`

**About copy (brief):**
> Am3r Group is an independent software studio founded in 2011. We build focused, purposeful applications that solve real human problems — from language barriers to digital addiction to the art of structured debate.

---

## Animations & Interactions

| Element | Behavior |
|---|---|
| Hero headline | Letter-by-letter reveal on page load (JS + CSS keyframes) |
| Nav bar | Transparent → glass blur on scroll |
| Product cards | Fade + slide up on scroll (IntersectionObserver) |
| Card hover | Gold glow + subtle lift |
| Page transitions | Fade-out/in via CSS + JS on anchor navigation |

---

## Design Trend Reference

Research conducted 2026-02-19. Dominant 2026 trends applied:
- [Dark Glassmorphism — Medium](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
- [Bento Grids & Beyond — WriterDock](https://writerdock.in/blog/bento-grids-and-beyond-7-ui-trends-dominating-web-design-2026)
- [Web Design Trends 2026 — Figma](https://www.figma.com/resource-library/web-design-trends/)
- [Noise/Grain Texture Comeback — digitalsynopsis](https://digitalsynopsis.com/design/graphic-design-trends-2026/)
- [Kinetic Typography — Fontfabric](https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/)
