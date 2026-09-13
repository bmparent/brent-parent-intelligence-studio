# Wellway gallery release

The source lives in `apps/wellway/`; `scripts/update-wellway-demo.mjs` rebuilds the standalone artifact at `public/demos/wellway/index.html`. The public destination is `/demos/wellway/`, with a canonical URL and meaningful no-script content.

Wellway is the first Tools record in `src/data/siteGallery.json`. Full and thumbnail WebP assets use a genuine initial-state Chromium capture at 1440×1100 and a contained 640×480 thumbnail. No generated interface artwork substitutes for screenshots. The original fictional portraits remain part of the actual app.

The app retains local check-ins, charts, plan editing, imports, backup/restore and separate advisor approval. It adds Eidos glass, inspectable dated evidence, recoverable draft workflows and a bounded server-side AI integration. Member screens distinguish guided answers, model responses and simulated visits. No real advisor, device media, provider connection, account isolation or clinical monitoring is claimed.

## Rebuild and release

Use the commands in [the app README](../apps/wellway/README.md) and [the site release procedure](site-gallery.md). Build from merged main and deploy the complete `eidosworks` Pages project, including all existing Functions. Preserve mailer, backend relay, payment and authentication settings.

The private AI Worker has its own [owner configuration](../ops/wellway-ai/README.md). It defaults off. Source integration and mocked runtime verification do not establish a live OpenAI result. The release report records any remaining owner authorization and actual live tests separately.

See [validation and limits](../apps/wellway/docs/VALIDATION.md) for browser coverage, recovery provenance, test results and hardware/provider limitations. Release evidence is maintained outside the source tree; no credentials or member backups are published.
