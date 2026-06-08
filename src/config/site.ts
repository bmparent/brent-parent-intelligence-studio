export const siteConfig = {
  name: 'Eidos Works',
  founder: 'Brent Parent',
  legacyName: 'Brent Parent Intelligence Studio',
  url: (import.meta.env.VITE_SITE_URL || 'https://eidosworks.pages.dev').replace(/\/+$/, ''),
  description:
    'Eidos Works builds custom storefronts, production dashboards, workflow automation, and intelligence prototypes for teams that need calmer digital systems.',
  contactEmail: '1brent.bm@gmail.com',
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

