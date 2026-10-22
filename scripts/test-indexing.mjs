import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { SITE_ORIGIN, REQUIRED_PUBLIC_PATHS, EXCLUDED_PAGES, ROBOTS_EXCLUSIONS, checkPublicPage, hasNoindex, htmlMetadata, robotsAllowed, sourceRobotsHeaders, sitemapUrls, excludedPath } from './indexing-policy.mjs';
import { auditBuild, fetchPage } from './verify-indexing.mjs';

const canonical = 'https://eidos-works.com/quote-desk/';
const html = `<html><head><link rel="canonical" href="${canonical}"></head><body>Free estimator</body></html>`;
const page = { path: '/quote-desk/', canonical, html, robots: 'User-agent: *\nAllow: /' };

test('header-only noindex blocks clean HTML, including bot-specific and conflicting directives', () => {
  assert.deepEqual(checkPublicPage(page), []);
  for (const directive of ['noindex, follow', 'googlebot: noindex', 'index, follow, noindex', 'none']) {
    assert.match(checkPublicPage({ ...page, headers: [directive] }).join('\n'), /X-Robots-Tag/);
  }
  assert.equal(hasNoindex('unavailable_after: 25 Jun 2020 15:00:00 PST'), false);
});

test('HTML metadata handles attribute order, casing, single quotes, and bot directives', () => {
  const metadata = htmlMetadata(`<head><!-- <meta name="robots" content="noindex"> --><link HREF='${canonical}' REL='canonical'><meta content='no&#105;ndex' NAME='Googlebot-News'></head>`);
  assert.deepEqual(metadata.canonical, [canonical]);
  assert.deepEqual(metadata.robots, ['noindex']);
  assert.match(checkPublicPage({ ...page, html: html.replace('</head>', "<meta content='none' name='bingbot'></head>") }).join('\n'), /HTML robots/);
  assert.match(checkPublicPage({ ...page, html: html.replace('</head>', `<link rel="canonical" href="${canonical}"></head>`) }).join('\n'), /exactly one canonical/);
});

test('robots checks longest matching rule, Allow ties, and crawler-specific groups', () => {
  const robots = 'User-agent: *\nDisallow: /\nAllow: /quote-desk/\nDisallow: /quote-desk/private*\nAllow: /quote-desk/private$\n\nUser-agent: Googlebot\nDisallow: /quote-desk/';
  assert.equal(robotsAllowed(robots, '/quote-desk/'), true);
  assert.equal(robotsAllowed(robots, '/quote-desk/private'), true);
  assert.equal(robotsAllowed(robots, '/quote-desk/private/'), false);
  assert.equal(robotsAllowed(robots, '/quote-desk/', 'Googlebot'), false);
  assert.match(checkPublicPage({ ...page, robots }).join('\n'), /blocks Googlebot/);
  assert.match(checkPublicPage({ ...page, path: '/quote-desk', finalPath: '/quote-desk/', robots: 'User-agent: *\nAllow: /\nDisallow: /quote-desk/' }).join('\n'), /\/quote-desk\/: robots.txt blocks/);
});

test('source headers accumulate overlapping rules; narrow exclusions preserve public tool', () => {
  const oldHeaders = '/*\n  X-Robots-Tag: index\n/quote-desk/*\n  X-Robots-Tag: noindex, follow';
  assert.match(checkPublicPage({ ...page, headers: sourceRobotsHeaders(oldHeaders, '/quote-desk/') }).join('\n'), /X-Robots-Tag/);
  const fixedHeaders = '/quote-desk/terms*\n  X-Robots-Tag: noindex, follow\n/quote-desk/privacy*\n  X-Robots-Tag: noindex, follow';
  assert.deepEqual(sourceRobotsHeaders(fixedHeaders, '/quote-desk/'), []);
  assert.deepEqual(sourceRobotsHeaders(fixedHeaders, '/quote-desk/quote-guide'), []);
  assert.ok(sourceRobotsHeaders(fixedHeaders, '/quote-desk/terms.html').some(hasNoindex));
});

