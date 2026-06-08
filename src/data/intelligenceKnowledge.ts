import type { LocalKnowledgeEntry } from '../types/intelligence'

export const signalOptions = [
  'Website redesign',
  'Workflow automation',
  'Dashboard / reporting',
  'AI assistant',
  'InkSoft storefront',
  'Brand system',
  'Customer intake',
  'Operations cleanup',
  'Eidos-style knowledge system',
]

export const intelligenceKnowledge: LocalKnowledgeEntry[] = [
  {
    id: 'portfolio-redesign',
    title: 'Eidos Works Public Site',
    category: 'website',
    tags: ['website', 'portfolio', 'brand', 'conversion', 'ux', 'seo', 'cloudflare', 'react', 'vite'],
    summary:
      'A static-first Vite, React, and TypeScript public site positioned around premium services, interactive proof, and conversion clarity.',
    proof:
      'Useful when a visitor needs a more credible site, clearer offer architecture, better proof hierarchy, and a polished path to contact Brent.',
    recommendedPath: 'Conversion-focused website and positioning sprint',
  },
  {
    id: 'inksoft-storefronts',
    title: 'InkSoft Storefront Systems',
    category: 'storefront',
    tags: ['inksoft', 'storefront', 'apparel', 'school', 'shop', 'merch', 'ecommerce', 'webstore'],
    summary:
      'Custom storefront experiences for apparel, school, event, and organization stores with branded content sections and cleaner shopping paths.',
    proof:
      'Relevant for teams that need a more polished webstore without rebuilding the commerce platform underneath it.',
    href: '#work',
    recommendedPath: 'Storefront UX upgrade with branded product pathways',
  },
  {
    id: 'dg-printavo-reports',
    title: 'DG Printavo Production Reports',
    category: 'dashboard',
    tags: ['printavo', 'dashboard', 'production', 'reporting', 'operations', 'kpi', 'workflow', 'shop'],
    summary:
      'A production-reporting dashboard concept that turns operational data into clearer filtering, date ranges, department views, and management insight.',
    proof:
      'Best for businesses where the pain is not lack of data, but lack of fast, useful visibility into production status and operational patterns.',
    href: 'https://dg-printavo-production-reports.1brent-bm.workers.dev/?range=custom&department=ALL&from=2026-06-04&to=2026-07-09',
    recommendedPath: 'Operational dashboard and reporting build',
  },
  {
    id: 'eidos-brain',
    title: 'Eidos Brain / Sentinel Intelligence Prototype',
    category: 'ai',
    tags: ['ai', 'knowledge', 'memory', 'agent', 'eidos', 'sentinel', 'research', 'brief', 'assistant'],
    summary:
      'A white-paper-style intelligence-system concept for organizing knowledge, context, signals, briefs, and decision support into a living interface.',
    proof:
      'Useful when a business has scattered notes, repeated decisions, internal procedures, or knowledge that should become searchable and actionable.',
    href: '#eidos',
    recommendedPath: 'Knowledge-system prototype and AI brief workflow',
  },
  {
    id: 'automation-systems',
    title: 'Automation and Workflow Systems',
    category: 'automation',
    tags: ['automation', 'workflow', 'intake', 'routing', 'spreadsheet', 'manual', 'forms', 'ops'],
    summary:
      'Focused automations that reduce repeated work across intake, routing, reporting, follow-ups, and internal handoffs.',
    proof:
      'Best for operators losing time to copy/paste work, duplicate entry, spreadsheet cleanup, or manual updates across tools.',
    recommendedPath: 'Workflow audit and first automation build',
  },
  {
    id: 'uiux-system',
    title: 'UI/UX System and Component Direction',
    category: 'strategy',
    tags: ['ui', 'ux', 'design system', 'tokens', 'components', 'accessibility', 'responsive', 'motion'],
    summary:
      'A design-system approach to interfaces: clean layout, reusable components, visible states, accessibility, and responsive structure.',
    proof:
      'Strong fit for products and teams that need a more cohesive visual language before adding new functionality.',
    recommendedPath: 'UI/UX system refresh and component cleanup',
  },
]
