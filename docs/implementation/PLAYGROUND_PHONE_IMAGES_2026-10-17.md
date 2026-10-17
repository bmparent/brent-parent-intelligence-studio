# Playground phone-photo import repair — October 17, 2026

## Scope

Narrow candidate based on public main `4b9c3a54708cc9b636316897b60f2ce724b93e53`.
The old shared importer rejected originals above 8 MB or 16 MP before its existing
resize step. Brand logos and all other Playground image entry points now share a
32 MB / 64 MP preflight with a 16,384-pixel side limit. File signatures and raster
headers are inspected before decoding. SVG/HTML are not decoded; HEIC/HEIF has a
clear instruction to export a JPEG/PNG copy.

Resize-at-decode uses EXIF orientation where supported. A fallback full decode is
limited to 20 MP; unsupported large-photo decoding fails with a useful smaller-copy
instruction. No full-resolution canvas is allocated. Decoder-internal memory use remains browser-dependent; physical-device memory acceptance is not claimed. The retained image is at most
1600 pixels per side and 1.5 million data-URL characters, with bounded adaptive
compression/resizing. WebP or PNG preserves transparency and aspect ratio. Object
URLs, bitmaps and canvases are released. Existing project validation, aggregate
16 MB local-authoring limit and cloud-save limits remain unchanged. Failed uploads
leave the previous logo/project intact. Files stay on-device.

## Evidence and release boundary

Local TypeScript, lint (one pre-existing Wellway Fast Refresh warning), client/SSR
build, Functions build, and 37 focused editor/image tests pass. Tests cover
48 MP headers, malformed/truncated input, all three WebP header forms, unsafe
sizes, format guidance, bounded decoder fallback, cleanup, adaptive output,
aggregate limits and export metadata. The three-engine release browser suite now
includes actual Brand UI uploads of a transparent logo and a 24 MP / 9 MiB JPEG
with EXIF rotation and asymmetric color bands, rejected uploads, save/reopen and
independently opened export. Browser execution is restricted locally; exact-head
GitHub Chromium/Firefox/WebKit results are required before promotion. Viewport
emulation does not establish physical iPhone/iPad acceptance.

No database, backend, paid feature, production binding or connected TEST pin is
changed. PR creation runs verification only. Production promotion would use the
existing main Pages release workflow; the separate manual preview target is
`eidosworks-playground-20261014`. Both require the owner's release direction and
exact-source readback. Pending candidate PR111 must receive the verified importer
without changing its backend/frontend TEST pins. Rollback is the base main above.
