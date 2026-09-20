import { homedir } from 'node:os';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function reportSql(days = 7, view = 'public') {
  if (![1,7,30].includes(days) || !['public','qa','combined'].includes(view)) throw Error('Use days 1, 7, or 30 and view public, qa, or combined.');
  const filter = view === 'public' ? "AND traffic='public'" : view === 'qa' ? "AND traffic IN ('production_qa','preview_qa','automation')" : '';
  return `WITH sessions AS (
    SELECT day,session_hash,traffic,landing,source,medium,campaign,referral,
      SUM(event='page_view') page_views, MAX(event='page_view') session,
      MAX(event='page_view' AND path='/friction-review') review,
      SUM(event='friction_cta_click') cta_clicks,MAX(event='friction_cta_click') cta_sessions,
      MAX(event='friction_form_start') starts,SUM(event='friction_submit') submissions,
      MAX(event='friction_submit')*MAX(event='page_view') submitted_sessions,SUM(event='contact_submit') contacts,
      MAX(event='friction_form_start')*MAX(event='friction_submit') started_and_submitted
    FROM growth_events WHERE day>=date('now','-${days-1} days') ${filter}
    GROUP BY day,session_hash,traffic,landing,source,medium,campaign,referral
  ) SELECT traffic,landing,source,medium,campaign,referral,SUM(session) sessions,SUM(page_views) page_views,
    SUM(review) review_sessions,SUM(cta_clicks) cta_clicks,SUM(cta_sessions) cta_sessions,SUM(starts) starts,
    SUM(submissions) submissions,SUM(submitted_sessions) submitted_sessions,SUM(contacts) contacts,
    SUM(started_and_submitted) started_and_submitted FROM sessions GROUP BY traffic,landing,source,medium,campaign,referral`;
}
export function summarize(rows, pages, days, view) {
  const totals = Object.fromEntries(['sessions','page_views','review_sessions','cta_clicks','cta_sessions','starts','submissions','submitted_sessions','contacts','started_and_submitted'].map(k=>[k, rows.reduce((n,r)=>n+Number(r[k]||0),0)]));
  const rate=(a,b)=>b ? Math.round(a/b*10000)/100 : null;
  const grouped=(keys)=>Object.values(rows.reduce((acc,r)=>{ const key=JSON.stringify(keys.map(k=>r[k])); const item=acc[key] ||= {...Object.fromEntries(keys.map(k=>[k,r[k]])),sessions:0,submissions:0,contacts:0}; for(const k of ['sessions','submissions','contacts'])item[k]+=Number(r[k]||0);return acc; },{})).map(r=>({...r,submissionRatePercent:rate(r.submissions,r.sessions)})).sort((a,b)=>b.sessions-a.sessions);
  return {generatedAt:new Date().toISOString(),days,view,timezone:'UTC',baselineStarts:'2026-09-20; no historical backfill',coverage:'Consented measurable sessions, not all people. Daily rotating, tab-scoped IDs; no unique-person claim.',
    historicalGA4:'Historical GA4 read access unavailable from deployment environment.',totals,
    conversionPercent:{visitToReview:rate(totals.review_sessions,totals.sessions),visitToSubmit:rate(totals.submitted_sessions,totals.sessions),startToSubmit:rate(totals.started_and_submitted,totals.starts)},
    landingPages:grouped(['landing']),sources:grouped(['source','medium']),campaigns:grouped(['campaign']),referrals:grouped(['referral']),traffic:grouped(['traffic']),sourceConversions:grouped(['source','medium','campaign']),topPages:pages,
    limitations:['Public means not identified as QA, automation or an obvious bot; human identity is not verified.','Missing consent, blockers, network failures and provider-acknowledged deliveries whose telemetry failed are not counted.','Null conversion means no denominator, not zero performance.','No historical backfill; session detail retained for 60 days.']};
}
function markdown(r) { return `# Eidos Works growth report\n\n${r.days} days, ${r.view}, UTC. ${r.coverage}\n\n${r.historicalGA4}\n\n## Funnel\n\n| Metric | Count |\n|---|---:|\n${Object.entries(r.totals).map(([k,v])=>`| ${k} | ${v} |`).join('\n')}\n\n## Conversion percentages\n\n${Object.entries(r.conversionPercent).map(([k,v])=>`- ${k}: ${v===null?'NA (no denominator)':v+'%'}`).join('\n')}\n\n## Acquisition and pages\n\n\`\`\`json\n${JSON.stringify({landingPages:r.landingPages,sources:r.sources,campaigns:r.campaigns,referrals:r.referrals,sourceConversions:r.sourceConversions,topPages:r.topPages},null,2)}\n\`\`\`\n\n## Limits\n\n${r.limitations.map(x=>'- '+x).join('\n')}\n`; }
async function main() {
  const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('=')));
  const days=Number(args.days||7),view=args.view||'public'; reportSql(days,view);
  let data;
  if(args.input) data=JSON.parse(await readFile(args.input,'utf8'));
  else {
    const credentials = process.env.EIDOS_GROWTH_OWNER_TOKEN ? { EIDOS_GROWTH_OWNER_TOKEN: process.env.EIDOS_GROWTH_OWNER_TOKEN } : JSON.parse(await readFile(process.env.EIDOS_GROWTH_CREDENTIAL_FILE || resolve(homedir(), '.codex/secrets/eidos-growth-owner.json'), 'utf8'));
    const origin = args.origin || 'https://eidos-works.com';
    if (!['https://eidos-works.com','https://eidosworks.pages.dev','http://127.0.0.1:8788'].includes(origin)) throw Error('Unapproved report origin');
    const response = await fetch(`${origin}/api/growth/report?days=${days}&view=${view}`, { headers: { authorization: 'Bearer ' + credentials.EIDOS_GROWTH_OWNER_TOKEN }, redirect: 'error' });
    if (!response.ok) throw Error(`Owner report returned HTTP ${response.status}`);
    data = await response.json();
  }
  const r=summarize(data.rows,data.pages,days,view);const out=args.out||`artifacts/growth/reports/${new Date().toISOString().slice(0,10)}-${days}d-${view}`;
  await mkdir(out,{recursive:true});await writeFile(`${out}/report.json`,JSON.stringify(r,null,2)+'\n');await writeFile(`${out}/report.md`,markdown(r));console.log(markdown(r));console.log(`Saved ${out}/report.md`);
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) await main();
