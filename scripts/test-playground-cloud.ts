import {fixture,ctx,signup} from './playground-test-fixture';
import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet as get, onRequestPost as save } from '../functions/api/playground/projects';
import { onRequestPost as checkout } from '../functions/api/playground/checkout';
import { onRequestPost as download } from '../functions/api/playground/purchases';
import { onRequestPost as webhook } from '../functions/api/playground/webhook';
import { createProject, upgradeProject, newBlock } from '../src/playground/model';
import { createHmac } from 'node:crypto';
import { selectStudio } from '../src/playground/studioProject';

test('Cloud revisions preserve images, enforce ownership, and reject stale writes', async () => {
  const {env,sql}=fixture(), alice=await signup(env,'alice'), bob=await signup(env,'bobby');
  const document=createProject(); document.sections[1].image='data:image/png;base64,iVBORw0KGgo=';
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,expectedOwner:'another-account'},alice.headers))).status,409);
  const first=await save(ctx(env,'/api/playground/projects',{document},alice.headers));
  assert.equal(first.status,200,await first.clone().text());
  const saved=await first.json();
  const reopened=await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,alice.headers));
  assert.deepEqual((await reopened.json()).document,document);
  assert.equal((await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,bob.headers))).status,404);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},bob.headers))).status,404);
  document.name='Second';
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,200);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,409);
  const historical=await get(ctx(env,'/api/playground/projects?id='+saved.id+'&revision='+saved.revision,undefined,alice.headers));
  assert.notEqual((await historical.json()).document.name,'Second');
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_assets').get()?.n,1);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document},alice.headers))).status,200);
  assert.equal((await get(ctx(env,'/api/playground/projects',undefined,alice.headers))).status,200);
  assert.equal((await get(ctx(env,'/api/playground/projects'))).status,401);
  sql.close();
});

test('Frozen checkout is idempotent and entitlement requires signed matching payment', async () => {
  const {env,sql}=fixture(), alice=await signup(env,'alice'), bob=await signup(env,'bobby');
  env.EIDOS_PLAYGROUND_STRIPE_KEY='sk_test_fixture'; env.EIDOS_PLAYGROUND_WEBHOOK_SECRET='whsec_fixture'; env.EIDOS_PLAYGROUND_TEST_PRICE_CENTS='100';
  const document=createProject(), saved=await (await save(ctx(env,'/api/playground/projects',{document},alice.headers))).json();
  const input={projectId:saved.id,revisionId:saved.revision,requestId:crypto.randomUUID()};
  const originalFetch=globalThis.fetch; let calls=0;
  globalThis.fetch=async (_url,init) => {calls++; assert.ok(new Headers(init?.headers).get('idempotency-key'));return new Response(JSON.stringify({id:'cs_test_fixture',url:'https://checkout.stripe.com/c/pay/cs_test_fixture',livemode:false}));};
  try {
    const response=await checkout(ctx(env,'/api/playground/checkout',input,alice.headers));
    assert.equal(response.status,200,await response.clone().text());
    const orderId=(await response.json()).orderId;
    await checkout(ctx(env,'/api/playground/checkout',input,alice.headers)); assert.equal(calls,1);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,403);
    const frozen=sql.prepare('SELECT archive FROM eidos_pg_orders WHERE id=?').get(orderId)?.archive;
    document.name='Edited after checkout'; await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers));
    const object={id:'cs_test_fixture',livemode:false,mode:'payment',currency:'usd',amount_total:100,client_reference_id:orderId,metadata:{eidos_product:'playground-v1',eidos_order_id:orderId},payment_intent:'pi_fixture',payment_status:'unpaid'};
    async function event(id:string,type:string,payload:Record<string,unknown>,valid=true) {
      const raw=JSON.stringify({id,type,livemode:false,data:{object:payload}}), timestamp=Math.floor(Date.now()/1000);
      const signature=createHmac('sha256',valid?'whsec_fixture':'wrong').update(timestamp+'.'+raw).digest('hex');
      return webhook({env,request:new Request('http://localhost:8788/api/playground/webhook',{method:'POST',headers:{'stripe-signature':`t=${timestamp},v1=${signature}`},body:raw})});
    }
    assert.equal((await event('evt_bad','checkout.session.completed',object,false)).status,400);
    assert.equal((await event('evt_delay','checkout.session.completed',object)).status,200);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,403);
    object.payment_status='paid';
    assert.equal((await event('evt_wrong','checkout.session.async_payment_succeeded',{...object,amount_total:1})).status,400);
    assert.equal((await event('evt_paid','checkout.session.async_payment_succeeded',object)).status,200);
    assert.equal((await event('evt_paid','checkout.session.async_payment_succeeded',object)).status,200);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},bob.headers))).status,403);
    const delivered=await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers)); assert.equal(delivered.status,200);
    assert.equal(Buffer.from(await delivered.arrayBuffer()).toString('base64'),frozen);
    await event('evt_expired','checkout.session.expired',object);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,200);
    await event('evt_refund','charge.refunded',{payment_intent:'pi_fixture'});
    await event('evt_late','checkout.session.async_payment_succeeded',object);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,403);
    env.EIDOS_PLAYGROUND_STRIPE_KEY='sk_live_forbidden';
    assert.equal((await checkout(ctx(env,'/api/playground/checkout',input,alice.headers))).status,503);
  } finally {globalThis.fetch=originalFetch;sql.close();}
});
test('image decoder availability and atomic owner storage quota preserve saved state',async()=>{
 const {env,sql}=fixture(),alice=await signup(env,'image_owner');const document=createProject();
 const first=await save(ctx(env,'/api/playground/projects',{document},alice.headers));assert.equal(first.status,200);
 const saved=await first.json();document.sections[1].image='data:image/png;base64,iVBORw0KGgo=';
 const validate=env.EIDOS_VALIDATE_PLAYGROUND_IMAGE;delete env.EIDOS_VALIDATE_PLAYGROUND_IMAGE;
 assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,503);
 env.EIDOS_VALIDATE_PLAYGROUND_IMAGE=validate;
 const owner=sql.prepare('SELECT id FROM eidos_email_members WHERE username=?').get('image_owner')!.id;
 sql.prepare('INSERT INTO eidos_pg_assets(owner_id,hash,data) VALUES(?,?,zeroblob(40000000))').run(owner,'quota-fixture');
 assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,413);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_revisions').get()!.n,1);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_assets').get()!.n,1);
 sql.close();
});

