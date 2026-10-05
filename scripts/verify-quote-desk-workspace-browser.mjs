import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QUOTE_WORKSPACE_BASE_URL || 'http://127.0.0.1:4178';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Fixture account responses are restricted to a local preview.');
const evidence = process.env.QUOTE_WORKSPACE_EVIDENCE_DIR || '/tmp/quote-workspace';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

// These controlled API responses exercise the actual UI, not hosted email or Stripe.
// No request reaches a provider, no mail is sent and no subscription is created.
try {
  for (const width of [1440, 390]) {
    for (const scenario of ['billing-outage', 'cancelled-checkout', 'expired-link']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(() => {
        Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Storage denied', 'SecurityError'); } });
      });
      const page = await context.newPage();
      const errors = [], checkoutRequests = [];
      let paid = false;
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error' && !(message.location().url.startsWith(base + '/api/') && /Failed to load resource/.test(message.text()))) errors.push(message.text()); });
      await page.route('**/api/**', async route => {
        const endpoint = new URL(route.request().url()).pathname;
        let status = 200, body;
        if (endpoint === '/api/config') body = { environment: 'test', signInEnabled: true, checkoutEnabled: true };
        else if (endpoint === '/api/me') {
          if (scenario === 'expired-link') { status = 401; body = { error: 'Sign in to your workspace.' }; }
          else body = { email: 'owner@example.invalid', paid: scenario === 'billing-outage' && !paid ? null : paid,
            billingStatus: scenario === 'billing-outage' && !paid ? 'unavailable' : paid ? 'active' : 'inactive', hasBillingAccount: true };
        } else if (endpoint === '/api/records') body = { records: [] };
        else if (endpoint === '/api/login/verify') { status = 400; body = { error: 'This sign in link expired or was already used.' }; }
        else if (endpoint === '/api/checkout') {
          checkoutRequests.push(route.request().postDataJSON());
          status = 503; body = { error: 'Billing is temporarily unavailable. Your estimate is still here.' };
        } else { status = 503; body = { error: 'Controlled preview response.' }; }
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
      });
      try {
        const suffix = scenario === 'expired-link' ? '/#login=' + 'a'.repeat(64) : '/?checkout=' + (scenario === 'billing-outage' ? 'returned' : 'cancelled');
        await page.goto(base + suffix, { waitUntil: 'networkidle' });
        assert.match(await page.title(), /Eidos Quote Desk/);
        await page.getByRole('heading', { name: 'Keep the useful details.' }).waitFor();
        assert.match(await page.locator('#quote-price').innerText(), /^\$/);
        assert.equal(await page.locator('.print-details').isVisible(), false, 'workspace screen hides print-only assumptions');
        if (scenario === 'billing-outage') {
          assert.match(await page.locator('#identity').innerText(), /can still open and export/);
          assert.equal(await page.locator('#subscribe').isVisible(), false, 'unknown billing never offers a duplicate subscription');
          const download = page.waitForEvent('download');
          await page.getByRole('button', { name: 'Export all my saved data', exact: true }).click();
          assert.match((await download).suggestedFilename(), /Eidos_Quote_Desk_Backup_/);
          paid = true;
          await page.getByRole('button', { name: 'Check billing status', exact: true }).click();
          await page.getByText('Paid access verified. You can save quotes.', { exact: true }).waitFor();
          assert.match(await page.locator('#identity').innerText(), /Paid access active/);
          assert.equal(await page.locator('#accept-terms').isVisible(), false);
        } else if (scenario === 'cancelled-checkout') {
          assert.match(await page.locator('#status').innerText(), /Checkout was cancelled.*estimate is still here/);
          await page.getByLabel('Job name', { exact: true }).fill('Job 202 · restored estimate');
          await page.reload({ waitUntil: 'networkidle' });
          assert.equal(await page.getByLabel('Job name', { exact: true }).inputValue(), 'Job 202 · restored estimate');
          await page.locator('#accept-terms').check();
          await page.locator('#subscribe').click();
          await page.getByText('Billing is temporarily unavailable. Your estimate is still here.', { exact: true }).waitFor();
          assert.equal(checkoutRequests.length, 1, 'denied session storage still permits a server-checked checkout request');
          assert.match(checkoutRequests[0].attemptId, /^[a-f0-9-]{36}$/);
          assert.equal(checkoutRequests[0].acceptTerms, true);
          await page.locator('#subscribe').click();
          assert.equal(checkoutRequests.length, 2);
          assert.equal(checkoutRequests[1].attemptId, checkoutRequests[0].attemptId, 'lost-provider response retries preserve idempotency with denied storage');
        } else {
          await page.getByRole('button', { name: 'Finish sign in', exact: true }).click();
          await page.getByText('This sign in link expired or was already used.', { exact: true }).waitFor();
          assert.equal(await page.locator('#verify-panel').isVisible(), false);
          assert.equal(await page.locator('#login-form').isVisible(), true, 'expired link returns to requesting a fresh email');
          assert.equal(await page.getByLabel('Email address', { exact: true }).evaluate(element => element === document.activeElement), true);
        }
        assert.deepEqual(errors, [], 'no runtime errors');
        const size = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
        assert.ok(size.body <= size.viewport + 1, 'no horizontal overflow');
        await page.locator('#workspace').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(evidence, `workspace-${width}-${scenario}.png`) });
        console.log(`PASS workspace ${width}/${scenario}: rendered customer recovery with controlled API responses`);
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); }
