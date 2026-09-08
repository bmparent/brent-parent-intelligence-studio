// Observed on the original InkSoft store on 2026-09-08. InkSoft's "front"
// slots deliberately contain the decorated backs so the show artwork appears first.
export const jingleAssets = {
  logo: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788535616/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/artwork/jbjb-full-back-alpha-v1.png',
  elves:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788535417/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/core/jbjb-wayne-lanny-cutout-v1.webp',
  globe:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788535559/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/globes/jbjb-empty-snow-globe-v1.webp',
};
export const jingleProducts = [
  {
    sku: 'DT800',
    name: 'District® The Concert Fleece® Full-Zip Hoodie',
    short: 'Concert Fleece Full-Zip',
    category: 'Fleece',
    fit: 'Adult fit',
    price: 262,
    back: 'https://cdn.inksoft.com/images/products/20808/products/DT800JBJJ/Black/front/500.png?decache=63924106800323',
    front:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788883368/hollywood-studios-shows/jingle-bell-jingle-bam/approved-products-v5/DT800JBJJ_FRONT.png',
    description:
      'An easy fleece layer for cool rehearsals and the walk back after the finale.',
    features: ['50/50 cotton-blend fleece', 'Full zip', 'Front pockets'],
  },
  {
    sku: 'J717',
    name: 'Port Authority® Active Soft Shell Jacket',
    short: 'Active Soft Shell Jacket',
    category: 'Soft shell',
    fit: 'Men’s fit',
    price: 275,
    back: 'https://cdn.inksoft.com/images/products/20808/products/J717JBJJ/Black/front/500.png?decache=63924106721080',
    front:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788883371/hollywood-studios-shows/jingle-bell-jingle-bam/approved-products-v5/J717JBJJ_FRONT.png',
    description:
      'Wind resistance and room to move for active show-night coverage.',
    features: ['Active coverage', 'Soft shell', 'Full zip'],
  },
  {
    sku: 'J333',
    name: 'Port Authority® Torrent Waterproof Jacket',
    short: 'Torrent Waterproof Jacket',
    category: 'Waterproof',
    fit: 'Men’s fit',
    price: 295,
    back: 'https://cdn.inksoft.com/images/products/20808/products/J333JBJJ/Black/front/500.png?decache=63924106574097',
    front:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788883377/hollywood-studios-shows/jingle-bell-jingle-bam/approved-products-v5/J333JBJJ_FRONT.png',
    description:
      'Rain coverage for wet-weather calls and the walk back after the show.',
    features: ['Rain coverage', 'Removable hood', 'Full zip'],
  },
  {
    sku: 'L717',
    name: 'Port Authority® Women’s Active Soft Shell Jacket',
    short: 'Women’s Active Soft Shell',
    category: 'Soft shell',
    fit: 'Women’s fit',
    price: 275,
    back: 'https://cdn.inksoft.com/images/products/20808/products/L717JBJJ/Black/front/500.png?decache=63924106659923',
    front:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788883374/hollywood-studios-shows/jingle-bell-jingle-bam/approved-products-v5/L717JBJJ_FRONT.png',
    description:
      'An active soft shell with a women’s fit for cool evenings and room to move.',
    features: ['Active coverage', 'Soft shell', 'Full zip'],
  },
  {
    sku: 'L333',
    name: 'Port Authority® Women’s Torrent Waterproof Jacket',
    short: 'Women’s Torrent Waterproof',
    category: 'Waterproof',
    fit: 'Women’s fit',
    price: 295,
    back: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788880728/hollywood-studios-shows/jingle-bell-jingle-bam/approved-products-v4/L333JBJJ_BACK.png',
    front:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1788883380/hollywood-studios-shows/jingle-bell-jingle-bam/approved-products-v5/L333JBJJ_FRONT.png',
    description:
      'Wet-weather coverage with a women’s fit and a removable hood.',
    features: ['Rain coverage', 'Removable hood', 'Full zip'],
  },
];
export type JingleProduct = (typeof jingleProducts)[number];
