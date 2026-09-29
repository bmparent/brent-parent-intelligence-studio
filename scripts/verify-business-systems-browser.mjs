import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-business-systems';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(base + '/services/business-systems/', { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: /Make the next step visible/ }).waitFor();
      assert.equal(await page.locator('.bs-case').count(), 3);
      assert.equal(await page.getByRole('link', { name: /Explore the case study/ }).getAttribute('href'), '/work/production-dashboard');
      assert.equal(await page.getByRole('link', { name: /Open EmbroideryCalc/ }).getAttribute('rel'), 'noopener noreferrer');
      assert.match(await page.locator('.bs-private').innerText(), /SharePoint handoff/);

      const estimator = page.getByRole('button', { name: 'Estimating workspace' });
      await estimator.focus();
      assert.equal(await estimator.evaluate(el => el.matches(':focus-visible')), true, 'demo tab focus is visible');
      await page.keyboard.press('Enter');
      assert.equal(await estimator.getAttribute('aria-pressed'), 'true');
      await page.getByLabel('Quantity').fill('200');
      assert.match(await page.locator('.concept-estimate aside').innerText(), /200 ×/);

      for (const img of await page.locator('.bs-page img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
        assert.equal(await img.evaluate(el => el.naturalWidth > 0), true, 'case image loads');
      }
      const size = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
      assert.ok(size.body <= size.viewport + 1, `horizontal overflow at ${width}px: ${JSON.stringify(size)}`);
      assert.deepEqual(errors, [], 'no client errors');
      await page.screenshot({ path: path.join(evidence, `business-systems-${width}.png`), fullPage: true });
      console.log(`PASS ${width}: cases, links, fictional demo, focus, loaded images, and layout`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
