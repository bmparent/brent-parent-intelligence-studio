# Interactive storefront reconstructions

Five self-contained storefronts demonstrate the studio’s design and interaction work. Each has Home, All products, Product, and Bag views within its own route:

- `/work/nighttime-spectaculars`: Hollywood Studios night scene, cast apparel, rising fireworks and overlapping particle bursts.
- `/work/holidays-in-hollywood`: blue-hour entrance, warm gold and green, illustrated wardrobe categories and individual styling mockups.
- `/work/disney-villains`: ornate mirror, violet/emerald atmosphere, parchment collection and product layouts.
- `/work/beauty-and-the-beast`: saved anniversary theatre artwork, gold framing and an editorial collection.
- `/work/jingle-bell-jingle-bam`: holiday theatre, Wayne and Lanny, falling snow, snow-globe categories, front/back garment views.

These are portfolio reconstructions using saved artwork. Product names, sizes and selections are illustrative; they are not an inventory or price feed. No checkout, customer account, private store endpoint or order submission exists in the demos. They make no new claims about the original stores’ product details or measured results.

## Adding or changing a storefront

`src/data/storefrontDemo.ts` owns theme identity, versioned artwork URLs, category compositions and individual item images. Keep category widgets in `categoryImages`, separate from `products`. Supply `back` only when a real second image exists. Accessories should have appropriate illustrative options, such as `One size`, instead of automatically inheriting apparel sizes.

`StorefrontDemo.tsx` owns local navigation, search/category filtering, example options, quantity, image inspection and temporary bag state. Each theme’s palette and hero composition live under `.sd-demo.sd-<style>` and `.sd-preview.sd-<style>` in `storefront-demo.css`. Keep host styles contained. The product stage reuses the collection’s artwork and typography.

When adding a route, update the theme union/data, `showcase.ts`, page metadata/prerender paths, sitemap generation and required-route checks. App route selection reads the theme keys. The first two showcase records stay on the homepage; the complete Work collection includes all five demos. The separate thumbnail gallery is maintained as described in `site-gallery.md`.

## Motion and access

Nighttime’s decorative canvas uses one animation loop, at most 320 sparks, capped pixel density, resize observation and a first burst on entrance. It cancels work offscreen, on document hiding, on pause, and on unmount. It responds to reduced-motion preference changes. CSS stars, beams and snow pause when the demo is offscreen or explicitly paused; reduced motion removes the animation. Content and controls remain available without motion.

Navigation moves focus to the new view heading. Missing size selection focuses the option group and announces the error. The artwork dialog traps focus using the native dialog element, closes with Escape and restores focus to its trigger. Category and search controls, bag removal, and image-view selection use native buttons/inputs. Gallery images and product cards have reserved dimensions.

## Release

Use the existing Cloudflare Pages release process in `site-gallery.md`. A GitHub merge alone does not deploy the direct-upload `eidosworks` project. Verify all five routes and `/work#site-gallery` on production after deploying the complete app and existing Pages Functions.

## September 6 verification

- All 48 distinct storefront asset URLs returned HTTP 200. Browser inspection showed the intended artwork on each theme, including the new gallery references.
- Nighttime fireworks were visibly present in desktop and phone screenshots. Pause stopped the canvas and CSS animation; the reduced-motion test fixture stopped both and displayed the preference notice. The preference fixture simulated `matchMedia` changes; this was not a physical device or OS-settings test.
- Search empty state/reset, category filtering, required size validation, quantity, add/remove bag, front/back image switching, artwork dialog Escape dismissal and focus return were exercised in the browser. Gallery filtering, complete-reference thumbnails, preview labels and Escape focus return were also checked.
- Home and product layouts were checked at narrow phone widths, including a 320px frame (305px content area with the browser scrollbar). No horizontal overflow was observed. Desktop composition was visually reviewed for all five themes.
- The InkSoft preflight reported zero errors and warnings. Its four informational pointer-event findings apply only to decorative overlays/canvas; controls remain outside those layers.
- Typecheck, lint, production build, prerender/editorial/URL/Insights checks, 17 platform tests, one analytics test, Snapshot smoke checks, and Pages Functions compilation passed locally. GitHub CI is the final merge gate.
