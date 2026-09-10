import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProject, upgradeProject, validateProject } from '../src/playground/model';
import { enableComposition } from '../src/playground/composition';
import { defaultMedia } from '../src/playground/media';
import { supportsProductionCloud } from '../src/playground/releaseBoundary';
import { saveProject } from '../functions/_shared/platform/playground';
import type { PlatformEnv } from '../functions/_shared/platform/core';

test('editor release keeps legacy cloud projects available after validation and JSON roundtrip', () => {
  for (const template of ['landing', 'homepage', 'portfolio'] as const) {
    const project = createProject(template);
    assert.equal(supportsProductionCloud(project), true);
    assert.equal(supportsProductionCloud(validateProject(JSON.parse(JSON.stringify(project)))), true);
  }
});
test('editor release blocks new formats without mutating them', () => {
  const original = createProject(), snapshot = JSON.stringify(original);
  assert.equal(supportsProductionCloud(upgradeProject(original)), false);
  const spatial = enableComposition(original), spatialSnapshot = JSON.stringify(spatial);
  assert.equal(supportsProductionCloud(spatial), false);
  assert.equal(JSON.stringify(original), snapshot);
  assert.equal(JSON.stringify(spatial), spatialSnapshot);
});
test('new media and structural fields cannot bypass the client boundary under a legacy version', () => {
  const original = createProject();
  const media = { ...original, sections: original.sections.map(section => section.id === 'hero' ? { ...section, media: defaultMedia() } : section) };
  assert.equal(supportsProductionCloud(media), false);
  assert.equal(supportsProductionCloud({ ...original, brand: {} } as typeof original), false);
  assert.equal(supportsProductionCloud({ ...original, sections: original.sections.map(section => ({ ...section, type: 'hero' as const })) }), false);
});
test('Pages Functions reject new-format cloud writes before accessing any database', async () => {
  const original = createProject();
  const media = { ...original, sections: original.sections.map(section => section.id === 'hero' ? { ...section, media: defaultMedia() } : section) };
  for (const document of [upgradeProject(original), enableComposition(original), media]) {
    await assert.rejects(saveProject({} as PlatformEnv, 'test-owner', { document }), /new editor format/);
  }
});
