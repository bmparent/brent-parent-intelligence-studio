import { absoluteUrl, siteConfig } from '../config/site';
import { articles } from '../data/articles';
import { normalizePath } from '../data/pages';

export function SEOJsonLd({ path }: { path: string }) {
  const normalized = normalizePath(path);
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.logos.horizontal
      },
      email: siteConfig.contactEmail,
      founder: { '@id': absoluteUrl('/#brent-parent') },
      description: siteConfig.description
    },
    {
      '@type': 'Person',
      '@id': absoluteUrl('/#brent-parent'),
      name: siteConfig.founder,
      url: siteConfig.url,
      jobTitle: 'Founder and creative technologist',
      worksFor: { '@id': absoluteUrl('/#organization') }
    },
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      publisher: { '@id': absoluteUrl('/#organization') }
    }
  ];

  if (normalized === '/services/agentic-seo') {
    graph.push({
      '@type': 'Service',
      '@id': absoluteUrl('/services/agentic-seo#service'),
      name: 'Agentic SEO & AI-Ready Website Strategy',
      serviceType: 'Website strategy and search-readiness implementation',
      provider: { '@id': absoluteUrl('/#organization') },
      url: absoluteUrl('/services/agentic-seo'),
      description: 'Structured content, metadata, schema, accessible UX, and measurement for websites that need to be clearer to customers, search engines, and AI assistants.'
    });
  }

  if (normalized === '/snapshot') {
    graph.push({
      '@type': 'Service',
      '@id': absoluteUrl('/snapshot#service'),
      name: 'Eidos Snapshot',
      serviceType: 'AI-assisted website concept and recommendation report',
      provider: { '@id': absoluteUrl('/#organization') },
      url: absoluteUrl('/snapshot'),
      description: 'A visual homepage concept with practical UX, SEO, structure, and AI-search-readiness recommendations.',
      offers: {
        '@type': 'Offer',
        price: '5.00',
        priceCurrency: 'USD',
        url: absoluteUrl('/snapshot')
      }
    });
  }

  const article = articles.find((entry) => entry.canonicalPath === normalized);
  if (article) {
    graph.push({
      '@type': 'BlogPosting',
      '@id': absoluteUrl(`${article.canonicalPath}#article`),
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: article.byline === siteConfig.founder
        ? { '@id': absoluteUrl('/#brent-parent') }
        : { '@type': 'Organization', name: article.byline, url: siteConfig.url },
      publisher: { '@id': absoluteUrl('/#organization') },
      mainEntityOfPage: absoluteUrl(article.canonicalPath),
      image: absoluteUrl(article.ogImage),
      keywords: article.tags.join(', '),
      articleSection: article.category,
      citation: article.sources.map((source) => source.url)
    });
  }

  if (normalized === '/insights') {
    graph.push({
      '@type': 'ItemList',
      name: 'Eidos Works Insights',
      itemListElement: articles.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title,
        url: absoluteUrl(item.canonicalPath)
      }))
    });
  }

  if (normalized === '/editorial-policy') {
    graph.push({
      '@type': 'WebPage',
      name: 'Eidos Works Editorial Policy',
      url: absoluteUrl('/editorial-policy'),
      description: 'How Eidos Works selects topics, checks sources, uses editorial tools, and handles corrections for Insights.',
      publisher: { '@id': absoluteUrl('/#organization') }
    });
  }

  const breadcrumbName = article?.title || (
    normalized === '/insights'
      ? 'Insights'
      : normalized === '/snapshot'
        ? 'Eidos Snapshot'
        : normalized === '/services/agentic-seo'
          ? 'Agentic SEO'
          : normalized === '/editorial-policy'
            ? 'Editorial Policy'
            : ''
  );

  if (breadcrumbName) {
    const items: Array<Record<string, unknown>> = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }
    ];
    if (article) {
      items.push({ '@type': 'ListItem', position: 2, name: 'Insights', item: absoluteUrl('/insights') });
      items.push({ '@type': 'ListItem', position: 3, name: breadcrumbName, item: absoluteUrl(normalized) });
    } else {
      items.push({ '@type': 'ListItem', position: 2, name: breadcrumbName, item: absoluteUrl(normalized) });
    }
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items });
  }

  const payload = { '@context': 'https://schema.org', '@graph': graph };
  const serialized = JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}
