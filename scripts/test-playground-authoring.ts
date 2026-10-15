import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,validateProject,mediaSlots} from '../src/playground/model';
import {enableComposition} from '../src/playground/composition';
import {enableBlocks,applyBlockOperation,setBlockMotion} from '../src/playground/authoring';
import {newNode,flattenNodes,BLOCK_LIMITS} from '../src/playground/authoringSchema';
import {exportFiles} from '../src/playground/export';
import {defaultMedia} from '../src/playground/media';
import {pageMarkup,runtimeScript,renderedStyles} from '../src/playground/renderer';
import {workspace,workspaceReducer} from '../src/playground/workspace';
import {supportsProductionCloud} from '../src/playground/releaseBoundary';
const image='data:image/png;base64,iVBORw0KGgo=';
const root=(p:ReturnType<typeof createProject>)=>p.sections.find(s=>s.type==='hero')!.authoring!.root;
test('opening versions 1-3 never upgrades or introduces authoring',()=>{for(const p of [createProject(),createProject('about'),enableComposition(createProject())]){assert.deepEqual(validateProject(p),p);assert.ok(!p.sections.some(s=>s.authoring));}});
test('explicit upgrade preserves all legacy section identities/data, tokens, renderer and glass and Undo restores exact original',()=>{const p=enableComposition(createProject());p.sections[1].image=image;const next=enableBlocks(p);assert.equal(next.schemaVersion,4);assert.deepEqual(next.glass,p.glass);assert.equal(next.rendererVersion,p.rendererVersion);assert.deepEqual(next.sections.map(s=>s.id),p.sections.map(s=>s.id));assert.equal(next.sections[1].image,image);let w=workspace(p,'legacy');w=workspaceReducer(w,{type:'edit',project:next,time:1});assert.deepEqual(workspaceReducer(w,{type:'undo'}).current.project,p);assert.deepEqual(validateProject(JSON.parse(JSON.stringify(next))),next);});
test('two independently addressable images, text and buttons survive export and keep old archive input untouched',()=>{let p=enableBlocks(createProject());const r=root(p);p=applyBlockOperation(p,{type:'add',parent:r.id,kind:'image'});const images=root(p).children!.filter(n=>n.type==='image');for(const n of images)p=applyBlockOperation(p,{type:'patch',id:n.id,patch:{image}});const before=structuredClone(p);const files=exportFiles(p),text=(name:string)=>new TextDecoder().decode(files.find(f=>f.name===name)!.data);assert.deepEqual(p,before);assert.deepEqual(JSON.parse(text('project.json')),p);assert.equal(files.filter(f=>f.name.startsWith('assets/')).length,2);for(const n of images)assert.ok(text('index.html').includes('assets/'+n.id+'.png'));assert.equal(mediaSlots(p).filter(s=>s.image).length,2);assert.ok(!text('script.js').includes('pg-node-toolbar'));});
test('moves preserve node ID/data across compatible section containers, one history entry and exact Undo/Redo',()=>{let p=enableBlocks(createProject());p=applyBlockOperation(p,{type:'add-section'});const first=root(p).children![0],target=p.sections.find(s=>s.type==='content')!.authoring!.root;const moved=applyBlockOperation(p,{type:'move',id:first.id,parent:target.id,before:null});assert.deepEqual(moved.sections.find(s=>s.type==='content')!.authoring!.root.children!.at(-1),first);const state=workspaceReducer(workspace(p,'same'),{type:'edit',project:moved,time:1});assert.equal(state.past.length,1);assert.deepEqual(workspaceReducer(state,{type:'undo'}).current.project,p);assert.deepEqual(workspaceReducer(workspaceReducer(state,{type:'undo'}),{type:'redo'}).current.project,moved);});
test('duplicate assigns fresh IDs recursively; remove changes only the current document',()=>{let p=enableBlocks(createProject());p=applyBlockOperation(p,{type:'add',parent:root(p).id,kind:'stack'});const stack=root(p).children!.at(-1)!;p=applyBlockOperation(p,{type:'add',parent:stack.id,kind:'text'});const old=structuredClone(p);const next=applyBlockOperation(p,{type:'duplicate',id:stack.id});const nodes=next.sections.flatMap(s=>s.authoring?flattenNodes(s.authoring.root):[]);assert.equal(new Set(nodes.map(n=>n.id)).size,nodes.length);assert.deepEqual(p,old);assert.equal(root(applyBlockOperation(next,{type:'remove',id:stack.id})).children!.filter(n=>n.type==='stack').length,1);});
test('cycles, roots and invalid sibling destinations cannot mutate input',()=>{const p=enableBlocks(createProject()),r=root(p),old=structuredClone(p);assert.throws(()=>applyBlockOperation(p,{type:'move',id:r.id,parent:r.id,before:null}));assert.throws(()=>applyBlockOperation(p,{type:'remove',id:r.id}));assert.throws(()=>applyBlockOperation(p,{type:'move',id:r.children![0].id,parent:r.id,before:'node-missing'}));assert.deepEqual(p,old);});
test('mobile geometry is explicit, independent and exactly reversible',()=>{const p=enableBlocks(createProject()),n=root(p).children![0];const next=applyBlockOperation(p,{type:'patch',id:n.id,patch:{mobile:{width:70,align:'center'}}});assert.equal(root(next).children![0].width,n.width);assert.match(renderedStyles(next),/width:70%/);assert.deepEqual(applyBlockOperation(next,{type:'patch',id:n.id,patch:{mobile:undefined}}),p);});
test('malformed, duplicate, excessive, unsafe and non-finite node inputs reject',()=>{const p=enableBlocks(createProject());for(const patch of [{width:NaN},{height:Infinity},{width:101},{href:'javascript:alert(1)'},{image:'data:image/png;base64,SGVsbG8='},{unknown:true}])assert.throws(()=>applyBlockOperation(p,{type:'patch',id:root(p).children![0].id,patch}));const duplicate=structuredClone(p);root(duplicate).children!.push(root(duplicate).children![0]);assert.throws(()=>validateProject(duplicate));const over=structuredClone(p);root(over).children=Array.from({length:BLOCK_LIMITS.sectionNodes},()=>newNode('text'));assert.throws(()=>validateProject(over));const deep=structuredClone(p);let cursor=root(deep);for(let i=0;i<5;i++){const n=newNode('stack');cursor.children=[n];cursor=n;}assert.throws(()=>validateProject(deep));});
test('text renders as escaped content and authored format stays explicitly local-only',()=>{let p=enableBlocks(createProject());p=applyBlockOperation(p,{type:'patch',id:root(p).children![0].id,patch:{text:'<img onerror=alert(1)>'}});assert.ok(pageMarkup(p).includes('&lt;img onerror=alert(1)&gt;'));assert.ok(!pageMarkup(p).includes('<img onerror'));assert.equal(supportsProductionCloud(p),false);assert.ok(!runtimeScript(p).includes('playground-block'));});
test('maximum 96-node project renders and exports; 97th node and cross-section duplicate identities reject',()=>{let p=enableBlocks(createProject());p=applyBlockOperation(p,{type:'add-section'});root(p).children=Array.from({length:47},()=>newNode('text'));const content=p.sections.find(s=>s.type==='content')!.authoring!.root;content.children=Array.from({length:47},()=>newNode('text'));p=validateProject(p);assert.ok(pageMarkup(p).length>10000);assert.ok(exportFiles(p).length>=8);const bad=structuredClone(p);bad.sections.find(s=>s.type==='content')!.authoring!.root.children!.push(newNode('text'));assert.throws(()=>validateProject(bad));const duplicate=structuredClone(p);duplicate.sections.find(s=>s.type==='content')!.authoring!.root.children![0].id=root(p).children![0].id;assert.throws(()=>validateProject(duplicate));});
test('mobile row override remains shrinkable instead of overflowing with full-width children',()=>{let p=enableBlocks(createProject());p=applyBlockOperation(p,{type:'patch',id:root(p).id,patch:{mobile:{layout:'row'}}});assert.match(renderedStyles(p),/flex:1 1 0!important;width:auto/);});

