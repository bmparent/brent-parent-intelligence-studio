import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const urls = [
  'https://eidosworks.pages.dev',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780939367/eidods_icon_clukns.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780939365/eidos_horizontal_bim82e.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780939364/eidos_Stacked_vzevuu.png',
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
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780500822/clcassroom_kids_early_learning_wqei5c.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780498737/kid_polos_early_learning_drfc87.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780434388/Y217_Iron_Grey_Flat_Front_copy_szc2tf.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780430039/early_leanrning_logo_vector_fkqbn6.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780409549/nature_girl_m6xkwb.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1780409548/explorer_bdj4pt.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1778687913/page_layout_kfu6el.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1778686547/ChatGPT_Image_Apr_27_2026_01_30_44_PM_kuxmec.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777919883/hoodies_o4zjaw.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777919882/hats_iqhnju.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776805050/ChatGPT_Image_Apr_21_2026_04_56_07_PM_tpznva.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776805049/ChatGPT_Image_Apr_21_2026_04_56_12_PM_p0jza4.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776783877/ChatGPT_Image_Apr_21_2026_11_04_13_AM_2_eqdum8.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777404633/epcotbanner_mz3b72.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777651345/ymca_banner1_vyt1qe.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916758/screen_printing_press_kri45u.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916765/north_ridge_academy_store_j1yn0s.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916764/river_city_raptors_store_eh3otv.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916763/maya_cole_studio_store_v0syfa.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916761/momentum_summit_store_wwgpvq.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916762/hope_harbor_fundraiser_store_b3xtei.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916759/bluepeak_service_team_store_jb0av8.png',
  'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777916760/crestview_prep_uniform_store_uxkibe.png',
  'https://dg-printavo-production-reports.1brent-bm.workers.dev/?range=custom&department=ALL&from=2026-06-04&to=2026-07-09'
];

const files = ['src/data/portfolio.ts', 'src/data/media.ts', 'src/config/site.ts', 'index.html', 'public/sitemap.xml', 'public/llms.txt'];
const content = await Promise.all(files.map((file) => readFile(resolve(process.cwd(), file), 'utf8'))).then((parts) => parts.join('\n'));
const missing = urls.filter((url) => !content.includes(url));

if (missing.length) {
  console.error('Missing URLs:');
  missing.forEach((url) => console.error(`- ${url}`));
  process.exit(1);
}

console.log(`Verified ${urls.length} required URLs are present in the source.`);
