import articlesData from './articles.json';

export const insightCategories = [
  'Website Strategy',
  'Storefront UX',
  'Agentic SEO',
  'Automation',
  'Dashboards',
  'AI Prototyping',
  'Case Notes'
] as const;

export type InsightCategory = (typeof insightCategories)[number];

export type ArticleSource = {
  title: string;
  url: string;
  publisher: string;
  publishedDate: string;
  accessedDate: string;
  type: 'primary' | 'official-docs' | 'standard' | 'internal-proof' | 'reference';
};

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

type ArticleRecord = {
  title: string;
  slug: string;
  description: string;
  dek: string;
  category: InsightCategory;
  publishedAt: string;
  updatedAt: string;
  author: string;
  byline: string;
  readingTimeMinutes: number;
  tags: string[];
  canonicalPath: string;
  excerpt: string;
  pillar: string;
  slot: 'morning' | 'midday' | 'evening' | 'seed';
  format: 'current-analysis' | 'practical-guide' | 'strategic-analysis' | 'evergreen';
  searchIntent: string;
  featured: boolean;
  draft: boolean;
  thesis: string;
  sources: ArticleSource[];
  takeaways?: string[];
  relatedSlugs: string[];
  body: ArticleSection[];
  cta: {
    label: string;
    href: string;
  };
  ogImage: string;
  correctionNote?: string;
};

export type Article = ArticleRecord & {
  date: string;
  updated: string;
  readingTime: string;
  practicalTakeaways: string[];
  startHere: boolean;
};

function toArticle(record: ArticleRecord): Article {
  return {
    ...record,
    date: record.publishedAt.slice(0, 10),
    updated: record.updatedAt.slice(0, 10),
    readingTime: `${record.readingTimeMinutes} min read`,
    practicalTakeaways: record.takeaways ?? [],
    startHere: record.featured
  };
}

export const allArticles = articlesData as ArticleRecord[];

export const articles = allArticles
  .filter((article) => !article.draft)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  .map(toArticle);

export const featuredArticle = articles.find((article) => article.featured) ?? articles[0];

export function getArticleBySlug(slug?: string) {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: InsightCategory | 'All') {
  return category === 'All' ? articles : articles.filter((article) => article.category === category);
}

export function getArticleSlugFromPath(pathname?: string) {
  if (!pathname) return undefined;
  const match = pathname.match(/^\/insights\/([^/?#]+)$/);
  if (!match?.[1]) return undefined;
  try {
    return getArticleBySlug(decodeURIComponent(match[1]))?.slug;
  } catch {
    return undefined;
  }
}

export function isInsightsPath(pathname = '/') {
  return pathname === '/insights' || pathname.startsWith('/insights/');
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(value));
}
