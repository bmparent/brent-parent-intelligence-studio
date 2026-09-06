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
    slug: 'disney-villains',
    title: 'Disney Villains',
    category: 'Storefronts',
    description:
      'An enchanted mirror, a darker palette, and a cast-and-crew collection with character.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1500/v1782237353/new_villains_hero_rwdigj.png',
    alt: 'Disney Villains storefront artwork with an ornate mirror and violet forest light.',
    status: 'Interactive design reconstruction',
    href: '/work/disney-villains',
    details: [
      'Saved InkSoft artwork and theatrical art direction',
      'Illustrated category paths and consistent product styling',
      'Keyboard-friendly browsing and a temporary demo bag',
    ],
  },
  {
    slug: 'beauty-and-the-beast',
    title: 'Beauty and the Beast',
    category: 'Storefronts',
    description:
      'A gilded theatre entrance, anniversary artwork, and a collection that carries the story beyond the stage.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1500/v1788284155/batb30-home-hero-desktop-v1.png',
    alt: 'Beauty and the Beast theatre artwork with a rose beneath stage lights.',
    status: 'Interactive design reconstruction',
    href: '/work/beauty-and-the-beast',
    details: [
      'A theatre-led entrance using saved anniversary artwork',
      'Gilded framing and an editorial collection layout',
      'Responsive product inspection and example selections',
    ],
  },
  {
    slug: 'jingle-bell-jingle-bam',
    title: 'Jingle Bell, Jingle BAM!',
    category: 'Storefronts',
    description:
      'A festive theatre, falling snow, and snow-globe collection paths with front-and-back product inspection.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1500/v1788535387/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/core/jbjb-hero-theatre-base-desktop-v1.webp',
    alt: 'Jingle Bell, Jingle BAM holiday theatre artwork.',
    status: 'Interactive design reconstruction',
    href: '/work/jingle-bell-jingle-bam',
    details: [
      'Layered holiday scenes and animated snow',
      'Snow-globe category navigation',
      'Saved front-and-back product artwork',
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
