# Wellway local demo and gallery handoff

The app is implemented in `apps/wellway`, using React, TypeScript, and Vite like Eidos Works. Its standalone output is staged at `public/demos/wellway/index.html`; it uses hash navigation, embedded fonts, the original Wellway vector logo, and browser-local state. It adds no dependency to the main Eidos runtime and needs no backend to demonstrate the member/advisor workflows.

## Review locally

Download `public/demos/wellway/index.html` and open it in a browser, or follow the app README to run Vite on loopback. The repository's usual development server can also serve `/demos/wellway/index.html`.

From the repository root, refresh the staged file after changing source:

```sh
npm --prefix apps/wellway ci
node scripts/update-wellway-demo.mjs
npm --prefix apps/wellway test
npm --prefix apps/wellway run test:ui
npm --prefix apps/wellway run test:server
```

The static file is intentionally committed for the existing Eidos build to copy. Do not copy the optional loopback server, credentials, or member backups into `public/`.

## Gallery record prepared; visual acceptance pending

`docs/gallery-drafts/wellway-journey.json` contains the exact record for the gallery. It is deliberately outside the live gallery data because `docs/site-gallery.md` requires a genuine homepage screenshot. The session's browser blocked the local URL and local-file navigation, so real-browser layout and interaction acceptance could not be completed. A generated design concept or non-browser layout proof is not being substituted for a screenshot.

Before promoting the record:

1. Complete the desktop, mobile, keyboard, and workflow checks in `apps/wellway/docs/VALIDATION.md`.
2. Capture the actual Today screen with the initial fictional dataset. Save `public/images/site-gallery/wellway-journey.webp` within 1440×1100 and `wellway-journey-thumb.webp` within 640×480.
3. Prepend the prepared record to `src/data/siteGallery.json` and verify filtering, Preview dismissal, and the Open app link.
4. Follow the existing Eidos release checks when a public release is requested. This change does not deploy anything.

## What this demonstrates

- Original Wellway logo, observed navy/slate palette, Spectral headings, and Inter UI text.
- A member journey from check-in to chart evidence to a manageable plan action.
- Missing data, units, coverage, and source provenance that remain visible.
- Sample service and CSV import paths using one validation/deduplication boundary.
- Editable local advisor drafts with explicit approval before updating the member plan.
- Guided explanations that are clearly labeled as local. An optional OpenAI agent adapter is implemented separately, unconfigured, and not live-tested.
- Manual JSON backup/restore for transferring files through Google Drive. No Drive API credential, private project-folder link, or automatic cloud sync is embedded in the public bundle.

All member records are fictional, and the perspective switch is not authentication. This is a concept by Eidos Works, not Wellway's operational service. Provider connections, account isolation, clinical storage, and production model evaluation remain future work.
