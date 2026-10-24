import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { templateProducts } from '../functions/_shared/platform/templateCatalog.ts';
const catalogPath = new URL('../products/templates/catalog.json', import.meta.url);
const rawCatalog = await readFile(catalogPath);
const catalog = JSON.parse(rawCatalog);
const sha256 = value => createHash('sha256').update(value).digest('hex');

test('Switchboard Developer new purchases use the approved $25 pilot price', () => {
  const selected = templateProducts.find(p => p.id === 'switchboard-developer-v1');
  assert.equal(selected.priceCents, 2500);
  assert.equal(selected.version, '1.0.3');
  for (const item of templateProducts.filter(p => p.id !== selected.id))
    assert.equal(item.priceCents, item.editionId === 'developer' ? 9900 : 12900);
});

test('all advertised source-edition prices agree with the server', () => {
  let checked = 0;
  for (const product of catalog.products) for (const edition of product.editions.filter(e => ['developer', 'wordpress'].includes(e.platform))) {
    const server = templateProducts.find(p => p.id === edition.id);
    assert.ok(server, edition.id);
    assert.equal(server.priceCents, edition.draftPriceCents, edition.id);
    checked++;
  }
  assert.equal(checked, 8);
});

test('both release manifests retain the package and updated catalog identity', async () => {
  const manifests = await Promise.all(['products/templates/release-manifest.json', 'artifacts/templates/release-manifest.json'].map(p => readFile(new URL('../' + p, import.meta.url), 'utf8')));
  assert.equal(manifests[0], manifests[1]);
  for (const source of manifests) {
    const manifest = JSON.parse(source);
    assert.equal(manifest.catalog.sha256, sha256(rawCatalog));
    assert.equal(manifest.catalog.bytes, rawCatalog.length);
    const edition = manifest.products.find(p => p.slug === 'switchboard').editions.find(e => e.id === 'switchboard-developer-v1');
    assert.equal(edition.draftPriceCents, 2500);
    assert.equal(edition.version, '1.0.3');
    assert.equal(edition.package.sha256, 'e956fc2aad4f76ed0ff2c9aff71cdd6cfc202b0701da71c9bf9604e5264b00d5');
    assert.equal(edition.package.bytes, 28560);
    assert.equal(manifest.saleEnabled, false);
  }
});

