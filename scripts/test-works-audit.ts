import test from 'node:test';import assert from 'node:assert/strict';import {renderToStaticMarkup} from 'react-dom/server';import {createElement} from 'react';
import {createProject} from '../src/playground/model';import {enableBlocks} from '../src/playground/authoring';import {flattenNodes} from '../src/playground/authoringSchema';import {aiContext,applyProposal,proposalDiff} from '../src/playground/aiOperations';
import {affiliatePilot,approvedRecommendation} from '../src/data/affiliatePilot';import {ToolsUsed} from '../src/components/ToolsUsed';
import {fixture,ctx} from './playground-test-fixture';import {onRequestGet as readiness} from '../functions/api/operations/readiness';
import {onRequestGet as audit} from '../functions/api/operations/audit';
test('responsive block copy proposal changes rendered text, preserves document and exposes a correct review diff',()=>{
 const project=enableBlocks(createProject()),node=project.sections.flatMap(s=>s.authoring?flattenNodes(s.authoring.root):[]).find(n=>n.type==='heading')!;
 const context=aiContext(project,node.id,'section');assert.equal(context.section.title,node.text);assert.equal(JSON.stringify(context).includes('data:image'),false);
 const proposal={ops:[{field:'section.title',value:'A clearer fictional heading'}]};const next=applyProposal(project,node.id,'section',proposal);
 assert.equal(proposalDiff(project,node.id,'section',proposal)[0].after,'A clearer fictional heading');assert.notDeepEqual(next,project);assert.equal(node.text,context.section.title);
 assert.throws(()=>applyProposal(project,node.id,'section',{ops:[{field:'section.layout',value:'split'}]}));
});
test('affiliate pilot is absent without approval and rejects untrusted URLs',()=>{
 assert.equal(affiliatePilot.enabled,false);assert.equal(renderToStaticMarkup(createElement(ToolsUsed,{article:'example'})),'');
 const item={id:'lighting',article:'example',title:'Example',reason:'Draft',url:'https://www.amazon.com/example',approved:true,rightsConfirmed:true};
 assert.equal(approvedRecommendation(item),true);for(const url of ['javascript:alert(1)','https://amazon.com.evil.test/x','https://user:pass@amazon.com/x'])assert.equal(approvedRecommendation({...item,url}),false);
 assert.equal(approvedRecommendation({...item,approved:false}),false);
});
test('operational readiness requires an owner and never returns configured secrets',async()=>{
 const {env,sql}=fixture();try{env.EIDOS_ADMIN_TOKEN='owner-secret-'.repeat(4);env.OPENAI_API_KEY='never-return-this';
 assert.equal((await readiness(ctx(env,'/api/operations/readiness'))).status,401);
 const result=await readiness(ctx(env,'/api/operations/readiness',undefined,{authorization:'Bearer '+env.EIDOS_ADMIN_TOKEN}));assert.equal(result.status,200);const raw=await result.text();assert.equal(raw.includes(env.OPENAI_API_KEY),false);assert.equal(raw.includes(env.EIDOS_ADMIN_TOKEN),false);
 const data=JSON.parse(raw);assert.equal(data.assistant.dailyReservedTokens,0);assert.equal(data.assistant.dailyTokenLimit,20000);assert.equal(data.assistant.limitSource,'source default');
 const denied=await readiness({env,request:new Request('https://eidos-works.com/api/operations/readiness',{headers:{authorization:'Bearer '+env.EIDOS_ADMIN_TOKEN}})});assert.equal(denied.status,401);
 const log=await audit(ctx(env,'/api/operations/audit',undefined,{authorization:'Bearer '+env.EIDOS_ADMIN_TOKEN}));assert.equal(log.status,200);
 const entries=JSON.parse(await log.text()).events;assert.ok(entries.some((event:{path:string})=>event.path==='/api/operations/readiness'));assert.ok(entries.some((event:{path:string})=>event.path==='/api/operations/audit'));assert.ok(!JSON.stringify(entries).includes(env.EIDOS_ADMIN_TOKEN));
 }finally{sql.close();}
});
