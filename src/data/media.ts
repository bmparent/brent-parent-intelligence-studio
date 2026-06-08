export type MediaCategory =
  | 'Storefront Systems'
  | 'Graphic Design'
  | 'School & Apparel Mockups'
  | 'Campaign Banners'
  | 'Production & Operations'
  | 'Eidos / Brand Assets';

export type WorkMediaItem = {
  id: string;
  src: string;
  alt: string;
  category: MediaCategory;
  title: string;
  client?: string;
  type: 'storefront' | 'mockup' | 'banner' | 'brand' | 'operations';
  caption: string;
  relatedHref?: string;
  liveUrl?: string;
  isAdditional?: boolean;
  alreadyUsed?: boolean;
};

export const mediaCategories: MediaCategory[] = [
  'Storefront Systems',
  'Graphic Design',
  'School & Apparel Mockups',
  'Campaign Banners',
  'Production & Operations',
  'Eidos / Brand Assets'
];

const items: WorkMediaItem[] = [
  {
    id: 'custom-gear-store-3d',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916767/custom_gear_store_3d_mockup_thqvxr.png',
    alt: 'Custom gear storefront mockup showing apparel, product categories, and multi-device store previews.',
    category: 'Storefront Systems',
    title: 'Custom Gear Store System',
    type: 'storefront',
    caption: 'A multi-device commerce direction for branded apparel programs and product-category clarity.',
    relatedHref: '#work',
    alreadyUsed: true
  },
  {
    id: 'maya-cole-store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916763/maya_cole_studio_store_v0syfa.png',
    alt: 'Maya Cole Studio storefront mockup with desktop and mobile previews.',
    category: 'Storefront Systems',
    title: 'Maya Cole Studio Store',
    client: 'Maya Cole Studio',
    type: 'storefront',
    caption: 'Creator commerce with softer editorial hierarchy, product storytelling, and warm conversion cues.',
    relatedHref: '#work',
    alreadyUsed: true
  },
  {
    id: 'hope-harbor-store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916762/hope_harbor_fundraiser_store_b3xtei.png',
    alt: 'Hope Harbor fundraiser storefront mockup with donation and apparel previews.',
    category: 'Storefront Systems',
    title: 'Hope Harbor Fundraiser Store',
    client: 'Hope Harbor',
    type: 'storefront',
    caption: 'Fundraiser commerce framed around cause, trust, donation context, and clear shopping action.',
    relatedHref: '#work',
    alreadyUsed: true
  },
  {
    id: 'momentum-summit-store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916761/momentum_summit_store_wwgpvq.png',
    alt: 'Momentum Summit event merchandise storefront mockup with desktop and mobile screens.',
    category: 'Storefront Systems',
    title: 'Momentum Summit Store',
    client: 'Momentum Summit',
    type: 'storefront',
    caption: 'Event merchandise direction with launch urgency, attendee kits, and scannable product paths.',
    relatedHref: '#work',
    alreadyUsed: true
  },
  {
    id: 'north-ridge-academy-store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916765/north_ridge_academy_store_j1yn0s.png',
    alt: 'North Ridge Academy storefront example with school apparel merchandising.',
    category: 'Storefront Systems',
    title: 'North Ridge Academy Store',
    client: 'North Ridge Academy',
    type: 'storefront',
    caption: 'A school-store direction built for families who need official apparel paths without clutter.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'river-city-raptors-store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916764/river_city_raptors_store_eh3otv.png',
    alt: 'River City Raptors storefront example with team merchandise presentation.',
    category: 'Storefront Systems',
    title: 'River City Raptors Store',
    client: 'River City Raptors',
    type: 'storefront',
    caption: 'Team merchandise organized around bold school spirit, mobile browsing, and quick product choice.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'bluepeak-service-team-store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916759/bluepeak_service_team_store_jb0av8.png',
    alt: 'Bluepeak service team storefront example with uniform and team gear presentation.',
    category: 'Storefront Systems',
    title: 'Bluepeak Service Team Store',
    client: 'Bluepeak',
    type: 'storefront',
    caption: 'A more operational storefront pattern for teams buying job-ready gear and branded essentials.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'crestview-prep-store',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916760/crestview_prep_uniform_store_uxkibe.png',
    alt: 'Crestview Prep uniform storefront example with school uniform categories.',
    category: 'Storefront Systems',
    title: 'Crestview Prep Uniform Store',
    client: 'Crestview Prep',
    type: 'storefront',
    caption: 'Uniform shopping direction with official category framing and parent-friendly product discovery.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'cl-classroom-kids',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780500822/clcassroom_kids_early_learning_wqei5c.png',
    alt: 'Early learning classroom children graphic for a school apparel or campaign concept.',
    category: 'Graphic Design',
    title: 'Early Learning Classroom Graphic',
    client: 'Liberty Christian Early Learning',
    type: 'mockup',
    caption: 'Warm school-day visual direction for apparel, banners, and parent-facing campaign materials.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'kid-polos-early-learning',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780498737/kid_polos_early_learning_drfc87.png',
    alt: 'Early learning kids polo apparel mockup.',
    category: 'School & Apparel Mockups',
    title: 'Early Learning Polo Mockup',
    client: 'Liberty Christian Early Learning',
    type: 'mockup',
    caption: 'Apparel mockup built to help families see fit, style, and program identity before ordering.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'iron-grey-flat-front',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780434388/Y217_Iron_Grey_Flat_Front_copy_szc2tf.png',
    alt: 'Iron grey apparel flat front product mockup.',
    category: 'School & Apparel Mockups',
    title: 'Iron Grey Apparel Flat',
    type: 'mockup',
    caption: 'Clean product mockup treatment for apparel listings, category pages, and ordering confidence.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'early-learning-logo-vector',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780430039/early_leanrning_logo_vector_fkqbn6.png',
    alt: 'Early learning logo vector graphic.',
    category: 'Graphic Design',
    title: 'Early Learning Logo Direction',
    client: 'Liberty Christian Early Learning',
    type: 'brand',
    caption: 'A friendly logo asset prepared for storefront, print, apparel, and campaign use.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'nature-girl',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780409549/nature_girl_m6xkwb.png',
    alt: 'Nature-themed child illustration for apparel or school campaign design.',
    category: 'Graphic Design',
    title: 'Nature Explorer Graphic',
    type: 'mockup',
    caption: 'Illustrative campaign art that gives school apparel a more memorable visual identity.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'explorer',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780409548/explorer_bdj4pt.png',
    alt: 'Explorer-themed graphic design artwork.',
    category: 'Graphic Design',
    title: 'Explorer Artwork',
    type: 'mockup',
    caption: 'A concept-art direction for youth apparel, events, or school identity campaigns.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'page-layout',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1778687913/page_layout_kfu6el.png',
    alt: 'Storefront or campaign page layout mockup.',
    category: 'Graphic Design',
    title: 'Campaign Page Layout',
    type: 'mockup',
    caption: 'Page composition study for clearer visual hierarchy and campaign-specific product storytelling.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'april-27-campaign-visual',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1778686547/ChatGPT_Image_Apr_27_2026_01_30_44_PM_kuxmec.png',
    alt: 'Generated campaign visual mockup for apparel or storefront presentation.',
    category: 'Graphic Design',
    title: 'Campaign Visual Mockup',
    type: 'mockup',
    caption: 'Generated visual direction used to explore mood, product story, and shopper-facing hierarchy.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'hoodies',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777919883/hoodies_o4zjaw.png',
    alt: 'Hoodie apparel mockup lineup.',
    category: 'School & Apparel Mockups',
    title: 'Hoodie Product Mockups',
    type: 'mockup',
    caption: 'Apparel product mockups that make category pages easier to scan before launch.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'hats',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777919882/hats_iqhnju.png',
    alt: 'Hat product mockup lineup.',
    category: 'School & Apparel Mockups',
    title: 'Hat Product Mockups',
    type: 'mockup',
    caption: 'Headwear mockups prepared for clearer product merchandising and campaign launch previews.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'april-21-visual-a',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776805050/ChatGPT_Image_Apr_21_2026_04_56_07_PM_tpznva.png',
    alt: 'Generated apparel or brand campaign visual mockup.',
    category: 'Graphic Design',
    title: 'Brand Campaign Visual A',
    type: 'mockup',
    caption: 'Exploratory design art for campaign tone, product storytelling, and branded presentation.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'april-21-visual-b',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776805049/ChatGPT_Image_Apr_21_2026_04_56_12_PM_p0jza4.png',
    alt: 'Generated apparel or brand campaign visual variation.',
    category: 'Graphic Design',
    title: 'Brand Campaign Visual B',
    type: 'mockup',
    caption: 'Visual variation used to compare campaign mood, color, and brand fit before production.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'april-21-visual-c',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776783877/ChatGPT_Image_Apr_21_2026_11_04_13_AM_2_eqdum8.png',
    alt: 'Generated apparel campaign mockup with product-oriented visual treatment.',
    category: 'School & Apparel Mockups',
    title: 'Apparel Campaign Mockup',
    type: 'mockup',
    caption: 'Product-oriented visual concept for launch planning and buyer-facing presentation.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'epcot-banner',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777404633/epcotbanner_mz3b72.png',
    alt: 'Epcot-themed banner design.',
    category: 'Campaign Banners',
    title: 'Epcot Campaign Banner',
    type: 'banner',
    caption: 'Banner design direction for a specific campaign surface and storefront promotion.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'ymca-banner',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777651345/ymca_banner1_vyt1qe.png',
    alt: 'YMCA campaign banner design.',
    category: 'Campaign Banners',
    title: 'YMCA Campaign Banner',
    client: 'YMCA',
    type: 'banner',
    caption: 'Community organization banner treatment for clearer campaign entry and branded merchandise context.',
    relatedHref: '#work',
    isAdditional: true
  },
  {
    id: 'screen-printing-press',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916758/screen_printing_press_kri45u.png',
    alt: 'Screen printing press production image.',
    category: 'Production & Operations',
    title: 'Screen Printing Production Context',
    type: 'operations',
    caption: 'Production-side visual context that connects storefront work to real decorated-apparel operations.',
    relatedHref: '#production',
    isAdditional: true
  },
  {
    id: 'eidos-horizontal-logo',
    src: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780939365/eidos_horizontal_bim82e.png',
    alt: 'Eidos Works horizontal logo.',
    category: 'Eidos / Brand Assets',
    title: 'Eidos Works Horizontal Mark',
    type: 'brand',
    caption: 'Primary horizontal logo used for the public-facing Eidos Works brand.',
    relatedHref: '#top',
    isAdditional: true
  }
];

export const workMedia = Array.from(new Map(items.map((item) => [item.src, item])).values());

export const featuredMedia = workMedia.filter((item) =>
  ['custom-gear-store-3d', 'north-ridge-academy-store', 'cl-classroom-kids', 'screen-printing-press'].includes(item.id)
);
