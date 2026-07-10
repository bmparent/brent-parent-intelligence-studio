import { access, readFile, stat } from 'node:fs/promises';
import { lookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { resolve } from 'node:path';

const root = process.cwd();
const siteUrl = (process.env.VITE_SITE_URL || 'https://eidos-works.com').replace(/\/+$/, '');
const articlesPath = resolve(root, 'src/data/articles.json');
const publicDir = resolve(root, 'public');
const args = new Set(process.argv.slice(2));
const skipSourceFetch = args.has('--skip-source-fetch');
const checkDist = args.has('--check-dist');
const errors = [];
const warnings = [];
const siteOrigin = new URL(siteUrl).origin;
const insightCategories = new Set([
  'Website Strategy',
  'Storefront UX',
  'Agentic SEO',
  'Automation',
  'Dashboards',
  'AI Prototyping',
  'Case Notes'
]);

const prohibitedPatterns = [
  /state of the art/i,
  /production ready/i,
  /trading alpha/i,
  /autonomous intelligence/i,
  /revolutionizing the digital landscape/i,
  /reviewed by Brent/i,
  /guaranteed/i,
  /invented AI schema/i
];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function absolute(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function wordsFor(article) {
  return list(article.body)
    .flatMap((section) => [section?.heading ?? '', ...list(section?.paragraphs), ...list(section?.bullets)])
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function isValidSlug(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function parseIpv4(value) {
  const parts = value.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return null;
  const octets = parts.map(Number);
  if (octets.some((part) => part < 0 || part > 255)) return null;
  return (((octets[0] * 256 + octets[1]) * 256 + octets[2]) * 256 + octets[3]) >>> 0;
}

function ipv4InRange(value, base, prefix) {
  const baseValue = parseIpv4(base);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return baseValue !== null && (value & mask) === (baseValue & mask);
}

function isBlockedIpv4(address) {
  const value = parseIpv4(address);
  if (value === null) return true;
  return [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
    ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
    ['192.31.196.0', 24], ['192.52.193.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16],
    ['192.175.48.0', 24], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
    ['224.0.0.0', 4], ['240.0.0.0', 4]
  ].some(([base, prefix]) => ipv4InRange(value, base, prefix));
}

function parseIpv6Bytes(rawAddress) {
  let address = rawAddress.replace(/^\[|\]$/g, '').split('%')[0].toLowerCase();
  const dotted = address.match(/(\d{1,3}(?:\.\d{1,3}){3})$/)?.[1];
  if (dotted) {
    const ipv4 = parseIpv4(dotted);
    if (ipv4 === null) return null;
    address = `${address.slice(0, -dotted.length)}${((ipv4 >>> 16) & 0xffff).toString(16)}:${(ipv4 & 0xffff).toString(16)}`;
  }
  if ((address.match(/::/g) ?? []).length > 1) return null;
  const compressed = address.includes('::');
  const [leftRaw, rightRaw = ''] = address.split('::');
  const left = leftRaw ? leftRaw.split(':') : [];
  const right = rightRaw ? rightRaw.split(':') : [];
  if ([...left, ...right].some((part) => !/^[\da-f]{1,4}$/.test(part))) return null;
  const omitted = 8 - left.length - right.length;
  if ((!compressed && omitted !== 0) || (compressed && omitted < 1)) return null;
  const parts = [...left, ...Array.from({ length: omitted }, () => '0'), ...right];
  if (parts.length !== 8) return null;
  return parts.flatMap((part) => {
    const value = Number.parseInt(part, 16);
    return [value >>> 8, value & 255];
  });
}

function isBlockedIpv6(address) {
  const bytes = parseIpv6Bytes(address);
  if (!bytes) return true;
  if (bytes.every((value) => value === 0)) return true;
  if (bytes.slice(0, 15).every((value) => value === 0) && bytes[15] === 1) return true;
  const compatible = bytes.slice(0, 12).every((value) => value === 0);
  const mapped = bytes.slice(0, 10).every((value) => value === 0) && bytes[10] === 0xff && bytes[11] === 0xff;
  if (compatible || mapped) return isBlockedIpv4(bytes.slice(12).join('.'));
  // Public source checks only need globally routable unicast addresses. This
  // excludes ULA, link-local, multicast, documentation, and other special-use
  // ranges without trying to maintain an incomplete denylist.
  if ((bytes[0] & 0xe0) !== 0x20) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x02) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0 && bytes[3] === 0) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0 && bytes[3] === 0x02) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0x0d && bytes[3] === 0xb8) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0 && [0x10, 0x20].includes(bytes[3] & 0xf0)) return true;
  if (bytes[0] === 0x3f && bytes[1] === 0xff && (bytes[2] & 0xf0) === 0) return true;
  return false;
}

