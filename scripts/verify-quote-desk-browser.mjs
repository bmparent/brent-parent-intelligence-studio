import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-quote-desk';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

// Real customer flow: owned service page -> free estimate -> printable result -> inquiry.
// No inquiry, account, email or payment is submitted by this check.
try {
  for (const width of [1440, 390]) {
    for (const storage of ['available', 'denied', 'full']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(mode => {
        window.print = () => { window.__quotePrintCount = (window.__quotePrintCount || 0) + 1; };
        if (mode === 'denied') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage denied', 'SecurityError'); } });
        if (mode === 'full') Storage.prototype.setItem = function () { throw new DOMException('Storage full', 'QuotaExceededError'); };
      }, storage);
      const page = await context.newPage();
      const errors = [], accountRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('request', request => { if (page.url().includes('/quote-desk/') && new URL(request.url()).pathname.startsWith('/api/')) accountRequests.push(request.url()); });
      try {
        if (storage === 'available') {
          await page.goto(base + '/services/business-systems/', { waitUntil: 'networkidle' });
          const consent = page.getByRole('button', { name: 'Essential only' });
          if (await consent.isVisible()) await consent.click();
          await page.getByRole('link', { name: 'Try the free Quote Desk', exact: true }).click();
        } else {
          await page.goto(base + '/quote-desk/', { waitUntil: 'networkidle' });
        }
        await page.getByRole('heading', { name: /Quote the job.*Know the time/ }).waitFor();
        assert.match(await page.title(), /Eidos Quote Desk/);
        assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow');
        await page.waitForFunction(() => document.getElementById('quote-price').textContent.startsWith('$'));
        const initial = await page.locator('#quote-price').innerText();
        await page.getByLabel('Quantity', { exact: true }).fill('60');
        assert.notEqual(await page.locator('#quote-price').innerText(), initial, 'quantity changes the estimate');
        assert.equal(await page.locator('#print').isEnabled(), true);
        await page.locator('#print').click();
        assert.equal(await page.evaluate(() => window.__quotePrintCount), 1, 'valid estimate reaches browser print');
        if (storage === 'available') {
          await page.reload({ waitUntil: 'networkidle' });
          assert.equal(await page.getByLabel('Quantity', { exact: true }).inputValue(), '60', 'available storage restores inputs');
        } else {
          assert.match(await page.locator('#draft-status').innerText(), /storage is unavailable/);
          assert.match(await page.locator('#quote-price').innerText(), /^\$/);
        }

        await page.getByLabel('Quantity', { exact: true }).fill('');
        assert.equal(await page.locator('#quote-price').innerText(), 'Check inputs');
        assert.equal(await page.locator('#print').isDisabled(), true);
        for (const id of ['unit-price', 'production-time', 'margin', 'cycles']) assert.equal(await page.locator('#' + id).innerText(), '—', `invalid input clears ${id}`);
        assert.equal(await page.locator('#cost-bars').locator('.cost-row').count(), 0, 'invalid input clears stale breakdown');
        assert.notEqual(await page.locator('#profit').innerText(), '', 'validation explains the problem');
        await page.getByRole('button', { name: 'Load sample job', exact: true }).click();
        assert.match(await page.locator('#quote-price').innerText(), /^\$/);
        assert.equal(await page.locator('#cost-bars .cost-row').count(), 6, 'correction restores cost breakdown');
        assert.equal(await page.locator('#print').isEnabled(), true);

        assert.match(await page.locator('#pricing').innerText(), /NOT YET FOR SALE/);
        assert.equal(await page.locator('#save-quote').isDisabled(), true);
        assert.equal(await page.locator('#save-preset').isDisabled(), true);
        await page.locator('#pricing-start').click();
        assert.equal(await page.locator('#workspace').isVisible(), true);
        assert.equal(await page.locator('#send-login').isDisabled(), true);
        assert.equal(await page.locator('#email').isDisabled(), true);
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        const size = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
        assert.ok(size.body <= size.viewport + 1, `no horizontal overflow ${width}/${storage}: ${JSON.stringify(size)}`);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(evidence, `quote-desk-${width}-${storage}.png`), fullPage: true });
        assert.deepEqual(accountRequests, [], 'static preview never calls account/payment APIs');
        assert.deepEqual(errors, [], 'no browser errors');

        if (storage === 'available') {
          await page.locator('#feedback-link').click();
          await page.getByRole('heading', { name: /Tell us what needs to become better/ }).waitFor();
          assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), '/contact');
          assert.equal(new URL(page.url()).searchParams.get('utm_source'), 'quote-desk');
          assert.equal(await page.getByLabel('What can we help with?').inputValue(), 'Quote Desk workspace feedback');
          assert.equal(await page.getByLabel('How did you find Eidos Works?').inputValue(), 'Saw one of our projects');
          assert.match(await page.locator('.ew-contact-form').innerText(), /whether the proposed \$19\/month feels justified/);
          assert.equal(await page.getByRole('button', { name: 'Send Quote Desk Feedback' }).isVisible(), true);
        }
        console.log(`PASS Quote Desk ${width}/${storage}: discovery, estimate, print, validation recovery, honest availability, no account requests${storage === 'available' ? ', inquiry navigation' : ''}`);
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); }
