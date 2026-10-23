import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { guardLocalEditor, launchOptions, readLocalZip } from './playground-local-browser-guard.mjs';

const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = 'https://eidosworks-test-20260923.pages.dev/playground/';
const output = process.env.PG_HOSTED_EVIDENCE_DIR;
assert.ok(output, 'An isolated evidence directory is required.');
await mkdir(output, { recursive: true });
const receipt = {
  kind: 'Hosted assets; synthetic device-only projects; account/config reads controlled; all API writes blocked',
  source: process.env.GITHUB_SHA || 'record separately', base,
  limits: 'Viewport reflow is not physical-device, screen-reader or actual browser-zoom acceptance.',
  cases: [], failures: [],
};
const browser = await pw.chromium.launch(launchOptions('chromium'));
try {
  for (const [width, height] of [[1440, 1000], [720, 450], [390, 844], [320, 740]]) {
    const run = { width, height, checks: [], errors: [] };
    receipt.cases.push(run);
    const context = await browser.newContext({ viewport: { width, height }, acceptDownloads: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.on('pageerror', error => run.errors.push(error.message));
    const assertLocalOnly = await guardLocalEditor(page);
    const name = `Hosted QA ${width}`;
    const check = text => run.checks.push(text);
    const assertFits = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Outer page must not overflow horizontally.');
    const download = async (button, filename) => {
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: button, exact: true }).click();
      await (await pending).saveAs(`${output}/${width}-${filename}`);
      return readFile(`${output}/${width}-${filename}`);
    };
    try {
      await page.goto(base);
      await page.getByRole('heading', { name: 'What are you making?', exact: true }).waitFor();
      run.entryScripts = await page.locator('script[type=module][src]').evaluateAll(scripts => scripts.map(script => script.src));
      assert.ok(run.entryScripts.length);
      if (receipt.cases.length > 1) assert.deepEqual(run.entryScripts, receipt.cases[0].entryScripts, 'Hosted build changed during acceptance.');
      await assertFits();
      await page.getByRole('button', { name: /^Switchboard/ }).click();
      await page.getByLabel('Business or project name', { exact: true }).fill(name);
      await page.getByRole('button', { name: 'Create project', exact: true }).click();
      await page.locator('.pg-unified').waitFor();
      await page.locator('.pg-save-inline').filter({ hasText: 'Saved on this device' }).waitFor();
      await assertFits();
      check('Hosted starter creates and saves a synthetic project without horizontal overflow.');

      await page.getByRole('button', { name: 'Account / Sign in', exact: true }).press('Enter');
      const account = page.getByRole('dialog', { name: 'Your account', exact: true });
      await account.waitFor();
      await account.getByRole('button', { name: 'Back to Playground', exact: true }).press('Tab');
      assert.equal(await account.evaluate(dialog => dialog.contains(document.activeElement)), true);
      await page.keyboard.press('Escape');
      await account.waitFor({ state: 'hidden' });
      assert.equal(await page.getByRole('button', { name: 'Account / Sign in', exact: true }).evaluate(button => button === document.activeElement), true);
      check('Account opens by keyboard, contains tab focus and returns focus after Escape.');

      await page.getByRole('button', { name: 'Finish', exact: true }).press('Enter');
      const finish = page.getByRole('dialog', { name: 'Review this version.', exact: true });
      await finish.getByRole('button', { name: 'Prepare current draft', exact: true }).click();
      const approval = finish.getByLabel('I reviewed this frozen version for my local download.', { exact: true });
      await approval.waitFor();
      await assertFits();
      const bounds = await finish.boundingBox();
      assert.ok(bounds && bounds.x >= -1 && bounds.x + bounds.width <= width + 1, 'Finish review must fit the viewport.');
      await approval.check();
      const archive = await download('Download page package', 'page.zip');
      const integrity = JSON.parse((await download('Download hash receipt', 'receipt.json')).toString('utf8'));
      assert.equal(integrity.purchase, 'not-performed');
      assert.equal(archive.length, integrity.bytes);
      assert.equal(createHash('sha256').update(archive).digest('hex'), integrity.archiveSha256);
      const files = readLocalZip(archive);
      assert.equal(JSON.parse(files.find(file => file.name === 'project.json').data.toString('utf8')).name, name);
      for (const expected of ['index.html', 'styles.css', 'script.js', 'project.json', 'NEXT-STEPS.md']) assert.ok(files.some(file => file.name === expected));
      run.archiveSha256 = integrity.archiveSha256;
      check('Actual ZIP download matches the independently read hash receipt and contains the editable project.');
      await page.screenshot({ path: `${output}/${width}-finish.png` });

      await page.keyboard.press('Escape');
      await finish.waitFor({ state: 'hidden' });
      assert.equal(await page.getByRole('button', { name: 'Finish', exact: true }).evaluate(button => button === document.activeElement), true);
      await page.reload();
      await page.getByRole('button', { name: 'Continue project', exact: true }).click();
      await page.getByRole('button', { name: 'Finish', exact: true }).click();
      await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
      assert.deepEqual(await download('Download page package', 'after-reload.zip'), archive);
      check('Escape restores Finish focus; reload retains the same frozen package bytes.');
      await assertLocalOnly();
      assert.deepEqual(run.errors, []);
      check('No application errors or API/provider writes.');
      console.log(`PASS hosted local acceptance ${width}x${height}`);
    } catch (error) {
      receipt.failures.push({ width, height, error: error.message });
      await page.screenshot({ path: `${output}/${width}-failure.png` }).catch(() => {});
      throw error;
    } finally {
      await context.close();
    }
  }
} catch (error) {
  receipt.error = error.message;
  process.exitCode = 1;
} finally {
  await browser.close();
  receipt.completedAt = new Date().toISOString();
  await writeFile(`${output}/receipt.json`, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt, null, 2));
}
