import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { launchOptions, guardLocalEditor } from './playground-local-browser-guard.mjs';
const require = createRequire(import.meta.url), pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const out = process.env.PG_FRAME_EVIDENCE || 'artifacts/playground-frame';
await mkdir(out, { recursive: true });
const records = [];
for (const engine of (process.env.PG_ENGINES || 'chromium,firefox,webkit').split(',')) {
  const browser = await pw[engine].launch(launchOptions(engine));
  for (const width of (process.env.PG_WIDTHS || '1440,390,320').split(',').map(Number)) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    const record = { engine, width, checks: [], errors: [] }; records.push(record);
    const check = name => { record.checks.push(name); console.log(`${engine} ${width}: PASS ${name}`); };
    page.on('pageerror', error => record.errors.push(error.message));
    const saved = () => page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('eidos-playground-v1', 1);
      request.onsuccess = () => { const db = request.result, read = db.transaction('workspace').objectStore('workspace').get('current'); read.onsuccess = () => { db.close(); resolve(read.result); }; read.onerror = () => reject(read.error); };
      request.onerror = () => reject(request.error);
    }));
    const save = async () => { await page.locator('.pg-save-inline').click(); await page.waitForFunction(() => document.querySelector('.pg-save-inline')?.textContent.includes('Saved on this device')); return saved(); };
    const clickContactNavigation = async frame => {
      const toggle = frame.getByRole('button', { name: 'Toggle navigation', exact: true });
      if (await toggle.isVisible()) {
        const menu = await toggle.boundingBox();
        for (const toolbar of await frame.locator('.pg-node-toolbar').all()) {
          const box = await toolbar.boundingBox();
          assert.ok(!menu || !box || box.x + box.width <= menu.x || box.x >= menu.x + menu.width || box.y + box.height <= menu.y || box.y >= menu.y + menu.height, 'Floating editor controls must not cover the mobile page menu');
        }
        if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      }
      await frame.getByRole('navigation', { name: 'Page navigation' }).getByRole('link', { name: 'Start a conversation', exact: true }).click();
    };
    try {
      const localOnly = await guardLocalEditor(page);
      const response = await page.goto(base + '/playground/');
      const policy = response.headers()['content-security-policy'];
      assert.ok(policy && /script-src 'self'/.test(policy));
      assert.ok(!/script-src[^;]*(unsafe-inline|unsafe-eval)/.test(policy));
      await page.getByRole('button', { name: /Switchboard/ }).click();
      // Verify a failed frame can recover without closing the project or history.
      let failFirstFrame = true;
      await page.route('**/playground-frame*', route => failFirstFrame ? (failFirstFrame = false, route.abort()) : route.continue());
      await page.getByRole('button', { name: 'Skip details', exact: true }).click();
      await page.getByRole('textbox', { name: 'Project name', exact: true }).fill(`Preview recovery ${engine} ${width}`);
      const before = await save();
      await page.getByRole('button', { name: 'Reload page preview', exact: true }).click();
      const frame = page.frameLocator('iframe[title="Your page preview"]');
      await frame.locator('body[data-editing="true"]').waitFor();
      // The initial HTML runs before the editor sends its current command stamp.
      // Wait for the working editor controls before exercising selection/menu input.
      await frame.locator('.pg-node-toolbar').waitFor();
      const after = await saved(); assert.deepEqual(after.project, before.project); assert.equal(after.documentId, before.documentId);
      assert.equal(await page.getByRole('button', { name: 'Undo', exact: true }).isEnabled(), true);
      check('failed frame reload preserves the document, save and Undo history under enforced CSP');

      await clickContactNavigation(frame);
      await frame.locator('.pg-header.pg-selected').waitFor({ state: 'attached' });
      assert.equal(await frame.getByRole('main', { name: 'Start a Playground project' }).count(), 0);
      assert.equal(await page.getByRole('button', { name: 'Reload page preview', exact: true }).count(), 0);
      assert.equal(await frame.locator('body').getAttribute('data-editing'), 'true');
      await page.getByRole('button', { name: 'Preview', exact: true }).click();
      await frame.locator('body[data-editing="false"]').waitFor();
      await clickContactNavigation(frame);
      assert.equal(await frame.getByRole('main', { name: 'Start a Playground project' }).count(), 0);
      await page.getByRole('button', { name: 'Edit page', exact: true }).click();
      await frame.locator('body[data-editing="true"]').waitFor();
      check('contact links select in edit mode and stay inside the visitor page in Preview');

      const heading = frame.getByRole('heading', { level: 1 });
      await heading.dblclick();
      const text = frame.locator('[contenteditable="true"]');
      await text.fill('A working page preview'); await text.press('ControlOrMeta+Enter');
      await heading.filter({ hasText: 'A working page preview' }).waitFor();
      await save();
      const titleBeforeTour = await page.getByRole('textbox', { name: 'Project name', exact: true }).inputValue();
      await page.getByRole('button', { name: 'How it works' }).click();
      await page.getByRole('dialog', { name: 'How Playground works' }).waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('textbox', { name: 'Project name', exact: true }).inputValue(), titleBeforeTour);
      assert.equal(await page.getByRole('dialog', { name: 'How Playground works' }).isVisible(), false);
      check('canvas text editing works and the actual tutorial closes without replacing the project');

      await page.getByRole('button', { name: 'Finish', exact: true }).click();
      const review = page.getByRole('dialog', { name: 'Review this version.' });
      await review.getByRole('button', { name: 'Prepare current draft', exact: true }).click();
      await review.getByRole('button', { name: width <= 640 ? 'Mobile' : 'Desktop', exact: true }).click();
      const frozen = page.frameLocator('iframe[title="Frozen package preview"]');
      await frozen.locator('body[data-editing="false"]').waitFor();
      await frozen.getByRole('heading', { name: 'A working page preview' }).waitFor();
      await clickContactNavigation(frozen);
      assert.equal(await frozen.getByRole('main', { name: 'Start a Playground project' }).count(), 0);
      const frozenFrame = await (await page.locator('iframe[title="Frozen package preview"]').elementHandle()).contentFrame();
      assert.ok(frozenFrame);
      const isolation = await frozenFrame.evaluate(() => {
        let storageBlocked = false, parentBlocked = false;
        try { localStorage.getItem('test'); } catch { storageBlocked = true; }
        try { parent.document.title; } catch { parentBlocked = true; }
        return { storageBlocked, parentBlocked };
      });
      assert.deepEqual(isolation, { storageBlocked: true, parentBlocked: true });
      check('frozen script bytes execute under nonce CSP; links stay local and parent/storage access stays blocked');
      await page.screenshot({ path: `${out}/${engine}-${width}-finish.png`, fullPage: true });
      await review.getByRole('button', { name: 'Close finish review' }).click();
      const afterReview = await save();
      await page.reload(); await page.getByRole('button', { name: 'Continue project', exact: true }).click();
      await page.frameLocator('iframe[title="Your page preview"]').getByRole('heading', { name: 'A working page preview' }).waitFor();
      assert.deepEqual((await saved()).project, afterReview.project);
      await localOnly(); assert.deepEqual(record.errors, []);
      check('device reopen preserves the edited page with no cloud calls or app runtime errors');
    } catch (error) { record.failure = error.stack; process.exitCode = 1; console.error(error.stack); await page.screenshot({ path: `${out}/${engine}-${width}-failure.png`, fullPage: true }).catch(() => {}); }
    finally { await context.close(); }
  }
  await browser.close();
}
await writeFile(`${out}/receipt.json`, JSON.stringify({ timestamp: new Date().toISOString(), base, records }, null, 2) + '\n');