function normalizeHostname(value) {
  return value.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
}

function parseSourceUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('source URL must be a string no longer than 2,048 characters');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('sources must use credential-free HTTPS URLs');
  if (url.port && url.port !== '443') throw new Error('sources must use the standard HTTPS port');
  const hostname = normalizeHostname(url.hostname);
  if (!hostname || hostname === 'localhost' || hostname === 'metadata.google.internal') throw new Error('local source host is not allowed');
  if (['.localhost', '.local', '.internal', '.home', '.lan', '.test', '.invalid', '.onion'].some((suffix) => hostname.endsWith(suffix))) {
    throw new Error('private source host is not allowed');
  }
  const family = isIP(hostname);
  if (family === 4 && isBlockedIpv4(hostname)) throw new Error('private or reserved IPv4 source is not allowed');
  if (family === 6 && isBlockedIpv6(hostname)) throw new Error('private or reserved IPv6 source is not allowed');
  url.hash = '';
  return url;
}

async function resolvePublicSource(url) {
  const parsed = parseSourceUrl(url);
  const hostname = normalizeHostname(parsed.hostname);
  const literalFamily = isIP(hostname);
  if (literalFamily) return { url: parsed, hostname, addresses: [{ address: hostname, family: literalFamily }] };

  let dnsTimer;
  const addresses = await Promise.race([
    lookup(hostname, { all: true, verbatim: true }),
    new Promise((_, reject) => {
      dnsTimer = setTimeout(() => reject(new Error('source DNS lookup timed out')), 5000);
    })
  ]).finally(() => clearTimeout(dnsTimer));
  if (!addresses.length) throw new Error('source host did not resolve');
  for (const { address, family } of addresses) {
    if (![4, 6].includes(family) || (family === 4 && isBlockedIpv4(address)) || (family === 6 && isBlockedIpv6(address))) {
      throw new Error('source host resolved to a private or reserved address');
    }
  }
  const uniqueAddresses = [...new Map(addresses.map((entry) => [`${entry.family}:${entry.address}`, entry])).values()];
  return { url: parsed, hostname, addresses: uniqueAddresses };
}

function pinnedLookup(expectedHostname, addresses) {
  return (hostname, options, callback) => {
    if (normalizeHostname(hostname) !== expectedHostname) {
      callback(new Error('unexpected hostname during source connection'));
      return;
    }
    const family = typeof options === 'number' ? options : Number(options?.family || 0);
    const candidates = family ? addresses.filter((entry) => entry.family === family) : addresses;
    if (!candidates.length) {
      callback(new Error('source host has no address for the requested family'));
      return;
    }
    if (typeof options === 'object' && options?.all) callback(null, candidates);
    else callback(null, candidates[0].address, candidates[0].family);
  };
}

function requestSourceOnce(resolvedSource, method, signal) {
  return new Promise((resolveRequest, rejectRequest) => {
    let settled = false;
    const request = httpsRequest(resolvedSource.url, {
      method,
      signal,
      servername: isIP(resolvedSource.hostname) ? undefined : resolvedSource.hostname,
      lookup: pinnedLookup(resolvedSource.hostname, resolvedSource.addresses),
      maxHeaderSize: 32 * 1024,
      headers: {
        'Accept-Encoding': 'identity',
        'User-Agent': 'EidosWorksInsightValidator/1.0'
      }
    }, (response) => {
      const status = response.statusCode ?? 0;
      const locationHeader = response.headers.location;
      const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;
      settled = true;
      resolveRequest({ status, location });
      response.destroy();
    });
    request.on('error', (error) => {
      if (!settled) rejectRequest(error);
    });
    request.end();
  });
}

