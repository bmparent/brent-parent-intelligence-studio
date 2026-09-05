import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const requiredRoutes = [
  '/',
  '/work',
  '/work/pernr-access-gate',
  '/work/production-dashboard',
  '/work/storefront-experience',
  '/services',
  '/services/digital-experiences',
  '/services/storefront-access-systems',
  '/services/dashboards-workflow-tools',
  '/services/agentic-seo',
  '/about',
  '/insights',
  '/contact',
  '/lab/eidos-brain',
  '/snapshot',
  '/lab',
  '/community',
  '/community/agents',
  '/community/agent-guide',
  '/community/guidelines',
  '/privacy',
  '/terms',
  '/shop/cinematic-starter',
  '/work/nighttime-spectaculars',
  '/work/holidays-in-hollywood',
];

function routeFile(route) {
  return route === '/'
    ? resolve(root, 'dist/index.html')
    : resolve(root, `dist/${route.slice(1)}/index.html`);
}

function count(source, expression) {
  return [...source.matchAll(expression)].length;
}

for (const route of requiredRoutes) {
  const file = routeFile(route);
  try {
    await access(file);
  } catch {
    failures.push(`${route}: prerendered route is missing`);
    continue;
  }

  const html = await readFile(file, 'utf8');
  const canonical =
    route === '/'
      ? 'https://eidos-works.com/'
      : `https://eidos-works.com${route}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}" />`))
    failures.push(`${route}: canonical does not match ${canonical}`);
  if (count(html, /<h1(?:\s|>)/gi) !== 1)
    failures.push(`${route}: expected exactly one h1`);
}

const home = await readFile(routeFile('/'), 'utf8');
const density = {
  sections: count(home, /<section(?:\s|>)/gi),
  h2: count(home, /<h2(?:\s|>)/gi),
  h3: count(home, /<h3(?:\s|>)/gi),
  articles: count(home, /<article(?:\s|>)/gi),
  buttons: count(home, /<button(?:\s|>)/gi),
  links: count(home, /<a(?:\s|>)/gi),
  images: count(home, /<img(?:\s|>)/gi),
};

if (density.sections > 10)
  failures.push(
    `home: ${density.sections} sections exceeds the editorial limit of 10`,
  );
if (density.h2 > 8)
  failures.push(
    `home: ${density.h2} h2 headings exceeds the editorial limit of 8`,
  );
if (density.articles > 12)
  failures.push(
    `home: ${density.articles} article containers exceeds the editorial limit of 12`,
  );
if (density.buttons > 10)
  failures.push(
    `home: ${density.buttons} buttons exceeds the editorial limit of 10`,
  );
if (
  /Portrait of Brent Parent|ChatGPT_Image_May_1_2026_03_42_06_PM_ipnyby/i.test(
    home,
  )
) {
  failures.push('home: founder portrait is still present');
}
// The approved redesign leads with the two cinematic storefronts and the current Lab.
for (const evidence of [
  'ns-hero-dhs-desktop-v1.webp',
  'hih-full-storefront-reference-v2.webp',
  'sentinel-lab.webp',
]) {
  if (!home.includes(evidence))
    failures.push(`home: studio work composition is missing ${evidence}`);
}
if (!home.includes('Founded by Brent Parent in Central Florida.'))
  failures.push('home: subtle founder attribution is missing');

for (const label of ['Work', 'Lab', 'Community', 'Studio']) {
  if (!home.includes(`>${label}</a>`))
    failures.push(`home: primary navigation is missing ${label}`);
}
for (const excluded of [
  '>Diagnostics</a>',
  '>Eidos Brain</a>',
  '>Pricing</a>',
  '>Snapshot</a>',
  '>Agentic SEO</a>',
]) {
  if (home.includes(excluded))
    failures.push(
      `home: primary navigation still includes ${excluded.slice(1, -4)}`,
    );
}

for (const route of [
  '/work/pernr-access-gate',
  '/work/production-dashboard',
  '/work/storefront-experience',
]) {
  const html = await readFile(routeFile(route), 'utf8');
  if (!/role disclosure/i.test(html))
    failures.push(`${route}: role disclosure is missing`);
  if (!/unproven|unknown/i.test(html))
    failures.push(`${route}: remaining uncertainty is missing`);
}

const services = await readFile(routeFile('/services'), 'utf8');
for (const image of [
  'digital-experiences.png',
  'storefront-experience-framed.png',
  'production-dashboard.png',
]) {
  if (!services.includes(image))
    failures.push(`/services: matched service image is missing: ${image}`);
}

const about = await readFile(routeFile('/about'), 'utf8');
if (!/Illustrated portrait of Brent Parent/i.test(about))
  failures.push('/about: founder portrait is missing');
if (!/collaborate with client teams/i.test(about))
  failures.push('/about: collaborative studio language is missing');

const prohibitedPrimaryCopy = [
  'service families',
  'operating surface',
  'presentation layer',
  'planning-ready view',
  'a human operator uses the view',
  'notes from implementation, not a content machine',
  'what brent designed and built',
];
for (const route of [
  '/',
  '/services',
  '/work/production-dashboard',
  '/work/storefront-experience',
]) {
  const html = (await readFile(routeFile(route), 'utf8')).toLowerCase();
  for (const phrase of prohibitedPrimaryCopy) {
    if (html.includes(phrase))
      failures.push(`${route}: prohibited primary copy remains: ${phrase}`);
  }
}

const sitemap = await readFile(resolve(root, 'dist/sitemap.xml'), 'utf8');
for (const route of requiredRoutes.filter(
  (route) => !route.startsWith('/snapshot/'),
)) {
  const url =
    route === '/'
      ? 'https://eidos-works.com/'
      : `https://eidos-works.com${route}`;
  if (!sitemap.includes(`<loc>${url}</loc>`))
    failures.push(`sitemap: missing ${url}`);
}
for (const privateRoute of [
  '/snapshot/start',
  '/snapshot/success',
  '/snapshot/result/',
  '/shop/success',
  '/community/moderate',
]) {
  if (sitemap.includes(privateRoute))
    failures.push(`sitemap: private route leaked: ${privateRoute}`);
}

for (const image of [
  'pernr-access-gate.png',
  'production-dashboard.png',
  'storefront-experience-framed.png',
]) {
  try {
    await access(resolve(root, `dist/images/case-studies/${image}`));
  } catch {
    failures.push(`case evidence image is missing: ${image}`);
  }
}
try {
  await access(resolve(root, 'dist/images/services/digital-experiences.png'));
} catch {
  failures.push('service evidence image is missing: digital-experiences.png');
}

if (failures.length) {
  console.error(`Editorial verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(
  `Editorial verification passed for ${requiredRoutes.length} routes.`,
);
console.log(`Homepage density: ${JSON.stringify(density)}`);
