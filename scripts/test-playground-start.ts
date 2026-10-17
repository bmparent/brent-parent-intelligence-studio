import test from 'node:test';
import assert from 'node:assert/strict';
import { createStarter, starters, verifiedDestination } from '../src/playground/starters';
import { createProject, validateProject } from '../src/playground/model';
import { flattenNodes } from '../src/playground/authoringSchema';
import { pageMarkup, renderedStyles } from '../src/playground/renderer';
import { validateSavedWorkspace, saveWorkspace, loadWorkspace, listSavedProjects, type Saved } from '../src/playground/storage';
import { editorSelection, workspace, workspaceReducer } from '../src/playground/workspace';

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aLTsAAAAASUVORK5CYII=';
test('three starters render different compositions, imagery contracts, typography, and page purposes', () => {
  const projects = starters.map(s => createStarter({starter:s.id,goal:s.goal,action:'contact'},pixel));
  for (const p of projects) {
    assert.deepEqual(validateProject(p),p);
    assert.equal(p.schemaVersion,5);
    assert.equal(p.sections.filter(s=>s.type==='header').length,1);
    assert.equal(p.sections.filter(s=>s.type==='hero').length,1);
    assert.ok(p.sections.every(s=>!(s.navigation||[]).some(n=>!n.href.startsWith('#'))));
    const hero = p.sections.find(s=>s.type==='hero')!;
    const nodes = flattenNodes(hero.authoring!.root);
    assert.ok(nodes.some(n=>n.type==='heading'));
    assert.ok(nodes.some(n=>n.type==='image'&&n.image===pixel));
    const markup = pageMarkup(p);
    assert.match(markup,/<h1 data-node-text="true">/);
    assert.ok(markup.includes(pixel));
    assert.match(renderedStyles(p),/\.pg-authoring-section h1/);
    assert.deepEqual(p.glass,createProject(p.template).glass,'approved glass settings are preserved');
  }
  const [business,landing,portfolio] = projects.map(p=>p.sections.find(s=>s.type==='hero')!.authoring!.root);
  assert.equal(business.type,'columns'); assert.equal(business.children![0].type,'stack');
  assert.equal(landing.type,'stack'); assert.equal(landing.align,'center');
  assert.equal(portfolio.type,'columns'); assert.equal(portfolio.children![0].type,'image');
  assert.equal(projects[0].tokens.font,'modern'); assert.equal(projects[2].tokens.font,'editorial');
  assert.ok(projects[2].sections.some(s=>s.type==='about'));
  assert.equal(new Set(starters.map(s=>s.artwork)).size,3);
});
test('brief personalizes the same project and manual contact remains explicitly unconnected', () => {
  const p=createStarter({starter:'switchboard',goal:'business',action:'estimate',name:'Acme & Co',offer:'Care for your garden',logo:pixel,photo:pixel,accent:'#225544'});
  assert.equal(p.name,'Acme & Co'); assert.equal(p.brand?.businessName,'Acme & Co');
  assert.equal(p.tokens.accent,'#225544'); assert.equal(p.sections[0].image,pixel);
  const nodes=flattenNodes(p.sections[1].authoring!.root);
  assert.equal(nodes.find(n=>n.type==='heading')?.text,'Care for your garden');
  assert.equal(nodes.find(n=>n.type==='button')?.href,'#contact');
  assert.match(p.sections.find(s=>s.id==='contact')!.description,/no connected contact form/);
  assert.equal(p.sections.find(s=>s.id==='contact')!.href,'#');
});
test('column flex ratios target stable content IDs rather than editor chrome siblings', () => {
  const p=createStarter({starter:'switchboard',goal:'business',action:'contact'}), root=p.sections[1].authoring!.root;
  const css=renderedStyles(p);
  assert.ok(css.includes(`#${root.id}>#${root.children![0].id}{flex:55 1 0}`));
  assert.ok(css.includes(`#${root.id}>#${root.children![1].id}{flex:45 1 0}`));
  assert.equal(css.includes(`#${root.id}>:last-child`),false);
});
test('booking links require explicit reviewed HTTPS destination and never create a store', () => {
  for (const href of ['javascript:alert(1)','http://example.com','https://user:pass@example.com','/checkout','https://localhost']) assert.throws(()=>verifiedDestination(href,true));
  assert.throws(()=>verifiedDestination('https://example.com/book',false));
  const p=createStarter({starter:'tideglass',goal:'landing',action:'link',verifiedLink:'https://example.com/book',linkConfirmed:true});
  assert.equal(p.sections[0].href,'https://example.com/book');
  assert.equal(flattenNodes(p.sections[1].authoring!.root).find(n=>n.type==='button')?.href,'https://example.com/book');
});
test('legacy envelopes gain identity without upgrading or mutating their project', () => {
  const project=createProject(),before=JSON.stringify(project);
  const saved=validateSavedWorkspace({project,snapshots:[]});
  assert.equal(JSON.stringify(project),before); assert.equal(saved.project.schemaVersion,1);
  assert.match(saved.documentId,/^[a-z0-9-]+$/i); assert.equal(saved.editor.pageId,'page-main');
  assert.equal(saved.editor.sectionId,'hero');
  assert.deepEqual(validateSavedWorkspace(saved),saved,'migration is idempotent after first persistence');
  assert.throws(()=>validateSavedWorkspace({project:{...project,schemaVersion:999},snapshots:[]}));
});
test('reopen retains document ID, revision, nodes, selection, images and variations', () => {
  const project=createStarter({starter:'matter',goal:'portfolio',action:'contact'},pixel);
  const hero=project.sections.find(s=>s.type==='hero')!, node=flattenNodes(hero.authoring!.root).find(n=>n.type==='image')!;
  const saved:Saved={project,documentId:'stable-document',revision:19,editor:{pageId:'page-main',sectionId:hero.id,nodeId:node.id},snapshots:[{id:'first',name:'First look',project,savedAt:'2026-10-14T15:00:00Z'}],savedAt:'2026-10-14T16:00:00Z'};
  const reopened=validateSavedWorkspace(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(reopened,saved);
  const loaded=workspaceReducer(workspace(createProject(),'temporary'),{type:'load',project:reopened.project,documentId:reopened.documentId,editor:reopened.editor});
  assert.equal(loaded.current.documentId,'stable-document'); assert.deepEqual(loaded.current.editor,saved.editor);
  assert.deepEqual(editorSelection(project,{pageId:'page-main',sectionId:'not-a-page',nodeId:'missing'}),{pageId:'page-main',sectionId:hero.id});
});
test('selection changes do not create history; cross-document Undo restores selection and identity', () => {
  const p=createStarter({starter:'switchboard',goal:'business',action:'contact'});
  const selected={pageId:'page-main' as const,sectionId:'contact'};
  let s=workspace(p,'first'); s=workspaceReducer(s,{type:'select',editor:selected});
  assert.equal(s.past.length,0);
  s=workspaceReducer(s,{type:'replace',project:createProject(),documentId:'second'});
  s=workspaceReducer(s,{type:'undo'});
  assert.equal(s.current.documentId,'first'); assert.deepEqual(s.current.editor,selected);
});

// A narrow IndexedDB fixture exercises our storage transaction and delayed-open
// behavior, not a replacement for browser IndexedDB acceptance.
test('device storage retains prior projects atomically and drops stale queued writes', async () => {
  const originalDB=globalThis.indexedDB, originalRange=globalThis.IDBKeyRange;
  const records=new Map<string,unknown>(); let delayOpen=false; const pending:(()=>void)[]=[];
  const db={close(){},transaction(){
    const writes:[string,unknown][]=[];
    const tx={oncomplete:null as null|(()=>void),onerror:null,onabort:null,objectStore(){return {
      put(value:unknown,key:string){writes.push([key,structuredClone(value)]);},
      get(key:string){const request={result:undefined as unknown,onsuccess:null as null|(()=>void),onerror:null};queueMicrotask(()=>{request.result=structuredClone(records.get(key));request.onsuccess?.();});return request;},
      getAll(){const request={result:[] as unknown[],onsuccess:null as null|(()=>void),onerror:null};queueMicrotask(()=>{request.result=[...records].filter(([key])=>key.startsWith('summary:')).map(([,value])=>structuredClone(value));request.onsuccess?.();});return request;}
    };}};
    setTimeout(()=>{for(const [key,value] of writes)records.set(key,value);tx.oncomplete?.();},0);return tx;
  }};
  Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:{open(){const request={result:db,onsuccess:null as null|(()=>void),onerror:null,onblocked:null};const finish=()=>request.onsuccess?.();if(delayOpen)pending.push(finish);else queueMicrotask(finish);return request;}}});
  Object.defineProperty(globalThis,'IDBKeyRange',{configurable:true,value:{bound(){return {};}}});
  const make=(id:string):Saved=>({project:{...createProject(),name:id},documentId:id,editor:{pageId:'page-main',sectionId:'hero'},revision:1,snapshots:[],savedAt:'2026-10-14T16:00:00Z'});
  try {
    assert.equal(await loadWorkspace(),null,'clean browser has no unexplained default');
    await saveWorkspace(make('first')); await saveWorkspace(make('second'));
    assert.equal((await loadWorkspace())?.documentId,'second');
    assert.equal((await loadWorkspace('first'))?.project.name,'first');
    assert.deepEqual((await listSavedProjects()).map(s=>s.documentId).sort(),['first','second']);
    delayOpen=true;let current=true;const stale=saveWorkspace(make('stale'),()=>current);current=false;pending.shift()!();await stale;delayOpen=false;
    assert.equal((await loadWorkspace())?.documentId,'second');assert.equal(records.has('project:stale'),false);
  } finally {
    Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:originalDB});
    Object.defineProperty(globalThis,'IDBKeyRange',{configurable:true,value:originalRange});
  }
});
