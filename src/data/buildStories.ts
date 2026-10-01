import type { StorefrontTheme } from './storefrontDemo';

export type BuildStory = {
  service: string;
  summary: string;
  stack: { label: string; tools: string[] }[];
  steps: { title: string; detail: string }[];
};

const storefrontStack = [
  { label: 'Original storefront', tools: ['InkSoft', 'Custom HTML', 'Scoped CSS', 'Responsive design'] },
  { label: 'Public reconstruction', tools: ['React', 'TypeScript', 'Vite', 'Cloudinary'] },
];
const browsingStep = {
  title: 'React components and product browsing',
  detail: 'Typed theme and product data drive reusable collection cards, category filters, text search, product inspection, size and quantity controls, and a temporary demo bag. React state keeps selections together as the visitor moves between views.',
};
const accessStep = {
  title: 'Responsive frontend and motion controls',
  detail: 'Scoped CSS adapts the layout to narrow screens. Native buttons, labeled inputs, focus management, and a modal artwork viewer support keyboard use. Decorative effects pause offscreen or in a hidden tab and respect reduced-motion preferences.',
};

export const storefrontBuilds: Record<StorefrontTheme, BuildStory> = {
  'holidays-in-hollywood': {
    service: 'InkSoft storefront customization & React frontend development',
    summary: 'A custom branded entrance for hosted ecommerce, followed by a separate React reconstruction that lets visitors inspect the design publicly.',
    stack: storefrontStack,
    steps: [
      { title: 'Hosted ecommerce customization', detail: 'The original presentation sits within InkSoft. Custom HTML and scoped CSS shape the entrance and collection navigation while InkSoft provides the product catalog, customer accounts, cart, and checkout.' },
      { title: 'Layered hero and collection layout', detail: 'The reconstruction composes saved scene artwork with separate foreground imagery, live headings, calls to action, and category cards. CSS Grid, theme variables, and gold-and-green styling carry the visual direction from the entrance into product and bag views.' },
      browsingStep,
      accessStep,
    ],
  },
  'nighttime-spectaculars': {
    service: 'Interactive ecommerce design & HTML Canvas animation',
    summary: 'A night-scene storefront design with a React portfolio reconstruction and a custom Canvas 2D fireworks system.',
    stack: [...storefrontStack, { label: 'Reconstruction animation', tools: ['HTML Canvas 2D', 'requestAnimationFrame', 'IntersectionObserver'] }],
    steps: [
      { title: 'A storefront with an existing commerce engine', detail: 'The original InkSoft design places cinematic artwork and collection hierarchy around the hosted shopping platform. The public reconstruction uses its own typed product examples rather than connecting to the protected catalog.' },
      { title: 'Custom particle animation', detail: 'Canvas 2D draws rising rockets and sparks with velocity, gravity, drag, and fading lifetimes. One requestAnimationFrame loop caps the spark count and pixel density; viewport and document-visibility checks stop unnecessary animation work.' },
      browsingStep,
      accessStep,
    ],
  },
  'disney-villains': {
    service: 'Branded storefront UX & reusable React components',
    summary: 'An ornate mirror entrance and coordinated product journey, reconstructed with a shared React storefront engine and a distinct CSS theme.',
    stack: storefrontStack,
    steps: [
      { title: 'Platform-aware storefront design', detail: 'The original presentation works within InkSoft’s hosted storefront. Its custom entrance and category paths complement the existing product, account, cart, and checkout functions.' },
      { title: 'A reusable component system with its own identity', detail: 'Typed theme data selects the mirror artwork, category images, violet-and-emerald palette, and product imagery. Scoped CSS creates the parchment collection and product surfaces; decorative CSS particles add atmosphere around usable HTML controls.' },
      browsingStep,
      accessStep,
    ],
  },
  'beauty-and-the-beast': {
    service: 'Custom ecommerce frontend & responsive UI design',
    summary: 'A theatre-led anniversary collection with a public React reconstruction, editorial product layout, and reusable browsing controls.',
    stack: storefrontStack,
    steps: [
      { title: 'Custom presentation within InkSoft', detail: 'The original storefront design adds a branded entrance and collection hierarchy inside the hosted commerce platform. InkSoft retains the operational shopping and checkout functions.' },
      { title: 'Editorial layout and theme composition', detail: 'The reconstruction uses saved theatre and anniversary artwork, gold framing, CSS theme variables, and separate category and product images. The same visual system follows visitors from the hero to collection cards, item inspection, and the demo bag.' },
      browsingStep,
      accessStep,
    ],
  },
  'jingle-bell-jingle-bam': {
    service: 'InkSoft storefront design & interactive React development',
    summary: 'A dedicated React reconstruction of the holiday storefront, combining saved garment artwork, SVG collection shapes, and live snow and fireworks.',
    stack: [...storefrontStack, { label: 'Reconstruction graphics', tools: ['SVG', 'HTML Canvas 2D', 'ResizeObserver'] }],
    steps: [
      { title: 'Original commerce platform and public demo', detail: 'The storefront presentation was designed within Data Graphics’ client-services workflow using InkSoft. The public React version recreates the browsing journey with saved artwork; customer accounts and checkout remain functions of the original private store.' },
      { title: 'Snow-globe navigation and layered artwork', detail: 'Scoped CSS composes the theatre background, character overlays, glass panels, and garment imagery. An SVG globe shape and separate shell artwork frame collection cards while Canvas 2D supplies snow and decorative fireworks.' },
      { title: 'Typed catalog and product options', detail: 'TypeScript product records drive five saved garment styles, category and text filtering, name or price sorting, and front-and-back inspection. React state manages example sizes, quantity, personalization text, cart totals, and item removal without submitting an order.' },
      { title: 'Motion that responds to the browser', detail: 'ResizeObserver fits each canvas to its container. requestAnimationFrame updates particle positions; IntersectionObserver, tab visibility, a pause control, and reduced-motion preferences suspend animation. Responsive CSS rearranges the hero, collection, and product layouts for smaller screens.' },
    ],
  },
};

