import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-site-gallery';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {});
const title = 'First National Bank of Mount Dora';
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(base + '/work/', { waitUntil: 'domcontentloaded' });
      const consent = page.getByRole('button', { name: 'Essential only', exact: true });
      if (await consent.isVisible()) await consent.click();
      const gallery = page.locator('#site-gallery');
      await gallery.getByRole('button', { name: 'Storefronts', exact: true }).click();
      await gallery.getByRole('searchbox').fill('Mount Dora');
      assert.equal(await gallery.locator('.ew-site-card').count(), 1, 'FNBMD found by bank name and Storefronts filter');
      const open = gallery.getByRole('button', { name: `Preview ${title}`, exact: true });
      await open.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      assert.match(await dialog.innerText(), /Data Graphics/);
      const image = dialog.locator('.ew-site-full-page-image');
      const scroll = dialog.locator('#site-page-scroll');
      for (const label of ['Homepage', 'Collection', 'Polo details', 'Shirt details']) {
        const button = dialog.getByRole('button', { name: label, exact: true });
        await button.click();
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        await image.evaluate(el => el.decode());
        assert.equal(await image.evaluate(el => el.naturalWidth), 1346, 'real capture decodes');
        assert.equal(await scroll.evaluate(el => el.scrollTop), 0, 'each page starts at its top');
        const destination = await dialog.getByRole('link', { name: /Open this concept page/ }).getAttribute('href');
        assert.ok(destination.startsWith('https://stores.inksoft.com/fnbmd/shop/'), 'page-specific public link');
        if (label === 'Homepage') {
          assert.equal(await image.evaluate(el => el.naturalHeight), 2907, 'entire homepage retained');
          await scroll.evaluate(el => { el.scrollTop = el.scrollHeight; });
        }
        if (label === 'Polo details') {
          await dialog.getByRole('button', { name: 'Read at full size', exact: true }).click();
          await dialog.getByRole('button', { name: 'Fit to width', exact: true }).waitFor();
          console.log('Full-size image state', await image.evaluate(el => ({ style: el.getAttribute('style'), width: el.getBoundingClientRect().width, computedWidth: getComputedStyle(el).width, maxWidth: getComputedStyle(el).maxWidth })));
          await dialog.screenshot({ path: path.join(evidence, `fnbmd-gallery-full-size-${width}.png`) });
          assert.equal(await image.evaluate(el => Math.round(el.getBoundingClientRect().width)), 1346);
          await dialog.getByRole('button', { name: 'Fit to width', exact: true }).click();
          await dialog.getByRole('button', { name: 'Read at full size', exact: true }).waitFor();
          await dialog.screenshot({ path: path.join(evidence, `fnbmd-gallery-product-${width}.png`) });
        }
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no document overflow');
      assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'no dialog overflow');
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), false);
      assert.equal(await open.evaluate(el => el === document.activeElement), true, 'Escape restores trigger focus');
      await open.click();
      assert.equal(await dialog.getByRole('button', { name: 'Homepage', exact: true }).getAttribute('aria-pressed'), 'true', 'reopening resets to homepage');
      await dialog.screenshot({ path: path.join(evidence, `fnbmd-gallery-home-${width}.png`) });
      await dialog.getByRole('button', { name: 'Close site preview' }).click();
      await gallery.getByRole('button', { name: 'All', exact: true }).click();
      await gallery.getByRole('searchbox').fill('Stillwater');
      await gallery.getByRole('button', { name: 'Preview Stillwater House', exact: true }).click();
      assert.match(await dialog.innerText(), /Fictional design concept/);
      assert.equal(await dialog.locator('.ew-site-page-picker').count(), 0, 'existing single-image concepts retain their presentation');
      await page.keyboard.press('Escape');
      await page.goto(base + '/');
      assert.equal(await page.locator('#site-gallery .ew-site-card').getByRole('heading', { name: title }).count(), 1, 'FNBMD retained among the six homepage features');
      assert.deepEqual(errors, [], 'no gallery runtime errors');
      console.log(`PASS FNBMD gallery at ${width}px: discovery, four images, full size, links, scroll reset, focus, concepts, homepage feature, no overflow`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
