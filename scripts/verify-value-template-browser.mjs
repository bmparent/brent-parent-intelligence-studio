import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.env.VALUE_TEMPLATE_EVIDENCE || path.join(os.tmpdir(), 'eidos-value-template-evidence'));
await fs.mkdir(output, { recursive: true });
const extracted = path.join(output, 'extracted');
await fs.mkdir(extracted, { recursive: true });
const unzip = spawn('python3', ['-c',
  'from pathlib import Path; import sys, zipfile; [zipfile.ZipFile(p).extractall(sys.argv[2]) for p in Path(sys.argv[1]).glob("*-private-draft.zip")]',
  path.join(root, 'artifacts/value-templates'), extracted], { stdio: 'inherit' });
await new Promise((resolve, reject) => { unzip.on('exit', code => code === 0 ? resolve() : reject(new Error(`extract: ${code}`))); unzip.on('error', reject); });

// Exact buyer packages are opened directly, without a server or repository siblings.
const browser = await chromium.launch({ headless: true });
const receipt = { engine: 'Chromium', input: 'exact extracted draft ZIPs via file://', checks: [], screenshots: [] };
const check = (name, detail = {}) => receipt.checks.push({ name, state: 'pass', ...detail });
const url = (slug, page = 'index.html') => new URL(`file://${path.join(extracted, slug, page)}`).href;
const screenshots = [];
try {
  for (const width of [1440, 390, 320]) {
    for (const slug of ['gatherline', 'porchlight', 'plainspoken']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [], remote = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (/^https?:/.test(request.url())) remote.push(request.url()); });
      const pages = slug === 'plainspoken' ? ['index.html', 'services.html', 'contact.html'] : ['index.html'];
      for (const filename of pages) {
        await page.goto(url(slug, filename));
        await page.locator('h1').waitFor();
        assert.match(await page.title(), /Gatherline|Porchlight|Plainspoken/i);
        assert.equal(await page.locator('h1').count(), 1);
        const metrics = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).length,
          body: document.body.innerText.length,
          background: getComputedStyle(document.documentElement).backgroundColor,
          hiddenHorizontalText: [...document.querySelectorAll('h1,h2,h3,button,input,select,textarea,nav a')].filter(element => {
            const rect = element.getBoundingClientRect();
            return getComputedStyle(element).display !== 'none' && rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
          }).map(element => element.textContent?.trim().slice(0, 70))
        }));
        assert.ok(metrics.body > 150);
        assert.equal(metrics.overflow, false, `${slug}/${filename} overflows at ${width}`);
        assert.equal(metrics.brokenImages, 0);
        assert.deepEqual(metrics.hiddenHorizontalText, []);
        if (slug === 'plainspoken') assert.equal(metrics.background, 'rgb(255, 255, 255)');
        const shot = `${slug}-${filename.replace('.html', '')}-${width}.png`;
        await page.screenshot({ path: path.join(output, shot), fullPage: true });
        screenshots.push(shot);
        check('page identity, nonblank, assets and overflow', { slug, filename, width });
      }
      await page.goto(url(slug));
      if (slug === 'gatherline') {
        const calendar = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Save the date', exact: true }).click();
        const download = await calendar;
        const bytes = await fs.readFile(await download.path(), 'utf8');
        assert.equal(download.suggestedFilename(), 'workshop.ics');
        assert.ok(bytes.includes('DTSTART:20261114T150000Z\r\nDTEND:20261114T170000Z'));
        assert.ok(bytes.includes('SUMMARY:Gatherline creative workshop'));
        assert.ok(bytes.endsWith('END:VCALENDAR\r\n'));
        assert.match(await page.locator('[data-calendar-status]').innerText(), /No booking has been made/);
        await page.getByText('Workshop details', { exact: true }).click();
        assert.ok(await page.locator('details').getAttribute('open') !== null);
        await page.getByText('Workshop details', { exact: true }).press('Enter');
        assert.equal(await page.locator('details').getAttribute('open'), null);
        check('actual .ics download, explicit UTC times, no booking and native details', { slug, width });
      } else {
        if (slug === 'plainspoken') {
          await page.getByRole('link', { name: 'Services', exact: true }).click();
          await page.getByRole('link', { name: 'Ask about a working plan', exact: true }).click();
          assert.equal(await page.getByLabel('Your focus', { exact: true }).inputValue(), 'plan');
          await page.getByLabel('Your team', { exact: true }).fill('A small independent team');
          await page.getByLabel('What would a useful result look like?', { exact: true }).fill('Make our weekly handoff easier to follow.');
          await page.getByRole('button', { name: 'Prepare my brief', exact: true }).click();
        } else {
          await page.getByRole('link', { name: 'Plan a visit', exact: true }).first().click();
          await page.getByLabel('Project type', { exact: true }).selectOption('garden');
          await page.getByLabel('Your area', { exact: true }).fill('Mount Dora');
          await page.getByLabel('Timing', { exact: true }).selectOption({ label: 'Flexible' });
          await page.getByLabel('A few details', { exact: true }).fill('Tidy the front garden and talk through planting ideas.');
          await page.getByRole('button', { name: 'Prepare inquiry', exact: true }).click();
        }
        const result = page.locator('[data-inquiry-result]');
        assert.ok(await result.isVisible());
        assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-inquiry-result')), true);
        assert.equal(await page.locator('[data-email-draft]').isVisible(), false);
        const expected = await page.getByRole('textbox', { name: 'Prepared inquiry text', exact: true }).inputValue();
        assert.ok(expected.includes(slug) && expected.length > 100);
        const textDownload = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Download draft', exact: true }).click();
        const downloaded = await textDownload;
        assert.equal(await fs.readFile(await downloaded.path(), 'utf8'), expected + '\n');
        await page.getByRole('button', { name: 'Edit details', exact: true }).click();
        assert.equal(await result.isVisible(), false);
        assert.equal(await page.evaluate(() => document.activeElement.tagName), 'SELECT');
        check('navigation/preselection, in-memory composition, focus, exact text download and edit', { slug, width });
      }
      assert.deepEqual(errors, [], `${slug} runtime errors at ${width}`);
      assert.deepEqual(remote, [], `${slug} made external requests`);
      check('no runtime errors or external requests', { slug, width });
      await context.close();
    }
  }

  // Copy, calendar-injection and configuration-error boundaries in actual browser code.
  const edge = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
  const page = await edge.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(window, 'TEMPLATE_CONFIG', {
      configurable: true,
      set(value) {
        value.copy.headline = '<img src=x onerror=alert(1)> & a real headline';
        value.event.title = 'Workshop\r\nATTENDEE:intruder@example.invalid';
        value.event.description = 'Café, craft; and 漢字 '.repeat(14);
        this.__checkedConfig = value;
      },
      get() { return this.__checkedConfig; }
    });
  });
  await page.goto(url('gatherline'));
  assert.match(await page.locator('h2').innerText(), /^<img src=x/);
  assert.equal(await page.locator('img').count(), 0);
  const injectionDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save the date', exact: true }).click();
  const injection = await fs.readFile(await (await injectionDownload).path(), 'utf8');
  assert.ok(!injection.includes('\r\nATTENDEE:'));
  assert.ok(injection.includes('Workshop\\nATTENDEE:'));
  assert.ok(injection.split('\r\n').every(line => Buffer.byteLength(line, 'utf8') <= 75));
  check('configuration text is not HTML; calendar injection escaped and UTF-8 lines folded');
  await edge.close();

  const invalid = await browser.newContext();
  const badPage = await invalid.newPage();
  await badPage.addInitScript(() => {
    Object.defineProperty(window, 'TEMPLATE_CONFIG', {
      set(value) { value.event.endUtc = value.event.startUtc; this.__badConfig = value; },
      get() { return this.__badConfig; }
    });
  });
  await badPage.goto(url('gatherline'));
  await badPage.getByRole('button', { name: 'Save the date', exact: true }).click();
  assert.match(await badPage.locator('[data-calendar-status]').innerText(), /date needs attention/);
  check('invalid/reversed calendar configuration reports a visible error');
  await invalid.close();

  for (const slug of ['gatherline', 'porchlight', 'plainspoken']) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const fallback = await context.newPage();
    await fallback.goto(url(slug));
    assert.ok((await fallback.locator('body').innerText()).length > 200);
    assert.equal(await fallback.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    if (slug === 'gatherline') {
      await fallback.getByText('Workshop details', { exact: true }).click();
      assert.ok(await fallback.locator('details').getAttribute('open') !== null);
    }
    check('readable no-JavaScript fallback', { slug, width: 390 });
    await context.close();
  }

  const nativeSizes = { gatherline: [1586, 992], porchlight: [1086, 1448], plainspoken: [1190, 1322] };
  for (const [slug, [width, height]] of Object.entries(nativeSizes)) {
    const context = await browser.newContext({ viewport: { width, height } });
    const nativePage = await context.newPage();
    await nativePage.goto(url(slug));
    await nativePage.locator('h1').waitFor();
    if (slug === 'porchlight') {
      const headingLines = await nativePage.locator('h1').evaluate(element => element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight));
      assert.equal(Math.round(headingLines), 2, 'Porchlight concept headline must stay on two lines at its reference width');
    }
    const name = `${slug}-native.jpg`;
    const screenshot = await nativePage.screenshot({ fullPage: true, type: 'jpeg', quality: 82 });
    await fs.writeFile(path.join(output, name), screenshot);
    screenshots.push(name);
    check('native-concept-size render captured for visual comparison', { slug, width, height });
    await context.close();
  }

  const viewerContext = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
  const viewer = await viewerContext.newPage();
  await viewer.goto(new URL(`file://${path.join(root, 'artifacts/value-templates/Eidos_Affordable_Template_Preview_2026-10-22.html')}`).href);
  await viewer.getByRole('button', { name: 'Porchlight · $29', exact: true }).click();
  await viewer.frameLocator('#preview').getByRole('heading', { name: 'A little care. A better place.', exact: true }).waitFor();
  const reviewFrame = viewer.frameLocator('#preview');
  await reviewFrame.getByLabel('Project type', { exact: true }).selectOption('garden');
  await reviewFrame.getByLabel('Your area', { exact: true }).fill('Mount Dora');
  await reviewFrame.getByLabel('Timing', { exact: true }).selectOption({ label: 'Flexible' });
  await reviewFrame.getByLabel('A few details', { exact: true }).fill('A small garden project from the portable review.');
  await reviewFrame.getByRole('button', { name: 'Prepare inquiry', exact: true }).click();
  assert.equal(await reviewFrame.locator('[data-inquiry-result]').isVisible(), true);
  const previewDownload = viewer.waitForEvent('download');
  await reviewFrame.getByRole('button', { name: 'Download draft', exact: true }).click();
  assert.match(await fs.readFile(await (await previewDownload).path(), 'utf8'), /portable review/);
  await viewer.getByRole('button', { name: 'Plainspoken · $59', exact: true }).click();
  await viewer.getByLabel('Template page', { exact: true }).selectOption('services.html');
  await viewer.frameLocator('#preview').getByRole('link', { name: 'Ask about a working plan', exact: true }).click();
  assert.equal(await viewer.frameLocator('#preview').getByLabel('Your focus', { exact: true }).inputValue(), 'plan');
  await viewer.getByLabel('Preview width', { exact: true }).selectOption('390');
  assert.equal(await viewer.locator('#stage').evaluate(element => element.getBoundingClientRect().width), 390);
  await viewer.screenshot({ path: path.join(output, 'portable-preview.png'), fullPage: true });
  screenshots.push('portable-preview.png');
  check('portable review switches products/pages, composes and downloads locally, and preserves service context/phone width');
  await viewerContext.close();
} finally {
  receipt.screenshots = screenshots;
  await fs.writeFile(path.join(output, 'browser-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify({ passed: receipt.checks.length, screenshots: receipt.screenshots.length, output }, null, 2));