export const mdcaBuild: BuildStory = {
  service: 'School webstore design & InkSoft ecommerce UX',
  summary: 'A responsive custom entrance for a live school-uniform store, organized around sizing, ordering, and pickup questions.',
  stack: [{ label: 'Live storefront', tools: ['InkSoft', 'Custom HTML', 'Scoped CSS', 'Responsive design'] }],
  steps: [
    { title: 'Hosted storefront customization', detail: 'Custom school-branded content and responsive layout sit above InkSoft’s existing catalog. The commerce platform handles products, customer accounts, cart, and checkout.' },
    { title: 'Information architecture before the product grid', detail: 'The entrance separates shopping from fit guidance and explains production timing and pickup notifications. Clear section hierarchy gives families practical ordering context before they commit to a purchase.' },
    { title: 'Ordering guidance where it affects the decision', detail: 'Sizing help and the final-sale reminder are part of the customer path. This is ecommerce UX and content design around an existing platform; the linked live store supplies the current catalog and terms.' },
  ],
};

export const businessDemoBuild: BuildStory = {
  service: 'Custom React applications & operational dashboard development',
  summary: 'The three concept applications below are implemented in the public site. They demonstrate frontend behavior with fictional records and rates.',
  stack: [{ label: 'Public concept demos', tools: ['React', 'TypeScript', 'Vite', 'CSS', 'Native HTML controls'] }],
  steps: [
    { title: 'Components organized around an operator task', detail: 'Separate React views handle production, estimating, and reporting. Search, status, and due-date filters derive the visible job list from the same local records used by the job-detail panel.' },
    { title: 'Transparent calculations and reporting', detail: 'Editable quantity, materials, setup, and production time recalculate the sample estimate and its breakdown. Reporting totals and daily details derive from one selected dataset; native meter elements show completion against fictional capacity.' },
    { title: 'Useful states before a live integration', detail: 'Loading, connection-error, retry, empty-result, and reset controls demonstrate how a workflow could behave. These demos use local React state. A customer API integration, database, or ERP connection would be scoped and verified separately.' },
  ],
};

export const intelligentBuilds: Record<string, BuildStory> = {
  Wellway: {
    service: 'React web application development & interactive data visualization',
    summary: 'A separate member-and-advisor demonstration with editable fictional records, a journey chart, and browser-local workspace storage.',
    stack: [{ label: 'Demo application', tools: ['React', 'TypeScript', 'Vite', 'SVG charts', 'Browser localStorage'] }],
    steps: [
      { title: 'Views backed by a shared typed workspace', detail: 'React components organize check-ins, plans, reflection notes, and the advisor view. TypeScript data definitions keep the fictional workspace consistent as records change.' },
      { title: 'Interactive SVG charts and local persistence', detail: 'SVG renders the journey chart and selected data points. Browser localStorage saves the demo workspace; validated backup import, export, and recovery handling support reopening without silently discarding a damaged save.' },
      { title: 'Optional assistance with a visible fallback', detail: 'The interface checks assistance availability and keeps local prompts usable when the hosted service is unavailable. The public scenario demonstrates reflection and application design using fictional people and records.' },
    ],
  },
  'Ask Eidos': {
    service: 'AI assistant development & published-source retrieval',
    summary: 'A React chat interface backed by a Cloudflare Pages Function, with published-source answers and a separately requested optional AI follow-up.',
    stack: [{ label: 'Implemented source', tools: ['React', 'TypeScript', 'Cloudflare Pages Functions', 'OpenAI Responses API (optional)'] }],
    steps: [
      { title: 'Source selection and answer links', detail: 'The default server path selects from approved published studio information and returns an answer with source links. The source-answer exercise on this page uses three fixed public examples without a model request.' },
      { title: 'A separate server-side AI integration', detail: 'An explicitly requested enhanced answer can use the OpenAI Responses API when provider bindings and feature flags are configured. Request validation, rate limits, and a daily token budget are implemented server-side.' },
      { title: 'A bounded assistant, with fallback behavior', detail: 'Questions remain in the current tab. Source-based answers remain available when enhanced assistance is disabled or unavailable. Source inspection establishes the implementation; it does not verify the current production model or provider settings.' },
    ],
  },
};
