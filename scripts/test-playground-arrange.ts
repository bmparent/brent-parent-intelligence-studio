import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/playground/model';
import { applyBlockOperation, enableBlocks } from '../src/playground/authoring';
import { blockLayoutPatch, moveBlockStep } from '../src/playground/blockArrange';
import { workspace, workspaceReducer } from '../src/playground/workspace';
const root = (p: ReturnType<typeof createProject>) => p.sections.find(s => s.authoring)!.authoring!.root;

test('arrange steps preserve identity and responsive structure with single-step Undo/Redo', () => {
 const before = enableBlocks(createProject()), id = root(before).children![1].id;
 const after = moveBlockStep(before, id, 1);
 assert.equal(root(after).children![2].id, id);
 assert.deepEqual(moveBlockStep(after, id, -1), before);
 const state = workspaceReducer(workspace(before, 'arrange'), { type: 'edit', project: after, time: 1 });
 assert.deepEqual(workspaceReducer(state, { type: 'undo' }).current.project, before);
 assert.deepEqual(workspaceReducer(workspaceReducer(state, { type: 'undo' }), { type: 'redo' }).current.project, after);
 assert.equal(moveBlockStep(before, root(before).children![0].id, -1), before);
 assert.equal(moveBlockStep(before, root(before).children!.at(-1)!.id, 1), before);
 assert.equal(moveBlockStep(before, root(before).id, 1), before);
});

test('layout presets preserve unrelated mobile overrides and desktop values', () => {
 let project = enableBlocks(createProject());
 const id = root(project).id;
 project = applyBlockOperation(project, { type: 'patch', id, patch: { gap: 30, align: 'left', mobile: { width: 80, layout: 'row' } } });
 const changed = applyBlockOperation(project, { type: 'patch', id, patch: blockLayoutPatch(root(project), true, { gap: 48, align: 'center' }) });
 assert.equal(root(changed).gap, 30); assert.equal(root(changed).align, 'left');
 assert.deepEqual(root(changed).mobile, { width: 80, layout: 'row', gap: 48, align: 'center' });
 const desktop = applyBlockOperation(changed, { type: 'patch', id, patch: blockLayoutPatch(root(changed), false, { gap: 12 }) });
 assert.equal(root(desktop).gap, 12); assert.deepEqual(root(desktop).mobile, root(changed).mobile);
});
