import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-intelligent-systems';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      const response = await page.goto(base + '/services/intelligent-systems/', { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      assert.match(await page.title(), /Intelligent Systems/);
      await page.getByRole('heading', { name: /Give assistance a job/ }).waitFor();
      assert.equal(await page.locator('.is-project').count(), 3);
      const headerGap = await page.evaluate(() => document.querySelector('#is-title').getBoundingClientRect().top - document.querySelector('.ew-header').getBoundingClientRect().bottom);
      assert.ok(headerGap >= 10, `hero title clears fixed header by ${headerGap}px`);
      const indexOverlap = await page.evaluate(() => {
        const trigger = document.querySelector('.ew-assistant-trigger').getBoundingClientRect();
        const links = [...document.querySelectorAll('.is-hero__index a')].map(link => {
          const box = link.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom, overlap: box.top < innerHeight && box.bottom > 0 && box.left < trigger.right && box.right > trigger.left && box.top < trigger.bottom && box.bottom > trigger.top };
        });
        return { overlap: links.some(link => link.overlap), links, trigger: { top: trigger.top, bottom: trigger.bottom } };
      });
      assert.equal(indexOverlap.overlap, false, `assistant trigger does not cover a project link: ${JSON.stringify(indexOverlap)}`);
      const introOverlap = await page.evaluate(() => {
        const trigger = document.querySelector('.ew-assistant-trigger').getBoundingClientRect();
        return [...document.querySelectorAll('.is-intro > p, .is-intro > h2')].some(element => {
          const box = element.getBoundingClientRect();
          return box.top < innerHeight && box.bottom > 0 && box.left < trigger.right && box.right > trigger.left && box.top < trigger.bottom && box.bottom > trigger.top;
        });
      });
      assert.equal(introOverlap, false, 'assistant trigger does not cover first-viewport intro copy');
      assert.match(await page.locator('#is-project-01').innerText(), /reflection tool, not diagnosis/i);
      assert.match(await page.locator('#is-project-03').innerText(), /Research-stage system/i);
      assert.equal(await page.getByRole('link', { name: /Try a source-backed answer/ }).getAttribute('href'), '#is-answer');

      const projectLink = page.locator('.is-hero__index a').first();
      await projectLink.focus();
      assert.equal(await projectLink.evaluate(el => el.matches(':focus-visible')), true, 'project link focus is visible');
      await page.keyboard.press('Enter');
      assert.match(page.url(), /#is-project-01$/);

      const question = page.getByLabel('Choose a question');
      await question.selectOption({ label: 'What does Wellway help with?' });
      assert.match(await page.locator('#is-answer article').innerText(), /Wellway/i);
      assert.ok(await page.locator('#is-answer article a').count() > 0, 'source links appear');
      const essential = page.getByRole('button', { name: 'Essential only' });
      if (await essential.isVisible()) await essential.click();
      const assistant = page.getByRole('button', { name: 'Ask Eidos', exact: true });
      await assistant.click();
      await page.getByRole('dialog', { name: /Hello/ }).waitFor();
      const assistantQuestion = page.getByPlaceholder('What are you imagining?');
      assert.equal(await assistantQuestion.evaluate(el => el === document.activeElement), true, 'dialog field receives focus');
      await assistantQuestion.fill('What does Wellway do?');
      await page.getByRole('button', { name: 'Reset conversation' }).click();
      assert.equal(await assistantQuestion.inputValue(), '', 'reset clears the question');
      await page.keyboard.press('Escape');
      assert.equal(await assistant.evaluate(el => el === document.activeElement), true, 'dialog close returns focus');
      assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);

      for (const img of await page.locator('.is-page img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
        assert.equal(await img.evaluate(el => el.naturalWidth > 0), true, 'project image loads');
      }
      const size = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
      assert.ok(size.body <= size.viewport + 1, `horizontal overflow at ${width}px: ${JSON.stringify(size)}`);
      assert.deepEqual(errors, [], 'no client errors');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(evidence, `intelligent-systems-${width}.png`), fullPage: true });
      console.log(`PASS ${width}: page, project links, source demo, assistant focus, reduced motion, images, and layout`);
    } finally { await context.close(); }
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  await context.route('**/images/work/sentinel-lab.webp', route => route.abort());
  const page = await context.newPage();
  await page.goto(base + '/services/intelligent-systems/', { waitUntil: 'domcontentloaded' });
  await page.locator('#is-project-03').scrollIntoViewIfNeeded();
  await page.getByRole('img', { name: 'Sentinel Lab image unavailable' }).waitFor();
  assert.match(await page.locator('#is-project-03').innerText(), /Project details remain below/);
  await context.close();
  console.log('PASS fallback: unavailable image leaves project detail readable');
} finally { await browser.close(); }
