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
  "switchboard-developer-v1": "fdedca1246365fca69a0d8655c514c5c1dd5b7496dbf7e6f452d6a4ee4486f60",
  "switchboard-wordpress-v1": "f74b4d15813df931620dba299a135799f49db552beb589e5a09eb9286b8a2f93",
  "tideglass-developer-v1": "bb8e2b2527227b8a32275e962eb1879bb97c0ea6f05d84e5fc57adbb0d6df638",
  "tideglass-wordpress-v1": "7cfcf61b4e52f5a8a1621a9cd49d336f44994651d8c8bdf4745632e56663b21d",
  "matter-developer-v1": "e078512c70e741aa37cdbd4ecff3f37f8ff6e560e8ae8f4470fab38287e87779",
  "matter-wordpress-v1": "21d930dafce8aa475e22147920fc7e2df83aa51f47a2f46028d52507ba85f87b",
  "nightjar-developer-v1": "421ce16a8c023c113b0481f46ecc5d59cee937a5c9fe9033a30aed282d9bbaa1",
  "nightjar-wordpress-v1": "d236a691b9f1ecf87a32ac4b8df31900beddc78ed9351a45192447c37bda8f96"
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
