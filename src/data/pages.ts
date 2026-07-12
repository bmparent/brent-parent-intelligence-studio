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
  '/': {
    title: 'Eidos Works | Digital Experiences & Operational Tools',
    description: siteConfig.description,
    type: 'website'
  },
  '/snapshot': {
    title: 'Eidos Snapshot | $5 Website Mockup + SEO Recommendations',
    description: 'Paste your website and get an AI-assisted redesign concept with practical SEO and UX recommendations from Eidos Works.',
    type: 'website'
  },
  '/snapshot/start': {
    title: 'Start Your Eidos Snapshot | Eidos Works',
    description: 'Share your current website, business goal, and style direction to begin an Eidos Snapshot.',
    type: 'website',
    noIndex: true
  },
  '/snapshot/success': {
    title: 'Your Snapshot Is Processing | Eidos Works',
    description: 'Your private Eidos Snapshot report is being prepared.',
    type: 'website',
    noIndex: true,
    noReferrer: true
  },
  '/services/agentic-seo': {
    title: 'Agentic SEO & AI-Ready Website Strategy | Eidos Works',
    description: 'Build a website that is easier for customers, search engines, and AI assistants to understand with structured content, metadata, schema, and accessible UX.',
    type: 'website'
  },
  '/services': {
    title: 'Services | Eidos Works',
    description: 'Digital experiences, storefront and access systems, dashboards, and workflow tools designed around complicated real-world work.',
    type: 'website'
  },
  '/services/digital-experiences': {
    title: 'Digital Experience Design & Development | Eidos Works',
    description: 'Websites, service pages, campaign pages, accessible UX, and technical foundations built around a useful customer action.',
    type: 'website'
  },
  '/services/storefront-access-systems': {
    title: 'Storefront & Access Systems | Eidos Works',
    description: 'Hosted storefront UX, employee-store gates, roster checks, product paths, and ordering guidance for organizations.',
    type: 'website'
  },
  '/services/dashboards-workflow-tools': {
    title: 'Dashboards & Workflow Tools | Eidos Works',
    description: 'Operational reporting, workflow visibility, focused automation, and internal tools designed around daily decisions.',
    type: 'website'
  },
  '/work': {
    title: 'Selected Work | Eidos Works',
    description: 'Eidos Works case studies in private storefront access, production reporting, and hosted storefront experience design.',
    type: 'website'
  },
  '/work/pernr-access-gate': {
    title: 'Private Storefront PERNR Access Gate Case Study | Eidos Works',
    description: 'See how Eidos Works connected an InkSoft employee store to a controlled roster for a low-friction PERNR eligibility check.',
    type: 'website',
    image: absoluteUrl('/images/case-studies/pernr-access-gate.png')
  },
  '/work/production-dashboard': {
    title: 'Production Reporting Dashboard Case Study | Eidos Works',
    description: 'See how production teams gained a filterable schedule for late work, due dates, departments, work orders, and exceptions.',
    type: 'website',
    image: absoluteUrl('/images/case-studies/production-dashboard.png')
  },
  '/work/storefront-experience': {
    title: 'Hosted Storefront Experience Case Study | Eidos Works',
    description: 'See how a hosted school apparel store gained a clearer branded entrance, product paths, and responsive ordering guidance.',
    type: 'website',
    image: absoluteUrl('/images/case-studies/storefront-experience-framed.png')
  },
  '/about': {
    title: 'About Eidos Works & Brent Parent',
    description: 'Learn how Brent Parent leads Eidos Works and how design, storefront development, production operations, reporting, collaboration, and automation shape the studio.',
    type: 'website'
  },
  '/contact': {
    title: 'Discuss a Project | Eidos Works',
    description: 'Tell Eidos Works what customer path, storefront constraint, reporting gap, or repeated manual work you want to improve.',
    type: 'website'
  },
  '/lab/eidos-brain': {
    title: 'Eidos Brain Research Lab | Eidos Works',
    description: 'A proof-stage research project exploring streaming prediction, surprise handling, anomaly receipts, and human review.',
    type: 'website'
  },
  '/insights': {
    title: 'Insights | Eidos Works',
    description: 'Practical notes on website strategy, storefront UX, automation, dashboards, and AI-ready search from Eidos Works.',
    type: 'website'
  },
  '/editorial-policy': {
    title: 'Editorial Policy | Eidos Works',
    description: 'How Eidos Works selects topics, checks sources, uses editorial tools, and handles corrections for Insights.',
    type: 'website'
  }
};

const articleSeoTitles: Record<string, string> = {
  'agentic-seo-small-business-websites': 'Agentic SEO for Small Business | Eidos Works',
  'structure-website-people-ai-assistants-understand': 'Website Structure for People & AI | Eidos Works',
  'storefront-ux-find-right-product-faster': 'Storefront UX: Find Products Faster | Eidos Works',
  'spreadsheet-chaos-operational-dashboards': 'From Spreadsheet Chaos to Dashboards | Eidos Works',
  'website-snapshot-before-redesign': 'Website Snapshot Before a Redesign | Eidos Works',
  'mobile-hierarchy-over-desktop-polish': 'Why Mobile Hierarchy Matters | Eidos Works',
  'eidos-brain-sentinel-small-business-intelligence': 'Eidos Brain & Sentinel for Small Business | Eidos Works',
  'baseline-2026-browser-support-design-system-decision': 'Baseline 2026 & Design Systems | Eidos Works',
  'practical-source-map-ai-ready-service-pages': 'AI-Ready Service Page Source Maps | Eidos Works',
  'storefront-proof-loop-ux-assets-operations': 'Storefront UX, Assets & Operations | Eidos Works'
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
    return { ...staticPage, url: absoluteUrl(normalized), image: staticPage.image ?? absoluteUrl(siteConfig.socialImage) };
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
      noReferrer: true
    };
  }

  const article = articles.find((item) => item.canonicalPath === normalized);
  if (article) {
    return {
      title: articleSeoTitles[article.slug] || `${article.title} | Eidos Works`,
      description: article.description,
      url: absoluteUrl(article.canonicalPath),
      image: absoluteUrl(article.ogImage),
      type: 'article'
    };
  }

  return {
    title: 'Page Not Found | Eidos Works',
    description: 'Return to Eidos Works for websites, storefront experiences, automation, and AI-ready SEO.',
    url: absoluteUrl(normalized),
    image: absoluteUrl(siteConfig.socialImage),
    type: 'website',
    noIndex: true
  };
}

export function prerenderPagePaths() {
  return [
    '/',
    '/work',
    '/work/pernr-access-gate',
    '/work/production-dashboard',
    '/work/storefront-experience',
    '/services',
    '/services/digital-experiences',
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
    ...articles.map((article) => article.canonicalPath)
  ];
}
