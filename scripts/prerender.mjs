import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.cwd());
const templatePath = resolve(root, 'dist/index.html');
const serverEntry = resolve(root, 'dist-ssr/entry-server.js');

const template = await readFile(templatePath, 'utf8');
const { getPrerenderPages, render } = await import(pathToFileURL(serverEntry).href);
const pages = typeof getPrerenderPages === 'function' ? getPrerenderPages() : [{ path: '/' }];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttribute(value = '') {
  return escapeHtml(value).replaceAll('"', '&quot;');
}

function withHeadMetadata(html, page) {
  const title = escapeHtml(page.title ?? 'Eidos Works');
  const description = escapeAttribute(page.description ?? '');
  const url = escapeAttribute(page.url ?? '');
  const type = escapeAttribute(page.type ?? 'website');
  const image = escapeAttribute(page.image ?? 'https://eidos-works.com/social-preview.png');

  const robots = page.noIndex ? 'noindex, nofollow' : 'index, follow';
  const referrer = page.noReferrer ? 'no-referrer' : 'strict-origin-when-cross-origin';

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttribute(page.title ?? 'Eidos Works')}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttribute(page.title ?? 'Eidos Works')}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/s, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${image}" />`)
    .replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<meta name="referrer" content="[^"]*" \/>/, `<meta name="referrer" content="${referrer}" />`);
}

function outputPathFor(pathname) {
  if (pathname === '/') return templatePath;
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  return resolve(root, 'dist', cleanPath, 'index.html');
}

for (const page of pages) {
  const appHtml = render(page.path);
  const rootedTemplate = template.replace(
    /<div id="root">[\s\S]*<\/div>\s*<\/body>/,
    `<div id="root">${appHtml}</div>\n  </body>`
  );
  const html = withHeadMetadata(rootedTemplate, page);
  const outputPath = outputPathFor(page.path);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

// Real static 404 disables Pages' implicit SPA fallback for unknown public URLs.
const missing = { path: '/404', title: 'Page Not Found | Eidos Works', description: 'That page does not exist. Return to Eidos Works or explore the services.', url: 'https://eidos-works.com/404', type: 'website', noIndex: true };
const missingHtml = template.replace(/<div id="root">[\s\S]*<\/div>\s*<\/body>/, `<div id="root">${render('/404')}</div>\n  </body>`);
await writeFile(resolve(root, 'dist/404.html'), withHeadMetadata(missingHtml, missing));
// Existing private client routes get an empty shell rather than incorrect homepage hydration.
await writeFile(resolve(root, 'dist/private-app.html'), withHeadMetadata(template, { ...missing, title: 'Private page | Eidos Works', noReferrer: true }));
