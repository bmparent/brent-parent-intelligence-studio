export const siteConfig = {
  name: 'Eidos Works',
  founder: 'Brent Parent',
  url: (import.meta.env.VITE_SITE_URL || 'https://eidos-works.com').replace(/\/+$/, ''),
  description:
    'Eidos Works designs digital experiences and operational tools for organizations with complicated real-world workflows.',
  contactEmail: 'hello@eidos-works.com',
  projectsEmail: 'projects@eidos-works.com',
  snapshotEmail: 'snapshot@eidos-works.com',
  billingEmail: 'billing@eidos-works.com',
  operatorEmail: 'bmp@eidos-works.com',
  snapshotPrice: '$5',
  snapshotCheckoutEnabled: import.meta.env.VITE_SNAPSHOT_CHECKOUT_ENABLED === 'true',
  logos: {
    icon: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780939367/eidods_icon_clukns.png',
    horizontal: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780939365/eidos_horizontal_bim82e.png',
    stacked: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780939364/eidos_Stacked_vzevuu.png'
  },
  socialImage: '/social-preview.svg'
} as const;

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export function projectMailto(subject = 'Eidos Works Project Inquiry') {
  return `mailto:${siteConfig.projectsEmail}?subject=${encodeURIComponent(subject)}`;
}
