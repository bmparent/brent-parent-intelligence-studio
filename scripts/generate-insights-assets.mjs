import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const siteUrl = (process.env.VITE_SITE_URL || 'https://eidos-works.com').replace(/\/+$/, '');
const articlesPath = resolve(root, 'src/data/articles.json');
const publicDir = resolve(root, 'public');
const ogDir = resolve(publicDir, 'insights-og');
const reportDir = resolve(root, 'artifacts/insights');

const rawArticles = JSON.parse(await readFile(articlesPath, 'utf8'));
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
    { loc: absolute('/'), lastmod: '2026-07-10', priority: '1.0' },
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

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Eidos Works Insights</title>\n    <link>${xmlEscape(absolute('/insights'))}</link>\n    <description>Source-linked articles on storefront UX, automation, AI-ready search, operations, media workflows, and applied systems.</description>\n    <language>en-us</language>\n    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`;
}

function generateLlmsTxt() {
  const articleLines = articles.map((article) => `- [${article.title}](${absolute(article.canonicalPath)}): ${article.description}`);
  return `# Eidos Works\n\nEidos Works is a creative technology and intelligence studio by Brent Parent. The site covers custom storefront experiences, graphic design and mockups, production dashboards, workflow automation, Eidos Brain/Sentinel prototypes, and practical articles about UI/UX, operations, media workflows, and applied AI.\n\n## Key pages\n- [Home](${absolute('/')})\n- [Insights](${absolute('/insights')})\n- [Editorial Policy](${absolute('/editorial-policy')})\n\n## Primary topics\n- Custom InkSoft storefronts and apparel commerce UX\n- Graphic design, campaign banners, and apparel mockups\n- Production dashboards and reporting workflows\n- Workflow automation and operational cleanup\n- Agentic search, structured data, and AI-ready content systems\n- Eidos Brain and Sentinel intelligence prototypes\n\n## Insights\n${articleLines.join('\n')}\n`;
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
await writeFile(resolve(publicDir, 'sitemap.xml'), generateSitemap());
await writeFile(resolve(publicDir, 'feed.xml'), generateFeed());
await writeFile(resolve(publicDir, 'llms.txt'), generateLlmsTxt());

for (const article of articles) {
  await writeFile(resolve(publicDir, article.ogImage.replace(/^\/+/, '')), generateOgSvg(article));
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
