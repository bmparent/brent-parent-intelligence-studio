import { renderToString } from 'react-dom/server';
import App from './App';
import { allRoutes, getRouteMeta, routeMetas, siteConfig } from './data/platform';
import './styles/main.css';

export function render(path = '/') {
  return renderToString(<App initialPath={path} />);
}

export function getPrerenderRoutes() {
  return allRoutes;
}

export function getPrerenderMeta(path: string) {
  return getRouteMeta(path);
}

export { routeMetas, siteConfig };
