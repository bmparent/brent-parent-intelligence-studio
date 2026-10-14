import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,validateProject,RENDERER,LEGACY_RENDERER} from '../src/playground/model';
import {selectStudio} from '../src/playground/studioProject';
import {workspace,workspaceReducer} from '../src/playground/workspace';
import {applyLocalCommand} from '../src/playground/AgentCommands';
import {supportsProductionCloud} from '../src/playground/releaseBoundary';
import {exportFiles,headerFiles} from '../src/playground/export';
import {enableBlocks,applyBlockOperation} from '../src/playground/authoring';
import {applyEffectPreset} from '../src/playground/EffectStudio';
import {enableComposition,applyCompositionOperation} from '../src/playground/composition';
import {assertCloudStudioBoundary} from '../functions/_shared/platform/studioBoundary';
import {applyProposal} from '../src/playground/aiOperations';

test('explicit studio migration preserves legacy renderer and imports all supported versions',()=>{
 for(const rendererVersion of [RENDERER,LEGACY_RENDERER]) {
  const p={...createProject(),rendererVersion};
  assert.equal(validateProject(p).schemaVersion,1);
  const next=selectStudio(p,'artwork');
  assert.equal(next.schemaVersion,5);assert.equal(next.rendererVersion,rendererVersion);
  assert.deepEqual(next.sections.map(s=>s.id),p.sections.map(s=>s.id));
  assert.deepEqual(validateProject(JSON.parse(JSON.stringify(next))),next);
  assert.ok(next.studios?.artwork);assert.equal(supportsProductionCloud(next),false);
  assert.equal(p.studios,undefined);
 }
});
test('malformed future studio imports fail without changing current design',()=>{
 const p=selectStudio(createProject(),'effect'), before=JSON.stringify(p);
 for(const patch of [{schemaVersion:99},{studios:{version:99,active:'effect'}},{studios:{version:1,active:'unknown'}},{extra:123}])assert.throws(()=>validateProject({...p,...patch}));
 assert.throws(()=>validateProject({...createProject(),studios:{version:1,active:'effect'}}));
 assert.equal(JSON.stringify(p),before);
});
test('one long gesture is one undo entry; separate gestures, redo and restore remain distinct',()=>{
 const p=selectStudio(createProject(),'effect');let s=workspace(p,'a');
 for(let i=0;i<4;i++)s=workspaceReducer(s,{type:'edit',project:{...p,glass:{...p.glass,frost:i}},group:'gesture:one',time:i*1500});
 assert.equal(s.past.length,1);
 const final=s.current.project;s=workspaceReducer(s,{type:'undo'});assert.deepEqual(s.current.project,p);
 s=workspaceReducer(s,{type:'redo'});assert.deepEqual(s.current.project,final);
 s=workspaceReducer(s,{type:'edit',project:p,group:'gesture:two',time:9000});assert.equal(s.past.length,2);
 s=workspaceReducer(s,{type:'replace',project:createProject('portfolio'),documentId:'b'});assert.equal(s.current.documentId,'b');
 s=workspaceReducer(s,{type:'undo'});assert.equal(s.current.documentId,'a');
});
test('bounded local operations reject stale document/revision and unsafe values',()=>{
 const p=selectStudio(createProject(),'effect'),actual={documentId:'a',revision:3};
 const request={...actual,selected:'hero',scope:'section' as const,proposal:{ops:[{field:'section.title' as const,value:'New heading'}]}};
 const next=applyLocalCommand(p,actual,request);assert.equal(next.sections[1].title,'New heading');assert.notEqual(p.sections[1].title,'New heading');
 assert.throws(()=>applyLocalCommand(p,actual,{...request,documentId:'b'}),/Stale/);
 assert.throws(()=>applyLocalCommand(p,actual,{...request,revision:2}),/Stale/);
 assert.throws(()=>applyLocalCommand(p,actual,{...request,proposal:{ops:[{field:'section.href',value:'javascript:alert(1)'}]}}),/unsafe/);
});
test('schema5 retains existing responsive authoring and independent glass outputs',()=>{
 let p=selectStudio(createProject(),'layout');p=enableBlocks(p);assert.equal(p.schemaVersion,5);assert.ok(p.sections[1].authoring);
 p=applyBlockOperation(p,{type:'add-section'});assert.equal(p.sections.length,7);
 p=applyEffectPreset(p,'Soft frost');assert.equal(p.glass.frost,12);
 const files=exportFiles(p),header=headerFiles(p);
 assert.equal(JSON.parse(new TextDecoder().decode(files.find(f=>f.name==='project.json')!.data)).schemaVersion,5);
 assert.ok(header.some(f=>f.name==='eidos-header.js'));assert.ok(files.some(f=>f.name==='index.html'));
});
test('schema3 spatial composition stays editable after a studio upgrade',()=>{
 const p=selectStudio(enableComposition(createProject()),'effect');
 const next=applyCompositionOperation(p,{type:'placement',sectionId:'hero',placement:'left'});
 assert.equal(next.schemaVersion,5);assert.equal(next.sections[1].composition?.placement,'left');
});
test('account boundary rejects studio data before older validation can discard it',()=>{
 for(const p of [selectStudio(createProject(),'artwork'),{...createProject(),studios:{}},{schemaVersion:99}])assert.throws(()=>assertCloudStudioBoundary(p),/device/);
 assert.doesNotThrow(()=>assertCloudStudioBoundary(createProject()));
});
test('bounded text operations update the visible responsive block and retain legacy provenance',()=>{
 const p=enableBlocks(selectStudio(createProject(),'layout'));
 const next=applyProposal(p,'hero','section',{ops:[{field:'section.title',value:'Visible block title'}]});
 assert.equal(next.sections[1].title,'Visible block title');
 assert.equal(next.sections[1].authoring?.root.children?.find(n=>n.type==='heading')?.text,'Visible block title');
 assert.throws(()=>applyProposal(p,'hero','section',{ops:[{field:'section.layout',value:'center'}]}),/responsive/);
});
