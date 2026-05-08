export type WorkLink = {
  title: string
  type: string
  href: string
  image?: string
  note: string
  tags: string[]
}

export const portraitUrl =
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777664829/ChatGPT_Image_May_1_2026_03_42_06_PM_ipnyby.png'

export const cloudinaryAssets = {
  epcotHero:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777571651/ChatGPT_Image_Apr_30_2026_01_17_47_PM_keroas.png',
  epcotBanner:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777404633/epcotbanner_mz3b72.png',
  encantoModel:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777575329/encanto_model_ansmoe.png',
  broadwayModel:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777575329/broadway_model_gl99le.png',
  candlelightModels:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777575329/candlelight_models_n2ihhj.png',
  animalKingdomBanner:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777483710/animal_kingdom_banner_mttqh4.png',
  ymcaCategory:
    'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776783875/ChatGPT_Image_Apr_21_2026_11_04_19_AM_5_gqpeq2.png',
}

export const selectedWork: WorkLink[] = [
  {
    title: 'Animal Kingdom Shows',
    type: 'InkSoft storefront',
    href: 'https://stores.inksoft.com/wdw_animal_kingdom',
    image: cloudinaryAssets.animalKingdomBanner,
    note: 'Warm environmental storefront concept with atmospheric category motion and full-width custom sections.',
    tags: ['InkSoft', 'Three.js', 'Storefront UX', 'Cloudinary'],
  },
  {
    title: 'EPCOT Shows',
    type: 'InkSoft storefront',
    href: 'https://stores.inksoft.com/epcot_shows',
    image: cloudinaryAssets.epcotBanner,
    note: 'Layered hero, separated model assets, custom embeds, and motion planning for a stage-like shopping experience.',
    tags: ['InkSoft', 'Three.js', 'Cloudinary', 'Interactive UX'],
  },
  {
    title: 'Liberty Christian Preparatory School',
    type: 'School storefront',
    href: 'https://stores.inksoft.com/Liberty_Christian_Preparatory_Sc',
    note: 'Storefront structure and launch-ready presentation for a school apparel experience.',
    tags: ['InkSoft', 'Storefront UX', 'Responsive Layout'],
  },
  {
    title: 'YMCA of Central Florida Staff Store',
    type: 'Brand-aligned category system',
    href: 'https://stores.inksoft.com/cfymca',
    image: cloudinaryAssets.ymcaCategory,
    note: 'Staff apparel category direction with branded navigation concepts and mobile storefront thinking.',
    tags: ['InkSoft', 'Brand Research', 'Category UX', 'Cloudinary'],
  },
  {
    title: 'YMCA of Central Florida',
    type: 'Reference website',
    href: 'https://ymcacf.org/',
    note: 'Brand reference for staff-store category alignment and visual system decisions.',
    tags: ['Brand Reference', 'Content Structure'],
  },
  {
    title: 'Eidos Brain',
    type: 'Operational intelligence system',
    href: '#eidos',
    note: 'Sentinel-style signal monitoring, memory, forecasting, incident cards, and human-reviewable recommendations.',
    tags: ['Eidos Brain', 'Python', 'Google Cloud', 'AI Assistant', 'Operational Intelligence'],
  },
]
