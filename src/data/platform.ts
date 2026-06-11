export const siteConfig = {
  name: 'Eidos Works',
  legalName: 'Brent Parent Intelligence Studio',
  tagline: 'Current intelligence for better websites, AI-search visibility, and small-business automation.',
  url: 'https://brent-parent-intelligence-studio.pages.dev',
  author: 'Brent Parent',
  email: '1brent.bm@gmail.com',
  updated: '2026-06-11',
  image: '/social-preview.svg'
} as const;

export type Relationship = 'standard' | 'affiliate' | 'sponsored';

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  section: string;
  lastmod: string;
  priority: number;
  changefreq: 'weekly' | 'monthly';
};

export type ArticleSection = {
  heading: string;
  body: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  example?: string;
};

export type SourceLink = {
  label: string;
  url: string;
};

export type Article = {
  slug: string;
  path: string;
  title: string;
  dek: string;
  updated: string;
  author: string;
  category: 'UI/UX' | 'Agentic SEO' | 'Automation';
  takeaways: string[];
  sections: ArticleSection[];
  sources: SourceLink[];
  related: string[];
};

export const navItems = [
  { href: '/', label: 'Home' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/ui-ux', label: 'UI/UX' },
  { href: '/agentic-seo', label: 'Agentic SEO' },
  { href: '/automation', label: 'Automation' },
  { href: '/tools', label: 'Tools' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/work-with-eidos', label: 'Work With Eidos' }
] as const;

export const articles: Article[] = [
  {
    slug: 'ui-ux-standards-2026',
    path: '/intelligence/ui-ux-standards-2026',
    title: 'Current UI/UX Web Design Standards in 2026',
    dek:
      'The modern website is no longer judged only by taste. It has to be accessible, fast, structured, component-driven, and legible to humans, crawlers, and AI-assisted search systems.',
    updated: '2026-06-11',
    author: siteConfig.author,
    category: 'UI/UX',
    takeaways: [
      'Accessibility is a product standard, not a final QA pass.',
      'Tokenized design systems keep AI-assisted interface work coherent.',
      'Semantic HTML and strong content structure now support UX, SEO, and AI-search visibility together.',
      'Performance work should prioritize real responsiveness, not only visual polish.'
    ],
    sections: [
      {
        heading: 'The baseline has moved from beautiful screens to reliable systems',
        body: [
          'In 2026, a serious web interface has to do more than look current. It needs an understandable content model, resilient components, visible states, reduced-motion support, and fast interaction on mobile hardware.',
          'That does not make design less creative. It makes design more accountable. The best sites still have a point of view, but the point of view is carried by layout, hierarchy, copy, interaction details, and technical restraint.'
        ]
      },
      {
        heading: 'Accessibility is the first design constraint',
        body: [
          'High contrast, keyboard-visible focus, semantic controls, clear labels, and predictable motion are now table stakes. A premium interface should not ask users to trade comprehension for atmosphere.',
          'Glass effects, low-contrast labels, scroll tricks, and custom controls can still be used, but only when the readable path remains obvious.'
        ],
        bullets: [
          'Use real buttons for actions and real links for navigation.',
          'Keep focus states visible against the actual component background.',
          'Design mobile touch targets before decorative effects.',
          'Treat prefers-reduced-motion as a core experience state.'
        ]
      },
      {
        heading: 'Design tokens are the operating system for taste',
        body: [
          'Tokens turn taste into an enforceable system. Color, spacing, radii, type scale, shadows, and motion values should be named, constrained, and shared across components.',
          'This matters more as AI-assisted tools generate more interface options. Without tokens, generated variations drift. With tokens, the team can explore while the product still feels governed.'
        ],
        table: {
          headers: ['Layer', 'What to standardize', 'Why it matters'],
          rows: [
            ['Color', 'Accessible palettes, state colors, disclosure colors', 'Prevents pretty but unreadable UI'],
            ['Spacing', 'Section rhythm, component padding, grid gaps', 'Keeps dense pages scannable'],
            ['Components', 'Navigation, cards, forms, tables, CTAs', 'Makes the system reusable and testable'],
            ['Content', 'Headings, summaries, dates, authors, source links', 'Improves trust and indexability']
          ]
        }
      },
      {
        heading: 'AI/search readiness starts with boring markup',
        body: [
          'AI-assisted search still needs crawlable pages, useful copy, canonical URLs, and clear source structure. If the public page is a client-only shell with weak headings, it is harder for search systems and answer engines to understand.',
          'The practical move is simple: render meaningful HTML, use route-level metadata, add structured data where appropriate, and make internal links describe the editorial map.'
        ]
      },
      {
        heading: 'A 2026 UI/UX checklist',
        body: ['Use this as a baseline before adding visual flourish.'],
        bullets: [
          'Every page has one clear H1 and useful H2 sections.',
          'Navigation works by keyboard and does not hide critical paths.',
          'Forms have persistent labels, useful errors, and clear confirmations.',
          'Primary content loads as HTML and remains useful without decorative scripts.',
          'Core Web Vitals are treated as UX signals, especially interaction responsiveness.'
        ]
      }
    ],
    sources: [
      { label: 'W3C WCAG 2.2', url: 'https://www.w3.org/TR/WCAG22/' },
      { label: 'W3C WCAG 2.2 Quick Reference', url: 'https://www.w3.org/WAI/WCAG22/quickref/' },
      { label: 'web.dev Core Web Vitals', url: 'https://web.dev/articles/vitals' },
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' }
    ],
    related: ['glassmorphism-accessibility', 'design-systems', 'seo-for-ai-browsers']
  },
  {
    slug: 'agentic-seo-guide',
    path: '/intelligence/agentic-seo-guide',
    title: 'Agentic SEO: How to Build Websites for AI Search and Answer Engines',
    dek:
      'Agentic SEO is not a magic replacement for search fundamentals. It is the discipline of making useful, crawlable, well-structured websites easier for search systems, AI answer engines, and web agents to understand and cite.',
    updated: '2026-06-11',
    author: siteConfig.author,
    category: 'Agentic SEO',
    takeaways: [
      'AI search still depends on crawlable, indexable, useful public pages.',
      'Entity clarity, structured data, source links, and canonical URLs matter more when answers are synthesized.',
      'Robots policy should separate search visibility from model-training preferences where possible.',
      'Agent-friendly UX means stable labels, semantic forms, and clear confirmations.'
    ],
    sections: [
      {
        heading: 'Agentic SEO starts with normal SEO',
        body: [
          'The phrase is new, but the foundation is not. Search systems still need to discover pages, understand titles and headings, crawl links, index useful content, and decide whether the page deserves to be shown.',
          'The agentic layer adds new pressure: pages should make it easy for AI systems to identify the entity, quote the right answer, follow task flows, and understand what should or should not be crawled.'
        ]
      },
      {
        heading: 'What changes for AI search',
        body: [
          'The site is no longer only competing for a blue link. It may be summarized, cited, compared, or used as a source inside a generated answer. That makes clarity and evidence more valuable than volume.',
          'Strong pages answer one topic deeply, show when they were updated, identify the author or organization, link to primary sources, and avoid unsupported certainty.'
        ],
        table: {
          headers: ['Traditional SEO need', 'Agentic SEO extension'],
          rows: [
            ['Crawlable pages', 'Meaningful HTML that agents can parse without guessing'],
            ['Metadata', 'Canonical, updated date, author, and entity clarity'],
            ['Internal links', 'Topic clusters that reveal expertise and next steps'],
            ['Structured data', 'Article, Organization, WebSite, and BreadcrumbList where relevant'],
            ['Content quality', 'Practical examples, source links, and plain caveats']
          ]
        }
      },
      {
        heading: 'Robots policy is a strategy choice',
        body: [
          'If a site wants visibility in AI search, it should not accidentally block the crawlers that support search experiences. At the same time, a publisher may choose different rules for model-training crawlers.',
          'The policy should be written intentionally, documented in plain language, and tested after deployment. Robots.txt is a crawler instruction, not a privacy or security control.'
        ]
      },
      {
        heading: 'Agent-friendly UX is just good UX with less ambiguity',
        body: [
          'Web agents and assistive technologies both benefit from stable labels, semantic forms, visible states, predictable navigation, and confirmation messages. A form labeled "Submit" gives less context than "Request an automation audit."',
          'The more important a task is, the less the page should depend on hidden hover states, unlabeled icons, or visually clever but structurally vague components.'
        ],
        bullets: [
          'Use descriptive labels and accessible names.',
          'Keep public resource pages server-rendered or statically rendered.',
          'Make article summaries, takeaways, dates, and sources machine-readable in the HTML.',
          'Create entity pages for services, tools, people, and organizations when they matter.'
        ]
      }
    ],
    sources: [
      { label: 'Google AI Optimization Guide', url: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide' },
      { label: 'Google AI Features and Your Website', url: 'https://developers.google.com/search/docs/appearance/ai-features' },
      { label: 'Bing Webmaster Guidelines', url: 'https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a' },
      { label: 'OpenAI Crawler Documentation', url: 'https://developers.openai.com/api/docs/bots' }
    ],
    related: ['ai-search-visibility', 'seo-for-ai-browsers', 'ui-ux-standards-2026']
  },
  {
    slug: 'ai-search-visibility',
    path: '/intelligence/ai-search-visibility',
    title: 'AI Search Visibility Checklist for Modern Websites',
    dek:
      'A practical checklist for making a modern website easier to discover, understand, cite, and measure across search engines and AI-assisted answer surfaces.',
    updated: '2026-06-11',
    author: siteConfig.author,
    category: 'Agentic SEO',
    takeaways: [
      'Use Search Console, Bing Webmaster Tools, sitemaps, and logs before guessing.',
      'Visibility work needs entity clarity, canonical hygiene, and source-worthy content.',
      'AI crawler policy should be explicit, not inherited by accident.',
      'Measure missing evidence separately from poor performance.'
    ],
    sections: [
      {
        heading: 'Start with visibility receipts',
        body: [
          'AI-search work gets vague quickly when there are no receipts. Before changing copy, confirm the page can be crawled, indexed, discovered in a sitemap, and understood as the canonical version.',
          'Use Search Console and Bing Webmaster Tools for coverage signals, then use server or CDN logs to understand which crawlers are actually reaching the site.'
        ]
      },
      {
        heading: 'Technical checklist',
        body: ['The first pass should be boring and measurable.'],
        bullets: [
          'Submit XML sitemap and reference it in robots.txt.',
          'Confirm canonical URLs resolve to the preferred HTTPS route.',
          'Check that public pages do not depend on blocked CSS, JavaScript, or client-only rendering.',
          'Add Article JSON-LD to articles and Organization/WebSite JSON-LD to the site.',
          'Keep dates, authors, summaries, and source links visible in the HTML.'
        ]
      },
      {
        heading: 'Content checklist',
        body: [
          'Answer engines reward content that can be confidently summarized. A page should say what it is, who wrote it, what changed, what evidence it depends on, and what practical action a reader can take.',
          'Thin posts, vague trend lists, and unsupported predictions are weaker than focused guides with implementation examples.'
        ],
        table: {
          headers: ['Signal', 'Strong implementation'],
          rows: [
            ['Author/entity', 'Named author, organization context, contact path'],
            ['Freshness', 'Visible updated date and sitemap lastmod'],
            ['Citations', 'Primary source links in a source section'],
            ['Structure', 'H1, summary, takeaways, TOC, H2/H3 sections'],
            ['Internal links', 'Related articles, tools, and service paths']
          ]
        }
      },
      {
        heading: 'What remains uncertain',
        body: [
          'No checklist can guarantee AI citation visibility. Search systems change, sources are selected dynamically, and some answer surfaces compress traffic while increasing brand exposure.',
          'The honest goal is to improve eligibility, clarity, and measurement. Claims beyond that need evidence from real queries, logs, referrals, and citation tracking.'
        ]
      }
    ],
    sources: [
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'Google Structured Data Intro', url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data' },
      { label: 'Bing IndexNow', url: 'https://www.bing.com/indexnow' },
      { label: 'Schema.org Article', url: 'https://schema.org/Article' }
    ],
    related: ['agentic-seo-guide', 'seo-for-ai-browsers', 'design-systems']
  },
  {
    slug: 'design-systems',
    path: '/intelligence/design-systems',
    title: 'Why Design Systems Matter More in the AI Design Era',
    dek:
      'AI can generate more interface options than a team can review. Design systems decide which options are coherent, accessible, reusable, and safe to ship.',
    updated: '2026-06-11',
    author: siteConfig.author,
    category: 'UI/UX',
    takeaways: [
      'AI expands exploration, but a system still governs quality.',
      'Tokens, components, and accessibility rules keep output from drifting.',
      'A useful system includes QA standards, not only visual assets.',
      'The smallest good system is better than a large ungoverned library.'
    ],
    sections: [
      {
        heading: 'AI makes the system more important, not less',
        body: [
          'When a tool can produce ten plausible screens in a minute, the differentiator is not raw option count. It is judgment: which components belong, which states are missing, which copy is unclear, and which pattern will survive production.',
          'A design system gives that judgment a shape. It creates a shared language for what the product should feel like after the novelty of a generated mockup wears off.'
        ]
      },
      {
        heading: 'The minimum viable design system',
        body: ['A practical small-business system can be compact. It does not need a giant internal portal to be useful.'],
        bullets: [
          'Design tokens for color, type, spacing, radii, and motion.',
          'Reusable components for navigation, cards, forms, tables, CTAs, and disclosures.',
          'Content rules for headings, summaries, error text, and confirmation states.',
          'Accessibility checks for focus, contrast, labels, and keyboard flows.',
          'A QA checklist for mobile, performance, and reduced motion.'
        ]
      },
      {
        heading: 'Govern the places AI tends to drift',
        body: [
          'AI-generated UI often drifts at the edges: inconsistent spacing, nearly-but-not-quite matching colors, unclear disabled states, repeated copy, and ornamental components that do not map to real user needs.',
          'The system should make these failures visible. Tokens and components are not bureaucracy; they are a way to keep a fast creative workflow from becoming expensive cleanup.'
        ],
        table: {
          headers: ['Drift risk', 'System guardrail'],
          rows: [
            ['Color variations', 'Named semantic color tokens'],
            ['Inconsistent cards', 'One card API with size and density variants'],
            ['Form confusion', 'Required label, help, error, and success states'],
            ['Motion overload', 'Reduced-motion behavior documented per component']
          ]
        }
      }
    ],
    sources: [
      { label: 'W3C WCAG 2.2 Quick Reference', url: 'https://www.w3.org/WAI/WCAG22/quickref/' },
      { label: 'web.dev Core Web Vitals', url: 'https://web.dev/articles/vitals' },
      { label: 'Google Structured Data Gallery', url: 'https://developers.google.com/search/docs/appearance/structured-data/search-gallery' }
    ],
    related: ['ui-ux-standards-2026', 'glassmorphism-accessibility', 'seo-for-ai-browsers']
  },
  {
    slug: 'glassmorphism-accessibility',
    path: '/intelligence/glassmorphism-accessibility',
    title: 'Glassmorphism Without the Accessibility Problems',
    dek:
      'Glass effects can still feel premium when they are used as accents, not as an excuse for low contrast, hidden borders, and unreadable interface copy.',
    updated: '2026-06-11',
    author: siteConfig.author,
    category: 'UI/UX',
    takeaways: [
      'Use glass as a layer, not as the entire readability system.',
      'Contrast and focus states must be tested against the real background.',
      'Motion and blur should respect reduced-motion preferences.',
      'Readable content should survive if backdrop-filter is unavailable.'
    ],
    sections: [
      {
        heading: 'The problem is not glass. The problem is weak contrast.',
        body: [
          'Glassmorphism fails when translucent panels sit on busy backgrounds and designers rely on blur to create legibility. Blur helps, but it does not replace contrast, borders, spacing, and responsible content hierarchy.',
          'Use glass for depth around cards, sidebars, and command surfaces. Keep the actual text path calm, high contrast, and predictable.'
        ]
      },
      {
        heading: 'A practical glass rule set',
        body: ['The safest glass systems start with fallback-first design.'],
        bullets: [
          'Give panels a real background color before adding backdrop-filter.',
          'Use borders or inner highlights to separate panel edges.',
          'Avoid small low-contrast text inside translucent surfaces.',
          'Test focus rings on top of the busiest possible background.',
          'Disable or simplify heavy blur and motion for reduced-motion users.'
        ]
      },
      {
        heading: 'Implementation pattern',
        body: [
          'The goal is a panel that still reads if browser support, performance, or user settings reduce the effect.'
        ],
        example:
          '.glass-panel {\n  background: rgba(8, 18, 32, 0.82);\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  backdrop-filter: blur(18px);\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .glass-panel { backdrop-filter: none; }\n}'
      }
    ],
    sources: [
      { label: 'W3C WCAG 2.2', url: 'https://www.w3.org/TR/WCAG22/' },
      { label: 'W3C Focus Appearance Understanding', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html' },
      { label: 'web.dev Interaction to Next Paint', url: 'https://web.dev/articles/inp' }
    ],
    related: ['ui-ux-standards-2026', 'design-systems', 'seo-for-ai-browsers']
  },
  {
    slug: 'seo-for-ai-browsers',
    path: '/intelligence/seo-for-ai-browsers',
    title: 'UX for AI Browsers and Web Agents',
    dek:
      'The same interface details that help people complete tasks also help AI browsers and web agents understand what the page offers and what action is safe to take.',
    updated: '2026-06-11',
    author: siteConfig.author,
    category: 'Agentic SEO',
    takeaways: [
      'Use semantic forms, stable labels, and visible confirmations.',
      'Avoid hiding critical actions behind decorative-only controls.',
      'Make public pages crawlable and private tasks explicitly gated.',
      'Design task flows so a user can verify what an agent is about to do.'
    ],
    sections: [
      {
        heading: 'Agents need explicit interfaces',
        body: [
          'A web agent can only act reliably when the page exposes meaningful structure. Buttons need names, forms need labels, navigation needs stable destinations, and confirmations need to say what changed.',
          'This is not only for agents. It makes the site easier for keyboard users, screen readers, crawlers, QA testers, and humans in a hurry.'
        ]
      },
      {
        heading: 'Task-oriented UX standards',
        body: ['Agent-ready flows should be conservative around important actions.'],
        bullets: [
          'Name forms by their real purpose, such as "Request an audit" instead of "Submit."',
          'Keep destructive or paid actions behind clear confirmation states.',
          'Use status messages that are visible in the DOM, not only toast animations.',
          'Avoid changing labels or control positions after the user starts the task.',
          'Separate public content routes from authenticated operational routes.'
        ]
      },
      {
        heading: 'SEO and agent UX overlap',
        body: [
          'An article with a clear title, summary, source links, updated date, and structured data is easier to cite. A tool with labeled inputs, output text, and stable controls is easier to use. The same discipline improves both discovery and task completion.'
        ],
        table: {
          headers: ['Interface detail', 'Human benefit', 'Agent/search benefit'],
          rows: [
            ['Semantic headings', 'Faster scanning', 'Topic segmentation'],
            ['Labeled form controls', 'Fewer errors', 'Action understanding'],
            ['Visible output summaries', 'Clear result comprehension', 'Extractable page state'],
            ['Canonical URLs', 'Less confusion', 'Cleaner citation target']
          ]
        }
      }
    ],
    sources: [
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'Schema.org BreadcrumbList', url: 'https://schema.org/BreadcrumbList' },
      { label: 'OpenAI Crawler Documentation', url: 'https://developers.openai.com/api/docs/bots' },
      { label: 'W3C WCAG 2.2 Quick Reference', url: 'https://www.w3.org/WAI/WCAG22/quickref/' }
    ],
    related: ['agentic-seo-guide', 'ai-search-visibility', 'ui-ux-standards-2026']
  }
];

export const sponsors = [
  {
    id: 'placeholder-design-tool',
    label: 'Sponsored',
    name: 'Partner resource',
    description: 'A relevant design, SEO, or automation resource can appear here once a real partner is approved.',
    url: '',
    image: '',
    active: false
  }
] as const;

export const recommendedTools = [
  {
    id: 'figma',
    category: 'Design tools',
    name: 'Figma',
    description: 'Collaborative design, prototyping, and design-system documentation.',
    url: 'https://www.figma.com/',
    relationship: 'standard' as Relationship
  },
  {
    id: 'webflow',
    category: 'Hosting / frontend platforms',
    name: 'Webflow',
    description: 'Visual web production for teams that need controlled marketing-page workflows.',
    url: 'https://webflow.com/',
    relationship: 'standard' as Relationship
  },
  {
    id: 'vercel',
    category: 'Hosting / frontend platforms',
    name: 'Vercel',
    description: 'Frontend deployment platform for modern React and Next.js applications.',
    url: 'https://vercel.com/',
    relationship: 'standard' as Relationship
  },
  {
    id: 'cloudflare',
    category: 'Hosting / frontend platforms',
    name: 'Cloudflare Pages',
    description: 'Static and edge deployment with Workers support for lightweight product surfaces.',
    url: 'https://pages.cloudflare.com/',
    relationship: 'standard' as Relationship
  },
  {
    id: 'google-search-console',
    category: 'SEO / AI visibility tools',
    name: 'Google Search Console',
    description: 'Coverage, indexing, sitemap, and search-performance diagnostics.',
    url: 'https://search.google.com/search-console/about',
    relationship: 'standard' as Relationship
  },
  {
    id: 'bing-webmaster-tools',
    category: 'SEO / AI visibility tools',
    name: 'Bing Webmaster Tools',
    description: 'Bing indexing, sitemap, and search diagnostics with IndexNow support.',
    url: 'https://www.bing.com/webmasters/about',
    relationship: 'standard' as Relationship
  },
  {
    id: 'plausible',
    category: 'Analytics tools',
    name: 'Plausible',
    description: 'Lightweight privacy-conscious analytics option for future measurement.',
    url: 'https://plausible.io/',
    relationship: 'standard' as Relationship
  },
  {
    id: 'zapier',
    category: 'Automation tools',
    name: 'Zapier',
    description: 'Workflow automation across common small-business tools.',
    url: 'https://zapier.com/',
    relationship: 'standard' as Relationship
  },
  {
    id: 'make',
    category: 'Automation tools',
    name: 'Make',
    description: 'Scenario-based automation for operational workflows and data movement.',
    url: 'https://www.make.com/',
    relationship: 'standard' as Relationship
  },
  {
    id: 'wave',
    category: 'Accessibility tools',
    name: 'WAVE',
    description: 'Accessibility evaluation for finding contrast, label, and semantic issues.',
    url: 'https://wave.webaim.org/',
    relationship: 'standard' as Relationship
  }
] as const;

export const resourceDownloads = [
  {
    id: 'agentic-seo-readiness-checklist',
    title: 'Agentic SEO Readiness Checklist',
    description: 'A practical checklist for crawlability, metadata, schema, source links, and AI crawler policy.',
    status: 'PDF placeholder pending final partner-free asset'
  },
  {
    id: 'ui-ux-site-audit-checklist',
    title: 'UI/UX Site Audit Checklist',
    description: 'A site review checklist for hierarchy, contrast, form semantics, performance, and trust signals.',
    status: 'PDF placeholder pending final design asset'
  },
  {
    id: 'small-business-automation-scorecard',
    title: 'Small Business Automation Scorecard',
    description: 'A scorecard for manual entry, missed follow-up, disconnected tools, reporting gaps, and owner time.',
    status: 'PDF placeholder pending final worksheet'
  },
  {
    id: 'ai-search-visibility-setup-guide',
    title: 'AI Search Visibility Setup Guide',
    description: 'A setup guide for Search Console, Bing Webmaster Tools, sitemap, robots, and citation tracking.',
    status: 'PDF placeholder pending final source review'
  },
  {
    id: 'design-system-starter-checklist',
    title: 'Design System Starter Checklist',
    description: 'A compact starter for tokens, components, accessibility states, and QA rules.',
    status: 'PDF placeholder pending final template'
  }
] as const;

export const automationQuestions = [
  { id: 'manualDataEntry', label: 'Manual data entry happens every week', weight: 16, recommendation: 'Automate repeated data movement before redesigning the whole process.' },
  { id: 'missedLeadResponse', label: 'Leads wait too long for a first response', weight: 16, recommendation: 'Create a lead intake and follow-up sequence with owner-visible status.' },
  { id: 'disconnectedTools', label: 'Important tools do not share clean data', weight: 15, recommendation: 'Map the handoffs between tools and standardize the fields that travel between them.' },
  { id: 'billingFollowUp', label: 'Billing or payment follow-up is manual', weight: 13, recommendation: 'Add reminders, status views, and exception handling around billing follow-up.' },
  { id: 'reviewReferralFollowUp', label: 'Reviews or referrals are not requested consistently', weight: 12, recommendation: 'Trigger review and referral requests after successful delivery events.' },
  { id: 'reportingVisibility', label: 'Reporting takes too long to assemble', weight: 14, recommendation: 'Build a small operating dashboard before adding more spreadsheets.' },
  { id: 'ownerTasks', label: 'The owner repeats low-value tasks daily', weight: 14, recommendation: 'Start with an owner-time audit and remove the highest-frequency repeat task.' }
] as const;

export const seoQuestions = [
  { id: 'crawlability', label: 'Important pages can be crawled without login or blocked assets' },
  { id: 'indexability', label: 'Pages avoid accidental noindex and have useful status codes' },
  { id: 'sitemapRobots', label: 'Sitemap and robots.txt are current and discoverable' },
  { id: 'canonicals', label: 'Canonical URLs point to the preferred public route' },
  { id: 'structuredData', label: 'Article, Organization, WebSite, and breadcrumb schema exist where relevant' },
  { id: 'authorEntity', label: 'Author, organization, and entity context are clear' },
  { id: 'articleStructure', label: 'Articles include summary, updated date, takeaways, headings, and sources' },
  { id: 'aiCrawlerPolicy', label: 'AI crawler/search policy is intentional and documented' },
  { id: 'performance', label: 'Mobile performance and interaction responsiveness are actively monitored' },
  { id: 'accessibility', label: 'Accessibility basics are checked before publishing' }
] as const;

export const uxQuestions = [
  { id: 'navigation', label: 'Navigation is clear, stable, and keyboard reachable' },
  { id: 'hierarchy', label: 'The page hierarchy makes the main offer obvious' },
  { id: 'contrast', label: 'Text, controls, and focus states have readable contrast' },
  { id: 'mobile', label: 'Mobile layout preserves content order and CTA clarity' },
  { id: 'ctaClarity', label: 'Primary and secondary CTAs are distinct' },
  { id: 'formSemantics', label: 'Forms use labels, helpful errors, and real submit states' },
  { id: 'performance', label: 'The page avoids heavy scripts and layout shift' },
  { id: 'reducedMotion', label: 'Motion respects reduced-motion preferences' },
  { id: 'accessibility', label: 'Interactive elements expose names and states' },
  { id: 'trustSignals', label: 'Proof, policies, source links, or contact paths are visible' },
  { id: 'monetization', label: 'Monetization is labeled and does not interrupt the task' }
] as const;

const staticRoutes: RouteMeta[] = [
  {
    path: '/',
    title: 'Eidos Works - Design, AI Search, and Automation Intelligence',
    description: siteConfig.tagline,
    section: 'Home',
    lastmod: siteConfig.updated,
    priority: 1,
    changefreq: 'weekly'
  },
  {
    path: '/intelligence',
    title: 'Intelligence Library - Eidos Works',
    description: 'Guides and practical judgment for UI/UX standards, AI search visibility, design systems, and automation.',
    section: 'Intelligence',
    lastmod: siteConfig.updated,
    priority: 0.9,
    changefreq: 'weekly'
  },
  {
    path: '/ui-ux',
    title: 'UI/UX Intelligence - Eidos Works',
    description: 'Current UI/UX guidance for accessible, component-driven, high-trust web experiences.',
    section: 'UI/UX',
    lastmod: siteConfig.updated,
    priority: 0.85,
    changefreq: 'weekly'
  },
  {
    path: '/agentic-seo',
    title: 'Agentic SEO and AI Search Visibility - Eidos Works',
    description: 'Practical guidance for crawlable, source-worthy websites built for modern search and AI answer engines.',
    section: 'Agentic SEO',
    lastmod: siteConfig.updated,
    priority: 0.85,
    changefreq: 'weekly'
  },
  {
    path: '/automation',
    title: 'Small-Business Automation Systems - Eidos Works',
    description: 'Automation examples and diagnostics for small teams dealing with repetitive owner tasks and disconnected tools.',
    section: 'Automation',
    lastmod: siteConfig.updated,
    priority: 0.8,
    changefreq: 'monthly'
  },
  {
    path: '/tools',
    title: 'Interactive Tools - Eidos Works',
    description: 'Client-side diagnostics for automation readiness, agentic SEO, and UI/UX site audits.',
    section: 'Tools',
    lastmod: siteConfig.updated,
    priority: 0.85,
    changefreq: 'weekly'
  },
  {
    path: '/tools/automation-score',
    title: 'Automation Score Calculator - Eidos Works',
    description: 'Score manual work, missed follow-up, disconnected tools, reporting gaps, and owner-task drag.',
    section: 'Tools',
    lastmod: siteConfig.updated,
    priority: 0.82,
    changefreq: 'monthly'
  },
  {
    path: '/tools/agentic-seo-readiness-checker',
    title: 'Agentic SEO Readiness Checker - Eidos Works',
    description: 'Check crawlability, indexability, structured data, article structure, accessibility, and AI crawler policy.',
    section: 'Tools',
    lastmod: siteConfig.updated,
    priority: 0.82,
    changefreq: 'monthly'
  },
  {
    path: '/tools/ui-ux-site-audit-checklist',
    title: 'UI/UX Site Audit Checklist - Eidos Works',
    description: 'Audit navigation clarity, hierarchy, contrast, mobile layout, form semantics, trust, and monetization restraint.',
    section: 'Tools',
    lastmod: siteConfig.updated,
    priority: 0.82,
    changefreq: 'monthly'
  },
  {
    path: '/newsletter',
    title: 'Newsletter - Eidos Works',
    description: 'Sign up for grounded notes on better websites, AI search visibility, and automation systems.',
    section: 'Newsletter',
    lastmod: siteConfig.updated,
    priority: 0.75,
    changefreq: 'monthly'
  },
  {
    path: '/resources',
    title: 'Resources - Eidos Works',
    description: 'Tool stacks, templates, checklists, and implementation resources for practical website and automation work.',
    section: 'Resources',
    lastmod: siteConfig.updated,
    priority: 0.75,
    changefreq: 'monthly'
  },
  {
    path: '/resources/tool-stack',
    title: 'Tool Stack - Eidos Works',
    description: 'Recommended design, SEO, analytics, automation, hosting, research, and accessibility tools.',
    section: 'Resources',
    lastmod: siteConfig.updated,
    priority: 0.72,
    changefreq: 'monthly'
  },
  {
    path: '/resources/templates',
    title: 'Templates and Checklists - Eidos Works',
    description: 'Downloadable resource placeholders for checklists, scorecards, and setup guides.',
    section: 'Resources',
    lastmod: siteConfig.updated,
    priority: 0.72,
    changefreq: 'monthly'
  },
  {
    path: '/resources/recommended-tools',
    title: 'Recommended Tools - Eidos Works',
    description: 'A central list of recommended tools with relationship labels and no fake affiliate links.',
    section: 'Resources',
    lastmod: siteConfig.updated,
    priority: 0.72,
    changefreq: 'monthly'
  },
  {
    path: '/sponsors',
    title: 'Sponsors - Eidos Works',
    description: 'Current sponsor policy and partner-resource surfaces for Eidos Works.',
    section: 'Sponsors',
    lastmod: siteConfig.updated,
    priority: 0.5,
    changefreq: 'monthly'
  },
  {
    path: '/advertise',
    title: 'Advertise with Eidos Works',
    description: 'Tasteful sponsorship opportunities for tools and teams serving founders, designers, developers, marketers, and operators.',
    section: 'Sponsors',
    lastmod: siteConfig.updated,
    priority: 0.5,
    changefreq: 'monthly'
  },
  {
    path: '/disclosures',
    title: 'Affiliate and Sponsorship Disclosures - Eidos Works',
    description: 'Plain-English disclosure policy for affiliate links, sponsored resources, and editorial independence.',
    section: 'Policy',
    lastmod: siteConfig.updated,
    priority: 0.45,
    changefreq: 'monthly'
  },
  {
    path: '/privacy',
    title: 'Privacy Policy - Eidos Works',
    description: 'Privacy notes for Eidos Works, including forms, analytics posture, and future provider configuration.',
    section: 'Policy',
    lastmod: siteConfig.updated,
    priority: 0.35,
    changefreq: 'monthly'
  },
  {
    path: '/terms',
    title: 'Terms - Eidos Works',
    description: 'Terms of use for editorial resources, tools, diagnostics, and service inquiry paths.',
    section: 'Policy',
    lastmod: siteConfig.updated,
    priority: 0.35,
    changefreq: 'monthly'
  },
  {
    path: '/work-with-eidos',
    title: 'Work With Eidos - Eidos Works',
    description: 'Custom UI/UX, agentic SEO, automation, dashboard, and intelligence-interface work with Brent Parent.',
    section: 'Services',
    lastmod: siteConfig.updated,
    priority: 0.82,
    changefreq: 'monthly'
  },
  {
    path: '/audit',
    title: 'Request an Eidos Audit - Eidos Works',
    description: 'Request a focused website, AI-search visibility, or automation audit.',
    section: 'Services',
    lastmod: siteConfig.updated,
    priority: 0.78,
    changefreq: 'monthly'
  }
];

export const routeMetas: RouteMeta[] = [
  ...staticRoutes,
  ...articles.map((article) => ({
    path: article.path,
    title: `${article.title} - Eidos Works`,
    description: article.dek,
    section: 'Intelligence',
    lastmod: article.updated,
    priority: 0.86,
    changefreq: 'monthly' as const
  }))
];

export const allRoutes = routeMetas.map((route) => route.path);

export function normalizePath(path: string) {
  const clean = path.split('?')[0]?.split('#')[0] || '/';
  if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1);
  return clean || '/';
}

export function absoluteUrl(path: string) {
  const normalized = normalizePath(path);
  return `${siteConfig.url}${normalized === '/' ? '/' : normalized}`;
}

export function getRouteMeta(path: string) {
  const normalized = normalizePath(path);
  return routeMetas.find((route) => route.path === normalized) ?? routeMetas[0];
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getArticleByPath(path: string) {
  const normalized = normalizePath(path);
  return articles.find((article) => article.path === normalized);
}

export function getRelatedArticles(article: Article) {
  return article.related
    .map((slug) => getArticleBySlug(slug))
    .filter((related): related is Article => Boolean(related));
}

export function getActiveSponsors() {
  return sponsors.filter((sponsor) => sponsor.active && sponsor.url);
}

export function getHasAffiliateTools() {
  return recommendedTools.some((tool) => tool.relationship === 'affiliate');
}

export function getToolsByCategory() {
  return recommendedTools.reduce<Record<string, typeof recommendedTools[number][]>>((groups, tool) => {
    groups[tool.category] = [...(groups[tool.category] ?? []), tool];
    return groups;
  }, {});
}

export function getBreadcrumbs(path: string) {
  const normalized = normalizePath(path);
  if (normalized === '/') return [{ name: 'Home', path: '/' }];

  const parts = normalized.split('/').filter(Boolean);
  const crumbs = [{ name: 'Home', path: '/' }];
  let current = '';

  parts.forEach((part) => {
    current += `/${part}`;
    const meta = getRouteMeta(current);
    const article = getArticleByPath(current);
    crumbs.push({
      name: article?.title ?? meta.section,
      path: current
    });
  });

  return crumbs;
}

