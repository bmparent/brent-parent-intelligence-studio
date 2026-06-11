import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();

const requiredExternalUrls = [
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

const requiredRoutes = [
  '/',
  '/intelligence',
  '/intelligence/ui-ux-standards-2026',
  '/intelligence/agentic-seo-guide',
  '/intelligence/ai-search-visibility',
  '/intelligence/design-systems',
  '/intelligence/glassmorphism-accessibility',
  '/intelligence/seo-for-ai-browsers',
  '/ui-ux',
  '/agentic-seo',
  '/automation',
  '/tools',
  '/tools/automation-score',
  '/tools/agentic-seo-readiness-checker',
  '/tools/ui-ux-site-audit-checklist',
  '/newsletter',
  '/resources',
  '/resources/tool-stack',
  '/resources/templates',
  '/resources/recommended-tools',
  '/sponsors',
  '/advertise',
  '/disclosures',
  '/privacy',
  '/terms',
  '/work-with-eidos',
  '/audit'
];

const sourceFiles = [
  'src/data/portfolio.ts',
  'src/data/platform.ts',
  'src/components/platform/Pages.tsx',
  'index.html'
];

const sourceContent = await Promise.all(
  sourceFiles.map((file) => readFile(resolve(root, file), 'utf8'))
).then((parts) => parts.join('\n'));

const missingExternalUrls = requiredExternalUrls.filter((url) => !sourceContent.includes(url));

if (missingExternalUrls.length) {
  console.error('Missing required external URLs:');
  missingExternalUrls.forEach((url) => console.error(`- ${url}`));
  process.exit(1);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function routeOutputPath(route) {
  if (route === '/') return resolve(root, 'dist/index.html');
  return resolve(root, 'dist', route.slice(1), 'index.html');
}

function cleanRouteOutputPath(route) {
  if (route === '/') return resolve(root, 'dist/index.html');
  return resolve(root, 'dist', `${route.slice(1)}.html`);
}

const missingRoutes = [];
const missingCleanRoutes = [];
const weakRoutes = [];
const routeHtml = new Map();

for (const route of requiredRoutes) {
  const outputPath = routeOutputPath(route);
  if (!(await fileExists(outputPath))) {
    missingRoutes.push(route);
    continue;
  }

  const html = await readFile(outputPath, 'utf8');
  routeHtml.set(route, html);
  if (!html.includes('<main id="main">') || !html.includes('<h1')) {
    weakRoutes.push(route);
  }

  if (!(await fileExists(cleanRouteOutputPath(route)))) {
    missingCleanRoutes.push(route);
  }
}

if (missingRoutes.length || missingCleanRoutes.length || weakRoutes.length) {
  if (missingRoutes.length) {
    console.error('Missing prerendered routes:');
    missingRoutes.forEach((route) => console.error(`- ${route}`));
  }
  if (missingCleanRoutes.length) {
    console.error('Missing clean route HTML files:');
    missingCleanRoutes.forEach((route) => console.error(`- ${route}`));
  }
  if (weakRoutes.length) {
    console.error('Routes missing main content evidence:');
    weakRoutes.forEach((route) => console.error(`- ${route}`));
  }
  process.exit(1);
}

const sitemap = await readFile(resolve(root, 'dist/sitemap.xml'), 'utf8');
const robots = await readFile(resolve(root, 'dist/robots.txt'), 'utf8');
const llms = await readFile(resolve(root, 'dist/llms.txt'), 'utf8');
const rss = await readFile(resolve(root, 'dist/rss.xml'), 'utf8');

const missingSitemapRoutes = requiredRoutes.filter((route) => !sitemap.includes(route === '/' ? 'pages.dev/' : route));

if (missingSitemapRoutes.length) {
  console.error('Sitemap is missing routes:');
  missingSitemapRoutes.forEach((route) => console.error(`- ${route}`));
  process.exit(1);
}

if (!robots.includes('OAI-SearchBot') || !robots.includes('Sitemap: https://brent-parent-intelligence-studio.pages.dev/sitemap.xml')) {
  console.error('robots.txt does not include expected AI-search crawler policy and sitemap reference.');
  process.exit(1);
}

if (!llms.includes('not treated as an SEO ranking mechanism')) {
  console.error('llms.txt does not include the required ranking-mechanism caveat.');
  process.exit(1);
}

if (!rss.includes('<rss version="2.0">') || !rss.includes('Agentic SEO')) {
  console.error('RSS feed does not include expected article entries.');
  process.exit(1);
}

function stripRoute(value) {
  const withoutHash = value.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0];
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) return withoutQuery.slice(0, -1);
  return withoutQuery || '/';
}

function anchorExists(html, anchor) {
  if (!anchor) return true;
  return html.includes(`id="${anchor}"`) || html.includes(`name="${anchor}"`);
}

const internalLinkProblems = [];

for (const [route, html] of routeHtml.entries()) {
  const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]);

  for (const href of hrefs) {
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('data:')
    ) {
      continue;
    }

    if (href.startsWith('#')) {
      if (!anchorExists(html, href.slice(1))) {
        internalLinkProblems.push(`${route} -> ${href}`);
      }
      continue;
    }

    if (href.startsWith('/assets/') || href === '/favicon.svg' || href === '/social-preview.svg' || href === '/rss.xml') {
      continue;
    }

    const targetRoute = stripRoute(href);
    const targetHash = href.includes('#') ? href.split('#')[1] : '';

    if (!requiredRoutes.includes(targetRoute)) {
      internalLinkProblems.push(`${route} -> ${href}`);
      continue;
    }

    if (targetHash && !anchorExists(routeHtml.get(targetRoute) ?? '', targetHash)) {
      internalLinkProblems.push(`${route} -> ${href}`);
    }
  }
}

if (internalLinkProblems.length) {
  console.error('Broken internal links or anchors:');
  internalLinkProblems.forEach((problem) => console.error(`- ${problem}`));
  process.exit(1);
}

console.log(`Verified ${requiredExternalUrls.length} legacy URLs, ${requiredRoutes.length} platform routes, sitemap, robots, RSS, llms.txt, and internal links.`);
