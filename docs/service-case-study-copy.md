# Service pages and build stories

Use this format as service pages and case studies are completed. The purpose is to explain a real implementation to a prospective customer and connect it to a service they may be searching for.

## Required content

1. Name the customer or operator problem and the action the interface supports.
2. Name the platform, framework, language, rendering or storage technology actually used. Separate the original deployed project from a public reconstruction or fictional demo.
3. Explain the implementation: components and data flow; layout and asset composition; interactions; integrations; accessibility, motion, and performance decisions where relevant.
4. Connect each technical choice to a practical benefit. Describe observable behavior rather than invented conversion, speed, revenue, or accuracy results.
5. Keep project status, client-services attribution, ownership, privacy, and evidence limits visible. Source inspection, browser observation, provider verification, and physical-device checks establish different things.
6. Include a relevant project or contact link. Keep essential build information in the prerendered HTML, without requiring a visitor to open a tab or run a demo first.

`src/data/buildStories.ts` supplies verified build details; `BuildDetails.tsx` renders stack groups and implementation steps. Add named stories when source is available. Do not apply the concept application's stack to a different private original project.

## Search language

Use a small set of relevant phrases in human-facing headings, explanatory copy, page titles/descriptions, internal links, and the existing Service JSON-LD. These are topic choices, not measured keyword-volume or ranking claims.

| Search intent | Current implementation evidence |
| --- | --- |
| React development; TypeScript frontend development | Root package, typed storefront data, reusable storefront components |
| InkSoft storefront customization; ecommerce UX | Existing hosted-store design records; separate public reconstruction boundary |
| Responsive web design; custom UI/UX | Scoped responsive styles, live HTML controls, collection and product layouts |
| HTML Canvas animation; SVG interface design | StorefrontFireworks, JingleMotion, JingleStorefront |
| Custom web applications; operational dashboards | Fictional ConceptApplications components and calculations |
| Interactive data visualization; local-first React application | Wellway React workspace, SVG Chart, storage and backup validation |
| AI assistant development; API integration | Ask Eidos React interface and Cloudflare Pages Function; optional OpenAI Responses API path |

For projects without reviewed source, describe observed behavior and reserve framework claims until verified. Only use a framework-specific phrase when its implementation or a separately scoped service supports it. Do not publish keyword lists, hidden copy, duplicate doorway pages, or ranking promises.

Maintain stable project URLs and accurate canonical metadata. Preserve article publication metadata and unrelated editorial assets during service-copy changes. Titles and JSON-LD should describe the visible page, not introduce additional capabilities.

Guidance checked October 1, 2026: [Google Search Essentials](https://developers.google.com/search/docs/essentials), [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), and [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
