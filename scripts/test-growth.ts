import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { growthEndpoint, confirmedInquiry, classifyTraffic } from '../functions/_shared/growth';
import { onRequestGet as report } from '../functions/api/growth/report';
import { onRequestPost as inquiry } from '../functions/api/project-inquiries';
import { publicPath, safeReferral, campaignToken, emptyAttribution, validateContext } from '../src/lib/growthContract';
import { growthPageView, growthTrack, clearGrowth, growthContext, inquiryAttribution } from '../src/lib/growth';
import { reportSql, summarize } from './growth-report.mjs';
import type { Statement, Database } from '../functions/_shared/platform/core';

class SqlStatement implements Statement {
  constructor(private db: DatabaseSync, private sql: string, private values: unknown[] = []) {}
  bind(...values: unknown[]) { return new SqlStatement(this.db,this.sql,values); }
  async first<T>() { return (this.db.prepare(this.sql).get(...this.values as never[]) || null) as T | null; }
  async all<T>() { return { results: this.db.prepare(this.sql).all(...this.values as never[]) as T[] }; }
  async run() { return { meta: { changes: Number(this.db.prepare(this.sql).run(...this.values as never[]).changes) } }; }
}
function setup() {
  const sql=new DatabaseSync(':memory:');sql.exec(readFileSync('migrations/growth/0001_growth.sql','utf8'));
  const db: Database={prepare:q=>new SqlStatement(sql,q),batch:async statements=>{sql.exec('BEGIN');try {const rows=await Promise.all(statements.map(s=>s.run()));sql.exec('COMMIT');return rows;}catch(e){sql.exec('ROLLBACK');throw e;}}};
  return {sql,env:{EIDOS_GROWTH_DB:db,EIDOS_PLATFORM_TOKEN:'test-only-not-production-secret'.repeat(2),EIDOS_GROWTH_OWNER_TOKEN:'owner-test-secret'.repeat(3)}};
}
const context=()=>({consent:true as const,session:crypto.randomUUID(),qa:false,attribution:{...emptyAttribution,utmSource:'linkedin',utmMedium:'organic_social',utmCampaign:'phase1_friction_review',landingPage:'/central-florida'}});
const event=(extra={})=>({event:'page_view',id:crypto.randomUUID(),path:'/central-florida',...context(),...extra});
function request(input: unknown, host='eidos-works.com', headers={}) { return new Request(`https://${host}/api/growth/events`,{method:'POST',headers:{origin:`https://${host}`,'content-type':'application/json',...headers},body:JSON.stringify(input)}); }