async function requestSource(url, method, signal) {
  let current = await resolvePublicSource(url);
  const redirectStatuses = new Set([301, 302, 303, 307, 308]);
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const response = await requestSourceOnce(current, method, signal);
    if (!redirectStatuses.has(response.status)) return response;
    if (!response.location || redirects === 5) throw new Error('source redirect limit exceeded');
    current = await resolvePublicSource(new URL(response.location, current.url).toString());
  }
  throw new Error('source redirect limit exceeded');
}

async function sourceResolves(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    let response = await requestSource(url, 'HEAD', controller.signal);

    if ([403, 405, 501].includes(response.status)) {
      response = await requestSource(url, 'GET', controller.signal);
    }

    const resolved = response.status >= 200 && response.status < 300;
    return resolved;
  } finally {
    clearTimeout(timer);
  }
}

const articles = JSON.parse(await readFile(articlesPath, 'utf8'));
const publishedArticles = articles
  .filter((article) => article && typeof article === 'object' && !Array.isArray(article) && !article.draft)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
const titleSet = new Set();
const slugSet = new Set();
const canonicalSet = new Set();
const slugList = new Set(publishedArticles.map((article) => article.slug));
const knownLocalPaths = new Set([
  '/',
  '/snapshot',
  '/services/agentic-seo',
  '/insights',
  '/editorial-policy',
  ...publishedArticles.map((article) => article.canonicalPath)
]);
const now = new Date();
const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

