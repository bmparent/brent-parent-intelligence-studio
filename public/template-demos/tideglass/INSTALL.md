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
- Progressive configuration: edit `site-config.js` for `brand` (`[data-brand]`),
  `email` (`[data-email]`), `colors` (`ink`, `paper`, `accent`, `panel`, `line`),
  `fonts.heading`, `fonts.body`, and `motion` (`false` disables motion).
  The `pages` keys are filenames without `.html`. On the five designed pages,
  `title` and `intro` replace `[data-hero-title]` and `[data-hero-intro]`.
  Only `pages.index` has `[data-primary-link]` and `[data-hero-image]`: its
  `ctaLabel`, `ctaHref`, `image`, and `imageAlt` configure the home hero action
  and artwork. These fields do not create markers or edit inner-page images or
  buttons. `legal.html` has no page-copy markers; edit it directly in HTML.
  The optional `phone` value targets `[data-phone]`; no telephone link is present
  in the supplied pages. Add an actual HTML `tel:` link and this marker if needed.
  Keep the corresponding HTML defaults and CSS tokens in sync for no-JavaScript
  visitors. Other page copy, actions, navigation, and metadata require HTML edits.
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

## Email form and optional integrations
The included contact form validates fields and prepares a `mailto:` draft. It
never sends or stores a message. The visitor needs a configured email app and
must review and send the draft. The ordinary email link works without JavaScript;
the draft-preparation form is an enhancement. Test delivery to your own inbox on
your host before relying on email. This package includes no form endpoint, spam
filter, attachment upload, SMTP, booking engine, cart, ticket inventory, analytics,
or payment processing. For a web form, replace the form action/script with your
chosen provider's documented integration, add its required privacy disclosures,
and test successful delivery and failure handling. Provider accounts, fees, keys,
and operational support are separate; never put secret keys in browser code.

## Rollback and removal
Before editing or uploading, keep the original ZIP and a dated copy of your
current working folder and hosted files. To roll back, restore that complete
known-good folder to the same document root, keeping relative paths intact, then
refresh the browser and check all pages and contact links. Do not mix only an old
HTML page with newer CSS/config files. Retain your own content changes separately.
To remove this template, first publish your replacement site or a holding page,
then use your host's file manager/SFTP to remove only this template's uploaded
files from its document root. Do not remove unrelated applications, customer
uploads, host configuration, DNS, or an email account. Disconnect any optional
third-party form, booking, analytics, or ticket integration in that provider's
settings if it should stop operating; removing this static site does not close
those services. The package itself creates no remote account or database.

## Troubleshooting and common mistakes
- Missing artwork or styles: upload the complete extracted folder contents,
  including `assets/`, with case-sensitive filenames and unchanged relative paths.
  Open the actual `index.html`, not the ZIP or its parent folder.
- Edits appear unchanged: save the file, refresh without browser cache, and clear
  the host cache if applicable. A configured value overrides its matching HTML
  marker only when JavaScript runs; keep both defaults in sync.
- An inner-page button/image or legal text did not change: those lack the home
  hero markers. Edit that page's HTML rather than adding unsupported config keys.
- An email draft does not open or arrive: check the real address and email-app
  setup. Preparing a draft does not send it; test sending yourself or connect and
  verify a web form provider. Do not advertise guaranteed delivery.
- Phone navigation or selection does not respond: retain `site-config.js` and
  `script.js` in their original order and check the browser console for syntax
  errors. Without JavaScript, ordinary page/event links remain available.
- Custom text clips or colors become hard to read: check phone, tablet, desktop,
  keyboard focus, reduced motion, and any day/night modes after changing copy,
  fonts, or tokens. Shorten long words or reduce the relevant CSS heading size.

## Requirements, support, and rights
A browser, text editor, and static hosting are sufficient. No paid font, plugin,
Eidos service, analytics, backend, booking engine, cart, or mandatory build is included.
The developer license covers one finished website, including a client handoff.
Read `LICENSE.txt`, `SUPPORT.md`, and `ASSETS.md` before purchasing or publishing.
