import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.HERO_BASE_URL || process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const output = path.join(process.env.PG_EVIDENCE_DIR || process.env.TEMP || '/tmp', 'hero');
const engines = (process.env.HERO_ENGINES || 'chromium,firefox,webkit').split(',');
await mkdir(output, { recursive: true });
const results = [];
for (const engine of engines) {
  const browser = await pw[engine].launch({ headless: true,
    ...(engine === 'chromium' && process.platform === 'win32' ? { args: ['--use-angle=d3d11'] } : {}),
  });
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.heroDraws = 0;
        const draw = WebGLRenderingContext.prototype.drawArrays;
        WebGLRenderingContext.prototype.drawArrays = function (...args) { window.heroDraws++; return draw.apply(this, args); };
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      try {
        await page.goto(base); await page.waitForLoadState('networkidle');
        await page.locator('#home-title').waitFor({ state: 'visible' });
        await page.waitForFunction(() => ['playing', 'unavailable'].includes(document.querySelector('.ew-hero-scene')?.dataset.motion));
        assert.match(await page.title(), /Eidos/);
        assert.equal(await page.locator('vite-error-overlay').count(), 0);
        const scene = page.locator('.ew-hero-scene');
        const state = await scene.evaluate(el => ({ ...el.dataset }));
        assert.equal(state.motionAmount, '0.45'); assert.equal(state.water, '0.41'); assert.equal(state.light, '0.38');
        const geometry = await page.evaluate(() => {
          const cta = document.querySelector('.ew-hero-glass'), rect = cta.getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth > innerWidth, height: rect.height, right: rect.right,
            belowCopy: rect.bottom <= document.querySelector('.ew-hero-scene').getBoundingClientRect().top,
            frost: getComputedStyle(cta).getPropertyValue('--ew-glass-frost'),
            headlineTop: document.querySelector('#home-title').getBoundingClientRect().top };
        });
        assert.equal(geometry.overflow, false); assert.ok(geometry.height >= 44); assert.ok(geometry.right <= width);
        assert.ok(geometry.headlineTop > 80); assert.equal(geometry.frost, '3.6px');
        if (width <= 980) assert.equal(geometry.belowCopy, true);
        await page.screenshot({ path: path.join(output, `${engine}-${width}.png`) });
        if (state.motion === 'playing') {
          await page.getByRole('button', { name: 'Pause hero animation' }).click();
          assert.equal(await scene.getAttribute('data-motion'), 'paused');
          const frozen = await page.evaluate(() => window.heroDraws);
          await page.waitForTimeout(150);
          assert.equal(await page.evaluate(() => window.heroDraws), frozen, 'Paused renderer kept drawing');
          await page.setViewportSize({ width, height: 900 });
          assert.equal(await scene.getAttribute('data-motion'), 'paused');
          await page.getByRole('button', { name: 'Play hero animation' }).click();
          await page.waitForFunction(() => document.querySelector('.ew-hero-scene').dataset.motion === 'playing');
          await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
          await page.waitForFunction(() => document.querySelector('.ew-hero-scene').dataset.motion === 'suspended');
          await page.evaluate(() => scrollTo(0, 0));
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => !document.querySelector('.ew-hero-scene').classList.contains('is-ready'));
        assert.equal(await page.locator('.ew-hero-pause').isVisible(), false);
        assert.equal(await scene.locator('img').evaluate(img => img.complete && img.naturalWidth === 1672), true);
        await page.keyboard.press('Tab'); await page.locator('.ew-hero-glass').focus();
        assert.equal(await page.locator('.ew-hero-glass').evaluate(el => el.matches(':focus-visible')), true);
        await page.keyboard.press('Enter'); await page.waitForURL(/\/contact\/?$/);
        await page.locator('h1').waitFor({ state: 'visible' }); await page.waitForLoadState('networkidle');
        await page.goto(base); await page.waitForLoadState('networkidle'); await page.locator('.ew-actions a[href="/work"]').click();
        await page.waitForURL(/\/work\/?$/); await page.locator('h1').waitFor({ state: 'visible' }); await page.waitForLoadState('networkidle');
        assert.deepEqual(errors, []);
        results.push({ engine, width, ...state, passed: true });
        console.log(`Hero ${engine} ${width}: passed (${state.motion})`);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2)); }
}
