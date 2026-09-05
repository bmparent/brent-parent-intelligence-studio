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
    summary: 'Websites, service pages, and campaign experiences that help people understand the offer and take the right next step.',
    includes: ['Website and UX redesign', 'Service and campaign pages', 'Accessible responsive frontends', 'Agentic SEO foundations'],
    image: '/images/services/digital-experiences.png',
    imageAlt: 'Eidos Works Agentic SEO service page shown as an authentic digital experience example.',
    imageCaption: 'Eidos Works service-page experience'
  },
  {
    slug: 'storefront-access-systems',
    number: '02',
    title: 'Storefront and Access Systems',
    summary: 'Branded storefronts and practical access checks that help the right people reach the right products without unnecessary account friction.',
    includes: ['InkSoft storefront UX', 'Employee and roster access gates', 'Category and product guidance', 'Responsive ordering paths'],
    image: '/images/case-studies/storefront-experience-framed.png',
    imageAlt: 'Liberty Christian Early Learning storefront entrance completed within Data Graphics client-services work.',
    imageCaption: 'Hosted storefront experience'
  },
  {
    slug: 'dashboards-workflow-tools',
    number: '03',
    title: 'Dashboards and Workflow Tools',
    summary: 'Reporting, automation, and internal tools that show what is late, what needs attention, and what the team should do next.',
    includes: ['Production reporting', 'Workflow visibility', 'Google Workspace automation', 'Internal operational tools'],
    image: '/images/case-studies/production-dashboard.png',
    imageAlt: 'Production reporting dashboard showing schedule filters and daily work status.',
    imageCaption: 'Production workflow dashboard'
  }
] as const;

export type ServiceSlug = (typeof serviceFamilies)[number]['slug'];

export function serviceBySlug(slug: string) {
  return serviceFamilies.find((service) => service.slug === slug);
}
