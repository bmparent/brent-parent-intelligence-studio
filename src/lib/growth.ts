import { emptyAttribution, growthEvents, publicPath, sanitizeAttribution, validateContext, type GrowthContext } from './growthContract';

const storageKey = 'eidos.growth.v1';
let volatile: (GrowthContext & { touched: number }) | null = null;
let lastPage = '';
function allowed() { try { return localStorage.getItem('eidos.analytics.v1') === 'granted'; } catch { return false; } }
export function clearGrowth() {
  volatile = null; lastPage = '';
  try { sessionStorage.removeItem(storageKey); } catch { /* Optional storage. */ }
}
export function growthContext(): GrowthContext | undefined {
  if (typeof window === 'undefined' || !allowed() || !publicPath(window.location.pathname)) return undefined;
  const now = Date.now();
  try {
    if (!volatile) {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved && now - saved.touched < 30 * 60_000 && now >= saved.touched) volatile = { ...validateContext({ consent: saved.consent, session: saved.session, qa: saved.qa, attribution: saved.attribution }), touched: saved.touched };
    }
  } catch { /* Invalid or unavailable session storage starts a fresh session. */ }
  if (!volatile || now - volatile.touched >= 30 * 60_000) {
    const query = new URLSearchParams(window.location.search);
    volatile = { consent: true, session: crypto.randomUUID(), qa: query.get('eidos_qa') === '1', touched: now,
      attribution: sanitizeAttribution({ utmSource: query.get('utm_source'), utmMedium: query.get('utm_medium'),
        utmCampaign: query.get('utm_campaign'), utmContent: query.get('utm_content'),
        landingPage: window.location.pathname, referrer: document.referrer }) };
  }
  volatile.touched = now;
  // Explicit QA designation is sticky through navigation, never inferred from an unusual browser.
  if (new URLSearchParams(window.location.search).get('eidos_qa') === '1') volatile.qa = true;
  try { sessionStorage.setItem(storageKey, JSON.stringify(volatile)); } catch { /* In-memory session still works. */ }
  return { consent: true, session: volatile.session, qa: volatile.qa, attribution: volatile.attribution };
}
export function inquiryAttribution() { return growthContext()?.attribution || { ...emptyAttribution, landingPage: publicPath(window.location.pathname) || '/' }; }
export function growthTrack(event: string) {
  if (!growthEvents.includes(event as typeof growthEvents[number])) return;
  const context = growthContext();
  if (!context) return;
  // No external URL, referrer, cookies, form values or arbitrary event properties.
  void fetch('/api/growth/events', { method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
    headers: { 'content-type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ event, id: crypto.randomUUID(), path: publicPath(window.location.pathname), ...context }),
  }).catch(() => { /* Telemetry failure never blocks the public site. */ });
}
export function growthPageView() {
  if (!allowed()) return;
  const path = publicPath(window.location.pathname);
  if (!path) { lastPage = ''; return; }
  if (path === lastPage) return;
  lastPage = path;
  growthTrack('page_view');
  // Server deduplicates these by daily session hash, including full-document navigations.
  growthTrack('session_start');
  growthTrack('landing_page');
}
