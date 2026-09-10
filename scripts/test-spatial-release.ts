import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createProject, validateProject } from '../src/playground-spatial/model';
import { enableComposition, applyCompositionOperation } from '../src/playground-spatial/composition';
import { pageMarkup, runtimeScript } from '../src/playground-spatial/renderer';
import { exportFiles, zipFiles } from '../src/playground-spatial/export';
import { workspace, workspaceReducer } from '../src/playground-spatial/workspace';

const source = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('spatial renderer and export preserve schema 3, placement and the owned image slot', () => {
  let project = enableComposition(createProject());
  project.sections[1].image = 'data:image/png;base64,iVBORw0KGgo=';
  project = applyCompositionOperation(project, {type:'placement',sectionId:'hero',placement:'background'});
  const files = exportFiles(project);
  const text = (name: string) => new TextDecoder().decode(files.find(file => file.name === name)!.data);
  assert.equal(validateProject(JSON.parse(text('project.json'))).schemaVersion, 3);
  assert.match(text('index.html'), /data-placement="background"/);
  assert.match(text('index.html'), /assets\/hero\.png/);
  assert.equal(files.filter(file => file.name.startsWith('assets/')).length, 1);
  assert.ok(!text('script.js').includes('pg-compose-handle'));
  assert.ok(!text('index.html').includes('pg-compose-handle'));
  assert.ok(zipFiles(files).byteLength > 0);
});

test('imported legacy documents retain their original renderer until explicit upgrade', () => {
  const project = createProject();
  assert.match(pageMarkup(project), /pg-hero split/);
  assert.ok(!pageMarkup(project).includes('pg-composed'));
  assert.ok(!runtimeScript(project).includes('playground-composition'));
});

test('upgrade and move are individually undoable; redo restores composition', () => {
  const project = createProject();
  let state = workspace(project, 'composition-release');
  state = workspaceReducer(state, {type:'edit',project:enableComposition(project),time:1});
  assert.equal(state.current.project.schemaVersion, 3);
  state = workspaceReducer(state, {type:'undo'});
  assert.equal(state.current.project.schemaVersion, 1);
  state = workspaceReducer(state, {type:'redo'});
  const before = state.current.project;
  state = workspaceReducer(state, {type:'edit',project:applyCompositionOperation(before,{type:'placement',sectionId:'hero',placement:'background'}),time:2});
  state = workspaceReducer(state, {type:'undo'});
  assert.deepEqual(state.current.project, before);
});

test('classic editor is byte-identical to the original production component', () => {
  const bytes = readFileSync(new URL('../src/playground/ClassicPlayground.tsx', import.meta.url));
  const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  assert.equal(hash, 'bbe24d12dbef0e6a439104d0432127687a832d96');
});

test('spatial storage cannot overwrite the classic database', () => {
  assert.match(source('src/playground/storage.ts'), /const DB = "eidos-playground-v1"/);
  assert.match(source('src/playground-spatial/storage.ts'), /const DB = "eidos-playground-spatial-v3"/);
  assert.doesNotMatch(source('src/playground-spatial/storage.ts'), /deleteDatabase\s*\(/);
});

test('local release does not mount account writes, purchases or AI provider calls', () => {
  for (const path of ['src/playground-spatial/CloudProjects.tsx','src/playground-spatial/AIAssist.tsx']) {
    const text = source(path);
    assert.doesNotMatch(text, /fetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|<Purchases\b/);
  }
  assert.match(source('src/playground-spatial/CloudProjects.tsx'), /classic=1/);
  assert.match(source('src/playground/Playground.tsx'), /params\.has\('open'\)/);
});

test('fresh local workspaces start with composition and share existing production glass', () => {
  assert.match(source('src/playground-spatial/useProject.ts'), /workspace\(enableComposition\(createProject\(\)\)/);
  assert.match(source('src/playground-spatial/glassBundle.ts'), /from '\.\.\/playground\/glassBundle'/);
  const receipt = JSON.parse(source('public/playground-release.json'));
  assert.equal(receipt.release, 'spatial-local-20260910');
  assert.equal(receipt.cloudSchema3, false);
  assert.equal(receipt.paidExports, false);
  assert.equal(receipt.aiGeneration, false);
});
