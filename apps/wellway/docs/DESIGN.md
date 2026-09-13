# Design specification

Brand source inspected: https://wellway.com/ on 2026-09-12.

The requested expansion preserves the existing shell and adds fictional Alex/Maya portraits, profile dialogs, a dated health-history timeline, and a three-stage video-visit demonstration. One generated paired-portrait asset is used as a CSS sprite to keep both identities consistent. The call view explicitly identifies its portraits and captions as static/scripted.

Motion consists of a slow banner drift, brief content entrances, restrained metric hover lift, and a simulated visit indicator. The footer can pause motion; CSS also respects the system's reduced-motion preference. The video room extends the existing navy/slate/teal modal system, with a single-column mobile layout. Browser fidelity and actual mobile rendering remain unverified for the reasons in VALIDATION.md.

- Original vector wordmark: https://wellway.com/app/uploads/logo-1.svg, saved from the rendered SVG document without alteration.
- Navy: #111f3e; slate: #444f5d; body: #51575d; white surfaces.
- Headings: Spectral, 400/500/600. Interface: Inter, 400/500/600/700. Local font files obtained from the Fontsource distributions; included OFL notices apply.
- Supporting chart accent: teal, #007e94/#008da6. It extends the interface rather than claiming an official Wellway brand-kit value.
- One primary action per view. Source details, mathematical explanations, and feature limitations stay adjacent to the relevant control.
- Persistent desktop navigation, mobile navigation at the bottom, original wordmark on mobile, reduced-motion support, keyboard-operable source points, a data-table alternative, and focus-trapped dialogs.

The selected Image Gen concept was revised after Brent requested actual Wellway branding. The main layout follows that branded concept: left rail, page title, check-in banner, three metrics, chart, and next-step panel. The concept is a visual reference; all delivered text, controls, records, and charts are native code.

Intentional changes from the concept: actual vector logo replaces the generated approximation; numerical values come from the dataset; the missing night is a true gap; charts use a documented zero-based axis; a View values control exposes a table; Help and footer identify the concept and local-only behavior. Secondary pages extend the same type, color, spacing, and component system.
