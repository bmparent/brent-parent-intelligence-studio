import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SITE_ORIGIN, REQUIRED_PUBLIC_PATHS, EXCLUDED_PAGES, ROBOTS_EXCLUSIONS, hasNoindex, htmlMetadata, sitemapUrls, robotsAllowed, sourceRobotsHeaders, checkPublicPage, excludedPath } from './indexing-policy.mjs';

async function pageFile(dist, path) {
  const clean = path.replace(/^\/+|\/+$/g, '');
  for (const file of [resolve(dist, clean, 'index.html'), resolve(dist, `${clean}.html`)]) {
    try { return await readFile(file, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  throw new Error(`${path}: built HTML is missing`);
}

export async function auditBuild({ root = process.cwd(), dist = resolve(root, 'dist') } = {}) {
  const [sitemap, robots, headers, articles] = await Promise.all([
    readFile(resolve(dist, 'sitemap.xml'), 'utf8'), readFile(resolve(dist, 'robots.txt'), 'utf8'),
    readFile(resolve(dist, '_headers'), 'utf8'), readFile(resolve(root, 'src/data/articles.json'), 'utf8').then(JSON.parse),
  ]);
  const urls = sitemapUrls(sitemap), errors = [], results = [];
  if (new Set(urls).size !== urls.length) errors.push('sitemap.xml contains duplicate URLs');
  for (const path of [...REQUIRED_PUBLIC_PATHS, ...articles.filter((article) => !article.draft).map((article) => article.canonicalPath)]) {
    if (!urls.includes(`${SITE_ORIGIN}${path}`)) errors.push(`sitemap.xml is missing released public page ${path}`);
  }
  if (!robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) errors.push('robots.txt is missing the canonical sitemap declaration');
  for (const path of ROBOTS_EXCLUSIONS) if (robotsAllowed(robots, path)) errors.push(`robots.txt no longer excludes ${path}`);
  for (const canonical of urls) {
    const url = new URL(canonical), path = url.pathname;
    if (url.origin !== SITE_ORIGIN || url.search || url.hash || url.username || url.password || /(?:^|\/)\.\.(?:\/|$)/.test(path)) {
      errors.push(`sitemap.xml contains an unexpected URL: ${canonical}`); continue;
    }
    if (excludedPath(path)) { errors.push(`sitemap.xml exposes intentionally excluded page ${path}`); continue; }
    try {
      const html = await pageFile(dist, path), directives = sourceRobotsHeaders(headers, path);
      // Pages commonly serves directory index URLs with a trailing slash.
      if (!path.endsWith('/')) directives.push(...sourceRobotsHeaders(headers, `${path}/`));
      errors.push(...checkPublicPage({ path, canonical, html, headers: directives, robots }));
      results.push({ path, canonical, sourceRobotsHeaders: directives });
    } catch (error) { errors.push(error.message); }
  }
  for (const entry of EXCLUDED_PAGES) {
    const html = entry.file ? await readFile(resolve(dist, entry.file), 'utf8') : await pageFile(dist, entry.path);
    if (!htmlMetadata(html).robots.some(hasNoindex)) errors.push(`${entry.path}: intentional HTML noindex exclusion is missing`);
    if (entry.header && !sourceRobotsHeaders(headers, entry.path).some(hasNoindex)) errors.push(`${entry.path}: intentional source header noindex exclusion is missing`);
  }
  return { urls, errors, results };
}

// GET the actual public response (HEAD alone misses metadata and some edge
// behavior). Follow only a same-origin trailing-slash normalization, never an
// unrelated redirect or a login redirect. No credentials/cookies are supplied.
export async function fetchPage(base, path, { headOnly = false, allowPrivateShellRedirect = false } = {}) {
  const first = new URL(path, base), signal = AbortSignal.timeout(20000);
  let url = first;
  const redirects = [];
  for (let count = 0; count < 3; count++) {
    const response = await fetch(url, { method: headOnly ? 'HEAD' : 'GET', redirect: 'manual', signal, headers: { 'user-agent': 'EidosIndexingVerifier/1.0', 'cache-control': 'no-cache' } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const target = new URL(response.headers.get('location') || '', url);
      await response.body?.cancel();
      const normal = (pathname) => pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
      const allowedShell = allowPrivateShellRedirect && target.pathname === '/private-app';
      if (target.origin !== first.origin || target.search || target.hash || (!allowedShell && normal(target.pathname) !== normal(first.pathname))) throw new Error(`${path}: unexpected HTTP redirect to ${target.href}`);
      redirects.push({ status: response.status, path: target.pathname }); url = target; continue;
    }
    const html = headOnly ? '' : await response.text();
    return { status: response.status, finalUrl: url.href, headers: [response.headers.get('x-robots-tag') || ''], referrerPolicy: response.headers.get('referrer-policy'), cacheControl: response.headers.get('cache-control'), html, redirects };
  }
  throw new Error(`${path}: too many HTTP redirects`);
}

export async function auditHttp(base, urls) {
  const baseUrl = new URL(base);
  if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password || baseUrl.pathname !== '/' || baseUrl.search || baseUrl.hash) throw new Error('--base-url must be an HTTP(S) origin without credentials, query, or path');
  const errors = [], results = [];
  const [robotsResponse, sitemapResponse] = await Promise.all([fetchPage(base, '/robots.txt'), fetchPage(base, '/sitemap.xml')]);
  if (robotsResponse.status !== 200) errors.push(`HTTP robots.txt returned ${robotsResponse.status}`);
  if (sitemapResponse.status !== 200) errors.push(`HTTP sitemap.xml returned ${sitemapResponse.status}`);
  const remoteUrls = sitemapUrls(sitemapResponse.html);
  if (remoteUrls.length !== urls.length || urls.some((url) => !remoteUrls.includes(url))) errors.push('HTTP sitemap.xml differs from this build; deployment may be stale');
  if (!robotsResponse.html.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) errors.push('HTTP robots.txt is missing the canonical sitemap declaration');
  for (const path of ROBOTS_EXCLUSIONS) if (robotsAllowed(robotsResponse.html, path)) errors.push(`HTTP robots.txt no longer excludes ${path}`);
  // Small bounded batches avoid flooding production with the Insights inventory.
  for (let offset = 0; offset < urls.length; offset += 4) {
    await Promise.all(urls.slice(offset, offset + 4).map(async (canonical) => {
      const path = new URL(canonical).pathname;
      try {
        const response = await fetchPage(base, path);
        if (response.status !== 200) errors.push(`${path}: final HTTP status ${response.status}, expected 200`);
        errors.push(...checkPublicPage({ path, finalPath: new URL(response.finalUrl).pathname, canonical, html: response.html, headers: response.headers, robots: robotsResponse.html }));
        results.push({ path, status: response.status, canonical: htmlMetadata(response.html).canonical, xRobotsTag: response.headers.filter(Boolean), finalUrl: response.finalUrl, redirects: response.redirects });
      } catch (error) { errors.push(error.message); }
    }));
  }
  for (const entry of EXCLUDED_PAGES) {
    try {
      const response = await fetchPage(base, entry.path, { ...entry, allowPrivateShellRedirect: Boolean(entry.headOnly) });
      if (response.status !== 200) errors.push(`${entry.path}: excluded shell returned ${response.status}, expected 200`);
      // Legacy rewrite rules can normalize to the shared anonymous shell. Read
      // only that known static file, never any member/result response body.
      const shell = entry.headOnly && new URL(response.finalUrl).pathname === '/private-app' ? await fetchPage(base, '/private-app') : undefined;
      const noindexMeta = htmlMetadata(shell?.html || response.html).robots.some(hasNoindex);
      if (!response.headers.some(hasNoindex) && !noindexMeta) errors.push(`${entry.path}: final response has neither header nor HTML noindex exclusion`);
      if (entry.privateCredentials && response.referrerPolicy !== 'no-referrer') errors.push(`${entry.path}: credential page is missing no-referrer protection`);
      if (entry.privateCredentials && !/(?:^|[,\s])no-store(?:$|[,\s])/i.test(response.cacheControl || '')) errors.push(`${entry.path}: credential page is missing no-store protection`);
      results.push({ path: entry.path, excluded: true, method: entry.headOnly ? 'HEAD' : 'GET', status: response.status, finalUrl: response.finalUrl, redirects: response.redirects, xRobotsTag: response.headers.filter(Boolean), noindexMeta, referrerPolicy: response.referrerPolicy, cacheControl: response.cacheControl, anonymousShellMetadataChecked: Boolean(shell) });
    } catch (error) { errors.push(error.message); }
  }
  return { errors, results };
}

async function main() {
  const base = process.argv.find((arg) => arg.startsWith('--base-url='))?.slice('--base-url='.length);
  const output = process.argv.find((arg) => arg.startsWith('--output='))?.slice('--output='.length);
  const build = await auditBuild();
  // Never turn a malformed/unreviewed sitemap URL into an HTTP probe.
  const http = base && !build.errors.length ? await auditHttp(base, build.urls) : undefined;
  const errors = [...build.errors, ...(http?.errors || [])];
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const report = JSON.stringify({ sourceCommit, checkedAt: new Date().toISOString(), mode: http ? 'built-and-final-http' : 'built-only', baseUrl: base, publicPages: build.urls.length, intentionalExclusions: EXCLUDED_PAGES.length, errors, results: http?.results || build.results }, null, 2);
  if (output) { await mkdir(dirname(resolve(output)), { recursive: true }); await writeFile(resolve(output), `${report}\n`); }
  console.log(report);
  if (errors.length) process.exitCode = 1;
  else console.log(`Indexing eligibility checks passed for ${build.urls.length} public pages and ${EXCLUDED_PAGES.length} intentional exclusions${base ? ', including final HTTP responses' : ' (HTTP responses not checked)'}. This does not establish actual search-engine indexing.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`Indexing verification failed: ${error.message}`); process.exitCode = 1; });
}
