# Brent Parent Intelligence Studio

Premium business-services showcase and immersive operational-intelligence portfolio for Brent Parent.

This site is built as a deployable static-first website for Cloudflare Pages. It presents Brent's professional services while demonstrating advanced frontend systems, Three.js/WebGL interaction, InkSoft storefront thinking, Printavo workflow automation, Python tools, Google Cloud architecture concepts, AI workflow assistants, and the Eidos Brain / Sentinel intelligence platform vision.

## Stack

- Vite + React + TypeScript
- Three.js + React Three Fiber + Drei
- GSAP + ScrollTrigger
- Framer Motion
- Custom GLSL shader modules
- Clean global CSS with design tokens
- Cloudinary-hosted visual assets

## Local Development

```bash
npm install
npm run dev
```

The development server will print a local URL, usually `http://localhost:5173/`.

## Production Build

```bash
npm run build
npm run preview
```

The production build output is written to:

```text
dist
```

## Cloudflare Pages Deployment

1. Create or push this repository to GitHub as `bmparent/brent-parent-intelligence-studio`.
2. Log into Cloudflare using the Google-created Cloudflare account.
3. Go to Workers & Pages.
4. Select Create Application.
5. Select Pages.
6. Choose Connect to Git.
7. Authorize GitHub if needed.
8. Select the `brent-parent-intelligence-studio` repo.
9. Use these build settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Production branch: main
Root directory: /
```

1. Deploy.
2. Use the generated `*.pages.dev` URL as the public website URL.

## GitHub Search / ChatGPT Index Trigger

After the first commit is pushed, run this GitHub search once to help GitHub index the repository so ChatGPT/Codex connectors can find it more reliably:

```text
repo:bmparent/brent-parent-intelligence-studio import
```

Wait several minutes, then verify the repository appears in GitHub search and in the ChatGPT/Codex GitHub connector. If the repo does not appear automatically, update the ChatGPT / Codex GitHub app permissions for the new repository.

## Cloudinary Assets

The site uses remote Cloudinary URLs for Brent's portrait, storefront concepts, and selected visual references. No secrets, databases, serverless functions, custom domains, or paid services are required.

## Content Surface

The site includes:

- Immersive hero with WebGL signal field
- Capabilities command center
- Builder profile with portrait treatment
- Client-facing services
- Case-study / project-system archive
- Eidos Brain deep dive
- Selected work and visual references
- Pricing modules and starting points
- Process timeline
- Final contact CTA

## Accessibility and Performance

All services, pricing, links, contact information, and Eidos explanations are present in semantic HTML. The Three.js layer is progressive enhancement only.

Performance safeguards include:

- Adaptive pixel ratio
- Lower particle counts on mobile/low-power devices
- Paused rendering when the tab is hidden
- Reduced-motion fallback
- WebGL availability fallback
- Responsive canvas sizing
- Readable contrast and keyboard-accessible links/buttons

## Contact Placeholder

```text
Email: bmparent@outlook.com
Location: Central Florida
```
