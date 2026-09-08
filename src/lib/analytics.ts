export type EidosEvent =
  | 'assistant_open'
  | 'assistant_question'
  | 'assistant_ai_request'
  | 'question_submit'
  | 'reply_submit'
  | 'generate_lead'
  | 'begin_checkout'
  | 'purchase'
  | 'product_preview'
  | 'lab_open'
  | 'select_project';
export type EventDetails = {
  mode?: 'sources' | 'ai';
  category?: 'build' | 'design' | 'agents';
  item_id?: string;
  transaction_id?: string;
  value?: number;
  currency?: 'USD';
};
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    __eidosAnalyticsId?: string;
    __eidosLastPage?: string;
  }
}
const key = 'eidos.analytics.v1';
function trafficDetails() {
  const preview = window.location.hostname !== 'eidos-works.com';
  return {
    traffic_type: preview ? 'qa' : /(?:bot|crawler|spider|headless)/i.test(navigator.userAgent) ? 'agent' : 'human',
    ...(preview ? { debug_mode: true } : {}),
  };
}
export function consent() {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function setConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Storage is optional. */
  }
  window.dispatchEvent(new CustomEvent('eidos:consent', { detail: value }));
}
export function safePagePath() {
  const path = window.location.pathname;
  if (path.startsWith('/snapshot/') || path === '/shop/success' || path === '/account' || path.startsWith('/account/') || path.startsWith('/members/'))
    return '/private';
  if (path.startsWith('/community/thread/')) return '/community/thread';
  return path;
}
export function startAnalytics(id: string) {
  if (
    consent() !== 'granted' ||
    !/^G-[A-Z0-9]{5,20}$/.test(id)
  )
    return;
  const flags = window as unknown as Record<string, unknown>;
  if (window.__eidosAnalyticsId) {
    if (window.__eidosAnalyticsId === id && flags['ga-disable-' + id]) {
      flags['ga-disable-' + id] = false;
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
      pageView();
    }
    return;
  }
  // No tag, cookies, or queued analytics before consent. Never send query strings or user text.
  window.__eidosAnalyticsId = id;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params -- Keep the documented Google tag IArguments command shape.
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: window.location.origin + safePagePath(),
    page_referrer: '',
    ...trafficDetails(),
  });
  const script = document.createElement('script');
  script.async = true;
  script.id = 'eidos-google-tag';
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(script);
  pageView();
}
/** Call after navigation; suppress duplicate notifications and all private routes. */
export function pageView() {
  const id = window.__eidosAnalyticsId;
  if (consent() !== 'granted' || !id ||
      (window as unknown as Record<string, unknown>)['ga-disable-' + id]) return;
  const path = safePagePath();
  if (path === window.__eidosLastPage) return;
  window.__eidosLastPage = path;
  if (path !== '/private' && path !== '/community/thread')
    window.gtag?.('event', 'page_view', {
      page_location: window.location.origin + path,
      page_title: path === '/' ? 'Eidos Works' : path.split('/')[1],
      page_referrer: '',
      ...trafficDetails(),
    });
}
export function stopAnalytics() {
  const id = window.__eidosAnalyticsId;
  if (!id) return;
  (window as unknown as Record<string, unknown>)['ga-disable-' + id] = true;
  delete window.__eidosLastPage;
  window.gtag?.('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of [
      '',
      window.location.hostname,
      '.' + window.location.hostname,
    ])
      document.cookie = `${name}=; Max-Age=0; path=/; ${domain ? 'domain=' + domain + ';' : ''}`;
  }
}
export function track(event: EidosEvent, details: EventDetails = {}) {
  if (consent() !== 'granted' || !window.__eidosAnalyticsId) return;
  const safe: EventDetails = {};
  if (details.mode === 'sources' || details.mode === 'ai') safe.mode = details.mode;
  if (details.category === 'build' || details.category === 'design' || details.category === 'agents') safe.category = details.category;
  if (details.item_id && /^[a-z0-9-]{1,60}$/.test(details.item_id))
    safe.item_id = details.item_id;
  if (details.transaction_id && /^[a-f0-9-]{36}$/.test(details.transaction_id))
    safe.transaction_id = details.transaction_id;
  if (typeof details.value === 'number') safe.value = details.value;
  if (details.currency === 'USD') safe.currency = 'USD';
  window.gtag?.('event', event, {
    ...safe,
    ...trafficDetails(),
    page_location: window.location.origin + safePagePath(),
    page_referrer: '',
  });
}
