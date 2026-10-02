# Eidos Works branding

The studio logo is the simple lowercase **e** currently in the public header. Keep that shape, its italic character, and its slight counterclockwise tilt. The existing header and footer presentation remains the visual reference.

`public/brand/eidos-mark.svg` is the outlined export of the header's Georgia italic e with the same −12° rotation. The vector contains a path, with no font dependency. The glyph was exported from Georgia Italic in Microsoft's original `georgi32.exe` core-font installer; no font files or installer are distributed with the site. All derived studio marks use the same path. The main header and footer retain their existing text/CSS rendering.

| Use | Asset | Format / dimensions |
| --- | --- | --- |
| Vector master, ink on transparent | `/brand/eidos-mark.svg` | SVG, 128 × 128 viewBox |
| Light mark on dark surfaces | `/brand/eidos-mark-light.svg` | SVG, same geometry |
| Transparent upload | `/brand/eidos-mark.png` | PNG, 1024 × 1024 |
| Advertising and organization logo | `/brand/eidos-logo-square.png` | Opaque PNG, 1024 × 1024 |
| Square vector | `/brand/eidos-logo-square.svg` | SVG, ink on warm paper |
| Website link preview | `/brand/eidos-social-preview-v2.png` | PNG, 1200 × 630 |
| Website link-preview source | `/brand/eidos-social-preview-v2.svg` | SVG, same layout |
| Browser icon | `/favicon.svg?v=lowercase-e-2` | SVG |
| Raster browser fallback | `/brand/eidos-favicon-48-v2.png` and `/favicon.ico` | PNG and multi-size ICO |
| Home-screen icon | `/brand/eidos-apple-touch-v2.png` | PNG, 180 × 180 |

Studio colors: ink `#14212a`, warm paper `#f3f0e9`. Use the light mark when the ink mark would lack contrast. Keep generous space around the e and preserve its proportions. Do not add the old uppercase E, corner outline, dot, or retired Cloudinary logo files to new studio branding.

`siteConfig.logos.icon` supplies the public Organization JSON-LD logo; `siteConfig.socialImage` supplies default Open Graph and Twitter images. Article and project-specific images remain contextual, while the article-card generator adds the same studio e. Quote Desk's standalone and public-preview marks are copies of the light vector; keep both in sync when the master changes. Playground uses the ink vector.

Legacy `/social-preview.png`, `/social-preview.svg`, `/favicon.ico`, and `/apple-touch-icon.png` also contain the current logo. New preview and icon URLs avoid reusing the previous asset identity. An existing advertising draft may retain its selected image; regenerate its preview or upload the square PNG. The site does not control which image a third-party advertiser ultimately selects.
