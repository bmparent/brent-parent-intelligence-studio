import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SHOWCASE_BASE || 'http://127.0.0.1:5178';
const documentSwitchOnly = process.argv.includes('--document-switch-only');
const out = path.resolve(process.env.SHOWCASE_EVIDENCE || `artifacts/showcase/studio-details${documentSwitchOnly ? '/document-switch' : ''}`);
await mkdir(out, { recursive: true });
const receipt = { started: new Date().toISOString(), base, browser: 'Chromium headless; --disable-gpu', browserPlugin: 'not available; browser skill absent; existing Playwright used without installing dependencies', viewport: { width: 1600, height: 1200 }, source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checks: [], failures: [], pageErrors: [], console: [] };
const sourceFiles = ['src/playground/ArtworkStudio.tsx', 'src/playground/artworkRenderer.ts', 'src/playground/artworkSchema.ts', 'src/playground/MotionStudio.tsx', 'src/playground/motionRenderer.ts', 'src/playground/motionSchema.ts', 'src/playground/StudioWorkspace.tsx', 'src/playground/AgentCommands.tsx', 'src/playground/model.ts', 'src/playground/useProject.ts'];
const hashes = async () => Object.fromEntries(await Promise.all(sourceFiles.map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
receipt.sourceFilesAtStart = await hashes();
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'], timeout: 60000 });
const context = await browser.newContext({ viewport: receipt.viewport, acceptDownloads: true });
const page = await context.newPage(); page.setDefaultTimeout(20000);
page.on('pageerror', error => receipt.pageErrors.push(error.message));
page.on('console', message => { if (['error', 'warning'].includes(message.type())) receipt.console.push({ type: message.type(), text: message.text() }); });
page.on('dialog', dialog => dialog.accept());
const read = () => page.evaluate(() => window.eidosPlayground.read());
const set = (locator, value) => locator.evaluate((element, next) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, String(next)); element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true })); }, value);
const studio = async value => { await page.getByLabel('Studio', { exact: true }).selectOption(value); await page.locator(value === 'artwork' ? '.pg-artwork' : value === 'motion' ? '.pg-motion' : '.studio-effect').waitFor(); };
const download = async (button, name) => { const pending = page.waitForEvent('download'); await button.click(); const item = await pending; const destination = path.join(out, name); await item.saveAs(destination); return destination; };
const check = async (name, callback) => {
  if (documentSwitchOnly && !name.startsWith('pending artwork import across full project replacement')) return;
  try { const detail = await callback(); receipt.checks.push({ name, status: 'passed', detail: detail || null, time: new Date().toISOString() }); console.log('PASS ' + name); }
  catch (error) { receipt.failures.push({ name, message: error.stack, time: new Date().toISOString() }); console.error('FAIL ' + name + ': ' + error.message); await page.screenshot({ path: path.join(out, `failure-${receipt.failures.length}.png`), fullPage: false }).catch(() => {}); }
  await writeFile(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2));
};
const capture = async name => { await page.screenshot({ path: path.join(out, name), fullPage: false }); return name; };

