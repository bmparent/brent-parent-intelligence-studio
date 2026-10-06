import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const evidence = process.env.PG_EVIDENCE_DIR || '/tmp/eidos-quote-desk';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

async function verifyContactServiceSelection(page, width) {
  const feedbackService = 'Quote Desk workspace feedback';
  const generalPrompt = 'What needs to become clearer, easier, or more useful?';
  const feedbackPrompt = 'What should Quote Desk save, reuse, or plan for you?';
  const volumeLabel = 'About how many embroidery quotes do you build in a typical week?';
  const priceLabel = 'If it handled that workflow well, how does $19/month feel?';
  const problem = 'Synthetic browser check: please improve our project inquiry workflow.';
  const submissions = [];
  await page.route(/^https:\/\/([^/]+\.)?(googletagmanager|google-analytics)\.com\//, route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.route('**/api/growth/events', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"accepted":true}' }));
  await page.route('**/api/project-inquiries', async route => {
    submissions.push(route.request().postDataJSON());
    // Keep the draft so repeated service changes and email fallback can be inspected.
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"state":"fallback","message":"Synthetic service-switch acceptance."}' });
  });
  // Synthetic consent lets this check prove attribution survives changing the service.
  await page.evaluate(() => {
    localStorage.setItem('eidos.analytics.v1', 'granted');
    sessionStorage.removeItem('eidos.growth.v1');
  });
  await page.reload({ waitUntil: 'networkidle' });
  const form = page.locator('.ew-contact-form');
  const service = page.getByLabel('What can we help with?');
  const foundVia = page.getByLabel('How did you find Eidos Works?');
  await page.waitForFunction(() => document.querySelector('.ew-contact-form select')?.value === 'Quote Desk workspace feedback');
  await page.getByLabel('Name', { exact: true }).fill('Eidos Works QA');
  await page.getByLabel('Email', { exact: true }).fill('qa@example.invalid');
  await page.getByLabel(feedbackPrompt).fill(problem);
  assert.equal(await form.evaluate(element => element.checkValidity()), false, 'feedback questions are required');

  await service.selectOption({ label: 'Digital Experiences' });
  await page.getByLabel(generalPrompt).fill('');
  await page.getByLabel(generalPrompt).focus();
  await page.keyboard.insertText('x'.repeat(1600));
  assert.equal(await page.getByLabel(generalPrompt).evaluate(element => element.checkValidity()), true);
  await service.selectOption({ label: feedbackService });
  assert.equal((await page.getByLabel(feedbackPrompt).inputValue()).length, 1600, 'switching services never trims the project draft');
  assert.equal(await page.getByLabel(feedbackPrompt).evaluate(element => element.validity.tooLong), true, 'feedback text limit requires correction before submission');
  await service.selectOption({ label: 'Digital Experiences' });
  assert.equal((await page.getByLabel(generalPrompt).inputValue()).length, 1600);
  assert.equal(await page.getByLabel(generalPrompt).evaluate(element => element.checkValidity()), true);
  await page.getByLabel(generalPrompt).fill(problem);

  async function submitFixture(buttonName) {
    const count = submissions.length;
    const response = page.waitForResponse(response => new URL(response.url()).pathname === '/api/project-inquiries');
    await page.getByRole('button', { name: buttonName, exact: true }).click();
    await response;
    await page.getByRole('button', { name: buttonName, exact: true }).waitFor();
    assert.equal(submissions.length, count + 1);
    return submissions.at(-1);
  }
  async function assertGeneralService(label) {
    await service.selectOption({ label });
    assert.equal(await page.getByLabel(volumeLabel).count(), 0, 'unrelated service has no embroidery requirement');
    assert.equal(await page.getByLabel(priceLabel).count(), 0, 'unrelated service has no price-intent requirement');
    assert.equal(await form.getByRole('note').count(), 0, 'unrelated service has no Quote Desk explanation');
    assert.equal(await page.getByLabel(generalPrompt).getAttribute('maxlength'), '1600');
    assert.equal(await page.getByRole('button', { name: 'Send Project Note', exact: true }).isVisible(), true);
    assert.equal(await form.evaluate(element => element.checkValidity()), true, 'project submission is not blocked by hidden survey fields');
    const submitted = await submitFixture('Send Project Note');
    assert.equal(submitted.projectType, label);
    assert.equal(submitted.problem, problem, 'survey answers are excluded from unrelated service payloads');
    assert.ok(!submitted.brief.includes('Typical weekly embroidery quotes:'), 'email brief excludes survey answers');
    assert.ok(!submitted.brief.includes('Interest at the proposed $19/month:'));
    const mailto = new URL(await page.getByRole('link', { name: 'Email this note', exact: true }).getAttribute('href'));
    assert.ok(!mailto.searchParams.get('body').includes('Typical weekly embroidery quotes:'));
    assert.equal(submitted.utmSource, 'quote-desk', 'campaign attribution survives a changed service');
    assert.equal(submitted.utmMedium, 'owned-tool');
    assert.equal(submitted.utmCampaign, 'quote-desk-validation');
    return submitted;
  }

  const switched = await assertGeneralService('Digital Experiences');
  assert.equal(switched.foundVia, 'Saw one of our projects', 'campaign discovery default is preserved');
  await page.screenshot({ path: path.join(evidence, `contact-service-switch-${width}.png`), fullPage: true });
  await service.selectOption({ label: feedbackService });
  assert.equal(await form.evaluate(element => element.checkValidity()), false, 'switching back restores required questions');
  await page.getByLabel(volumeLabel).selectOption({ label: '6–15' });
  await page.getByLabel(priceLabel).selectOption({ label: 'I might try it' });
  await foundVia.selectOption({ label: 'Referral' });
  for (const label of ['Digital Experiences', 'Business Systems', 'Intelligent Systems', 'Prototype / Product Exploration', 'Agentic SEO', 'Eidos Snapshot', 'Something else']) {
    const submitted = await assertGeneralService(label);
    assert.equal(submitted.foundVia, 'Referral', 'explicit discovery choice is preserved');
  }
  await service.selectOption({ label: feedbackService });
  assert.equal(await page.getByLabel(volumeLabel).inputValue(), '6–15', 'switching back retains the feedback draft');
  assert.equal(await page.getByLabel(priceLabel).inputValue(), 'I might try it');
  assert.equal(await page.getByLabel(feedbackPrompt).getAttribute('maxlength'), '1400');
  const restored = await submitFixture('Send Quote Desk Feedback');
  assert.equal(restored.projectType, feedbackService);
  assert.match(restored.problem, /Typical weekly embroidery quotes: 6–15/);
  assert.match(restored.problem, /Interest at the proposed \$19\/month: I might try it/);
  const feedbackMailto = new URL(await page.getByRole('link', { name: 'Email this note', exact: true }).getAttribute('href'));
  assert.match(feedbackMailto.searchParams.get('body'), /Typical weekly embroidery quotes: 6–15/);

  await page.goto(base + '/contact/', { waitUntil: 'networkidle' });
  assert.equal(await service.inputValue(), 'Digital Experiences', 'ordinary visits keep the existing default');
  assert.equal(await foundVia.inputValue(), '', 'ordinary visits do not infer discovery source');
  assert.equal(await page.getByLabel(volumeLabel).count(), 0);
  assert.equal(await page.getByLabel(generalPrompt).getAttribute('maxlength'), '1600');
  await page.getByLabel('Name', { exact: true }).fill('Eidos Works QA');
  await page.getByLabel('Email', { exact: true }).fill('qa@example.invalid');
  await page.getByLabel(generalPrompt).fill(problem);
  const ordinary = await submitFixture('Send Project Note');
  assert.equal(ordinary.projectType, 'Digital Experiences');
  assert.equal(ordinary.problem, problem);
  await service.selectOption({ label: feedbackService });
  assert.equal(await page.getByLabel(volumeLabel).isVisible(), true, 'manually selected feedback gets the same questions without a campaign URL');
  assert.equal(await page.getByLabel(priceLabel).isVisible(), true);
  assert.equal(await form.evaluate(element => element.checkValidity()), false);
  await page.getByLabel(volumeLabel).selectOption({ label: '1–5' });
  await page.getByLabel(priceLabel).selectOption({ label: 'Too expensive for me' });
  const manual = await submitFixture('Send Quote Desk Feedback');
  assert.equal(manual.projectType, feedbackService);
  assert.match(manual.problem, /Typical weekly embroidery quotes: 1–5/);
  assert.match(manual.problem, /Interest at the proposed \$19\/month: Too expensive for me/);
}

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
        assert.equal(await page.locator('.print-details').isVisible(), false, 'print-only assumptions stay out of the screen estimate');
        const initial = await page.locator('#quote-price').innerText();
        await page.getByLabel('Job name', { exact: true }).fill('School hats · job 101');
        await page.getByLabel('Quantity', { exact: true }).fill('60');
        assert.notEqual(await page.locator('#quote-price').innerText(), initial, 'quantity changes the estimate');
        assert.equal(await page.locator('#print').isEnabled(), true);
        await page.locator('#print').click();
        assert.equal(await page.evaluate(() => window.__quotePrintCount), 1, 'valid estimate reaches browser print');
        if (storage === 'available') {
          await page.reload({ waitUntil: 'networkidle' });
          assert.equal(await page.getByLabel('Quantity', { exact: true }).inputValue(), '60', 'available storage restores inputs');
          assert.equal(await page.getByLabel('Job name', { exact: true }).inputValue(), 'School hats · job 101', 'reload retains the job name with its inputs');
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
        assert.equal(await page.getByLabel('Quantity', { exact: true }).getAttribute('aria-invalid'), 'true');
        assert.match(await page.locator('#error-quantity').innerText(), /Quantity: enter a whole number from 1 to 100,000/);
        await page.getByRole('button', { name: 'Fix Quantity', exact: true }).click();
        assert.equal(await page.getByLabel('Quantity', { exact: true }).evaluate(element => element === document.activeElement), true, 'error correction focuses the offending field');
        await page.getByRole('button', { name: 'Load sample job', exact: true }).click();
        assert.match(await page.locator('#quote-price').innerText(), /^\$/);
        assert.equal(await page.locator('#cost-bars .cost-row').count(), 6, 'correction restores cost breakdown');
        assert.equal(await page.locator('#print').isEnabled(), true);
        assert.equal(await page.getByLabel('Quantity', { exact: true }).getAttribute('aria-invalid'), null);
        await page.getByLabel('Job name', { exact: true }).fill('School hats · job 101');
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('#estimate-name').isVisible(), true, 'printed estimate includes its job name');
        assert.match(await page.locator('#estimate-job').innerText(), /48 items.*8,500 stitches.*6 active head/);
        assert.equal(await page.locator('#print-assumptions').isVisible(), true, 'printed estimate includes shop assumptions');
        assert.match(await page.locator('#print-assumptions').innerText(), /Blank cost.*7/s);
        assert.equal(await page.locator('#print-assumptions dt').count(), 23, 'print retains every editable assumption');
        if (storage === 'available') await page.pdf({ path: path.join(evidence, `quote-desk-internal-estimate-${width}.pdf`), format: 'A4', printBackground: true });
        await page.emulateMedia({ media: 'screen' });
        assert.equal(await page.locator('.print-details').isVisible(), false, 'leaving print restores the compact screen estimate');

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
          let submittedFeedback;
          await page.route('**/api/project-inquiries', async route => {
            submittedFeedback = route.request().postDataJSON();
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submitted: true, message: 'Synthetic browser acceptance.' }) });
          });
          await page.locator('#feedback-link').click();
          await page.getByRole('heading', { name: /Tell us what needs to become better/ }).waitFor();
          assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), '/contact');
          assert.equal(new URL(page.url()).searchParams.get('utm_source'), 'quote-desk');
          await page.waitForFunction(() => document.querySelector('.ew-contact-form select')?.value === 'Quote Desk workspace feedback');
          assert.equal(await page.getByLabel('What can we help with?').inputValue(), 'Quote Desk workspace feedback');
          assert.equal(await page.getByLabel('How did you find Eidos Works?').inputValue(), 'Saw one of our projects');
          assert.match(await page.locator('.ew-contact-form').innerText(), /Two quick signals help us decide/);
          assert.equal(await page.getByRole('button', { name: 'Send Quote Desk Feedback' }).isVisible(), true);
          await page.getByLabel('Name', { exact: true }).fill('Eidos Works QA');
          await page.getByLabel('Email', { exact: true }).fill('qa@example.invalid');
          await page.getByLabel('About how many embroidery quotes do you build in a typical week?').selectOption({ label: '6–15' });
          await page.getByLabel('If it handled that workflow well, how does $19/month feel?').selectOption({ label: 'I might try it' });
          await page.getByLabel('What should Quote Desk save, reuse, or plan for you?').fill('Synthetic browser check for the Quote Desk feedback classification.');
          await page.getByRole('button', { name: 'Send Quote Desk Feedback' }).click();
          await page.getByText('Synthetic browser acceptance.').waitFor();
          assert.equal(submittedFeedback.projectType, 'Quote Desk workspace feedback');
          assert.equal(submittedFeedback.foundVia, 'Saw one of our projects');
          assert.match(submittedFeedback.problem, /Typical weekly embroidery quotes: 6–15/);
          assert.match(submittedFeedback.problem, /Interest at the proposed \$19\/month: I might try it/);
          await verifyContactServiceSelection(page, width);
          assert.deepEqual(errors, [], 'no browser errors after contact service changes');
        }
        console.log(`PASS Quote Desk ${width}/${storage}: discovery, estimate, print, validation recovery, honest availability, no account requests${storage === 'available' ? ', inquiry navigation' : ''}`);
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); }
