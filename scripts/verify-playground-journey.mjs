import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-playground-journey';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function panel(name) {
    if (width >= 850) return;
    await page.getByRole('navigation', { name: 'Workspace panels' }).getByRole('button', { name }).click();
    const view = { 'Your page': 'sections', Preview: 'canvas' }[name];
    await page.locator(`.pg-app[data-panel="${view}"]`).waitFor();
  }
  async function project() {
    await panel('Your page');
    const tools = page.locator('details.pg-project-tools').filter({ has: page.locator('summary', { hasText: 'Projects & variations' }) });
    if (!await tools.evaluate(element => element.open)) await tools.locator('summary').click();
    let result;
    try {
      [result] = await Promise.all([
        page.waitForEvent('download', { timeout: 12_000 }),
        tools.getByRole('button', { name: 'Download project JSON' }).click({ timeout: 10_000 }),
      ]);
    }
    catch (error) {
      const state = await page.locator('.pg-app').evaluate(element => ({ panel: element.dataset.panel,
        projectToolsOpen: element.querySelector('details.pg-project-tools')?.open,
        saveStatus: element.querySelector('.pg-save-status')?.textContent?.trim(),
        notice: element.querySelector('.pg-toast')?.textContent?.trim() }));
      throw new Error(`Project JSON download failed at ${width}px: ${JSON.stringify({ state, errors })}`, { cause: error });
    }
    const chunks = [];
    for await (const chunk of await result.createReadStream()) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  try {
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' });
    await page.locator('.pg-app').waitFor();
    await panel('Your page');
    const initial = await project();
    assert.equal(initial.schemaVersion, 4, 'new projects open in the flexible format');
    const first = initial.sections.find(section => section.id === 'hero').authoring.root.children[0].id;
    await page.getByRole('button', { name: 'Add Heading to selected section' }).click();
    const afterClick = await project();
    assert.equal(afterClick.sections.find(section => section.id === 'hero').authoring.root.children.at(-1).type, 'heading');
    await panel('Your page');
    const grip = page.getByRole('button', { name: 'Drag Text into page structure or onto canvas' });
    const slot = page.locator('.pg-block-tree .pg-element-slot').filter({ hasText: '' }).first();
    await grip.dragTo(slot);
    // dnd-kit AbstractPointerSensor intentionally suppresses document clicks for
    // 50 ms after pointerup. Let that cleanup finish before clicking a panel tab.
    await page.waitForTimeout(100);
    // The drop moves the mobile UI to Preview; wait for that commit before reopening Your page.
    if (width < 850) await page.locator('.pg-app[data-panel="canvas"]').waitFor();
    const afterDrag = await project();
    assert.equal(afterDrag.sections.find(section => section.id === 'hero').authoring.root.children[0].type, 'text');
    assert.equal(afterDrag.sections.find(section => section.id === 'hero').authoring.root.children[1].id, first);
    await page.getByRole('button', { name: 'Undo' }).click();
    assert.deepEqual(await project(), afterClick, 'one Undo reverses the insertion');
    await page.getByRole('button', { name: 'Redo' }).click();
    assert.deepEqual(await project(), afterDrag, 'one Redo restores exact order and identities');
    await panel('Preview');
    await page.screenshot({ path: path.join(evidence, `playground-${width}.png`) });
    await page.waitForTimeout(550);
    await page.reload();
    assert.deepEqual(await project(), afterDrag, 'local reload retains the design');
    await page.locator('.pg-toolbar').getByRole('button', { name: 'Free starter pack' }).click();
    assert.ok(await page.getByRole('link', { name: /Want Eidos Works to finish this/ }).isVisible());
    assert.ok(await page.getByRole('link', { name: /separate \$29 Cinematic Starter kit/ }).isVisible());
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download my free starter pack' }).click();
    const zip = await pending;
    assert.match(zip.suggestedFilename(), /\.zip$/);
    await zip.saveAs(path.join(evidence, `starter-${width}.zip`));
    await page.getByRole('link', { name: 'Work with Eidos Works' }).click();
    assert.match(page.url(), /\/contact\/\?from=playground#project-form$/);
    await page.getByLabel('What needs to become clearer, easier, or more useful?').waitFor();
    await page.waitForFunction(() => document.querySelector('textarea')?.value.includes('Eidos Playground'));
    assert.equal(await page.getByLabel('How did you find Eidos Works?').inputValue(), 'Eidos Playground');
    await page.goto(base + '/services/digital-experiences/');
    await page.getByRole('heading', { name: 'Start with a draft. Take it as far as you want.' }).waitFor();
    assert.equal(await page.getByRole('link', { name: /Build a page in Playground/ }).isVisible(), true);
    assert.equal(await page.getByRole('link', { name: /Get the Cinematic Starter kit/ }).isVisible(), true);
    assert.equal(await page.getByRole('link', { name: /Ask Eidos Works to design and build it/ }).isVisible(), true);
    assert.equal(errors.length, 0, `no page errors: ${errors.join(', ')}`);
    console.log(`PASS ${width}: fresh editor, click and drag placement, Undo/Redo, reload, ZIP, contact prefill and service paths`);
  } catch (error) {
    await page.screenshot({ path: path.join(evidence, `failure-${width}.png`) });
    throw error;
  } finally { await context.close(); }
}
await browser.close();