try {
  await page.goto(base + '/playground/?studio=artwork', { waitUntil: 'domcontentloaded' });
  await page.locator('.pg-artwork').waitFor(); await page.waitForFunction(() => !!window.eidosPlayground);
  await check('page identity, meaningful studio, no error overlay', async () => { assert.ok((await page.title()).length > 0); assert.match(page.url(), /playground/); assert.equal(await page.locator('vite-error-overlay').count(), 0); assert.equal(await page.getByRole('heading', { name: 'Artwork Studio', exact: true }).count(), 2); return { url: page.url(), title: await page.title() }; });
  let artwork, pngPath, svgPath;
  await check('artwork upload, long/empty text, real variable font loading and opacity edit', async () => {
    await page.getByRole('button', { name: 'botanical poster', exact: true }).click();
    const png = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 80; canvas.height = 60; const c = canvas.getContext('2d'); c.fillStyle = '#2a4a38'; c.fillRect(0, 0, 80, 60); c.fillStyle = '#f2c371'; c.beginPath(); c.arc(40, 30, 20, 0, Math.PI * 2); c.fill(); return canvas.toDataURL('image/png'); });
    await writeFile(path.join(out, 'original-upload.png'), Buffer.from(png.split(',')[1], 'base64'));
    const before = (await read()).project.studios.artwork.objects.length;
    await page.locator('.pg-artwork .pg-upload input').setInputFiles(path.join(out, 'original-upload.png'));
    await page.waitForFunction(count => window.eidosPlayground.read().project.studios.artwork.objects.length === count + 1, before);
    assert.ok((await read()).project.studios.artwork.objects.at(-1).image.startsWith('data:image/'));
    await page.locator('.pg-artwork .pg-studio-object-list button').nth(1).click();
    const input = page.getByLabel('Artwork text', { exact: true });
    const long = '<&> ' + 'Original lettering and a useful composition. '.repeat(6); await input.fill(long.slice(0, 300)); assert.equal((await read()).project.studios.artwork.objects[1].text, long.slice(0, 300));
    await input.fill(''); assert.equal((await read()).project.studios.artwork.objects[1].text, '');
    await input.fill('A slower\nkind of living.');
    await set(page.getByRole('slider', { name: 'Font weight (wght)', exact: true }), 900); await set(page.getByRole('slider', { name: 'Optical size (opsz)', exact: true }), 40); await set(page.getByRole('slider', { name: 'Opacity', exact: true }), .42);
    await page.getByText('Use this output', { exact: true }).click(); await page.getByText('Bundled DM Sans ready', { exact: false }).waitFor();
    const loaded = await page.evaluate(() => Array.from(document.fonts).filter(f => f.family.includes('Eidos Studio DM Sans')).map(f => ({ family: f.family, status: f.status, weight: f.weight })));
    assert.ok(loaded.some(f => f.status === 'loaded')); artwork = (await read()).project.studios.artwork; assert.equal(artwork.objects[1].weight, 900); assert.equal(artwork.objects[1].opticalSize, 40); assert.equal(artwork.objects[1].opacity, .42);
    await writeFile(path.join(out, 'artwork.json'), JSON.stringify(artwork, null, 2)); await capture('artwork-editor-upload-type-opacity.png'); return { uploadedObjects: before + 1, fontFaces: loaded, axes: { wght: 900, opsz: 40 }, opacity: .42 };
  });
  await check('actual PNG dimensions and independent SVG/PNG appearance comparison', async () => {
    assert.ok(artwork, 'Artwork setup must pass');
    pngPath = await download(page.getByRole('button', { name: 'PNG', exact: true }), 'artwork.png'); svgPath = await download(page.getByRole('button', { name: 'SVG', exact: true }), 'artwork.svg');
    const bytes = await readFile(pngPath); assert.equal(bytes.readUInt32BE(16), artwork.width); assert.equal(bytes.readUInt32BE(20), artwork.height);
    const independent = await context.newPage(); independent.setDefaultTimeout(20000);
    await independent.goto(pathToFileURL(svgPath).href); await independent.evaluate(() => document.fonts.ready); await independent.locator('svg').screenshot({ path: path.join(out, 'svg-independent.png'), omitBackground: true });
    assert.equal(await independent.locator('script').count(), 0);
    const fontLoaded = await independent.evaluate(() => Array.from(document.fonts).map(f => ({ family: f.family, status: f.status }))); assert.ok(fontLoaded.some(f => f.status === 'loaded'));
    await independent.goto('about:blank'); await independent.setContent(`<style>html,body{margin:0;background:transparent}</style><img src="data:image/png;base64,${bytes.toString('base64')}" width="${artwork.width}" height="${artwork.height}">`); await independent.locator('img').evaluate(image => image.decode()); await independent.locator('img').screenshot({ path: path.join(out, 'png-independent.png'), omitBackground: true }); await independent.close();
    const comparison = await page.evaluate(async urls => {
      const pixels = async url => { const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext('2d');context.drawImage(image,0,0);return {width:image.width,height:image.height,data:context.getImageData(0,0,image.width,image.height).data}; };
      const a=await pixels(urls[0]),b=await pixels(urls[1]);if(a.width!==b.width||a.height!==b.height)throw Error('Image dimensions differ.');const totals=[0,0,0,0];for(let i=0;i<a.data.length;i++)totals[i%4]+=Math.abs(a.data[i]-b.data[i]);return {size:[a.width,a.height],mean_absolute_rgba:totals.map(n=>n/(a.width*a.height)),comparison:'Browser Canvas RGBA pixels; no Python image dependency'};
    }, await Promise.all(['svg-independent.png','png-independent.png'].map(async name=>'data:image/png;base64,'+(await readFile(path.join(out,name))).toString('base64'))));
    await writeFile(path.join(out, 'pixel-comparison.json'), JSON.stringify(comparison, null, 2));
    assert.ok(comparison.mean_absolute_rgba.slice(0, 3).every(value => value < 3), 'SVG and direct Canvas PNG differ materially; inspect paired images'); return { ...comparison, svgFonts: fontLoaded };
  });
  await check('artwork source reimport, local transaction and reload/reopen', async () => {
    assert.ok(artwork); await page.getByLabel('Artwork text', { exact: true }).fill('Temporary edit');
    await page.locator('.pg-artwork .pg-studio-file-button input').setInputFiles(path.join(out, 'artwork.json')); await page.locator('.studio-notice').filter({ hasText: 'Artwork source imported' }).waitFor();
    assert.deepEqual((await read()).project.studios.artwork, artwork);
    await page.getByRole('button', { name: 'Save locally', exact: true }).click(); await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor(); await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('.pg-artwork').waitFor(); assert.deepEqual((await read()).project.studios.artwork, artwork); return 'Editable source and entire device workspace reopened exactly';
  });
  await check('motion visible keyframe editing, Undo/Redo, duplicate and layer order', async () => {
    await studio('motion'); await set(page.getByRole('slider', { name: 'Timeline time', exact: true }), 1); await set(page.getByRole('slider', { name: 'Keyframe X', exact: true }), 42);
    const edited = (await read()).project.studios.motion; assert.equal(edited.objects[0].keyframes.find(f => f.time === 1).x, 42);
    await page.getByRole('button', { name: 'Undo', exact: true }).click(); assert.equal((await read()).project.studios.motion.objects[0].keyframes.some(f => f.time === 1), false);
    await page.getByRole('button', { name: 'Redo', exact: true }).click(); assert.equal((await read()).project.studios.motion.objects[0].keyframes.find(f => f.time === 1).x, 42);
    await page.getByRole('button', { name: 'Duplicate object', exact: true }).click(); const duplicate = (await read()).project.studios.motion.objects.at(-1).id; await page.getByRole('button', { name: 'Layer back', exact: true }).click(); assert.equal((await read()).project.studios.motion.objects[1].id, duplicate);
    await capture('motion-keyframe-duplicate-layer.png'); return { duplicateId: duplicate, keyframe: { time: 1, x: 42 } };
  });
  await check('motion playback, pause and reset respond visibly', async () => {
    await page.getByRole('button', { name: 'Reset playback', exact: true }).click(); await page.getByRole('button', { name: 'Play', exact: true }).click(); await page.waitForTimeout(550); await page.getByRole('button', { name: 'Pause', exact: true }).click(); const time = Number(await page.getByRole('slider', { name: 'Timeline time', exact: true }).inputValue()); assert.ok(time > .1); await page.waitForTimeout(200); assert.equal(Number(await page.getByRole('slider', { name: 'Timeline time', exact: true }).inputValue()), time); await page.getByRole('button', { name: 'Reset playback', exact: true }).click(); assert.equal(await page.getByRole('slider', { name: 'Timeline time', exact: true }).inputValue(), '0'); return { pausedAtSeconds: time, resetTo: 0 };
  });
  await check('motion downloaded HTML package plays independently from file URL', async () => {
    const zip = await download(page.getByRole('button', { name: 'Download animation ZIP', exact: true }), 'motion.zip'), extracted = path.join(out, 'motion-independent'); await mkdir(extracted, { recursive: true });
    execFileSync('python', ['-c', "import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);assert all('..' not in n and not n.startswith('/') for n in z.namelist());z.extractall(sys.argv[2])", zip, extracted]);
    const independent = await context.newPage(); await independent.goto(pathToFileURL(path.join(extracted, 'index.html')).href); await independent.evaluate(() => document.fonts.ready);
    const before = await independent.locator('[data-motion-id]').first().getAttribute('transform'); await independent.getByRole('button', { name: 'Play', exact: true }).click(); await independent.waitForTimeout(450); await independent.getByRole('button', { name: 'Pause', exact: true }).click(); const after = await independent.locator('[data-motion-id]').first().getAttribute('transform'); assert.notEqual(after, before);
    await independent.getByLabel('Speed', { exact: true }).selectOption('2'); await independent.getByRole('button', { name: 'Reset', exact: true }).click(); assert.equal(await independent.getByLabel('Time', { exact: true }).inputValue(), '0');
    await independent.screenshot({ path: path.join(out, 'motion-file-independent.png'), fullPage: false }); assert.match(independent.url(), /^file:/); await independent.close(); return { extracted, before, after, format: 'self-contained HTML animation; not a video' };
  });
  await check('motion JSON reimport, local save and reopen preserve edited keyframes', async () => {
    const saved = (await read()).project.studios.motion; const file = await download(page.getByRole('button', { name: 'Motion JSON', exact: true }), 'motion.json');
    await page.getByRole('button', { name: 'Restore motion example', exact: true }).click(); await page.locator('.pg-motion .pg-studio-file-button input').setInputFiles(file); await page.locator('.studio-notice').filter({ hasText: 'Motion source imported' }).waitFor(); assert.deepEqual((await read()).project.studios.motion, saved);
    await page.getByRole('button', { name: 'Save locally', exact: true }).click(); await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor(); await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await page.locator('.pg-motion').waitFor(); assert.deepEqual((await read()).project.studios.motion, saved); return { objects: saved.objects.length, duration: saved.duration };
  });
  await check('delayed artwork import cannot overwrite another selected studio/revision', async () => {
    await studio('artwork'); const before = (await read()).project.studios.artwork;
    await page.evaluate(() => { const original = File.prototype.text; window.restoreFileText = () => { File.prototype.text = original; }; File.prototype.text = async function () { if (this.name.startsWith('slow-')) await new Promise(resolve => setTimeout(resolve, 900)); return original.call(this); }; });
    await page.locator('.pg-artwork .pg-studio-file-button input').setInputFiles({ name: 'slow-artwork.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...before, palette: { ...before.palette, ink: '#ff00ff' } })) }); await studio('effect'); await page.locator('.studio-notice').filter({ hasText: 'Import ignored because the project changed' }).waitFor(); assert.deepEqual((await read()).project.studios.artwork, before); await page.evaluate(() => window.restoreFileText()); return 'Deferred import rejected by the initiating revision guard';
  });
  await check('delayed PNG cannot download a superseded project revision', async () => {
    await studio('artwork'); const downloads = []; const listener = item => downloads.push(item.suggestedFilename()); page.on('download', listener);
    await page.evaluate(() => { const original = HTMLCanvasElement.prototype.toBlob; window.restoreToBlob = () => { HTMLCanvasElement.prototype.toBlob = original; }; HTMLCanvasElement.prototype.toBlob = function (callback, ...args) { return original.call(this, blob => setTimeout(() => callback(blob), 1100), ...args); }; });
    await page.getByRole('button', { name: 'PNG', exact: true }).click(); await studio('effect'); await page.locator('.studio-notice').filter({ hasText: 'PNG ignored because the project changed' }).waitFor(); assert.deepEqual(downloads, []); page.off('download', listener); await page.evaluate(() => window.restoreToBlob()); return 'Superseded asynchronous PNG discarded before download';
  });
  await check('delayed upload cannot attach to another selected studio/revision', async () => {
    await studio('artwork'); const count = (await read()).project.studios.artwork.objects.length;
    await page.evaluate(() => { const original = HTMLImageElement.prototype.decode; window.restoreDecode = () => { HTMLImageElement.prototype.decode = original; }; HTMLImageElement.prototype.decode = async function () { await new Promise(resolve => setTimeout(resolve, 900)); return original.call(this); }; });
    await page.locator('.pg-artwork .pg-upload input').setInputFiles(path.join(out, 'original-upload.png')); await studio('effect'); await page.locator('.studio-notice').filter({ hasText: 'Upload ignored because the project changed' }).waitFor(); assert.equal((await read()).project.studios.artwork.objects.length, count); await page.evaluate(() => window.restoreDecode()); return 'Deferred image decode rejected by revision guard';
  });
  await check('pending artwork import across full project replacement cannot alter new document', async () => {
    await studio('artwork'); const before = await read(), next = { ...before.project, name: 'Different guarded project', studios: { ...before.project.studios, active: 'effect' } };
    await page.evaluate(() => { const original = File.prototype.text; window.restoreFileText = () => { File.prototype.text = original; }; File.prototype.text = async function () { if (this.name.startsWith('slow-')) await new Promise(resolve => setTimeout(resolve, 1000)); return original.call(this); }; });
    await page.locator('.pg-artwork .pg-studio-file-button input').setInputFiles({ name: 'slow-obsolete-artwork.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...before.project.studios.artwork, palette: { ...before.project.studios.artwork.palette, ink: '#ff00ff' } })) });
    await page.getByLabel('Import studio project', { exact: true }).setInputFiles({ name: 'new-project.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(next)) });
    await page.waitForFunction(() => window.eidosPlayground?.read().project.name === 'Different guarded project'); const opened = await read(); assert.notEqual(opened.documentId, before.documentId);
    await page.waitForTimeout(1300); const after = await read(); assert.equal(after.documentId, opened.documentId); assert.deepEqual(after.project.studios.artwork, before.project.studios.artwork); assert.equal(after.project.name, 'Different guarded project'); await page.evaluate(() => window.restoreFileText()); await capture('pending-import-new-document.png'); return { previousDocumentId: before.documentId, newDocumentId: after.documentId, stalePaletteDiscarded: true };
  });
  await check('same-turn stale local command and actual IndexedDB failure preserve backup and recovery', async () => {
    const stale = await page.evaluate(() => { const state = window.eidosPlayground.read(), request = { documentId: state.documentId, revision: state.revision, selected: 'hero', scope: 'section', proposal: { ops: [{ field: 'section.title', value: 'First bounded edit' }] } }; window.eidosPlayground.apply(request); try { window.eidosPlayground.apply({ ...request, proposal: { ops: [{ field: 'section.title', value: 'Obsolete second edit' }] } }); return 'accepted'; } catch (error) { return error.message; } }); assert.match(stale, /Stale/); await page.waitForFunction(() => window.eidosPlayground.read().project.sections.find(s => s.id === 'hero').title === 'First bounded edit');
    await page.evaluate(() => { const original = IDBObjectStore.prototype.put; window.restorePut = () => { IDBObjectStore.prototype.put = original; }; IDBObjectStore.prototype.put = function (...args) { if (this.name === 'workspace') throw new DOMException('Simulated quota exhaustion', 'QuotaExceededError'); return original.apply(this, args); }; const state = window.eidosPlayground.read(); window.eidosPlayground.apply({ documentId: state.documentId, revision: state.revision, selected: 'hero', scope: 'section', proposal: { ops: [{ field: 'section.title', value: 'Safe during failed save' }] } }); });
    await page.locator('.studio-save').filter({ hasText: 'Could not save on this device' }).waitFor(); await page.getByRole('button', { name: 'Save locally', exact: true }).click(); await page.locator('.studio-notice').filter({ hasText: 'Save did not complete' }).waitFor();
    const backup = await download(page.getByRole('button', { name: 'Download project JSON', exact: true }), 'save-failure-backup.json'); assert.equal(JSON.parse(await readFile(backup, 'utf8')).sections.find(s => s.id === 'hero').title, 'Safe during failed save'); await capture('indexeddb-save-failure-backup.png');
    await page.evaluate(() => window.restorePut()); await page.getByRole('button', { name: 'Save locally', exact: true }).click(); await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor(); return 'Second stale mutation denied; failed transaction visibly reported, JSON backup usable, explicit retry recovered';
  });
  await check('narrow phone width and reduced motion retain usable studio content', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: 'reduce' }); await studio('motion'); assert.equal(await page.getByRole('button', { name: 'Play', exact: true }).count(), 1); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false); await capture('motion-phone-reduced-motion.png'); await studio('artwork'); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false); await capture('artwork-phone.png'); return '390 × 844 browser viewport; reduced motion; no horizontal overflow (not physical-device proof)';
  });
  await check('console/runtime and final framework health', async () => { assert.equal(await page.locator('vite-error-overlay').count(), 0); assert.deepEqual(receipt.pageErrors, []); return { console: receipt.console }; });
} catch (error) { receipt.failures.push({ name: 'setup or top-level runtime', message: error.stack }); }
finally { receipt.finished = new Date().toISOString(); receipt.sourceFilesAtFinish = await hashes(); receipt.sourceChangedDuringRun = JSON.stringify(receipt.sourceFilesAtStart) !== JSON.stringify(receipt.sourceFilesAtFinish); await writeFile(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2)); await context.close(); await browser.close(); }
console.log(JSON.stringify({ passed: receipt.checks.length, failed: receipt.failures.length, receipt: path.join(out, 'receipt.json') })); if (receipt.failures.length) process.exitCode = 1;
