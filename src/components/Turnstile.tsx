import { useEffect, useRef, useState } from 'react';
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
  const [issue, setIssue] = useState('');
  const [attempt, setAttempt] = useState(0);
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
          callback: (token: string) => { if (active) { setIssue(''); onTokenRef.current(token); } },
          'expired-callback': () => { if (active) { onTokenRef.current(''); setIssue('Verification expired. Retry verification to continue.'); } },
          'error-callback': () => { if (active) { onTokenRef.current(''); setIssue('Verification could not finish. Retry verification or try again later.'); } },
        });
      })
      .catch(() => { if (active) { onTokenRef.current(''); setIssue('Verification could not load. Retry verification or try again later.'); } });
    return () => {
      active = false;
      if (widget) window.turnstile?.remove(widget);
    };
  }, [config, action, resetKey, attempt]);
  return <><div ref={ref} className="ew-turnstile" />{issue && <>
    <p role="status">{issue}</p>
    <button type="button" className="ew-button ew-button--secondary" onClick={() => { setIssue(''); onTokenRef.current(''); setAttempt(n => n + 1); }}>Retry verification</button>
  </>}</>;
}
