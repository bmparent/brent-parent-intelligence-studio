# Paid-template platform research

Checked October 10, 2026 against first-party documentation. Documentation establishes a supported route, not successful Eidos installation. Actual receipts belong in `platform-install-evidence.json`. No accounts, subscriptions, production prices, or live sales were changed by this research.

## WordPress

Official latest release is **7.1.3** (October 6, 2026). Recommended host: PHP 8.3+, MariaDB 10.11+ or MySQL 8.0+, HTTPS. Initial intended acceptance is an observed clean WordPress/PHP version; do not turn an intended version into a tested claim.

- Release: https://wordpress.org/news/2026/10/wordpress-7-1-3-maintenance-and-security-release/
- Host requirements: https://wordpress.org/about/requirements/
- Block themes: https://wordpress.org/documentation/article/block-themes/
- Required block-theme files: `style.css` and `templates/index.html`; `theme.json`, patterns, template parts, and native blocks provide the editable foundation: https://developer.wordpress.org/themes/core-concepts/theme-structure/
- Site Editor: https://wordpress.org/documentation/article/site-editor/
- ZIP upload/activation: https://wordpress.org/documentation/article/work-with-themes/
- WordPress.com's guide, reviewed October 5, permits third-party uploads on **Personal, Premium, Business, Commerce**; Free requires upgrade. This is not the old Business-only rule. Actual plan activation/upload still needs testing: https://wordpress.com/support/themes/uploading-setting-up-custom-themes/
- WordPress is GPLv2-or-later and considers derivative themes GPL; paid support/access terms must preserve dependency rights: https://wordpress.org/about/license/

Local PATH inspection found no PHP, Docker, WP-CLI, MySQL, or MariaDB. Common PHP/XAMPP/Laragon/Docker/Local installation directories also were absent. Node 24.14.0 is available. A pinned `@wp-playground/cli@3.1.57` was installed outside repository dependencies. Its npm dependencies declare Node >=24.18.0 and npm >=11.16.0, higher than this host's Node24.14/npm11.9; record runtime outcome and the engine warning honestly. The official CLI documentation's stated Node >=20.18 minimum currently differs from package metadata.

Playground is a PHP WASM/SQLite test environment, not proof of native PHP/MySQL hosting or WordPress.com. Use explicit versions and read `$wp_version`/`PHP_VERSION` for exact runtime receipts. The browser Query API selects a major WP line's latest patch, rather than arbitrary old patch releases. Windows CLI mounts should use `--mount-dir <host> <virtual>` to avoid drive-colon parsing.

- CLI: https://developer.wordpress.org/playground/developers/local-development/wp-playground-cli/
- Version selection: https://wordpress.github.io/wordpress-playground/start-using/
- First-party source: https://github.com/WordPress/wordpress-playground

## Squarespace 7.1

The version is shown at the bottom of Pages. Version 7.1 shares a common feature/style system; it has no separately switchable template. The pilot is a manual existing-site native-section recipe with separately labeled optional code, not ZIP import or automatic theme replacement.

- Version/7.1 behavior: https://support.squarespace.com/hc/en-us/articles/115005308187-Find-your-site-s-version-and-template
- All current plans support HTML/Markdown/CSS code blocks and Custom CSS; JavaScript/iframes and code injection require **Core, Plus, Advanced, or qualifying legacy plans**. Basic uses the static fallback. Server-side PHP/SQL is unsupported and Developer Platform is 7.0 only: https://support.squarespace.com/hc/en-us/articles/205815928-Add-custom-code-to-your-site
- Code-block mode/support: https://support.squarespace.com/hc/en-us/articles/206543167-Add-custom-code-to-a-page-with-code-blocks
- Injection does not support checkout-page custom code: https://support.squarespace.com/hc/en-us/articles/205815908-Customize-parts-of-your-site-with-code-injection

A future full-site starter workflow can duplicate a prepared site into a new trial, invite the buyer, then have the current owner transfer ownership after invitation acceptance. Every duplicate needs its own plan. Selling settings, authenticated integrations, orders, permissions, and several asset types do not duplicate. Sites over 150 pages cannot duplicate. Reconnect payments, tax, shipping, discounts, storage, domains, and integrations as applicable; verify billing and remove unwanted old-owner access after transfer. No fulfillment duration is promised before measuring actual work.

- Duplication: https://support.squarespace.com/hc/en-us/articles/360039396131-Duplicating-a-site
- Ownership: https://support.squarespace.com/hc/en-us/articles/206537197-Change-the-site-owner

