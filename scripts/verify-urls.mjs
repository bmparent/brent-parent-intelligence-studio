import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const urls = [
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777664829/ChatGPT_Image_May_1_2026_03_42_06_PM_ipnyby.png',
  'https://stores.inksoft.com/disney_junior_shows/shop/home',
  'https://stores.inksoft.com/disney_hollywood_studios_shows/shop/home',
  'https://stores.inksoft.com/mdca_preorders/shop/home',
  'https://stores.inksoft.com/mdca_webstore_/shop/home',
  'https://stores.inksoft.com/Liberty_Christian_Preparatory_Sc/shop/home',
  'https://stores.inksoft.com/ymcacf/shop/home',
  'https://stores.inksoft.com/liberty_christian_early_learnin/shop/home',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916767/custom_gear_store_3d_mockup_thqvxr.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916763/maya_cole_studio_store_v0syfa.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916762/hope_harbor_fundraiser_store_b3xtei.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916761/momentum_summit_store_wwgpvq.png',
  'https://dg-printavo-production-reports.1brent-bm.workers.dev/?range=custom&department=ALL&from=2026-06-04&to=2026-07-09'
];

const files = ['src/data/portfolio.ts', 'index.html'];
const content = await Promise.all(files.map((file) => readFile(resolve(process.cwd(), file), 'utf8'))).then((parts) => parts.join('\n'));
const missing = urls.filter((url) => !content.includes(url));

if (missing.length) {
  console.error('Missing URLs:');
  missing.forEach((url) => console.error(`- ${url}`));
  process.exit(1);
}

console.log(`Verified ${urls.length} required URLs are present in the source.`);
