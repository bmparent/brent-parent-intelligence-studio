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
  const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390, reducedMotion: 'reduce' });
  if (width === 390) await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
      return getContext.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base + '/services/digital-experiences/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Make the thing you do feel unmistakable/ }).waitFor();
    assert.equal(await page.getByRole('main').count(), 1, 'one main landmark');

    const stage = page.locator('.dx-stage');
    const choose = async (button) => width === 390 ? button.tap() : button.click();
    await choose(page.getByRole('button', { name: /MDCA Webstore/ }));
    assert.match(await stage.innerText(), /MDCA Webstore/);
    assert.match(await stage.locator('a').getAttribute('href'), /mdca_webstore_\/shop\/home/);
    await choose(page.getByRole('button', { name: /Tidal/ }));
    assert.match(await stage.innerText(), /Tidal/);

    const houseButton = page.getByRole('button', { name: /Little House/ });
    await houseButton.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await houseButton.evaluate(el => el.matches(':focus-visible')), true, 'project selector keyboard focus is visible');
    await page.keyboard.press('Enter');
    assert.equal(await houseButton.getAttribute('aria-pressed'), 'true', 'project selector responds to keyboard');
    assert.match(await stage.locator('a').getAttribute('href'), /little-house-big-adventures.*\/dollhouse/);

    await choose(page.getByRole('button', { name: 'Guide a purchase' }));
    assert.match(await page.locator('.dx-translate__result').innerText(), /Holidays in Hollywood/i);
    const ideaButton = page.getByRole('button', { name: 'Show a complex idea' });
    await ideaButton.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await ideaButton.evaluate(el => el.matches(':focus-visible')), true, 'customer-goal keyboard focus is visible');
    await page.keyboard.press('Space');
    assert.match(await page.locator('.dx-translate__result').innerText(), /Tidal/i);
    assert.equal(await page.getByRole('link', { name: 'Visit the live webstore' }).count(), 1);
    assert.equal(await page.getByRole('link', { name: 'Explore the illustrated house' }).count(), 1);
    assert.equal(await page.getByRole('link', { name: /Build a page in Playground/ }).count(), 1);
    assert.equal(await stage.locator('img').evaluate(el => getComputedStyle(el).animationName), 'none', 'reduced motion disables image animation');

    for (const img of await page.locator('.dx-page img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
      assert.equal(await img.evaluate(el => el.naturalWidth > 0), true, 'project image loads');
    }
    assert.equal(await page.locator('.dx-project--blue img').evaluate(el => getComputedStyle(el).objectFit), 'contain', 'MDCA reference stays uncropped');
    const contrast = await page.locator('.dx-translate h2').evaluate(el => {
      const rgb = value => value.match(/\d+/g).slice(0, 3).map(Number).map(channel => {
        const c = channel / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      const luminance = value => rgb(value).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const foreground = luminance(getComputedStyle(el).color);
      const background = luminance(getComputedStyle(el.closest('.dx-translate')).backgroundColor);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    assert.ok(contrast >= 4.5, `customer-goal heading contrast is ${contrast.toFixed(2)}:1`);

    const size = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(size.body <= size.viewport + 1, `horizontal overflow at ${width}px: ${JSON.stringify(size)}`);
    assert.deepEqual(errors, [], 'no client errors');
    await page.screenshot({ path: path.join(evidence, `digital-experiences-${width}.png`), fullPage: true });
    console.log(`PASS ${width}: mouse/touch, keyboard, focus, goals, links, loaded images, contrast, reduced motion, and layout`);
  } finally {
    await context.close();
  }
}

await browser.close();
