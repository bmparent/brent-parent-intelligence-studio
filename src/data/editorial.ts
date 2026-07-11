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
    role: 'Access-flow design, interface implementation, Apps Script and Google Sheets integration.',
    outcome: 'Approved visitors receive a direct path into the store; unrecognized entries receive a retry and support path.',
    image: '/images/case-studies/pernr-access-gate.png',
    imageAlt: 'Safe public view of the Eidos Works PERNR access-gate case study.'
  },
  {
    slug: 'production-dashboard',
    title: 'Production schedule data needed to support the morning planning decision.',
    shortTitle: 'Production reporting dashboard',
    eyebrow: 'Operational reporting',
    problem: 'Bring due dates, departments, work orders, quantities, exceptions, notes, and exports into one reviewable operating view.',
    role: 'Workflow mapping, dashboard design, frontend implementation, filtering and export behavior.',
    outcome: 'The team can review the same planning surface by date range and department instead of assembling the view manually.',
    image: '/images/case-studies/production-dashboard.png',
    imageAlt: 'Public production reporting dashboard with date and department controls.'
  },
  {
    slug: 'storefront-experience',
    title: 'A hosted apparel store needed to feel intentional before shoppers reached the product grid.',
    shortTitle: 'Storefront transformation',
    eyebrow: 'Hosted commerce UX',
    problem: 'Work within InkSoft constraints while improving the brand entrance, category paths, ordering guidance, and mobile hierarchy.',
    role: 'Storefront UX direction and scoped custom presentation completed within Data Graphics client-services work.',
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
    summary: 'Websites, service pages, campaign pages, and customer-facing interfaces organized around one useful next action.',
    includes: ['Website and UX redesign', 'Service and campaign pages', 'Accessible responsive frontends', 'Agentic SEO foundations']
  },
  {
    slug: 'storefront-access-systems',
    number: '02',
    title: 'Storefront and Access Systems',
    summary: 'Hosted storefront presentation, employee-store gates, product paths, and ordering guidance that respect the platform underneath.',
    includes: ['InkSoft storefront UX', 'Employee and roster access gates', 'Category and product guidance', 'Responsive ordering paths']
  },
  {
    slug: 'dashboards-workflow-tools',
    number: '03',
    title: 'Dashboards and Workflow Tools',
    summary: 'Operational reporting, focused automation, and internal tools shaped around the decision a team needs to make next.',
    includes: ['Production reporting', 'Workflow visibility', 'Google Workspace automation', 'Internal operational tools']
  }
] as const;

export type ServiceSlug = (typeof serviceFamilies)[number]['slug'];

export function serviceBySlug(slug: string) {
  return serviceFamilies.find((service) => service.slug === slug);
}
