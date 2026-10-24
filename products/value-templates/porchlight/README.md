# Porchlight — home and garden landing page

Draft $29 USD, one-time source product. One landing page with a local inquiry
composer. It is not a booking service, CRM or server-delivered form.

## Start with the local setup page

The extracted package now includes `START-HERE.html`. Open it in your browser
from the same folder as `config.js` and `setup.js`. Edit the supported business,
copy and color fields, download the replacement `config.js`, replace your working
copy with that exact filename, then refresh `index.html`. Reopening the setup page
reads that replaced file. Unsaved field changes disappear when the page closes.
No account, network request, AI, subscription or installation is required.

This edits configuration only. Follow the file map below to update static HTML
fallbacks, page titles/descriptions, other page copy, images and links. Source
editing is still required; the helper is not a complete no-code site editor or
native builder importer. Check text contrast after changing colors. For an event,
keep the displayed local date/time consistent with the downloaded UTC calendar.
Retain the setup page, setup.js, backups and license with your working copy;
upload only the required site/section files to your chosen compatible host.

## Customize and install

1. Edit `config.js` to change brand, headline, service titles/descriptions and
   colors. Update visible copy directly in `index.html` too if you need the
   customized text to remain identical with JavaScript disabled.
2. Replace `assets/porch-garden.webp` with your own licensed image using the same
   path, or update the HTML `src`, width, height and meaningful alt text together.
   The included original generated photograph may accompany the proposed one-site
   source license; it does not depict a verified business or customer project.
3. Review the service selector options, form labels, timing choices and all sample
   business copy in `index.html`. No prices, credentials, results or guarantees
   have been invented for your real business.
4. Leave `contactEmail` blank for text-download-only behavior. To offer an email
   option, put your real recipient address in that field. Preparing a draft
   does not send it; the visitor must choose Open email draft, review it in a
   configured email client, and send it themselves. An empty/invalid address hides
   the option. No form endpoint is configured. For backend delivery, integrate
   and verify a separate authorized form service before replacing this behavior.
5. Upload the folder to static hosting, or open `index.html` locally. Test the
   nav links, required fields, prepare, download and edit flows. No message should
   be reported as sent merely because text was prepared.

## Common problems

No email button: set a valid `contactEmail`, then prepare the draft again. No
email app: download and copy the text instead. Wrong image: check case-sensitive
asset paths. Changes appear missing: reload the page and confirm you edited the
same deployed folder. To roll back, replace the folder with your backup.

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

Private version 0.1.1. Price, one-site license and support/refund terms are draft
proposals for owner review. There is no active checkout or included installation,
hosting or customization service. A source package alone does not establish paid
fulfillment, physical-device testing or native builder acceptance.

## If scripts do not load

The inquiry fields and prepare button stay disabled until the complete local
composer is installed. This prevents a normal form submission from placing the
visitor's entries in a URL or server log. The page shows an unavailable note;
restore its runtime file or provide your actual static contact details. No sent
message or booking confirmation is implied. Renamed service titles stay matched
to their inquiry choices. Editing fields after preparation invalidates the draft.
