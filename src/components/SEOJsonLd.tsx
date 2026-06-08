import { absoluteUrl, siteConfig } from '../config/site';
import { articles } from '../data/articles';
import { storeCaseStudies } from '../data/portfolio';

export function SEOJsonLd() {
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
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name
    }
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Work', item: absoluteUrl('/#work') },
      { '@type': 'ListItem', position: 3, name: 'Insights', item: absoluteUrl('/#insights') },
      { '@type': 'ListItem', position: 4, name: 'Start a Project', item: absoluteUrl('/#start') }
    ]
  };

  const articleGraph = articles.map((article) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.logos.icon
      }
    },
    mainEntityOfPage: absoluteUrl(article.canonicalPath),
    keywords: article.tags.join(', ')
  }));

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

  return (
    <>
      {[organization, website, breadcrumbs, creativeWorks, ...articleGraph].map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}
