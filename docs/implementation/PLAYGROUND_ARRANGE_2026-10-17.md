# Playground arrange controls — October 17, 2026

## Candidate scope

Based on production main `f62d3a8619c6ef3d7afe9c500371dfe253c61e0d`.
The selected-element inspector now leads with an Arrange card: position in its
container, a selectable parent, earlier/later controls and a disclosed destination
picker. Destination choices reset with selection or parent changes, and moving
between sections retains the moved element selection. Selected Layers rows expose
keyboard/touch order controls alongside existing drag handles.

Alignment and spacing presets expose desktop/mobile scope, selected states and
44-pixel action targets. Custom numeric values, responsive layout, existing drag
behavior, validation, document identities and single-edit Undo/Redo remain shared
with the existing editor. No absolute-position schema is added.

## Verification

Local TypeScript, lint (zero errors; pre-existing Wellway Fast Refresh warning),
100 Playground unit tests and client/SSR build pass. The focused arrange tests
cover boundary no-ops, exact order reversal, Undo/Redo and independent mobile
preset changes without losing other overrides. Existing browser suites now open
the destination disclosure explicitly and exercise the top Arrange card by
keyboard, exact Undo/Redo, alignment/spacing presets and retained screenshots at
desktop and narrow widths on Chromium, Firefox and WebKit through release CI.
Local browser launch remains restricted; browser success is not claimed until
exact-head CI passes. Physical-device and unfamiliar-user acceptance are separate.

No backend, paid feature, provider call, TEST pin, workflow deployment or schema
migration changes. This is a review candidate, not a deployment. The existing
production SHA above is the rollback baseline; no stored-data migration is needed.