test('canvas structure moves preserve pinned sections, card identities and exact reversibility',()=>{
 let p=enableBlocks(createProject());p=applyBlockOperation(p,{type:'add-section'});
 const section=p.sections[2];const next=applyBlockOperation(p,{type:'section-step',id:section.id,direction:1});
 assert.equal(next.sections[3].id,section.id);assert.deepEqual(applyBlockOperation(next,{type:'section-step',id:section.id,direction:-1}),p);
 assert.equal(applyBlockOperation(p,{type:'section-step',id:'header',direction:1}),p);
 assert.equal(applyBlockOperation(p,{type:'section-step',id:'footer',direction:-1}),p);
 assert.throws(()=>applyBlockOperation(p,{type:'card-step',id:'missing',direction:1}));
});

test('mobile photo zoom is independent of desktop media and survives rendering',()=>{const p=enableBlocks(createProject()),image=root(p).children!.find(n=>n.type==='image')!;const next=applyBlockOperation(p,{type:'patch',id:image.id,patch:{media:defaultMedia(),mobile:{zoom:2}}});assert.equal(root(next).children!.find(n=>n.id===image.id)!.media!.zoom,1);assert.match(renderedStyles(next),/transform:scale\(2\)/);assert.throws(()=>applyBlockOperation(p,{type:'patch',id:image.id,patch:{mobile:{zoom:4}}}));});

