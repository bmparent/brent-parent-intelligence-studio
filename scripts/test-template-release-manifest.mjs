import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createReleaseManifest, mirrorCapacity, MIRROR_RESERVE_BYTES, sha256, validatePackage } from './build-template-release-manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFile(path.join(root, relative), 'utf8').then(JSON.parse);
const manifest = await createReleaseManifest(root);
const catalog = await read('products/templates/catalog.json');
const saved = await read('products/templates/release-manifest.json');
const frozen = {
  'switchboard-developer-v1': '5ceb3e123ebd531d8b3d1bd113f3f135296c0a8dd7d320959afb0285cef70678',
  'switchboard-wordpress-v1': 'da30119d1d3e65f44c75dc24cb677b8dcb5a5517c6f68aea0bbcc78590a43abb',
  'tideglass-developer-v1': '34130b106526fa76a380efcdb2e2a1126bf3e05524c036246a227ce5d85f16a7',
  'tideglass-wordpress-v1': '4881c5d5ad34258454c8f542819f5ef0b469b80e72abd61a785f69d77b6ae785',
  'matter-developer-v1': 'f5083b4ffad9d99d9ffaf04f1d887f9feada6a4f4732f38aca19432b7ac515d6',
  'matter-wordpress-v1': '3fa8fe6902085b3bf2f06a9bdc51e14b861d9e1764a26d0c95d7f856beb415fe',
  'nightjar-developer-v1': '99152f05e391a81b4290dc9e08cb0a8c45689f1a17d98f726646c85eec15eb4d',
  'nightjar-wordpress-v1': '558a42d695338fc94df90968fcf643d155e84767a33ff150c41c9534a7e49739',
};

test('release manifest joins exactly eight unchanged private buyer archives', () => {
  assert.equal(manifest.packages.length, 8);
  assert.deepEqual(manifest.packages.map(item => [item.editionId, item.sha256]), saved.packages.map(item => [item.editionId, item.sha256]));
  for (const archive of manifest.packages) {
    assert.equal(archive.sha256, frozen[archive.editionId]);
    assert.equal(archive.version, archive.platform === 'wordpress' ? '1.0.1' : archive.product === 'nightjar' ? '1.0.3' : archive.product === 'switchboard' ? '1.0.1' : '1.0.0');
    assert.equal(archive.distribution, 'private-fulfillment-only');
    for (const file of ['LICENSE.txt', 'SUPPORT.md', 'ASSETS.md', 'INSTALL.md']) assert.ok(archive.documentationAndAssets.some(item => item.path.endsWith(`/${file}`)));
    assert.ok(archive.documentationAndAssets.some(item => item.path.includes('/assets/')));
    assert.equal(archive.support.installationGuidanceDays, 30);
    assert.equal(archive.support.suppliedFileDefectDays, 90);
    assert.equal(archive.changelog[0].status, 'candidate');
    assert.equal(archive.changelog[0].version, archive.version);
  }
});

test('catalog presentation records retain prior UI strings and public prices remain drafts', () => {
  const expected = {
    switchboard: ['Services', 'Crisp & practical', 'A clearer path to the next inquiry.', 'A useful place to start.'],
    tideglass: ['Hospitality', 'Quiet & atmospheric', 'Room to slow down. A clear way to stay.', 'Stay a little longer.'],
    matter: ['Makers', 'Warm & editorial', 'Let the details do the talking.', 'Made with intention.'],
    nightjar: ['Culture & events', 'Bold & expressive', 'Find your people. Find your next night.', 'Meet after dark.'],
  };
  assert.equal(manifest.products.length, 4);
  for (const product of catalog.products) {
    assert.deepEqual([product.market, product.visualStyle, product.tagline, product.designDirection.artCaption], expected[product.slug]);
    for (const field of ['structure', 'typography', 'visualLanguage', 'navigation', 'interaction']) assert.ok(product.designDirection[field]);
    for (const edition of product.editions) assert.equal(edition.draftPriceCents, edition.platform === 'developer' ? 9900 : edition.platform === 'wordpress' ? 12900 : 2900);
  }
  assert.equal(manifest.saleEnabled, false);
  for (const edition of manifest.products.flatMap(product => product.editions)) {
    assert.equal(edition.releaseStatus, 'unavailable');
    assert.equal(edition.commercialAvailability, 'unavailable');
    assert.equal(edition.priceIds, null);
    assert.match(edition.priceIdsReason, /server-owned/);
  }
});

test('WordPress acceptance stays incomplete with version provenance and GPL rights', () => {
  for (const product of manifest.products) {
    const edition = product.editions.find(item => item.platform === 'wordpress');
    assert.equal(edition.compatibility.acceptance, 'incomplete');
    assert.ok(Object.hasOwn(edition.compatibility.actualTestedVersions, 'wordpress'));
    assert.equal(edition.compatibility.browserPlaygroundStatus, 'partial');
    assert.equal(edition.compatibility.browserPlaygroundChecks.final_exact_zip_activation, 'passed');
    assert.equal(edition.compatibility.installedThemeMetadata.version, '1.0.1');
    assert.equal(edition.compatibility.installedThemeMetadata.update_uri, `https://eidos-works.com/shop/templates/${product.slug}/`);
    assert.notEqual(edition.compatibility.baselineNativeContentProof.archive_sha256, edition.package.sha256);
    assert.equal(edition.compatibility.baselineNativeContentProof.checks.native_heading_edit_publish, 'passed');
    assert.equal(edition.compatibility.cliStatus, 'blocked_before_installation');
    const archive = manifest.packages.find(item => item.editionId === edition.id);
    assert.equal(archive.license.identifier, 'GPL-2.0-or-later');
    assert.ok(archive.documentationAndAssets.some(item => item.path.endsWith('/COPYING')));
  }
});

test('archive mismatch and existing-version mutation are rejected without writing bytes', () => {
  const bytes = Buffer.from('negative control');
  assert.throws(() => validatePackage(bytes, { editionId: 'test', sha256: '0'.repeat(64), bytes: bytes.length }), /receipt mismatch/);
  const expected = { editionId: 'test', sha256: sha256(bytes), bytes: bytes.length };
  assert.throws(() => validatePackage(bytes, expected, { ...expected, sha256: '0'.repeat(64) }), /Frozen package changed/);
});

test('Drive mirror reserves 64 MiB and skips unknown or insufficient capacity', () => {
  assert.equal(mirrorCapacity(1_000_000, 11_000_000).sufficient, false);
  assert.equal(mirrorCapacity(1_000_000, null).sufficient, false);
  assert.equal(mirrorCapacity(1_000_000, MIRROR_RESERVE_BYTES + 1_000_000).sufficient, true);
});

test('clean checkout test command builds ignored archives before integrity and SSR tests', async () => {
  const pkg = await read('package.json');
  assert.match(pkg.scripts['test:templates'], /^npm run templates:build &&/);
  assert.match(pkg.scripts['templates:build'], /build-template-release-manifest\.mjs/);
  const adapter = await fs.readFile(path.join(root, 'src/data/templateCatalog.ts'), 'utf8');
  assert.match(adapter, /market: product\.market/);
  assert.match(adapter, /style: product\.visualStyle/);
  assert.match(adapter, /line: product\.tagline/);
  assert.match(adapter, /art: product\.designDirection\.artCaption/);
});
