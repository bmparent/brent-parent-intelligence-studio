export type StoreCaseStudy = {
  title: string;
  client: string;
  url: string;
  category: string;
  problem: string;
  approach: string;
  execution: string;
  result: string;
  proves: string[];
};

export type GalleryProject = {
  title: string;
  src: string;
  alt: string;
  label: string;
  summary: string;
  proves: string[];
};

export type Capability = {
  title: string;
  tag: string;
  summary: string;
  businessValue: string;
};

export type EngagementModel = {
  title: string;
  bestFor: string;
  deliverables: string[];
  timeline: string;
  range: string;
  priceFactors: string[];
  cta: string;
};

export type EidosScenario = {
  title: string;
  signal: string;
  sentinelDetects: string;
  brainHelps: string;
};

export const profileImage =
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777664829/ChatGPT_Image_May_1_2026_03_42_06_PM_ipnyby.png';

export const productionDashboardUrl =
  'https://dg-printavo-production-reports.1brent-bm.workers.dev/?range=custom&department=ALL&from=2026-06-04&to=2026-07-09';

export const storeCaseStudies: StoreCaseStudy[] = [
  {
    title: 'Disney Junior Shows',
    client: 'Disney Junior Shows',
    url: 'https://stores.inksoft.com/disney_junior_shows/shop/home',
    category: 'Branded show storefront',
    problem:
      'A branded merchandise experience needed to feel intentional, organized, and campaign-specific instead of reading like a default product grid.',
    approach:
      'Lead with a polished branded entry point, reduce decision friction, and guide visitors toward the most relevant show merchandise paths quickly.',
    execution:
      'Custom InkSoft storefront presentation, campaign-oriented content hierarchy, visual grouping, conversion CTAs, and responsive storefront polish.',
    result:
      'A real branded store experience that frames the merchandise clearly and supports fast customer scanning without losing brand confidence.',
    proves: ['Brand-sensitive UI', 'InkSoft customization', 'Conversion hierarchy']
  },
  {
    title: 'Disney Hollywood Studios Shows',
    client: 'Disney Hollywood Studios Shows',
    url: 'https://stores.inksoft.com/disney_hollywood_studios_shows/shop/home',
    category: 'Entertainment merchandise system',
    problem:
      'The storefront needed a cleaner show-specific experience for shoppers moving through multiple apparel and merchandise options.',
    approach:
      'Create a premium presentation layer that makes the store feel curated, gives shoppers clear paths, and keeps the experience easy to scan.',
    execution:
      'Custom InkSoft UI system with responsive sections, branded navigation prompts, grouped merchandise pathways, and sharper visual priority.',
    result:
      'A live storefront that feels more like a client-facing branded retail surface than a standard embedded catalog.',
    proves: ['Retail UX cleanup', 'Responsive systems', 'Branded storefronts']
  },
  {
    title: 'MDCA Preorders',
    client: 'MDCA',
    url: 'https://stores.inksoft.com/mdca_preorders/shop/home',
    category: 'Preorder campaign storefront',
    problem:
      'Preorder shoppers need clarity: what is available, what matters now, and how to act before the ordering window closes.',
    approach:
      'Use a focused preorder hierarchy with reassurance copy, direct shopping paths, and clear framing around limited-time purchasing behavior.',
    execution:
      'InkSoft custom content structure, clean CTA routing, product-path emphasis, and mobile-first ordering flow support.',
    result:
      'A focused preorder experience that makes the campaign easier to understand and easier to act on.',
    proves: ['Preorder UX', 'Campaign structure', 'Purchase clarity']
  },
  {
    title: 'MDCA Webstore',
    client: 'MDCA',
    url: 'https://stores.inksoft.com/mdca_webstore_/shop/home',
    category: 'School webstore system',
    problem:
      'A year-round store needs to support repeated visits, clear product discovery, and a cleaner branded school shopping experience.',
    approach:
      'Frame the store as a durable branded destination with clearer categories, smoother scanning, and less dependence on generic catalog layout.',
    execution:
      'Custom storefront UI, responsive content sections, category framing, CTA placement, and reusable design patterns for school apparel.',
    result:
      'A more credible and organized school store that can support ongoing ordering instead of one-off promotion only.',
    proves: ['School stores', 'Reusable UI patterns', 'Longer-lived storefronts']
  },
  {
    title: 'Liberty Christian Preparatory School',
    client: 'Liberty Christian Preparatory School',
    url: 'https://stores.inksoft.com/Liberty_Christian_Preparatory_Sc/shop/home',
    category: 'Private school apparel experience',
    problem:
      'Families and school communities need a store that feels trustworthy, premium, and easy to navigate across apparel categories.',
    approach:
      'Use calm hierarchy, polished school-brand surfaces, and direct category prompts to make the shopping experience feel official and simple.',
    execution:
      'Custom InkSoft presentation layer, premium card system, strong CTA grouping, and mobile-responsive product discovery paths.',
    result:
      'A school-facing storefront that feels branded, organized, and more premium than a standard templated page.',
    proves: ['Premium school UX', 'Family-friendly navigation', 'Trust cues']
  },
  {
    title: 'YMCA Central Florida',
    client: 'YMCA of Central Florida',
    url: 'https://stores.inksoft.com/ymcacf/shop/home',
    category: 'Community organization store',
    problem:
      'A large community brand needs merchandise access that feels clear, official, and flexible enough for a broad audience.',
    approach:
      'Prioritize recognizable organization framing, category clarity, and clean purchase paths for shoppers who may be browsing quickly.',
    execution:
      'Custom storefront layout, brand-aware sections, responsive navigation prompts, and streamlined merchandise discovery.',
    result:
      'A live community storefront that supports easier browsing while maintaining a polished organization-facing presence.',
    proves: ['Nonprofit/community UX', 'Broad audience design', 'Brand clarity']
  },
  {
    title: 'Early Learning Center',
    client: 'Liberty Christian Early Learning',
    url: 'https://stores.inksoft.com/liberty_christian_early_learnin/shop/home',
    category: 'Premium early-learning apparel store',
    problem:
      'The store needed to feel warm, trustworthy, and preschool-ready without becoming childish or visually noisy.',
    approach:
      'Blend school-day warmth with premium editorial spacing, soft glass surfaces, and parent-friendly shopping clarity.',
    execution:
      'Custom InkSoft embed direction, Cloudinary visuals, scoped UI system, responsive sections, and subtle enhancement-ready motion patterns.',
    result:
      'A family-facing apparel experience that feels calmer, more premium, and easier to understand than a generic store template.',
    proves: ['Clean style system', 'Scoped embeds', 'Premium warmth']
  }
];

