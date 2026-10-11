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
  'switchboard-developer-v1': 'e56450de9adbac6320d9e2315601e1804d281fcf1b87dc0f95cef5ef8ae45e2a',
  'switchboard-wordpress-v1': 'f816acf68aee776ea32b5fa1fd1acece21bbbc9435c8087134fa7adde8099846',
  'tideglass-developer-v1': '34130b106526fa76a380efcdb2e2a1126bf3e05524c036246a227ce5d85f16a7',
  'tideglass-wordpress-v1': '09ec833380b3e1238888ff54442e34de4b882649bbddc7cca4a41625dbe153a5',
  'matter-developer-v1': 'f5083b4ffad9d99d9ffaf04f1d887f9feada6a4f4732f38aca19432b7ac515d6',
  'matter-wordpress-v1': 'bd0bec696ce1980ed1e08d624fd5ed1179c8d9e32faa07cc5eadf8a4e90c2bc8',
  'nightjar-developer-v1': 'd27d240bdab367b9b334ac574f9e68e75132701c93bc19422a200f77af53a1f8',
  'nightjar-wordpress-v1': '30a53df74f2a939015fae48ef6ac12d7ee2328a57e2074fd57ee0348150bf36d',
};

test('release manifest joins exactly eight unchanged private buyer archives', () => {
  assert.equal(manifest.packages.length, 8);
  assert.deepEqual(manifest.packages.map(item => [item.editionId, item.sha256]), saved.packages.map(item => [item.editionId, item.sha256]));
  for (const archive of manifest.packages) {
    assert.equal(archive.sha256, frozen[archive.editionId]);
    assert.equal(archive.version, '1.0.0');
    assert.equal(archive.distribution, 'private-fulfillment-only');
    for (const file of ['LICENSE.txt', 'SUPPORT.md', 'ASSETS.md', 'INSTALL.md']) assert.ok(archive.documentationAndAssets.some(item => item.path.endsWith(`/${file}`)));
    assert.ok(archive.documentationAndAssets.some(item => item.path.includes('/assets/')));
    assert.equal(archive.support.installationGuidanceDays, 30);
    assert.equal(archive.support.suppliedFileDefectDays, 90);
    assert.equal(archive.changelog[0].status, 'candidate');
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
