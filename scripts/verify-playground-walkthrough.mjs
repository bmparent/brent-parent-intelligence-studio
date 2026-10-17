import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchOptions, guardLocalEditor } from './playground-local-browser-guard.mjs';
const require = createRequire(import.meta.url), pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = process.env.PG_TOUR_EVIDENCE || 'artifacts/playground-tour';
await mkdir(out, { recursive: true });
const records = [];
for (const engine of (process.env.PG_ENGINES || 'chromium,firefox,webkit').split(',')) {
  const browser = await pw[engine].launch(launchOptions(engine));
  for (const width of (process.env.PG_WIDTHS || '1440,390,320').split(',').map(Number)) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const assertLocal = await guardLocalEditor(page);
    try {
      await page.goto((process.env.PG_BASE_URL || 'http://127.0.0.1:4173') + '/playground/');
      const tour = page.locator('.pg-walkthrough');
      await tour.waitFor();
      await tour.getByRole('button', { name: 'Pause', exact: true }).click();
      await tour.getByRole('button', { name: 'Step 1: Select' }).click();
      await page.screenshot({ path: path.join(out, `${engine}-${width}-select.png`), fullPage: true });
      await tour.getByRole('button', { name: 'Play tour', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('.pg-walkthrough')?.getAttribute('data-step') === '1');
      await tour.getByRole('button', { name: 'Pause', exact: true }).click();
      const paused = await tour.getAttribute('data-step');
      await page.waitForTimeout(3700);
      assert.equal(await tour.getAttribute('data-step'), paused, 'Pause holds the current frame');
      await tour.getByRole('button', { name: 'Step 3: Arrange' }).click();
      assert.equal(await tour.locator('.pg-walkthrough-page').getAttribute('data-moved'), 'true');
      await tour.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await tour.locator('.pg-walkthrough-page').getAttribute('data-airy'), 'true');
      await tour.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await tour.locator('.pg-walkthrough-canvas').getAttribute('data-mobile'), 'true');
      await page.screenshot({ path: path.join(out, `${engine}-${width}-mobile.png`), fullPage: true });
      await tour.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await tour.locator('.pg-walkthrough-page').getAttribute('data-airy'), 'false');
      await tour.getByRole('button', { name: 'Replay tour', exact: true }).click();
      assert.equal(await tour.getAttribute('data-step'), '0');
      if (engine === 'chromium' && width === 1440) {
        await page.waitForFunction(() => document.querySelector('.pg-walkthrough')?.getAttribute('data-step') === '5', undefined, { timeout: 25000 });
        assert.equal(await tour.getByRole('button', { name: 'Pause', exact: true }).count(), 0, 'Autoplay stops at the final step');
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await tour.getByText('Reduced motion is on. Explore at your own pace.', { exact: true }).waitFor();
      assert.equal(await tour.getByRole('button', { name: 'Pause', exact: true }).count(), 0);
      await tour.getByRole('button', { name: 'Step 4: Space' }).focus();
      await page.keyboard.press('Enter');
      assert.equal(await tour.getAttribute('data-step'), '3');
      await page.waitForTimeout(3700);
      assert.equal(await tour.getAttribute('data-step'), '3');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No page overflow');
      await page.getByRole('button', { name: /Switchboard/ }).click();
      await page.getByRole('button', { name: 'Skip details', exact: true }).click();
      await page.locator('.pg-unified').waitFor();
      const name = page.getByRole('textbox', { name: 'Project name', exact: true });
      await name.fill('Tour preserves my project');
      await page.locator('.pg-save-inline').click();
      await page.waitForFunction(() => document.querySelector('.pg-save-inline')?.textContent.includes('Saved on this device'));
      const saved = () => page.evaluate(() => new Promise((resolve, reject) => {
        const request = indexedDB.open('eidos-playground-v1', 1);
        request.onsuccess = () => { const db = request.result; const read = db.transaction('workspace').objectStore('workspace').get('current'); read.onsuccess = () => { db.close(); resolve(read.result); }; read.onerror = () => reject(read.error); };
        request.onerror = () => reject(request.error);
      }));
      // Autosave can finish after a manual save. Its receipt timestamp is not document state.
      const comparable = value => { const { savedAt: _savedAt, ...document } = value; return document; };
      const before = comparable(await saved());
      const historyBefore = await Promise.all(['Undo', 'Redo'].map(label => page.getByRole('button', { name: label, exact: true }).isEnabled()));
      const launch = page.getByRole('button', { name: 'How it works' });
      await launch.click();
      const dialog = page.getByRole('dialog', { name: 'How Playground works' });
      await dialog.waitFor();
      await dialog.getByRole('button', { name: 'Step 6: Undo' }).click();
      await page.screenshot({ path: path.join(out, `${engine}-${width}-dialog.png`), fullPage: true });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await launch.evaluate(element => element === document.activeElement), true, 'Close restores focus');
      assert.deepEqual(comparable(await saved()), before, 'Tutorial must preserve document, selection, revision and saved variations');
      assert.deepEqual(await Promise.all(['Undo', 'Redo'].map(label => page.getByRole('button', { name: label, exact: true }).isEnabled())), historyBefore, 'Tour leaves history availability unchanged');
      await launch.click();
      assert.equal(await dialog.locator('.pg-walkthrough').getAttribute('data-step'), '0', 'Reopening resets demo');
      await dialog.getByRole('button', { name: 'Try it yourself' }).click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await name.inputValue(), 'Tour preserves my project');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No editor overflow');
      assert.deepEqual(errors, []);
      await assertLocal();
      records.push({ engine, width, passed: true });
      console.log(`PASS tour: ${engine} ${width}`);
    } catch (error) {
      const state = await page.locator('.pg-walkthrough').first().evaluate(element => ({ step: element.dataset.step, playing: element.dataset.playing, visible: element.dataset.visible, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, rect: element.getBoundingClientRect().toJSON(), scrollY })).catch(() => null);
      await page.screenshot({ path: path.join(out, `${engine}-${width}-failure.png`), fullPage: true }).catch(() => {});
      records.push({ engine, width, passed: false, error: error.stack, state }); process.exitCode = 1;
    }
    await context.close();
  }
  await browser.close();
}
await writeFile(path.join(out, 'receipt.json'), JSON.stringify(records, null, 2));
if (records.some(record => !record.passed)) console.error(records.filter(record => !record.passed));
