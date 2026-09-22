import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,ctx,signup} from './playground-test-fixture';
import {onRequestGet as get,onRequestPost as save} from '../functions/api/playground/projects';
import {createProject} from '../src/playground/model';
import {enableBlocks,applyBlockOperation} from '../src/playground/authoring';
test('v4 cloud defaults off; explicit controlled gate preserves node assets, owner isolation and concurrent heads',async()=>{
 const {env,sql}=fixture();try{
 const a=await signup(env,'author_alice'),b=await signup(env,'author_bobby');let p=enableBlocks(createProject());const root=p.sections.find(s=>s.authoring)!.authoring!.root;
 p=applyBlockOperation(p,{type:'add',parent:root.id,kind:'image'});
 for(const n of root.children!.filter(n=>n.type==='image'))p=applyBlockOperation(p,{type:'patch',id:n.id,patch:{image:'data:image/png;base64,iVBORw0KGgo=',mobile:{width:72,height:240}}});
 delete env.EIDOS_PLAYGROUND_AUTHORING_ENABLED;
 assert.equal((await save(ctx(env,'/api/playground/projects',{document:p},a.headers))).status,409);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_projects').get()!.n,0);
 env.EIDOS_PLAYGROUND_AUTHORING_ENABLED='true';
 const response=await save(ctx(env,'/api/playground/projects',{document:p},a.headers));assert.equal(response.status,200,await response.clone().text());const first=await response.json();
 const reopened=await (await get(ctx(env,'/api/playground/projects?id='+first.id,undefined,a.headers))).json();assert.deepEqual(reopened.document,p);
 assert.equal((await get(ctx(env,'/api/playground/projects?id='+first.id,undefined,b.headers))).status,404);
 assert.equal((await save(ctx(env,'/api/playground/projects',{document:p,expectedOwner:first.ownerId},b.headers))).status,409);
 const outputs=await Promise.all(['tab-one','tab-two'].map(name=>save(ctx(env,'/api/playground/projects',{document:{...p,name},id:first.id,expectedRevision:first.revision,expectedOwner:first.ownerId},a.headers))));assert.deepEqual(outputs.map(r=>r.status).sort(),[200,409]);
 const historical=await (await get(ctx(env,'/api/playground/projects?id='+first.id+'&revision='+first.revision,undefined,a.headers))).json();assert.deepEqual(historical.document,p);
 }finally{sql.close();}
});
