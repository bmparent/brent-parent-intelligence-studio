import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const require = createRequire(import.meta.url), pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = path.resolve(process.env.PG_SERVICE_EVIDENCE || 'artifacts/playground-unified/service-number-wrap');
const baseline = process.env.PG_SERVICE_BASELINE_DIR;
const bundled = await build({ stdin: { contents: "export {buildFrozenPackage,createProjectSnapshot} from './src/playground/purchaseSnapshot';export {createStarter} from './src/playground/starters';", resolveDir: process.cwd() }, bundle: true, format: 'esm', platform: 'node', write: false });
const contract = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const project = contract.createStarter({ starter: 'switchboard', goal: 'business', action: 'contact', name: 'Recovered Atlas' });
const frozen = await contract.buildFrozenPackage(await contract.createProjectSnapshot(project, 'service-number-fixture', 0));
const after = path.join(out, 'after');
for (const file of frozen.files) { const target = path.join(after, file.name); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, file.data); }
const records = [];
for (const engine of (process.env.PG_ENGINES || 'chromium,firefox,webkit').split(',')) {
  const browser = await pw[engine].launch({ headless: true });
  for (const width of [320, 390]) for (const [stage, directory] of [...(baseline ? [['before', baseline]] : []), ['after', after]]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage(), record = { engine, width, stage, errors: [], requests: [], rows: [] };
    records.push(record);
    page.on('pageerror', error => record.errors.push(error.message));
    await context.route(/^https?:/, route => { record.requests.push(route.request().url()); return route.abort(); });
    await page.goto(pathToFileURL(path.join(directory, 'index.html')).href);
    record.rows = await page.locator('.pg-service').evaluateAll(rows => rows.map(row => {
      const number = row.querySelector('span'), heading = row.querySelector('h3');
      const characterTops = Array.from(number.textContent).map((_, index) => { const range = document.createRange(); range.setStart(number.firstChild, index); range.setEnd(number.firstChild, index + 1); return range.getBoundingClientRect().top; });
      const range = document.createRange(); range.selectNodeContents(heading);
      return { number: number.textContent, numberLines: new Set(characterTops.map(top => Math.round(top))).size, heading: heading.textContent, headingLines: new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size };
    }));
    assert.equal(record.rows.length, 3);
    if (stage === 'before') record.reproducedBrokenNumber = record.rows.some(row => row.numberLines > 1);
    else { assert.ok(record.rows.every(row => row.numberLines === 1), 'each service number remains on one line'); assert.ok(record.rows.some(row => row.headingLines > 1), 'headings still wrap naturally'); }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    assert.deepEqual(record.errors, []); assert.deepEqual(record.requests, []);
    await page.locator('.pg-services').screenshot({ path: path.join(out, `${engine}-${width}-${stage}.png`) });
    console.log(`${engine} ${width} ${stage}: PASS service number measurement`);
    await context.close();
  }
  await browser.close();
}
const css = await readFile('src/playground/pageStyles.ts');
if (baseline) assert.ok(records.some(record => record.stage === 'before' && record.reproducedBrokenNumber), 'historical package reproduces broken number wrapping in at least one tested engine');
await writeFile(path.join(out, 'receipt.json'), JSON.stringify({ timestampUtc: new Date().toISOString(), source: 'Public frozen page package, independent file opening', cssSourceSha256: createHash('sha256').update(css).digest('hex'), baseline: baseline || null, physicalDevice: false, records }, null, 2) + '\n');
