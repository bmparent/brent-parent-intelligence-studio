# Switchboard — Native WordPress block theme

## What this edition is
A native block theme with five designed pages, editable core-block patterns,
header/footer parts, global styles, original artwork, and optional demo page XML.
No paid page builder, proprietary service, or remote font is required. It does
not import the developer edition JavaScript. Its signature exploration uses
native expandable Details blocks rather than the source edition's live effects.

## Supported environment and status
Source minimums: WordPress 6.6+ and PHP 8.1+. These are declared requirements,
not a blanket compatibility claim. Consult the shop compatibility record and
clean-install receipt for the exact WordPress/PHP versions actually tested.
This package is a release candidate until that verification is accepted.
Self-hosted WordPress needs permission to upload themes. WordPress.com hosting
plan/upload eligibility must be checked separately; this theme does not provide
a plan or bypass host restrictions. GoDaddy-hosted WordPress is a WordPress host;
GoDaddy Websites + Marketing is a separate product and cannot import this ZIP.

## Install on a fresh or backed-up site
1. Back up the existing site and test in staging. Do not replace an active theme
   on a customer site without reviewing its existing templates, menus, and content.
2. In Appearance → Themes → Add New → Upload Theme, select the separately
   supplied `switchboard-wordpress-v1.0.3.zip`. Install and activate `Switchboard by Eidos Works`.
3. In Settings → General, set your site title and tagline. In Appearance → Editor,
   open Styles to edit the palette, typography, and spacing. Header site title and
   Navigation are ordinary core blocks. No account or key is needed.
4. Create Pages with these slugs: `home`, `services`, `service-detail`, `process`, `contact`.
   Set Settings → Reading → a static homepage → Home. The `front-page` template
   provides the designed home. Select the corresponding `Switchboard — [page]`
   template for each other page. All designed templates are editable in Site Editor.
5. Edit the header Navigation block to match your actual page URLs. Included
   example links assume installation at the domain root. For a subdirectory or
   non-pretty permalink site, select your actual pages from the Navigation editor.
6. Open each template in Appearance → Editor → Design → Templates to change
   its native headings, paragraphs, columns, images, buttons, and Details blocks.
   Select an Image block → Replace → Media Library/Upload for your own artwork.
   Save the template and verify the published frontend.
7. To edit content in the regular Page editor instead, choose the default Page
   template, then insert the matching `Switchboard — [page]` pattern. Patterns are
   ordinary core blocks after insertion. Do not add both a designed template and
   a full page pattern expecting both to render; the designed template is the layout.

## Optional demo page import
Tools → Import → WordPress uses the free WordPress Importer plugin, installed
only if you choose this route. Import `demo-content.xml`; map the sample creator
to your own account. No attachments or external media are downloaded. Then set
the homepage and review the page-template assignments and navigation as above.
Manual page creation requires no plugin. XML creates page records; designed
content is supplied by the selected native templates, not hidden post HTML.

## Replace before launch
Replace fictional names, contact address `hello@example.com`, sample offerings,
unconfirmed dimensions/amenities/events, and policy notes. Create a real Privacy
Policy page and set its footer link. Contact buttons open email only. Booking,
commerce, ticketing, SMTP, forms, inventory, analytics, and live availability are
not included. Install a suitable plugin/service only if you need it and verify
the complete flow. Do not put secrets in blocks, theme files, or public pages.

## Email and optional integrations
Contact buttons are ordinary `mailto:` links. WordPress edition has no included
contact form, SMTP setup, message storage, or delivery guarantee. Replace the
sample address in the Contact template/pattern and test a real message to your
inbox using your own email app. For a web form, use a separately chosen plugin or
provider, insert its supported block, configure its recipient and privacy/spam
settings, and test delivery plus failure handling on your host. Booking, carts,
payment processing, ticket inventory, analytics, accounts, and fees are separate.
Do not paste private keys into public blocks or theme files.

## Troubleshooting and common mistakes
- Theme ZIP rejected: upload the supplied WordPress ZIP in Appearance → Themes,
  not the developer ZIP or `demo-content.xml`. Check host upload permissions and
  file-size limits; do not bypass your hosting plan's theme restrictions.
- Wrong layout or unchanged edits: check the page's selected template and the
  static homepage setting. Designed templates render their own blocks. To use
  Page editor content, choose the default Page template and insert the pattern.
- Bundled update not visible: saved Site Editor templates/styles can override
  theme files. Export or back up edits before reviewing/resetting overrides;
  clear host/browser caches only after verifying the saved content.
- Navigation or artwork is broken: update Navigation to your real page URLs,
  especially in a subdirectory or with plain permalinks. Replace Image blocks
  through Media Library; do not assume example root URLs fit your installation.
- Demo XML did not create a finished site: it creates page records, not external
  media or accounts. Review template assignments, Reading, Navigation and contact
  details. Manual page creation is available without the optional importer.
- Email does not send: `mailto:` needs a configured visitor email app. No form
  server is included; a separately configured/tested form plugin may be needed.

## Updates, rollback, and removal
Back up customizations first. Site Editor changes are stored in the WordPress
database and can override bundled templates. Review those saved changes when
installing an update; preserve or export them before resetting a template.
Rollback by restoring the complete known-good site/database backup, or activate
the previous theme and review its saved templates, navigation, and Styles. Keep
the previous immutable ZIP and export your customizations before replacement.
The `Update URI` header uniquely identifies this theme and avoids unrelated
WordPress.org updates; it is not an automatic update or remote support service.
To remove this theme, activate a different theme first, verify the replacement
frontend, then delete only this inactive theme in Appearance → Themes. Export or
back up its Site Editor customizations before deleting. Do not delete Pages,
Posts, Media Library uploads, users, plugins, or the database to remove a theme;
those are separate site content. Remove optional integrations in their own
settings only if desired. Deleting this theme does not close a provider account.

## Rights and support
All WordPress edition code and original art are GPL-2.0-or-later. Read `LICENSE.txt`,
`COPYING`, `ASSETS.md`, and `SUPPORT.md`. No one-site commercial restriction limits
your GPL rights. Hosting and optional services cost extra.
