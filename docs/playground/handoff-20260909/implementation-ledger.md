# Playground implementation ledger — September 9, 2026

Four review units: (1) workspace identity and external verification support, (2) media and branding, (3) structural customization, (4) optional bounded AI. Each is intended for a separate review branch. No production promotion or public AI spending is authorized.

## Baseline

Frontend source and production: c5d2525feb006a07a7ac00e19d2d8c574e220b5c. Cloudflare eidosworks, production deployment 5c362fa8-fab1-4419-b3fe-96efb03d614b, direct upload, domains eidos-works.com and eidosworks.pages.dev. Existing preview and production relay bindings are present; no databases or buckets are bound to Pages.

Backend source and production: a2da5fd9af21c02573e538fd30aaf7d5c690e457. Existing Vercel eidos-sentinel-lab, production deployment dpl_8ztuTFv3h34YFuBSjHS31F8Q13aV. Shared handlers originate in the frontend repository and are exported with scripts/export-sentinel-platform.mjs.

The original editorial checkout has unrelated modifications and was left untouched. Backend source checkout also has unrelated changes. Work uses isolated worktrees.

## Reliability semantics

Every workspace history frame contains document identity, content, and its account target. Undo/Redo restores all three. Ordinary edits keep the target. Template changes, JSON imports and variation restores introduce a detached identity. Local reload opens detached: reselect an account project before appending to its history. This avoids persisting an account attachment into a later user's browser session.

Save acknowledges the exact document ID captured before the request, including matching history frames. A late response cannot attach the current unrelated document. Import, upload, cloud-open and revision-restore results are guarded against intervening workspace actions, including switching to another document with the same template. Guard rejection preserves current content and permits retry.

Revision browsing is a read-only text preview. Explicit local restore creates a workspace history entry; explicit Save creates a new immutable server revision. It does not change the stored head on preview/restore alone.

Client preflight and backend validation share a 2,000,000-byte UTF-8 serialized document limit before media extraction. The editor reports current bytes and preserves larger local designs and free exports. The HTTP envelope retains its separate 2,020,000-byte bound. Local image input and processed-image limits remain distinct.

## Larger asset path assessment

Current libSQL storage deduplicates embedded images by owner and content hash; historical revisions reference those immutable bytes. Do not delete asset rows when removing an image from a page. A future upload endpoint can use the same store without a storage-provider migration, but must add atomic owner/project byte quotas, reference ownership validation and a real server image decoder. Header signatures alone do not prove full image decoding. This change does not claim those additional gates passed and does not raise document limits.

## External gates

Normal member sign-in requires two dedicated inboxes and completion of the legitimate human challenge/email flow. No production sessions are minted or database authentication rows edited. Physical iPhone Safari and actual InkSoft/CMS integrations require the corresponding authorized device/environment. AI provider evaluation has no authorized monetary budget: no provider call is allowed yet.

Local mocked Stripe tests are distinct from provider-generated checkout events and durable remote delivery. No real sales price has been approved. Existing shop settings must remain unchanged.

## Evidence location

Local browser scripts, screenshots and machine-readable rows are outside committed source: C:/Users/bmpar/SystemDiagnostics/playground-20260909. They use synthetic local documents and intercepted API responses, never production credentials. Build/test results and final preview references will be reconciled before delivery.
