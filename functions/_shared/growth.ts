import { body, HttpError, json, origin, type Database } from './platform/core';
import { growthEvents, publicPath, validateContext, type GrowthContext } from '../../src/lib/growthContract';

export interface GrowthEnv { EIDOS_GROWTH_DB?: Database; EIDOS_PLATFORM_TOKEN?: string }
export function classifyTraffic(request: Request, qa: boolean) {
  const ua = request.headers.get('user-agent') || '';
  if (/headless|playwright|puppeteer/i.test(ua) || request.headers.get('x-eidos-qa') === 'automation') return 'automation';
  if (/bot\b|crawler|spider|slurp/i.test(ua)) return 'bot';
  if (new URL(request.url).hostname !== 'eidos-works.com') return 'preview_qa';
  return qa ? 'production_qa' : 'public';
}
async function digest(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)))].map(n => n.toString(16).padStart(2, '0')).join('');
}
export async function recordGrowth(request: Request, env: GrowthEnv, context: GrowthContext, event: string, path: string, eventId: string) {
  if (!env.EIDOS_GROWTH_DB || !env.EIDOS_PLATFORM_TOKEN || env.EIDOS_PLATFORM_TOKEN.length < 32) throw new HttpError(503, 'Growth measurement is unavailable.');
  const database = env.EIDOS_GROWTH_DB;
  const day = new Date().toISOString().slice(0,10);
  const sid = await digest(env.EIDOS_PLATFORM_TOKEN, `growth-session:${day}:${context.session}`);
  const traffic = classifyTraffic(request, context.qa);
  const once = ['session_start','landing_page','friction_form_start'].includes(event);
  const id = await digest(env.EIDOS_PLATFORM_TOKEN, `growth-event:${day}:${sid}:${event}:${once ? 'once' : eventId}`);
  const period = Math.floor(Date.now() / 60000);
  const daily = await database.prepare('INSERT INTO growth_quotas(bucket,period,used,expires) VALUES(?,?,1,?) ON CONFLICT(bucket,period) DO UPDATE SET used=used+1 WHERE used<5000 RETURNING used').bind('global-day', Math.floor(period / 1440), period + 1440).first();
  if (!daily) throw new HttpError(429, 'Daily measurement limit reached.');
  // Atomic rate reservations. No IP address or raw UA is persisted, even in quota keys.
  for (const [bucket, limit] of [[`session:${sid}`, 90], ['global', 600]] as const) {
    const row = await database.prepare('INSERT INTO growth_quotas(bucket,period,used,expires) VALUES(?,?,1,?) ON CONFLICT(bucket,period) DO UPDATE SET used=used+1 WHERE used<? RETURNING used').bind(bucket, period, period + 1440, limit).first();
    if (!row) throw new HttpError(429, 'Measurement rate limit reached.');
  }
  const a = context.attribution;
  const referral = a.referrer ? new URL(a.referrer).hostname : '';
  const external = referral && !['eidos-works.com','eidosworks.pages.dev'].includes(referral);
  await database.batch([
    database.prepare('DELETE FROM growth_events WHERE day < date(\'now\',\'-60 days\')'),
    database.prepare('DELETE FROM growth_quotas WHERE expires < ?').bind(period),
    database.prepare('INSERT OR IGNORE INTO growth_events(id,day,session_hash,event,traffic,path,landing,source,medium,campaign,content,referral) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id,day,sid,event,traffic,event === 'landing_page' ? a.landingPage : path,a.landingPage,
        a.utmSource || (external ? referral : 'direct'), a.utmMedium || (external ? 'referral' : 'none'),a.utmCampaign,a.utmContent,external ? referral : ''),
  ]);
}
export async function growthEndpoint({ request, env }: { request: Request; env: GrowthEnv }) {
  try {
    origin(request);
    const input = await body(request, 2400);
    if (Object.keys(input).length !== 7 || Object.keys(input).some(k => !['event','id','path','consent','session','qa','attribution'].includes(k)) ||
        !growthEvents.includes(input.event as typeof growthEvents[number]) || typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/.test(input.id) || !publicPath(input.path)) throw new HttpError(400, 'Unapproved analytics event.');
    let context: GrowthContext;
    try { context = validateContext({ consent: input.consent, session: input.session, qa: input.qa, attribution: input.attribution }); }
    catch { throw new HttpError(400, 'Invalid analytics context.'); }
    await recordGrowth(request, env, context, String(input.event), String(input.path), input.id);
    return json({ accepted: true });
  } catch (error) { return json({ error: error instanceof HttpError ? error.message : 'Measurement unavailable.' }, error instanceof HttpError ? error.status : 503); }
}
/** Only called after provider acknowledgement. Telemetry is optional and cannot change delivery success. */
export async function confirmedInquiry(request: Request, env: GrowthEnv, value: unknown, friction: boolean, qa: boolean, receipt: string) {
  try {
    const context = validateContext(value);
    if (qa) context.qa = true;
    await recordGrowth(request, env, context, friction ? 'friction_submit' : 'contact_submit', friction ? '/friction-review' : '/contact', receipt);
    return true;
  } catch { return false; }
}