No authorized Squarespace editor, actual plan, published test page, or connected form inbox has been supplied. The pilot remains unavailable for purchase.

## GoDaddy Websites + Marketing

GoDaddy-hosted WordPress and Websites + Marketing are different targets. Websites + Marketing's documented route is Add Section → HTML → Custom Code. It accepts HTML/CSS/JavaScript, but this does not create native editable builder fields or a native theme.

The HTML section is an iframe: responsiveness must be verified within the embed. Forced Height can be blank for auto height or set in pixels; zero removes the section. For content changing height, choose sufficient measured height; use HTTPS and ordinary new-tab links. Keep native navigation, contact/booking/payment functionality outside the embed and verify coexistence. GoDaddy excludes third-party code troubleshooting.

- Install: https://www.godaddy.com/help/add-html-or-custom-code-to-my-site-27252
- Iframe/height/link limits: https://www.godaddy.com/help/troubleshoot-html-or-custom-code-not-displaying-properly-28025

The supplied local iframe harness tests a candidate pattern only. No authorized Websites + Marketing editor or published test site has been supplied. The pilot remains unavailable for purchase.

## Stripe fulfillment

Webhooks are required; success redirects alone cannot prove payment or ensure fulfillment. Retrieve Checkout Session and line items server-side, verify payment status, perform fulfillment once despite concurrent retries, and record state. Handle completed and applicable async succeeded/failed events separately. Verify exact raw request bytes against `Stripe-Signature` with the endpoint's own secret; CLI and Dashboard secrets differ. Provider TEST receipts and local simulated webhooks must remain distinct.

- Fulfillment: https://docs.stripe.com/checkout/fulfillment.md?payment-ui=stripe-hosted
- Signature verification: https://docs.stripe.com/events/manage-webhook-endpoints#signature-errors

## Comparable first-party demos and original differences

These observations concern the demos' actual content/navigation. They are not copied implementations, performance claims, or originality guarantees. No demo photo, font, brand, testimonial, code, or artwork is included in Eidos packages.

| Eidos family | First-party comparable opened | Observed pattern | Deliberate Eidos difference |
| --- | --- | --- | --- |
| Switchboard | https://sackett-demo.squarespace.com/ | Craft narrative and consultation path | Problem-first inquiry navigation with visible process and no invented diagnosis/estimate |
| Tideglass | https://barbosa-demo.squarespace.com/ | Hotel introduction, gallery, amenities, repeated booking links | Keyboard/touch time-of-day scene exploration tied to stays, with persistent ordinary contact path |
| Matter | https://pazari-demo.squarespace.com/ | Sparse category-based image portfolio | Material/process exploration beside specifications and ordinary detail links |
| Nightjar | https://carmine-demo.squarespace.com/ | Conference dates/location, speakers, ticket CTA | Layered poster program/day-night treatment, every event reachable by ordinary links |

The two builder pilots intentionally adapt Switchboard's existing system tokens (`#14302b`, `#f6f6ee`, `#d8f35f`, `#dce9e2`) rather than creating a separate design family. Native platform publication, mobile behavior, and working connected actions remain their outstanding acceptance gates.

## Recorded acceptance outcome

The local pilot browser receipt passed five checks in Chromium 145.0.7632.6 at 1280×900 and 390×844, including keyboard interaction, iframe containment, reduced-motion context, and JavaScript-disabled fallbacks. This is local Chromium emulation, not a physical phone or a Squarespace/GoDaddy hosted test. Contact links remain explicit example.com placeholders. Screenshots and source hashes are in `artifacts/templates/platform-pilots/browser-receipt.json`.

The **local CLI** clean WordPress attempt was blocked before activation. Pinned Playground 3.1.57 downloaded the official WordPress 7.1.3 release, but its local endpoint never became ready. Attempts included host Node24.14 and temporary Node24.18.0, explicit experimental WASM JSPI, and six workers. The latest temporary WordPress directory contained zero files. No running WordPress/PHP version, theme installation, visual edit, publish, or main-action pass is asserted. The runner now has a bounded 180-second startup timeout and stops shared-failure retries. See `artifacts/templates/wordpress-install/installation-receipt.json` and `startup-diagnostic.json`.

A subsequent clean retry placed new TEMP/TMP scratch on the mounted E: drive, using the same pinned tooling and Node24.18.0. It also failed to become ready at 180,240 ms and exited with code1 before installation. That evidence is in `artifacts/templates/wordpress-install-external/installation-receipt.json`. The stall therefore remains unresolved; low C: space alone is not an established cause.

