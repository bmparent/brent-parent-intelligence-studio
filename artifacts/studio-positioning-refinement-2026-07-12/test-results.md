# Studio Positioning Refinement - Test Results

Date: 2026-07-12

## Automated validation

| Check | Result | Receipt |
|---|---|---|
| TypeScript | Passed | `npm run typecheck` |
| ESLint | Passed | `npm run lint` |
| Production client build | Passed | Vite: 38 modules, app JS 169.35 kB, CSS 63.81 kB |
| SSR build and prerender | Passed | 213.39 kB SSR bundle; all declared public routes prerendered |
| Prerender contract | Passed | One H1, safe metadata, valid JSON-LD, image alternatives, private-page directives, and Cloudflare-safe mail links |
| Editorial contract | Passed | 15 routes; homepage density 7 sections, 6 H2, 13 H3, 9 articles, 2 buttons, 31 links, 8 images |
| URL policy | Passed | 13 public source files checked against 18 required and 8 forbidden references |
| Insights distribution | Passed | 10 published articles |
| Snapshot smoke | Passed | Request validation and Stripe signature checks |
| Google Drive command center check | Passed | 12 folders, 11 Docs, 4 workbooks, 29 tabs |

## Browser and production QA

- Responsive layouts checked at 360, 390, 430, 768, 1024, and 1440 pixels.
- Production route audit covered 16 public routes. Each had exactly one H1, no missing image alt attributes, no broken images, no empty links/buttons, and no horizontal overflow.
- Homepage portrait absence verified; About retains exactly one founder portrait.
- Services verified with three matched, loaded images.
- Mobile menu verified: focus enters the menu, Escape closes it, and focus returns to the Menu button.
- Contact form required-field behavior and the safe email fallback were verified.
- Focus-visible outline, reduced-motion behavior, and minimum touch targets were verified.
- Contrast samples: body/H1 15.81:1, lede 11.63:1, primary button 6.68:1.
- All required production routes returned HTTP 200.
- Final clean production browser pass reported zero warnings and zero errors.

## Issue found and resolved during release QA

Cloudflare Email Address Obfuscation rewrote server-rendered `mailto:` anchors before React hydrated them, producing React error 418 on production only. The fix keeps server and first-client markup identical, then activates email links after hydration. A prerender regression check now rejects literal server-rendered mail addresses in `mailto:` hrefs. The prerenderer was also made safe to rerun without copying the homepage into every output route.

Final production verification confirmed:

- no `/cdn-cgi/l/email-protection` rewrite,
- no Cloudflare email decoder injection,
- working post-hydration `mailto:projects%40eidos-works.com`, and
- zero browser console warnings or errors.

## Known limits

- Visual QA covers the public website and its current production content; it does not prove future third-party asset availability.
- The classroom concept asset remains ownership-associated in the media registry but is not proven as live client work, so it is excluded from the finished case narrative.
- No new professional founder photograph was available; the approved illustration remains About-only.
