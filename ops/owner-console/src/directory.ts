// Navigation only. Provider health is reported separately by the source registry.
// Do not put private Drive IDs, customer data, or credentials in this public repo.
export type Entry = {
  group: string; task: string; destination: string; url: string; note: string;
  view?: 'accounts' | 'agents' | 'artifacts' | 'inquiries' | 'payments' | 'releases' | 'services' | 'work';
  state: 'public' | 'preview' | 'external' | 'setup';
};

export const directory: Entry[] = [
  {group:'Daily operations',task:'Open the studio',destination:'Eidos Works',url:'https://eidos-works.com/',note:'Public customer-facing site and portfolio.',state:'public'},
  {group:'Daily operations',task:'Run owner operations',destination:'Owner console preview',url:'https://owner-preview.eidos-works.com/',note:'Access-protected preview on validation data. Production control.eidos-works.com is not released.',view:'work',state:'preview'},
  {group:'Daily operations',task:'Track leads, projects, invoices and support',destination:'Business Operations folder',url:'https://drive.google.com/drive/u/0/my-drive',note:'Find the private Eidos Works Business Operations folder and Business Pipeline workbook. The console has no Drive read integration.',view:'work',state:'external'},
  {group:'Daily operations',task:'Review customer inquiries',destination:'Studio Gmail inbox',url:'https://mail.google.com/mail/u/0/#all',note:'Confirm actual receipt, then record follow-up in the pipeline. The console does not read the inbox.',view:'inquiries',state:'external'},

  {group:'Email and outreach',task:'Manage incoming addresses and forwarding',destination:'Cloudflare Email Routing',url:'https://dash.cloudflare.com/',note:'Domain → Email Routing. Documented aliases: hello, projects, snapshot, billing and bmp. Check live routes and destination.',view:'inquiries',state:'external'},
  {group:'Email and outreach',task:'Review account and article mail delivery',destination:'Resend',url:'https://resend.com/emails',note:'Verified studio sender handles member and digest mail. This is not a campaign composer inside the console.',state:'external'},
  {group:'Email and outreach',task:'Draft individual outreach',destination:'Gmail drafts',url:'https://mail.google.com/mail/u/0/#drafts',note:'Connected Gmail is Brent’s personal address. Branded outreach sender and campaign workflow still need verification.',view:'inquiries',state:'setup'},
  {group:'Email and outreach',task:'Manage prospect stages and follow-ups',destination:'Business Pipeline workbook',url:'https://drive.google.com/drive/u/0/my-drive',note:'Use Leads and Dashboard in the private workbook; console work items are a separate source.',view:'work',state:'external'},

  {group:'Pages and publishing',task:'Read published articles',destination:'Insights',url:'https://eidos-works.com/insights/',note:'Public blog index and article pages.',state:'public'},
  {group:'Pages and publishing',task:'Write or correct an article',destination:'Article source',url:'https://github.com/bmparent/brent-parent-intelligence-studio/blob/main/src/data/articles.json',note:'Canonical article records. Run checks and the release process; no CMS editor exists in this console.',view:'releases',state:'external'},
  {group:'Pages and publishing',task:'Edit pages and service copy',destination:'Site repository',url:'https://github.com/bmparent/brent-parent-intelligence-studio',note:'React routes, components and src/data/pages.ts. Change in a branch and review the release.',view:'releases',state:'external'},
  {group:'Pages and publishing',task:'Follow the publishing procedure',destination:'Insights automation guide',url:'https://github.com/bmparent/brent-parent-intelligence-studio/blob/main/docs/insights-automation.md',note:'Validation, scheduled slots, corrections and verified Cloudflare deployment.',state:'external'},
  {group:'Pages and publishing',task:'Check page deployments and DNS',destination:'Cloudflare dashboard',url:'https://dash.cloudflare.com/',note:'Public Pages project: eidosworks. Keep preview and production separate.',view:'releases',state:'external'},
  {group:'Pages and publishing',task:'Manage site photography',destination:'Cloudinary',url:'https://console.cloudinary.com/',note:'Media delivery; this console has no asset management connector.',state:'external'},

  {group:'Analytics and growth',task:'View visits and conversions',destination:'Google Analytics 4',url:'https://analytics.google.com/',note:'Consent-gated public events; console GA4 read access is disconnected.',view:'services',state:'external'},
  {group:'Analytics and growth',task:'View indexing and search queries',destination:'Search Console',url:'https://search.google.com/search-console/',note:'Select the eidos-works.com property if available to your Google login. No console connector.',state:'external'},
  {group:'Analytics and growth',task:'Read first-party growth reports',destination:'Growth source',url:'https://github.com/bmparent/brent-parent-intelligence-studio/tree/main/docs/growth',note:'First-party outcomes and campaign documentation are separate from GA4.',state:'external'},
  {group:'Analytics and growth',task:'Inspect builds and scheduled publishing',destination:'GitHub Actions',url:'https://github.com/bmparent/brent-parent-intelligence-studio/actions',note:'Console reads a bounded subset of public PR and workflow status.',view:'releases',state:'external'},
  {group:'Analytics and growth',task:'Inspect internal growth agents',destination:'Owner console Agents',url:'https://owner-preview.eidos-works.com/',note:'Draft roles have a $0 cash ceiling. Agent runs and CRM sync are disconnected.',view:'agents',state:'preview'},

  {group:'Products and customers',task:'Inspect member accounts',destination:'Owner console Accounts',url:'https://owner-preview.eidos-works.com/',note:'Validation members only; controlled account actions are audited.',view:'accounts',state:'preview'},
  {group:'Products and customers',task:'Use the website builder',destination:'Playground',url:'https://eidos-works.com/playground/',note:'Improved drag/drop and starter-pack handoff are draft candidate work.',state:'public'},
  {group:'Products and customers',task:'Review kit orders and TEST provider state',destination:'Owner console Payments',url:'https://owner-preview.eidos-works.com/',note:'Read-only Stripe TEST reconciliation; no LIVE charge or refund control.',view:'payments',state:'preview'},
  {group:'Products and customers',task:'See the starter kit offer',destination:'Starter kit',url:'https://eidos-works.com/shop/cinematic-starter/',note:'Public offer. Stripe is authoritative for provider transactions.',state:'public'},
  {group:'Products and customers',task:'Review Snapshot',destination:'Snapshot page',url:'https://eidos-works.com/snapshot/',note:'Capture and generation remain disabled pending release gates.',state:'setup'},
  {group:'Products and customers',task:'See examples and demos',destination:'Selected work',url:'https://eidos-works.com/work/',note:'Public storefront and business-system examples; private client originals stay private.',state:'public'},
  {group:'Products and customers',task:'Manage standalone portfolio apps',destination:'ChatGPT Sites',url:'https://chatgpt.com/',note:'Open Sites from the ChatGPT sidebar to manage the published gallery apps. Site gallery metadata lives in src/data/siteGallery.json.',state:'external'},
  {group:'Products and customers',task:'Work on client storefronts',destination:'InkSoft',url:'https://www.inksoft.com/',note:'Separate client commerce platform. Public Eidos gallery examples are references, not the client store admin.',state:'external'},
  {group:'Products and customers',task:'Open the Wellway demo',destination:'Wellway showcase',url:'https://eidos-works.com/demos/wellway/',note:'Fictional wellness demonstration with separate source and AI Worker boundaries.',state:'public'},
  {group:'Products and customers',task:'Review Eidos research',destination:'Sentinel Lab',url:'https://eidos-works.com/lab/',note:'Related research area with its own experimental boundaries.',state:'public'},

  {group:'Infrastructure and security',task:'Inspect Works API deployments',destination:'Vercel dashboard',url:'https://vercel.com/dashboard',note:'eidos-sentinel-lab hosts the Works backend. Console probes URL availability, not Vercel provider logs.',view:'services',state:'external'},
  {group:'Infrastructure and security',task:'Inspect Works data',destination:'Turso dashboard',url:'https://dashboard.turso.tech/',note:'Production and validation databases are separate. Console only exposes bounded authorized Works records.',view:'services',state:'external'},
  {group:'Infrastructure and security',task:'Manage access, WAF and Turnstile',destination:'Cloudflare dashboard',url:'https://dash.cloudflare.com/',note:'Exact-host Access protects the preview. Security events and provider logs are not synced.',view:'services',state:'external'},
  {group:'Infrastructure and security',task:'Review Google sign-in configuration',destination:'Google Cloud credentials',url:'https://console.cloud.google.com/apis/credentials',note:'OAuth client and preview callback. Personal consent acceptance is open.',state:'external'},
  {group:'Infrastructure and security',task:'Review payment provider',destination:'Stripe dashboard',url:'https://dashboard.stripe.com/',note:'Choose TEST or LIVE explicitly. Owner console reconciliation is TEST only.',view:'payments',state:'external'},
  {group:'Infrastructure and security',task:'Review AI API usage',destination:'OpenAI usage',url:'https://platform.openai.com/usage',note:'Select the correct project. Provider spend is not connected to the owner console.',state:'external'},
  {group:'Infrastructure and security',task:'Inspect backend source',destination:'Eidos repository',url:'https://github.com/bmparent/eidos',note:'Works handlers run in Sentinel Lab; Eidos Brain research is a separate boundary.',view:'releases',state:'external'},
];
