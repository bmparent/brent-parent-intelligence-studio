import { renderToString } from 'react-dom/server';
import App from './App';
import { absoluteUrl, siteConfig } from './config/site';
import { articles } from './data/articles';
import './styles/main.css';

const homeTitle = 'Eidos Works - Systems, Storefronts, Dashboards, Automation';

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
      type: 'website'
    },
    ...articles.map((article) => ({
      path: article.canonicalPath,
      title: `${article.title} | Eidos Works`,
      description: article.description,
      url: absoluteUrl(article.canonicalPath),
      type: 'article'
    }))
  ];
}
