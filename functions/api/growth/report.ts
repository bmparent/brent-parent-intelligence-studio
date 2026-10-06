import { admin, HttpError, json } from '../../_shared/platform/core';
import type { GrowthEnv } from '../../_shared/growth';

export async function onRequestGet({ request, env }: { request: Request; env: GrowthEnv & { EIDOS_GROWTH_OWNER_TOKEN?: string; EIDOS_ADMIN_AUTOMATION_ALLOWED?: string; EIDOS_ACCESS_TEAM_DOMAIN?: string; EIDOS_ACCESS_AUD?: string; EIDOS_OWNER_EMAIL?: string } }) {
  try {
    await admin(request, { ...env, EIDOS_ADMIN_TOKEN: env.EIDOS_GROWTH_OWNER_TOKEN, EIDOS_OWNER_AUDIT_DB: env.EIDOS_GROWTH_DB });
    const url = new URL(request.url), days = Number(url.searchParams.get('days') || 7), view = url.searchParams.get('view') || 'public';
    if (![1,7,30].includes(days) || !['public','qa','combined'].includes(view) || [...url.searchParams.keys()].some(k=>!['days','view'].includes(k))) throw new HttpError(400, 'Invalid report range or view.');
    if (!env.EIDOS_GROWTH_DB) throw new HttpError(503, 'Growth database unavailable.');
    const filter = view === 'public' ? "AND traffic='public'" : view === 'qa' ? "AND traffic IN ('production_qa','preview_qa','automation')" : '';
    // Aggregates only. Never return session IDs or event IDs through the owner API.
    const rows = await env.EIDOS_GROWTH_DB.prepare(`WITH sessions AS (
      SELECT day,session_hash,traffic,landing,source,medium,campaign,referral,
        SUM(event='page_view') page_views, MAX(event='page_view') session,
        MAX(event='page_view' AND path='/friction-review') review,
        SUM(event='friction_cta_click') cta_clicks,MAX(event='friction_cta_click') cta_sessions,
        MAX(event='friction_form_start') starts,SUM(event='friction_submit') submissions,
        MAX(event='friction_submit')*MAX(event='page_view') submitted_sessions,SUM(event='contact_submit') contacts,
        MAX(event='friction_form_start')*MAX(event='friction_submit') started_and_submitted
      FROM growth_events WHERE day>=date('now',?) ${filter}
      GROUP BY day,session_hash,traffic,landing,source,medium,campaign,referral
    ) SELECT traffic,landing,source,medium,campaign,referral,SUM(session) sessions,SUM(page_views) page_views,
      SUM(review) review_sessions,SUM(cta_clicks) cta_clicks,SUM(cta_sessions) cta_sessions,SUM(starts) starts,
      SUM(submissions) submissions,SUM(submitted_sessions) submitted_sessions,SUM(contacts) contacts,
      SUM(started_and_submitted) started_and_submitted FROM sessions GROUP BY traffic,landing,source,medium,campaign,referral`).bind(`-${days-1} days`).all();
    const pages = await env.EIDOS_GROWTH_DB.prepare(`SELECT path,COUNT(*) page_views FROM growth_events WHERE event='page_view' AND day>=date('now',?) ${filter} GROUP BY path ORDER BY page_views DESC LIMIT 30`).bind(`-${days-1} days`).all();
    return json({ rows: rows.results, pages: pages.results, days, view, timezone: 'UTC' });
  } catch (error) { return json({ error: error instanceof HttpError ? error.message : 'Report unavailable.' }, error instanceof HttpError ? error.status : 503); }
}
