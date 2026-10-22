# PHP exposure and dependency security review — October 22, 2026

Brent requested checking Eidos Works after the October 21 PHP disclosure. This
review covers the public site, its Cloudflare Functions, the Works/Sentinel Lab
Node application, Quote Desk and the Wellway gallery demonstration. It does not
certify provider internals, unrelated research applications or Data Graphics.

## Observed baseline

- Site source: `bmparent/brent-parent-intelligence-studio` at
  `a919bb1ce98e95208106c1a7bc9179dd140514d6`.
- Backend source: `bmparent/eidos` at
  `34c3d21509dfa1017705244e0d42a6eb7bc7dff9`.
- Vercel's production alias `eidos-sentinel-lab.vercel.app` points to
  `dpl_8Uu5eVF597W6tqiTSGWoesomjqZy`, with the backend SHA above. Provider
  metadata identifies Next.js and Node 24.x. This identifies that alias, not
  the uninspected Cloudflare relay binding.
- Both complete Git trees contain no PHP source, Composer manifest/lockfile or
  WordPress configuration. Site rendering uses React/Vite; Functions and the
  relay use TypeScript; the Works route explicitly uses the Node.js runtime.
- PHP's official October 21 advisory covers CVE-2026-109618 and
  CVE-2026-109619. No direct PHP2Shell exposure was identified in these
  applications: https://www.php.net/archive/2026.php.

## Findings and correction

| Lockfile | Before: known vulnerable package entries | Candidate after |
| --- | --- | --- |
| Site root | 13: 11 high, 1 moderate, 1 low; production-only scan: 0 | 0 |
| Quote Desk | 6: 5 high, 1 low; development toolchain | 0 |
| Wellway demo | 3: 2 high, 1 low; development toolchain | 0 |
| Works/Sentinel Lab | 4: 1 critical, 3 high | 0 |

These are npm's package-level counts, not independently exploitable paths or
unique CVEs. The critical Next.js `next/og` ImageResponse advisory affects the
baseline dependency version. No application ImageResponse/next/og use was
found. The image optimizer SSRF advisory requires remotePatterns, which are
also absent. The update removes the affected dependency versions regardless:
https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j and
https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4.

The backend moves Next.js from 16.3.4 to 16.3.8 and refreshes sharp, undici and
source-map-js to patched versions. The site/Quote Desk toolchain uses Wrangler
4.151.3; site/Wellway use Vite 8.3.5 and esbuild 0.28.2. Lockfile resolution
removes the remaining advisories without a forced audit upgrade.

Wrangler's bundled Miniflare changes its constructor and removes createFetchMock.
The existing runtime relay test now uses the provided V4 options converter and
a closed outbound service fixture, asserting the exact upstream URL and one
request. It makes no real upstream call. Production relay source is unchanged.

Exact-head CI also found that the community browser job's floating
ubuntu-latest image now selects Ubuntu 26.04, unsupported by its pinned
Playwright 1.58.2. Pin that job to ubuntu-22.04, matching the existing editor,
Quote Desk and Wellway browser jobs. No browser assertion is removed.
Regenerate the checked-in Wellway standalone gallery page with the patched
bundler so its existing source/artifact parity gate continues to pass.

## Verification and remaining boundaries

- All four candidate lockfiles: `npm audit --package-lock-only` returns zero
  known vulnerabilities on October 22. This is a time-bounded registry result,
  not proof that unknown vulnerabilities are absent.
- Site lint; 35 platform, 100 Playground, 14 growth, 7 indexing, 1 analytics and
  6 glass tests; Snapshot checks; production build; indexing/prerender/editorial,
  source and built article validation, URL validation and Functions build pass.
  Article source fetching is skipped because no article content changes.
- Quote Desk and Wellway: their existing tests and builds pass.
- Backend: typecheck, 16 JavaScript and 41 TypeScript tests and production build
  pass, including relay authentication and ownership boundaries.
- The observed production backend health route returns 200 and anonymous access
  to its member route returns 401 with no-store/nosniff headers. No live account,
  payment, email or model call was performed.
- Canonical and stable Pages direct requests from this environment receive
  Cloudflare 403/error 1010. Application authorization and headers on those
  hosts remain unverified by these requests; an edge denial is not an app pass.
  No firewall rule or access protection was weakened.

## Release and rollback

This is an isolated security update based on public main in both repositories;
pending account/Playground/Observatory PRs are not imported. It changes no
application feature flags, production bindings, secrets, accounts, payment
settings, database schemas or retained customer data. Exact candidate SHAs,
CI, deployment and post-release receipts belong on the security PRs. Local
checks alone do not establish deployment.

Use the existing release workflows after exact-head checks pass. Rollback
identities are the baseline SHAs above, although returning to vulnerable
dependencies should be avoided in favor of a forward correction. The existing
held account, payment and private integration acceptance gates remain open.
