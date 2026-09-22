import { absoluteUrl, siteConfig } from '../config/site';
import { articles } from './articles';

export type PageMetadata = {
  title: string;
  description: string;
  url: string;
  type: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
  noReferrer?: boolean;
};

const staticPages: Record<string, Omit<PageMetadata, 'url'>> = {
  '/account/reset': { title: 'Reset Password | Eidos Works', description: 'Set a new password using your secure reset link.', type: 'website', noIndex: true, noReferrer: true },
  '/playground': { title: 'Eidos Playground | Shape your next website', description: 'Explore templates, tune your design, and export a working page with every setting. Free preview release.', type: 'website', noIndex: true },
  '/account': { title: 'Your Account | Eidos Works', description: 'Free paper delivery, saved reading, and a conversation inbox for people and agents.', type: 'website', noIndex: true, noReferrer: true },
  '/account/verify': { title: 'Confirm Your Email | Eidos Works', description: 'Confirm your email to sign in.', type: 'website', noIndex: true, noReferrer: true },
  '/account/unsubscribe': { title: 'Email Preferences | Eidos Works', description: 'Unsubscribe from article emails.', type: 'website', noIndex: true, noReferrer: true },
  '/lab/access': { title: 'Request Lab Access | Eidos Works', description: 'Message Brent to request an Eidos Brain / Sentinel access code.', type: 'website' },
  '/work/nighttime-spectaculars': {
    title: 'Nighttime Spectaculars Storefront | Eidos Works',
    description:
      'A cinematic Hollywood Studios collection entrance, built within InkSoft. Interactive fireworks, collection browsing, and product design preview.',
    type: 'website',
  },
  '/work/holidays-in-hollywood': {
    title: 'Holidays in Hollywood Storefront | Eidos Works',
    description:
      'A theatrical cast-and-crew storefront design with custom artwork, collection hierarchy, and responsive development.',
    type: 'website',
  },
  '/work/disney-villains': {
    title: 'Disney Villains Storefront | Eidos Works',
    description:
      'An enchanted mirror, a darker palette, and a cast-and-crew collection with character.',
    type: 'website',
  },
  '/work/beauty-and-the-beast': {
    title: 'Beauty and the Beast Storefront | Eidos Works',
    description:
      'A gilded theatre entrance, anniversary artwork, and a collection that carries the story beyond the stage.',
    type: 'website',
  },
  '/work/jingle-bell-jingle-bam': {
    title: 'Jingle Bell, Jingle BAM! Storefront | Eidos Works',
    description:
      'A festive theatre, falling snow, and snow-globe collection paths with front-and-back product inspection.',
    type: 'website',
  },
  '/lab': {
    title: 'Eidos / Sentinel Lab | Eidos Works',
    description:
      'Explore the separately hosted Sentinel research application, its experiments, and the boundaries of the evidence.',
    type: 'website',
  },
  '/community': {
    title: 'Community | Eidos Works',
    description:
      'Ask questions about websites, design, and building with AI. Join thoughtful conversations reviewed by the Eidos studio.',
    type: 'website',
  },
  '/community/agents': {
    title: 'Agent Exchange | Eidos Works',
    description:
      'A moderated place for people and registered AI assistants to share reproducible findings and useful building questions.',
    type: 'website',
  },
  '/community/agent-guide': {
    title: 'Agent Integration Guide | Eidos Works',
    description:
      'Read public conversations and submit useful contributions through the minimal Eidos Agent Exchange API.',
    type: 'website',
  },
  '/community/moderate': {
    title: 'Community Review | Eidos Works',
    description:
      'Private studio operator controls for reviewing public contributions.',
    type: 'website',
    noIndex: true,
    noReferrer: true,
  },
  '/community/guidelines': {
    title: 'Community Guidelines | Eidos Works',
    description:
      'How to contribute useful questions, answers, and agent findings to the Eidos community.',
    type: 'website',
  },
  '/privacy': {
    title: 'Privacy | Eidos Works',
    description:
      'How Eidos Works handles optional analytics, assistant questions, public contributions, and payment verification.',
    type: 'website',
  },
  '/terms': {
    title: 'Product and Site Terms | Eidos Works',
    description:
      'What is included in the Cinematic Starter purchase, its one-website license, and how to request help.',
    type: 'website',
  },
  '/shop/cinematic-starter': {
    title: 'Cinematic Starter — $29 | Eidos Works',
    description:
      'An original responsive glass header and cinematic hero in HTML, CSS, and JavaScript. Preview the template and buy one commercial project license.',
    type: 'website',
  },
  '/shop/success': {
    title: 'Your Cinematic Starter | Eidos Works',
    description:
      'Private purchase verification and download for your Cinematic Starter package.',
    type: 'website',
    noIndex: true,
    noReferrer: true,
  },
  '/': {
    title: 'Eidos Works | Creative Development & Intelligent Systems',
    description: siteConfig.description,
    type: 'website',
  },
  '/central-florida': { title: 'Websites & Workflow Help for Central Florida Businesses | Eidos Works', description: 'Show us the website, repeated task, or disconnected workflow that almost works. A focused Friction Review for Central Florida owner-operated service businesses.', type: 'website' },
  '/friction-review': {
    title: 'Friction Review | Eidos Works',
    description:
      'Show Eidos Works a website, workflow, storefront, application, repeated task, or digital process that almost works. Get a concise readout of the friction and the first change we would make.',
    type: 'website',
  },
  '/snapshot': {
    title: 'Eidos Snapshot | $5 Website Mockup + SEO Recommendations',
    description:
      'Paste your website and get an AI-assisted redesign concept with practical SEO and UX recommendations from Eidos Works.',
    type: 'website',
  },
  '/snapshot/start': {
    title: 'Start Your Eidos Snapshot | Eidos Works',
    description:
      'Share your current website, business goal, and style direction to begin an Eidos Snapshot.',
    type: 'website',
    noIndex: true,
  },
  '/snapshot/success': {
    title: 'Your Snapshot Is Processing | Eidos Works',
    description: 'Your private Eidos Snapshot report is being prepared.',
    type: 'website',
    noIndex: true,
    noReferrer: true,
  },
  '/services/agentic-seo': {
    title: 'Agentic SEO & AI-Ready Website Strategy | Eidos Works',
    description:
      'Build a website that is easier for customers, search engines, and AI assistants to understand with structured content, metadata, schema, and accessible UX.',
    type: 'website',
  },
  '/services': {
    title: 'Services | Eidos Works',
    description:
      'Digital experiences, business systems, and focused AI tools built around the point where an existing site, workflow, platform, or piece of software stops fitting the work.',
    type: 'website',
  },
  '/services/digital-experiences': {
    title: 'Digital Experience Design & Development | Eidos Works',
    description:
      'Websites, interactive experiences, commerce journeys, campaigns, and platform extensions that make an offer easier to understand and a next step easier to take.',
    type: 'website',
  },
  '/services/business-systems': {
    title: 'Business Systems & Workflow Tools | Eidos Works',
    description:
      'Internal tools, dashboards, workflow applications, reporting, integrations, and automation built around the way the organization actually operates.',
    type: 'website',
  },
  '/services/intelligent-systems': {
    title: 'Focused AI & Intelligent Systems | Eidos Works',
    description:
      'Focused AI assistants, agentic workflows, and decision-support tools designed around a specific job, approved context, explicit boundaries, and human control.',
    type: 'website',
  },
  '/services/storefront-access-systems': {
    title: 'Commerce & Access Experiences | Eidos Works',
    description:
      'Hosted storefront UX, commerce journeys, employee-store access, product paths, and platform extensions as part of Eidos Works digital experience capabilities.',
    type: 'website',
  },
  '/services/dashboards-workflow-tools': {
    title: 'Dashboards & Workflow Tools | Eidos Works',
    description:
      'Operational reporting, workflow visibility, integrations, and automation are now part of Eidos Works Business Systems.',
    type: 'website',
  },
  '/work': {
    title: 'Selected Work | Eidos Works',
    description:
      'Eidos Works case studies and demonstrations across digital experiences, operational systems, commerce UX, and intelligent tools.',
    type: 'website',
  },
  '/work/pernr-access-gate': {
    title: 'Private Storefront PERNR Access Gate Case Study | Eidos Works',
    description:
      'See how Eidos Works connected an InkSoft employee store to a controlled roster for a low-friction PERNR eligibility check.',
    type: 'website',
    image: absoluteUrl('/images/case-studies/pernr-access-gate.png'),
  },
  '/work/production-dashboard': {
    title: 'Production Reporting Dashboard Case Study | Eidos Works',
    description:
      'See how production teams gained a filterable schedule for late work, due dates, departments, work orders, and exceptions.',
    type: 'website',
    image: absoluteUrl('/images/case-studies/production-dashboard.png'),
  },
  '/work/storefront-experience': {
    title: 'Hosted Storefront Experience Case Study | Eidos Works',
    description:
      'See how a hosted school apparel store gained a clearer branded entrance, product paths, and responsive ordering guidance.',
    type: 'website',
    image: absoluteUrl('/images/case-studies/storefront-experience-framed.png'),
  },
  '/about': {
    title: 'About Eidos Works & Brent Parent',
    description:
      'Learn how Brent Parent leads Eidos Works and how design, operations, software, collaboration, automation, and focused AI shape the studio.',
    type: 'website',
  },
  '/contact': {
    title: 'Start a Project | Eidos Works',
    description:
      'Tell Eidos Works about the digital experience, business system, workflow, application, or focused AI capability you want to build.',
    type: 'website',
  },
  '/lab/eidos-brain': {
    title: 'Eidos Brain Research Lab | Eidos Works',
    description:
      'A proof-stage research project exploring streaming prediction, surprise handling, anomaly receipts, and human review.',
    type: 'website',
  },
  '/insights': {
    title: 'Insights | Eidos Works',
    description:
      'Practical notes on digital experiences, business systems, workflow automation, intelligent tools, and AI-ready search from Eidos Works.',
    type: 'website',
  },
  '/editorial-policy': {
    title: 'Editorial Policy | Eidos Works',
    description:
      'How Eidos Works selects topics, checks sources, uses editorial tools, and handles corrections for Insights.',
    type: 'website',
  },
};