export const galleryProjects: GalleryProject[] = [
  {
    title: 'Custom Gear Store 3D Mockup',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916767/custom_gear_store_3d_mockup_thqvxr.png',
    alt: 'Custom gear storefront mockup showing apparel, product categories, desktop, tablet, and mobile screens.',
    label: 'Storefront concept system',
    summary:
      'A multi-device store presentation showing how a branded apparel business can look polished across desktop, tablet, mobile, packaging, and product context.',
    proves: ['Multi-device commerce', 'Brandable UI kit', 'Cloudinary workflow']
  },
  {
    title: 'Maya Cole Studio Store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916763/maya_cole_studio_store_v0syfa.png',
    alt: 'Maya Cole Studio store mockup with desktop and mobile storefront previews in a warm artist brand direction.',
    label: 'Creator commerce direction',
    summary:
      'A softer premium storefront concept built around creator storytelling, visual merchandising, product grouping, and warm conversion cues.',
    proves: ['Creator-store UX', 'Editorial product cards', 'Visual merchandising']
  },
  {
    title: 'Hope Harbor Fundraiser Store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916762/hope_harbor_fundraiser_store_b3xtei.png',
    alt: 'Hope Harbor fundraiser storefront mockup with donation, progress, apparel, and mobile previews.',
    label: 'Fundraiser commerce direction',
    summary:
      'A cause-driven store interface that uses impact framing, donation paths, progress context, and community trust cues to support action.',
    proves: ['Fundraiser UX', 'Impact storytelling', 'Trust-based conversion']
  },
  {
    title: 'Momentum Summit Store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916761/momentum_summit_store_wwgpvq.png',
    alt: 'Momentum Summit event merchandise store mockup with bold event branding, desktop, and mobile screens.',
    label: 'Event merch system',
    summary:
      'A higher-energy event storefront concept showing how urgency, pickup logistics, attendee kits, and limited-edition drops can be structured clearly.',
    proves: ['Event commerce', 'Launch urgency', 'Branded merchandise systems']
  }
];