test('element motion explicitly upgrades only schema 4 and one Undo restores the exact legacy project',()=>{
 const original=enableBlocks(createProject()),id=root(original).children![0].id;
 assert.equal(setBlockMotion(original,id),original);
 const next=setBlockMotion(original,id,{preset:'rise',duration:600,delay:100});
 assert.equal(original.schemaVersion,4);assert.equal(next.schemaVersion,5);
 assert.deepEqual(root(next).children![0].motion,{preset:'rise',duration:600,delay:100});
 assert.deepEqual(next.sections.map(s=>s.id),original.sections.map(s=>s.id));assert.equal(root(next).children![0].id,id);
 const state=workspaceReducer(workspace(original,'motion-document'),{type:'edit',project:next,time:1});
 assert.equal(state.past.length,1);assert.deepEqual(workspaceReducer(state,{type:'undo'}).current.project,original);
 assert.deepEqual(workspaceReducer(workspaceReducer(state,{type:'undo'}),{type:'redo'}).current.project,next);
 assert.equal(root(setBlockMotion(next,id)).children![0].motion,undefined);
 assert.equal(setBlockMotion(next,id,{preset:'rise',duration:600,delay:100}),next);
});

test('motion is strict schema-5 metadata; old formats and unsafe/unbounded settings reject',()=>{
 const original=enableBlocks(createProject()),id=root(original).children![0].id;
 const next=setBlockMotion(original,id,{preset:'fade',duration:600,delay:0});
 for(const version of [1,2,3,4])assert.throws(()=>validateProject({...next,schemaVersion:version}));
 assert.throws(()=>applyBlockOperation(original,{type:'patch',id,patch:{motion:{preset:'fade',duration:600,delay:0}}}));
 for(const motion of [{preset:'spin',duration:600,delay:0},{preset:'fade',duration:199,delay:0},{preset:'rise',duration:1601,delay:0},{preset:'fade',duration:600,delay:-1},{preset:'fade',duration:600,delay:1201},{preset:'fade',duration:NaN,delay:0},{preset:'fade',duration:600,delay:0,css:'url(https://example.com)'},null]) {
   const bad=structuredClone(next);Object.assign(root(bad).children![0],{motion});assert.throws(()=>validateProject(bad));
 }
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(next))),next);
});

test('motion follows stable nodes through move/duplicate and uses identical preview/export styles with static fallback',()=>{
 let p=enableBlocks(createProject());const id=root(p).children![0].id;
 assert.ok(!renderedStyles(p).includes('@keyframes pg-block-'));assert.ok(!pageMarkup(p).includes('data-node-motion'));
 p=setBlockMotion(p,id,{preset:'settle',duration:800,delay:150});
 p=applyBlockOperation(p,{type:'add-section'});const destination=p.sections.find(s=>s.type==='content')!.authoring!.root.id;
 p=applyBlockOperation(p,{type:'move',id,parent:destination,before:null});
 p=applyBlockOperation(p,{type:'duplicate',id});
 const nodes=p.sections.flatMap(s=>s.authoring?flattenNodes(s.authoring.root):[]),copies=nodes.filter(n=>n.motion);
 assert.equal(copies.length,2);assert.notEqual(copies[0].id,copies[1].id);assert.deepEqual(copies[0].motion,copies[1].motion);
 const files=exportFiles(p),decode=(name:string)=>new TextDecoder().decode(files.find(f=>f.name===name)!.data),styles=renderedStyles(p);
 assert.equal(decode('styles.css'),styles);assert.deepEqual(JSON.parse(decode('project.json')),p);
 assert.ok(decode('index.html').includes('data-node-motion="settle"'));
 assert.ok(styles.includes('body[data-editing="false"][data-reduced="false"] #'+id));
 assert.ok(styles.includes('@media(prefers-reduced-motion:reduce){.pg-node[data-node-motion]{animation:none!important}}'));
 assert.ok(styles.includes('800ms cubic-bezier(.2,.7,.2,1) 150ms 1 both'));
 assert.ok(!decode('script.js').includes('pg-node-toolbar'));
});
