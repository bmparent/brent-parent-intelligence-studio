# Homepage services and selected work — 2026-10-01

## Candidate

Branch `codex/home-services-selected-work-20261001` began on `7f03936` and was rebased onto `435be02b30f1d983e19b9e915c665ebc38a56668` when #81's storefront-gallery refresh merged. The first exact-head CI passed on `d59763e`. While it ran, #83 merged as current main `8aec88943075c737dc5469c698819c61cc94a360`. This candidate incorporates that main revision, retaining all service build stories and both appended acceptance records. Only the shared acceptance-document append required resolution. No held #73/#67 runtime ancestry is introduced. The PR records the final candidate SHA, source tree and repeated combined-source verification.

## Customer-visible change

An illustrated services section now precedes Selected work. Six cards explain websites/UX/CMS, commerce/bookings/memberships/payment integrations, apps/portals/reporting, API/CRM/email/calendar automation, AI assistants/agents/knowledge search, and SEO/AI-search readiness/analytics/accessibility/performance. The closing invitation includes hosting setup, migrations and ongoing care, with existing Contact and Friction Review destinations. The three established service families remain linked. This replaces the former services summary below the project grid.

The selected projects are explicitly ordered: Jingle Bell, Jingle BAM!, Wellway, Holidays in Hollywood, Nighttime Spectaculars. Wellway is also available in the portfolio's Systems filter. Its existing public capture is fitted without cropping; its fictional-demo label is visible. Storefront attribution and public-recreation context remain visible. All imagery is reused from the accepted public portfolio. Icons are original inline SVG; there are no added dependencies or provider calls.

The local preview adapter serves the existing standalone Wellway directory index instead of Vite's studio fallback. Its production app, generated bundle, API handlers and provider configuration are unchanged.

## Evidence

| Check | Observation |
| --- | --- |
| Local source | Lint has zero errors and the existing Wellway fast-refresh advisory; TypeScript, client/SSR production build, prerender, editorial (34 routes), URL and 17 source/built article checks pass. |
| Desktop | Supervised Chromium, 1363 × 936: six cards and original icons render; the services section immediately precedes the four correctly ordered projects. Every selected-project image is loaded. The Wellway capture uses `object-fit: contain`. Section screenshots were reviewed. |
| Responsive | Actual homepage in a 390 × 844 iframe: document and scroll widths both 375 pixels, with one 335-pixel card/project column. Headings, metadata and CTA wrap; no horizontal overflow. The phone-width CTA opens Contact. |
| Navigation/focus | AI service link activates with Enter and opens Intelligent Systems; Tab shows a visible outline. Start a project opens Contact at desktop and phone widths. All six card URLs retain the existing three service destinations. |
| Wellway destination | Existing public HTTPS demo loads; My journey changes to the progress view at `/demos/wellway/#journey`. No hosted AI request, new record or inquiry submission was made. |
| Console/overlay | No new homepage application errors or framework overlay observed. Browser-extension metadata errors are separate from site code. |

## Limits and release boundary

Responsive iframe evidence is not a physical-phone or touch test. Reduced-motion and forced-colors rules are present; OS preference, assistive-technology and physical-device acceptance are not claimed. The existing Wellway app requires secure-context `crypto.randomUUID`, so its full runtime cannot run on the internal HTTP preview; the unchanged public HTTPS demo was checked instead. No additional Wellway acceptance is implied.

The temporary responsive harness and build-generated timestamp changes are excluded from source and build output. Production promotion and exact-head CI are recorded separately in the PR. Existing account, payment, owner-console, inbox, research and paid-provider acceptance gates retain their prior status. Public-source rollback target is `8aec889`.
