import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const siteUrl = (process.env.VITE_SITE_URL || 'https://eidos-works.com').replace(/\/+$/, '');
const slugArg = process.argv.find((arg) => arg.startsWith('--slug='));
const slug = slugArg?.split('=')[1];

if (!slug) {
  console.error('Usage: node scripts/verify-production-insight.mjs --slug=<article-slug>');
  process.exit(1);
}

const articles = JSON.parse(await readFile(resolve(root, 'src/data/articles.json'), 'utf8'));
const article = articles.find((item) => item.slug === slug && !item.draft);
if (!article) {
  console.error(`No published article found for slug: ${slug}`);
  process.exit(1);
}

function absolute(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'EidosWorksProductionVerifier/1.0' }
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, text, url: response.url };
}

const errors = [];
const articleUrl = absolute(article.canonicalPath);
const articleResponse = await fetchText(articleUrl);

if (!articleResponse.ok) errors.push(`Article URL returned ${articleResponse.status}: ${articleUrl}`);
if (!articleResponse.text.includes(article.title)) errors.push('Article page is missing the article title.');
if (!articleResponse.text.includes(`<link rel="canonical" href="${articleUrl}" />`)) errors.push('Article page is missing the expected canonical URL.');
if (!articleResponse.text.includes('application/ld+json')) errors.push('Article page is missing JSON-LD.');
if (!articleResponse.text.includes(article.body[0].paragraphs[0])) errors.push('Article page is missing expected body copy.');

const sitemapResponse = await fetchText(absolute('/sitemap.xml'));
if (!sitemapResponse.ok) errors.push(`Sitemap returned ${sitemapResponse.status}.`);
else if (!sitemapResponse.text.includes(articleUrl)) errors.push('Sitemap is missing article URL.');

const feedResponse = await fetchText(absolute('/feed.xml'));
if (!feedResponse.ok) errors.push(`Feed returned ${feedResponse.status}.`);
else if (!feedResponse.text.includes(articleUrl)) errors.push('Feed is missing article URL.');

if (errors.length) {
  console.error(`Production verification failed for ${articleUrl}`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Production verification passed for ${articleUrl}`);
