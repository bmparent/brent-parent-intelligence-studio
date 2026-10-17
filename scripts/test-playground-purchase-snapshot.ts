import test from 'node:test';
import assert from 'node:assert/strict';
import { createStarter } from '../src/playground/starters';
import { createProject, validateProject, mediaSlots } from '../src/playground/model';
import { exportFiles } from '../src/playground/export';
import { canonicalJson, createProjectSnapshot, validateProjectSnapshot, buildFrozenPackage, verifyFrozenPackage, hashBytes, digestFiles, isCurrentReview, parentEditions, rasterBytes, frozenPreviewDocument } from '../src/playground/purchaseSnapshot';
import { execFileSync } from 'node:child_process';
// Independently inspect the archive with Python's standard ZIP reader.
function readLocalZip(archive: Uint8Array) {
  const result = execFileSync('python3', ['-c', 'import sys,io,zipfile,json,base64; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); print(json.dumps([{"name":n,"data":base64.b64encode(z.read(n)).decode()} for n in z.namelist()]))'], { input: archive });
  return (JSON.parse(result.toString()) as {name:string;data:string}[]).map(file => ({name:file.name,data:new Uint8Array(Buffer.from(file.data,'base64'))}));
}
import { createArtwork, newArtworkObject } from '../src/playground/artworkSchema';

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aLTsAAAAASUVORK5CYII=';
const starter = () => createStarter({ starter: 'switchboard', goal: 'business', action: 'contact', name: 'Reviewed design' }, pixel);
const text = (value: Uint8Array) => new TextDecoder().decode(value);
test('canonical identity is stable across object key order and binds document, revision, parent, and exact source', async () => {
  const source = starter(), before = JSON.stringify(source);
  const first = await createProjectSnapshot(source, 'document-a', 12);
  const reordered = Object.fromEntries(Object.entries(source).reverse());
  assert.deepEqual(await createProjectSnapshot(reordered as typeof source, 'document-a', 12), first);
  assert.equal(JSON.stringify(source), before);
  assert.equal(first.projectHash, await hashBytes(new TextEncoder().encode(canonicalJson(source))));
  assert.notEqual((await createProjectSnapshot(source, 'document-b', 12)).snapshotHash, first.snapshotHash);
  assert.notEqual((await createProjectSnapshot(source, 'document-a', 13)).snapshotHash, first.snapshotHash);
  const parent = await createProjectSnapshot(source, 'document-a', 12, parentEditions[0].editionId);
  assert.notEqual(parent.snapshotHash, first.snapshotHash);
  assert.deepEqual(parent.parent, parentEditions[0]);
  assert.equal(parent.parent?.license.grant, 'not-verified');
  assert.ok(parent.parent?.license.path.endsWith('/developer/LICENSE.txt'));
  assert.notEqual((await createProjectSnapshot({ ...source, name: 'Later name' }, 'document-a', 12)).projectHash, first.projectHash);
  await assert.rejects(() => createProjectSnapshot(source, '../escape', 12), /identity/);
  await assert.rejects(() => createProjectSnapshot(source, 'document-a', -1), /identity/);
  await assert.rejects(() => createProjectSnapshot(source, 'document-a', 1, 'forged-version'), /existing developer/);
});
test('frozen package contains byte-exact common exporter output, complete digests, original editable source and separate archive receipt', async () => {
  const snapshot = await createProjectSnapshot(starter(), 'stable-document', 6, parentEditions[0].editionId);
  const frozen = await buildFrozenPackage(snapshot), sourceFiles = exportFiles(snapshot.project);
  assert.equal(frozen.manifest.platform, 'developer');
  assert.equal(frozen.manifest.checkout, 'disabled');
  assert.equal(frozen.manifest.entitlement, 'not-verified');
  assert.equal(frozen.receipt.purchase, 'not-performed');
  for (const source of sourceFiles) assert.deepEqual(frozen.files.find(file => file.name === source.name)?.data, source.data, source.name);
  assert.deepEqual(readLocalZip(frozen.archive), frozen.files);
  assert.equal(frozen.receipt.archiveSha256, await hashBytes(frozen.archive));
  assert.equal(frozen.receipt.bytes, frozen.archive.length);
  assert.deepEqual(frozen.manifest.files, await digestFiles(frozen.files.filter(file => file.name !== 'PACKAGE_MANIFEST.json')));
  assert.ok(!frozen.files.some(file => /LICENSE|paid|original.*zip/i.test(file.name)), 'no purchased original or invented license grant');
  assert.match(text(frozen.files.find(file => file.name === 'PROVENANCE.md')!.data), /original archive is not included or modified/);
  const provenance = text(frozen.files.find(file => file.name === 'PROVENANCE.md')!.data);
  assert.match(provenance, /same reviewed artifact before and after any purchase/);
  assert.match(provenance, /Payment and entitlement are established separately by a verified order receipt, not by this ZIP/);
  assert.match(provenance, /licensed archive and notices are delivered separately and remain unmodified/);
  assert.ok(!provenance.includes('until server ownership'));
  assert.deepEqual(validateProject(JSON.parse(text(frozen.files.find(file => file.name === 'project.json')!.data))), snapshot.project);
  assert.deepEqual(await verifyFrozenPackage(structuredClone(frozen)), frozen);
  assert.deepEqual((await buildFrozenPackage(snapshot)).archive, frozen.archive, 'package bytes are deterministic');
});
test('editing draft B cannot alter frozen revision A, its preview, its source, or archive', async () => {
  const source = starter(), frozen = await buildFrozenPackage(await createProjectSnapshot(source, 'document-a', 3));
  const hash = frozen.receipt.archiveSha256, preview = frozenPreviewDocument(frozen);
  source.name = 'A newer draft'; source.sections[1].title = 'Different headline';
  mediaSlots(source).find(slot => slot.image)!.image = '';
  assert.equal(frozen.snapshot.project.name, 'Reviewed design');
  assert.equal(isCurrentReview(frozen.snapshot, 'document-a', 3), true);
  assert.equal(isCurrentReview(frozen.snapshot, 'document-a', 4), false);
  assert.equal(isCurrentReview(frozen.snapshot, 'document-b', 3), false);
  assert.equal(await hashBytes(frozen.archive), hash); assert.equal(frozenPreviewDocument(frozen), preview);
  assert.notEqual((await createProjectSnapshot(source, 'document-a', 4)).snapshotHash, frozen.snapshot.snapshotHash);
});
test('invalid snapshot hashes, extra fields, parent metadata and changed package bytes are rejected', async () => {
  const snapshot = await createProjectSnapshot(starter(), 'document-a', 1, parentEditions[0].editionId);
  await assert.rejects(() => validateProjectSnapshot({ ...snapshot, unexpected: 'no' }), /record/);
  await assert.rejects(() => validateProjectSnapshot({ ...snapshot, projectHash: '0'.repeat(64) }), /hash/);
  await assert.rejects(() => validateProjectSnapshot({ ...snapshot, revision: 2 }), /hash/);
  await assert.rejects(() => validateProjectSnapshot({ ...snapshot, parent: { ...snapshot.parent, version: '999' } }), /registry/);
  const frozen = await buildFrozenPackage(snapshot), changedFile = structuredClone(frozen);
  changedFile.files.find(file => file.name === 'index.html')!.data[0] ^= 1;
  await assert.rejects(() => verifyFrozenPackage(changedFile), /hash/);
  const changedArchive = structuredClone(frozen); changedArchive.archive[100] ^= 1;
  await assert.rejects(() => verifyFrozenPackage(changedArchive), /archive/);
  const changedSource = structuredClone(frozen); changedSource.snapshot.project.name = 'Not approved';
  await assert.rejects(() => verifyFrozenPackage(changedSource), /hash/);
  const extraFile = structuredClone(frozen); extraFile.files.push({ name: '../evil.html', data: new Uint8Array(0) });
  await assert.rejects(() => verifyFrozenPackage(extraFile), /Unsafe/);
});
test('embedded raster completeness, remote assets, unsafe links, file names, duplicate paths and unknown output models fail closed', async () => {
  assert.equal(rasterBytes(pixel).length, 68);
  for (const image of ['https://example.com/image.png', 'data:image/svg+xml;base64,PHN2Zy8+', pixel.slice(0, -8), 'data:image/png;base64,iVBORw0KGgo=']) {
    const source = starter(); mediaSlots(source).find(slot => slot.image)!.image = image;
    await assert.rejects(() => createProjectSnapshot(source, 'document-a', 1));
  }
  const source = starter(); source.sections[0].href = 'javascript:alert(1)';
  await assert.rejects(() => createProjectSnapshot(source, 'document-a', 1), /destination/);
  for (const name of ['../escape', '/root', 'assets/../../escape', 'assets\\evil.png', '.hidden', 'a:b', 'index.html\0']) await assert.rejects(() => digestFiles([{ name, data: new Uint8Array() }]), /Unsafe/);
  await assert.rejects(() => digestFiles([{ name: 'index.html', data: new Uint8Array() }, { name: 'INDEX.html', data: new Uint8Array() }]), /duplicate/);
  await assert.rejects(() => createProjectSnapshot({ ...starter(), schemaVersion: 999 } as never, 'doc', 1));
  await assert.rejects(() => createProjectSnapshot({ ...starter(), studios: { version: 1, active: 'effect' } }, 'doc', 1), /single-page/);
  const withInactiveArtwork = starter();
  withInactiveArtwork.studios = { version: 1, active: 'page', artwork: { ...createArtwork(), objects: [{ ...newArtworkObject('image'), image: 'data:image/png;base64,iVBORw0KGgo=' }] } };
  await assert.rejects(() => createProjectSnapshot(withInactiveArtwork, 'doc', 1), /PNG image is incomplete/, 'retained inactive studio image bytes are also checked');
});
test('text content is escaped in output; the frozen preview uses packaged local bytes with no network capability', async () => {
  const source = starter(); source.name = '<script>alert("bad")</script>';
  source.sections[0].title = '<img src=x onerror=alert(1)>';
  const frozen = await buildFrozenPackage(await createProjectSnapshot(source, 'document-a', 1));
  const html = text(frozen.files.find(file => file.name === 'index.html')!.data), preview = frozenPreviewDocument(frozen);
  assert.ok(!html.includes('<script>alert("bad")</script>'));
  assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
  assert.match(html, /&lt;script&gt;/);
  assert.match(preview, /Content-Security-Policy/); assert.match(preview, /default-src 'none'/);
  assert.ok(!preview.includes('src="assets/'));
  assert.ok(!preview.includes('href="styles.css"'));
  assert.ok(preview.includes(pixel));
});
test('legacy projects remain exportable and are preserved in their original supported schema', async () => {
  const old = createProject();
  const frozen = await buildFrozenPackage(await createProjectSnapshot(old, 'legacy-document', 0));
  assert.equal(frozen.snapshot.project.schemaVersion, 1);
  assert.deepEqual(frozen.snapshot.project, old);
});
