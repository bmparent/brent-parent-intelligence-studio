import { useEffect } from 'react';
import { pageMetadata } from '../data/pages';

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

export function PageMeta({ path }: { path: string }) {
  useEffect(() => {
    const metadata = pageMetadata(path);
    document.title = metadata.title;
    setMeta('meta[name="description"]', 'content', metadata.description);
    setMeta('meta[property="og:title"]', 'content', metadata.title);
    setMeta('meta[property="og:description"]', 'content', metadata.description);
    setMeta('meta[property="og:type"]', 'content', metadata.type);
    setMeta('meta[property="og:url"]', 'content', metadata.url);
    if (metadata.image) setMeta('meta[property="og:image"]', 'content', metadata.image);
    setMeta('meta[name="twitter:title"]', 'content', metadata.title);
    setMeta('meta[name="twitter:description"]', 'content', metadata.description);
    if (metadata.image) setMeta('meta[name="twitter:image"]', 'content', metadata.image);

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = metadata.url;

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (metadata.noIndex && !robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    if (robots) robots.content = metadata.noIndex ? 'noindex, nofollow' : 'index, follow';

    let referrer = document.head.querySelector<HTMLMetaElement>('meta[name="referrer"]');
    if (!referrer) {
      referrer = document.createElement('meta');
      referrer.name = 'referrer';
      document.head.appendChild(referrer);
    }
    referrer.content = metadata.noReferrer ? 'no-referrer' : 'strict-origin-when-cross-origin';
  }, [path]);

  return null;
}
