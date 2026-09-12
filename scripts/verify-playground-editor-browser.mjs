import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { verifyDirectGesture } from './verify-playground-direct-gesture.mjs';

const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const output = process.env.PG_EVIDENCE_DIR || '/tmp/playground-browser-evidence';
const engines = (process.env.PG_ENGINES || 'chromium,firefox,webkit').split(',');
const widths = (process.env.PG_WIDTHS || '1440,390').split(',').map(Number);
const results = [];
await mkdir(output, { recursive: true });
async function until(fn, label, timeout = 15000) {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    try { if (await fn()) return; } catch (error) { last = error; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${label}${last ? ': ' + last.message : ''}`);
}
async function bytes(download) {
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  return Buffer.concat(chunks);
}
for (const engine of engines) {
  const browser = await pw[engine].launch();
  for (const width of widths) {
    const name = `${engine}-${width}`;
    const record = { name, base, release: 'local-spatial-2026-09-10', checks: [], errors: [], requests: [], console: [] };
    const context = await browser.newContext({ viewport: { width, height: 1000 }, acceptDownloads: true });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => record.errors.push(error.message));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) record.console.push({ type: message.type(), text: message.text() }); });
    page.on('request', request => { if (request.url().includes('/api/playground/')) record.requests.push({ method: request.method(), url: request.url() }); });
    page.on('dialog', dialog => dialog.dismiss());
    const check = label => { record.checks.push(label); console.log(name + ': PASS ' + label); };
    const frame = page.frameLocator('iframe[title="Your page preview"]');
    async function panel(label) {
      const tabs = page.locator('.pg-mobile-tabs');
      if (await tabs.isVisible()) await tabs.getByRole('button', { name: label, exact: true }).click();
    }
    async function sectionHero() { await panel('Your page'); await page.locator('.pg-section-select').filter({ hasText: /^Hero$/ }).click(); }
    async function order() { return frame.locator('.pg-composition-grid > [data-composition-part]').evaluateAll(elements => elements.map(element => element.dataset.compositionPart)); }
    async function jsonDownload() {
      await panel('Your page');
      const details = page.locator('details.pg-project-tools').filter({ has: page.locator('summary', { hasText: /^Projects & variations$/ }) });
      if (!await details.evaluate(element => element.open)) await details.locator('summary').click();
      const pending = page.waitForEvent('download');
      await details.getByRole('button', { name: 'Download project JSON', exact: true }).click();
      return JSON.parse((await bytes(await pending)).toString('utf8'));
    }
    try {
      await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' });
      await page.locator('.pg-app').waitFor();
      await panel('Your page');
      await page.locator('[data-editor-release="local-spatial-2026-09-10"]').waitFor();
      record.title = await page.title(); record.url = page.url();
      assert.match(record.url, /\/playground\/?$/);
      assert.ok(record.title.length > 0);
      assert.equal(await page.locator('vite-error-overlay,nextjs-portal').count(), 0);
      const original = await jsonDownload();
      assert.equal(original.schemaVersion, 1);
      check('page identity, nonblank React app, release marker, no framework overlay, existing project unmodified');
      await page.getByRole('button', { name: 'Enable drag & drop', exact: true }).click();
      const upgraded = await jsonDownload();
      assert.equal(upgraded.schemaVersion, 3);
      check('visible entry enables composition explicitly');
      const png = await page.evaluate(() => {
        const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 600, 400); gradient.addColorStop(0, '#163142'); gradient.addColorStop(1, '#bdcf79');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = '#e9e1c7'; ctx.beginPath(); ctx.arc(440, 130, 70, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1d3b33'; ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(180, 130); ctx.lineTo(380, 400); ctx.fill();
        return canvas.toDataURL('image/png').split(',')[1];
      });
      await page.getByLabel('Upload hero image', { exact: true }).setInputFiles({ name: 'hero-test.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
      await until(async () => (await page.locator('.pg-toast').innerText()).includes('Hero image added'), 'upload feedback');
      const withImage = await jsonDownload();
      assert.ok(withImage.sections.find(section => section.id === 'hero').image.startsWith('data:image/'));
      assert.equal(await page.getByRole('button', { name: 'Import into my account', exact: true }).count(), 0);
      assert.ok((await page.locator('.pg-sidebar').innerText()).includes('Cloud saving for this format is not enabled yet'));
      check('real image decode/upload and explicit local-only cloud boundary');
      await sectionHero();
      for (const placement of ['background', 'left', 'right', 'above', 'below', 'inline']) {
        await panel('Controls');
        await page.getByLabel('Image placement', { exact: true }).selectOption(placement);
        await panel('Preview');
        await until(async () => await frame.locator('#hero').getAttribute('data-placement') === placement, placement + ' synchronization');
        assert.equal(await frame.locator('#hero img').count(), 1);
      }
      check('six image placements synchronize in the actual iframe');
      await verifyDirectGesture({page,frame,panel,jsonDownload,output,name,check});
      await panel('Controls');
      await page.getByRole('button', { name: 'Behind text', exact: true }).click();
      await panel('Preview');
      await until(async () => await frame.locator('#hero').getAttribute('data-placement') === 'background', 'background shortcut');
      const beforeMove = await order();
      const expected = beforeMove.filter(part => part !== 'description'); expected.splice(expected.indexOf('title'), 0, 'description');
      if (width > 640) {
        const handle = frame.getByRole('button', { name: 'Move description. Drag, or use Layout controls.', exact: true });
        await handle.scrollIntoViewIfNeeded();
        const source = await handle.boundingBox();
        const target = await frame.locator('[data-composition-part="title"]').boundingBox();
        assert.ok(source && target);
        await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
        await page.mouse.down();
        await page.mouse.move(target.x + Math.min(70, target.width / 2), target.y + 3, { steps: 15 });
        await page.mouse.up();
      } else {
        await panel('Controls');
        await page.getByRole('button', { name: 'Move description earlier', exact: true }).click();
        await panel('Preview');
      }
      await until(async () => JSON.stringify(await order()) === JSON.stringify(expected), 'move updates element order');
      await page.getByRole('button', { name: 'Undo', exact: true }).click();
      await until(async () => JSON.stringify(await order()) === JSON.stringify(beforeMove), 'Undo exact order');
      await page.getByRole('button', { name: 'Redo', exact: true }).click();
      await until(async () => JSON.stringify(await order()) === JSON.stringify(expected), 'Redo exact order');
      check(width > 640 ? 'real pointer drag, exact Undo and Redo' : 'mobile accessible move controls, exact Undo and Redo');
      await panel('Controls');
      await page.getByRole('button', { name: 'Below heading', exact: true }).click();
      await panel('Preview');
      await until(async () => { const parts = await order(); return parts[parts.indexOf('title') + 1] === 'image'; }, 'Below heading places image immediately after title');
      check('Below heading differs from hero background');
      const snapshot = await jsonDownload();
      await until(async () => (await page.locator('.pg-save-status').innerText()).includes('Saved on this device'), 'local autosave');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('.pg-app').waitFor();
      const reopened = await jsonDownload();
      assert.deepEqual(reopened, snapshot);
      check('device autosave and reload preserve the exact document and image');
      await sectionHero();
      await page.getByRole('button', { name: 'Behind text', exact: true }).click();
      await panel('Preview');
      await until(async () => await frame.locator('#hero').getAttribute('data-placement') === 'background', 'reloaded preview');
      await frame.locator('#hero').scrollIntoViewIfNeeded();
      assert.equal(await frame.locator('.pg-compose-handle').count(), 4);
      if (width <= 640) {
        const heights = await frame.locator('.pg-compose-handle').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height));
        assert.ok(heights.every(height => height >= 44), 'mobile handles need 44px targets');
      }
      const overflow = await frame.locator('html').evaluate(element => element.scrollWidth > element.clientWidth + 1);
      assert.equal(overflow, false, 'preview horizontal overflow');
      await page.screenshot({ path: path.join(output, name + '-editor.png'), fullPage: false });
      check('desktop/mobile screenshot, readable handle sizing and no horizontal preview overflow');
      const exportedProject = await jsonDownload();
      await page.getByRole('button', { name: /^Export\s*$/ }).click();
      const zipPending = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download page package', exact: true }).click();
      const zip = await zipPending;
      const zipPath = path.join(output, name + '-page.zip');
      await zip.saveAs(zipPath);
      const expectedPath = path.join(output, name + '-expected.json');
      await writeFile(expectedPath, JSON.stringify(exportedProject));
      execFileSync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'), ['-c', "import sys,zipfile,json; z=zipfile.ZipFile(sys.argv[1]); names=z.namelist(); assert all(x in names for x in ['index.html','styles.css','tokens.css','script.js','project.json']); assert json.loads(z.read('project.json'))==json.load(open(sys.argv[2],encoding='utf-8')); assert any(n.startswith('assets/') for n in names); assert b'pg-compose-handle' not in z.read('index.html'); print('ZIP verified')", zipPath, expectedPath], { stdio: 'inherit' });
      check('actual downloaded ZIP contains exact project, packaged image and standalone files without editor handles');
      await page.getByRole('button', { name: 'Try page', exact: true }).click();
      await until(async () => await frame.locator('.pg-compose-handle').count() === 0, 'Try page removes handles');
      await page.screenshot({ path: path.join(output, name + '-try.png'), fullPage: false });
      assert.equal(record.errors.length, 0, record.errors.join('\n'));
      assert.equal(record.requests.length, 0, 'manual editing must not contact Playground accounts, purchases or AI');
      check('Try page removes authoring UI, zero page exceptions and zero Playground API/provider requests');
      record.passed = true;
    } catch (error) {
      record.passed = false; record.failure = error.stack || String(error);
      console.error(name + ': FAIL ' + record.failure);
      await page.screenshot({ path: path.join(output, name + '-failure.png') }).catch(() => {});
      await writeFile(path.join(output, name + '-dom.txt'), await page.locator('body').innerText().catch(() => 'unavailable'));
    } finally {
      await context.tracing.stop({ path: path.join(output, name + '-trace.zip') });
      results.push(record);
      await writeFile(path.join(output, 'results.json'), JSON.stringify({ testedAt: new Date().toISOString(), commit: process.env.GITHUB_SHA || null, browserPlugin: 'not available; Playwright used', results }, null, 2));
      await context.close();
    }
  }
  await browser.close();
}
console.log(JSON.stringify(results.map(({ name, passed, failure, checks }) => ({ name, passed, failure, checks })), null, 2));
if (results.some(result => !result.passed)) process.exitCode = 1;
