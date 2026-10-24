# Plainspoken — compact consultant website

Draft $59 USD, one-time source product. Home, Services and Contact, with a local
project-brief composer. It is not a native CMS theme or a server-delivered form.

## Customize and install

1. Edit `config.js` for brand, homepage headline/body, shared service titles and
   descriptions, colors, CTA and demonstration footer. Use your own honest copy.
   Edit the matching HTML fallback text for identical no-JavaScript presentation.
2. Edit the detailed service descriptions in `services.html`, the approach list
   in `index.html`, and the introduction/form labels in `contact.html`. Keep links
   and matching section IDs together. No invented clients or outcomes are included.
3. Check all three service-to-contact links. `?service=review`, `plan` and `support`
   preselect only the known matching choices. Unknown query values are ignored.
4. Leave `contactEmail` blank for local text download, or configure your recipient
   email to offer an explicit Open email draft action after preparation. It opens
   the visitor's email app; nothing is sent by this page. A separate backend or
   authorized form service is necessary for server delivery and is not included.
5. Keep `index.html`, `services.html`, `contact.html`, CSS, config and runtime in
   the same folder. Use any static hosting that supports ordinary HTML files.
   Check desktop and narrow layouts, keyboard focus, every navigation destination,
   service preselection, required fields, draft text download and edit behavior.

## Common problems

Broken service links: restore filenames or update all corresponding links. No
preselection: keep `option value` and `?service=` keys in sync. No email action:
set a valid recipient and prepare the brief again; a download remains available.
The form does not retain data on reload; this is intentional, with no storage or
submission. Replace the source folder with your backup to roll back.

## Local draft behavior

There is no backend, tracking, AI request, remote font, required paid plugin or
persistent visitor storage. All CSS, JavaScript and assets run locally. Keep all
files together. Open `index.html` directly, or serve this folder with
`python3 -m http.server 4386`. Source previews refer to the common runtime in the
parent folder; the built ZIP contains its own local `runtime.js` and works alone.

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
