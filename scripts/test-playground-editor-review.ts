import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/playground/model';
import { defaultMedia } from '../src/playground/media';
import { enableComposition } from '../src/playground/composition';
import { legacySaveTarget, removeLocalImage, supportsProductionCloud } from '../src/playground/releaseBoundary';
import { workspace, workspaceReducer } from '../src/playground/workspace';

test('legacy save identity follows document history across format upgrades and Undo', () => {
  const project = createProject();
  const target = legacySaveTarget('project-a', 'revision-a', project.name, JSON.stringify(project));
  let state = workspace(project, 'original');
  state = workspaceReducer(state, { type: 'replace', project, documentId: 'cloud-a', target });
  state = workspaceReducer(state, { type: 'edit', project: enableComposition(project), time: 1 });
  assert.equal(supportsProductionCloud(state.current.project), false);
  state = workspaceReducer(state, { type: 'undo' });
  assert.equal(supportsProductionCloud(state.current.project), true);
  assert.deepEqual(state.current.target, target);
  state = workspaceReducer(state, { type: 'replace', project: createProject('portfolio'), documentId: 'unrelated' });
  assert.equal(state.current.target, null);
  state = workspaceReducer(state, { type: 'saved', documentId: 'cloud-a', target: { ...target, head: 'revision-b' } });
  assert.equal(state.current.target, null);
  state = workspaceReducer(state, { type: 'undo' });
  assert.equal(state.current.target?.head, 'revision-b');
});
test('removing an experimental image also removes metadata and restores legacy cloud eligibility', () => {
  const project = createProject();
  const changed = { ...project, sections: project.sections.map(section => section.id === 'hero' ? { ...section, image: 'fixture-bytes', media: defaultMedia() } : section) };
  assert.equal(supportsProductionCloud(changed), false);
  const cleared = removeLocalImage(changed, 'hero');
  assert.equal(cleared.sections[1].image, '');
  assert.equal(Object.hasOwn(cleared.sections[1], 'media'), false);
  assert.equal(supportsProductionCloud(cleared), true);
  assert.equal(changed.sections[1].image, 'fixture-bytes');
});
