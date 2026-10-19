# Playground tutorial integration

This branch adds the accepted tutorial direction to frontend readiness candidate 4505148c71dc06e17c3cc5359fc628d836d20410. Backend candidate f16bd3a94ae8a3a49065baac4c4d7ccfd5da1be7 is unchanged.

Brent accepted the revised moving tutorial for integration on 2026-10-18: “Accept this direction for integration.” Public publication remains gated. Original tutorial PR125 and its original video remain separate and intact.

The tutorial demonstrates starter selection, selection/editing, rearrangement, spacing, mobile preview, Undo, local save, editable JSON backup and frozen local download. The revised scenes add three starter cards, a focus highlight that follows actual illustrated controls, a spacing measure and animated website/source file cards. Action beats are shorter while reading time follows each lesson. The illustrated scene never receives the project, storage or editor operations.

The integration preserves the readiness candidate's synchronous starter focus, preview focus, AI proposal comparison, purchase-return capture, purchase recovery and recovered-review behavior. Playground.tsx gains only the tutorial import and footer launcher. StartScreen retains its useLayoutEffect focus mechanism; its new tour action focuses the starter heading.

Pause/replay, manual steps, offscreen suspension, reduced motion, dialog focus restoration and project/history preservation remain acceptance requirements. The existing walkthrough verifier is included in the local release entry point.

The currently hosted disabled rehearsal still serves frontend 4505148. This branch is a new source candidate; its local or CI results must not be relabeled as hosted acceptance or as the original retained build. New deployment needs a separately identified build and provenance receipt. No AI, account, checkout, email, pricing or production flag is enabled by this change.

Local checks and CI outcomes are recorded in the PR and continuation checkpoint. Firefox/WebKit, physical-phone and provider-backed commerce evidence must be identified separately. No provider transaction or paid inference is part of tutorial validation.
