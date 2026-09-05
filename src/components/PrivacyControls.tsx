import { useEffect, useState } from 'react';
import {
  consent,
  setConsent,
  startAnalytics,
  stopAnalytics,
  track,
  pageView,
} from '../lib/analytics';
import { usePublicConfig } from '../lib/platform';
export function PrivacyControls() {
  const config = usePublicConfig();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const open = () => setShow(true);
    window.addEventListener('eidos:privacy', open);
    const change = () => {
      if (consent() === 'denied') stopAnalytics();
      else if (config?.gaMeasurementId) startAnalytics(config.gaMeasurementId);
    };
    window.addEventListener('eidos:consent', change);
    if (config?.gaMeasurementId) {
      if (consent() === 'granted') startAnalytics(config.gaMeasurementId);
      else if (!consent()) queueMicrotask(() => setShow(true));
    }
    return () => {
      window.removeEventListener('eidos:privacy', open);
      window.removeEventListener('eidos:consent', change);
    };
  }, [config]);
  useEffect(() => {
    window.addEventListener('popstate', pageView);
    window.addEventListener('eidos:navigation', pageView);
    const click = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a');
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.hostname === 'eidos-sentinel-lab.vercel.app') track('lab_open');
      if (
        url.origin === window.location.origin &&
        url.pathname.startsWith('/work/')
      )
        track('select_project', { item_id: url.pathname.split('/')[2] });
    };
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('click', click);
      window.removeEventListener('popstate', pageView);
      window.removeEventListener('eidos:navigation', pageView);
    };
  }, []);
  if (!show) return null;
  return (
    <section className="ew-privacy-panel" aria-label="Analytics choices">
      <div>
        <strong>A little insight, with your permission.</strong>
        <p>
          Optional Google Analytics helps us understand which work and ideas are
          useful. Questions, messages, and payment details are excluded.{' '}
          <a href="/privacy">Privacy details</a>
        </p>
        {!config?.gaMeasurementId && (
          <small>Analytics is not currently active.</small>
        )}
      </div>
      <div className="ew-privacy-actions">
        <button
          type="button"
          onClick={() => {
            setConsent('denied');
            setShow(false);
          }}
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => {
            setConsent('granted');
            setShow(false);
          }}
        >
          Allow analytics
        </button>
      </div>
    </section>
  );
}