test('v2 card assets hydrate only for their owner and preserve earlier document versions',async()=>{
 const {env,sql}=fixture(),alice=await signup(env,'alice'),bob=await signup(env,'bobby');
 const document=upgradeProject(createProject()),gallery=newBlock('gallery');gallery.cards=[{id:'card-cloud',title:'Own',description:'',alt:'Image',image:'data:image/png;base64,iVBORw0KGgo='}];document.sections.splice(3,0,gallery);
 const response=await save(ctx(env,'/api/playground/projects',{document},alice.headers));assert.equal(response.status,200,await response.clone().text());const saved=await response.json();
 assert.deepEqual((await (await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,alice.headers))).json()).document,document);
 assert.equal((await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,bob.headers))).status,404);sql.close();
});

test('current-format resume is default-off, owner-bound, lossless and separate from authoring activation',async()=>{
 const {env,sql}=fixture(),alice=await signup(env,'resume_alice'),bob=await signup(env,'resume_bob');
 try {
  const document=selectStudio(createProject(),'artwork');
  const caps=await (await get(ctx(env,'/api/playground/projects',undefined,alice.headers))).json();
  assert.equal(caps.resumeProtocol,1);assert.equal(caps.resumeSaveEnabled,false);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,intent:'resume',expectedOwner:caps.ownerId},alice.headers))).status,409);
  env.EIDOS_PLAYGROUND_RESUME_ENABLED='true';env.EIDOS_PLAYGROUND_AUTHORING_ENABLED='false';
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,intent:'resume'},alice.headers))).status,409);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,intent:'resume',expectedOwner:'wrong-owner'},alice.headers))).status,409);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document},alice.headers))).status,409,'ordinary cloud contract remains closed');
  const response=await save(ctx(env,'/api/playground/projects',{document,intent:'resume',expectedOwner:caps.ownerId},alice.headers));
  assert.equal(response.status,200,await response.clone().text());const saved=await response.json();
  assert.deepEqual((await (await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,alice.headers))).json()).document,document);
  assert.equal((await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,bob.headers))).status,404);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,intent:'resume',expectedOwner:caps.ownerId,id:saved.id,expectedRevision:saved.revision},bob.headers))).status,409);
  const latest=await (await get(ctx(env,'/api/playground/projects',undefined,alice.headers))).json();
  assert.equal(latest.resumeSaveEnabled,true);assert.ok(latest.storage.documentBytes>0);assert.equal(latest.storage.documentLimit,20_000_000);assert.equal(latest.storage.imageLimit,40_000_000);
 } finally {sql.close();}
});

test('document-history quota is transactional and preserves the previous head and other owners',async()=>{
 const {env,sql}=fixture(),alice=await signup(env,'quota_alice'),bob=await signup(env,'quota_bob');
 try {
  const document=createProject(),saved=await (await save(ctx(env,'/api/playground/projects',{document},alice.headers))).json();
  const archiveId=crypto.randomUUID();
  const used=Number(sql.prepare('SELECT SUM(length(CAST(document AS BLOB))) bytes FROM eidos_pg_revisions WHERE project_id=?').get(saved.id)!.bytes);
  sql.prepare('INSERT INTO eidos_pg_revisions(id,project_id,parent,document,created_at) VALUES(?,?,NULL,zeroblob(?),?)').run(archiveId,saved.id,20_000_000-used,new Date().toISOString());
  const before=sql.prepare('SELECT COUNT(*) n FROM eidos_pg_revisions').get()!.n;
  const larger={...document,name:'Later work',sections:document.sections.map((section,index)=>index===1?{...section,image:'data:image/png;base64,iVBORw0KGgo='}:section)};
  const result=await save(ctx(env,'/api/playground/projects',{document:larger,id:saved.id,expectedRevision:saved.revision},alice.headers));
  assert.equal(result.status,413,await result.clone().text());
  assert.match((await result.json()).error,/Earlier work is kept/);
  assert.equal(sql.prepare('SELECT head FROM eidos_pg_projects WHERE id=?').get(saved.id)!.head,saved.revision);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_revisions').get()!.n,before);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_assets').get()!.n,0,'rejected history cannot leave an orphan image');
  assert.equal((await save(ctx(env,'/api/playground/projects',{document},bob.headers))).status,200,'another owner has independent quota');
  assert.deepEqual((await (await get(ctx(env,'/api/playground/projects?id='+saved.id+'&revision='+saved.revision,undefined,alice.headers))).json()).document,document);
 } finally {sql.close();}
});
