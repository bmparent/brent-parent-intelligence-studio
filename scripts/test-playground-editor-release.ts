import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProject, upgradeProject } from '../src/playground/model';
import { enableComposition } from '../src/playground/composition';
import { defaultMedia } from '../src/playground/media';
import { supportsProductionCloud } from '../src/playground/releaseBoundary';

test('editor release keeps the production legacy cloud format available', () => {
  for (const template of ['landing', 'homepage', 'portfolio'] as const) assert.equal(supportsProductionCloud(createProject(template)), true);
});
test('editor release blocks new formats from the old cloud backend without mutating them', () => {
  const original = createProject();
  const snapshot = JSON.stringify(original);
  assert.equal(supportsProductionCloud(upgradeProject(original)), false);
  const spatial = enableComposition(original);
  const spatialSnapshot = JSON.stringify(spatial);
  assert.equal(supportsProductionCloud(spatial), false);
  assert.equal(JSON.stringify(original), snapshot);
  assert.equal(JSON.stringify(spatial), spatialSnapshot);
});
test('new media and structural fields cannot bypass the boundary under a legacy version', () => {
  const original = createProject();
  const media = { ...original, sections: original.sections.map(section => section.id === 'hero' ? { ...section, media: defaultMedia() } : section) };
  assert.equal(supportsProductionCloud(media), false);
  assert.equal(supportsProductionCloud({ ...original, brand: {} } as typeof original), false);
  assert.equal(supportsProductionCloud({ ...original, sections: original.sections.map(section => ({ ...section, type: 'hero' as const })) }), false);
});
