export const labUrl = 'https://eidos-sentinel-lab.vercel.app/';
export const showcase = [
  {
    slug: 'nighttime-spectaculars',
    title: 'Nighttime Spectaculars',
    category: 'Storefronts',
    description:
      'A cinematic entrance for a Hollywood Studios cast-and-crew collection.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1500/v1788371336/dhs-nighttime-spectaculars/hero/ns-hero-dhs-desktop-v1.webp',
    alt: 'Nighttime Spectaculars hero artwork featuring Hollywood Studios at night.',
    status: 'Storefront design',
    href: '/work/nighttime-spectaculars',
    details: [
      'Custom responsive entrance within InkSoft',
      'Cinematic artwork and collection hierarchy',
      'Platform-owned product, cart, and checkout flows',
    ],
  },
  {
    slug: 'holidays-in-hollywood',
    title: 'Holidays in Hollywood',
    category: 'Storefronts',
    description:
      'A theatrical collection brought to life with a distinctive branded entrance.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1500/v1786042295/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-full-storefront-reference-v2.webp',
    alt: 'Holidays in Hollywood design reference with a theatrical holiday hero and apparel categories.',
    status: 'Storefront design reference',
    href: '/work/holidays-in-hollywood',
    details: [
      'Art direction and a custom storefront entrance',
      'Clear category paths and layered visual hierarchy',
      'Responsive layouts within an existing commerce platform',
    ],
  },
  {
    slug: 'sentinel-lab',
    title: 'Eidos / Sentinel Lab',
    category: 'Experiments',
    description:
      'An open window into the research: experiments, evidence, and what still needs proving.',
    image: '/images/work/sentinel-lab.webp',
    alt: 'Eidos Sentinel Lab research interface.',
    status: 'Active research · Vercel',
    href: '/lab',
    details: [
      'A separately hosted research application',
      'Inspectable experiment status and evidence gates',
      'Clear distinction between engineering tests and research proof',
    ],
  },
  {
    slug: 'pernr-access-gate',
    title: 'A better way into a private store',
    category: 'Systems',
    description:
      'A controlled eligibility check designed around the people using it.',
    image: '/images/case-studies/pernr-access-gate.png',
    alt: 'Employee-store eligibility interface and its access flow.',
    status: 'Implemented workflow',
    href: '/work/pernr-access-gate',
    details: [
      'Roster-backed eligibility',
      'Clear recovery paths',
      'An existing-platform integration',
    ],
  },
  {
    slug: 'storefront-experience',
    title: 'School spirit, thoughtfully organized',
    category: 'Storefronts',
    description: 'A warmer, clearer path into a hosted school apparel store.',
    image: '/images/case-studies/storefront-experience-framed.png',
    alt: 'Branded school apparel storefront with guided category navigation.',
    status: 'Implemented storefront',
    href: '/work/storefront-experience',
    details: [
      'Responsive brand entrance',
      'Product and sizing guidance',
      'Hosted commerce integration',
    ],
  },
  {
    slug: 'cinematic-starter',
    title: 'The cinematic starter',
    category: 'Experiments',
    description: 'A working glass header and hero you can make your own.',
    image: '/images/eidos-glass-hero.webp',
    alt: 'Original glass sculpture on a midnight-blue background.',
    status: 'Original Eidos product',
    href: '/shop/cinematic-starter',
    details: [
      'Responsive HTML, CSS, and JavaScript',
      'Keyboard navigation and reduced motion',
      'One-time commercial license',
    ],
  },
] as const;
export type ShowcaseProject = (typeof showcase)[number];
