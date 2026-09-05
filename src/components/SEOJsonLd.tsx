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

  const serviceNames: Record<string, { name: string; description: string }> = {
    '/services/digital-experiences': {
      name: 'Digital Experiences',
      description: 'Website, service-page, campaign-page, and accessible frontend design and development.'
    },
    '/services/storefront-access-systems': {
      name: 'Storefront and Access Systems',
      description: 'Hosted storefront UX, employee-store access gates, roster checks, product paths, and ordering guidance.'
    },
    '/services/dashboards-workflow-tools': {
      name: 'Dashboards and Workflow Tools',
      description: 'Operational reporting, workflow visibility, focused automation, and internal tools.'
    }
  };
  const service = serviceNames[normalized];
  if (service) {
    graph.push({
      '@type': 'Service',
      '@id': absoluteUrl(`${normalized}#service`),
      name: service.name,
      serviceType: service.name,
      provider: { '@id': absoluteUrl('/#organization') },
      url: absoluteUrl(normalized),
      description: service.description
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

  const breadcrumbNames: Record<string, string> = {
    '/work': 'Work',
    '/work/pernr-access-gate': 'PERNR Access Gate',
    '/work/production-dashboard': 'Production Dashboard',
    '/work/storefront-experience': 'Storefront Experience',
    '/services': 'Services',
    '/services/digital-experiences': 'Digital Experiences',
    '/services/storefront-access-systems': 'Storefront and Access Systems',
    '/services/dashboards-workflow-tools': 'Dashboards and Workflow Tools',
    '/services/agentic-seo': 'Agentic SEO',
    '/about': 'About',
    '/insights': 'Insights',
    '/contact': 'Contact',
    '/lab/eidos-brain': 'Eidos Brain Lab',
    '/snapshot': 'Eidos Snapshot',
    '/editorial-policy': 'Editorial Policy'
  };
  const breadcrumbName = article?.title || breadcrumbNames[normalized] || '';

  if (breadcrumbName) {
    const items: Array<Record<string, unknown>> = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }
    ];
    if (article) {
      items.push({ '@type': 'ListItem', position: 2, name: 'Insights', item: absoluteUrl('/insights') });
      items.push({ '@type': 'ListItem', position: 3, name: breadcrumbName, item: absoluteUrl(normalized) });
    } else if (normalized.startsWith('/work/')) {
      items.push({ '@type': 'ListItem', position: 2, name: 'Work', item: absoluteUrl('/work') });
      items.push({ '@type': 'ListItem', position: 3, name: breadcrumbName, item: absoluteUrl(normalized) });
    } else if (normalized.startsWith('/services/')) {
      items.push({ '@type': 'ListItem', position: 2, name: 'Services', item: absoluteUrl('/services') });
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