for (const [index, article] of articles.entries()) {
  if (!article || typeof article !== 'object' || Array.isArray(article)) {
    fail(`article at index ${index}: each article must be an object.`);
    continue;
  }
  const label = article.slug || `article at index ${index}`;
  const requiredStringFields = [
    'title',
    'slug',
    'description',
    'dek',
    'category',
    'publishedAt',
    'updatedAt',
    'author',
    'byline',
    'canonicalPath',
    'excerpt',
    'pillar',
    'slot',
    'format',
    'searchIntent',
    'thesis',
    'ogImage'
  ];

  for (const field of requiredStringFields) {
    if (typeof article[field] !== 'string' || !article[field].trim()) {
      fail(`${label}: missing required string field "${field}".`);
    }
  }

  if (!isValidSlug(article.slug)) {
    fail(`${label}: slug must be lowercase kebab-case.`);
  }

  if (article.canonicalPath !== `/insights/${article.slug}`) {
    fail(`${label}: canonicalPath must be /insights/${article.slug}.`);
  }

  if (article.ogImage !== `/insights-og/${article.slug}.svg`) {
    fail(`${label}: ogImage must be /insights-og/${article.slug}.svg.`);
  }

  if (!insightCategories.has(article.category)) {
    fail(`${label}: category must use the Eidos Works Insights taxonomy.`);
  }

  if (titleSet.has(article.title)) fail(`${label}: duplicate title "${article.title}".`);
  if (slugSet.has(article.slug)) fail(`${label}: duplicate slug "${article.slug}".`);
  if (canonicalSet.has(article.canonicalPath)) fail(`${label}: duplicate canonicalPath "${article.canonicalPath}".`);
  titleSet.add(article.title);
  slugSet.add(article.slug);
  canonicalSet.add(article.canonicalPath);

  if (!Array.isArray(article.tags) || article.tags.length < 3) fail(`${label}: at least three tags are required.`);
  if (!Array.isArray(article.sources) || article.sources.length < 1) fail(`${label}: at least one source is required.`);
  if (!Array.isArray(article.body) || article.body.length < 2) fail(`${label}: at least two body sections are required.`);
  if (!Array.isArray(article.takeaways) || article.takeaways.length < 3) fail(`${label}: at least three takeaways are required.`);
  if (!Array.isArray(article.relatedSlugs)) fail(`${label}: relatedSlugs must be an array.`);
  if (!Number.isInteger(article.readingTimeMinutes) || article.readingTimeMinutes < 1) {
    fail(`${label}: readingTimeMinutes must be a positive integer.`);
  }

  for (const [sectionIndex, section] of list(article.body).entries()) {
    if (!section || typeof section.heading !== 'string' || !section.heading.trim()) {
      fail(`${label}: body section ${sectionIndex + 1} needs a heading.`);
    }
    if (!Array.isArray(section?.paragraphs) || section.paragraphs.length < 1 || section.paragraphs.some((paragraph) => typeof paragraph !== 'string' || !paragraph.trim())) {
      fail(`${label}: body section ${sectionIndex + 1} needs non-empty paragraphs.`);
    }
  }

  const sectionHeadings = new Set(
    list(article.body)
      .map((section) => typeof section?.heading === 'string' ? section.heading.trim().toLowerCase() : '')
      .filter(Boolean)
  );
  for (const requiredHeading of ['what this means for your site', 'how eidos works applies this']) {
    if (!sectionHeadings.has(requiredHeading)) fail(`${label}: missing required section "${requiredHeading}".`);
  }

  if (!isValidDate(article.publishedAt)) fail(`${label}: publishedAt is not a valid date.`);
  if (!isValidDate(article.updatedAt)) fail(`${label}: updatedAt is not a valid date.`);
  if (isValidDate(article.publishedAt) && isValidDate(article.updatedAt) && new Date(article.updatedAt) < new Date(article.publishedAt)) {
    fail(`${label}: updatedAt is earlier than publishedAt.`);
  }

  if (article.description?.length > 165) warn(`${label}: description is longer than 165 characters.`);
  if (article.title?.length > 72) warn(`${label}: title is longer than 72 characters.`);

  const fullText = [
    article.title,
    article.description,
    article.dek,
    article.excerpt,
    article.thesis,
    ...list(article.takeaways),
    ...list(article.body).flatMap((section) => [section?.heading ?? '', ...list(section?.paragraphs), ...list(section?.bullets)])
  ].join('\n');

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(fullText)) fail(`${label}: prohibited or unsupported claim language matched ${pattern}.`);
  }

  const wordCount = wordsFor(article).length;
  if (article.format !== 'evergreen' && wordCount < 650) {
    warn(`${label}: ${wordCount} words is below the typical target for ${article.format}.`);
  }

  if (new Date(article.publishedAt).getTime() > now.getTime() + 10 * 60 * 1000) {
    fail(`${label}: publishedAt is in the future.`);
  }

  if (new Date(article.publishedAt).getTime() > now.getTime() - ninetyDaysMs) {
    const similar = publishedArticles.filter((candidate) => {
      if (candidate.slug === article.slug) return false;
      const sharedTags = new Set(list(candidate.tags));
      const overlap = list(article.tags).filter((tag) => sharedTags.has(tag)).length;
      return candidate.category === article.category && overlap >= 2 && candidate.searchIntent === article.searchIntent;
    });
    if (similar.length) {
      fail(`${label}: appears substantially duplicative with ${similar.map((item) => item.slug).join(', ')}.`);
    }
  }

  for (const relatedSlug of list(article.relatedSlugs)) {
    if (!slugList.has(relatedSlug)) fail(`${label}: related article "${relatedSlug}" does not exist or is a draft.`);
  }

  for (const [sourceIndex, source] of list(article.sources).entries()) {
    if (!source || typeof source !== 'object' || !source.title || !source.url || !source.publisher || !source.accessedDate || !source.type) {
      fail(`${label}: source ${sourceIndex + 1} is missing required fields.`);
      continue;
    }
    try {
      parseSourceUrl(source.url);
    } catch (error) {
      fail(`${label}: source URL is invalid: ${source.url} (${error instanceof Error ? error.message : 'invalid URL'}).`);
    }
  }
}

