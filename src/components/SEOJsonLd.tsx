import { absoluteUrl, siteConfig } from '../config/site';
import { articles, getArticleBySlug } from '../data/articles';
import { storeCaseStudies } from '../data/portfolio';

type SEOJsonLdProps = {
  activeArticleSlug?: string;
  routePath?: string;
};

function publisher() {
  return {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: siteConfig.logos.icon
    }
  };
}

export function SEOJsonLd({ activeArticleSlug, routePath = '/' }: SEOJsonLdProps) {
  const activeArticle = getArticleBySlug(activeArticleSlug);
  const isInsightsHub = routePath === '/insights';
  const isEditorialPolicy = routePath === '/editorial-policy';

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.name,
    alternateName: siteConfig.legacyName,
    url: siteConfig.url,
    logo: siteConfig.logos.horizontal,
    founder: {
      '@type': 'Person',
      name: siteConfig.founder,
      jobTitle: 'Creative technologist, UI/UX designer, automation builder, and intelligence-systems developer',
      url: siteConfig.url
    },
    description: siteConfig.description,
    areaServed: 'US',
    serviceType: [
      'Custom storefront experiences',
      'Graphic design and mockups',
      'Production dashboards',
      'Workflow automation',
      'Eidos Brain and Sentinel prototypes',
      'Website and portfolio systems'
    ]
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: publisher()
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      ...(activeArticle || isInsightsHub
        ? [{ '@type': 'ListItem', position: 2, name: 'Insights', item: absoluteUrl('/insights') }]
        : []),
      ...(activeArticle
        ? [{ '@type': 'ListItem', position: 3, name: activeArticle.title, item: absoluteUrl(activeArticle.canonicalPath) }]
        : []),
      ...(isEditorialPolicy
        ? [{ '@type': 'ListItem', position: 2, name: 'Editorial Policy', item: absoluteUrl('/editorial-policy') }]
        : [])
    ]
  };

  const articleList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Eidos Works Insights',
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(article.canonicalPath),
      name: article.title
    }))
  };

  const articleGraph = activeArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activeArticle.title,
        description: activeArticle.description,
        datePublished: activeArticle.publishedAt,
        dateModified: activeArticle.updatedAt,
        author: {
          '@type': 'Organization',
          name: activeArticle.byline,
          url: siteConfig.url
        },
        publisher: publisher(),
        image: absoluteUrl(activeArticle.ogImage),
        mainEntityOfPage: absoluteUrl(activeArticle.canonicalPath),
        keywords: activeArticle.tags.join(', '),
        articleSection: activeArticle.category,
        citation: activeArticle.sources.map((source) => source.url)
      }
    : undefined;

  const creativeWorks = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Eidos Works case studies',
    itemListElement: storeCaseStudies.map((study, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: study.title,
        url: study.url,
        creator: {
          '@type': 'Person',
          name: siteConfig.founder
        },
        description: study.result
      }
    }))
  };

  const policyPage = isEditorialPolicy
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Eidos Works Editorial Policy',
        url: absoluteUrl('/editorial-policy'),
        publisher: publisher(),
        description: 'How Eidos Works selects topics, sources current claims, handles corrections, and uses editorial technology.'
      }
    : undefined;

  const graph = [organization, website, breadcrumbs, creativeWorks, articleList, articleGraph, policyPage].filter(Boolean);

  return (
    <>
      {graph.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}
