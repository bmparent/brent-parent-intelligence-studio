import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, dirname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SHOWCASE_BASE_URL || 'http://127.0.0.1:5178';
const output = resolve('artifacts/showcase/template-case-browser');
await mkdir(output, { recursive: true });
const receipt = { schemaVersion: 1, timestamp: new Date().toISOString(), base, browserPath: 'Regular Playwright; Browser plugin not available. Root in-app browser acquisition also returned Browser is not available: iab.', checks: [], consoleErrors: [], screenshots: [], independentExports: [] };
receipt.source = { baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), files: await Promise.all(['src/templates/configurator.ts', 'src/components/TemplateConfigurator.tsx', 'src/components/SignalHouseCaseStudy.tsx', 'src/styles/template-configurator.css', 'src/styles/signal-house.css'].map(async path => ({ path, sha256: createHash('sha256').update(await readFile(path)).digest('hex') }))) };
const runIdentity = receipt.timestamp.replace(/[:.]/g, '-');
const browser = await chromium.launch({ headless: true });
receipt.browser = await browser.version();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
page.on('pageerror', error => receipt.consoleErrors.push({ route: page.url(), message: error.message }));
page.on('console', message => { if (message.type() === 'error') receipt.consoleErrors.push({ route: page.url(), message: message.text() }); });
async function screenshot(name, locator = page) {
  const filename = `${name}.png`;
  await locator.screenshot({ path: resolve(output, filename), ...(locator === page ? { fullPage: true } : {}) });
  receipt.screenshots.push(filename);
}
async function check(name, fn) {
  const start = Date.now();
  try { const observation = await fn(); receipt.checks.push({ name, status: 'passed', milliseconds: Date.now() - start, observation: observation || null }); }
  catch (error) { receipt.checks.push({ name, status: 'failed', milliseconds: Date.now() - start, error: error.message }); throw error; }
  finally { await writeFile(resolve(output, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
}
async function noOverflow() {
  const size = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.viewport + 1, JSON.stringify(size));
  return size;
}
function frame() { return page.frameLocator('.tc-frame-wrap iframe'); }
async function extractStoredZip(file, directory) {
  const bytes = await readFile(file);
  let cursor = 0;
  const names = [];
  while (bytes.readUInt32LE(cursor) === 0x04034b50) {
    assert.equal(bytes.readUInt16LE(cursor + 8), 0, 'browser export uses ZIP STORE');
    const length = bytes.readUInt32LE(cursor + 18), nameLength = bytes.readUInt16LE(cursor + 26), extra = bytes.readUInt16LE(cursor + 28);
    const name = bytes.subarray(cursor + 30, cursor + 30 + nameLength).toString('utf8');
    const target = resolve(directory, name);
    assert.ok(target.startsWith(directory + sep), 'archive path stays in extracted output');
    const start = cursor + 30 + nameLength + extra;
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes.subarray(start, start + length));
    names.push(name); cursor = start + length;
  }
  return { names, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
}

try {
  await check('configurator identity, meaningful screen, no framework overlay', async () => {
    await page.goto(`${base}/shop/configure?family=matter`);
    await page.getByRole('heading', { name: /Choose a direction/ }).waitFor();
    const essentialConsent = page.getByRole('button', { name: 'Essential only', exact: true });
    if (await essentialConsent.isVisible()) await essentialConsent.click();
    assert.match(await page.title(), /Configure an Original Website Sample/);
    assert.equal(await page.locator('vite-error-overlay').count(), 0);
    await screenshot('configurator-desktop-initial');
    return await noOverflow();
  });
  await check('real Artwork Studio PNG export attaches to sample preview with undo and redo', async () => {
    const studio = await context.newPage();
    await studio.goto(`${base}/playground?studio=artwork`);
    await studio.getByRole('heading', { name: 'Artwork Studio', level: 1, exact: true }).waitFor();
    const outputEvent = studio.waitForEvent('download');
    await studio.getByRole('button', { name: 'PNG', exact: true }).click();
    const imageDownload = await outputEvent;
    const pngPath = resolve(output, 'artwork-from-playground.png');
    await imageDownload.saveAs(pngPath);
    await studio.close();
    const png = await readFile(pngPath);
    assert.ok(png.length < 2_000_000);
    await page.getByLabel('Upload artwork PNG', { exact: true }).setInputFiles(pngPath);
    await page.getByText('Your PNG is attached to this configuration.', { exact: false }).waitFor();
    const remove = page.getByRole('button', { name: 'Remove uploaded artwork', exact: false });
    await remove.waitFor();
    const previewImage = frame().locator('.hero img');
    assert.equal(await previewImage.getAttribute('src'), `data:image/png;base64,${png.toString('base64')}`);
    assert.equal(await previewImage.evaluate(image => image.complete && image.naturalWidth > 0), true);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    assert.equal(await remove.count(), 0);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    await remove.waitFor();
    await screenshot('configurator-artwork-from-playground', page.locator('.tc-canvas'));
    receipt.artworkSource = { path: 'artwork-from-playground.png', generatedThrough: 'Visible Artwork Studio PNG button', sha256: createHash('sha256').update(png).digest('hex'), bytes: png.length };
  });
  await check('edit, undo, redo, save, change, reopen, and reload/reopen exact configuration', async () => {
    const headline = page.getByLabel('Main headline', { exact: true });
    await headline.fill('A study you can keep.');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    assert.equal(await headline.inputValue(), 'Let the details speak.');
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    assert.equal(await headline.inputValue(), 'A study you can keep.');
    for (const name of ['Landing', 'Blog / article', 'Gallery']) await page.getByLabel(name, { exact: true }).check();
    await page.getByLabel('Sample feature tier', { exact: true }).selectOption('expressive');
    for (const name of ['Gallery filters + lightbox', 'Accessible entrance motion', 'Editorial reading layout']) await page.getByRole('checkbox', { name, exact: true }).check();
    await page.getByLabel(/Contact email \(optional/).fill('studio@example.com');
    await page.getByRole('button', { name: 'Save locally', exact: true }).click();
    await page.getByText('Saved in this browser', { exact: true }).waitFor();
    await headline.fill('A change to restore.');
    await page.getByRole('button', { name: 'Reopen saved', exact: true }).click();
    assert.equal(await headline.inputValue(), 'A study you can keep.');
    await page.reload();
    await page.getByRole('button', { name: 'Reopen saved', exact: true }).click();
    assert.equal(await page.getByLabel('Main headline', { exact: true }).inputValue(), 'A study you can keep.');
    assert.equal(await page.getByRole('checkbox', { name: 'Gallery filters + lightbox', exact: true }).isChecked(), true);
    await screenshot('configurator-saved-reopened');
  });
  await check('preview navigation, gallery filters, lightbox, Escape and focus return', async () => {
    await frame().getByRole('navigation').getByRole('link', { name: 'Gallery', exact: true }).click();
    await frame().getByRole('heading', { name: 'A closer look.', exact: true }).waitFor();
    assert.equal(await page.getByLabel('Preview page', { exact: true }).inputValue(), 'gallery');
    await frame().getByRole('button', { name: 'Spaces', exact: true }).click();
    assert.equal(await frame().locator('[data-category]:visible').count(), 1);
    await frame().getByRole('button', { name: 'Inspect study 2', exact: true }).click();
    await frame().getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await frame().getByRole('dialog').isVisible(), false);
    const focus = await frame().getByRole('button', { name: 'Inspect study 2', exact: true }).evaluate(button => button === document.activeElement);
    assert.equal(focus, true);
    await screenshot('configurator-gallery-filtered', page.locator('.tc-canvas'));
  });
  await check('download exact working ZIP and open independently from file URL', async () => {
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download working sample ZIP', exact: false }).click();
    const downloaded = await downloadEvent;
    const zip = resolve(output, downloaded.suggestedFilename());
    await downloaded.saveAs(zip);
    const directory = resolve(output, 'downloaded-matter-expressive');
    const archive = await extractStoredZip(zip, directory);
    const config = JSON.parse(await readFile(resolve(directory, 'configuration.json'), 'utf8'));
    assert.deepEqual(config.pages, ['home', 'landing', 'contact', 'article', 'gallery']);
    assert.deepEqual(config.modules, ['gallery', 'motion', 'editorial']);
    assert.equal(config.headline, 'A study you can keep.');
    assert.equal(config.schemaVersion, 3);
    assert.equal(config.artwork.dataUrl, `data:image/png;base64,${(await readFile(resolve(output, 'artwork-from-playground.png'))).toString('base64')}`);
    assert.deepEqual(await readFile(resolve(directory, 'assets/artwork.png')), await readFile(resolve(output, 'artwork-from-playground.png')));
    const manifest = JSON.parse(await readFile(resolve(directory, 'PACKAGE_MANIFEST.json'), 'utf8'));
    assert.deepEqual(archive.names.filter(name => name !== 'PACKAGE_MANIFEST.json'), manifest.files.map(file => file.path));
    for (const file of manifest.files) assert.equal((await readFile(resolve(directory, file.path))).length, file.bytes);
    const independent = await context.newPage();
    const errors = [];
    independent.on('pageerror', error => errors.push(error.message));
    const requests = [];
    independent.on('request', request => { if (!request.url().startsWith('file:') && !request.url().startsWith('data:')) requests.push(request.url()); });
    await independent.goto(pathToFileURL(resolve(directory, 'index.html')).href);
    assert.equal(await independent.getByRole('heading', { level: 1 }).innerText(), config.headline);
    await screenshot('independent-home', independent);
    await independent.getByRole('navigation').getByRole('link', { name: 'Gallery', exact: true }).click();
    await independent.getByRole('button', { name: 'Objects', exact: true }).click();
    assert.equal(await independent.locator('[data-category]:visible').count(), 2);
    await independent.getByRole('button', { name: 'Inspect study 1', exact: true }).click();
    await independent.getByRole('dialog').waitFor();
    await screenshot('independent-gallery-lightbox', independent);
    await independent.keyboard.press('Escape');
    assert.equal(await independent.getByRole('button', { name: 'Inspect study 1', exact: true }).evaluate(button => button === document.activeElement), true);
    await independent.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
    assert.equal(await independent.getByRole('link', { name: 'Email studio@example.com' }).getAttribute('href'), 'mailto:studio@example.com');
    assert.equal(await independent.locator('form').count(), 0);
    await independent.getByRole('navigation').getByRole('link', { name: 'Blog / article', exact: true }).click();
    await independent.getByRole('heading', { name: 'The care between the details.' }).waitFor();
    await independent.getByRole('button', { name: 'Pause motion', exact: true }).click();
    assert.equal(await independent.locator('body').evaluate(body => body.classList.contains('motion-paused')), true);
    await independent.emulateMedia({ reducedMotion: 'reduce' });
    await independent.setViewportSize({ width: 390, height: 844 });
    await screenshot('independent-article-phone-reduced-motion', independent);
    const width = await independent.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(width.scroll <= width.viewport + 1);
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    receipt.independentExports.push({ archive: downloaded.suggestedFilename(), ...archive, directory: 'downloaded-matter-expressive', source: { ...config, artwork: config.artwork ? { alt: config.artwork.alt, embedded: true, bytes: (await readFile(resolve(directory, 'assets/artwork.png'))).length, sha256: receipt.artworkSource.sha256 } : null }, openedVia: 'file:// index.html and ordinary local links', remoteRequests: requests, errors, contact: 'mailto destination checked; inbox delivery not attempted or claimed' });
    await independent.close();
  });
  await check('JSON roundtrip, invalid import preserves open work, stale import cannot overwrite edit', async () => {
    const file = await readFile(resolve(output, 'downloaded-matter-expressive/configuration.json'));
    await page.getByLabel('Family', { exact: true }).selectOption('nightjar');
    await page.locator('.tc-toolbar input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'configuration.json', mimeType: 'application/json', buffer: file });
    await page.getByText('Imported configuration. Undo restores your previous work.', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Main headline', { exact: true }).inputValue(), 'A study you can keep.');
    await page.getByRole('button', { name: 'Remove uploaded artwork', exact: false }).waitFor();
    await page.locator('.tc-toolbar input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByLabel('Main headline', { exact: true }).inputValue(), 'A study you can keep.');
    await page.evaluate(() => { const original = File.prototype.text; File.prototype.text = async function() { const data = await original.call(this); await new Promise(resolve => setTimeout(resolve, 450)); return data; }; });
    await page.locator('.tc-toolbar input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'slow.json', mimeType: 'application/json', buffer: file });
    await page.getByLabel('Main headline', { exact: true }).fill('A newer manual edit.');
    await page.getByRole('alert').filter({ hasText: 'changed while the file was opening' }).waitFor();
    assert.equal(await page.getByLabel('Main headline', { exact: true }).inputValue(), 'A newer manual edit.');
  });
  await check('invalid and stale PNG uploads leave attached artwork and newer edits intact', async () => {
    await page.getByLabel('Upload artwork PNG', { exact: true }).setInputFiles({ name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
    await page.getByRole('alert').filter({ hasText: 'Choose a PNG' }).waitFor();
    await page.getByRole('button', { name: 'Remove uploaded artwork', exact: false }).waitFor();
    await page.evaluate(() => { const original = window.createImageBitmap; window.createImageBitmap = async (...args) => { await new Promise(resolve => setTimeout(resolve, 500)); return original(...args); }; });
    await page.getByLabel('Upload artwork PNG', { exact: true }).setInputFiles(resolve(output, 'artwork-from-playground.png'));
    await page.getByLabel('Main headline', { exact: true }).fill('Newer while artwork opens.');
    await page.getByRole('alert').filter({ hasText: 'configuration changed while the artwork was opening' }).waitFor();
    assert.equal(await page.getByLabel('Main headline', { exact: true }).inputValue(), 'Newer while artwork opens.');
    await page.getByRole('button', { name: 'Remove uploaded artwork', exact: false }).waitFor();
  });
  await check('save failure, incompatible modules, unsupported platforms, all family representative previews', async () => {
    await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Simulated quota exhaustion', 'QuotaExceededError'); }; });
    await page.getByRole('button', { name: 'Save locally', exact: true }).click();
    await page.getByText('Save failed', { exact: true }).waitFor();
    await page.getByRole('alert').filter({ hasText: 'storage is unavailable or full' }).waitFor();
    await screenshot('configurator-save-failure', page.locator('.tc-workspace'));
    await page.getByLabel('Sample feature tier', { exact: true }).selectOption('essential');
    assert.equal(await page.getByRole('checkbox', { name: 'Gallery filters + lightbox', exact: true }).isEnabled(), false);
    assert.equal(await page.getByRole('checkbox', { name: 'Gallery filters + lightbox', exact: true }).isChecked(), false);
    assert.equal(await page.getByLabel('Output / platform', { exact: true }).locator('option:disabled').count(), 3);
    for (const family of ['switchboard', 'tideglass', 'matter', 'nightjar']) {
      await page.getByLabel('Family', { exact: true }).selectOption(family);
      await frame().getByRole('heading', { level: 1 }).waitFor();
      await screenshot(`family-${family}`, page.locator('.tc-canvas'));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot('configurator-phone');
    return await noOverflow();
  });
  await check('case study identity, chapter keyboard selection, layer/light inspection, return and action', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/work/signal-house`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    assert.match(await page.title(), /Signal House/);
    assert.equal(await page.locator('vite-error-overlay').count(), 0);
    await screenshot('signal-house-desktop');
    const assembly = page.getByRole('navigation', { name: 'Scene chapters' }).getByRole('button', { name: 'Assembly', exact: true });
    await assembly.focus(); await page.keyboard.press('Enter');
    assert.equal(await assembly.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.getByRole('slider', { name: 'Layer separation', exact: true }).inputValue(), '60');
    await page.getByRole('checkbox', { name: 'Architecture', exact: true }).uncheck();
    assert.ok((await page.locator('.sh-scene svg desc').textContent()).includes('Architecture hidden'));
    await page.getByRole('slider', { name: 'Scene light', exact: true }).focus();
    await page.keyboard.press('End');
    assert.ok((await page.locator('.sh-scene svg desc').textContent()).includes('cool daylight'));
    await screenshot('signal-house-assembly-inspection', page.locator('.sh-inspection'));
    await page.getByRole('button', { name: 'Return to complete overview', exact: true }).click();
    assert.equal(await page.getByRole('checkbox', { name: 'Architecture', exact: true }).isChecked(), true);
    assert.equal(await page.getByRole('slider', { name: 'Layer separation', exact: true }).inputValue(), '0');
    assert.equal(await page.getByRole('link', { name: 'Try Effect Studio', exact: false }).getAttribute('href'), '/playground?studio=effect');
    await page.getByRole('link', { name: 'Try Effect Studio', exact: false }).click();
    await page.getByRole('heading', { name: 'Effect Studio', level: 1, exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), '/playground'); assert.equal(new URL(page.url()).searchParams.get('studio'), 'effect');
  });
  await check('case study reduced motion, touch-size controls and phone width', async () => {
    await page.goto(`${base}/work/signal-house`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Try gentle scene motion', exact: true }).click();
    assert.equal(await page.locator('.sh-scene>svg').evaluate(svg => getComputedStyle(svg).animationName), 'none');
    assert.equal(await page.getByRole('navigation', { name: 'Scene chapters' }).getByRole('button').evaluateAll(buttons => Math.min(...buttons.map(button => button.getBoundingClientRect().height))), 44);
    await screenshot('signal-house-phone-reduced-motion');
    const width = await noOverflow();
    const scriptless = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await scriptless.newPage();
    // Root's production build/prerender is needed for a real script-free page;
    // Vite development HTML is intentionally an empty hydration shell.
    const html = await readFile('dist/work/signal-house/index.html', 'utf8').catch(() => null);
    if (html) {
      await staticPage.route(`${base}/assets/**`, async route => {
        const path = resolve('dist', new URL(route.request().url()).pathname.slice(1));
        const body = await readFile(path);
        await route.fulfill({ status: 200, contentType: path.endsWith('.css') ? 'text/css' : path.endsWith('.js') ? 'text/javascript' : 'application/octet-stream', body });
      });
      await staticPage.setContent(html.replace('<head>', `<head><base href="${base}/">`), { waitUntil: 'networkidle' });
      assert.ok((await staticPage.getByRole('heading').allTextContents()).includes('Assembly'));
      assert.equal(await staticPage.locator('.sh-scene svg').count(), 1);
      await screenshot('signal-house-no-javascript', staticPage);
      receipt.checks.push({ name: 'prerendered no-JavaScript content', status: 'passed', observation: 'Current dist HTML rendered with scripts disabled and its actual built assets; copy, scene, and final links retained. Root build receipt identifies candidate source.' });
    } else receipt.checks.push({ name: 'prerendered no-JavaScript content', status: 'not-tested', reason: 'Current dist/work/signal-house/index.html not generated yet; root production build acceptance owns this gate.' });
    await scriptless.close(); return width;
  });
  await check('touch emulation keeps chapter, layer and sample-page choices usable', async () => {
    const touchContext = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const touch = await touchContext.newPage();
    await touch.goto(`${base}/work/signal-house`);
    const consent = touch.getByRole('button', { name: 'Essential only', exact: true });
    if (await consent.isVisible()) await consent.tap();
    await touch.getByRole('navigation', { name: 'Scene chapters' }).getByRole('button', { name: 'Interface', exact: true }).tap();
    assert.equal(await touch.getByRole('navigation', { name: 'Scene chapters' }).getByRole('button', { name: 'Interface', exact: true }).getAttribute('aria-pressed'), 'true');
    await touch.getByRole('checkbox', { name: 'Landscape', exact: true }).tap();
    assert.equal(await touch.getByRole('checkbox', { name: 'Landscape', exact: true }).isChecked(), false);
    await screenshot('signal-house-touch', touch);
    await touch.goto(`${base}/shop/configure?family=tideglass`);
    await touch.getByRole('checkbox', { name: 'Gallery', exact: true }).tap();
    assert.equal(await touch.getByRole('checkbox', { name: 'Gallery', exact: true }).isChecked(), true);
    await screenshot('configurator-touch', touch);
    assert.ok(await touch.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await touchContext.close();
    return 'Chromium mobile/touch emulation at 390×844; not a physical-device certification.';
  });
  assert.deepEqual(receipt.consoleErrors, []);
  receipt.status = 'passed';
} catch (error) {
  receipt.status = 'failed'; receipt.error = error.stack;
  await screenshot('failure').catch(() => {});
  process.exitCode = 1;
} finally {
  await writeFile(resolve(output, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  await writeFile(resolve(output, `receipt-${runIdentity}.json`), JSON.stringify(receipt, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify({ status: receipt.status, checks: receipt.checks, receipt: 'artifacts/showcase/template-case-browser/receipt.json' }, null, 2));