test('sitemap parser decodes XML and exclusion policy keeps private and unreleased pages out', () => {
  assert.deepEqual(sitemapUrls('<urlset><url><loc>https://example.com/?a=1&amp;b=2</loc></url></urlset>'), ['https://example.com/?a=1&b=2']);
  for (const path of ['/account', '/account/verify/', '/snapshot/result/not-a-token', '/api/growth/report', '/playground', '/quote-desk/terms']) assert.equal(excludedPath(path), true, path);
  for (const path of ['/quote-desk/', '/quote-desk/quote-guide', '/services/digital-experiences']) assert.equal(excludedPath(path), false, path);
});

test('real HTTP final headers catch the original regression after a Pages-style redirect', async (t) => {
  const server = createServer((request, response) => {
    if (request.url === '/quote-desk') { response.writeHead(308, { location: '/quote-desk/' }); response.end(); return; }
    if (request.url === '/wrong') { response.writeHead(302, { location: '/account' }); response.end(); return; }
    response.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex, follow', 'referrer-policy': 'no-referrer', 'cache-control': 'private, no-store' }); response.end(html);
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise((done) => { server.closeAllConnections(); server.close(done); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const result = await fetchPage(base, '/quote-desk');
  assert.equal(result.status, 200);
  assert.equal(result.finalUrl, `${base}/quote-desk/`);
  assert.equal(result.referrerPolicy, 'no-referrer');
  assert.equal(result.cacheControl, 'private, no-store');
  assert.deepEqual(htmlMetadata(result.html).robots, []);
  assert.match(checkPublicPage({ ...page, html: result.html, headers: result.headers }).join('\n'), /X-Robots-Tag/);
  await assert.rejects(fetchPage(base, '/wrong'), /unexpected HTTP redirect/);
});

test('isolated complete build fails on old Quote Desk header or missing released-page sitemap entry', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'eidos-indexing-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const dist = join(root, 'dist');
  const put = async (path, value) => { await mkdir(dirname(path), { recursive: true }); await writeFile(path, value); };
  await put(join(root, 'src/data/articles.json'), '[]');
  const sitemap = (paths) => `<urlset>${paths.map((path) => `<url><loc>${SITE_ORIGIN}${path}</loc></url>`).join('')}</urlset>`;
  await put(join(dist, 'sitemap.xml'), sitemap(REQUIRED_PUBLIC_PATHS));
  await put(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${ROBOTS_EXCLUSIONS.map((path) => `Disallow: ${path}`).join('\n')}\nSitemap: ${SITE_ORIGIN}/sitemap.xml`);
  for (const path of REQUIRED_PUBLIC_PATHS) {
    await put(join(dist, path.replace(/^\//, ''), 'index.html'), `<html><head><link rel="canonical" href="${SITE_ORIGIN}${path}"></head></html>`);
  }
  for (const entry of EXCLUDED_PAGES) {
    await put(join(dist, entry.file || join(entry.path.replace(/^\//, ''), 'index.html')), '<html><head><meta name="robots" content="noindex, follow"></head></html>');
  }
  const headers = EXCLUDED_PAGES.filter((entry) => entry.header).map((entry) => `${entry.path}\n  X-Robots-Tag: noindex, follow`).join('\n');
  await put(join(dist, '_headers'), headers);
  assert.deepEqual((await auditBuild({ root, dist })).errors, []);
  // Reproduce PR112: HTML and sitemap are correct, but the serving header rule remains.
  await put(join(dist, '_headers'), `${headers}\n/quote-desk/*\n  X-Robots-Tag: noindex, follow`);
  const regression = await auditBuild({ root, dist });
  assert.ok(regression.errors.some((error) => error.includes('/quote-desk/: X-Robots-Tag')));
  assert.ok(regression.errors.some((error) => error.includes('/quote-desk/quote-guide: X-Robots-Tag')));
  await put(join(dist, '_headers'), headers);
  await put(join(dist, 'sitemap.xml'), sitemap(REQUIRED_PUBLIC_PATHS.filter((path) => path !== '/quote-desk/')));
  assert.ok((await auditBuild({ root, dist })).errors.some((error) => error.includes('missing released public page /quote-desk/')));
});
