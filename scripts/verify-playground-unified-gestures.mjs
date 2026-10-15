import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createProject, validateProject } from '../src/playground/model.ts';
import { enableBlocks } from '../src/playground/authoring.ts';
import { newNode, flattenNodes } from '../src/playground/authoringSchema.ts';
import { defaultMedia } from '../src/playground/media.ts';
import { startGestureEvidence } from './playground-gesture-evidence.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:5184';
const out = process.env.PG_GESTURE_EVIDENCE || 'artifacts/playground-unified/gestures';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 1050 }, acceptDownloads: true });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const receipt = {
  timestamp: new Date().toISOString(), base, source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  environment: `Chromium headless, GPU disabled, ${process.platform}/${process.arch}, Node ${process.version}; browser viewport is not a physical device`,
  setup: 'Valid reproducible project JSON imported through the visible Project controls. All tested mutations use actual pointer or keyboard controls. IndexedDB reads are evidence only.',
  checks: [], errors: [], console: [], metrics: [], limitations: [
    'Physical-device and touch-device acceptance untested.',
    'playground-gesture-paint measures pointer sample to animation-frame style update; actual display presentation latency is not directly instrumented.',
    'Other builds and browser tests may share this host. These numbers are an engineering sample, not an isolated representative-device benchmark.',
    'Pointercancel and lostpointercapture events are injected during real pointer gestures; Escape and pointer movements are actual browser input.',
  ],
};
const check = name => { receipt.checks.push(name); console.log('PASS ' + name); };
page.on('pageerror', error => receipt.errors.push(error.message));
page.on('console', message => { if (['error', 'warning'].includes(message.type())) receipt.console.push({ type: message.type(), text: message.text() }); });
const saved = () => page.evaluate(() => new Promise((resolve, reject) => {
  const request = indexedDB.open('eidos-playground-v1', 1);
  request.onsuccess = () => { const db = request.result, read = db.transaction('workspace').objectStore('workspace').get('current'); read.onsuccess = () => { db.close(); resolve(read.result); }; read.onerror = () => reject(read.error); };
  request.onerror = () => reject(request.error);
}));
const save = async () => { await page.locator('.pg-save-inline').click(); await page.waitForFunction(() => document.querySelector('.pg-save-inline')?.textContent.includes('Saved on this device')); return (await saved()).project; };
const tool = name => page.getByRole('navigation', { name: 'Build tools' }).getByRole('button', { name, exact: true }).click();
const point = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
let frame, photoId, sourceId, destinationId, columnsId;
const node = (project, id) => project.sections.flatMap(section => section.authoring ? flattenNodes(section.authoring.root) : []).find(item => item.id === id);
const parentOf = (project, id) => project.sections.flatMap(section => section.authoring ? flattenNodes(section.authoring.root) : []).find(item => item.children?.some(child => child.id === id));
async function selectPhoto() {
  const photo = frame.locator('#' + photoId);
  await photo.scrollIntoViewIfNeeded();
  await photo.click({ position: { x: 20, y: 20 } });
  await frame.getByRole('toolbar', { name: 'Movable photograph', exact: true }).getByRole('button', { name: 'Drag selected block', exact: true }).waitFor();
  // The iframe creates its toolbar before postMessage updates React's selection.
  // Wait for the same stable ID in Layers; an iframe handle alone is not an acknowledgement.
  await page.locator(`[data-sort-id="${photoId}"] > .pg-layer-line > .pg-layer-selected[aria-pressed="true"]`).waitFor();
  return photo;
}
async function beginMove() {
  await selectPhoto();
  const handle = frame.getByRole('button', { name: 'Drag selected block', exact: true });
  const start = point(await handle.boundingBox());
  await page.mouse.move(start.x, start.y); await page.mouse.down();
  await page.mouse.move(start.x + 15, start.y + 15, { steps: 3 });
  await frame.locator('.pg-node-ghost').waitFor();
  return start;
}
async function targetDestination() {
  const target = point(await frame.locator('#' + destinationId).boundingBox());
  await page.mouse.move(target.x, target.y, { steps: 16 });
  await frame.locator('.pg-node-destination').filter({ hasText: 'Empty destination' }).waitFor();
  assert.equal(await frame.locator('#' + destinationId).evaluate(element => element.classList.contains('pg-node-drop-container')), true);
  return target;
}
async function undoRedo(before, after, label) {
  await page.getByRole('button', { name: 'Undo', exact: true }).click(); assert.deepEqual(await save(), before, label + ': one Undo restores exact entire project');
  await page.getByRole('button', { name: 'Redo', exact: true }).click(); assert.deepEqual(await save(), after, label + ': one Redo restores exact entire project');
  check(label + ': one Undo and Redo preserve the complete document');
}
try {
  await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'What are you making?' }).waitFor();
  await page.getByRole('button', { name: /Switchboard/ }).click();
  await page.getByRole('button', { name: /Create project/ }).click();
  await page.locator('.pg-unified').waitFor();
  const image = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 180; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#254a41'; ctx.fillRect(0, 0, 320, 180); ctx.fillStyle = '#d9e5a0'; ctx.fillRect(36, 25, 92, 118); ctx.fillStyle = '#faf4e5'; ctx.beginPath(); ctx.arc(220, 90, 50, 0, Math.PI * 2); ctx.fill(); return canvas.toDataURL(); });
  const fixture = enableBlocks(createProject()); fixture.name = 'Direct manipulation acceptance';
  const photo = { ...newNode('image'), name: 'Movable photograph', image, alt: 'Two geometric shapes', width: 80, height: 220, media: defaultMedia() };
  const source = { ...newNode('stack'), name: 'Source stack', children: [{ ...newNode('text'), name: 'Source label', text: 'A photograph to arrange.' }, photo] };
  const destination = { ...newNode('stack'), name: 'Empty destination', children: [] };
  const columns = { ...newNode('columns'), name: 'Two columns', children: [source, destination], gap: 48 };
  fixture.sections.find(section => section.id === 'hero').authoring.root = columns;
  fixture.tokens.spacing = 40;
  validateProject(fixture); photoId = photo.id; sourceId = source.id; destinationId = destination.id; columnsId = columns.id;
  await tool('Project');
  await page.getByLabel('Import project', { exact: true }).setInputFiles({ name: 'gesture-fixture.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)) });
  await page.locator('.pg-toast').filter({ hasText: 'Project imported' }).waitFor();
  frame = page.frameLocator('iframe[title="Your page preview"]');
  await frame.locator('#' + photoId).waitFor();
  await page.getByRole('button', { name: 'Dismiss getting started checklist' }).click();
  await tool('Layers'); await selectPhoto();
  assert.match(await page.locator('.pg-layer-selected').innerText(), /Movable photograph/);
  await page.getByRole('navigation', { name: 'Selection path' }).getByRole('button', { name: 'Source stack', exact: true }).click();
  await page.locator(`[data-sort-id="${sourceId}"] > .pg-layer-line > .pg-layer-selected[aria-pressed="true"]`).waitFor();
  assert.equal(await page.getByLabel('Layer name', { exact: true }).inputValue(), 'Source stack');
  await selectPhoto();check('breadcrumb selects the actual parent; inspector and Layers agree before returning to photo');
  const baseline = await save();
  assert.equal((await saved()).editor.nodeId, photoId);
  await page.screenshot({ path: path.resolve(out, '01-selected-layers-agree.png') });
  check('canvas selection and Layers agree on stable photo ID');

  const finishMetrics = await startGestureEvidence(page, frame);
  await beginMove();
  const target = await targetDestination();
  for (let index = 0; index < 60; index++) { await page.mouse.move(target.x + Math.sin(index / 5) * 8, target.y + Math.cos(index / 5) * 6); await page.waitForTimeout(16); }
  receipt.dragFeedback = await frame.locator('.pg-node-ghost').evaluate(ghost => {
    const rect = ghost.getBoundingClientRect(), image = ghost.querySelector('img'), frame = ghost.querySelector('.pg-block-frame');
    return { ghost: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, opacity: getComputedStyle(ghost).opacity, display: getComputedStyle(ghost).display }, image: image ? { complete: image.complete, naturalWidth: image.naturalWidth, width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height } : null, imageFrame: frame ? { width: frame.getBoundingClientRect().width, height: frame.getBoundingClientRect().height } : null, viewport: { width: innerWidth, height: innerHeight } };
  });
  assert.ok(receipt.dragFeedback.image?.width > 0 && receipt.dragFeedback.image?.height > 0, 'drag ghost image retains visible geometry');
  assert.ok(receipt.dragFeedback.ghost.x < receipt.dragFeedback.viewport.width && receipt.dragFeedback.ghost.x + receipt.dragFeedback.ghost.width > 0 && receipt.dragFeedback.ghost.y < receipt.dragFeedback.viewport.height && receipt.dragFeedback.ghost.y + receipt.dragFeedback.ghost.height > 0, 'drag ghost intersects the viewport at the real pointer destination');
  await page.screenshot({ path: path.resolve(out, '02-empty-container-drag-preview.png') });
  const metric = await finishMetrics(); metric.action = 'Real pointer drag with empty nested destination; canceled after measurement';
  metric.budgetMs = 33; metric.budgetMet = metric.inputToStyleUpdateP95Ms === null ? null : metric.inputToStyleUpdateP95Ms < 33;
  receipt.metrics.push(metric); assert.ok(metric.delays.length >= 20); assert.equal(metric.rootReplacements, 0); assert.equal(metric.glassRemovals, 0); assert.equal(metric.writes, 0);
  await page.keyboard.press('Escape'); await page.mouse.up();
  assert.equal(await frame.locator('.pg-node-ghost').count(), 0); assert.equal(await frame.locator('.pg-node-destination').count(), 0); assert.deepEqual(await save(), baseline);
  check('drag previews the named empty nested container; Escape restores exact state with no transient writes');

  for (const cancellation of ['pointercancel', 'lostpointercapture']) {
    await beginMove(); await targetDestination();
    await frame.locator('body').evaluate((body, kind) => { (kind === 'pointercancel' ? document : document.querySelector('[data-drag="move"]')).dispatchEvent(new PointerEvent(kind, { bubbles: true })); }, cancellation);
    await page.mouse.up(); assert.equal(await frame.locator('.pg-node-ghost').count(), 0); assert.deepEqual(await save(), baseline);
    check(cancellation + ' during actual drag leaves document intact');
  }
  await beginMove(); await targetDestination();
  // Moving real focus out of the iframe produces its window blur; do not inject
  // a synthetic blur event or wait an arbitrary delay for cancellation.
  await page.getByLabel('Project name', { exact: true }).focus();
  await frame.locator('.pg-node-ghost').waitFor({ state: 'detached' });
  await page.mouse.up(); assert.deepEqual(await save(), baseline);
  check('real iframe focus loss during an active canvas drag cancels without mutation');
  await beginMove(); await targetDestination(); await page.mouse.up();
  const moved = await save(); assert.equal(parentOf(moved, photoId).id, destinationId); assert.equal(node(moved, sourceId).children.some(child => child.id === photoId), false);
  assert.equal(node(moved, destinationId).children.at(-1).id, photoId);
  await page.screenshot({ path: path.resolve(out, '03-dropped-nested-image.png') });
  check('actual canvas drop moves image across containers into the empty second column, preserving IDs');
  await undoRedo(baseline, moved, 'canvas cross-container drop');

  await selectPhoto();
  const resize = frame.getByRole('button', { name: 'Resize image frame', exact: true }), start = point(await resize.boundingBox());
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(start.x - 55, start.y - 35, { steps: 16 }); await page.mouse.up();
  const resized = await save(); assert.ok(node(resized, photoId).width < node(moved, photoId).width); assert.ok(node(resized, photoId).height < node(moved, photoId).height);
  assert.ok(Math.abs(node(resized, photoId).height / node(moved, photoId).height - node(resized, photoId).width / node(moved, photoId).width) < 0.001);
  check('actual corner resize changes frame width/height and retains locked aspect ratio');
  await undoRedo(moved, resized, 'frame resize');

  await selectPhoto(); await frame.getByRole('button', { name: 'Crop', exact: true }).click();
  const cropStart = point(await frame.locator('#' + photoId).boundingBox());
  await page.mouse.move(cropStart.x, cropStart.y); await page.mouse.down(); await page.mouse.move(cropStart.x - 28, cropStart.y + 16, { steps: 16 }); await page.mouse.up();
  const cropped = await save(); assert.notDeepEqual(node(cropped, photoId).media, node(resized, photoId).media); assert.equal(node(cropped, photoId).width, node(resized, photoId).width); assert.equal(node(cropped, photoId).height, node(resized, photoId).height);
  check('actual crop drag changes focal point while preserving frame geometry');
  await undoRedo(resized, cropped, 'crop drag');

  await selectPhoto();
  await page.getByLabel('Move to container', { exact: true }).selectOption(sourceId);
  const keyboardMove = page.getByRole('button', { name: 'Move here', exact: true }); await keyboardMove.focus(); await page.keyboard.press('Enter');
  const keyboardMoved = await save(); assert.equal(parentOf(keyboardMoved, photoId).id, sourceId);
  const widthField = page.getByLabel(/^Width \(%\)/); await widthField.focus(); await page.keyboard.press('Control+A'); await page.keyboard.type('75'); await page.keyboard.press('Tab');
  const keyboardResized = await save(); assert.equal(node(keyboardResized, photoId).width, 75);
  check('keyboard activated move and keyboard numeric resize provide alternatives to dragging');

  await page.getByRole('button', { name: 'Mobile', exact: true }).first().click();
  await page.getByRole('button', { name: 'Reset mobile overrides', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Reset mobile overrides', exact: true }).isDisabled(), true);
  await page.getByLabel(/^Width \(%\)/).fill('60'); await page.getByLabel(/^Width \(%\)/).blur();
  const mobile = await save(); assert.equal(node(mobile, photoId).mobile.width, 60); assert.equal(node(mobile, photoId).width, 75);
  assert.match(await page.getByLabel(/^Width \(%\)/).locator('..').innerText(), /Override/);
  await page.screenshot({ path: path.resolve(out, '04-mobile-override.png') });
  await page.getByRole('button', { name: 'Reset mobile overrides', exact: true }).click();
  const inherited = await save(); assert.equal(node(inherited, photoId).mobile, undefined); assert.equal(node(inherited, photoId).width, 75);
  assert.match(await page.getByLabel(/^Width \(%\)/).locator('..').innerText(), /Inherited/);
  check('mobile explicitly inherits, overrides locally and resets without changing desktop geometry');

  await page.getByRole('button', { name: 'Desktop', exact: true }).click();
  await tool('Layers');
  // Exercise final-position list movement in the complete app, after the canvas proof.
  const layerHandle = page.getByRole('button', { name: 'Drag layer Movable photograph', exact: true });
  await layerHandle.scrollIntoViewIfNeeded(); const listStart = point(await layerHandle.boundingBox());
  const emptyList = page.locator(`[data-sort-container="${destinationId}"]`); await emptyList.scrollIntoViewIfNeeded();
  const listTarget = await emptyList.boundingBox();
  await page.mouse.move(listStart.x, listStart.y); await page.mouse.down(); await page.mouse.move(listTarget.x + 12, listTarget.y + listTarget.height - 5, { steps: 14 }); await page.mouse.up();
  const layerMoved = await save(); assert.equal(parentOf(layerMoved, photoId).id, destinationId); assert.equal(node(layerMoved, destinationId).children.at(-1).id, photoId);
  await undoRedo(inherited, layerMoved, 'Layers final-position move into empty container');
  check('canvas and Layers produce the same nested destination semantics');
  await selectPhoto(); await page.screenshot({ path: path.resolve(out, '05-final-editor.png') });
  const labelId = source.children[0].id;
  await page.locator(`[data-sort-id="${labelId}"] > .pg-layer-line > button`).first().click();
  const textDraft = page.locator('.pg-block-controls .pg-block-field').filter({hasText:/^Text/}).locator('textarea');
  await textDraft.fill('Longer content should grow in normal document flow. '.repeat(24) + 'A'.repeat(100));await textDraft.blur();
  await page.getByRole('button', { name: 'Mobile', exact: true }).first().click();
  const longText = frame.locator('#' + labelId);await longText.scrollIntoViewIfNeeded();
  const textBounds = await longText.evaluate(element => ({height:element.getBoundingClientRect().height,width:element.getBoundingClientRect().width,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}));
  assert.ok(textBounds.height > 300 && textBounds.width <= textBounds.viewport);assert.equal(textBounds.overflow,false);
  await page.screenshot({path:path.resolve(out,'06-mobile-text-growth.png')});
  await page.getByRole('button', { name: 'Undo', exact: true }).click();assert.deepEqual(await save(),layerMoved);
  await page.getByRole('button', { name: 'Desktop', exact: true }).click();await selectPhoto();
  check('long text and an unbroken word grow vertically on mobile without overflow; one Undo restores the original content');
  const originalIdentity = (await saved()).documentId;
  await beginMove();
  const back = page.getByRole('button', { name: 'Back to projects', exact: true });
  await back.focus(); await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'What are you making?' }).waitFor();
  await page.getByRole('button', { name: /Tideglass/ }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /Create project/ }).focus(); await page.keyboard.press('Enter');
  await page.locator('.pg-unified').waitFor();
  await page.mouse.up();
  const switched = await save(); assert.equal(node(switched, photoId), undefined);
  assert.notEqual((await saved()).documentId, originalIdentity);
  assert.equal(await frame.locator('.pg-node-ghost').count(), 0);
  await page.getByRole('button', { name: 'Back to projects', exact: true }).click();
  await page.getByText('Other projects saved on this device', { exact: true }).click();
  await page.locator('.pg-start-saved li').filter({ hasText: 'Direct manipulation acceptance' }).getByRole('button', { name: 'Open project', exact: true }).click();
  await page.locator('.pg-unified').waitFor();
  assert.deepEqual(await save(), layerMoved);assert.equal((await saved()).documentId, originalIdentity);
  check('switching projects while the pointer is held preserves both the new project and exact archived source');
  assert.equal(receipt.errors.length, 0); assert.equal(await page.locator('vite-error-overlay').count(), 0);
  receipt.ids = { photoId, sourceId, destinationId, columnsId };
  await writeFile(path.join(out, 'final-project.json'), JSON.stringify(layerMoved, null, 2) + '\n');
} catch (error) {
  receipt.failure = error.stack; console.error(error.stack); await page.screenshot({ path: path.resolve(out, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  receipt.completedAt = new Date().toISOString();
  await writeFile(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  await context.close(); await browser.close();
}