export const capabilities: Capability[] = [
  {
    title: 'Custom web experiences',
    tag: 'Experience design',
    summary: 'Premium landing pages, portfolio systems, campaign microsites, and conversion-focused frontends.',
    businessValue: 'Turns a brand or offer into a credible digital surface that earns attention quickly.'
  },
  {
    title: 'Premium storefront design',
    tag: 'Commerce UX',
    summary: 'Branded shopping flows, category systems, product storytelling, and mobile-first retail surfaces.',
    businessValue: 'Makes stores feel intentional, organized, and easier to act on.'
  },
  {
    title: 'InkSoft custom embeds',
    tag: 'Storefront systems',
    summary: 'Scoped HTML/CSS/JS embeds, Cloudinary assets, CTA systems, sizing guides, and polished store homepages.',
    businessValue: 'Upgrades templated InkSoft pages without breaking the hosted store environment.'
  },
  {
    title: 'Babylon.js / WebGL interactive UI',
    tag: 'Advanced interface layer',
    summary: 'Subtle living canvases, signal fields, dimensional cards, and interaction depth that supports the story.',
    businessValue: 'Adds a premium technical signature without turning the site into a distracting demo.'
  },
  {
    title: 'Business automation',
    tag: 'Workflow systems',
    summary: 'Operational glue between forms, reports, departments, production stages, and repeatable business processes.',
    businessValue: 'Reduces manual follow-up and makes hidden work easier to track.'
  },
  {
    title: 'Production reporting dashboards',
    tag: 'Operational intelligence',
    summary: 'Date-range reporting, department filtering, CSV exports, status views, and planning-ready tables.',
    businessValue: 'Helps teams see what is late, due, searchable, and actionable.'
  },
  {
    title: 'AI / intelligence-system prototypes',
    tag: 'Research systems',
    summary: 'Proof-stage interfaces for signal processing, anomaly detection, observability, and human-readable intelligence output.',
    businessValue: 'Makes complex data and early-stage system concepts understandable enough to test.'
  },
  {
    title: 'Cloudinary asset workflows',
    tag: 'Media systems',
    summary: 'Remote image delivery, responsive transformations, branded mockups, and optimized visual presentation.',
    businessValue: 'Keeps portfolio and storefront imagery fast, flexible, and production-friendly.'
  },
  {
    title: 'UI/UX cleanup and redesign',
    tag: 'Conversion repair',
    summary: 'Hierarchy audits, clutter reduction, stronger CTAs, mobile improvements, and trust-building visual systems.',
    businessValue: 'Turns scattered pages into clear user journeys with fewer decision points.'
  },
  {
    title: 'Print, promo, embroidery, and fulfillment workflows',
    tag: 'Industry operations',
    summary: 'Storefront and reporting systems shaped around decorated-apparel, promo, fulfillment, and production realities.',
    businessValue: 'Designs around the way the business actually runs, not just the way a template displays products.'
  }
];

export const processSteps = [
  {
    title: 'Discovery',
    summary: 'Clarify the business goal, audience, constraints, current systems, and the exact action the interface needs to drive.'
  },
  {
    title: 'System mapping',
    summary: 'Map data, products, stakeholders, workflow states, decision points, and handoffs before polishing visuals.'
  },
  {
    title: 'UI/UX direction',
    summary: 'Establish hierarchy, content order, motion level, visual language, and conversion paths that match the business context.'
  },
  {
    title: 'Build',
    summary: 'Implement clean, responsive React/CSS or scoped embed code with accessible structure and production-ready components.'
  },
  {
    title: 'Test',
    summary: 'Review mobile behavior, focus states, reduced motion, image loading, links, and the primary user path end-to-end.'
  },
  {
    title: 'Launch',
    summary: 'Deploy the finished surface, confirm live links and assets, and keep the experience stable for real users.'
  },
  {
    title: 'Iterate',
    summary: 'Use feedback, operational needs, and follow-up improvements to sharpen the system after launch.'
  }
] as const;

export const proofStats = [
  { value: '7', label: 'live InkSoft stores referenced' },
  { value: '1', label: 'production reporting dashboard' },
  { value: '6', label: 'Eidos Brain scenarios' },
  { value: '1', label: 'guided project intake flow' }
] as const;

