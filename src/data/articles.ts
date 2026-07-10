import articlesData from './articles.json';

export type ArticleSource = {
  title: string;
  url: string;
  publisher: string;
  publishedDate: string;
  accessedDate: string;
  type: 'primary' | 'official-docs' | 'standard' | 'internal-proof' | 'reference';
};

export type ArticleBodySection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Article = {
  title: string;
  slug: string;
  description: string;
  dek: string;
  category: string;
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
  body: ArticleBodySection[];
  cta: {
    label: string;
    href: string;
  };
  ogImage: string;
  correctionNote?: string;
};

export const articles = (articlesData as Article[])
  .filter((article) => !article.draft)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export const allArticles = articlesData as Article[];

export function getArticleBySlug(slug?: string) {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}

export function getArticleSlugFromPath(pathname?: string) {
  if (!pathname) return undefined;
  const match = pathname.match(/^\/insights\/([^/?#]+)/);
  if (!match?.[1]) return undefined;
  const slug = decodeURIComponent(match[1]);
  return getArticleBySlug(slug)?.slug;
}

export function isInsightsPath(pathname = '/') {
  return pathname === '/insights' || pathname.startsWith('/insights/');
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  }).format(new Date(value));
}
