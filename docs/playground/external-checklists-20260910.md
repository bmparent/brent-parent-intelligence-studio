# Physical iPhone and InkSoft acceptance checks

These gates are **NOT RUN** until the actual device/store is used. Desktop WebKit and standalone export hosts are separate evidence.

## Physical iPhone Safari

Use `https://eidos-pg-preview-20260910.pages.dev/` after preview account configuration is complete. Record iPhone model, iOS version, date and a screenshot or short screen recording.

1. Open the site menu, tap Playground, close/reopen the menu and dismiss it with an outside touch. Scroll from the top through the glass transition; confirm links remain tappable.
2. Create/sign in to a preview account. Create a project; upload a portrait and landscape photo from Photos. Confirm orientation, alt/decorative choice, crop/focal adjustment, brand color and a reordered section; save.
3. Rotate portrait ↔ landscape, collapse/expand Safari's address bar and scroll/tap the editor. Enable iOS Reduce Motion, reload and confirm useful navigation and editing remain available.
4. Sign out, sign back in and reopen the same project. Check the saved photo/crop/brand/section order. Download the free ZIP; confirm it opens in Files and can be shared. Record any failure exactly.

Current environment: no connected iPhone was returned by the targeted Windows device inventory; no physical Safari/device-control tool is exposed. No device pass is claimed.

## Authorized InkSoft demo/test store

Use only Brent's identified demo/test store. Its URL is pending. Keep the original demo page available for rollback; do not install into a customer store.

1. On a new disposable demo page, upload the exported assets to its supported asset host. Install the standalone page through an allowed full-page mechanism; use `header.html` only in an appropriate header/component slot. A complete exported HTML document is not a pasteable content-field embed.
2. Save/reopen the editor and inspect the published page on desktop/mobile. Confirm assets and navigation load, scripts survive sanitization, and CSP failures leave useful solid navigation. Record console/network errors and any removed markup.
3. Test the header beside product controls/cart and the InkSoft admin/editor UI: no blocked clicks, hidden controls, global CSS changes, overflow or broken sticky behavior. Confirm anchors, mobile menu, Escape and outside-touch dismissal where supported.
4. Test reduced motion and a browser without the enhanced glass effect. Record store/page URLs, supported insertion method, screenshots and exact limitations. Mark PASS only for the tested method and environment.

No InkSoft compatibility claim follows from the controlled standalone page/Shadow DOM host checks.
