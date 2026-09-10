import { lookup } from 'node:dns/promises';
import { readFile } from 'node:fs/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { resolve } from 'node:path';
import { isExpectedArticleLocation } from './insight-url.mjs';

const root = process.cwd();
const configuredSiteUrl = process.env.VITE_SITE_URL || 'https://eidos-works.com';
const slugArg = process.argv.find((arg) => arg.startsWith('--slug='));
const slug = slugArg?.slice('--slug='.length);
const maxResponseBytes = 5 * 1024 * 1024;
const redirectStatuses = new Set([301, 302, 303, 307, 308]);

if (!slug) {
  console.error('Usage: node scripts/verify-production-insight.mjs --slug=<article-slug>');
  process.exit(1);
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
  if ((bytes[0] & 0xe0) !== 0x20) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x02) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0 && [0, 2].includes(bytes[3])) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0x0d && bytes[3] === 0xb8) return true;
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0 && [0x10, 0x20].includes(bytes[3] & 0xf0)) return true;
  if (bytes[0] === 0x3f && bytes[1] === 0xff && (bytes[2] & 0xf0) === 0) return true;
  return false;
}

function normalizeHostname(value) {
  return value.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
}

function parsePublicHttpsUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('URL must be no longer than 2,048 characters');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('URL must use credential-free HTTPS');
  if (url.port && url.port !== '443') throw new Error('URL must use the standard HTTPS port');
  const hostname = normalizeHostname(url.hostname);
  if (!hostname || hostname === 'localhost' || hostname === 'metadata.google.internal') throw new Error('local host is not allowed');
  if (['.localhost', '.local', '.internal', '.home', '.lan', '.test', '.invalid', '.onion'].some((suffix) => hostname.endsWith(suffix))) {
    throw new Error('private host is not allowed');
  }
  const family = isIP(hostname);
  if (family === 4 && isBlockedIpv4(hostname)) throw new Error('private or reserved IPv4 address is not allowed');
  if (family === 6 && isBlockedIpv6(hostname)) throw new Error('private or reserved IPv6 address is not allowed');
  url.hash = '';
  return url;
}

async function resolvePublicUrl(value) {
  const url = parsePublicHttpsUrl(value);
  const hostname = normalizeHostname(url.hostname);
  const literalFamily = isIP(hostname);
  if (literalFamily) return { url, hostname, addresses: [{ address: hostname, family: literalFamily }] };

  let dnsTimer;
  const addresses = await Promise.race([
    lookup(hostname, { all: true, verbatim: true }),
    new Promise((_, reject) => {
      dnsTimer = setTimeout(() => reject(new Error('DNS lookup timed out')), 5000);
    })
  ]).finally(() => clearTimeout(dnsTimer));
  if (!addresses.length) throw new Error('host did not resolve');
  for (const { address, family } of addresses) {
    if (![4, 6].includes(family) || (family === 4 && isBlockedIpv4(address)) || (family === 6 && isBlockedIpv6(address))) {
      throw new Error('host resolved to a private or reserved address');
    }
  }
  const uniqueAddresses = [...new Map(addresses.map((entry) => [`${entry.family}:${entry.address}`, entry])).values()];
  return { url, hostname, addresses: uniqueAddresses };
}

function pinnedLookup(expectedHostname, addresses) {
  return (hostname, options, callback) => {
    if (normalizeHostname(hostname) !== expectedHostname) {
      callback(new Error('unexpected hostname during connection'));
      return;
    }
    const family = typeof options === 'number' ? options : Number(options?.family || 0);
    const candidates = family ? addresses.filter((entry) => entry.family === family) : addresses;
    if (!candidates.length) {
      callback(new Error('host has no address for the requested family'));
      return;
    }
    if (typeof options === 'object' && options?.all) callback(null, candidates);
    else callback(null, candidates[0].address, candidates[0].family);
  };
}

