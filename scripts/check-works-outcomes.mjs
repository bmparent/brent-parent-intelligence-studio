import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.EIDOS_MONITOR_ORIGIN||'https://eidos-works.com';
if(!/^https:\/\/eidos-works\.com$/.test(origin))throw Error('Monitor origin must be canonical production.');
const access=process.env.EIDOS_OWNER_ACCESS_JWT;
if(!access&&!process.env.EIDOS_ADMIN_TOKEN)throw Error('EIDOS_OWNER_ACCESS_JWT or EIDOS_ADMIN_TOKEN is required; never put credentials in a URL.');
const headers=access?{'cf-access-jwt-assertion':access,cookie:'CF_Authorization='+access}:{authorization:'Bearer '+process.env.EIDOS_ADMIN_TOKEN};
if(!access&&process.env.CF_ACCESS_CLIENT_ID&&process.env.CF_ACCESS_CLIENT_SECRET){
  headers['CF-Access-Client-Id']=process.env.CF_ACCESS_CLIENT_ID;
  headers['CF-Access-Client-Secret']=process.env.CF_ACCESS_CLIENT_SECRET;
}
const r=await fetch(origin+'/api/operations/readiness',{headers,redirect:'error',signal:AbortSignal.timeout(15000)});
if(!r.ok)throw Error('Readiness request failed: HTTP '+r.status);
const state=await r.json();
const alerts=[];
if(state.database!=='ready')alerts.push('Database unavailable');
for(const row of state.outcomes||[])if(/^http_5|source_fallback/.test(row.outcome))alerts.push(`${row.feature}: ${row.outcome} (${row.count} recorded attempts)`);
const result={checkedAt:new Date().toISOString(),sourceRevision:state.sourceRevision,alerts,meaning:'Request outcomes only. Verify mailbox delivery, Stripe entitlement and downloaded bytes independently.'};
await mkdir('artifacts/operations',{recursive:true});await writeFile('artifacts/operations/latest-outcomes.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(alerts.length)process.exitCode=1;
