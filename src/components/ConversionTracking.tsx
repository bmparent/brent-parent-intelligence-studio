import { useEffect } from 'react';
import { track } from '../lib/analytics';

export function ConversionTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;
      try {
        const url = new URL(link.href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname === '/friction-review') {
          track('friction_cta_click');
        }
      } catch {
        /* Ignore malformed or non-URL link targets. */
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
