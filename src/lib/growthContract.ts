import publicPaths from '../data/growth-paths.json';

export const growthEvents = ['page_view', 'session_start', 'landing_page', 'friction_cta_click', 'friction_form_start', 'select_project', 'lab_open'] as const;
export type GrowthEvent = typeof growthEvents[number];
export type Attribution = { utmSource: string; utmMedium: string; utmCampaign: string; utmContent: string; landingPage: string; referrer: string };
export const emptyAttribution: Attribution = { utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', landingPage: '/', referrer: '' };
export function publicPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.length > 240 || /[?#%\\\s]/.test(value)) return null;
  const path = value.replace(/\/+$/, '') || '/';
  return publicPaths.includes(path) ? path : null;
}
export function campaignToken(value: unknown): string {
  return typeof value === 'string' && /^[a-z][a-z0-9_-]{0,63}$/.test(value) ? value : '';
}
// Only host and explicitly safe public paths. Unknown referrer paths may contain names or receipt IDs.
export function safeReferral(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2000) return '';
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port ||
        !/^(?:[a-z0-9-]+\.)+[a-z]{2,24}$/.test(url.hostname) || /(?:localhost|local|internal)$/.test(url.hostname)) return '';
    const path = ['eidos-works.com', 'eidosworks.pages.dev'].includes(url.hostname)
      ? publicPath(url.pathname) || '/' : ['/feed/', '/'].includes(url.pathname) ? url.pathname : '/';
    return `https://${url.hostname}${path}`;
  } catch { return ''; }
}
export function sanitizeAttribution(input: Partial<Record<keyof Attribution, unknown>>): Attribution {
  return { utmSource: campaignToken(input.utmSource), utmMedium: campaignToken(input.utmMedium),
    utmCampaign: campaignToken(input.utmCampaign), utmContent: campaignToken(input.utmContent),
    landingPage: publicPath(input.landingPage) || '/', referrer: safeReferral(input.referrer) };
}
export type GrowthContext = { consent: true; session: string; qa: boolean; attribution: Attribution };
export function validateContext(value: unknown): GrowthContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid growth context');
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some(k => !['consent', 'session', 'qa', 'attribution'].includes(k)) || v.consent !== true ||
      typeof v.session !== 'string' || !/^[a-f0-9-]{36}$/.test(v.session) || typeof v.qa !== 'boolean' ||
      !v.attribution || typeof v.attribution !== 'object' || Array.isArray(v.attribution)) throw Error('Invalid growth context');
  const a = v.attribution as Record<string, unknown>;
  const clean = sanitizeAttribution(a);
  if (Object.keys(a).length !== 6 || Object.keys(a).some(k => !(k in clean)) ||
      Object.entries(clean).some(([k,val]) => a[k] !== val)) throw Error('Invalid attribution');
  return { consent: true, session: v.session, qa: v.qa, attribution: clean };
}
