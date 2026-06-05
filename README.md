# Brent Parent Intelligence Studio

Premium personal freelance portfolio for Brent Parent / Intelligence Studio.

This redesign is built for the existing `bmparent/brent-parent-intelligence-studio` Cloudflare Pages repo. It presents Brent as a creative technologist, UI/UX designer, automation builder, storefront systems developer, and experimental intelligence-systems builder.

## What changed

- Reframed the homepage as a personal freelance intelligence studio, not an InkSoft storefront.
- Added a premium dark / glass intelligence visual system with restrained gold, cyan, and stone accents.
- Preserved a subtle Babylon.js canvas as progressive enhancement behind the hero.
- Added GSAP + ScrollTrigger reveal motion with reduced-motion fallback.
- Added semantic, prerendered public HTML for better crawlability and agent/search readability.
- Added real case-study framing for all supplied InkSoft stores.
- Added Cloudinary-hosted responsive image handling for the supplied profile image and gallery mockups.
- Added DG Printavo Production Reports as a grounded operational-intelligence case study.
- Added Eidos Brain as a proof-stage experimental intelligence architecture section.
- Added a real contact path using `bmparent@outlook.com` plus a copy-ready project brief.

## Stack

- Vite + React + TypeScript
- Babylon.js as a subtle progressive-enhancement layer
- GSAP + ScrollTrigger for tasteful section reveals
- Modern CSS with tokens, semantic layout classes, responsive rules, and reduced-motion support
- Cloudinary-hosted imagery
- Static prerender step for first-load HTML

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run build
npm run verify:urls
```

## Cloudflare Pages deployment

Use the existing Cloudflare Pages project connected to GitHub.

Recommended settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 24 LTS
Production branch: main
Root directory: /
```

The repo includes `.node-version` so Cloudflare Pages uses Node 24 LTS for the build.
The production build output is written to `dist/`.

## Content and proof surfaces

The site includes:

- Hero with Brent profile image and clear freelance positioning
- Services / capabilities
- Seven live InkSoft storefront case studies
- Cloudinary visual project gallery
- DG Printavo Production Reports case study
- Eidos Brain white-paper case study
- Client process section
- Final freelance CTA

## Accessibility and performance notes

Core content is HTML/CSS and remains usable without WebGL. The Babylon.js layer is dynamically imported, hidden for reduced-motion users, and excluded from module preload. Interactive elements use real anchors/buttons, focus states are visible, images include alt text, and mobile layouts are single-column where needed.
