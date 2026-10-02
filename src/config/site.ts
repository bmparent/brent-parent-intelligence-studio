export const siteConfig = {
  name: 'Eidos Works',
  founder: 'Brent Parent',
  url: (import.meta.env.VITE_SITE_URL || 'https://eidos-works.com').replace(
    /\/+$/,
    '',
  ),
  description:
    'Eidos Works builds distinctive digital experiences, business systems, and focused AI tools for teams whose existing technology does not quite fit what they need.',
  contactEmail: 'hello@eidos-works.com',
  projectsEmail: 'projects@eidos-works.com',
  snapshotEmail: 'snapshot@eidos-works.com',
  billingEmail: 'billing@eidos-works.com',
  operatorEmail: 'bmp@eidos-works.com',
  snapshotPrice: '$5',
  snapshotCheckoutEnabled:
    import.meta.env.VITE_SNAPSHOT_CHECKOUT_ENABLED === 'true',
  logos: {
    icon: '/brand/eidos-logo-square.png',
    mark: '/brand/eidos-mark.svg',
  },
  socialImage: '/brand/eidos-social-preview-v2.png',
} as const;

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export function projectMailto(subject = 'Eidos Works Project Inquiry') {
  return `mailto:${encodeURIComponent(siteConfig.projectsEmail)}?subject=${encodeURIComponent(subject)}`;
}

export function emailMailto(address: string, subject?: string) {
  const base = `mailto:${encodeURIComponent(address)}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
