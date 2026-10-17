import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { launchOptions, guardLocalEditor } from './playground-local-browser-guard.mjs';
const require = createRequire(import.meta.url), pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:5184';
const out = (process.env.PG_PURCHASE_EVIDENCE || 'artifacts/playground-starter-focus') + '/starter-focus';
await mkdir(out, { recursive: true });
const browser = await pw.webkit.launch(launchOptions('webkit'));
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const receipt = { kind: 'controlled WebKit deferred starter focus; no providers', diagnosticOnly: process.env.PG_FOCUS_DIAGNOSTIC_ONLY === '1', checks: [] };
try {
  const assertLocal = await guardLocalEditor(page);
  await page.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window), focus = HTMLElement.prototype.focus;
    const pending = []; window.__starterFocus = { held: 0, released: 0 };
    window.requestAnimationFrame = callback => {
      if (document.querySelector('.pg-start') && /\.focus\(/.test(String(callback))) {
        pending.push(callback); window.__starterFocus.held++; return 900001;
      }
      return raf(callback);
    };
    HTMLElement.prototype.focus = function (...args) {
      const result = focus.apply(this, args);
      if (this.matches('.pg-start-customize input[autocomplete="organization"]') && pending.length) {
        // Reproduce the allowed ordering: name field receives focus, then the
        // previously scheduled heading focus runs before the input operation.
        queueMicrotask(() => { for (const callback of pending.splice(0)) { window.__starterFocus.released++; callback(performance.now()); } });
      }
      return result;
    };
  });
  await page.goto(base + '/playground/');
  await page.getByRole('button', { name: /Switchboard/ }).click();
  const input = page.getByLabel('Business or project name');
  await input.fill('Second project');
  receipt.enteredValue = await input.inputValue();
  receipt.focus = await page.evaluate(() => ({ ...window.__starterFocus, activeTag: document.activeElement?.tagName, activeId: document.activeElement?.id }));
  await page.getByRole('button', { name: 'Create project' }).click();
  await page.getByRole('textbox', { name: 'Project name', exact: true }).waitFor();
  await page.locator('.pg-save-inline').filter({ hasText: 'Saved on this device' }).waitFor();
  receipt.savedName = await page.getByRole('textbox', { name: 'Project name', exact: true }).inputValue();
  if (!receipt.diagnosticOnly) {
    assert.equal(receipt.enteredValue, 'Second project');
    assert.equal(receipt.savedName, 'Second project');
    assert.equal(receipt.focus.held, 0, 'starter heading focus must not remain scheduled after the form is interactive');
    receipt.checks.push('immediate WebKit name input survives starter focus and is saved exactly');
  }
  await assertLocal();
  await page.screenshot({ path: out + '/result.png', fullPage: true });
} catch (error) { receipt.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(out + '/receipt.json', JSON.stringify(receipt, null, 2) + '\n'); console.log(JSON.stringify(receipt, null, 2)); }
