import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import Stripe from 'stripe';
import {createWorker,hash,liveMerchantReady,processEvent,subscriptionAccess} from '../worker.mjs';
import {defaults} from '../public/estimator.mjs';
const schema=await readFile(new URL('../migrations/0001_quote_desk.sql',import.meta.url),'utf8');
// Real SQLite executes the exact migration and ownership queries. Provider calls are fixtures.
function database(){
  const sqlite=new DatabaseSync(':memory:');sqlite.exec(schema);
  function prepared(sql,values=[]){return {bind(...next){return prepared(sql,next);},async first(){return sqlite.prepare(sql).get(...values)||null;},async all(){return {results:sqlite.prepare(sql).all(...values)};},async run(){const r=sqlite.prepare(sql).run(...values);return {meta:{changes:Number(r.changes)}};}};}
  return {prepare:prepared,async batch(statements){sqlite.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}},sqlite};
}
const ts=()=>Math.floor(Date.now()/1000);
function sub(id='sub_a',customer='cus_a',extra={}){return {id,customer,livemode:false,status:'active',pause_collection:null,latest_invoice:{id:'in_a',status:'paid',amount_paid:1900},items:{data:[{quantity:1,current_period_end:ts()+86400,price:{id:'price_a',currency:'usd',unit_amount:1900,recurring:{interval:'month',interval_count:1}}}]},...extra};}
function fixture(){
  const env={QUOTE_DB:database(),QUOTE_SITE_ORIGIN:'http://localhost:8787',QUOTE_ENVIRONMENT:'test',QUOTE_CHECKOUT_ENABLED:'true',STRIPE_PRICE_ID:'price_a',STRIPE_ACCOUNT_ID:'acct_a',STRIPE_WEBHOOK_SECRET:'fixture-signing-secret',STRIPE_PORTAL_CONFIGURATION_ID:'bpc_a',QUOTE_RATE_SECRET:'a'.repeat(32),RESEND_API_KEY:'fixture-mail',QUOTE_MAIL_FROM:'Quote Desk <desk@example.invalid>'};
  const subscriptions=new Map([['sub_a',sub()],['sub_b',sub('sub_b','cus_b')]]);const calls=[];
  const signing=new Stripe('fixture-not-a-credential');
  const stripe={webhooks:signing.webhooks,prices:{async retrieve(){return {active:true,livemode:false,currency:'usd',unit_amount:1900,recurring:{interval:'month',interval_count:1}};}},accounts:{async retrieve(){return {id:'acct_a',charges_enabled:true,payouts_enabled:true};}},
    subscriptions:{async retrieve(id){calls.push(['retrieve',id]);if(!subscriptions.has(id))throw Error('not found');return subscriptions.get(id);},async list({customer}){return {data:[...subscriptions.values()].filter(s=>s.customer===customer),has_more:false};},async cancel(id){calls.push(['cancel',id]);const current=subscriptions.get(id);current.status='canceled';return current;}},
    customers:{async create(){calls.push(['customer']);return {id:'cus_new'};}},checkout:{sessions:{async create(input,options){calls.push(['checkout',input,options]);return {id:'cs_a',url:'https://checkout.stripe.com/c/pay/cs_a'};}}},
    billingPortal:{configurations:{async retrieve(){return {active:true,features:{subscription_cancel:{enabled:true,mode:'at_period_end'},payment_method_update:{enabled:true}}};}},sessions:{async create(input){calls.push(['portal',input]);return {url:'https://billing.stripe.com/p/session/test_a'};}}},
    charges:{async retrieve(){return {id:'ch_a',payment_intent:'pi_a',refunded:true};}},invoicePayments:{async list(){return {data:[{invoice:'in_a'}],has_more:false};}},invoices:{async retrieve(){return {parent:{subscription_details:{subscription:'sub_a'}}};}}
  };
  const worker=createWorker({stripeFactory:()=>stripe,fetch:async(url,options)=>{calls.push(['mail',url,JSON.parse(options.body)]);return new Response('{"id":"mail_fixture"}',{status:200});}});
  return {env,stripe,subscriptions,calls,worker};
}
async function user(f,id,email,customer){const token=id==='a'?'a'.repeat(64):'b'.repeat(64);await f.env.QUOTE_DB.prepare('INSERT INTO quote_accounts(id,email,stripe_customer_id,created_at) VALUES(?,?,?,?)').bind(id,email,customer,ts()).run();await f.env.QUOTE_DB.prepare('INSERT INTO quote_sessions(token_hash,account_id,expires_at) VALUES(?,?,?)').bind(await hash(token),id,ts()+86400).run();return token;}
function request(path,token,method='GET',input,origin='http://localhost:8787'){return new Request('http://localhost:8787/api/'+path,{method,headers:{origin,'content-type':'application/json',...(token?{cookie:'quote_local='+token}:{})},...(input===undefined?{}:{body:JSON.stringify(input)})});}
const event=(type,value,id=crypto.randomUUID())=>({id:'evt_'+id,type,livemode:false,api_version:'2026-08-26.dahlia',data:{object:value}});
test('paid ownership is isolated across two accounts; stale writes and cross-owner deletes fail',async()=>{
  const f=fixture();const a=await user(f,'a','a@example.invalid','cus_a'),b=await user(f,'b','b@example.invalid','cus_b');
  const save=await f.worker.fetch(request('records',a,'POST',{kind:'quote',name:'Job 101',input:defaults}),f.env);assert.equal(save.status,201);const record=await save.json();
  const other=await (await f.worker.fetch(request('records',b),f.env)).json();assert.equal(other.records.length,0);
  assert.equal((await f.worker.fetch(request('records/'+record.id,b,'DELETE',{revision:1}),f.env)).status,409);
  assert.equal((await f.worker.fetch(request('records/'+record.id,b,'PUT',{revision:1,name:'Wrong owner',input:defaults}),f.env)).status,409);
  assert.equal((await f.worker.fetch(request('records/'+record.id,a,'PUT',{revision:1,name:'Updated',input:defaults}),f.env)).status,200);
  assert.equal((await f.worker.fetch(request('records/'+record.id,a,'PUT',{revision:1,name:'Stale',input:defaults}),f.env)).status,409);f.env.QUOTE_DB.sqlite.close();
});
test('canonical failed renewal revokes saves; data export and deletion remain available',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid','cus_a');await f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Before renewal',input:defaults}),f.env);
  f.subscriptions.set('sub_a',sub('sub_a','cus_a',{status:'past_due',latest_invoice:{status:'open',amount_paid:0}}));
  await processEvent(f.env,f.stripe,event('invoice.payment_failed',{parent:{subscription_details:{subscription:'sub_a'}}}));
  assert.equal((await f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Unpaid',input:defaults}),f.env)).status,402);
  const list=await (await f.worker.fetch(request('records',token),f.env)).json();assert.equal(list.records.length,1);
  assert.equal((await f.worker.fetch(request('records/'+list.records[0].id,token,'DELETE',{revision:1}),f.env)).status,200);f.env.QUOTE_DB.sqlite.close();
});
test('billing outage preserves authenticated read/export access without granting paid saves',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid','cus_a');
  await f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Recoverable job',input:defaults}),f.env);
  f.stripe.subscriptions.list=async()=>{throw Error('provider unavailable');};
  const identity=await f.worker.fetch(request('me',token),f.env);
  assert.equal(identity.status,200);
  assert.deepEqual(await identity.json(),{email:'a@example.invalid',paid:null,billingStatus:'unavailable',hasBillingAccount:true});
  const records=await (await f.worker.fetch(request('records',token),f.env)).json();
  assert.equal(records.records[0].name,'Recoverable job');
  assert.equal((await f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Unverified save',input:defaults}),f.env)).status,503);
  assert.equal((await f.worker.fetch(request('records',undefined),f.env)).status,401);
  f.env.QUOTE_DB.sqlite.close();
});
test('checkout requires self-service payment method recovery before creating a customer or session',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid',null);
  f.stripe.billingPortal.configurations.retrieve=async()=>({active:true,features:{subscription_cancel:{enabled:true,mode:'at_period_end'},payment_method_update:{enabled:false}}});
  const response=await f.worker.fetch(request('checkout',token,'POST',{acceptTerms:true,attemptId:crypto.randomUUID()}),f.env);
  assert.equal(response.status,503);
  assert.match((await response.json()).error,/payment recovery/);
  assert.equal(f.calls.filter(call=>['customer','checkout'].includes(call[0])).length,0);
  f.env.QUOTE_DB.sqlite.close();
});
test('unpaid async checkout never grants access, then paid lifecycle grants it',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid','cus_a');f.subscriptions.set('sub_a',sub('sub_a','cus_a',{status:'incomplete',latest_invoice:{status:'open',amount_paid:0}}));
  await processEvent(f.env,f.stripe,event('checkout.session.completed',{id:'cs_unpaid',mode:'subscription',payment_status:'unpaid',subscription:'sub_a'}));
  assert.equal((await f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Unpaid',input:defaults}),f.env)).status,402);
  f.subscriptions.set('sub_a',sub());await processEvent(f.env,f.stripe,event('checkout.session.async_payment_succeeded',{id:'cs_unpaid',mode:'subscription',payment_status:'paid',subscription:'sub_a'}));
  assert.equal((await f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Paid',input:defaults}),f.env)).status,201);f.env.QUOTE_DB.sqlite.close();
});
test('out-of-order stale events use current provider state and replay once',async()=>{
  const f=fixture();await user(f,'a','a@example.invalid','cus_a');f.subscriptions.set('sub_a',sub('sub_a','cus_a',{status:'canceled'}));const stale=event('customer.subscription.updated',sub(),'replay');
  await processEvent(f.env,f.stripe,stale);await processEvent(f.env,f.stripe,stale);const row=await f.env.QUOTE_DB.prepare('SELECT * FROM quote_subscriptions WHERE id=?').bind('sub_a').first();assert.equal(row.status,'canceled');assert.equal(row.paid_through,0);assert.equal(f.calls.filter(c=>c[0]==='retrieve').length,1);f.env.QUOTE_DB.sqlite.close();
});
test('full refund resolves invoice object graph, revokes entitlement, and cancels renewal',async()=>{
  const f=fixture();const token=await user(f,'a','a@example.invalid','cus_a');await processEvent(f.env,f.stripe,event('charge.refunded',{id:'ch_a'}));
  const row=await f.env.QUOTE_DB.prepare('SELECT * FROM quote_subscriptions WHERE id=?').bind('sub_a').first();assert.equal(row.access_blocked,1);assert.equal(row.status,'canceled');assert.equal(f.calls.filter(c=>c[0]==='cancel').length,1);
  assert.equal((await f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Refunded',input:defaults}),f.env)).status,402);f.env.QUOTE_DB.sqlite.close();
});
test('genuine SDK signature accepted; forged, stale, wrong-mode and wrong-version events rejected',async()=>{
  const f=fixture();await user(f,'a','a@example.invalid','cus_a');const value=event('customer.subscription.updated',sub());const raw=JSON.stringify(value);
  const signature=Stripe.webhooks.generateTestHeaderString({payload:raw,secret:f.env.STRIPE_WEBHOOK_SECRET});
  const send=(header,payload=raw)=>f.worker.fetch(new Request('http://localhost:8787/api/webhook',{method:'POST',headers:{'stripe-signature':header},body:payload}),f.env);
  assert.equal((await send(signature)).status,200);assert.equal((await send('forged')).status,400);
  assert.equal((await send(Stripe.webhooks.generateTestHeaderString({payload:raw,secret:f.env.STRIPE_WEBHOOK_SECRET,timestamp:ts()-1000}))).status,400);
  for(const changed of [{livemode:true},{api_version:'old-version'}]){const modified=JSON.stringify({...value,...changed,id:'evt_changed'});assert.equal((await send(Stripe.webhooks.generateTestHeaderString({payload:modified,secret:f.env.STRIPE_WEBHOOK_SECRET}),modified)).status,400);}f.env.QUOTE_DB.sqlite.close();
});
test('checkout retries reuse stable price, expiration, tag and provider idempotency key',async()=>{
  const f=fixture();const token=await user(f,'a','a@example.invalid','cus_new');const id=crypto.randomUUID();let first=true;const attempts=[];
  f.stripe.checkout.sessions.create=async(input,options)=>{attempts.push({input,options});if(first){first=false;throw Error('provider response lost');}return {id:'cs_a',url:'https://checkout.stripe.com/c/pay/cs_a'};};
  assert.equal((await f.worker.fetch(request('checkout',token,'POST',{attemptId:id,acceptTerms:true}),f.env)).status,503);
  assert.equal((await f.worker.fetch(request('checkout',token,'POST',{attemptId:id,acceptTerms:true}),f.env)).status,200);
  assert.deepEqual(attempts[0],attempts[1]);assert(!('payment_method_types' in attempts[0].input));assert.equal(attempts[0].input.line_items[0].price,'price_a');assert.equal(attempts[0].input.mode,'subscription');
  await f.worker.fetch(request('checkout',token,'POST',{attemptId:id,acceptTerms:true}),f.env);assert.equal(attempts.length,2);f.env.QUOTE_DB.sqlite.close();
});
test('duplicate active subscription, wrong origin and disabled checkout cannot charge',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid','cus_a');const input={attemptId:crypto.randomUUID(),acceptTerms:true};
  assert.equal((await f.worker.fetch(request('checkout',token,'POST',input),f.env)).status,409);
  assert.equal((await f.worker.fetch(request('checkout',token,'POST',input,'https://attacker.invalid'),f.env)).status,403);
  f.env.QUOTE_CHECKOUT_ENABLED='false';assert.equal((await f.worker.fetch(request('checkout',token,'POST',input),f.env)).status,503);assert.equal(f.calls.filter(c=>c[0]==='checkout').length,0);f.env.QUOTE_DB.sqlite.close();
});
test('simultaneous checkout keys share one open session instead of creating duplicate subscriptions',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid','cus_new');
  let release,started;const entered=new Promise(resolve=>{started=resolve;});const wait=new Promise(resolve=>{release=resolve;});const create=f.stripe.checkout.sessions.create;
  f.stripe.checkout.sessions.create=async(...args)=>{started();await wait;return create(...args);};
  const first=f.worker.fetch(request('checkout',token,'POST',{attemptId:crypto.randomUUID(),acceptTerms:true}),f.env);await entered;
  const inFlight=await f.worker.fetch(request('checkout',token,'POST',{attemptId:crypto.randomUUID(),acceptTerms:true}),f.env);assert.equal(inFlight.status,409);release();
  const completed=await first;assert.equal(completed.status,200);
  const subsequent=await f.worker.fetch(request('checkout',token,'POST',{attemptId:crypto.randomUUID(),acceptTerms:true}),f.env);
  assert.equal(subsequent.status,200);assert.deepEqual(await subsequent.json(),await completed.json());assert.equal(f.calls.filter(c=>c[0]==='checkout').length,1);f.env.QUOTE_DB.sqlite.close();
});
test('account deletion expires open checkout sessions before removing ownership',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid','cus_new');await f.worker.fetch(request('checkout',token,'POST',{attemptId:crypto.randomUUID(),acceptTerms:true}),f.env);
  f.stripe.checkout.sessions.retrieve=async()=>({id:'cs_a',status:'open'});f.stripe.checkout.sessions.expire=async id=>{f.calls.push(['expire',id]);return {id,status:'expired'};};
  assert.equal((await f.worker.fetch(request('account',token,'DELETE',{confirmEmail:'a@example.invalid'}),f.env)).status,200);assert.equal(f.calls.find(c=>c[0]==='expire')[1],'cs_a');assert.equal(await f.env.QUOTE_DB.prepare('SELECT id FROM quote_accounts WHERE id=?').bind('a').first(),null);f.env.QUOTE_DB.sqlite.close();
});
test('live account without charges or payouts fails before any checkout',async()=>{
  const f=fixture();f.env.QUOTE_ENVIRONMENT='live';const token=await user(f,'a','a@example.invalid','cus_new');f.stripe.accounts.retrieve=async()=>({id:'acct_a',charges_enabled:false,payouts_enabled:false});f.stripe.prices.retrieve=async()=>({active:true,livemode:true,currency:'usd',unit_amount:1900,recurring:{interval:'month',interval_count:1}});
  const requestLive=new Request('https://desk.example.invalid/api/checkout',{method:'POST',headers:{origin:'https://desk.example.invalid','content-type':'application/json',cookie:'__Host-quote_session='+token},body:JSON.stringify({attemptId:crypto.randomUUID(),acceptTerms:true})});f.env.QUOTE_SITE_ORIGIN='https://desk.example.invalid';
  assert.equal((await f.worker.fetch(requestLive,f.env)).status,503);assert.equal(f.calls.filter(c=>c[0]==='checkout').length,0);f.env.QUOTE_DB.sqlite.close();
});
test('live checkout requires submitted identity, clear requirements and a usable payout bank',async()=>{
  const ready={id:'acct_a',details_submitted:true,charges_enabled:true,payouts_enabled:true,requirements:{disabled_reason:null,currently_due:[],past_due:[],pending_verification:[]},external_accounts:{data:[{id:'ba_a',object:'bank_account',status:'verified'}]}};
  assert.equal(liveMerchantReady(ready),true);
  for(const changed of [
    {details_submitted:false},
    {requirements:{...ready.requirements,disabled_reason:'requirements.pending_verification'}},
    {requirements:{...ready.requirements,pending_verification:['company.tax_id']}},
    {external_accounts:{data:[]}},
    {external_accounts:{data:[{id:'ba_a',object:'bank_account',status:'errored'}]}},
    {external_accounts:{data:[{id:'ba_a',object:'bank_account',status:'verification_failed'}]}},
    {external_accounts:{data:[{id:'ba_a',object:'bank_account',status:'tokenized_account_number_deactivated'}]}},
    {external_accounts:{data:[{id:'ba_a',object:'bank_account',status:'unexpected_status'}]}},
  ])assert.equal(liveMerchantReady({...ready,...changed}),false);
  const f=fixture();f.env.QUOTE_ENVIRONMENT='live';const token=await user(f,'a','a@example.invalid','cus_new');f.stripe.prices.retrieve=async()=>({active:true,livemode:true,currency:'usd',unit_amount:1900,recurring:{interval:'month',interval_count:1}});
  const attempts=[];f.stripe.accounts.retrieve=async(...args)=>{attempts.push(args);return {...ready,details_submitted:false};};
  const requestLive=new Request('https://desk.example.invalid/api/checkout',{method:'POST',headers:{origin:'https://desk.example.invalid','content-type':'application/json',cookie:'__Host-quote_session='+token},body:JSON.stringify({attemptId:crypto.randomUUID(),acceptTerms:true})});f.env.QUOTE_SITE_ORIGIN='https://desk.example.invalid';
  assert.equal((await f.worker.fetch(requestLive,f.env)).status,503);assert.deepEqual(attempts,[[null,{expand:['external_accounts']}]]);assert.equal(f.calls.filter(c=>c[0]==='checkout').length,0);f.env.QUOTE_DB.sqlite.close();
});
test('magic link is hashed, one-use, expires, and creates an HttpOnly account session',async()=>{
  const f=fixture();const res=await f.worker.fetch(request('login',null,'POST',{email:'First@Example.invalid'}),f.env);assert.equal(res.status,200);
  const mail=f.calls.find(c=>c[0]==='mail');const token=mail[2].text.match(/#login=([a-f0-9]{64})/)[1];const row=await f.env.QUOTE_DB.prepare('SELECT * FROM quote_login_links').first();assert.notEqual(row.token_hash,token);
  const first=await f.worker.fetch(request('login/verify',null,'POST',{token}),f.env);assert.equal(first.status,200);assert.match(first.headers.get('set-cookie'),/HttpOnly/);assert.equal((await first.json()).email,'first@example.invalid');
  assert.equal((await f.worker.fetch(request('login/verify',null,'POST',{token}),f.env)).status,400);
  const expired='c'.repeat(64);await f.env.QUOTE_DB.prepare('INSERT INTO quote_login_links(token_hash,email,expires_at) VALUES(?,?,?)').bind(await hash(expired),'expired@example.invalid',ts()-1).run();assert.equal((await f.worker.fetch(request('login/verify',null,'POST',{token:expired}),f.env)).status,400);f.env.QUOTE_DB.sqlite.close();
});
test('atomic record cap rejects the next save without deleting existing data',async()=>{
  const f=fixture();f.env.QUOTE_MAX_RECORDS='1';const token=await user(f,'a','a@example.invalid','cus_a');
  const values=await Promise.all([f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'First',input:defaults}),f.env),f.worker.fetch(request('records',token,'POST',{kind:'quote',name:'Second',input:defaults}),f.env)]);assert.deepEqual(values.map(x=>x.status).sort(),[201,409]);assert.equal((await f.env.QUOTE_DB.prepare('SELECT COUNT(*) AS n FROM quote_records').first()).n,1);f.env.QUOTE_DB.sqlite.close();
});
test('account deletion stops future product billing and removes only that owner',async()=>{
  const f=fixture(),a=await user(f,'a','a@example.invalid','cus_a'),b=await user(f,'b','b@example.invalid','cus_b');await f.worker.fetch(request('records',a,'POST',{kind:'quote',name:'Delete me',input:defaults}),f.env);await f.worker.fetch(request('records',b,'POST',{kind:'quote',name:'Keep me',input:defaults}),f.env);
  assert.equal((await f.worker.fetch(request('account',a,'DELETE',{confirmEmail:'wrong@example.invalid'}),f.env)).status,400);
  assert.equal((await f.worker.fetch(request('account',a,'DELETE',{confirmEmail:'a@example.invalid'}),f.env)).status,200);assert.equal(f.subscriptions.get('sub_a').status,'canceled');assert.equal(f.subscriptions.get('sub_b').status,'active');assert.equal((await f.worker.fetch(request('me',a),f.env)).status,401);assert.equal((await (await f.worker.fetch(request('records',b),f.env)).json()).records.length,1);f.env.QUOTE_DB.sqlite.close();
});
test('mismatched price, expired paid period, free invoice and paused collection cannot grant access',()=>{
  const f=fixture();for(const invalid of [sub('sub_a','cus_a',{pause_collection:{behavior:'void'}}),sub('sub_a','cus_a',{latest_invoice:{status:'paid',amount_paid:0}}),sub('sub_a','cus_a',{items:{data:[{quantity:1,current_period_end:ts()-1,price:{id:'price_a'}}]}})])assert.equal(subscriptionAccess(invalid,f.env),false);assert.equal(subscriptionAccess(sub(),{...f.env,STRIPE_PRICE_ID:'price_other'}),false);f.env.QUOTE_DB.sqlite.close();
});
test('late subscription after deletion is canceled using the retained customer boundary',async()=>{
  const f=fixture(),token=await user(f,'a','a@example.invalid','cus_a');await f.worker.fetch(request('account',token,'DELETE',{confirmEmail:'a@example.invalid'}),f.env);
  f.subscriptions.set('sub_late',sub('sub_late','cus_a'));await processEvent(f.env,f.stripe,event('customer.subscription.created',sub('sub_late','cus_a')));
  assert.equal(f.subscriptions.get('sub_late').status,'canceled');assert.equal(await f.env.QUOTE_DB.prepare('SELECT id FROM quote_accounts WHERE id=?').bind('a').first(),null);f.env.QUOTE_DB.sqlite.close();
});
