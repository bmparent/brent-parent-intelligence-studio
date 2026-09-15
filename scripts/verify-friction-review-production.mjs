import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.M2_FRICTION_BASE_URL || 'https://eidos-works.com').replace(/\/+$/, '');
const output = path.join(process.env.M2_FRICTION_EVIDENCE_DIR || process.env.RUNNER_TEMP || '/tmp', 'friction-review-production');
const qaEmail = process.env.M2_FRICTION_QA_EMAIL || 'projects@eidos-works.com';
const commit = process.env.GITHUB_SHA || 'unknown';
await mkdir(output, { recursive: true });

const cases = [
  { name: 'desktop', engine: 'chromium', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile', engine: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true },
];
const results = [];

for (const testCase of cases) {
  const browser = await pw[testCase.engine].launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: testCase.viewport,
      ...(testCase.isMobile ? { isMobile: true, hasTouch: true } : {}),
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });

    const url = `${base}/friction-review?utm_source=qa&utm_medium=release&utm_campaign=m2_acceptance&utm_content=${testCase.name}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: 'What almost works?' }).waitFor({ state: 'visible' });

    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      width: window.innerWidth,
      formWidth: document.querySelector('.ew-friction-form')?.getBoundingClientRect().width || 0,
    }));
    assert.equal(geometry.overflow, false, `${testCase.name}: horizontal overflow detected`);
    assert.ok(geometry.formWidth > 250, `${testCase.name}: form is not usefully visible`);

    const form = page.locator('.ew-friction-form');
    await form.locator('input[autocomplete="name"]').fill(`M2 production acceptance — ${testCase.name}`);
    await form.locator('input[autocomplete="email"]').fill(qaEmail);
    await form.locator('input[autocomplete="organization"]').fill('Eidos Works QA');
    await form.locator('input[placeholder="https://"]').fill(`${base}/`);
    const textareas = form.locator('textarea');
    await textareas.nth(0).fill(`QA only (${testCase.name}, ${commit.slice(0, 8)}): verify the live Friction Review form routes through the production inquiry service and reports success only after provider acknowledgement.`);
    await textareas.nth(1).fill('QA only: show the confirmed success state after the inquiry mail provider accepts the message.');
    await form.locator('select').selectOption({ label: 'Other' });

    const responsePromise = page.waitForResponse(response =>
      response.url().endsWith('/api/project-inquiries') && response.request().method() === 'POST',
    );
    await form.getByRole('button', { name: 'Send the Friction →' }).click();
    const response = await responsePromise;
    const responseBody = await response.json();
    assert.equal(response.ok(), true, `${testCase.name}: inquiry endpoint returned ${response.status()}`);
    assert.equal(responseBody?.submitted, true, `${testCase.name}: inquiry was not provider-confirmed`);
    assert.equal(responseBody?.state, 'sent', `${testCase.name}: inquiry state was not sent`);
    assert.match(String(responseBody?.receipt || ''), /^[0-9a-f-]{36}$/i, `${testCase.name}: provider receipt is missing`);

    await page.getByText('Got it. We’ll take a look.', { exact: true }).waitFor({ state: 'visible' });
    await page.getByText(/not just send a sales pitch/i).waitFor({ state: 'visible' });
    assert.deepEqual(pageErrors, [], `${testCase.name}: browser console/page errors were observed`);

    await page.screenshot({ path: path.join(output, `${testCase.name}.png`), fullPage: true });
    results.push({
      viewport: testCase.name,
      engine: testCase.engine,
      width: testCase.viewport.width,
      submitted: true,
      state: responseBody.state,
      receipt: responseBody.receipt,
      horizontalOverflow: geometry.overflow,
    });
    await context.close();
    console.log(`Friction Review production ${testCase.name}: provider-confirmed success (${responseBody.receipt}).`);
  } finally {
    await browser.close();
  }
}

await writeFile(path.join(output, 'results.json'), `${JSON.stringify({ commit, base, results }, null, 2)}\n`);
console.log('Live Friction Review passed desktop and mobile submission acceptance.');
