import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.cwd());
const distDir = resolve(root, 'dist');
const templatePath = resolve(distDir, 'index.html');
const serverEntry = resolve(root, 'dist-ssr/entry-server.js');

const template = await readFile(templatePath, 'utf8');
const {
  render,
  getPrerenderRoutes,
  getPrerenderMeta,
  routeMetas,
  siteConfig
} = await import(pathToFileURL(serverEntry).href);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function absoluteUrl(path) {
  return `${siteConfig.url}${path === '/' ? '/' : path}`;
}

function replaceOrInsert(headHtml, pattern, replacement, before = '</head>') {
  if (pattern.test(headHtml)) return headHtml.replace(pattern, replacement);
  return headHtml.replace(before, `${replacement}\n  ${before}`);
}

function applyHead(html, meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = absoluteUrl(meta.path);

  let next = html
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`);

  next = replaceOrInsert(
    next,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`
  );

  return next;
}

function outputPathsForRoute(route) {
  if (route === '/') return [resolve(distDir, 'index.html')];
  return [
    resolve(distDir, route.slice(1), 'index.html'),
    resolve(distDir, `${route.slice(1)}.html`)
  ];
}

function sitemapXml() {
  const urls = routeMetas
    .map((route) => {
      return [
        '  <url>',
        `    <loc>${absoluteUrl(route.path)}</loc>`,
        `    <lastmod>${route.lastmod}</lastmod>`,
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority.toFixed(2)}</priority>`,
        '  </url>'
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function rssXml() {
  const articleRoutes = routeMetas.filter((route) => route.path.startsWith('/intelligence/') && route.path !== '/intelligence');
  const items = articleRoutes
    .map((route) => {
      const url = absoluteUrl(route.path);
      return [
        '    <item>',
        `      <title>${escapeHtml(route.title.replace(' - Eidos Works', ''))}</title>`,
        `      <link>${url}</link>`,
        `      <guid>${url}</guid>`,
        `      <description>${escapeHtml(route.description)}</description>`,
        `      <pubDate>${new Date(`${route.lastmod}T12:00:00Z`).toUTCString()}</pubDate>`,
        '    </item>'
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${siteConfig.name}</title>\n    <link>${siteConfig.url}/</link>\n    <description>${escapeHtml(siteConfig.tagline)}</description>\n${items}\n  </channel>\n</rss>\n`;
}

function robotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    'Allow: /assets/',
    'Allow: /favicon.svg',
    'Allow: /social-preview.svg',
    '',
    '# AI search crawlers are allowed for discoverability.',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    '# Training-crawler policy can be changed when Eidos chooses a formal content-licensing stance.',
    'User-agent: GPTBot',
    'Disallow: /',
    '',
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    ''
  ].join('\n');
}

function llmsTxt() {
  const routeLines = routeMetas
    .filter((route) => route.path === '/' || route.path.startsWith('/intelligence') || route.path.startsWith('/tools') || route.path.startsWith('/resources'))
    .map((route) => `- [${route.title.replace(' - Eidos Works', '')}](${absoluteUrl(route.path)}): ${route.description}`)
    .join('\n');

  return [
    `# ${siteConfig.name}`,
    '',
    siteConfig.tagline,
    '',
    'This file is a human-readable orientation index for AI assistants and web agents. It is not treated as an SEO ranking mechanism.',
    '',
    '## Important Routes',
    routeLines,
    '',
    '## Editorial Standard',
    'Eidos Works avoids intrusive ads, fake affiliate links, unsupported AI-search promises, and privacy-invasive tracking by default.',
    ''
  ].join('\n');
}

function humansTxt() {
  return [
    `Site: ${siteConfig.name}`,
    `Author: ${siteConfig.author}`,
    `Contact: ${siteConfig.email}`,
    'Built with: Vite, React, TypeScript, static prerendering',
    `Last updated: ${siteConfig.updated}`,
    ''
  ].join('\n');
}

function redirectsTxt() {
  return [
    '/services /work-with-eidos 301',
    '/contact /work-with-eidos 301',
    '/start /audit 301',
    '/intelligence/ui-ux /intelligence/ui-ux-standards-2026 301',
    ''
  ].join('\n');
}

for (const route of getPrerenderRoutes()) {
  const meta = getPrerenderMeta(route);
  const appHtml = render(route);
  const html = applyHead(template, meta).replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  for (const outputPath of outputPathsForRoute(route)) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
  }
}

await writeFile(resolve(distDir, 'sitemap.xml'), sitemapXml());
await writeFile(resolve(distDir, 'rss.xml'), rssXml());
await writeFile(resolve(distDir, 'robots.txt'), robotsTxt());
await writeFile(resolve(distDir, 'llms.txt'), llmsTxt());
await writeFile(resolve(distDir, 'humans.txt'), humansTxt());
await writeFile(resolve(distDir, '_redirects'), redirectsTxt());

console.log(`Prerendered ${getPrerenderRoutes().length} routes and SEO discovery files.`);
