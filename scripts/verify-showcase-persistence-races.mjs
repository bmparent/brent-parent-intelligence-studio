import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SHOWCASE_BASE || 'http://127.0.0.1:5178';
const out = path.resolve(process.env.SHOWCASE_EVIDENCE || 'artifacts/showcase/persistence-races');
await mkdir(out, { recursive: true });
const hashes = async () => Object.fromEntries(await Promise.all(['src/playground/storage.ts', 'src/playground/useProject.ts'].map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
const receipt = { started: new Date().toISOString(), base, source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceFilesAtStart: await hashes(), browser: 'Chromium headless, GPU disabled, isolated browser contexts with actual IndexedDB', checks: [], errors: [] };
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
async function open() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
  page.setDefaultTimeout(20000); page.on('pageerror', error => receipt.errors.push(error.message)); page.on('dialog', dialog => dialog.accept());
  await page.goto(base + '/playground/?studio=effect', { waitUntil: 'domcontentloaded' }); await page.locator('.studio-app').waitFor(); await page.waitForFunction(() => !!window.eidosPlayground); await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor(); return { context, page };
}
async function delayNextAcquisition(page) {
  await page.evaluate(() => {
    const originalOpen = indexedDB.open, originalPut = IDBObjectStore.prototype.put;
    let delay = true; window.persistenceWrites = []; window.delayedOpenReady = false; window.manualSaveResult = null;
    window.restorePersistenceHooks = () => { indexedDB.open = originalOpen; IDBObjectStore.prototype.put = originalPut; };
    IDBObjectStore.prototype.put = function (value, ...args) { if (this.name === 'workspace') window.persistenceWrites.push({ name: value.project.name, variations: value.snapshots.map(s => s.name) }); return originalPut.call(this, value, ...args); };
    indexedDB.open = function (...args) {
      const request = originalOpen.apply(this, args);
      if (delay) {
        delay = false; let success;
        Object.defineProperty(request, 'onsuccess', { configurable: true, get: () => success, set: handler => { success = handler; } });
        request.addEventListener('success', event => { window.delayedOpenReady = true; window.releaseDelayedOpen = () => success.call(request, event); }, { once: true });
      }
      return request;
    };
  });
}
const read = page => page.evaluate(() => window.eidosPlayground.read());
async function readDisk(page) {
  return page.evaluate(() => new Promise((resolve, reject) => { const request = indexedDB.open('eidos-playground-v1', 1); request.onerror = () => reject(request.error); request.onsuccess = () => { const db = request.result, get = db.transaction('workspace').objectStore('workspace').get('current'); get.onerror = () => { db.close(); reject(get.error); }; get.onsuccess = () => { const value = get.result; db.close(); resolve(value); }; }; }));
}
async function check(name, callback) {
  const started = Date.now(); const { context, page } = await open();
  try { const detail = await callback(page); receipt.checks.push({ name, status: 'passed', milliseconds: Date.now() - started, detail }); console.log('PASS ' + name); }
  catch (error) { receipt.checks.push({ name, status: 'failed', message: error.stack }); process.exitCode = 1; await page.screenshot({ path: path.join(out, `failure-${receipt.checks.length}.png`) }).catch(() => {}); console.error('FAIL ' + name + ': ' + error.message); }
  finally { await context.close(); await writeFile(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
}
for (const mode of ['manual', 'autosave']) {
  await check(`delayed ${mode} database acquisition cannot overwrite switched project after its save`, async page => {
    await page.getByLabel('Project name', { exact: true }).fill('Document A'); await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor();
    await delayNextAcquisition(page);
    if (mode === 'manual') await page.evaluate(() => { const current = window.eidosPlayground.read(); window.pendingManualSave = window.eidosPlayground.save({ documentId: current.documentId, revision: current.revision }).then(result => { window.manualSaveResult = result; }); });
    else await page.getByLabel('Project name', { exact: true }).fill('Document A pending autosave');
    await page.waitForFunction(() => window.delayedOpenReady); const a = await read(page), next = { ...a.project, name: `Document B ${mode}` };
    await page.getByLabel('Import studio project', { exact: true }).setInputFiles({ name: 'document-b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(next)) });
    await page.waitForFunction(name => window.eidosPlayground?.read().project.name === name, next.name); const b = await read(page); assert.notEqual(a.documentId, b.documentId);
    await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor(); assert.equal((await readDisk(page)).project.name, next.name);
    await page.evaluate(() => window.releaseDelayedOpen()); if (mode === 'manual') await page.waitForFunction(() => window.manualSaveResult !== null); await page.waitForTimeout(100);
    const disk = await readDisk(page), writes = await page.evaluate(() => window.persistenceWrites); assert.equal(disk.project.name, next.name); assert.ok(writes.every(write => write.name === next.name), 'Obsolete A must never begin its put after B committed');
    if (mode === 'manual') assert.equal(await page.evaluate(() => window.manualSaveResult), false);
    await page.evaluate(() => window.restorePersistenceHooks()); await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await page.locator('.studio-app').waitFor(); await page.waitForFunction(name => window.eidosPlayground?.read().project.name === name, next.name); assert.equal((await read(page)).project.name, next.name);
    await page.screenshot({ path: path.join(out, `${mode}-project-b-reopened.png`), fullPage: false }); return { previousDocument: a.documentId, newDocument: b.documentId, writes, reopenedName: next.name, obsoleteWriteSuppressed: true };
  });
}
await check('variation creation invalidates a pending manual save of an older variation list', async page => {
  await delayNextAcquisition(page); await page.evaluate(() => { const current = window.eidosPlayground.read(); window.pendingManualSave = window.eidosPlayground.save({ documentId: current.documentId, revision: current.revision }).then(result => { window.manualSaveResult = result; }); }); await page.waitForFunction(() => window.delayedOpenReady);
  await page.getByLabel('Variation name', { exact: true }).fill('Keep this variation'); await page.getByRole('button', { name: 'Save variation', exact: true }).click(); await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor();
  assert.equal((await readDisk(page)).snapshots[0].name, 'Keep this variation'); await page.evaluate(() => window.releaseDelayedOpen()); await page.waitForFunction(() => window.manualSaveResult !== null); await page.waitForTimeout(100);
  const disk = await readDisk(page), writes = await page.evaluate(() => window.persistenceWrites); assert.equal(await page.evaluate(() => window.manualSaveResult), false); assert.equal(disk.snapshots[0].name, 'Keep this variation'); assert.ok(writes.every(write => write.variations.includes('Keep this variation')));
  await page.evaluate(() => window.restorePersistenceHooks()); await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByRole('button', { name: 'Restore Keep this variation', exact: true }).waitFor(); await page.screenshot({ path: path.join(out, 'variation-reopened.png'), fullPage: false }); return { writes, reopenedVariation: disk.snapshots[0].name };
});
receipt.finished = new Date().toISOString(); receipt.sourceFilesAtFinish = await hashes(); receipt.sourceChangedDuringRun = JSON.stringify(receipt.sourceFilesAtStart) !== JSON.stringify(receipt.sourceFilesAtFinish); await writeFile(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2)); await browser.close(); if (receipt.errors.length) process.exitCode = 1; console.log(JSON.stringify({ checks: receipt.checks.length, failures: receipt.checks.filter(c => c.status === 'failed').length, errors: receipt.errors, receipt: path.join(out, 'receipt.json') }));