const articleSeoTitles: Record<string, string> = {
  'agentic-seo-small-business-websites':
    'Agentic SEO for Small Business | Eidos Works',
  'structure-website-people-ai-assistants-understand':
    'Website Structure for People & AI | Eidos Works',
  'storefront-ux-find-right-product-faster':
    'Storefront UX: Find Products Faster | Eidos Works',
  'spreadsheet-chaos-operational-dashboards':
    'From Spreadsheet Chaos to Dashboards | Eidos Works',
  'website-snapshot-before-redesign':
    'Website Snapshot Before a Redesign | Eidos Works',
  'mobile-hierarchy-over-desktop-polish':
    'Why Mobile Hierarchy Matters | Eidos Works',
  'eidos-brain-sentinel-small-business-intelligence':
    'Eidos Brain & Sentinel for Small Business | Eidos Works',
  'baseline-2026-browser-support-design-system-decision':
    'Baseline 2026 & Design Systems | Eidos Works',
  'practical-source-map-ai-ready-service-pages':
    'AI-Ready Service Page Source Maps | Eidos Works',
  'storefront-proof-loop-ux-assets-operations':
    'Storefront UX, Assets & Operations | Eidos Works',
};

export function normalizePath(path = '/') {
  const withoutQuery = path.split(/[?#]/)[0] || '/';
  if (withoutQuery === '/') return '/';
  return `/${withoutQuery.replace(/^\/+|\/+$/g, '')}`;
}

export function pageMetadata(path = '/'): PageMetadata {
  const normalized = normalizePath(path);
  const staticPage = staticPages[normalized];
  if (staticPage) {
    return {
      ...staticPage,
      url: absoluteUrl(normalized),
      image: staticPage.image ?? absoluteUrl(siteConfig.socialImage),
    };
  }

  if (/^\/members\/[a-z][a-z0-9_]{2,23}$/.test(normalized)) {
    return { title: `@${normalized.split('/').at(-1)} | Eidos Works`, description: 'Eidos Works community member profile.', url: absoluteUrl(normalized), image: absoluteUrl(siteConfig.socialImage), type: 'website', noIndex: true };
  }

  if (normalized.startsWith('/snapshot/result/')) {
    return {
      title: 'Your Private Eidos Snapshot | Eidos Works',
      description: 'Private Eidos Snapshot result.',
      // Never expose a private result token through canonical or social metadata.
      url: absoluteUrl('/snapshot'),
      image: absoluteUrl(siteConfig.socialImage),
      type: 'website',
      noIndex: true,
      noReferrer: true,
    };
  }

  const article = articles.find((item) => item.canonicalPath === normalized);
  if (article) {
    return {
      title: articleSeoTitles[article.slug] || `${article.title} | Eidos Works`,
      description: article.description,
      url: absoluteUrl(article.canonicalPath),
      image: absoluteUrl(article.ogImage),
      type: 'article',
    };
  }

  return {
    title: 'Page Not Found | Eidos Works',
    description:
      'Return to Eidos Works for digital experiences, business systems, focused AI tools, and practical studio work.',
    url: absoluteUrl(normalized),
    image: absoluteUrl(siteConfig.socialImage),
    type: 'website',
    noIndex: true,
  };
}

export function prerenderPagePaths() {
  return [
    '/playground',
    '/work/nighttime-spectaculars',
    '/work/holidays-in-hollywood',
    '/work/disney-villains',
    '/work/beauty-and-the-beast',
    '/work/jingle-bell-jingle-bam',
    '/lab',
    '/lab/access',
    '/account',
    '/account/verify',
    '/account/unsubscribe',
    '/community',
    '/community/agents',
    '/community/agent-guide',
    '/community/moderate',
    '/community/guidelines',
    '/privacy',
    '/terms',
    '/shop/cinematic-starter',
    '/shop/success',
    '/',
    '/friction-review',
    '/central-florida',
    '/work',
    '/work/pernr-access-gate',
    '/work/production-dashboard',
    '/work/storefront-experience',
    '/services',
    '/services/digital-experiences',
    '/services/business-systems',
    '/services/intelligent-systems',
    '/services/storefront-access-systems',
    '/services/dashboards-workflow-tools',
    '/services/agentic-seo',
    '/about',
    '/insights',
    '/contact',
    '/lab/eidos-brain',
    '/snapshot',
    '/snapshot/start',
    '/snapshot/success',
    '/editorial-policy',
    ...articles.map((article) => article.canonicalPath),
  ];
}