export const engagementModels: EngagementModel[] = [
  {
    title: 'Starter Storefront Polish',
    bestFor: 'Small store improvements, product presentation cleanup, category clarity, banners, and simple custom content.',
    deliverables: [
      'Storefront hierarchy audit',
      'Homepage or category-section polish',
      'Mockup and banner recommendations',
      'Mobile and accessibility cleanup notes',
      'Light launch QA'
    ],
    timeline: '1-2 weeks after content is ready.',
    range: 'From $1,500-$3,500',
    priceFactors: ['Number of store sections', 'Asset readiness', 'Revision depth', 'InkSoft constraints'],
    cta: 'Build a Storefront'
  },
  {
    title: 'Custom Storefront Experience',
    bestFor: 'InkSoft embeds, richer landing pages, sizing guidance, visual merchandising, and branded apparel flows.',
    deliverables: [
      'Custom storefront structure',
      'Branded hero and category system',
      'Responsive embedded UI patterns',
      'Sizing or product guidance module',
      'Launch QA and live-link review'
    ],
    timeline: '2-4 weeks depending on scope.',
    range: 'From $4,500-$9,500',
    priceFactors: ['Custom embed complexity', 'Number of product paths', 'Media production', 'Launch deadline'],
    cta: 'Build a Storefront'
  },
  {
    title: 'Systems & Dashboard Build',
    bestFor: 'Production dashboards, operational reporting, workflow automation, API integrations, or internal tools.',
    deliverables: [
      'Workflow and data-source map',
      'Dashboard or automation prototype',
      'Responsive interface build',
      'API/workflow integration where scoped',
      'Testing notes and handoff documentation'
    ],
    timeline: '3-8 weeks for a focused first release.',
    range: 'From $8,500-$22,000+',
    priceFactors: ['Data access', 'API reliability', 'User roles', 'Export and reporting needs'],
    cta: 'Request a Dashboard'
  },
  {
    title: 'Intelligence Prototype / Eidos Brain Sprint',
    bestFor: 'Sentinel monitoring concepts, AI-assisted workflows, knowledge systems, anomaly/signal prototypes, and applied-intelligence briefs.',
    deliverables: [
      'Signal and exception model',
      'Prototype interface or brief workflow',
      'Incident receipt / evidence model',
      'Human-review and fallback plan',
      'Next-build recommendation'
    ],
    timeline: '2-6 weeks for a proof-stage sprint.',
    range: 'From $6,500-$18,000+',
    priceFactors: ['Signal sources', 'AI provider requirements', 'Data sensitivity', 'Review workflow complexity'],
    cta: 'Discuss Eidos Brain'
  }
];

export const billingNotes = [
  'Final quotes follow discovery and scope review.',
  'Typical payment schedule: 50% deposit, 30% at design/workflow approval, 20% before final delivery or launch.',
  'Retainers are available for ongoing improvements, monitoring, reporting, and system support.',
  'Out-of-scope work can be handled as an approved change order or hourly block.',
  'Advisory/build rate when used: $150/hr, billed in approved blocks.'
] as const;

export const retainerOptions = [
  { title: 'Launch Care', range: '$750-$1,500/month' },
  { title: 'Growth & Operations', range: '$1,500-$3,500/month' },
  { title: 'Systems Partner', range: '$4,000+/month' }
] as const;

export const eidosScenarios: EidosScenario[] = [
  {
    title: 'Storefront performance intelligence',
    signal: 'Store structure, campaign timing, product categories, customer questions, and repeated buying friction.',
    sentinelDetects: 'Missing category clarity, stale launch content, weak product presentation, and pages that need internal links.',
    brainHelps: 'Generate a store-improvement brief, prioritize fixes, and connect storefront proof to service recommendations.'
  },
  {
    title: 'Production schedule monitoring',
    signal: 'Due dates, departments, late jobs, completed work, stalled jobs, quantities, and status notes.',
    sentinelDetects: 'Exceptions, rising backlog, unusually quiet departments, production imbalance, and follow-up risks.',
    brainHelps: 'Create a daily production brief, explain dashboard changes, and suggest operational follow-ups.'
  },
  {
    title: 'Event or campaign merchandise launch',
    signal: 'Launch timeline, product readiness, artwork status, preorder volume, and campaign deadlines.',
    sentinelDetects: 'Launch blockers, missing assets, weak product presentation, and unbalanced demand.',
    brainHelps: 'Create a launch checklist, draft campaign copy, organize product priorities, and surface risks before launch day.'
  },
  {
    title: 'Brand and design QA',
    signal: 'Uploaded mockups, logos, color choices, product images, campaign graphics, and approval notes.',
    sentinelDetects: 'Brand mismatches, missing image assets, low-quality mockups, and inconsistent visual presentation.',
    brainHelps: 'Summarize what needs correction, recommend hierarchy improvements, and organize asset review.'
  },
  {
    title: 'Workflow automation triage',
    signal: 'Intake forms, repeated copy-paste work, manual follow-up, spreadsheet cleanup, and handoff delays.',
    sentinelDetects: 'Repeatable tasks, missing ownership, duplicated data entry, and places where status disappears.',
    brainHelps: 'Turn the bottleneck into a short automation brief with inputs, outputs, risks, and first-build scope.'
  },
  {
    title: 'SEO and content intelligence',
    signal: 'Published case studies, blog articles, buyer questions, service pages, and internal-link gaps.',
    sentinelDetects: 'Content gaps, stale articles, underdeveloped service pages, missing links, and weak page descriptions.',
    brainHelps: 'Suggest article topics, draft briefs, identify pages that need updates, and connect case studies to services.'
  }
];
