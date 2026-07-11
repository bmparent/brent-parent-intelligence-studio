import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const root = process.cwd();
const siteUrl = (process.env.VITE_SITE_URL || 'https://eidos-works.com').replace(/\/+$/, '');
const articlesPath = resolve(root, 'src/data/articles.json');
const publicDir = resolve(root, 'public');
const ogDir = resolve(publicDir, 'insights-og');
const reportDir = resolve(root, 'artifacts/insights');
const insightCategories = new Set([
  'Website Strategy',
  'Storefront UX',
  'Agentic SEO',
  'Automation',
  'Dashboards',
  'AI Prototyping',
  'Case Notes'
]);

const rawArticles = JSON.parse(await readFile(articlesPath, 'utf8'));
if (!Array.isArray(rawArticles)) throw new Error('src/data/articles.json must contain an array.');

for (const article of rawArticles) {
  if (!article || typeof article !== 'object' || Array.isArray(article)) throw new Error('Every article must be an object.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug ?? '')) throw new Error('Article slugs must be lowercase kebab-case.');
  if (article.canonicalPath !== `/insights/${article.slug}`) throw new Error(`Invalid canonical path for ${article.slug}.`);
  if (article.ogImage !== `/insights-og/${article.slug}.svg`) throw new Error(`Invalid OG image path for ${article.slug}.`);
  if (!insightCategories.has(article.category)) throw new Error(`Invalid category for ${article.slug}.`);
}

const articles = rawArticles
  .filter((article) => !article.draft)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

function xmlEscape(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function svgEscape(value = '') {
  return xmlEscape(value).replace(/\s+/g, ' ').trim();
}

function absolute(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function lastModified(article) {
  return article.updatedAt.slice(0, 10);
}

function pubDate(value) {
  return new Date(value).toUTCString();
}

function wrapTitle(title) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 34 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function generateSitemap() {
  const staticPages = [
    { loc: absolute('/'), lastmod: '2026-07-11', priority: '1.0' },
    { loc: absolute('/work'), lastmod: '2026-07-11', priority: '0.9' },
    { loc: absolute('/work/pernr-access-gate'), lastmod: '2026-07-11', priority: '0.8' },
    { loc: absolute('/work/production-dashboard'), lastmod: '2026-07-11', priority: '0.8' },
    { loc: absolute('/work/storefront-experience'), lastmod: '2026-07-11', priority: '0.8' },
    { loc: absolute('/services'), lastmod: '2026-07-11', priority: '0.9' },
    { loc: absolute('/services/digital-experiences'), lastmod: '2026-07-11', priority: '0.8' },
    { loc: absolute('/services/storefront-access-systems'), lastmod: '2026-07-11', priority: '0.8' },
    { loc: absolute('/services/dashboards-workflow-tools'), lastmod: '2026-07-11', priority: '0.8' },
    { loc: absolute('/services/agentic-seo'), lastmod: '2026-07-11', priority: '0.7' },
    { loc: absolute('/about'), lastmod: '2026-07-11', priority: '0.7' },
    { loc: absolute('/contact'), lastmod: '2026-07-11', priority: '0.8' },
    { loc: absolute('/lab/eidos-brain'), lastmod: '2026-07-11', priority: '0.5' },
    { loc: absolute('/snapshot'), lastmod: '2026-07-10', priority: '0.9' },
    { loc: absolute('/insights'), lastmod: '2026-07-10', priority: '0.9' },
    { loc: absolute('/editorial-policy'), lastmod: '2026-07-10', priority: '0.5' }
  ];

  const articlePages = articles.map((article) => ({
    loc: absolute(article.canonicalPath),
    lastmod: lastModified(article),
    priority: article.featured ? '0.8' : '0.6'
  }));

  const urls = [...staticPages, ...articlePages]
    .map((entry) => `  <url><loc>${xmlEscape(entry.loc)}</loc><lastmod>${entry.lastmod}</lastmod><priority>${entry.priority}</priority></url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function generateFeed() {
  const lastBuildDate = pubDate(articles[0]?.updatedAt ?? new Date().toISOString());
  const items = articles
    .slice(0, 30)
    .map(
      (article) => `    <item>
      <title>${xmlEscape(article.title)}</title>
      <link>${xmlEscape(absolute(article.canonicalPath))}</link>
      <guid>${xmlEscape(absolute(article.canonicalPath))}</guid>
      <pubDate>${pubDate(article.publishedAt)}</pubDate>
      <description>${xmlEscape(article.description)}</description>
      <category>${xmlEscape(article.category)}</category>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Eidos Works Insights</title>\n    <link>${xmlEscape(absolute('/insights'))}</link>\n    <description>Practical, source-linked notes on website strategy, storefront UX, automation, dashboards, and AI-ready search.</description>\n    <language>en-us</language>\n    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`;
}

function generateLlmsTxt() {
  const articleLines = articles.map((article) => `- [${article.title}](${absolute(article.canonicalPath)}): ${article.description}`);
  return `# Eidos Works\n\nEidos Works designs digital experiences and operational tools for organizations with complicated real-world workflows. Brent Parent is the founder, designer, developer, and operator behind the work.\n\n## Key pages\n- [Home](${absolute('/')})\n- [Selected Work](${absolute('/work')})\n- [PERNR Access Gate](${absolute('/work/pernr-access-gate')})\n- [Production Dashboard](${absolute('/work/production-dashboard')})\n- [Storefront Experience](${absolute('/work/storefront-experience')})\n- [Services](${absolute('/services')})\n- [About Brent Parent](${absolute('/about')})\n- [Insights](${absolute('/insights')})\n- [Contact](${absolute('/contact')})\n- [Eidos Brain Lab](${absolute('/lab/eidos-brain')})\n- [Eidos Snapshot](${absolute('/snapshot')})\n- [Agentic SEO](${absolute('/services/agentic-seo')})\n- [Editorial Policy](${absolute('/editorial-policy')})\n\n## Primary topics\n- Digital experience design and frontend development\n- Hosted storefront and employee access systems\n- Operational dashboards and workflow automation\n- Structured content and search-readiness\n- Proof-stage Eidos Brain research with human review\n\n## Insights\n${articleLines.join('\n')}\n\n## Contact\n- hello@eidos-works.com\n- projects@eidos-works.com\n`;
}

function generateOgSvg(article) {
  const titleLines = wrapTitle(article.title);
  const titleSvg = titleLines
    .map((line, index) => `<text x="72" y="${238 + index * 58}" class="title">${svgEscape(line)}</text>`)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${svgEscape(article.title)}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#081320"/>
      <stop offset="0.58" stop-color="#17253a"/>
      <stop offset="1" stop-color="#f1e2bd"/>
    </linearGradient>
    <style>
      .eyebrow { fill: #e7c77d; font: 800 30px Arial, sans-serif; letter-spacing: 5px; text-transform: uppercase; }
      .title { fill: #fff8ed; font: 800 52px Georgia, serif; }
      .meta { fill: #d8e1ee; font: 700 25px Arial, sans-serif; }
      .brand { fill: #fff8ed; font: 900 34px Arial, sans-serif; }
    </style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="44" y="44" width="1112" height="542" rx="34" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
  <circle cx="1010" cy="138" r="172" fill="rgba(231,199,125,0.16)"/>
  <circle cx="994" cy="488" r="236" fill="rgba(111,205,222,0.13)"/>
  <text x="72" y="126" class="brand">Eidos Works</text>
  <text x="72" y="184" class="eyebrow">${svgEscape(article.category)}</text>
  ${titleSvg}
  <text x="72" y="548" class="meta">${svgEscape(article.byline)} | ${article.publishedAt.slice(0, 10)} | ${article.readingTimeMinutes} min read</text>
</svg>
`;
}

await mkdir(ogDir, { recursive: true });
await mkdir(reportDir, { recursive: true });

const expectedOgFiles = new Set(articles.map((article) => `${article.slug}.svg`));
for (const entry of await readdir(ogDir, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.svg') && !expectedOgFiles.has(entry.name)) {
    await unlink(resolve(ogDir, entry.name));
  }
}

await writeFile(resolve(publicDir, 'sitemap.xml'), generateSitemap());
await writeFile(resolve(publicDir, 'feed.xml'), generateFeed());
await writeFile(resolve(publicDir, 'llms.txt'), generateLlmsTxt());

for (const article of articles) {
  const target = resolve(ogDir, `${article.slug}.svg`);
  if (!target.startsWith(`${resolve(ogDir)}${sep}`)) throw new Error(`Unsafe OG image target for ${article.slug}.`);
  await writeFile(target, generateOgSvg(article));
}

const report = {
  generated_at_utc: new Date().toISOString(),
  site_url: siteUrl,
  articles: articles.map((article) => ({
    slug: article.slug,
    canonical_url: absolute(article.canonicalPath),
    og_image: article.ogImage
  })),
  files: ['public/sitemap.xml', 'public/feed.xml', 'public/llms.txt', ...articles.map((article) => `public${article.ogImage}`)]
};

await writeFile(resolve(reportDir, 'latest-generation-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Generated sitemap, feed, llms.txt, and ${articles.length} article OG images for ${siteUrl}.`);
