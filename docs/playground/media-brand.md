# Media and brand review change

Adds a Media / Brand entry, visible placement labels (logo, hero/work images, section backgrounds), thumbnails, file picker and drop target, processing/error status, non-destructive fit/crop/focal controls, inherited mobile focal overrides, overlay tint, alternative text/decorative classification, and a brand kit. Logo palette sampling is local canvas work with no AI call. Locks protect brand suggestions and the future AI operation layer; manual controls outside this panel retain explicit editing behavior.

Schema 1 is backward compatible: media and brand fields are optional, old documents validate without added defaults, and renderer IDs and the approved glass preset are preserved. New processed images carry a content hash and original filename. Exports include embedded or packaged image bytes, with no expiring URLs. Removing an image changes only the current document; no historical asset is deleted.

Account image limits are separate: 2,000,000 serialized UTF-8 document bytes, 1,800,000 aggregate image data-URL characters per page, 1,350,000 decoded bytes per new asset, 16 million decoded pixels and 12,000 pixels per side, and 40,000,000 stored data-URL bytes per owner. A SQLite trigger enforces the owner cap inside the save transaction; quota failure preserves the old head. Existing stored assets remain readable and are not retroactively decoded. New account assets require the backend's Sharp decoder; a missing decoder fails closed while local editing/export stays available. Local input remains 8,000,000 bytes and is resized to 1600px. Full-resolution original files are not retained: source identity refers to the processed export bytes.

Migration 0004 is additive and contains one CREATE TRIGGER statement, so the migration runner submits that statement intact. No storage provider, database, shop setting, email service, or research engine changes.

Validation: existing Playground tests plus media round-trip/export and quota/decoder-unavailable cases pass. Backend tests exercise actual raster decoding for transparent PNG, mismatched MIME, truncated bytes and excessive pixel counts. Browser results and ZIP hashes are saved outside source at SystemDiagnostics/playground-20260910/media-browser.json. Cross-browser ZIP hashes may differ because browsers encode WebP differently; this is not a frozen paid-delivery comparison.

Larger owner-scoped direct uploads are deferred: the current embedded path remains bounded and backwards compatible. Independent gallery-card imagery belongs to the following structure change. Physical iPhone photo-library behavior, orientation, Safari share/download, CMS installation and real authenticated account saves remain separately unverified.

Decoder reference: https://sharp.pixelplumbing.com/api-constructor/ (failOn warning, limitInputPixels) and https://sharp.pixelplumbing.com/api-output/ (full raw decoding). Decoder version: Sharp 0.35.4, already installed transitively and now declared directly by Sentinel.

## Verification receipt - September 10

Local PASS: 15 Playground tests; frontend build, lint and Functions build; backend lint, 49 tests and Next build. Browser fixture identity: anonymous local Fixture Studio. Chromium, Firefox and WebKit at 1440 and 390 pixels passed upload, fit, zoom, decorative image, brand edit, autosave/reload and actual ZIP download. Receipts and screenshots: `C:/Users/bmpar/SystemDiagnostics/playground-20260910/media-browser.json`. These use local data, not authenticated production member flows. Chromium/WebKit ZIP SHA-256: `058e14dbd725f196208baf7387c3367a9f14afc32d4b6d5cd297688f5124a85d`; Firefox: `e558e35c7ae034781270950edc2248377e070905fdbf6634db27af774914cc0b`. Different browser WebP encoders produce different bytes. These hashes do not establish paid immutable delivery.

Production NOT RUN: no release authorized. Authenticated cross-device flow BLOCKED on dedicated member sign-in. Physical iPhone and authorized CMS tests NOT RUN.