Temporary tooling consumed about 774 MB and abandoned task-created site scratch about 389 MB. C free space was 85,504,000 bytes at the last measurement, so further runtime attempts stopped. Automatic approval review rejected removal of two exact abandoned task-created temporary sites as "blocked by policy". No cleanup occurred and no alternate deletion was attempted. The buyer archives and receipts remain preserved.

The supplied buyer-friendly pilot guides are `products/platform-pilots/switchboard-squarespace-7.1/README.md` with `native-section-recipe.md`, and `products/platform-pilots/switchboard-godaddy/README.md`. Neither pilot is available for purchase. The matrix in `platform-install-evidence.json` separates local pilot passes, the blocked local CLI, the later bounded native browser acceptance, and outstanding hosted gates.


## Official browser WordPress acceptance

After the bounded CLI failure, the first-party browser Playground booted successfully. Its native Site Health UI reported **WordPress 7.1.2, PHP 8.3.33, PHP.wasm, Emscripten 4.0.19 wasm32**. The official browser bundle identifier was `63df6816ce0d40bce164631d45fa7b80f271648c`; it is distinct from the pinned local CLI. WordPress 7.1.3 was offered as an update but was not the running tested version. The browser sandbox uses SQLite/WASM; this is not native PHP/MySQL or WordPress.com hosting proof.

The exact four final buyer ZIP hashes in `artifacts/templates/wordpress-browser/installation-receipt.json` were uploaded, installed, and activated using the native admin UI. Business headings and an original generated image fixture were edited in native Site Editor, saved, and checked on the frontend. The supplied optional WXR files created page records through the official importer, mapped to the sandbox admin with no attachment download. Static Home was selected in Reading. All five page templates were reached through native header links, native Details were exercised by keyboard, and primary links reached their intended section followed by the contact page. Contact is an explicit `mailto:hello@example.com` demo placeholder; no email, booking, order, or payment was sent.

This was **one initially clean official Playground session with four sequential theme activations**, sharing imported page records and media. It was not four separate clean sites. Default Playground content and the optional importer remained in the sandbox. The native browser acceptance is bounded evidence, while every WordPress edition remains unavailable for sale. Declared minimum WordPress6.6/PHP8.1, independent fresh native hosts, WordPress.com upload plans, physical devices, and connected action delivery remain untested.

Published heading/image/contact screenshots, exact hashes, page routes and per-check outcomes are recorded in `artifacts/templates/wordpress-browser/installation-receipt.json`. Earlier CLI failures remain preserved in their original receipts. All later browser profiles, fixtures and evidence were stored on E: after C:/G: exhausted free space; no old scratch deletion or move was attempted.


## Final WordPress1.0.1 metadata acceptance

The native Nightjar card exposed an unrelated WordPress.org theme update prompt. All four packages now declare Version1.0.1 and an Eidos Update URI. WordPress introduced this header to prevent third-party themes being overwritten by similarly named directory themes: https://make.wordpress.org/core/2022/10/06/introducing-update-uri-theme-header-in-wordpress-6-1/ . No directory-theme update was clicked. The stylesheet cache version also changed to1.0.1.

The official Playground overwrite link opened an unscoped target and returned �Please select a file�; the native Theme Details dialog did not expose Delete. That failed attempt is preserved privately. A second initially clean official Playground runtime, in the same warm Chromium process, successfully installed and activated all four exact final1.0.1 ZIPs. Their visible native Theme File Editor headers showed Version1.0.1 and the Eidos Update URI; no file edit/save was performed there. The default frontend and actual stylesheet cache version were checked.

Archive comparison proves patterns, templates, parts, artwork, theme.json and WXR data are byte-identical to the baseline. Stylesheet differences are limited to the two headers, functions.php differs only in the cache-version literal, and remaining changed files are documentation/package metadata. The earlier native business/image edit, five-page navigation, Details and contact-target checks are therefore recorded as baseline evidence with this exact comparison; they were not repeated on the new ZIPs.

Overall WordPress status remains **partial and unavailable for purchase**. There were two initially clean runtimes with sequential themes, not four independent fresh installs. WordPress Save and frontend changes passed within the baseline session, while the Playground toolbar reported Autosave failed; export and persistence after restart remain unproven. Contact verification checked the demo mailto href; no email client/draft opened and no message was sent. Final normalized evidence is `artifacts/templates/wordpress-install-external/browser-ui-receipt.json`; private screenshot filenames/hashes and prior baseline links are included.
