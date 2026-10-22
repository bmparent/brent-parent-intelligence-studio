# Affordable template collection — design specification

Prepared October 22, 2026. New creation work, independent of the held paid-template
release. Source baseline: public main `53c25badc04bccc89bcc8d8d31018b396a3121fe`.
All prices are draft one-time USD prices, not activated offers. No demand or
conversion advantage has been measured.

| Product | Draft price | Complete, bounded scope | Customer hypothesis |
| --- | --- | --- | --- |
| Gatherline | $12 | One reusable event section, standalone example, scoped CSS, configurable calendar download | Workshops, classes, pop-ups and community events with an existing website |
| Porchlight | $29 | One complete landing page, original garden photograph, three service rows and local inquiry composer | Independent home and garden service businesses |
| Plainspoken | $59 | Three connected pages, service detail links and a local project-brief composer | Independent consultants and small service studios |

Existing Cinematic Starter $29 wording and the separate four-family developer
$99 / WordPress $129 draft collection are preserved. These prices buy different
amounts of source, not weaker layout, accessibility or dependency quality. Hosting,
domains, installation, customization, bookings, payment processing, cloud storage
and backend delivery are outside this batch. No native WordPress, Squarespace or
GoDaddy compatibility is claimed. Buyers need basic HTML/CSS/JavaScript editing.

## Concept specification

Original Image Gen concepts establish the visual systems. See `concepts/`.
Only the independent Porchlight photograph belongs in buyer packages; UI remains
native text, controls and CSS. All demonstration businesses are fictional.

| Product | Composition and copy lock | Tokens and typography | Components and interaction |
| --- | --- | --- | --- |
| Gatherline | Text wordmark; “Make something. / Take it home.”; two-line description; “Save the date”; “Workshop details”; orange date ticket; factual demo/calendar footer | Pale lilac `#eee6f4`, ink `#261c35`, orange `#e6643e`; Georgia serif; 80px desktop gutters; open two-column composition | Rectangular filled button, underlined disclosure, fine ticket rules. Calendar creates a local `.ics`, never an RSVP. No images, icons, gradients or animation |
| Porchlight | Wordmark, Services/Your project/Plan a visit; “A little care. / A better place.”; specified body; garden image right; three ruled service rows; “Tell us about your place.” form; fictional-business footer | Cream `#f4f1e9`, forest `#233c31`, olive `#d8dfcd`; Georgia serif; 72px desktop gutters; image aspect 4:5, 8px corners, no tint/overlay | Solid/outlined green buttons; native selects/input/textarea; one local-draft result state. No cards, claims, ratings or hidden transmission |
| Plainspoken | Wordmark; Approach/Services/Contact; “Clear thinking. / Useful next steps.”; specified body; “Start a conversation”; three approach lines; three open service rows; “Let’s make it clearer.” CTA | True white `#ffffff`, ink `#202527`, blue `#274bd6`, gray rules; Arial/Helvetica system sans; 88px desktop gutters; bold 80px headline | Open horizontal rows, fine arrow SVG, rectangular blue button, underlined link. Services/contact extend the same grid; no photos or decorative art |

Responsive continuation stacks the hero and ticket/photo below 760px. Navigation
wraps visibly without a scripted menu. Body/control sizes remain intentional,
focus indicators are visible, and no essential information depends on motion.
The reusable Gatherline stylesheet scopes all rules below `.gatherline`; the
separate `demo.css` styles only its standalone example.

Required downstream additions to the concept: expanded workshop details; an
inquiry/brief result with readonly text, download, optional configured email
draft, and edit control; Plainspoken Services and Contact pages using the same
typography, gutters and ruled-row/form primitives. These support the actual
workflows and do not change the initial visible copy.

## Commercial assumptions and next measurement

Prices and a proposed one-site source license need final commercial review.
No support labor, refunds, fees, acquisition cost or margin has been measured.
Before activating a price, record those costs and a bounded support allowance.
No subscription, paid plugin, remote font, analytics, API or external image
request is required to use this source. An optional email draft opens the
visitor's email client only after they explicitly choose it.

Test the hypothesis that smaller standalone products attract buyers who do not
need a full five-page site. After actual fulfillment is accepted and released,
record offer views, preview opens, checkout starts, paid deliveries and support
minutes by product and price. Compare absolute counts first; there is no traffic
baseline or observed price sensitivity to justify a lift estimate today.
