import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SHOWCASE_BASE || 'http://127.0.0.1:5178';
const out = path.resolve(process.env.SHOWCASE_EVIDENCE || 'artifacts/showcase/seamless');
await mkdir(out, { recursive: true });
const hashes = async () => Object.fromEntries(await Promise.all(['src/playground/artworkRenderer.ts', 'src/playground/ArtworkStudio.tsx'].map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
const receipt = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), base, timestampUtc: new Date().toISOString(), platform: process.platform, sourceFilesAtStart: await hashes(), environment: 'Chromium headless, GPU disabled; Canvas pixel readback at1440x1000', checks: [], failures: [] };
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
receipt.browserVersion = browser.version();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
page.on('pageerror', error => receipt.failures.push(error.message));
async function download(label, name) { const pending = page.waitForEvent('download'); await page.getByRole('button', { name: label, exact: true }).click(); const file = await pending; await file.saveAs(path.join(out, name)); return readFile(path.join(out, name)); }
try {
  await page.goto(base + '/playground/?studio=artwork'); await page.locator('.pg-artwork').waitFor();
  const state = await page.evaluate(() => window.eidosPlayground.read());
  const a = state.project.studios.artwork;
  const fixture = { ...a, width: 192, height: 192, repeat: 'half-drop', transparent: true, mode: 'tile', objects: a.objects.map((o, i) => ({ ...o, x: [0, 35, 70][i % 3], y: [15, 40, 75][i % 3], size: 35, rotation: 12, opacity: .63 })) };
  const project = { ...state.project, studios: { ...state.project.studios, artwork: fixture } };
  await page.getByLabel('Import studio project', { exact: true }).setInputFiles({ name: 'half-drop-project.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
  await page.waitForFunction(() => window.eidosPlayground.read().project.studios.artwork.width === 192);
  const svg = (await download('Seamless SVG', 'seamless.svg')).toString('utf8');
  const png = await download('Seamless PNG', 'seamless.png');
  const baseSvg = (await download('SVG', 'single-cell.svg')).toString('utf8');
  await page.getByRole('button', { name: 'Repeat proof', exact: true }).click();
  const proof = await page.locator('.pg-artwork .pg-studio-stage svg').evaluate(element => element.outerHTML);
  // Extend the actual selected repeat proof beyond three columns so parity at
  // the exported unit boundary is exercised, rather than comparing one cell.
  const reference = proof.replace('width="576"', 'width="768"').replace('viewBox="0 0 576 576"', 'viewBox="0 0 768 576"').replace('<rect width="576" height="576" fill="url(#artwork-repeat)"', '<rect width="768" height="576" fill="url(#artwork-repeat)"');
  await writeFile(path.join(out, 'selected-repeat-reference.svg'), reference);
  const pixels = await page.evaluate(async ({ svg, png, baseSvg, reference }) => {
    async function image(uri) { const item = new Image(); item.src = uri; await item.decode(); return item; }
    const svgUri = text => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(text)));
    const images = await Promise.all([image(svgUri(reference)), image(svgUri(svg)), image('data:image/png;base64,' + png), image(svgUri(baseSvg))]);
    const outputs = images.map((item, i) => { const c = document.createElement('canvas'); c.width = 768; c.height = 576; const ctx = c.getContext('2d'); if (i === 0) ctx.drawImage(item, 0, 0); else { ctx.fillStyle = ctx.createPattern(item, 'repeat'); ctx.fillRect(0, 0, 768, 576); } return { bytes: ctx.getImageData(0, 0, 768, 576).data, image: c.toDataURL('image/png') }; });
    const mae = next => { const total = [0, 0, 0, 0]; for (let i = 0; i < outputs[0].bytes.length; i++) total[i % 4] += Math.abs(outputs[0].bytes[i] - next.bytes[i]); return total.map(v => v / (768 * 576)); };
    return { svgDimensions: [images[1].width, images[1].height], pngDimensions: [images[2].width, images[2].height], svgMAE: mae(outputs[1]), pngMAE: mae(outputs[2]), incorrectSingleCellMAE: mae(outputs[3]), referencePng: outputs[0].image, repeatedPng: outputs[2].image };
  }, { svg, png: png.toString('base64'), baseSvg, reference });
  assert.deepEqual(pixels.svgDimensions, [384, 192]); assert.deepEqual(pixels.pngDimensions, [384, 192]);
  assert.ok(Math.max(...pixels.svgMAE) < .1, 'SVG unit must reproduce the selected repeat beyond both column seams');
  assert.ok(Math.max(...pixels.pngMAE) < 2, 'PNG repeat must match selected SVG within raster antialiasing tolerance');
  assert.ok(Math.max(...pixels.incorrectSingleCellMAE) > 5, 'Negative control: single-cell grid must not masquerade as selected half-drop');
  for (const key of ['referencePng', 'repeatedPng']) { await writeFile(path.join(out, key + '.png'), Buffer.from(pixels[key].split(',')[1], 'base64')); delete pixels[key]; }
  receipt.checks.push({ name: 'downloaded two-column SVG/PNG repeat across four columns matches actual half-drop preview; single-cell negative control differs', status: 'passed', ...pixels });
  await page.screenshot({ path: path.join(out, 'half-drop-export.png') });
} catch (error) { receipt.failures.push(error.stack); }
finally { receipt.sourceFilesAtFinish = await hashes(); receipt.sourceChangedDuringRun = JSON.stringify(receipt.sourceFilesAtStart) !== JSON.stringify(receipt.sourceFilesAtFinish); await browser.close(); await writeFile(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
console.log(JSON.stringify({ passed: receipt.checks.length, failed: receipt.failures.length, receipt: path.join(out, 'receipt.json') }));
if (receipt.failures.length) { console.error(receipt.failures); process.exitCode = 1; }
