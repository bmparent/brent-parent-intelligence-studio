import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProject } from '../src/playground/model';
import { enableBlocks } from '../src/playground/authoring';
import { flattenNodes } from '../src/playground/authoringSchema';
import { placeElement, preferredContainer } from '../src/playground/elementPlacement';
import { exportFiles } from '../src/playground/export';

test('new flexible draft accepts a dropped element at an exact sibling position in one undoable project update', () => {
  const original = enableBlocks(createProject());
  const root = original.sections.find(s => s.id === 'hero')!.authoring!.root;
  const previousIds = root.children!.map(child => child.id);
  assert.equal(preferredContainer(original, 'hero', root.children![0].id), root.id);
  const placed = placeElement(original, 'text', root.id, previousIds[1]);
  const current = placed.project.sections.find(s => s.id === 'hero')!.authoring!.root;
  assert.equal(current.children![1].id, placed.nodeId);
  assert.equal(current.children![1].type, 'text');
  assert.equal(placed.sectionId, 'hero');
  assert.deepEqual(current.children!.filter(node => previousIds.includes(node.id)).map(node => node.id), previousIds);
  assert.deepEqual(original.sections.find(s => s.id === 'hero')!.authoring!.root.children!.map(node => node.id), previousIds);
  assert.equal(flattenNodes(current).length, flattenNodes(root).length + 1);
});

test('invalid destination cannot change a project; free pack includes a usable handoff', () => {
  const original = enableBlocks(createProject());
  const root = original.sections.find(s => s.id === 'hero')!.authoring!.root;
  const saved = JSON.stringify(original);
  assert.throws(() => placeElement(original, 'button', root.id, 'node-not-a-child'), /Destination/);
  assert.equal(JSON.stringify(original), saved);
  const files = exportFiles(original);
  const names = files.map(file => file.name);
  assert.ok(names.includes('index.html'));
  assert.ok(names.includes('project.json'));
  assert.ok(names.includes('AI-HANDOFF.md'));
  assert.ok(names.includes('NEXT-STEPS.md'));
  const nextSteps = new TextDecoder().decode(files.find(file => file.name === 'NEXT-STEPS.md')!.data);
  assert.match(nextSteps, /share this ZIP/);
  assert.match(nextSteps, /Tell Eidos Works what you want to improve/);
  assert.doesNotMatch(nextSteps, /Tell Brent/);
});
