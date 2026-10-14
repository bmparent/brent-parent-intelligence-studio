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
  "switchboard-developer-v1": "e956fc2aad4f76ed0ff2c9aff71cdd6cfc202b0701da71c9bf9604e5264b00d5",
  "switchboard-wordpress-v1": "32843f35f7529f52d7573cf7163e6011f32dbc4fa583db2876586ceb23d4c300",
  "tideglass-developer-v1": "fbc3cda145707d08b3bb51751bb0265144b23c82e0b0170d899af9ea6b8918b0",
  "tideglass-wordpress-v1": "9220458a87ee9c31ce3b4af37eb57737cb460a3cb2db803ae5d7adadc6d16ccb",
  "matter-developer-v1": "8bd61d302b173b6143dcb2cbf1d111f8b5b283c6e19880f8792e20879297678d",
  "matter-wordpress-v1": "9874a5fbe19e6990d167931d251be0b36c6c27e8301efbee77b634eeb8400c6b",
  "nightjar-developer-v1": "9ea6419f5b0398e517e0195205464c44fcd7521071f7ee420c8472a4dc85f870",
  "nightjar-wordpress-v1": "55ac5a87a1ee363390d7053e6579be9568703397199e9b16b95f38f4a2085534"
};

test('release manifest joins exactly eight unchanged private buyer archives', () => {
  assert.equal(manifest.packages.length, 8);
  assert.deepEqual(manifest.packages.map(item => [item.editionId, item.sha256]), saved.packages.map(item => [item.editionId, item.sha256]));
  for (const archive of manifest.packages) {
    assert.equal(archive.sha256, frozen[archive.editionId]);
    const edition = catalog.products.find(item => item.slug === archive.product).editions.find(item => item.id === archive.editionId);
    assert.equal(archive.version, edition.version || '1.0.0');
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
    if (edition.compatibility.nativeApiStatus === 'passed') {
      assert.equal(edition.compatibility.browserPlaygroundStatus, 'historical-only');
      assert.equal(edition.compatibility.browserPlaygroundChecks, null, 'Native PHP APIs must not be labeled as browser UI proof');
      for (const check of ['final_exact_zip_activation', 'four_independent_database_document_root_baseline', 'native_heading_edit_publish', 'native_image_upload_publish', 'five_published_page_templates_and_navigation', 'core_site_editor_export_contains_saved_edits', 'graceful_database_and_php_restart', 'native_text_image_navigation_contact_persist_after_restart', 'minimum_wordpress_6_6_php_8_1_34']) assert.equal(edition.compatibility.nativeApiChecks[check], 'passed');
      assert.deepEqual(edition.compatibility.actualTestedVersions, { wordpress: '6.6', php: '8.1.34' });
      assert.equal(edition.compatibility.nativeDatabase.engine, 'MariaDB');
      assert.equal(edition.compatibility.nativeDatabase.version, '10.11.19');
      assert.equal(edition.compatibility.nativeDatabase.independent_databases, 4);
      assert.equal(edition.compatibility.installedThemeMetadata.version, edition.version);
      assert.match(edition.compatibility.nativeApiMethod, /Native PHP WordPress APIs/);
      assert.match(edition.compatibility.limits, /Fresh visual admin/);
    } else if (edition.compatibility.browserPlaygroundStatus === 'not_run') {
      assert.equal(edition.compatibility.browserPlaygroundChecks, null, 'Prior-version proof must not be attributed to new bytes');
      assert.equal(edition.compatibility.installedThemeMetadata, null);
    } else {
      assert.equal(edition.compatibility.browserPlaygroundChecks.final_exact_zip_activation, 'passed');
      assert.equal(edition.compatibility.installedThemeMetadata.version, edition.version);
      assert.equal(edition.compatibility.installedThemeMetadata.update_uri, `https://eidos-works.com/shop/templates/${product.slug}/`);
      if (edition.compatibility.baselineNativeContentProof) {
        assert.notEqual(edition.compatibility.baselineNativeContentProof.archive_sha256, edition.package.sha256);
        assert.equal(edition.compatibility.baselineNativeContentProof.checks.native_heading_edit_publish, 'passed');
      }
    }
    assert.match(edition.compatibility.cliStatus, /^blocked(?:_before_installation)?$/);
    assert.match(edition.compatibility.cliScope, /Historical Playground CLI/);
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
