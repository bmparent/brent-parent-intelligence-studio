import { access, readFile, stat } from 'node:fs/promises';
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

function wordsFor(article) {
  return article.body
    .flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])])
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function sourceResolves(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'EidosWorksInsightValidator/1.0' }
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'EidosWorksInsightValidator/1.0' }
      });
    }

    return response.status >= 200 && response.status < 400;
  } finally {
    clearTimeout(timer);
  }
}

const articles = JSON.parse(await readFile(articlesPath, 'utf8'));
const publishedArticles = articles.filter((article) => !article.draft);
const titleSet = new Set();
const slugSet = new Set();
const canonicalSet = new Set();
const slugList = new Set(publishedArticles.map((article) => article.slug));
const now = new Date();
const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

for (const [index, article] of articles.entries()) {
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

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug ?? '')) {
    fail(`${label}: slug must be lowercase kebab-case.`);
  }

  if (article.canonicalPath !== `/insights/${article.slug}`) {
    fail(`${label}: canonicalPath must be /insights/${article.slug}.`);
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
  if (!Array.isArray(article.relatedSlugs)) fail(`${label}: relatedSlugs must be an array.`);
  if (!Number.isInteger(article.readingTimeMinutes) || article.readingTimeMinutes < 1) {
    fail(`${label}: readingTimeMinutes must be a positive integer.`);
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
    ...(article.takeaways ?? []),
    ...article.body.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])])
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
      const sharedTags = new Set(candidate.tags ?? []);
      const overlap = (article.tags ?? []).filter((tag) => sharedTags.has(tag)).length;
      return candidate.category === article.category && overlap >= 2 && candidate.searchIntent === article.searchIntent;
    });
    if (similar.length) {
      fail(`${label}: appears substantially duplicative with ${similar.map((item) => item.slug).join(', ')}.`);
    }
  }

  for (const relatedSlug of article.relatedSlugs ?? []) {
    if (!slugList.has(relatedSlug)) fail(`${label}: related article "${relatedSlug}" does not exist or is a draft.`);
  }

  for (const [sourceIndex, source] of (article.sources ?? []).entries()) {
    if (!source.title || !source.url || !source.publisher || !source.accessedDate || !source.type) {
      fail(`${label}: source ${sourceIndex + 1} is missing required fields.`);
    }
    try {
      new URL(source.url);
    } catch {
      fail(`${label}: source URL is invalid: ${source.url}`);
    }
  }
}

if (!skipSourceFetch) {
  for (const article of publishedArticles) {
    for (const source of article.sources) {
      try {
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
  const ogPath = resolve(publicDir, article.ogImage.replace(/^\/+/, ''));
  if (!(await fileExists(ogPath))) fail(`${article.slug}: missing OG image ${article.ogImage}.`);
}

if (checkDist) {
  for (const article of publishedArticles) {
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
