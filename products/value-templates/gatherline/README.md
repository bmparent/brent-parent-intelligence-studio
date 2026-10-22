# Gatherline — event section

Draft $12 USD, one-time source product. One event announcement, not an event
booking or ticketing system.

## Customize and install

1. Open `index.html` for the full standalone example. Edit `config.js` to change
   the visible brand, headline, description, date, time, location and colors.
2. Update `event.startUtc` and `event.endUtc` with full UTC times ending in `Z`.
   Check the real event's time zone and daylight saving conversion. The visible
   time is editorial text: update both the visible copy and UTC calendar fields.
   The included fictional November 14 example is 10 am–noon America/New_York,
   equivalent to 15:00–17:00 UTC on that date. Use a new stable event UID for a
   different event. The downloader rejects invalid or reversed times.
3. For an existing source website, copy the section in `section.html` into the
   body. Link `styles.css`, then load `config.js` and `script.js` with `defer`.
   Adapt paths to your own assets directory. Use this event section once per page.
   The CSS is scoped below `.gatherline`. Do not copy `demo.css` into your site;
   that file resets only the standalone demonstration page. The event script uses
   `window.GATHERLINE_CONFIG` and scopes DOM/theme edits to its own section; it
   does not replace a host page title or a different template configuration.
4. Keep the heading level appropriate to the host page. `section.html` uses `h2`.
   Change its heading and matching `aria-labelledby` together if necessary.
5. In a browser, check the full date, location, disclosure and details. Click
   Save the date, import the `.ics` into a test calendar, and confirm its local
   displayed date/time. Downloading never registers or reserves a place.

## Common problems

A blank or wrong calendar result normally means the UTC times in `config.js`
are invalid or do not match the visible text. Read the inline status after the
button. For a missing script, check paths and the browser console. The date and
location remain readable without JavaScript; the details disclosure is native.
To remove this section, remove its markup and its own styles/scripts only.

## Local draft behavior

There is no backend, tracking, AI request, remote font, required paid plugin or
persistent visitor storage. All CSS, JavaScript and assets run locally. Keep all
files together. Open `index.html` directly, or serve this folder with
`python3 -m http.server 4386`. This section and its built ZIP use their own scoped `script.js` and work alone.

The sample business is fictional. Before using this for a real business, replace
all demonstration copy, dates, contact details and claims, review accessibility
and the actual deployment, update each page title/description, and remove the
`robots=noindex,nofollow` meta tag when the real site is ready to be indexed.
Do not remove the fictional labels from an unchanged example and imply real work.

Use a text editor. Back up the folder before edits; restore that copy to roll back.
Keep a copy of `PACKAGE_MANIFEST.json` to identify the delivered draft version.
No native WordPress, Squarespace, GoDaddy or other builder compatibility is
claimed. The HTML/CSS/JavaScript must be installed by someone able to edit source.
If a builder strips scripts or denies downloads, keep the readable static content
and move the interaction to a supported hosting environment; do not bypass its
security policy. Test the exact real destination before promising compatibility.

## Support and commercial status

Private version 0.1.0. Price, one-site license and support/refund terms are draft
proposals for owner review. There is no active checkout or included installation,
hosting or customization service. A source package alone does not establish paid
fulfillment, physical-device testing or native builder acceptance.
