import { renderToString } from 'react-dom/server';
import App from './App';
import { pageMetadata, prerenderPagePaths } from './data/pages';
import './styles/main.css';

export function render(requestPath = '/') {
  return renderToString(<App requestPath={requestPath} />);
}

export function getPrerenderPages() {
  return prerenderPagePaths().map((path) => ({ path, ...pageMetadata(path) }));
}
