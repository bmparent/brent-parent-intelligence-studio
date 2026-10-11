# Tideglass — Developer source installation

## What this edition is
A complete portable five-page website design, plus a legal-notes page, editable
HTML/CSS/JavaScript, original SVG artwork, and this guide. It requires code editing.
It is not a WordPress, Squarespace, or GoDaddy theme importer. Choose the separately
verified native/platform edition if that is what you need.

## Quick start
1. Extract the ZIP to a new folder. Keep a copy of the original ZIP as a backup.
2. Open `index.html` in a current browser. No account, build, or server is needed
   for the included local pages and interactions.
3. Optional local preview: from the extracted folder run
   `python -m http.server 8080` and visit `http://localhost:8080`. Python is optional.
4. Edit with a plain-text editor. Copy this folder to your chosen static hosting
   provider or upload its contents to the website document root using its normal
   file manager/SFTP workflow. Hosting and domain costs are separate.
5. Open the hosted URL and test every page, inquiry link, and responsive layout.

## Editing surface
- Copy: every page is ordinary HTML. Change headings, paragraphs, lists, captions,
  and policy notes directly; no template language is required.
- Branding, links, hero copy and artwork, colors, system-font stacks, and motion:
  edit `site-config.js`. The `pages` object accepts the filename without `.html`;
  each page can override `title`, `intro`, `ctaLabel`, `ctaHref`, `image`, `imageAlt`.
  Keep the corresponding HTML default and the CSS color variables in sync so the
  no-JavaScript version presents the same business information.
- Colors and detailed layout: edit `styles.css`. The last family-specific block
  defines design tokens. Check contrast after changing colors.
- Images: put your own licensed files in `assets/` and replace the HTML `src`,
  width/height, and meaningful `alt` text. Original included SVGs can be edited.
- Navigation: update links in each page header/footer. Preserve the skip link.
- Contact: replace every `hello@example.com` with your real public address, and
  set `email` in `site-config.js`. The form prepares an email draft only. The
  visitor must review and send it in an email app. There is no message database.
- Integrations: add your actual tested form/booking/store/ticket destination.
  Do not label it connected until you complete its real transaction flow.

## Search and social metadata before publishing
Each page has its own title, description, Open Graph title/description/type/image,
and minimal WebPage JSON-LD. No fictional domain, price, availability, rating,
business address, or organization credential is asserted. Canonical and `og:url`
are intentionally omitted until your actual domain and page URLs are known.
Set those absolute URLs in each HTML head before publication. The bundled
`og:image` is a relative path to original SVG art for local preview. Social
services vary in SVG support; export your original artwork to their supported
raster format, publish it on your host, and set an absolute image URL before
relying on link previews. Update the metadata and JSON-LD descriptions with your
real content. JavaScript configuration does not rewrite static metadata; edit
the HTML head so crawlers and no-JavaScript visitors get accurate information.

## Included pages
- `index.html` — Home
- `stays.html` — Stays
- `stay-detail.html` — The house
- `guide.html` — Local guide
- `contact.html` — Plan your stay
- `legal.html` — editable privacy and site notes; not legal advice.

## Accessibility and fallbacks
All pages, service/object/event information, and contact email remain available
without JavaScript. Enhancements use ordinary keyboard-focusable buttons, pressed
states, live status, and touch targets. Reduced motion is respected. The menu is
fully visible without JavaScript. Test your final copy/images by keyboard and on
real mobile devices; the included checks do not certify legal accessibility.

## Before publishing
- Replace fictional content, unconfirmed facts, and placeholder contact details.
- Publish real business policies, dimensions/access notes, terms, and prices.
- Replace sample branding where required. Confirm image/content permissions.
- Test links and email on your actual host; test any integrated checkout/booking.
- Add analytics only intentionally and update your privacy/cookie disclosures.
- Keep secrets and credentials out of these public source files.

## Requirements, support, and rights
A browser, text editor, and static hosting are sufficient. No paid font, plugin,
Eidos service, analytics, backend, booking engine, cart, or mandatory build is included.
The developer license covers one finished website, including a client handoff.
Read `LICENSE.txt`, `SUPPORT.md`, and `ASSETS.md` before purchasing or publishing.
