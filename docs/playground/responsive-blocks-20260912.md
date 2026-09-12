# Responsive blocks: portable local authoring

The explicit **Enable responsive blocks** action creates schema version 4. Opening
versions 1–3 alone does not migrate them. Upgrade retains legacy fields, section IDs,
assets, renderer and glass settings, and intentionally chooses normal responsive flow
for the hero. One Undo restores the exact original document and format.

The hero and reusable content sections support heading, text, image, button, stack,
row and columns nodes. IDs survive moves; recursive duplication assigns fresh IDs.
Other specialized section types remain in their existing format. Header/footer stay
pinned. No page-wide absolute positioning, arbitrary HTML or executable links exist.

Limits: 96 total nodes, 48 per authored section, maximum depth 3 with root at depth 0,
16 MB serialized UTF-8 v4 project, and the existing per-image processing/import limits.
These bound validation, hit-test geometry, export and local storage work. Browser
storage can still fail independently; a quota is not a guarantee of available disk.
Malformed input, excessive depth/count, duplicate IDs, unsafe media/URLs and non-finite
geometry fail validation. No upgrade sends a new format to the legacy cloud endpoint.

Desktop widths are percentages within responsive containers. Image frames have an
explicit height and cover/contain media settings. Frame resizing and photo cropping
are separate operations. Text stays semantic text rather than scaled graphics.
Mobile uses automatic stacking and full width unless an explicit override exists;
image height defaults to at most 360 px. Reset mobile overrides clears mobile geometry
and crop positions without changing desktop geometry. Column split is a desktop
two-child control; ordinary row children share available width.

The logical preview width is independent of sidebar width. Fit scaling is presentation
only; pointer coordinates remain in iframe CSS pixels. Contextual touch controls
compensate for fit scale. Selection has a separate bridge message. Transient gestures
use RAF and cached geometry; only a validated committed command enters project history.
Escape, blur, lost capture, cancellation and incompatible revision/view changes clear
transient styles. The sandbox remains `allow-scripts` without same-origin privileges.
Source, session channel, workspace stamp, revision and command shape are checked.

Form typing and numeric drafts commit on blur. Inline text uses textContent and plain
text paste; Escape discards, Enter commits headings/buttons, and Ctrl/Cmd+Enter commits
paragraphs. Keyboard-accessible Move/earlier/later controls accompany drag handles.

JSON, local reload, preview, Try and ZIP share validation and rendering. ZIP assets
are packaged bytes, not account URLs. Authoring runtime/chrome are excluded. Existing
purchase archives are not regenerated. Cloud support remains explicitly unavailable
for v4 until portable backend parity and hosted two-account acceptance pass.

## Validation commands

From repository root: `npm run typecheck`, `npm run lint`, `npm run test:playground`,
and `npm run build`. The existing `scripts/verify-playground-editor-browser.mjs`
entry point now also runs `verify-playground-blocks.mjs`; it accepts the existing
`PG_BASE_URL`, `PG_EVIDENCE_DIR`, `PG_ENGINES`, `PG_WIDTHS` configuration. Set
`PLAYWRIGHT_MODULE` only when using an existing external installation.

`node scripts/verify-playground-zip-host.mjs <downloaded.zip> <expected-project.json>`
extracts the actual archive to a controlled host and checks three engines, desktop/
mobile and JavaScript enabled/disabled, with no external asset dependency. Evidence
and limitations are tracked in the implementation ledger; a local test does not
establish hosted account, inbox delivery or physical-device acceptance.
