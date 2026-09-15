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
    summary: 'Customer-facing websites, interactive experiences, campaigns, commerce journeys, and platform extensions that make an offer easier to understand and a next step easier to take.',
    includes: [
      'Website and UX redesign',
      'Responsive websites and service pages',
      'Interactive and cinematic web experiences',
      'Campaign and launch experiences',
      'Hosted commerce and storefront UX',
      'Frontend extensions for existing platforms'
    ],
    image: '/images/services/digital-experiences.png',
    imageAlt: 'Eidos Works service page shown as a digital experience example.',
    imageCaption: 'Digital experience and service-page work'
  },
  {
    slug: 'business-systems',
    number: '02',
    title: 'Business Systems',
    summary: 'Internal tools, dashboards, workflow applications, reporting, and automation built around the way the organization actually operates.',
    includes: [
      'Operational dashboards',
      'Internal web applications',
      'Workflow and approval tools',
      'Reporting interfaces',
      'Existing-tool and API integrations',
      'Google Workspace automation'
    ],
    image: '/images/case-studies/production-dashboard.png',
    imageAlt: 'Production reporting dashboard showing schedule filters and daily work status.',
    imageCaption: 'Operational dashboard and workflow system'
  },
  {
    slug: 'intelligent-systems',
    number: '03',
    title: 'Intelligent Systems',
    summary: 'Focused AI assistants, agentic workflows, and decision-support tools designed around a specific job, real business context, and explicit boundaries.',
    includes: [
      'Focused AI assistants',
      'Retrieval over approved business knowledge',
      'Agentic workflows with explicit permissions',
      'AI-enhanced internal tools',
      'Structured analysis and decision support',
      'Human review, evaluation, and guardrails'
    ],
    image: '/images/work/sentinel-lab.webp',
    imageAlt: 'Eidos Sentinel Lab interface showing a proof-stage intelligent-systems research environment.',
    imageCaption: 'Proof-stage intelligent-systems research interface'
  }
] as const;

export type ServiceSlug = (typeof serviceFamilies)[number]['slug'];

export function serviceBySlug(slug: string) {
  return serviceFamilies.find((service) => service.slug === slug);
}
