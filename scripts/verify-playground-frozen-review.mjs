import { launchOptions, guardLocalEditor } from './playground-local-browser-guard.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { readLocalZip } from './playground-local-browser-guard.mjs';
import { hashBytes } from '../src/playground/purchaseSnapshot.ts';
const require = createRequire(import.meta.url), pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_REVIEW_URL || 'http://127.0.0.1:4173/playground/';
const out = process.env.PG_REVIEW_EVIDENCE || 'artifacts/playground-unified/frozen-review';
await mkdir(out, { recursive: true });
const receipt = { kind: (process.env.PG_ENGINE||'chromium')+' frozen review; no server order, payment, mail, or entitlement acceptance', base, checks: [], failures: [], errors: [], apiRequests: [] };
const engine = process.env.PG_ENGINE || 'chromium';
const browser = await pw[engine].launch(launchOptions(engine));
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
const page = await context.newPage(); page.setDefaultTimeout(15000);
page.on('pageerror', error => receipt.errors.push(error.message));
page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) receipt.apiRequests.push(request.url()); });
await page.route('**/template-demos/**/assets/**', route => route.abort());
const read = (dbName, storeName, key) => page.evaluate(({ dbName, storeName, key }) => new Promise((resolve, reject) => {
  const request = indexedDB.open(dbName, 1);
  request.onsuccess = () => { const db = request.result, read = db.transaction(storeName).objectStore(storeName).get(key); read.onsuccess = () => { resolve(read.result || null); db.close(); }; read.onerror = () => reject(read.error); };
  request.onerror = () => reject(request.error);
}), { dbName, storeName, key });
const saved = async () => { await page.locator('.pg-save-inline').filter({ hasText: 'Saved on this device' }).waitFor(); return read('eidos-playground-v1', 'workspace', 'current'); };
const reviewHead = documentId => read('eidos-playground-reviews-v1', 'packages', 'document:' + documentId);
const review = async documentId => { const head = await reviewHead(documentId); return read('eidos-playground-reviews-v1', 'packages', 'snapshot:' + head); };
const openFinish = () => page.getByRole('button', { name: 'Finish', exact: true }).click();
const closeFinish = () => page.getByRole('button', { name: 'Close finish review' }).click();
async function downloadZip(name) { const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download page package', exact: true }).click(); const download = await pending; await download.saveAs(out + '/' + name + '.zip'); return new Uint8Array(await readFile(out + '/' + name + '.zip')); }
async function check(name, action) { try { await action(); receipt.checks.push(name); console.log('PASS ' + name); } catch (error) { receipt.failures.push({ name, error: error.message }); await page.screenshot({ path: out + '/failure.png', fullPage: true }); throw error; } }
try {
  const assertLocalOnly = await guardLocalEditor(page);await page.goto(base); await page.getByRole('heading', { name: 'What are you making?' }).waitFor();
  await check('missing bundled artwork does not block an uploaded-photo starter', async () => {
    await page.getByRole('button', { name: /Switchboard/ }).click();
    await page.getByLabel('Business or project name').fill('Frozen version A');
    const png = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 600; const context = canvas.getContext('2d'); context.fillStyle = '#326453'; context.fillRect(0, 0, 800, 600); return canvas.toDataURL().split(',')[1]; });
    await page.locator('.pg-start-uploads input[type=file]').nth(1).setInputFiles({ name: 'own-photo.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
    await page.getByText('Image added. You can adjust it in the editor.').waitFor();
    await page.getByRole('button', { name: 'Create project' }).click(); await page.locator('.pg-unified').waitFor();
    const value = await saved(); assert.equal(value.project.name, 'Frozen version A'); assert.ok(JSON.stringify(value.project).includes('data:image/'));
  });
  const first = await saved(); let frozen, firstZip;
  await check('Finish freezes exact editable source and local archive, with true desktop and mobile review sizes', async () => {
    await openFinish(); await page.getByText('Parent edition reference (optional)', { exact: true }).click();
    await page.getByLabel('Parent developer edition').selectOption('switchboard-developer-v1');
    await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click();
    await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).waitFor();
    frozen = await review(first.documentId);
    assert.deepEqual(frozen.snapshot.project, first.project); assert.equal(frozen.snapshot.revision, first.revision);
    assert.equal(frozen.snapshot.parent.editionId, 'switchboard-developer-v1');
    assert.equal(await page.getByRole('button', { name: /purchase|checkout|recovery/i }).count(), 0);
    const frame = page.frameLocator('iframe[title="Frozen package preview"]');
    await frame.getByRole('heading', { level: 1 }).waitFor();
    assert.equal(await frame.locator('body').evaluate(() => innerWidth), 1280);
    assert.equal(await frame.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
    await page.screenshot({ path: out + '/desktop-review.png', fullPage: true });
    await page.locator('.pg-finish-device').getByRole('button', { name: 'Mobile', exact: true }).click();
    await page.waitForTimeout(100); assert.equal(await frame.locator('body').evaluate(() => innerWidth), 390);
    await page.screenshot({ path: out + '/mobile-review.png', fullPage: true });
    await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
    firstZip = await downloadZip('revision-a');
    assert.equal(await hashBytes(firstZip), frozen.receipt.archiveSha256);
    const files = await readLocalZip(firstZip), editable = JSON.parse(new TextDecoder().decode(files.find(file => file.name === 'project.json').data));
    assert.deepEqual(editable, first.project); receipt.initialSnapshotHash = frozen.snapshot.snapshotHash; receipt.initialArchiveSha256 = frozen.receipt.archiveSha256;
  });
  await check('later draft edits and reload preserve the exact frozen revision and download', async () => {
    await closeFinish(); await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Newer draft B'); await saved();
    await openFinish(); await page.getByText(/Your draft is now revision/).waitFor();
    assert.equal((await review(first.documentId)).snapshot.snapshotHash, frozen.snapshot.snapshotHash);
    assert.deepEqual(await downloadZip('revision-a-after-edit'), firstZip);
    await page.reload(); await page.getByRole('button', { name: /Continue project/ }).click(); await saved(); await openFinish();
    await page.getByText(/Your draft is now revision/).waitFor();
    assert.equal((await review(first.documentId)).snapshot.snapshotHash, frozen.snapshot.snapshotHash);
    await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
    assert.deepEqual(await downloadZip('revision-a-after-reload'), firstZip);
  });
  await check('explicit new review advances to the newer draft while retaining the previous frozen record', async () => {
    await page.getByRole('button', { name: 'Prepare current draft again' }).click();
    await page.getByText(/This review matches draft revision/).waitFor();
    const next = await review(first.documentId); assert.equal(next.snapshot.project.name, 'Newer draft B'); assert.notEqual(next.snapshot.snapshotHash, frozen.snapshot.snapshotHash);
    assert.equal((await read('eidos-playground-reviews-v1', 'packages', 'snapshot:' + frozen.snapshot.snapshotHash)).receipt.archiveSha256, frozen.receipt.archiveSha256);
    assert.equal(await page.getByRole('button', { name: 'Download page package', exact: true }).isDisabled(), true, 'new review requires explicit approval again');
  });
  await check('truncated embedded image cannot freeze or replace a prior valid package', async () => {
    await closeFinish(); const current = await saved(), broken = structuredClone(current.project);
    broken.sections[0].image = 'data:image/png;base64,iVBORw0KGgo='; broken.sections[0].alt = 'Truncated image';
    await page.getByRole('button', { name: 'Project', exact: true }).click();
    await page.locator(".pg-project-tools input[accept='.json,application/json']").setInputFiles({ name: 'broken-image.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(broken)) });
    await page.locator('.pg-toast').filter({ hasText: 'Project imported' }).waitFor();
    const imported = await saved(); await openFinish(); await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: /PNG image is incomplete/ }).waitFor();
    assert.equal(await reviewHead(imported.documentId), null); assert.ok(await reviewHead(first.documentId));
  });
  await assertLocalOnly();await check('frozen preparation does not call a payment, mail, AI, storage, or provider API', async () => { assert.deepEqual(receipt.apiRequests, []); assert.deepEqual(receipt.errors, []); });
} catch (error) { receipt.error = error.message; process.exitCode = 1; }
finally { await browser.close(); receipt.timestamp = new Date().toISOString(); await writeFile(out + '/receipt.json', JSON.stringify(receipt, null, 2) + '\n'); console.log(JSON.stringify(receipt, null, 2)); }
