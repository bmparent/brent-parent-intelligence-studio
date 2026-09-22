export type EditorialCaseStudy = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  problem: string;
  role: string;
  outcome: string;
  image: string;
  imageAlt: string;
};

export const primaryCaseStudies: EditorialCaseStudy[] = [
  {
    slug: 'pernr-access-gate',
    title: 'A private employee store needed a roster check without another account system.',
    shortTitle: 'PERNR access gate',
    eyebrow: 'Storefront access',
    problem: 'Verify an approved employee before revealing a private merchandise store, without sending the roster to the browser.',
    role: 'Private-store access, a maintainable roster check, and a clear retry path.',
    outcome: 'Approved visitors receive a direct path into the store; unrecognized entries receive a retry and support path.',
    image: '/images/case-studies/pernr-access-gate.png',
    imageAlt: 'Safe public view of the Eidos Works PERNR access-gate case study.'
  },
  {
    slug: 'production-dashboard',
    title: 'Production schedule data needed to support the morning planning decision.',
    shortTitle: 'Production reporting dashboard',
    eyebrow: 'Operational reporting',
    problem: 'Help production teams see late work, upcoming due dates, department status, and exceptions without rebuilding the schedule by hand.',
    role: 'Daily schedule visibility, department filtering, work-order review, and exports.',
    outcome: 'The team can review the same schedule by date range and department instead of assembling it manually.',
    image: '/images/case-studies/production-dashboard.png',
    imageAlt: 'Public production reporting dashboard with date and department controls.'
  },
  {
    slug: 'storefront-experience',
    title: 'A hosted apparel store needed to feel intentional before shoppers reached the product grid.',
    shortTitle: 'Storefront transformation',
    eyebrow: 'Hosted commerce UX',
    problem: 'Work within InkSoft constraints while improving the brand entrance, category paths, ordering guidance, and mobile hierarchy.',
    role: 'A branded school-store entrance, clearer product paths, and ordering guidance.',
    outcome: 'The public store opens with a clearer branded path into products, sizing guidance, and school-day ordering context.',
    image: '/images/case-studies/storefront-experience-framed.png',
    imageAlt: 'Public Liberty Christian Early Learning storefront showing the custom editorial hero.'
  }
];

export const serviceFamilies = [
  {
    slug: 'digital-experiences',
    number: '01',
    title: 'Digital Experiences',
    summary: 'Customer-facing websites, interactive experiences, campaigns, commerce journeys, and platform extensions that make the offer easier to understand and the next step easier to take.',
    includes: [
      'Website and UX redesign',
      'Interactive and campaign experiences',
      'Hosted commerce and portal UX',
      'Platform and frontend extensions',
      'Accessibility, performance, and search foundations'
    ],
    image: '/images/services/liberty-desktop-20260921.png',
    imageAlt: 'Actual Liberty Early Learning storefront captured on September 21, 2026.',
    imageCaption: 'Delivered InkSoft storefront · actual desktop capture'
  },
  {
    slug: 'business-systems',
    number: '02',
    title: 'Business Systems',
    summary: 'Internal tools, dashboards, workflow applications, reporting, and automation built around the way the work actually happens.',
    includes: [
      'Operational dashboards',
      'Internal applications',
      'Workflow and reporting tools',
      'Existing-tool and API integrations',
      'Automation and handoff systems'
    ],
    image: '/images/site-gallery/embroiderycalc-pro.webp',
    imageAlt: 'EmbroideryCalc estimating workspace.',
    imageCaption: 'EmbroideryCalc · focused estimating workspace'
  },
  {
    slug: 'intelligent-systems',
    number: '03',
    title: 'Intelligent Systems',
    summary: 'Focused AI assistants, agentic workflows, and decision-support tools designed around a specific job, real context, and explicit boundaries.',
    includes: [
      'Focused AI assistants',
      'Retrieval over approved business knowledge',
      'Agentic workflows with permissions',
      'AI-enhanced internal tools',
      'Evaluation, guardrails, and human review'
    ],
    image: '/images/site-gallery/wellway-journey.webp',
    imageAlt: 'Wellway guided reflection interface.',
    imageCaption: 'Wellway · guided reflection with optional bounded assistance'
  }
] as const;

// Kept broad because EditorialPages.tsx still contains legacy service-detail code.
// Public service routing uses the stricter local slug type in ServicePages.tsx.
export type ServiceSlug = string;

export function serviceBySlug(slug: string) {
  return serviceFamilies.find((service) => service.slug === slug);
}
