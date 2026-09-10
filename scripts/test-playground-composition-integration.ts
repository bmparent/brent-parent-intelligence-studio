import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, validateProject } from '../src/playground/model';
import { enableComposition, applyCompositionOperation } from '../src/playground/composition';
import { pageMarkup, runtimeScript } from '../src/playground/renderer';
import { exportFiles, zipFiles } from '../src/playground/export';
import { workspace, workspaceReducer } from '../src/playground/workspace';

test('full renderer and export preserve version 3, image placement and image asset ownership slots', () => {
  let p=enableComposition(createProject());
  p.sections[1].image='data:image/png;base64,iVBORw0KGgo=';
  p=applyCompositionOperation(p,{type:'placement',sectionId:'hero',placement:'background'});
  const files=exportFiles(p), text=(name:string)=>new TextDecoder().decode(files.find(f=>f.name===name)!.data);
  assert.equal(validateProject(JSON.parse(text('project.json'))).schemaVersion,3);
  assert.match(text('index.html'),/data-placement="background"/);
  assert.match(text('index.html'),/assets\/hero\.png/);
  assert.equal(files.filter(f=>f.name.startsWith('assets/')).length,1);
  assert.ok(!text('script.js').includes('pg-compose-handle'));
  assert.ok(!text('index.html').includes('pg-compose-handle'));
  assert.ok(zipFiles(files).byteLength>0);
});
test('legacy renderer path is still selected until opt-in upgrade', () => {
  const p=createProject();
  assert.match(pageMarkup(p),/pg-hero split/);
  assert.ok(!pageMarkup(p).includes('pg-composed'));
  assert.ok(!runtimeScript(p).includes('playground-composition'));
});
test('one upgrade/move is one undoable workspace operation', () => {
  const p=createProject();let state=workspace(p,'composition-test');
  state=workspaceReducer(state,{type:'edit',project:enableComposition(p),time:1});
  assert.equal(state.current.project.schemaVersion,3);
  state=workspaceReducer(state,{type:'undo'});
  assert.equal(state.current.project.schemaVersion,1);
  state=workspaceReducer(state,{type:'redo'});
  const before=state.current.project;
  state=workspaceReducer(state,{type:'edit',project:applyCompositionOperation(before,{type:'placement',sectionId:'hero',placement:'background'}),time:2});
  state=workspaceReducer(state,{type:'undo'});
  assert.deepEqual(state.current.project,before);
});
