import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
const receipt = { engine: 'Chromium', input: 'exact extracted draft ZIPs via file://', result: 'incomplete', checks: [], screenshots: [] };
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
        assert.match(await page.locator('[data-gatherline-status]').innerText(), /No booking has been made/);
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
    Object.defineProperty(window, 'GATHERLINE_CONFIG', {
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
    Object.defineProperty(window, 'GATHERLINE_CONFIG', {
      set(value) { value.event.endUtc = value.event.startUtc; this.__badConfig = value; },
      get() { return this.__badConfig; }
    });
  });
  await badPage.goto(url('gatherline'));
  await badPage.getByRole('button', { name: 'Save the date', exact: true }).click();
  assert.match(await badPage.locator('[data-gatherline-status]').innerText(), /date needs attention/);
  check('invalid/reversed calendar configuration reports a visible error');
  await invalid.close();

  for (const slug of ['gatherline', 'porchlight', 'plainspoken']) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const fallback = await context.newPage();
    await fallback.goto(url(slug));
    assert.ok((await fallback.locator('body').innerText()).length > 200);
    assert.equal(await fallback.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    if (slug === 'gatherline') {
      assert.equal(await fallback.getByRole('button', { name: 'Save the date', exact: true }).isDisabled(), true);
      await fallback.getByText('Workshop details', { exact: true }).click();
      assert.ok(await fallback.locator('details').getAttribute('open') !== null);
    } else {
      if (slug === 'plainspoken') await fallback.goto(url(slug, 'contact.html'));
      for (const control of await fallback.locator('[data-inquiry-form] input, [data-inquiry-form] select, [data-inquiry-form] textarea, [data-inquiry-form] button').all()) {
        assert.equal(await control.isDisabled(), true, 'No-JS composer must not accept fields or submit into a URL');
      }
      assert.equal(await fallback.locator('[data-inquiry-unavailable]').isVisible(), true);
      const before = fallback.url();
      await fallback.locator('body').press('Enter');
      assert.equal(fallback.url(), before);
    }
    check('readable no-JavaScript fallback; unavailable actions disabled and inquiry fields cannot submit', { slug, width: 390 });
    await context.close();
  }

  // A failed runtime download must preserve the same safe, honest fallback.
  for (const slug of ['porchlight', 'plainspoken']) {
    const broken = path.join(output, 'missing-script', slug);
    await fs.mkdir(path.dirname(broken), { recursive: true });
    await fs.cp(path.join(extracted, slug), broken, { recursive: true });
    await fs.unlink(path.join(broken, 'runtime.js'));
    const context = await browser.newContext();
    try {
      const failed = await context.newPage();
      await failed.goto(pathToFileURL(path.join(broken, slug === 'plainspoken' ? 'contact.html' : 'index.html')).href);
      assert.equal(await failed.locator('[data-inquiry-fields]').evaluate(element => element.hasAttribute('disabled')), true);
      for (const control of await failed.locator('[data-inquiry-form] input, [data-inquiry-form] select, [data-inquiry-form] textarea, [data-inquiry-form] button').all()) {
        assert.equal(await control.isDisabled(), true, 'Missing runtime must keep the actual input and submit controls disabled');
      }
      assert.equal(await failed.locator('[data-inquiry-unavailable]').isVisible(), true);
      assert.equal(new URL(failed.url()).search, '');
      check('missing runtime file keeps inquiry disabled and never reports a sent message', { slug });
    } finally {
      await context.close();
    }
  }

  // Use each real buyer setup page, download its configuration, replace the
  // buyer's file, then exercise the actual personalized website. No init-script
  // injection or repository siblings stand in for that customer workflow.
  for (const slug of ['gatherline', 'porchlight', 'plainspoken']) {
    const buyer = path.join(output, 'customized', slug);
    await fs.mkdir(path.dirname(buyer), { recursive: true });
    await fs.cp(path.join(extracted, slug), buyer, { recursive: true });
    const buyerUrl = filename => pathToFileURL(path.join(buyer, filename)).href;
    const context = await browser.newContext({ viewport: { width: 390, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
    const setup = await context.newPage();
    const errors = [], remote = [];
    setup.on('pageerror', error => errors.push(error.message));
    setup.on('request', request => { if (/^https?:/.test(request.url())) remote.push(request.url()); });
    await setup.goto(buyerUrl('START-HERE.html'));
    assert.match(await setup.title(), /Set up /);
    assert.equal(await setup.locator('[data-setup-fields]').evaluate(element => element.hasAttribute('disabled')), false);
    assert.equal(await setup.getByRole('button', { name: 'Download config.js', exact: true }).isEnabled(), true);
    assert.equal(await setup.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    const brand = 'Café & Craft "a useful place"';
    const headline = 'Make something useful.\nBring your own ideas.';
    await setup.locator('#setup-copy-brand').fill(brand);
    await setup.locator('#setup-copy-headline').fill(headline);
    let setupDownloads = 0;
    setup.on('download', () => { setupDownloads += 1; });
    await setup.locator('#setup-colors-paper').fill('not-a-color');
    await setup.getByRole('button', { name: 'Download config.js', exact: true }).click();
    assert.equal(await setup.locator('#setup-colors-paper').evaluate(element => element.checkValidity()), false);
    assert.equal(setupDownloads, 0, 'Invalid color must not produce a replacement config');
    await setup.locator('#setup-colors-paper').fill('#f8f5ee');
    if (slug === 'gatherline') {
      await setup.locator('#setup-event-startUtc').fill('2026-11-14T15:00:00Z');
      await setup.locator('#setup-event-endUtc').fill('2026-11-14T14:00:00Z');
      await setup.getByRole('button', { name: 'Download config.js', exact: true }).click();
      assert.match(await setup.locator('[data-setup-status]').innerText(), /make the end later/);
      assert.equal(setupDownloads, 0);
      await setup.locator('#setup-event-endUtc').fill('2026-11-14T18:00:00Z');
      await setup.locator('#setup-copy-time').fill('10:00 am – 1:00 pm ET');
    } else {
      await setup.locator('#setup-contactEmail').fill('not-an-email');
      await setup.getByRole('button', { name: 'Download config.js', exact: true }).click();
      assert.equal(await setup.locator('#setup-contactEmail').evaluate(element => element.checkValidity()), false);
      assert.equal(setupDownloads, 0, 'Invalid recipient must not produce a replacement config');
      await setup.locator('#setup-contactEmail').fill('owner@localhost');
      await setup.getByRole('button', { name: 'Download config.js', exact: true }).click();
      assert.match(await setup.locator('[data-setup-status]').innerText(), /public email address with a full domain/);
      assert.equal(setupDownloads, 0, 'Setup must not accept a recipient that the actual inquiry composer cannot use');
      await setup.locator('#setup-contactEmail').fill('owner@example.invalid');
      const serviceKey = slug === 'porchlight' ? 'gardenTitle' : 'planTitle';
      await setup.locator('#setup-copy-' + serviceKey).fill('A service made for your team');
    }
    const downloading = setup.waitForEvent('download');
    await setup.getByRole('button', { name: 'Download config.js', exact: true }).click();
    const configFile = await downloading;
    assert.equal(configFile.suggestedFilename(), 'config.js');
    const configBytes = await fs.readFile(await configFile.path());
    await fs.writeFile(path.join(buyer, 'config.js'), configBytes);
    assert.match(configBytes.toString(), /Café & Craft/);
    assert.match(await setup.locator('[data-setup-status]').innerText(), /does not update your HTML fallback text or publish/);
    const shot = `${slug}-setup-390.png`;
    await setup.screenshot({ path: path.join(output, shot), fullPage: true });
    screenshots.push(shot);
    await setup.goto(buyerUrl('index.html'));
    const marker = slug === 'gatherline' ? 'data-gatherline-copy' : 'data-copy';
    assert.equal(await setup.locator(`[${marker}="brand"]`).first().innerText(), brand);
    assert.equal(await setup.locator(`[${marker}="headline"]`).innerText(), headline);
    const colorRoot = slug === 'gatherline' ? setup.locator('.gatherline') : setup.locator('html');
    assert.equal(await colorRoot.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(248, 245, 238)');
    const customizedShot = `${slug}-customized-390.png`;
    await setup.screenshot({ path: path.join(output, customizedShot), fullPage: true });
    screenshots.push(customizedShot);
    if (slug === 'gatherline') {
      const calendar = setup.waitForEvent('download');
      await setup.getByRole('button', { name: 'Save the date', exact: true }).click();
      assert.match(await fs.readFile(await (await calendar).path(), 'utf8'), /DTEND:20261114T180000Z/);
    } else {
      if (slug === 'plainspoken') {
        await setup.goto(buyerUrl('contact.html') + '?service=plan');
        assert.equal(await setup.getByLabel('Your focus', { exact: true }).inputValue(), 'plan');
        await setup.getByLabel('Your team', { exact: true }).fill('A small team');
        await setup.getByLabel('What would a useful result look like?', { exact: true }).fill('A clear and useful next step.');
      } else {
        await setup.getByLabel('Project type', { exact: true }).selectOption('garden');
        await setup.getByLabel('Your area', { exact: true }).fill('Example town');
        await setup.getByLabel('Timing', { exact: true }).selectOption({ label: 'Flexible' });
        await setup.getByLabel('A few details', { exact: true }).fill('A plan for the garden.');
      }
      await setup.locator('[data-inquiry-form] button[type=submit]').click();
      const draft = await setup.getByRole('textbox', { name: 'Prepared inquiry text', exact: true }).inputValue();
      assert.ok(draft.includes(brand) && draft.includes('A service made for your team'));
      const mailto = new URL(await setup.locator('[data-email-draft]').getAttribute('href'));
      assert.equal(decodeURIComponent(mailto.pathname), 'owner@example.invalid');
      assert.equal(mailto.searchParams.get('body'), draft);
      const before = setup.url();
      await setup.locator('[data-inquiry-form] input').first().fill('Updated detail');
      assert.equal(await setup.locator('[data-inquiry-result]').isVisible(), false, 'Editing must invalidate the old draft');
      assert.equal(setup.url(), before, 'Composing must not submit fields into the URL');
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(remote, []);
    check('actual setup download and replacement updates brand, copy, color and real calendar/contact action without network calls', { slug, width: 390 });
    await setup.goto(buyerUrl('START-HERE.html'));
    assert.equal(await setup.locator('#setup-copy-brand').inputValue(), brand, 'Reload setup from the replaced config');
    await setup.locator('#setup-copy-brand').fill('BusinessNameWithoutAnySpaces'.repeat(6));
    await setup.locator('#setup-copy-headline').fill('<img src=x onerror=alert(1)> ' + 'UnbrokenHeadline'.repeat(10));
    const stressed = setup.waitForEvent('download');
    await setup.getByRole('button', { name: 'Download config.js', exact: true }).click();
    await fs.writeFile(path.join(buyer, 'config.js'), await fs.readFile(await (await stressed).path()));
    await setup.goto(buyerUrl('index.html'));
    assert.ok((await setup.locator(`[${marker}="headline"]`).innerText()).startsWith('<img src=x'));
    assert.equal(await setup.locator('img[src="x"]').count(), 0);
    for (const width of [1440, 768, 390, 320]) {
      await setup.setViewportSize({ width, height: 1000 });
      const bounds = await setup.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        scrollWidth: document.documentElement.scrollWidth, width: innerWidth,
        outside: [...document.querySelectorAll('header,nav,a,h1,h2,h3,p,button')].filter(element => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
        }).map(element => ({ tag: element.tagName, text: element.textContent.slice(0, 60), right: element.getBoundingClientRect().right }))
      }));
      assert.equal(bounds.overflow, false, `${slug} configured content overflow at ${width}: ${JSON.stringify(bounds)}`);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(remote, []);
    check('downloaded configuration survives quotes, Unicode, multiline copy, HTML-like text and unbroken names at 1440/768/390/320', { slug });
    await context.close();
  }

  const hostContext = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
  const hostPage = await hostContext.newPage();
  const fragment = await fs.readFile(path.join(extracted, 'gatherline/section.html'), 'utf8');
  const hostFixture = path.join(output, 'gatherline-host.html');
  await fs.writeFile(hostFixture, '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Existing host page</title><style>:root{--paper:#123456}</style><link rel="stylesheet" href="' + url('gatherline', 'styles.css') + '"><script>window.TEMPLATE_CONFIG={copy:{brand:"Unchanged host config"}};</script><script defer src="' + url('gatherline', 'config.js') + '"></script><script defer src="' + url('gatherline', 'script.js') + '"></script></head><body><h1 data-copy="headline">Existing host heading</h1><p data-copy="brand">Existing host brand</p>' + fragment + '</body></html>');
  await hostPage.goto(new URL(`file://${hostFixture}`).href);
  assert.equal(await hostPage.title(), 'Existing host page');
  assert.equal(await hostPage.locator('h1').innerText(), 'Existing host heading');
  assert.equal(await hostPage.locator('[data-copy="brand"]').innerText(), 'Existing host brand');
  assert.equal(await hostPage.evaluate(() => window.TEMPLATE_CONFIG.copy.brand), 'Unchanged host config');
  assert.equal(await hostPage.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()), '#123456');
  assert.equal(await hostPage.locator('.gatherline').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(238, 230, 244)');
  const hostedCalendar = hostPage.waitForEvent('download');
  await hostPage.getByRole('button', { name: 'Save the date', exact: true }).click();
  assert.equal((await hostedCalendar).suggestedFilename(), 'workshop.ics');
  check('embedded Gatherline preserves host title, branding, configuration and theme while its calendar still works');
  await hostContext.close();

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
  receipt.result = 'pass';
} catch (error) {
  receipt.result = 'fail';
  receipt.failure = String(error.stack || error);
  throw error;
} finally {
  receipt.screenshots = screenshots;
  await fs.writeFile(path.join(output, 'browser-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify({ passed: receipt.checks.length, screenshots: receipt.screenshots.length, output }, null, 2));
