import { useEffect, useRef } from 'react';
import { usePublicConfig } from '../lib/platform';
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}
let loader: Promise<void> | undefined;
function load() {
  return (loader ??= new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = undefined;
      reject(Error('verification-unavailable'));
    };
    document.head.appendChild(script);
  }));
}
export function Turnstile({
  onToken,
  action = 'community',
  resetKey = 0,
}: {
  onToken: (value: string) => void;
  action?: string;
  resetKey?: number;
}) {
  const config = usePublicConfig();
  const ref = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);
  useEffect(() => {
    if (!config?.turnstileSiteKey || config.localTest) return;
    let active = true;
    let widget: string | undefined;
    load()
      .then(() => {
        if (!active || !ref.current) return;
        widget = window.turnstile?.render(ref.current, {
          sitekey: config.turnstileSiteKey,
          action,
          theme: 'light',
          size: 'flexible',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => onTokenRef.current(''),
        });
      })
      .catch(() => onTokenRef.current(''));
    return () => {
      active = false;
      if (widget) window.turnstile?.remove(widget);
    };
  }, [config, action, resetKey]);
  return <div ref={ref} className="ew-turnstile" />;
}
