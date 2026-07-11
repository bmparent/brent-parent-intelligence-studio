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
  '/snapshot'
];

function routeFile(route) {
  return route === '/' ? resolve(root, 'dist/index.html') : resolve(root, `dist/${route.slice(1)}/index.html`);
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
  const canonical = route === '/' ? 'https://eidos-works.com/' : `https://eidos-works.com${route}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) failures.push(`${route}: canonical does not match ${canonical}`);
  if (count(html, /<h1(?:\s|>)/gi) !== 1) failures.push(`${route}: expected exactly one h1`);
}

const home = await readFile(routeFile('/'), 'utf8');
const density = {
  sections: count(home, /<section(?:\s|>)/gi),
  h2: count(home, /<h2(?:\s|>)/gi),
  h3: count(home, /<h3(?:\s|>)/gi),
  articles: count(home, /<article(?:\s|>)/gi),
  buttons: count(home, /<button(?:\s|>)/gi),
  links: count(home, /<a(?:\s|>)/gi),
  images: count(home, /<img(?:\s|>)/gi)
};

if (density.sections > 10) failures.push(`home: ${density.sections} sections exceeds the editorial limit of 10`);
if (density.h2 > 8) failures.push(`home: ${density.h2} h2 headings exceeds the editorial limit of 8`);
if (density.articles > 12) failures.push(`home: ${density.articles} article containers exceeds the editorial limit of 12`);
if (density.buttons > 10) failures.push(`home: ${density.buttons} buttons exceeds the editorial limit of 10`);

for (const label of ['Work', 'Services', 'About', 'Insights', 'Contact']) {
  if (!home.includes(`>${label}</a>`)) failures.push(`home: primary navigation is missing ${label}`);
}
for (const excluded of ['>Diagnostics</a>', '>Eidos Brain</a>', '>Pricing</a>', '>Snapshot</a>', '>Agentic SEO</a>']) {
  if (home.includes(excluded)) failures.push(`home: primary navigation still includes ${excluded.slice(1, -4)}`);
}

for (const route of ['/work/pernr-access-gate', '/work/production-dashboard', '/work/storefront-experience']) {
  const html = await readFile(routeFile(route), 'utf8');
  if (!/role disclosure/i.test(html)) failures.push(`${route}: role disclosure is missing`);
  if (!/unproven|unknown/i.test(html)) failures.push(`${route}: remaining uncertainty is missing`);
}

const sitemap = await readFile(resolve(root, 'dist/sitemap.xml'), 'utf8');
for (const route of requiredRoutes.filter((route) => !route.startsWith('/snapshot/'))) {
  const url = route === '/' ? 'https://eidos-works.com/' : `https://eidos-works.com${route}`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap: missing ${url}`);
}
for (const privateRoute of ['/snapshot/start', '/snapshot/success', '/snapshot/result/']) {
  if (sitemap.includes(privateRoute)) failures.push(`sitemap: private route leaked: ${privateRoute}`);
}

for (const image of ['pernr-access-gate.png', 'production-dashboard.png', 'storefront-experience-framed.png']) {
  try {
    await access(resolve(root, `dist/images/case-studies/${image}`));
  } catch {
    failures.push(`case evidence image is missing: ${image}`);
  }
}

if (failures.length) {
  console.error(`Editorial verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Editorial verification passed for ${requiredRoutes.length} routes.`);
console.log(`Homepage density: ${JSON.stringify(density)}`);