function requestTextOnce(resolvedUrl, signal) {
  return new Promise((resolveRequest, rejectRequest) => {
    let settled = false;
    const request = httpsRequest(resolvedUrl.url, {
      method: 'GET',
      signal,
      servername: isIP(resolvedUrl.hostname) ? undefined : resolvedUrl.hostname,
      lookup: pinnedLookup(resolvedUrl.hostname, resolvedUrl.addresses),
      maxHeaderSize: 32 * 1024,
      headers: {
        Accept: 'text/html, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.1',
        'Accept-Encoding': 'identity',
        'User-Agent': 'EidosWorksProductionVerifier/1.0'
      }
    }, (response) => {
      const status = response.statusCode ?? 0;
      const locationHeader = response.headers.location;
      const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;

      if (redirectStatuses.has(status)) {
        settled = true;
        resolveRequest({ status, headers: response.headers, location, text: '' });
        response.destroy();
        return;
      }

      const encoding = String(response.headers['content-encoding'] || 'identity').toLowerCase();
      if (encoding !== 'identity') {
        settled = true;
        rejectRequest(new Error(`unsupported content encoding: ${encoding}`));
        response.destroy();
        return;
      }

      const declaredLength = Number(response.headers['content-length'] || 0);
      if (Number.isFinite(declaredLength) && declaredLength > maxResponseBytes) {
        settled = true;
        rejectRequest(new Error(`response exceeds ${maxResponseBytes} bytes`));
        response.destroy();
        return;
      }

      const chunks = [];
      let totalBytes = 0;
      response.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > maxResponseBytes) {
          if (!settled) {
            settled = true;
            rejectRequest(new Error(`response exceeds ${maxResponseBytes} bytes`));
          }
          response.destroy();
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        if (settled) return;
        settled = true;
        resolveRequest({ status, headers: response.headers, location, text: Buffer.concat(chunks).toString('utf8') });
      });
      response.on('error', (error) => {
        if (!settled) {
          settled = true;
          rejectRequest(error);
        }
      });
    });
    request.on('error', (error) => {
      if (!settled) {
        settled = true;
        rejectRequest(error);
      }
    });
    request.end();
  });
}

async function fetchText(value, allowedOrigin) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const initialUrl = parsePublicHttpsUrl(value);
    if (initialUrl.origin !== allowedOrigin) throw new Error('cross-origin request is not allowed');
    let current = await resolvePublicUrl(initialUrl.href);
    for (let redirects = 0; redirects <= 5; redirects += 1) {
      if (current.url.origin !== allowedOrigin) throw new Error('cross-origin redirect is not allowed');
      const response = await requestTextOnce(current, controller.signal);
      if (!redirectStatuses.has(response.status)) {
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          text: response.text,
          headers: response.headers,
          url: current.url.href
        };
      }
      if (!response.location || redirects === 5) throw new Error('redirect limit exceeded');
      const nextUrl = parsePublicHttpsUrl(new URL(response.location, current.url).toString());
      if (nextUrl.origin !== allowedOrigin) throw new Error('cross-origin redirect is not allowed');
      current = await resolvePublicUrl(nextUrl.href);
    }
    throw new Error('redirect limit exceeded');
  } finally {
    clearTimeout(timer);
  }
}

function decodeHtmlEntities(value) {
  const named = new Map([
    ['amp', '&'], ['apos', "'"], ['gt', '>'], ['lt', '<'], ['nbsp', ' '], ['quot', '"']
  ]);
  return String(value).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, token) => {
    if (token[0] !== '#') return named.get(token.toLowerCase()) ?? entity;
    const numeric = token[1].toLowerCase() === 'x'
      ? Number.parseInt(token.slice(2), 16)
      : Number.parseInt(token.slice(1), 10);
    try {
      return Number.isInteger(numeric) && numeric >= 0 && numeric <= 0x10ffff ? String.fromCodePoint(numeric) : entity;
    } catch {
      return entity;
    }
  });
}

function normalizeText(value) {
  return decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();
}

function textContent(fragment) {
  return normalizeText(String(fragment).replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' '));
}

function visibleText(html) {
  return textContent(
    html
      .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
  );
}

