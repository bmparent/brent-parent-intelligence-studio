export type Article = {
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  updated: string;
  author: string;
  readingTime: string;
  tags: string[];
  canonicalPath: string;
  excerpt: string;
  body: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

export const articles: Article[] = [
  {
    title: 'What Makes a Custom InkSoft Storefront Feel Easier to Shop',
    slug: 'custom-inksoft-storefront-easier-to-shop',
    description:
      'A practical look at the storefront hierarchy, category framing, product clarity, and mobile decisions that make InkSoft stores easier to use.',
    category: 'Storefront UX',
    date: '2026-06-08',
    updated: '2026-06-08',
    author: 'Brent Parent',
    readingTime: '5 min read',
    tags: ['InkSoft', 'Storefront UX', 'Apparel stores', 'Conversion'],
    canonicalPath: '/insights/custom-inksoft-storefront-easier-to-shop',
    excerpt:
      'The best storefront improvements rarely start with decoration. They start by reducing uncertainty for the shopper.',
    body: [
      {
        heading: 'Start With The Shopper Decision',
        paragraphs: [
          'A custom storefront feels easier when the first screen explains what the store is for, who it serves, and which path a visitor should choose next.',
          'For school, event, and organization stores, the biggest win is often removing ambiguity: categories, deadlines, pickup context, and product priority all need to be visible without turning the page into a wall of instructions.'
        ]
      },
      {
        heading: 'Make The Template Feel Intentional',
        paragraphs: [
          'InkSoft can handle the commerce engine, but the surrounding presentation still matters. Custom sections, branded imagery, sizing guidance, and direct calls to action help the store feel like a real retail experience instead of a catalog dropped into a page.',
          'A polished store does not need excessive motion or visual noise. It needs hierarchy, product context, mobile-friendly grouping, and a clear reason to trust the page.'
        ]
      }
    ]
  },
  {
    title: 'How Production Dashboards Turn Shop Noise Into Action',
    slug: 'production-dashboards-shop-noise-action',
    description:
      'How production teams can use due dates, departments, filters, exceptions, and daily briefs to make operational work more visible.',
    category: 'Production Systems',
    date: '2026-06-08',
    updated: '2026-06-08',
    author: 'Brent Parent',
    readingTime: '6 min read',
    tags: ['Dashboards', 'Printavo', 'Operations', 'Reporting'],
    canonicalPath: '/insights/production-dashboards-shop-noise-action',
    excerpt:
      'A useful dashboard does not just display data. It turns the next production conversation into a shorter, clearer one.',
    body: [
      {
        heading: 'The Dashboard Has One Job',
        paragraphs: [
          'Production reporting is most useful when it helps a team decide what to look at next. Late work, due-today work, department load, quiet queues, and stalled jobs all need to surface quickly.',
          'That means filters, searchable tables, CSV export, and date-range context are not extras. They are how the dashboard becomes part of the daily operating rhythm.'
        ]
      },
      {
        heading: 'Design For Meetings And Follow-Up',
        paragraphs: [
          'The best operational interfaces are built around the conversations they support. A production manager should be able to answer what changed, what is at risk, and who needs a follow-up without rebuilding the view from scratch.',
          'That is where a reporting surface starts to become intelligence: not by guessing, but by organizing the signals that already exist.'
        ]
      }
    ]
  },
  {
    title: 'Why Apparel Mockups Matter Before Launch Day',
    slug: 'why-apparel-mockups-matter-before-launch-day',
    description:
      'Why apparel mockups improve buyer confidence, reduce launch friction, and help teams catch brand or product issues before a store goes live.',
    category: 'Design Systems',
    date: '2026-06-08',
    updated: '2026-06-08',
    author: 'Brent Parent',
    readingTime: '4 min read',
    tags: ['Mockups', 'Apparel', 'Launch planning', 'Cloudinary'],
    canonicalPath: '/insights/why-apparel-mockups-matter-before-launch-day',
    excerpt:
      'Mockups are not just decorative assets. They are one of the fastest ways to find weak product presentation before customers do.',
    body: [
      {
        heading: 'Mockups Make Decisions Visible',
        paragraphs: [
          'A flat product list can hide problems until launch day. Mockups reveal whether colors, artwork placement, garment type, and category hierarchy make sense together.',
          'For schools, events, and fundraisers, the mockup also helps non-design stakeholders understand the offer without interpreting production files or product codes.'
        ]
      },
      {
        heading: 'Use Mockups As A QA Layer',
        paragraphs: [
          'A good mockup pass can catch missing images, inconsistent brand treatment, confusing product titles, and weak hero visuals before the store goes public.',
          'When the assets are organized through a media workflow, those same visuals can support storefront banners, social posts, email campaigns, and internal approvals.'
        ]
      }
    ]
  },
  {
    title: 'Eidos Brain and Sentinel: A Practical Model for Small-Business Intelligence',
    slug: 'eidos-brain-sentinel-small-business-intelligence',
    description:
      'A grounded model for using signals, exceptions, briefs, and human review to make small-business intelligence systems useful without hype.',
    category: 'Eidos Brain',
    date: '2026-06-08',
    updated: '2026-06-08',
    author: 'Brent Parent',
    readingTime: '7 min read',
    tags: ['Eidos Brain', 'Sentinel', 'AI workflows', 'Small business'],
    canonicalPath: '/insights/eidos-brain-sentinel-small-business-intelligence',
    excerpt:
      'Small-business intelligence should not feel like science fiction. It should help a person notice what changed and decide what to do next.',
    body: [
      {
        heading: 'Signals Before Automation',
        paragraphs: [
          'The useful starting point is not a large autonomous system. It is a map of signals: storefront behavior, production status, customer questions, content gaps, missing assets, and repeated manual decisions.',
          'Sentinel is the monitoring layer in this model. It watches for exceptions, imbalance, stale content, or missing context. Eidos Brain is the interface layer that turns those observations into a readable brief.'
        ]
      },
      {
        heading: 'Keep Humans In The Loop',
        paragraphs: [
          'A practical intelligence system should show its reasoning, cite the signals it used, and ask for human review when the next action has business consequences.',
          'That makes the system useful for small teams: it reduces blank-page thinking and follow-up friction without pretending to replace judgment.'
        ]
      }
    ]
  },
  {
    title: 'Designing Websites for Humans, Search Engines, and AI Assistants',
    slug: 'designing-websites-for-humans-search-engines-ai-assistants',
    description:
      'How semantic structure, clear internal links, metadata, article depth, and public content maps help both people and AI-assisted browsers understand a site.',
    category: 'AI & Agentic Search',
    date: '2026-06-08',
    updated: '2026-06-08',
    author: 'Brent Parent',
    readingTime: '6 min read',
    tags: ['SEO', 'AI search', 'Semantic HTML', 'Content strategy'],
    canonicalPath: '/insights/designing-websites-for-humans-search-engines-ai-assistants',
    excerpt:
      'Agentic search does not replace fundamentals. It rewards the same clarity that helps a real buyer understand the work.',
    body: [
      {
        heading: 'Make The Site Legible First',
        paragraphs: [
          'Clear headings, real links, descriptive alt text, crawlable sections, and useful metadata help search engines, AI assistants, and human visitors build the same mental map.',
          'Important proof should not live only in canvas effects, hover states, or images. The page should explain the offer in HTML that can be read, searched, and linked.'
        ]
      },
      {
        heading: 'Connect The Proof',
        paragraphs: [
          'Internal links matter because they show relationships. A service page should point to related case studies, articles should reference workflows, and project CTAs should carry enough context to start the next conversation.',
          'That structure helps a visitor explore proof and helps an AI-assisted browser summarize the business accurately.'
        ]
      }
    ]
  },
  {
    title: 'A Simple Weekly Content Rhythm for Storefronts and Service Businesses',
    slug: 'weekly-content-rhythm-storefronts-service-businesses',
    description:
      'A realistic publishing rhythm for teams that want useful articles, updates, product notes, and case-study fragments without creating a content machine.',
    category: 'Case Study Notes',
    date: '2026-06-08',
    updated: '2026-06-08',
    author: 'Brent Parent',
    readingTime: '5 min read',
    tags: ['Content rhythm', 'Storefronts', 'Service businesses', 'SEO'],
    canonicalPath: '/insights/weekly-content-rhythm-storefronts-service-businesses',
    excerpt:
      'A weekly rhythm works when it is tied to real operations: launches, customer questions, product decisions, and lessons from the work.',
    body: [
      {
        heading: 'Use Real Work As The Source',
        paragraphs: [
          'The easiest content rhythm starts with questions the business already answers every week. What should customers know before ordering? What changed in the store? Which product or workflow caused confusion?',
          'Those observations can become short articles, launch notes, buying guides, case-study fragments, and internal documentation without forcing the team to invent topics from nothing.'
        ]
      },
      {
        heading: 'Keep The Format Repeatable',
        paragraphs: [
          'A practical rhythm might include one useful article, one store update, one product or workflow note, and one proof-oriented case-study detail each week.',
          'The goal is not volume for its own sake. The goal is a steady trail of useful, searchable context that helps buyers understand the work.'
        ]
      }
    ]
  }
];

export function getArticleBySlug(slug?: string) {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}

export function getArticleSlugFromPath(pathname?: string) {
  if (!pathname) return undefined;
  const match = pathname.match(/^\/insights\/([^/?#]+)/);
  if (!match?.[1]) return undefined;
  const slug = decodeURIComponent(match[1]);
  return getArticleBySlug(slug)?.slug;
}
