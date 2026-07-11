# Eidos Works Editorial Redesign — Implementation Report

Date: 2026-07-11

## Executive summary

The Studio Ledger direction is implemented in the correct Eidos Works repository on `agent/eidos-editorial-redesign`. The redesign replaces the production site's dense, generalized portfolio presentation with a founder-led editorial system centered on three real work examples, three service families, a short four-step process, a separate Insights publication, and a low-friction contact path.

Deployment status: implementation and local preview verification passed. Cloudflare preview and production deployment remain pending authenticated account access and must not be described as live until the production domain is checked.

## Repository and deployment receipts

- Repository: `https://github.com/bmparent/brent-parent-intelligence-studio.git`
- Source commit preserved: `eb695212172d2b2b24efc74bb130cbfae5045893`
- Branch: `agent/eidos-editorial-redesign`
- Redesign implementation commit: `9c4284e012c5e1f65409cdebb1e34122f95313fd`
- Cloudflare Pages project indicated by repository documentation: `eidosworks`; live account verification pending
- Preview URL: pending authenticated Wrangler deployment
- Production URL: `https://eidos-works.com` (not yet verified with this redesign)
- Production deployment ID: pending
- Known mismatch: the live domain was serving a denser older build while `origin/main` contained the newer PERNR work.
- Google Drive archive: `G:\My Drive\Eidos_Works\editorial-redesign-2026-07-11` (46 files, 13,168,804 bytes copied)

## Information architecture

Before, the live homepage behaved like a broad catalog with diagnostics, many capability categories, Eidos Brain promotion, a media explorer, pricing, and a long intake path competing for attention.

After, the primary navigation is Work, Services, About, Insights, and Contact, with Start a Project as the single utility CTA. Snapshot remains a secondary route, Agentic SEO is a service route, and Eidos Brain is located under `/lab/eidos-brain`.

## Homepage and case studies

- Seven concise homepage sections replace the approximately 42-section production page.
- Three primary cases dominate the work rail: PERNR access gate, production reporting dashboard, and storefront transformation.
- Three service families replace ten capability categories.
- The six-step intake pattern is replaced by a straightforward contact form and email fallback.
- PERNR retains the fictional interactive demo and now explains normalization, Apps Script, the controlled Google Sheet roster, the browser allow/deny boundary, limitations, and evidence.
- Disney-adjacent work is disclosed as part of Data Graphics' client-services workflow; no direct Disney engagement or sole-creator claim is made.

## Visual system and copy

- Warm ivory paper, near-black ink, restrained teal rules, Newsreader display type, and modest radii replace glass, gradient, pill, and abstract-diagram styling.
- The homepage uses no gradient backgrounds and no backdrop blur at runtime.
- Copy names concrete outputs, operational contexts, and Brent's role instead of presenting Eidos Works as a generic full-service agency.
- Real project evidence and a safely recreated PERNR state replace decorative visualizations and synthetic dashboards.

## Accessibility and responsive results

- Verified semantic landmarks, one H1 per checked public route, logical headings, skip navigation, labels, alt text, focus visibility, menu keyboard use, Escape close/focus return, touch targets, and form status messaging.
- Verified 360, 390, 430, 768, 1024, and 1440 widths with no horizontal scrolling or clipped content.
- This evidence does not claim complete WCAG 2.2 AA certification.

## Performance and build results

- HTML shell: 2.89 kB raw / 0.98 kB gzip.
- CSS: 61.53 kB raw / 12.50 kB gzip.
- Application JS: 166.04 kB raw / 44.62 kB gzip.
- React vendor JS: 190.21 kB raw / 59.82 kB gzip.
- No Babylon.js homepage chunk.
- Below-fold case media is lazy-loaded and image dimensions/aspect ratios are explicit.
- LCP, INP, and CLS were not measured with Lighthouse in this environment and remain unclaimed.

## SEO and content integrity

- Canonical, Open Graph, Twitter, JSON-LD, sitemap, feed, `llms.txt`, and hard-coded production references now use `https://eidos-works.com`.
- Fifteen public routes pass prerender and editorial verification with unique metadata and one H1.
- Private Snapshot results remain excluded and marked with private-page directives.
- Insights remains a separate, source-linked publication with visible authorship, publication/update dates, and ten validated articles.

## Verification evidence

- Full command receipt: `test-results.md`
- Design QA verdict: `../../design-qa.md`
- Selected direction: `selected-option-3.png`
- Exact source/implementation comparison: `qa/source-vs-home-final.png`
- Desktop screenshot: `qa/home-desktop-1536x1024-final.png`
- Mobile screenshot: `qa/home-mobile-390-final-verified.png`
- Case rail: `qa/home-case-rail-verified.png`
- PERNR states: `qa/pernr-mobile-approved.png`, `qa/pernr-mobile-denied.png`
- Contact fallback: `qa/contact-mobile-fallback.png`
- Route screenshots: `qa/routes/`

## Proof Logic + Meaning Layer

### Goal reached

The customer-facing implementation goal is reached locally: visitors can identify what Eidos Works is, who Brent is, what he builds, which operational contexts he understands, and how to start a project without navigating a catalogue of equally weighted experiments.

### Specific logic

Prioritization reduced competing signals: three cases and three service families carry the main proof. A five-link information architecture separates portfolio, services, biography, publication, and contact. Case-study evidence and precise role disclosures replace generalized claims. Editorial type, flat surfaces, real imagery, and a restricted palette reduce decorative noise and make hierarchy do the explanatory work.

### Improvement over the previous state

- Sections: approximately 42 to 7.
- H3 headings: 88 to 13.
- Article-like elements: 88 to 9.
- Buttons: 69 to 2.
- Links: 67 to 31.
- Images: 32 to 6.
- Capability families: 10 to 3.
- Primary homepage cases: 7 similar cards to 3 prioritized cases.
- Runtime gradients: many in the old visual language to 0 on the new homepage.
- Runtime backdrop blur: present in the old glass language to 0 on the new homepage.

### Philosophical meaning

The redesign treats technology as an instrument for understanding work. It presents evidence, constraints, authorship, and limits before spectacle. The site's visual restraint mirrors the studio's practical promise: make complicated operations easier for a person to see and use.

### Proximity to the ultimate goal

The new site is better positioned to earn trust, demonstrate Brent's real work, support useful long-form publishing, and generate qualified project conversations. It gives Eidos Works a credible long-term public identity without making proof-stage research or AI language carry the business.

### Remaining uncertainty

- Cloudflare account state, project/repository connection, preview deployment, and production deployment are not yet verified.
- The production domain has not yet been shown to serve the redesign commit.
- Lighthouse performance targets and complete WCAG conformance are not claimed.
