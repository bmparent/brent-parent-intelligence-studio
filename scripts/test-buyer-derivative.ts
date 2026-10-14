import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import pins from '../src/data/buyerArchivePins.json';
import release from '../products/templates/release-manifest.json';
import { buyerFixture } from './buyer-derivative-fixture';
import { buildBuyerDerivative, buyerDerivativePreview, buyerPreviewLocation, readBuyerZip, sha256, verifyArchiveAgainstPin, verifyBuyerArchive } from '../src/templates/buyerDerivative';
import { zipFiles, type ExportFile } from '../src/playground/export';
import { validateConfiguration } from '../src/templates/configurator';

test('trusted public pins contain hashes only and match the current frozen developer release', async () => {
  for (const pin of pins) {
    const edition = release.products.find(product => product.slug === pin.family)!.editions.find(edition => edition.id === pin.editionId)!;
    assert.equal(pin.sha256, edition.package!.sha256); assert.equal(pin.bytes, edition.package!.bytes); assert.equal(pin.version, edition.version);
  }
  assert.ok(!(await readFile('src/data/buyerArchivePins.json', 'utf8')).includes('base64'));
});
test('four public synthetic family fixtures exercise deterministic adapters, preserving input and original notices', async () => {
  for (const family of ['switchboard', 'tideglass', 'matter', 'nightjar']) {
    const fixture = await buyerFixture(family), original = fixture.zip.slice();
    const base = await verifyArchiveAgainstPin(fixture.zip, fixture.metadata, fixture.pin);
    const config = validateConfiguration({ ...fixture.config, name: 'My $& studio', headline: 'A precise <idea>.', description: 'An original introduction.', contactEmail: 'studio@example.com' });
    const result = await buildBuyerDerivative(base, config), again = await buildBuyerDerivative(base, config);
    assert.equal(result.id, again.id); assert.equal(result.archiveHash, again.archiveHash); assert.deepEqual(result.archive, again.archive);
    assert.deepEqual(fixture.zip, original); assert.equal(await sha256(fixture.zip), fixture.pin.sha256);
    const changed = await buildBuyerDerivative(base, { ...config, headline: 'A changed idea.' }); assert.notEqual(changed.id, result.id);
    for (const name of ['LICENSE.txt', 'SUPPORT.md', 'ASSETS.md', 'INSTALL.md']) assert.deepEqual(result.files.find(file => file.name === name)!.data, fixture.files.get(name));
    assert.deepEqual(result.files.find(file => file.name === 'BASE_PACKAGE_MANIFEST.json')!.data, fixture.files.get('PACKAGE_MANIFEST.json'));
    const html = new TextDecoder().decode(result.files.find(file => file.name === 'index.html')!.data);
    assert.ok(html.includes(`Original synthetic ${family} layout.`)); assert.ok(html.includes('My $&amp; studio')); assert.ok(html.includes('A precise &lt;idea&gt;.')); assert.ok(!html.includes('assets/study-0.svg'));
    const preview = buyerDerivativePreview(result); assert.ok(!preview.includes('url("assets/')); assert.ok(preview.includes('data:image/svg+xml;base64,')); assert.ok(preview.lastIndexOf('Synthetic native control used') > preview.indexOf('</main>'), 'deferred family handlers must run after the body is parsed');
    assert.equal(result.manifest.commercialEntitlement, false); assert.equal(result.manifest.entitlementVerification, 'not_performed');
    for (const file of await readBuyerZip(result.archive)) assert.ok(result.files.some(output => output.name === file.name));
  }
});
test('page/module pruning, contact-disabled fallback, schema migrations and exact new inventory', async () => {
  const fixture = await buyerFixture(), base = await verifyArchiveAgainstPin(fixture.zip, fixture.metadata, fixture.pin);
  const config = validateConfiguration({ ...fixture.config, buyer: { ...fixture.config.buyer, pages: ['index.html', 'contact.html'], modules: [], motion: false } });
  const result = await buildBuyerDerivative(base, config), names = result.files.map(file => file.name);
  assert.ok(!names.includes('object.html')); assert.ok(!names.includes('collection.html')); assert.ok(names.includes('legal.html'));
  for (const file of result.files.filter(file => file.name.endsWith('.html'))) {
    const html = new TextDecoder().decode(file.data);
    for (const match of html.matchAll(/href="([^"?#]+\.html)(?:[?#][^"]*)?"/g)) assert.ok(names.includes(match[1]), `Dangling page: ${match[1]}`);
    assert.ok(!html.includes('<button type="button" data-material'));
  }
  const contact = new TextDecoder().decode(result.files.find(file => file.name === 'contact.html')!.data);
  assert.ok(contact.includes('<fieldset disabled>')); assert.ok(contact.includes('no inquiry will be sent'));
  assert.equal((result.manifest.files as { path: string }[]).length + 1, result.files.length);
  assert.ok(!(result.manifest.files as { path: string }[]).some(file => file.path === 'PACKAGE_MANIFEST.json'));
  const old = validateConfiguration({ ...config, schemaVersion: 2, buyer: undefined }); assert.equal(old.schemaVersion, 3); assert.ok(old.buyer.pages.includes('object.html'));
});
test('wrong hash, metadata, edition, missing source, malformed and unsupported archive paths refuse', async () => {
  const fixture = await buyerFixture();
  await assert.rejects(verifyBuyerArchive(fixture.zip, fixture.metadata, fixture.config), /pinned/, 'synthetic input cannot enter the public product pin registry');
  await assert.rejects(verifyArchiveAgainstPin(fixture.zip, { ...fixture.metadata, sha256: '0'.repeat(64) }, fixture.pin), /metadata/);
  await assert.rejects(verifyArchiveAgainstPin(fixture.zip, fixture.metadata, { ...fixture.pin, sha256: '0'.repeat(64) }), /pinned/);
  for (const options of [{ omit: 'LICENSE.txt' }, { manifestEditionId: 'wrong-edition' }]) {
    const malformed = await buyerFixture('matter', options); await assert.rejects(verifyArchiveAgainstPin(malformed.zip, malformed.metadata, malformed.pin), /missing|identity/);
  }
  const truncated = fixture.zip.slice(0, -10); await assert.rejects(readBuyerZip(truncated), /directory/);
  const encrypted = fixture.zip.slice(); new DataView(encrypted.buffer).setUint16(6, 1, true); await assert.rejects(readBuyerZip(encrypted), /encrypted/);
  const base = await verifyArchiveAgainstPin(fixture.zip, fixture.metadata, fixture.pin);
  await assert.rejects(buildBuyerDerivative(base, { ...fixture.config, editionVersion: '0.0.0' }), /unavailable|another/);
  assert.throws(() => validateConfiguration({ ...fixture.config, buyer: { ...fixture.config.buyer, pages: ['index.html', '../escape.html'] } }));
});
test('bounded ZIP parser refuses duplicate paths, traversal, and symbolic links directly', async () => {
  const data = new TextEncoder().encode('Public malicious test fixture. No paid source.');
  await assert.rejects(readBuyerZip(zipFiles([{ name: 'same.txt', data }, { name: 'same.txt', data }])), /duplicate/);
  await assert.rejects(readBuyerZip(zipFiles([{ name: '../escape.txt', data }])), /Unsafe/);
  const linked = zipFiles([{ name: 'link.txt', data }]);
  const view = new DataView(linked.buffer, linked.byteOffset, linked.byteLength);
  const central = 30 + 'link.txt'.length + data.length;
  assert.equal(view.getUint32(central, true), 0x02014b50);
  view.setUint32(central + 38, 0xa000 << 16, true);
  await assert.rejects(readBuyerZip(linked), /link/);
});
test('trusted synthetic archive pin cannot conceal wrong edition prefix or an embedded file hash mismatch', async () => {
  const fixture = await buyerFixture();
  async function verifyMutation(files: ExportFile[]) {
    const zip = zipFiles(files), pin = { ...fixture.pin, sha256: await sha256(zip), bytes: zip.length };
    return verifyArchiveAgainstPin(zip, { ...fixture.metadata, ...pin }, pin);
  }
  const source = await readBuyerZip(fixture.zip);
  await assert.rejects(verifyMutation(source.map(file => ({ ...file, name: file.name.replace(fixture.pin.editionId + '/', 'wrong-developer/') }))), /prefix/);
  const altered = source.map(file => file.name.endsWith('/index.html') ? { ...file, data: new TextEncoder().encode('Altered public synthetic source') } : file);
  await assert.rejects(verifyMutation(altered), /hashes/);
});
test('private preview retains bounded native search and anchor context without changing exported family handlers', async () => {
  const fixture = await buyerFixture('nightjar'), base = await verifyArchiveAgainstPin(fixture.zip, fixture.metadata, fixture.pin);
  const result = await buildBuyerDerivative(base, { ...fixture.config, name: 'window.location.search studio' });
  assert.deepEqual(buyerPreviewLocation(result, { file: 'contact.html', search: '?interest=film', hash: '#main' }), { file: 'contact.html', search: '?interest=film', hash: '#main' });
  for (const context of [{ file: '../contact.html' }, { file: 'missing.html' }, { file: 'contact.html', search: 'javascript:alert(1)' }, { file: 'contact.html', search: '?interest=film#main' }, { file: 'event.html', hash: '#x\n<script>' }, { file: 'event.html', search: '?' + 'x'.repeat(512) }]) assert.throws(() => buyerPreviewLocation(result, context));
  const preview = buyerDerivativePreview(result, 'contact.html', { search: '?interest=film', hash: '#main' });
  assert.ok(preview.includes('buyerPreviewSearch="?interest=film"'));
  assert.ok(preview.includes('search,hash'));
  assert.ok(preview.includes('scrollIntoView'));
  assert.ok(preview.includes('"brand": "window.location.search studio"'), 'user configuration strings stay byte-meaningful in preview');
  assert.deepEqual(result.files.find(file => file.name === 'script.js')!.data, fixture.files.get('script.js'));
});
