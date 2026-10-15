import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { htmlMetadata, sitemapUrls } from './indexing-policy.mjs';

const canonical = 'https://eidos-works.com';
const paths = ['/sitemap.xml', '/work/nighttime-spectaculars', '/lab/eidos-brain', '/quote-desk/'];
const retainedHeaders = ['date', 'server', 'content-type', 'content-length', 'cf-mitigated', 'cf-ray', 'cf-cache-status', 'cache-control', 'age', 'x-robots-tag'];
const results = [];
const pause = () => new Promise((done) => setTimeout(done, 2000));
const safeUrl = (value) => { const url = new URL(value); return { url: url.origin + url.pathname, queryPresent: Boolean(url.search) }; };
function receipt(body, headers) {
  const selected = Object.fromEntries(retainedHeaders.map((name) => [name, headers[name] || null]));
  const meta = htmlMetadata(body);
  return {
    headers: selected, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex'),
    title: body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').slice(0, 160) || null,
    challengeHeader: selected['cf-mitigated'] === 'challenge',
    challengeMarkup: /cf_chl_opt|\/cdn-cgi\/challenge-platform\//i.test(body),
    robots: meta.robots, canonicals: meta.canonical,
    sitemapUrlCount: /<urlset\b/i.test(body) ? sitemapUrls(body).length : null,
  };
}
async function httpProbe(origin, path) {
  const observed = { client: 'EidosIndexingVerifier/1.0', startedAt: new Date().toISOString(), requestedUrl: origin + path, responses: [] };
  let url = new URL(path, origin);
  try {
    // One document, at most one normal same-origin slash redirect. No retries,
    // session cookies, origin bypass, browser impersonation, or crawler spoofing.
    for (let count = 0; count < 2; count++) {
      const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'EidosIndexingVerifier/1.0', 'cache-control': 'no-cache' } });
      const headers = Object.fromEntries(response.headers), body = await response.text();
      const item = { ...safeUrl(url), status: response.status, ...receipt(body, headers) };
      observed.responses.push(item);
      const location = response.headers.get('location');
      if (![301, 302, 303, 307, 308].includes(response.status) || !location) break;
      const target = new URL(location, url);
      item.redirect = safeUrl(target);
      if (target.origin !== origin || target.search || target.hash || target.pathname.replace(/\/$/, '') !== path.replace(/\/$/, '')) { item.redirectNotFollowed = true; break; }
      url = target;
    }
  } catch (error) { observed.error = error.message; }
  observed.finishedAt = new Date().toISOString(); results.push(observed); await pause();
}
for (const path of paths) await httpProbe(canonical, path);
// Three static-origin controls only; their availability never establishes the
// canonical host's accessibility.
for (const path of paths.slice(0, 3)) await httpProbe('https://eidosworks.pages.dev', path);

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch();
try {
  for (const path of paths) {
    // The actual browser's default identity is retained. No stored sessions,
    // clearance cookies, stealth settings, or challenge execution are used.
    const context = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: 'block' });
    const page = await context.newPage();
    const observed = { client: 'fresh default Chromium; JavaScript disabled', startedAt: new Date().toISOString(), requestedUrl: canonical + path, responses: [] };
    let documents = 0;
    await context.route('**/*', async (route) => {
      const request = route.request(), url = new URL(request.url());
      const normalized = (value) => value.replace(/\/$/, '');
      if (request.method() === 'GET' && request.isNavigationRequest() && request.frame() === page.mainFrame() && url.origin === canonical && !url.search && normalized(url.pathname) === normalized(path) && documents++ < 2) await route.continue();
      else await route.abort();
    });
    try {
      const response = await page.goto(canonical + path, { waitUntil: 'domcontentloaded', timeout: 25000 });
      if (!response) throw new Error('No document response');
      const body = await response.text();
      observed.responses.push({ ...safeUrl(response.url()), status: response.status(), ...receipt(body, await response.allHeaders()) });
      const previous = response.request().redirectedFrom();
      if (previous) { const prior = await previous.response(); observed.redirect = { ...safeUrl(previous.url()), status: prior?.status() }; }
    } catch (error) { observed.error = error.message.split('\n')[0]; }
    observed.finishedAt = new Date().toISOString(); results.push(observed);
    await context.close(); await pause();
  }
} finally { await browser.close(); }
const report = {
  diagnosticSource: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  productionSource: 'b8bfbbc4e6f9dd73c7c899f0b32e829207314b75',
  checkedAt: new Date().toISOString(), policy: 'Bounded metadata collection only. No authentication, identity spoofing, challenge solving, retries, security changes, or deployment.',
  limitation: 'Neither this verifier nor Chromium is a verified search-engine crawler; genuine crawler accessibility requires provider events or Search Console evidence.', results,
};
const output = resolve(process.env.INDEXING_ACCESS_RECEIPT || '/tmp/indexing-access-diagnostic.json');
await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
console.log('Diagnostic collection finished. Job success does not mean canonical eligibility passed; inspect response observations.');
