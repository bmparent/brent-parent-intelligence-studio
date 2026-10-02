import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {onRequestPost as webhook} from '../functions/api/stripe/webhook';
import {readFileSync} from 'node:fs';
import {fixture} from './playground-test-fixture';
import {getSnapshotStore} from '../functions/_shared/snapshot/storage';
import {generateSnapshot,drainSnapshotJobs} from '../functions/_shared/snapshot/generation';
import {onRequestGet as status} from '../functions/api/snapshot/status';
import type {SnapshotEnv,SnapshotRecord} from '../functions/_shared/snapshot/types';
const opportunity={title:'Clarify navigation',whyItMatters:'Helps visitors',suggestedFix:'Use clear labels',priority:'high'};
const report={overallImpression:'A useful starting point',businessTypeGuess:'Services',primaryConversionGoal:'Enquiries',uiUxOpportunities:Array(3).fill(opportunity),seoOpportunities:Array(3).fill(opportunity),suggestedHomepageStructure:Array(5).fill({section:'Introduction',purpose:'Explain the offer',sampleCopy:'Example service'}),suggestedTitleTag:'Example services',suggestedMetaDescription:'Example services for your team',aiSearchReadiness:Array(2).fill({title:'Structure',recommendation:'Use headings'}),nextStepRecommendation:{label:'Review',reason:'Confirm scope',cta:'Contact'},imagePrompt:'A fictional clean website'};
function setup(){
 const {sql,env:platform}=fixture();sql.exec(readFileSync('snapshot-migrations/0001_durable_jobs.sql','utf8'));
 const objects=new Map<string,Uint8Array>();
 const env:SnapshotEnv={SNAPSHOT_DB:platform.EIDOS_DB,SNAPSHOT_OBJECTS:{put:async(k,v)=>{objects.set(k,v)},get:async(k)=>objects.has(k)?{arrayBuffer:async()=>new Uint8Array(objects.get(k)!).buffer}:null,delete:async(k)=>{objects.delete(k)}},SNAPSHOT_GENERATION_ENABLED:'true',SNAPSHOT_CAPTURE_APPROVED:'true',SNAPSHOT_CAPTURE_PROXY_URL:'https://capture.example.test/api/works/snapshot-capture',SNAPSHOT_CAPTURE_PROXY_TOKEN:'fixture-not-a-secret',SNAPSHOT_DAILY_ALLOWANCE_CENTS:'100',SNAPSHOT_MAX_JOB_COST_CENTS:'100',OPENAI_TEXT_MODEL:'test-text',OPENAI_IMAGE_MODEL:'test-image',OPENAI_API_KEY:'fixture-not-a-key'};
 const store=getSnapshotStore(env,new Request('http://localhost'))!;
 const record:SnapshotRecord={version:1,requestId:'snap_'+ 'a'.repeat(32),resultToken:'b'.repeat(43),status:'created',intake:{websiteUrl:'https://example.com',businessName:'Fictional',industry:'Services',primaryGoal:'more leads',stylePreference:'clean premium',biggestIssue:'Navigation',email:'nobody@example.test',consent:true},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 return {sql,env,store,record,objects};
}
test('paid state and queue persist together; status is read-only; concurrent workers make one bounded attempt',async()=>{
 const {sql,env,store,record,objects}=setup();await store.create(record);await store.save({...record,status:'paid'});await store.save({...record,status:'paid'});
 assert.equal(sql.prepare('SELECT count(*) n FROM snapshot_jobs').get()!.n,1);
 const original=fetch;let calls=0;
 globalThis.fetch=async(url)=>{if(String(url).includes('/v1/responses')){calls++;return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(report)}]}]})}if(String(url).includes('/v1/images')){calls++;return Response.json({data:[{b64_json:'/9j/'+Buffer.alloc(900_000).toString('base64')}]})}throw Error('capture unavailable in controlled test')};
 try{
  const result=await status({env,request:new Request('http://localhost/api/snapshot/status?token='+record.resultToken),waitUntil:()=>{}});assert.equal((await result.json()).status,'paid');assert.equal(calls,0);
  await Promise.all([generateSnapshot(record.requestId,store,env),generateSnapshot(record.requestId,store,env)]);
  assert.equal(calls,2);assert.equal((await store.getByRequestId(record.requestId))!.status,'complete');assert.equal(objects.size,1);
  assert.equal(sql.prepare('SELECT reserved FROM snapshot_budget').get()!.reserved,100);
  await drainSnapshotJobs(env);assert.equal(calls,2);
 }finally{globalThis.fetch=original}
});
test('image failure is partial; allowance blocks another job; revoked records cannot be resurrected',async()=>{
 const {sql,env,store,record}=setup();await store.create(record);await store.save({...record,status:'paid'});
 const original=fetch;let calls=0;globalThis.fetch=async(url)=>{if(String(url).includes('/v1/responses')){calls++;return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(report)}]}]})}throw Error('controlled interruption')};
 try{
  await generateSnapshot(record.requestId,store,env);assert.equal((await store.getByRequestId(record.requestId))!.status,'partial');assert.ok((await store.getByRequestId(record.requestId))!.report);
  const second={...record,requestId:'snap_'+'c'.repeat(32),resultToken:'d'.repeat(43)};await store.create(second);await store.save({...second,status:'paid'});await generateSnapshot(second.requestId,store,env);assert.equal(calls,1);assert.equal(sql.prepare('SELECT state FROM snapshot_jobs WHERE order_id=?').get(second.requestId)!.state,'queued');
  sql.prepare("UPDATE snapshot_orders SET status='refunded' WHERE id=?").run(second.requestId);await store.save({...second,status:'paid'});assert.equal((await store.getByRequestId(second.requestId))!.status,'refunded');
 }finally{globalThis.fetch=original}
});
test('interrupted claim is review-only and never repeats a provider attempt',async()=>{
 const {sql,env,store,record}=setup();await store.create(record);await store.save({...record,status:'paid'});sql.prepare("UPDATE snapshot_jobs SET state='running',updated=1").run();
 await drainSnapshotJobs(env);assert.equal(sql.prepare('SELECT state FROM snapshot_jobs').get()!.state,'review');assert.equal((await store.getByRequestId(record.requestId))!.status,'failed');
});

