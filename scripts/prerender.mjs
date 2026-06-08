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

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttribute(page.title ?? 'Eidos Works')}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttribute(page.title ?? 'Eidos Works')}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/s, `<meta name="twitter:description" content="${description}" />`);
}

function outputPathFor(pathname) {
  if (pathname === '/') return templatePath;
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  return resolve(root, 'dist', cleanPath, 'index.html');
}

for (const page of pages) {
  const appHtml = render(page.path);
  const html = withHeadMetadata(template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`), page);
  const outputPath = outputPathFor(page.path);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}