if (publishedArticles.filter((article) => article.featured).length !== 1) {
  fail('Exactly one published article must be featured as the Start Here guide.');
}

if (!skipSourceFetch) {
  for (const article of publishedArticles) {
    for (const source of list(article.sources)) {
      try {
        const parsed = parseSourceUrl(source.url);
        if (source.type === 'internal-proof' && parsed.origin === siteOrigin) {
          if (!knownLocalPaths.has(parsed.pathname)) fail(`${article.slug}: internal source route does not exist: ${parsed.pathname}`);
          continue;
        }
        const ok = await sourceResolves(source.url);
        if (!ok) fail(`${article.slug}: source did not resolve successfully: ${source.url}`);
      } catch (error) {
        fail(`${article.slug}: source fetch failed for ${source.url} (${error instanceof Error ? error.message : 'unknown error'}).`);
      }
    }
  }
}

const sitemapPath = resolve(publicDir, 'sitemap.xml');
const feedPath = resolve(publicDir, 'feed.xml');
const llmsPath = resolve(publicDir, 'llms.txt');

for (const publicFile of [sitemapPath, feedPath, llmsPath]) {
  if (!(await fileExists(publicFile))) fail(`Missing generated public file: ${publicFile}`);
}

if (await fileExists(sitemapPath)) {
  const sitemap = await readFile(sitemapPath, 'utf8');
  for (const article of publishedArticles) {
    if (!sitemap.includes(absolute(article.canonicalPath))) fail(`${article.slug}: sitemap missing canonical URL.`);
  }
}

if (await fileExists(feedPath)) {
  const feed = await readFile(feedPath, 'utf8');
  for (const article of publishedArticles.slice(0, 30)) {
    if (!feed.includes(absolute(article.canonicalPath))) fail(`${article.slug}: feed missing canonical URL.`);
  }
}

if (await fileExists(llmsPath)) {
  const llms = await readFile(llmsPath, 'utf8');
  for (const article of publishedArticles) {
    if (!llms.includes(absolute(article.canonicalPath))) fail(`${article.slug}: llms.txt missing canonical URL.`);
  }
}

for (const article of publishedArticles) {
  if (!isValidSlug(article.slug)) continue;
  const ogPath = resolve(publicDir, 'insights-og', `${article.slug}.svg`);
  if (!(await fileExists(ogPath))) fail(`${article.slug}: missing OG image ${article.ogImage}.`);
}

if (checkDist) {
  for (const article of publishedArticles) {
    if (!isValidSlug(article.slug)) continue;
    const htmlPath = resolve(root, 'dist', 'insights', article.slug, 'index.html');
    if (!(await fileExists(htmlPath))) {
      fail(`${article.slug}: missing prerendered article HTML.`);
      continue;
    }
    const html = await readFile(htmlPath, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${absolute(article.canonicalPath)}" />`)) fail(`${article.slug}: dist HTML missing canonical URL.`);
    if (!html.includes(article.title)) fail(`${article.slug}: dist HTML missing visible title.`);
    if (!html.includes('application/ld+json')) fail(`${article.slug}: dist HTML missing JSON-LD.`);
    if (!html.includes(absolute(article.canonicalPath))) fail(`${article.slug}: dist HTML missing absolute canonical URL.`);
    const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1Count !== 1) fail(`${article.slug}: expected exactly one h1 in prerendered article HTML, found ${h1Count}.`);
  }

  const insightsIndex = resolve(root, 'dist', 'insights', 'index.html');
  if (!(await fileExists(insightsIndex))) fail('Missing prerendered /insights/index.html.');
  else {
    const stats = await stat(insightsIndex);
    if (stats.size < 5000) fail('/insights/index.html is unexpectedly small.');
  }
}

if (warnings.length) {
  console.warn('Insights validation warnings:');
  warnings.forEach((message) => console.warn(`- ${message}`));
}

if (errors.length) {
  console.error('Insights validation failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Insights validation passed for ${publishedArticles.length} published articles.`);
