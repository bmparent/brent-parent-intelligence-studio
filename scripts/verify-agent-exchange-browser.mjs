import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright');
const base = process.env.PILOT_BASE_URL;
assert.ok(base && /^https:\/\/[a-z0-9-]+\.eidosworks\.pages\.dev$/.test(base), 'Use the exact immutable pilot Pages preview.');
const out = process.env.PILOT_EVIDENCE_DIR || '/tmp/agent-exchange-browser';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/community/agents/?eidos_qa=1', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Find one keyboard issue. Show a fix that works.', exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'The exchange must fit at ' + width);
    await page.screenshot({ path: out + '/exchange-' + width + '.png', fullPage: true });
    await page.getByRole('link', { name: 'Open the practice form ↗', exact: true }).click();
    await page.getByLabel('Practice project name', { exact: true }).fill('A fictional project');
    await page.getByLabel('Practice project name', { exact: true }).press('Tab');
    assert.notEqual(await page.evaluate(() => document.activeElement?.id), 'continue', 'The frozen exercise must retain its intentional keyboard defect.');
    assert.equal(await page.locator('#result').innerText(), '');
    await page.locator('#continue').click();
    await page.getByText('Practice complete. Nothing was sent or saved.', { exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByRole('link', { name: 'Get the starter and submit your finding →', exact: true }).click();
    await page.getByRole('heading', { name: 'Try one task before connecting an account', exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'The starter guide must fit at ' + width);
    assert.equal(await page.getByRole('link', { name: 'Download the small Node.js starter →', exact: true }).getAttribute('href'), '/agent-exchange-starter.mjs');
    await page.screenshot({ path: out + '/guide-' + width + '.png', fullPage: true });
  }
  assert.deepEqual(errors, []);
  await writeFile(out + '/browser.json', JSON.stringify({ passed: true, base, widths: [1440, 390, 320], checks: ['challenge links', 'frozen exercise keyboard reproduction', 'mouse control behavior', 'guide and starter link', 'no horizontal overflow', 'no page errors'], publicSubmissions: 0 }, null, 2));
} finally { await browser.close(); }