test('signed webhook rejects tampering, refunds before payment, and mismatched amounts without queuing',async()=>{
 const {sql,env,store,record}=setup(); env.STRIPE_WEBHOOK_SECRET='fixture-signing-key'; await store.create(record);
 const send=async(type:string,object:unknown,id:string,tamper=false)=>{
  const raw=JSON.stringify({id,type,data:{object}}), stamp=Math.floor(Date.now()/1000);
  const signature=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET!).update(stamp+'.'+raw).digest('hex');
  return webhook({env,request:new Request('http://localhost/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${stamp},v1=${tamper?'bad':signature}`},body:raw}),waitUntil:()=>{}});
 };
 const paid={id:'cs_fixture',mode:'payment',currency:'usd',amount_total:500,payment_status:'paid',payment_intent:'pi_fixture',metadata:{snapshot_request_id:record.requestId,snapshot_result_token:record.resultToken}};
 assert.equal((await send('checkout.session.completed',paid,'evt_bad',true)).status,400);
 assert.equal((await send('charge.refunded',{payment_intent:'pi_fixture'},'evt_refund')).status,200);
 assert.equal((await send('charge.refunded',{payment_intent:'pi_fixture'},'evt_refund')).status,200);
 assert.equal((await send('checkout.session.completed',paid,'evt_paid')).status,200);
 assert.equal((await store.getByRequestId(record.requestId))!.status,'refunded');
 assert.equal(sql.prepare('SELECT count(*) n FROM snapshot_jobs').get()!.n,0);
 const second={...record,requestId:'snap_'+'e'.repeat(32),resultToken:'f'.repeat(43)};await store.create(second);
 await send('checkout.session.completed',{...paid,id:'cs_second',amount_total:1,payment_intent:'pi_second',metadata:{snapshot_request_id:second.requestId,snapshot_result_token:second.resultToken}},'evt_wrong_amount');
 assert.equal((await store.getByRequestId(second.requestId))!.status,'failed');
 assert.equal(sql.prepare('SELECT count(*) n FROM snapshot_jobs').get()!.n,0);
});

test('interrupted image work retains the finished written report without retrying providers', async () => {
 const {sql,env,store,record}=setup();
 try {
  await store.create(record);
  await store.save({...record,status:'paid'});
  await store.save({...record,status:'processing',report:report as SnapshotRecord['report']});
  sql.prepare("UPDATE snapshot_jobs SET state='running',updated=1").run();
  await drainSnapshotJobs(env);
  assert.equal(sql.prepare('SELECT state FROM snapshot_jobs').get()!.state,'review');
  assert.equal((await store.getByRequestId(record.requestId))!.status,'partial');
  const response=await status({env,request:new Request('http://localhost/api/snapshot/status?token='+record.resultToken),waitUntil:()=>{}});
  const result=await response.json();
  assert.equal(result.status,'partial');
  assert.equal(result.report.overallImpression,report.overallImpression);
  assert.equal(sql.prepare('SELECT count(*) n FROM snapshot_stages').get()!.n,0);
 } finally { sql.close(); }
});
