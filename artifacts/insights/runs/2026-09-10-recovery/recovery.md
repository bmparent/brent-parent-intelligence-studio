# Insights publishing recovery — September 10, 2026

Monday's Bing article was published and remains on main and the live hub. Wednesday's accessible quote-form guide was held at PR #23 despite successful CI. Cloudflare reports eidosworks has no Git provider; production revision before this repair is c5d2525, deployment 5c362fa8-fab1-4419-b3fe-96efb03d614b.

The three active local schedules retained their Monday 08:00, Wednesday 13:00 and Friday 18:00 America/New_York cadence. Their incorrect Git-triggered-deployment instruction was replaced using the automation tool with explicit CI wait, merge, direct upload and live verification. Saved files were checked: all three contain the replacement, remain active, and have no old deployment instruction.

Resumed the existing article in a fresh worktree from current origin/main. Preserved July residue and both prior scheduled worktrees. The article is dated September 10 to reflect its actual recovery publication day; the original September 9 attempt remains in its original receipts. No additional article was written. Live W3C sources were reread.

The Windows wrapper now invokes npm's JavaScript CLI with Node, avoiding npm.cmd execution. It records process-start errors. Two regression checks passed: all seven gates execute through a CLI path containing spaces; a failing lint gate records exit 7 and stops before build. The regression checks were run locally. The attempted CI-step addition was removed because the current GitHub OAuth credential lacks workflow scope; the existing CI workflow remains unchanged.

An initial local gate was started before dependency installation completed and correctly stopped when eslint was unavailable. That failed report is retained. Installation subsequently completed successfully. Final gate results are recorded in validation.json and the timestamped wrapper report.

Release status: pending CI, merge, direct upload and production verification at time of this pre-release receipt. Completion evidence will be written alongside this file.

Limits: this repairs the publishing instructions and Windows runner; the next unattended scheduled run has not happened yet. Local scheduling still depends on host availability and existing authenticated access. No research engine or customer form behavior changed; no conversion or indexing outcome is claimed. Artifacts are local; no mounted Drive destination was selected for this operational repair.

Additional verifier repair: Monday's original verifier log failed solely on Cloudflare's same-article trailing-slash redirect. The verifier now accepts only the exact article URL or that URL with a trailing slash, while retaining canonical, body, robots, metadata, feed and sitemap checks. Three regression tests passed, including negative redirect destinations. The corrected verifier passed against Monday's live Bing article. See runner-tests.log and monday-verification.log.

All eight release command groups passed, including the seven-command publishing wrapper, platform, Playground, analytics, glass, Snapshot, editorial and Functions checks. Three runner/redirect regression tests also passed. The corrected production verifier passed on Monday's existing article. Exact exits and logs are retained. All eleven existing article records match origin/main; exactly one article is added.


First production release: PR #23 merged to 9f02030d1f2cf03a4bdd98f4c6d312b37583565a. Initial upload failed at the final network request; provider checks confirmed no deployment was created. Retrying the same artifact succeeded as c01a8a64-7ce0-41fe-8f93-5a7be7e7763b. The standard production verifier passed and configuration fingerprint stayed identical.

The additional full-body checker received HTTP 403 with Python's default user agent; the same declared EidosWorksProductionVerifier user agent as the repository verifier resolved it. All article body paragraphs were present. The CTA check exposed an obsolete /#contact target: the live homepage has no contact anchor, while /contact/ returns HTTP 200 with the expected contact heading. A narrow follow-up changes only this new article's CTA to /contact and updates the public verification receipt script. The publishing gate is rerun for that correction.

