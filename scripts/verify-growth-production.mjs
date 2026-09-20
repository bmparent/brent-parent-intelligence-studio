import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const base='https://eidos-works.com',out='artifacts/growth/phase1-20260920',dist=process.env.GROWTH_DIST_DIR||'dist';await mkdir(out,{recursive:true});
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const routes=['/','/friction-review','/central-florida','/services/digital-experiences','/services/business-systems','/services/intelligent-systems','/work','/contact'];const results=[];
for(const path of routes) {
  const r=await fetch(base+path,{cache:'no-store'}),html=await r.text();assert.equal(r.status,200,path);
  const local=await readFile(`${dist}${path==='/'?'':path}/index.html`,'utf8');
  const assets=[...local.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/g)].map(m=>m[1]);assert.ok(assets.length);assert.ok(assets.every(a=>html.includes(a)),path+' must serve this exact build');
  assert.ok(html.includes('social-preview.png'));assert.ok(html.includes('href="/friction-review"'));results.push({path,status:r.status,exactAssets:assets,social:true,cta:true});
}
for(const path of ['/sitemap.xml','/robots.txt','/social-preview.png']){const r=await fetch(base+path);assert.equal(r.status,200);results.push({path,status:r.status});}
const unknown=await fetch(base+'/growth-nonexistent-page');assert.equal(unknown.status,404);results.push({path:'/growth-nonexistent-page',status:unknown.status});
const config=await(await fetch(base+'/api/public-config')).json();assert.equal(config.gaMeasurementId,'G-8N7Y7EM4CS');
const inquiry=await(await fetch(base+'/api/project-inquiries')).json();assert.equal(inquiry.deliveryConfigured,true);assert.equal(inquiry.privateMailerConfigured,true);
const owner=await fetch(base+'/api/growth/report');assert.equal(owner.status,401);
const denied=await fetch(base+'/api/growth/events',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({event:'unapproved'})});assert.equal(denied.status,400);
await writeFile(`${out}/production-responses.json`,JSON.stringify({commit,base,verifiedAt:new Date().toISOString(),results,analyticsMeasurementId:config.gaMeasurementId,inquiryRuntime:inquiry,ownerUnauthenticated:owner.status,malformedTelemetry:denied.status},null,2));
console.log('Canonical production routes, exact built assets, privacy rejection, owner protection and inquiry runtime verified.');
