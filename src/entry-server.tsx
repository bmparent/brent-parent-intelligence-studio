import { renderToString } from 'react-dom/server';
import App from './App';
import { absoluteUrl, siteConfig } from './config/site';
import { articles } from './data/articles';
import './styles/main.css';

const homeTitle = 'Eidos Works - Systems, Storefronts, Dashboards, Automation';
const insightsTitle = 'Insights | Eidos Works';
const editorialPolicyTitle = 'Editorial Policy | Eidos Works';

export function render(requestPath = '/') {
  return renderToString(<App requestPath={requestPath} />);
}

export function getPrerenderPages() {
  return [
    {
      path: '/',
      title: homeTitle,
      description: siteConfig.description,
      url: absoluteUrl('/'),
      type: 'website',
      image: absoluteUrl(siteConfig.socialImage)
    },
    {
      path: '/insights',
      title: insightsTitle,
      description: 'Source-linked Eidos Works articles on storefront UX, automation, AI-ready search, operations, media workflows, and applied systems.',
      url: absoluteUrl('/insights'),
      type: 'website',
      image: absoluteUrl(siteConfig.socialImage)
    },
    {
      path: '/editorial-policy',
      title: editorialPolicyTitle,
      description: 'How Eidos Works selects topics, sources current claims, handles corrections, and uses editorial technology.',
      url: absoluteUrl('/editorial-policy'),
      type: 'website',
      image: absoluteUrl(siteConfig.socialImage)
    },
    ...articles.map((article) => ({
      path: article.canonicalPath,
      title: `${article.title} | Eidos Works`,
      description: article.description,
      url: absoluteUrl(article.canonicalPath),
      type: 'article',
      image: absoluteUrl(article.ogImage)
    }))
  ];
}
