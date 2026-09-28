import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-digital-experiences';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base + '/services/digital-experiences/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Make the thing you do feel unmistakable/ }).waitFor();
    assert.equal(await page.getByRole('main').count(), 1, 'one main landmark');

    const stage = page.locator('.dx-stage');
    await page.getByRole('button', { name: /MDCA Webstore/ }).click();
    assert.match(await stage.innerText(), /MDCA Webstore/);
    assert.match(await stage.locator('a').getAttribute('href'), /mdca_webstore_\/shop\/home/);
    await page.getByRole('button', { name: /Tidal/ }).click();
    assert.match(await stage.innerText(), /Tidal/);

    await page.getByRole('button', { name: 'Guide a purchase' }).click();
    assert.match(await page.locator('.dx-translate__result').innerText(), /Holidays in Hollywood/);
    assert.equal(await page.getByRole('link', { name: 'Visit the live webstore' }).count(), 1);
    assert.equal(await page.getByRole('link', { name: 'Explore the illustrated house' }).count(), 1);
    assert.equal(await page.getByRole('link', { name: /Build a page in Playground/ }).count(), 1);

    const size = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(size.body <= size.viewport + 1, `horizontal overflow at ${width}px: ${JSON.stringify(size)}`);
    assert.deepEqual(errors, [], 'no client errors');
    await page.screenshot({ path: path.join(evidence, `digital-experiences-${width}.png`), fullPage: true });
    console.log(`PASS ${width}: project selector, customer goal, links, landmark, client errors, and layout`);
  } finally {
    await context.close();
  }
}

await browser.close();
