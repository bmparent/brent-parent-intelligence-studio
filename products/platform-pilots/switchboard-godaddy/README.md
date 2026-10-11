# Switchboard — GoDaddy Websites + Marketing visual add-on pilot

Version 1.0.0. Status: **unavailable for purchase; hosted installation blocked by missing authorized GoDaddy Websites + Marketing access**. This is one service-inquiry section, not a complete native builder theme. GoDaddy-hosted WordPress is a different product and uses the WordPress edition.

## Included and editable

`section.html` is one pasteable HTML/CSS/JavaScript block. `iframe-harness.html` demonstrates local isolation beside example native content. No external scripts, fonts, images, hosting subscription, build process, Eidos service, booking service, contact processor, or diagnostic engine is included. Text, business name, contact links, colors, and process steps are edited in the source. GoDaddy's normal visual editor does not turn the custom HTML into native editable fields. The three service choices route inquiry context only; they provide no estimate or technical advice.

## Install on a test page

1. Back up the page or record the current published version and its native section order. Start on a draft/test page.
2. In `section.html`, replace “Switchboard Services”, every sample service description, and **all three** `https://example.com/contact/` links with your real HTTPS contact or supported booking URL. Keep `target="_blank"` and `rel="noopener noreferrer"`. Preserve or adapt the `service` query parameter only if your destination supports it. Make the same destination reachable in native navigation.
3. In GoDaddy: Products → Websites + Marketing → Manage → Edit Website. Choose the test page/location, Add Section → HTML → Add. Paste the entire file into Custom Code.
4. Initially leave Forced Height blank and Preview. Check all three expanded states. If clipped or internally scrolling, set enough height to fit the largest state at the narrowest supported phone width. The local harness uses 720 px desktop and 1060 px mobile as **test fixtures**, not verified GoDaddy settings. GoDaddy may use one fixed height; measure it on the target site.
5. Keep native header, navigation, footer, forms, booking, payments, and search content outside the embed. Publish the test page only after the actual contact destination works.
6. In a signed-out browser, test keyboard Tab/Enter/Space, touch, narrow/mobile width, long replacement copy, all expanded states, scrollbars, and every new-tab action. Check that native navigation, form, and footer still work. Capture URL, plan, date, screenshots, console findings, measured section height, and browser versions before enabling this edition for sale.

## Static fallback and removal

Without JavaScript the semantic `details` controls still open and every contact link remains usable; more than one option may stay open. With JavaScript only one option stays open. The script does not contact servers or access the parent page. To remove, delete the HTML section and restore its former native section. Retain your original contact page and data. Revert the source from your saved copy if an edit breaks the section.

## Common mistakes and support

Do not paste an entire Eidos website into the HTML section, promise native theme replacement, reuse `eidos-switchboard-addon` twice on one page, leave example links in production, set height to zero, or embed HTTP content. A local browser render does not establish GoDaddy mobile sizing or published behavior. GoDaddy does not troubleshoot third-party code. Candidate support/update terms remain draft; no setup timing has been measured or promised.

Official route: https://www.godaddy.com/help/add-html-or-custom-code-to-my-site-27252

Iframe, height, HTTPS, and link limits: https://www.godaddy.com/help/troubleshoot-html-or-custom-code-not-displaying-properly-28025
