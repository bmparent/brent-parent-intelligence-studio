import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTemplatePreviewPin, verifyTemplateCatalogPin } from './template-preview-pin.mjs';
const pin = { siteOrigin: 'https://eidosworks-templates-test-20261010.pages.dev', mode: 'test', deploymentId: 'dpl_fixture', backendOrigin: 'https://fixture.vercel.app', backendSha: 'a'.repeat(40), bundleHash: 'b'.repeat(64), sourceRevision: 'a'.repeat(40) + '-bundle-' + 'b'.repeat(16) };
test('candidate configuration refuses production, unpinned sources and backend URLs with credentials or query strings', () => {
  assert.equal(validateTemplatePreviewPin(pin).mode, 'test');
  for (const change of [{ mode: 'live' }, { siteOrigin: 'https://eidos-works.com' }, { backendOrigin: 'https://evil.example' }, { backendOrigin: 'https://user:pass@fixture.vercel.app' }, { backendOrigin: 'https://fixture.vercel.app?token=fixture' }, { sourceRevision: 'unknown' }]) assert.throws(() => validateTemplatePreviewPin({ ...pin, ...change }));
});
test('hosted catalog must match the exact source, edition, price and installation allowlist before relay promotion', () => {
  const products = [{ id: 'switchboard-developer-v1', editionId: 'developer', version: '1.0.3', priceCents: 9900 }, { id: 'switchboard-wordpress-v1', editionId: 'wordpress', version: '1.0.3', priceCents: 12900 }];
  const data = { mode: 'test', ready: true, sourceRevision: pin.sourceRevision, editions: products.map(item => ({ ...item, available: item.editionId === 'developer' })) };
  verifyTemplateCatalogPin(pin, data, products);
  for (const change of [{ mode: 'live' }, { ready: false }, { sourceRevision: 'older-source' }, { editions: [] }, { editions: data.editions.map(item => ({ ...item, available: true })) }, { editions: data.editions.map(item => ({ ...item, version: '1.0.0' })) }]) assert.throws(() => verifyTemplateCatalogPin(pin, { ...data, ...change }, products));
});
