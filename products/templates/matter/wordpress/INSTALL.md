# Matter — Native WordPress block theme

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
   supplied `matter-wordpress-v1.zip`. Install and activate `Matter by Eidos Works`.
3. In Settings → General, set your site title and tagline. In Appearance → Editor,
   open Styles to edit the palette, typography, and spacing. Header site title and
   Navigation are ordinary core blocks. No account or key is needed.
4. Create Pages with these slugs: `home`, `collection`, `object`, `process`, `contact`.
   Set Settings → Reading → a static homepage → Home. The `front-page` template
   provides the designed home. Select the corresponding `Matter — [page]`
   template for each other page. All designed templates are editable in Site Editor.
5. Edit the header Navigation block to match your actual page URLs. Included
   example links assume installation at the domain root. For a subdirectory or
   non-pretty permalink site, select your actual pages from the Navigation editor.
6. Open each template in Appearance → Editor → Design → Templates to change
   its native headings, paragraphs, columns, images, buttons, and Details blocks.
   Select an Image block → Replace → Media Library/Upload for your own artwork.
   Save the template and verify the published frontend.
7. To edit content in the regular Page editor instead, choose the default Page
   template, then insert the matching `Matter — [page]` pattern. Patterns are
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

## Updates, rollback, and rights
Back up customizations first. Site Editor changes are stored in the WordPress
database and can override bundled templates. Review those saved changes when
installing an update; preserve or export them before resetting a template.
Rollback by restoring the backup or reactivating the previous theme.
All WordPress edition code and original art are GPL-2.0-or-later. Read `LICENSE.txt`,
`COPYING`, `ASSETS.md`, and `SUPPORT.md`. No one-site commercial restriction limits
your GPL rights. Hosting and optional services cost extra.
