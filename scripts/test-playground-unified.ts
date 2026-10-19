import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, validateProject } from '../src/playground/model';
import { enableBlocks, applyBlockOperation } from '../src/playground/authoring';
import { flattenNodes } from '../src/playground/authoringSchema';
import { insertPageImage } from '../src/playground/editorAssets';
import { workspace, workspaceReducer } from '../src/playground/workspace';
import { exportFiles } from '../src/playground/export';
import { selectStudio } from '../src/playground/studioProject';

const image = 'data:image/png;base64,iVBORw0KGgo=';
const hero = (p: ReturnType<typeof createProject>) => p.sections.find(s => s.id === 'hero')!;
test('asset replaces selected block image without changing identity or unrelated content', () => {
  const p = enableBlocks(createProject());
  const target = flattenNodes(hero(p).authoring!.root).find(n => n.type === 'image')!;
  const before = structuredClone(p);
  const result = insertPageImage(p, 'hero', target.id, image, 'example.png');
  assert.equal(result.nodeId, target.id);
  const changed = flattenNodes(hero(result.project).authoring!.root).find(n => n.id === target.id)!;
  assert.equal(changed.image, image); assert.equal(changed.media!.sourceName, 'example.png');
  assert.deepEqual(p, before);
  assert.deepEqual(result.project.sections.filter(s => s.id !== 'hero'), p.sections.filter(s => s.id !== 'hero'));
});
test('asset inserted into selected nested container has one Undo transaction and independent export', () => {
  let p = enableBlocks(createProject());
  p = applyBlockOperation(p, { type: 'add', parent: hero(p).authoring!.root.id, kind: 'columns' });
  const columns = hero(p).authoring!.root.children!.at(-1)!;
  const result = insertPageImage(p, 'hero', columns.id, image, 'Original artwork');
  const target = flattenNodes(hero(result.project).authoring!.root).find(n => n.id === columns.id)!;
  assert.equal(target.children!.at(-1)!.id, result.nodeId);
  const state = workspaceReducer(workspace(p, 'same-project'), { type: 'edit', project: result.project, time: 1 });
  assert.equal(state.past.length, 1); assert.equal(state.current.documentId, 'same-project');
  assert.deepEqual(workspaceReducer(state, { type: 'undo' }).current.project, p);
  const files = exportFiles(result.project);
  assert.ok(files.some(file => file.name === `assets/${result.nodeId}.png`));
  assert.deepEqual(validateProject(JSON.parse(new TextDecoder().decode(files.find(file => file.name === 'project.json')!.data))), result.project);
});
test('legacy section image uses its own slot without silently changing renderer or schema', () => {
  const p = createProject();
  const result = insertPageImage(p, 'work', '', image, 'Project photo');
  assert.equal(result.sectionId, 'work'); assert.equal(result.nodeId, '');
  assert.equal(result.project.sections.find(s => s.id === 'work')!.image, image);
  assert.equal(result.project.schemaVersion, p.schemaVersion); assert.equal(result.project.rendererVersion, p.rendererVersion);
  assert.deepEqual(hero(result.project), hero(p));
});
test('artwork insertion preserves the studio source and rejects malformed image without mutation', () => {
  const p = selectStudio(selectStudio(enableBlocks(createProject()), 'artwork'), 'page');
  const before = structuredClone(p);
  const result = insertPageImage(p, 'hero', hero(p).authoring!.root.id, image, 'Original artwork');
  assert.deepEqual(result.project.studios, p.studios);
  assert.throws(() => insertPageImage(p, 'hero', hero(p).authoring!.root.id, 'data:image/png;base64,SGVsbG8=', 'Bad'));
  assert.deepEqual(p, before);
});