function parseAttributes(tag) {
  const attributes = new Map();
  const body = tag.replace(/^<\s*[\w:-]+/, '').replace(/\/?\s*>$/, '');
  const pattern = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of body.matchAll(pattern)) {
    attributes.set(match[1].toLowerCase(), decodeHtmlEntities(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return attributes;
}

function tags(html, name) {
  const escapedName = name.replace(/[^a-z0-9:-]/gi, '');
  return html.match(new RegExp(`<${escapedName}\\b[^>]*>`, 'gi')) ?? [];
}

function absolute(siteUrl, path = '/') {
  return new URL(path.startsWith('/') ? path : `/${path}`, `${siteUrl}/`).href;
}

let siteBase;
try {
  siteBase = parsePublicHttpsUrl(configuredSiteUrl);
  if (siteBase.pathname !== '/' || siteBase.search) throw new Error('VITE_SITE_URL must be an origin without a path or query');
} catch (error) {
  console.error(`Invalid VITE_SITE_URL: ${error instanceof Error ? error.message : 'invalid URL'}`);
  process.exit(1);
}
const siteUrl = siteBase.origin;

const articles = JSON.parse(await readFile(resolve(root, 'src/data/articles.json'), 'utf8'));
const article = articles.find((item) => item.slug === slug && !item.draft);
if (!article) {
  console.error(`No published article found for slug: ${slug}`);
  process.exit(1);
}

const errors = [];
async function fetchForVerification(label, url) {
  try {
    return await fetchText(url, siteBase.origin);
  } catch (error) {
    errors.push(`${label} request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    return null;
  }
}

const articleUrl = absolute(siteUrl, article.canonicalPath);
const articleResponse = await fetchForVerification('Article', articleUrl);

if (articleResponse) {
  if (!articleResponse.ok) errors.push(`Article URL returned ${articleResponse.status}: ${articleUrl}`);
  if (!isExpectedArticleLocation(articleResponse.url, articleUrl)) errors.push(`Article URL redirected to ${articleResponse.url}; expected ${articleUrl}.`);

  const h1Values = [...articleResponse.text.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi)].map((match) => textContent(match[1]));
  if (!h1Values.some((value) => value === normalizeText(article.title))) errors.push('Article page is missing an h1 with the article title.');

  const canonicalLinks = tags(articleResponse.text, 'link')
    .map(parseAttributes)
    .filter((attributes) => (attributes.get('rel') || '').toLowerCase().split(/\s+/).includes('canonical'));
  if (canonicalLinks.length !== 1) {
    errors.push(`Article page must have exactly one canonical link; found ${canonicalLinks.length}.`);
  } else {
    try {
      const canonicalUrl = new URL(canonicalLinks[0].get('href')).href;
      if (canonicalUrl !== articleUrl) errors.push(`Article canonical is ${canonicalUrl}; expected ${articleUrl}.`);
    } catch {
      errors.push('Article canonical URL is missing or invalid.');
    }
  }

  const robotsMeta = tags(articleResponse.text, 'meta')
    .map(parseAttributes)
    .filter((attributes) => ['robots', 'googlebot', 'bingbot'].includes((attributes.get('name') || '').toLowerCase()))
    .map((attributes) => attributes.get('content') || '');
  const xRobotsTag = articleResponse.headers['x-robots-tag'];
  const robotDirectives = [...robotsMeta, ...(Array.isArray(xRobotsTag) ? xRobotsTag : [xRobotsTag || ''])];
  if (robotDirectives.some((value) => /(?:^|[\s,])(?:noindex|none)(?:$|[\s,])/i.test(value))) errors.push('Article page sends a noindex directive.');

  const expectedOgImage = absolute(siteUrl, article.ogImage);
  const ogImages = tags(articleResponse.text, 'meta')
    .map(parseAttributes)
    .filter((attributes) => (attributes.get('property') || attributes.get('name') || '').toLowerCase() === 'og:image')
    .map((attributes) => attributes.get('content'))
    .filter(Boolean);
  const hasExpectedOgImage = ogImages.some((value) => {
    try {
      return new URL(value).href === expectedOgImage;
    } catch {
      return false;
    }
  });
  if (!hasExpectedOgImage) errors.push(`Article page is missing the expected og:image ${expectedOgImage}.`);

  const jsonLdScripts = [...articleResponse.text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter((match) => (parseAttributes(`<script ${match[1]}>`).get('type') || '').toLowerCase() === 'application/ld+json');
  if (!jsonLdScripts.length) {
    errors.push('Article page is missing JSON-LD.');
  } else if (!jsonLdScripts.some((match) => {
    try {
      JSON.parse(match[2]);
      return true;
    } catch {
      return false;
    }
  })) {
    errors.push('Article page JSON-LD is not valid JSON.');
  }

  const expectedBodyCopy = article.body?.[0]?.paragraphs?.[0];
  if (typeof expectedBodyCopy !== 'string' || !expectedBodyCopy.trim()) {
    errors.push('Article data is missing the expected body-copy sample.');
  } else {
    const pageText = visibleText(articleResponse.text);
    if (!pageText.includes(normalizeText(expectedBodyCopy))) errors.push('Article page is missing expected visible body copy.');
  }
}

const sitemapUrl = absolute(siteUrl, '/sitemap.xml');
const sitemapResponse = await fetchForVerification('Sitemap', sitemapUrl);
if (sitemapResponse) {
  if (!sitemapResponse.ok) errors.push(`Sitemap returned ${sitemapResponse.status}.`);
  if (sitemapResponse.url !== sitemapUrl) errors.push(`Sitemap redirected to ${sitemapResponse.url}; expected ${sitemapUrl}.`);
  if (!decodeHtmlEntities(sitemapResponse.text).includes(articleUrl)) errors.push('Sitemap is missing article URL.');
}

const feedUrl = absolute(siteUrl, '/feed.xml');
const feedResponse = await fetchForVerification('Feed', feedUrl);
if (feedResponse) {
  if (!feedResponse.ok) errors.push(`Feed returned ${feedResponse.status}.`);
  if (feedResponse.url !== feedUrl) errors.push(`Feed redirected to ${feedResponse.url}; expected ${feedUrl}.`);
  if (!decodeHtmlEntities(feedResponse.text).includes(articleUrl)) errors.push('Feed is missing article URL.');
}

if (errors.length) {
  console.error(`Production verification failed for ${articleUrl}`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Production verification passed for ${articleUrl}`);
