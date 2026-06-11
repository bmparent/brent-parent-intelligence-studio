import {
  absoluteUrl,
  getBreadcrumbs,
  siteConfig
} from './platform';
import type { Article } from './platform';

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email,
    founder: {
      '@type': 'Person',
      name: siteConfig.author
    },
    description: siteConfig.tagline
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.tagline,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name
    }
  };
}

export function buildArticleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    dateModified: article.updated,
    datePublished: article.updated,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name
    },
    mainEntityOfPage: absoluteUrl(article.path)
  };
}

export function buildBreadcrumbJsonLd(path: string) {
  const breadcrumbs = getBreadcrumbs(path);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: absoluteUrl(breadcrumb.path)
    }))
  };
}