test('strict public paths exclude private, unknown, encoded, query and receipt paths',()=>{
  for(const p of ['/snapshot/result/secret','/account','/community/moderate','/members/name','/owner/growth','/unknown','/friction-review?email=secret','/work/%2e%2e/account'])assert.equal(publicPath(p),null);
  assert.equal(publicPath('/friction-review/'),'/friction-review');
});
test('campaign/referrer sanitization removes queries, fragments, credentials and unsafe path data',()=>{
  for(const x of ['name@example.com','hello\r\nBcc: x','https://secret','a'.repeat(65)])assert.equal(campaignToken(x),'');
  assert.equal(safeReferral('https://www.linkedin.com/feed/?email=private#secret'),'https://www.linkedin.com/feed/');
  assert.equal(safeReferral('https://example.com/customer/secret?token=x'),'https://example.com/');
  assert.equal(safeReferral('https://eidos-works.com/account/verify?token=x'),'https://eidos-works.com/');
  for(const x of ['javascript:alert(1)','https://user:pass@example.com/','http://127.0.0.1/private'])assert.equal(safeReferral(x),'');
});
test('unknown events/fields, denied consent, malformed contexts and oversized requests are rejected',async()=>{
  const {env,sql}=setup();
  for(const input of [event({event:'friction_submit'}),event({event:'purchase'}),event({email:'private@example.com'}),event({consent:false}),event({path:'/account'}),event({attribution:{...emptyAttribution,utmSource:'person@example.com'}})])assert.equal((await growthEndpoint({request:request(input),env})).status,400);
  assert.equal((await growthEndpoint({request:request(event(),'eidos-works.com',{origin:'https://attacker.example'}),env})).status,403);
  assert.equal((await growthEndpoint({request:request(event({extra:'x'.repeat(3000)})),env})).status,413);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM growth_events').get()?.n,0);
});
test('public/production QA/preview QA/automation/bot classification is explicit and bounded',()=>{
  assert.equal(classifyTraffic(request({}),false),'public');
  assert.equal(classifyTraffic(request({}),true),'production_qa');
  assert.equal(classifyTraffic(request({},'eidosworks.pages.dev'),false),'preview_qa');
  assert.equal(classifyTraffic(request({},'eidos-works.com',{'user-agent':'UnusualBrowser/1'}),false),'public');
  assert.equal(classifyTraffic(request({},'eidos-works.com',{'x-eidos-qa':'automation'}),false),'automation');
  assert.equal(classifyTraffic(request({},'eidos-works.com',{'user-agent':'Googlebot'}),false),'bot');
});
test('sessions hash IDs, deduplicate events and retain only approved values',async()=>{
  const {env,sql}=setup(),c=context();
  for(const name of ['session_start','landing_page','friction_form_start']) for(let i=0;i<2;i++)assert.equal((await growthEndpoint({request:request(event({...c,event:name})),env})).status,200);
  const e=event(c);for(let i=0;i<2;i++)await growthEndpoint({request:request(e),env});
  const rows=sql.prepare('SELECT * FROM growth_events').all();assert.equal(rows.length,4);assert.ok(!JSON.stringify(rows).includes(c.session));assert.match(String(rows[0].session_hash),/^[a-f0-9]{64}$/);
});
test('rate limit returns 429 without accepting an additional event',async()=>{
  const {env,sql}=setup(),c=context();let response;
  for(let i=0;i<91;i++)response=await growthEndpoint({request:request(event(c)),env});
  assert.equal(response?.status,429);assert.equal(sql.prepare('SELECT COUNT(*) n FROM growth_events').get()?.n,90);
});
test('owner report rejects unauthenticated calls and never exposes session identities',async()=>{
  const {env}=setup();await growthEndpoint({request:request(event()),env});
  assert.equal((await report({request:new Request('https://eidos-works.com/api/growth/report'),env})).status,401);
  const r=await report({request:new Request('https://eidos-works.com/api/growth/report?days=7',{headers:{authorization:'Bearer '+env.EIDOS_GROWTH_OWNER_TOKEN}}),env});assert.equal(r.status,200);assert.ok(!(await r.text()).includes('session_hash'));
});
test('inquiry records only provider-confirmed submissions; QA never inflates public report',async()=>{
  const {env,sql}=setup();const c=context();
  await growthEndpoint({request:request(event(c)),env});
  let brief='';const mailer={fetch:(async(_url:unknown,init:RequestInit)=>{brief=JSON.parse(String(init.body)).brief;return Response.json({ok:true,receipt:'test-provider-receipt'});}) as typeof fetch};
  const input={projectType:'Friction Review',inquiryKind:'friction-review',name:'Eidos Works QA',email:'qa@example.com',problem:'Eidos Works QA only: this is a synthetic local provider proof.',...c.attribution,growth:{...c,qa:true}};
  const result=await inquiry({request:request(input),env:{...env,EIDOS_INQUIRY_MAILER:mailer}});
  assert.equal((await result.json()).measurementRecorded,true);assert.match(brief,/utm_source: linkedin/);assert.match(brief,/Landing page: \/central-florida/);assert.match(brief,/not a customer lead/);
  assert.equal(sql.prepare("SELECT COUNT(*) n FROM growth_events WHERE event='friction_submit' AND traffic='public'").get()?.n,0);
  assert.equal(sql.prepare("SELECT COUNT(*) n FROM growth_events WHERE event='friction_submit' AND traffic='production_qa'").get()?.n,1);
  mailer.fetch=async()=>Response.json({ok:false});await inquiry({request:request({...input,growth:c}),env:{...env,EIDOS_INQUIRY_MAILER:mailer}});
  assert.equal(sql.prepare("SELECT COUNT(*) n FROM growth_events WHERE event='friction_submit'").get()?.n,1);
  assert.equal(await confirmedInquiry(request({}),env,undefined,true,false,'x'),false);
});
test('retention deletes expired sessions, source funnel reports match real SQL and zero denominator is NA',async()=>{
  const {env,sql}=setup(),c=context();
  for(const e of ['page_view','friction_form_start'])await growthEndpoint({request:request(event({...c,event:e,path:'/friction-review'})),env});
  await confirmedInquiry(request({}),env,c,true,false,'one');
  const rows=sql.prepare(reportSql(7,'public')).all();const r=summarize(rows,[],7,'public');assert.equal(r.totals.sessions,1);assert.equal(r.conversionPercent.startToSubmit,100);assert.equal(r.sources[0].source,'linkedin');assert.equal(summarize([],[],7,'public').conversionPercent.visitToReview,null);
  sql.exec("UPDATE growth_events SET day=date('now','-61 days')");await growthEndpoint({request:request(event()),env});assert.equal(sql.prepare("SELECT COUNT(*) n FROM growth_events WHERE day<date('now','-60 days')").get()?.n,0);
});
test('browser consent, navigation attribution, query stripping, event allowlist and revocation',()=>{
  const root=globalThis as unknown as Record<string,unknown>;const previous=Object.fromEntries(['window','document','localStorage','sessionStorage','fetch'].map(k=>[k,root[k]]));let choice:string|null=null;const saved=new Map();const sent:Record<string,unknown>[]=[];
  root.localStorage={getItem:()=>choice};root.sessionStorage={getItem:(k:string)=>saved.get(k)||null,setItem:(k:string,v:string)=>saved.set(k,v),removeItem:(k:string)=>saved.delete(k)};
  root.window={location:{pathname:'/central-florida',search:'?utm_source=linkedin&utm_medium=organic_social&utm_campaign=phase1_friction_review&email=private@example.com'}};root.document={referrer:'https://www.linkedin.com/feed/?secret=1'};
  root.fetch=async(_url:string,init:RequestInit)=>{sent.push(JSON.parse(String(init.body)));return Response.json({accepted:true});};
  try {clearGrowth();growthPageView();assert.equal(sent.length,0);assert.equal(saved.size,0);choice='denied';growthTrack('friction_cta_click');assert.equal(saved.size,0);choice='granted';growthPageView();assert.equal(sent.length,3);const id=growthContext()?.session;assert.ok(id);(root.window as {location:unknown}).location={pathname:'/friction-review',search:''};growthPageView();growthTrack('friction_cta_click');growthTrack('unapproved');assert.equal(growthContext()?.session,id);assert.equal(inquiryAttribution().landingPage,'/central-florida');assert.ok(!JSON.stringify(sent).includes('private@example.com'));assert.ok(!JSON.stringify(sent).includes('secret'));choice='denied';clearGrowth();growthPageView();assert.equal(saved.size,0);assert.equal(growthContext(),undefined);}
  finally{clearGrowth();for(const [k,v]of Object.entries(previous))root[k]=v;}
});
test('context cannot smuggle extra client properties',()=>assert.throws(()=>validateContext({...context(),name:'private'})));


test('maximum inquiry text cannot truncate attribution, and header injection never reaches attribution',async()=>{
  const {env}=setup();let brief='';const mailer={fetch:(async(_url:unknown,init:RequestInit)=>{brief=JSON.parse(String(init.body)).brief;return Response.json({ok:true,receipt:'synthetic-local-maximum'});}) as typeof fetch};
  await inquiry({request:request({projectType:'Friction Review',name:'Eidos Works QA',email:'qa@example.com',problem:'p'.repeat(1600),desiredOutcome:'d'.repeat(1200),supportingUrl:'https://example.com/'+ 'x'.repeat(450),company:'c'.repeat(180),utmSource:'linkedin',utmCampaign:'phase1_friction_review',landingPage:'/central-florida',referrer:'https://example.com/private?email=secret'}),env:{...env,EIDOS_INQUIRY_MAILER:mailer}});
  assert.match(brief,/Landing page: \/central-florida/);assert.match(brief,/utm_campaign: phase1_friction_review/);assert.ok(!brief.includes('email=secret'));assert.ok(brief.length<=4900);
});
