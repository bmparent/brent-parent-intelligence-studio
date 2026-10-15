import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-digital-experiences';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {});

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
    await page.getByRole('heading', { name: /Custom websites.*Unmistakable experiences/ }).waitFor();
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

// About -> service -> collection -> item -> detail -> bag is the customer flow
// affected by the thumbnail, model scale and garment-placement corrections.
for (const width of [1440, 768, 390, 320]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width <= 390, reducedMotion: width === 390 ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  const consoleMessages = [];
  page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) consoleMessages.push({ url: page.url(), type: message.type(), text: message.text() }); });
  // Vite preview falls back to homepage HTML for extensionless directory URLs.
  // Match Pages' clean-path resolution while exercising the actual native links;
  // keep this adapter off for hosted verification, where real responses apply.
  if (['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.isNavigationRequest() && url.origin === new URL(base).origin && ['/services/digital-experiences', '/work/holidays-in-hollywood'].includes(url.pathname)) {
      url.pathname += '/';
      return route.fulfill({ response: await route.fetch({ url: url.href }) });
    }
    return route.continue();
  });
  let passed = false;
  const overflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `no horizontal overflow at ${width}`);
  const capture = async (name, locator) => {
    await locator.scrollIntoViewIfNeeded();
    // SVG image layers have no decode() API. Check each distinct source through
    // the browser's image decoder before capturing the actual composition.
    for (const source of await locator.locator('svg image').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('href')))])) {
      assert.equal(await page.evaluate(async source => {
        const img = new Image(); img.src = source;
        try { await img.decode(); return img.naturalWidth > 0; } catch { return false; }
      }, source), true, `artwork loads: ${source}`);
    }
    const box = await locator.boundingBox();
    // Tall two-row grids are captured card by card so sticky navigation does not
    // cover the first row in the evidence. The normal UI remains unchanged.
    const cards = locator.locator(':scope > button');
    if (box.height > 650 && await cards.count()) {
      for (let index = 0; index < await cards.count(); index++) await capture(`${name}-${index + 1}`, cards.nth(index));
      return;
    }
    await locator.evaluate(el => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - (el.matches('.dx-stage') ? 120 : 215)));
    await locator.screenshot({ path: path.join(evidence, `${name}-${width}.png`) });
  };
  try {
    await page.goto(base + '/about/', { waitUntil: 'domcontentloaded' });
    assert.match(await page.title(), /About/i);
    await page.getByRole('heading', { name: 'A studio led by operational experience.' }).waitFor();
    await page.getByRole('button', { name: 'Essential only', exact: true }).click();
    const thumbnail = page.locator('.ew-service-preview');
    await capture('about-thumbnail', thumbnail);
    assert.equal(await thumbnail.locator('svg.sd-art').count(), 2, 'two composed model pairs in About thumbnail');
    assert.equal(await thumbnail.locator('[src*="full-storefront-reference"]').count(), 0, 'flattened screenshot replaced');
    await overflow();
    await page.getByRole('link', { name: /Explore Digital Experiences/ }).click();
    await page.getByRole('heading', { name: /Custom websites.*Unmistakable experiences/ }).waitFor();
    await capture('service-thumbnail', page.locator('.dx-stage'));
    await page.locator('.dx-stage > a').click();
    await page.locator('.sd-demo.sd-holiday').waitFor();
    assert.match(new URL(page.url()).pathname, /holidays-in-hollywood/);
    const demo = page.locator('.sd-demo');
    const hero = demo.locator('.sd-hero');
    const copy = await hero.locator('.sd-hero-copy').boundingBox();
    for (const cast of await hero.locator('.sd-cast').all()) {
      const box = await cast.boundingBox();
      const overlap = Math.max(0, Math.min(box.x + box.width, copy.x + copy.width) - Math.max(box.x, copy.x)) * Math.max(0, Math.min(box.y + box.height, copy.y + copy.height) - Math.max(box.y, copy.y));
      assert.equal(overlap, 0, 'model and central title do not overlap');
    }
    await capture('holidays-hero', hero);
    await capture('holidays-categories', demo.locator('.sd-categories'));
    for (const art of await demo.locator('.sd-category-art').all()) {
      const box = await art.boundingBox();
      assert.ok(Math.abs(box.width / box.height - 2 / 3) < .01, 'category model uses its native portrait ratio');
    }
    if (width === 390) assert.equal(await demo.locator('.sd-marquee-glint').first().evaluate(el => getComputedStyle(el).animationName), 'none', 'system reduced motion honored');
    else {
      await demo.getByRole('button', { name: 'Pause motion', exact: true }).click();
      assert.equal(await demo.getByRole('button', { name: 'Resume motion', exact: true }).count(), 1);
    }
    await demo.getByRole('button', { name: 'Jackets', exact: true }).click();
    assert.match(await demo.locator('.sd-results').innerText(), /1/);
    await demo.locator('.sd-card').click();
    await capture('holidays-product', demo.locator('.sd-product-image'));
    await demo.getByRole('button', { name: 'Inspect detail ＋' }).click();
    assert.equal(await demo.getByRole('dialog').isVisible(), true);
    assert.equal(await demo.locator('.sd-zoom-scroll [data-garment-mark]').count(), 1, 'corrected artwork retained in enlarged view');
    await page.keyboard.press('Escape');
    await demo.getByRole('button', { name: 'M', exact: true }).click();
    await demo.getByRole('button', { name: /Add to demo bag/ }).click();
    await demo.getByRole('button', { name: /View demo bag/ }).click();
    assert.equal(await demo.locator('.sd-bag-art [data-garment-mark]').count(), 1, 'corrected artwork retained in bag');
    await demo.getByRole('button', { name: /Remove The jacket look/ }).click();
    await demo.getByRole('button', { name: 'All products', exact: true }).click();
    await demo.getByRole('searchbox', { name: 'Find an item' }).fill('no matching design');
    assert.equal(await demo.getByRole('heading', { name: 'No matching items' }).count(), 1);
    await demo.getByRole('button', { name: 'Clear filters', exact: true }).click();
    assert.equal(await demo.locator('.sd-card').count(), 4);
    await capture('holidays-collection', demo.locator('.sd-grid'));
    for (let index = 0; index < 4; index++) {
      await demo.locator('.sd-card').nth(index).click();
      await capture(`holidays-item-${index + 1}`, demo.locator('.sd-product-image'));
      await demo.getByRole('button', { name: 'All products', exact: true }).click();
    }
    await overflow();
    assert.deepEqual(errors, [], 'no application runtime errors');
    passed = true;
    console.log(`PASS ${width}: About/service previews, unclipped hero, portrait proportions, motion, category/product/detail/bag, empty filter recovery, loaded artwork, no overflow or runtime errors`);
  } finally {
    await writeFile(path.join(evidence, `holidays-results-${width}.json`), JSON.stringify({ width, base, passed, errors, consoleMessages, testedAt: new Date().toISOString(), cleanPathAdapter: ['127.0.0.1', 'localhost'].includes(new URL(base).hostname) }, null, 2));
    await context.close();
  }
}

await browser.close();
