import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

// Independently bundle the server package contract. Canonical runtime bytes must
// match the built browser package regardless of compiler name preservation.
const fixtureBuild = await build({ stdin: { contents: "export {buildFrozenPackage,createProjectSnapshot,parentEditions} from './src/playground/purchaseSnapshot'; export {createStarter} from './src/playground/starters';", resolveDir: process.cwd() }, bundle: true, format: 'esm', platform: 'node', write: false, keepNames: false });
const { buildFrozenPackage, createProjectSnapshot, parentEditions, createStarter } = await import('data:text/javascript;base64,' + Buffer.from(fixtureBuild.outputFiles[0].text).toString('base64'));

const require = createRequire(import.meta.url), pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:5184';
const out = process.env.PG_PURCHASE_EVIDENCE || 'artifacts/playground-unified/purchase-browser';
const engines = (process.env.PG_ENGINES || 'chromium').split(','), records = [];
const selectedScenarios = process.env.PG_SCENARIOS?.split(',');
const parent = parentEditions[0], privateReceipt = 'a'.repeat(64), ownerId = 'fixture-owner';
const source = createStarter({ starter: 'switchboard', goal: 'business', action: 'contact', name: 'Recovered Atlas' });
const serverFrozen = await buildFrozenPackage(await createProjectSnapshot(source, 'server-document-one', 7, parent.editionId));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
await mkdir(out, { recursive: true });

async function scenario(browser, engine, width, name, action) {
  if (selectedScenarios && !selectedScenarios.includes(name)) return;
  const runOut = path.resolve(out, engine, `${width}-${name}`); await mkdir(runOut, { recursive: true });
  const context = await browser.newContext({ viewport: { width, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const record = { engine, width, name, checks: [], errors: [], console: [], calls: [], unexpected: [], expectedHttpDenials: [], checkoutFixtures: [], stubbedAssets: [], fixtureNavigations: [] }; records.push(record);
  const state = { frozen: serverFrozen, availability: false, priceCents: 9900, orderPriceCents: 9900, owner: ownerId, purchaseState: 'paid', localTest: true, checkoutFailures: 0, allowCheckoutNavigation: false, holdCheckout: null, holdCapability: null, holdStatus: null };
  const accepted = () => ({ id: 'fixture-delivery', ownerId, documentId: state.frozen.snapshot.documentId, revision: state.frozen.snapshot.revision,
    snapshotHash: state.frozen.snapshot.snapshotHash, projectHash: state.frozen.snapshot.projectHash, archiveSha256: state.frozen.receipt.archiveSha256, archiveBytes: state.frozen.archive.length, mode: 'test' });
  const status = () => ({ priceCents: state.orderPriceCents, currency: 'usd', status: state.purchaseState, paymentState: state.purchaseState, fulfillmentStatus: state.purchaseState === 'paid' ? 'ready' : 'pending', mailStatus: 'fixture-only', orderId: 'fixture-order', productId: parent.editionId, editionId: 'developer', version: parent.version, downloadName: 'fixture-original.zip', downloadToken: state.purchaseState === 'paid' ? 'd'.repeat(64) : null,
    approvedPage: { ...accepted(), deliveryId: accepted().id, state: state.purchaseState === 'paid' ? 'ready' : state.purchaseState === 'refunded' ? 'revoked' : 'pending', output: state.frozen.snapshot.output, downloadName: 'fixture-approved.zip', parent: { productId: parent.editionId, editionId: 'developer', version: parent.version, archiveSha256: parent.sha256, archiveBytes: parent.bytes, licenseId: parent.license.id } } });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (!['http:', 'https:'].includes(url.protocol)) return route.continue();
    if (state.allowCheckoutNavigation && url.href === 'https://checkout.stripe.com/c/pay/fixture-must-not-navigate-after-cancel') {
      record.fixtureNavigations.push('Interception-only TEST checkout document');
      return route.fulfill({ status: 200, contentType: 'text/html', body: `<h1>Controlled TEST checkout fixture</h1><a href="${base}/playground/?checkout=cancelled">Cancel TEST checkout</a>` });
    }
    if (url.hostname === 'fonts.googleapis.com') { record.stubbedAssets.push(url.hostname); return route.fulfill({ status: 200, contentType: 'text/css', body: '/* Offline fixture uses the existing font fallback. */' }); }
    if (url.origin !== new URL(base).origin) { record.unexpected.push(request.url()); return route.abort('blockedbyclient'); }
    if (!url.pathname.startsWith('/api/')) return route.continue();
    const reply = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
    if (url.pathname === '/api/public-config') return reply({ gaMeasurementId: '', turnstileSiteKey: state.localTest ? '' : 'fixture-site-key', communityReady: false, accountsReady: true, aiReady: false, shopReady: false, localTest: state.localTest });
    if (url.pathname === '/api/members/account') return reply({ member: null });
    const input = request.method() === 'POST' ? request.postDataJSON() : undefined;
    record.calls.push({ path: url.pathname + url.search, method: request.method(), ...(input?.artifact ? { artifact: input.artifact } : {}) });
    if (url.pathname === '/api/playground/delivery' && url.search === '?capabilities=1') {
      if (state.holdCapability) await state.holdCapability.promise;
      if (!state.availability) { record.expectedHttpDenials.push({ status: 503, url: url.href }); return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Member sign-in is being connected. The complete Insights archive is free to read now.' }) }); }
      return reply({ capabilities: { mode: 'test', ownerId: state.owner, available: true, reason: null, limits: { snapshotBytes: 1500000, archiveBytes: 6000000 }, turnstileSiteKey: state.localTest ? '' : 'fixture-site-key', localTest: state.localTest,
        products: [{ productId: parent.editionId, editionId: 'developer', version: parent.version, priceCents: state.priceCents, currency: 'usd', parentArchiveSha256: parent.sha256, parentArchiveBytes: parent.bytes }] } });
    }
    if (url.pathname === '/api/shop/status') {
      if (state.holdStatus) await state.holdStatus.promise;
      if (state.owner !== ownerId) { record.expectedHttpDenials.push({ status: 403, url: url.href }); return route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ error: 'This purchase belongs to another account.' }) }); }
      return reply(status());
    }
    if (url.pathname === '/api/shop/download') {
      assert.equal(input.artifact, 'approved-page', 'this fixture only serves approved page bytes');
      return route.fulfill({ status: 200, contentType: 'application/zip', headers: { 'x-eidos-archive-sha256': state.frozen.receipt.archiveSha256 }, body: Buffer.from(state.frozen.archive) });
    }
    if (url.pathname === '/api/playground/delivery' && request.method() === 'POST') {
      state.frozen = await buildFrozenPackage(input.snapshot);
      await writeFile(path.join(runOut, 'server-manifest.json'), JSON.stringify(state.frozen.manifest, null, 2));
      await writeFile(path.join(runOut, 'server-script.js'), state.frozen.files.find(file => file.name === 'script.js').data);
      record.serverFreeze = accepted(); return reply({ delivery: accepted() });
    }
    if (url.pathname === '/api/playground/delivery' && url.searchParams.has('id')) return reply({ delivery: { ...accepted(), snapshot: state.frozen.snapshot, manifest: state.frozen.manifest } });
    if (url.pathname === '/api/shop/checkout') {
      record.checkoutFixtures.push({ attempt: input.attempt, challenge: input.challenge, deliveryId: input.deliveryId });
      if (state.holdCheckout) await state.holdCheckout.promise;
      if (state.checkoutFailures > 0) { state.checkoutFailures--; record.expectedHttpDenials.push({ status: 502, url: url.href }); return route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'Controlled checkout failure after consumed verification.' }) }); }
      return reply({ url: 'https://checkout.stripe.com/c/pay/fixture-must-not-navigate-after-cancel' });
    }
    record.unexpected.push(url.pathname + url.search); return route.fulfill({ status: 418, contentType: 'application/json', body: JSON.stringify({ error: 'Unexpected fixture request blocked.' }) });
  });
  page.on('pageerror', error => record.errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) record.console.push({ type: message.type(), text: message.text(), url: message.location().url }); });
  page.on('dialog', dialog => dialog.accept());
  const check = message => { record.checks.push(message); console.log(`${engine} ${width} ${name}: PASS ${message}`); };
  const saved = (key = 'current') => page.evaluate(key => new Promise((resolve, reject) => {
    const open = indexedDB.open('eidos-playground-v1', 1);
    open.onsuccess = () => { const database = open.result, request = database.transaction('workspace').objectStore('workspace').get(key); request.onsuccess = () => { database.close(); resolve(request.result || null); }; request.onerror = () => reject(request.error); };
    open.onerror = () => reject(open.error);
  }), key);
  const save = async () => { await page.locator('.pg-save-inline').click(); await page.waitForFunction(() => document.querySelector('.pg-save-inline')?.textContent.includes('Saved on this device')); return saved(); };
  const closeFinish = async () => { const close = page.getByRole('button', { name: 'Close finish review', exact: true }); if (await close.isVisible()) await close.click(); };
  const create = async name => { await page.getByRole('button', { name: /Switchboard/ }).click(); await page.getByLabel('Business or project name').fill(name); await page.getByRole('button', { name: /Create project/ }).click(); await page.locator('.pg-unified').waitFor(); return save(); };
  try {
    await action({ page, context, state, record, check, saved, save, closeFinish, create, runOut });
    const unexpectedConsoleErrors = record.console.filter(item => item.type === 'error' && !record.expectedHttpDenials.some(response => item.text.startsWith('Failed to load resource: the server responded with a status of ' + response.status) && (!item.url || item.url === response.url)));
    assert.equal(await page.locator('vite-error-overlay').count(), 0); assert.equal(record.errors.length, 0); assert.equal(unexpectedConsoleErrors.length, 0); assert.equal(record.unexpected.length, 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    record.title = await page.title(); record.url = page.url(); check('page identity, no runtime overlay or unexpected console error, no outside network, no horizontal overflow');
  } catch (error) { record.failure = error.stack; console.error(`${engine} ${width} ${name}: FAIL ${error.message}`); console.error(JSON.stringify({ errors: record.errors, console: record.console, unexpected: record.unexpected })); await page.screenshot({ path: path.join(runOut, 'failure.png'), fullPage: true }).catch(() => {}); }
  finally { state.holdCapability?.resolve(); state.holdCheckout?.resolve(); state.holdStatus?.resolve(); await writeFile(path.join(runOut, 'receipt.json'), JSON.stringify(record, null, 2) + '\n'); await context.close(); }
}

for (const engine of engines) {
  const browser = await pw[engine].launch({ headless: true, ...(engine === 'chromium' ? { args: ['--disable-gpu'] } : {}) });
  for (const width of [1440, 390]) await scenario(browser, engine, width, 'unavailable-purchase-local-download', async ({ page, record, check, create, runOut }) => {
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await create('Local page while purchases are unavailable');
    await page.getByRole('button', { name: 'Finish', exact: true }).click();
    await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click();
    await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
    await page.getByRole('button', { name: 'Check account purchase availability', exact: true }).click();
    await page.locator('.pg-purchase-flow [role="alert"]').filter({ hasText: 'Account purchases are unavailable right now. You can keep editing and download your page package locally.' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Purchase unavailable', exact: true }).isDisabled(), true);
    assert.deepEqual(record.calls, [{ path: '/api/playground/delivery?capabilities=1', method: 'GET' }]);
    const waiting = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download page package', exact: true }).click();
    const file = path.join(runOut, 'local-page.zip'); await (await waiting).saveAs(file);
    assert.ok((await readFile(file)).length > 1000);
    await page.screenshot({ path: path.join(runOut, 'unavailable-purchase-local-download.png'), fullPage: true });
    check('disabled purchase shows a contextual message, retains local ZIP download and makes no POST, checkout or payment request');
  });
  for (const width of [1440, 390]) await scenario(browser, engine, width, 'fresh-recovery', async ({ page, context, record, check, saved, save, closeFinish, runOut }) => {
    await page.goto(base + '/playground/?checkout=returned#receipt=' + privateReceipt, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Restore my approved page', exact: true }).waitFor();
    assert.equal(await page.locator('.pg-recovery-panel > div > span').textContent(), 'Private purchase return', 'unverified return must not claim a payment mode');
    assert.equal(await saved(), null); assert.equal(record.calls.length, 0); check('empty browser offers explicit recovery without creating a draft or calling purchase APIs');
    await page.screenshot({ path: path.join(runOut, 'return.png'), fullPage: true });
    await page.getByRole('button', { name: 'Restore my approved page', exact: true }).click(); await page.getByRole('button', { name: 'Download exact approved ZIP', exact: true }).waitFor();
    assert.equal(record.calls.some(call => call.path.includes('capabilities')), false); check('paid recovery succeeds while current checkout capability is unavailable');
    const waiting = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download exact approved ZIP', exact: true }).click();
    const download = await waiting, file = path.join(runOut, 'approved.zip'); await download.saveAs(file);
    assert.equal(digest(await readFile(file)), serverFrozen.receipt.archiveSha256); check('download matches the originally stored complete ZIP hash');
    const independentRoot = path.join(runOut, 'independent'); await mkdir(independentRoot, { recursive: true });
    for (const file of serverFrozen.files) { assert.ok(!file.name.includes('..') && !path.isAbsolute(file.name)); const target = path.join(independentRoot, file.name); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, file.data); }
    const independent = await context.newPage(); independent.on('pageerror', error => record.errors.push('Independent archive: ' + error.message));
    await independent.goto(pathToFileURL(path.join(independentRoot, 'index.html')).href); await independent.locator('h1').first().waitFor();
    assert.ok((await independent.locator('body').innerText()).includes('Recovered Atlas')); await independent.screenshot({ path: path.join(runOut, 'independent.png'), fullPage: true }); await independent.close();
    check('bundled-renderer stored package opens independently with its own runtime');
    await page.screenshot({ path: path.join(runOut, 'verified.png'), fullPage: true });
    await page.getByRole('button', { name: 'Open a new editable copy', exact: true }).click(); await page.locator('.pg-unified').waitFor(); await page.locator('dialog[open]').waitFor(); await closeFinish();
    const current = await save(); assert.notEqual(current.documentId, serverFrozen.snapshot.documentId); assert.deepEqual(current.project, serverFrozen.snapshot.project);
    await page.getByRole('button', { name: 'Finish', exact: true }).click(); await page.getByText('Frozen revision 7', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(runOut, 'reopened.png') }); check('recovery opens a distinct editable identity and retains the exact historical review');
  });
  await scenario(browser, engine, 1440, 'preserve-draft', async ({ page, check, saved, save, closeFinish, create, runOut }) => {
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); const before = await create('Draft to keep');
    await page.goto(base + '/playground/?checkout=returned#receipt=' + privateReceipt, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Restore my approved page', exact: true }).click(); await page.getByRole('button', { name: 'Open a new editable copy', exact: true }).click(); await page.locator('.pg-unified').waitFor(); await page.locator('dialog[open]').waitFor(); await closeFinish();
    const current = await save(); assert.notEqual(current.documentId, before.documentId); assert.deepEqual((await saved('project:' + before.documentId)).project, before.project);
    assert.deepEqual(current.project, serverFrozen.snapshot.project); await page.getByRole('button', { name: 'Back to projects', exact: true }).click();
    await page.getByText('Other projects saved on this device', { exact: true }).click();
    await page.getByText('Draft to keep', { exact: true }).waitFor(); await page.screenshot({ path: path.join(runOut, 'preserved.png'), fullPage: true });
    check('recovered copy preserves the existing draft under its original identity');
  });
  await scenario(browser, engine, 1440, 'deferred-recovery', async ({ page, state, record, check, create, save, runOut }) => {
    state.holdStatus = deferred();
    await page.goto(base + '/playground/?checkout=returned#receipt=' + privateReceipt, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Restore my approved page', exact: true }).click();
    const current = await create('New draft while recovery waits');
    assert.ok(record.calls.some(call => call.path === '/api/shop/status'));
    state.holdStatus.resolve(); await page.waitForTimeout(600);
    assert.equal((await save()).documentId, current.documentId); assert.deepEqual((await save()).project, current.project);
    assert.equal(await page.locator('dialog[open]').count(), 0); await page.screenshot({ path: path.join(runOut, 'late-recovery.png') });
    check('late recovery response after starting another project cannot open or replace the active draft');
  });
  await scenario(browser, engine, 1440, 'recovery-reauthorization', async ({ page, state, check, saved, runOut }) => {
    await page.goto(base + '/playground/?checkout=returned#receipt=' + privateReceipt, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Restore my approved page', exact: true }).click(); await page.getByRole('button', { name: 'Open a new editable copy', exact: true }).waitFor();
    state.owner = 'different-owner'; await page.getByRole('button', { name: 'Open a new editable copy', exact: true }).click();
    await page.locator('.pg-recovery-panel [role="alert"]').filter({ hasText: /another account/ }).waitFor(); assert.equal(await saved(), null); assert.equal(await page.locator('.pg-unified').count(), 0);
    check('account switch after retrieval blocks opening a new editable copy');
    state.owner = ownerId; state.purchaseState = 'refunded'; await page.getByRole('button', { name: 'Open a new editable copy', exact: true }).click();
    await page.locator('.pg-recovery-panel [role="alert"]').filter({ hasText: /not ready.*refunded/ }).waitFor(); assert.equal(await saved(), null);
    await page.screenshot({ path: path.join(runOut, 'revoked-before-open.png') }); check('revocation after retrieval blocks opening a new editable copy');
  });
  await scenario(browser, engine, 390, 'returned-checkout-price', async ({ page, state, record, check, create, runOut }) => {
    state.availability = true; state.priceCents = 8900; state.orderPriceCents = 9900; state.purchaseState = 'pending';
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await create('Original attempt price');
    await page.getByRole('button', { name: 'Finish', exact: true }).click(); await page.locator('.pg-finish-parent summary').click(); await page.getByLabel('Parent developer edition').selectOption(parent.editionId);
    await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click(); await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
    await page.getByRole('button', { name: 'Check account purchase availability', exact: true }).click(); await page.getByRole('button', { name: 'Save reviewed page to my account', exact: true }).click();
    await page.locator('.pg-purchase-accepted').waitFor();
    await page.evaluate(receipt => sessionStorage.setItem('eidos.playground.purchase-return', JSON.stringify({ state: 'returned', receipt })), privateReceipt);
    await page.getByLabel(/I have read the/).check();
    await page.getByRole('button', { name: 'Check returned purchase', exact: true }).click();
    await page.getByText('$99.00 · one-time TEST purchase', { exact: true }).waitFor();
    assert.equal(await page.getByLabel(/I have read the/).isChecked(), false);
    assert.equal(await page.getByRole('button', { name: 'Retry this TEST checkout', exact: true }).isDisabled(), true);
    assert.equal(record.checkoutFixtures.length, 0);
    await page.screenshot({ path: path.join(runOut, 'returned-price-requires-consent.png') });
    check('returned attempt shows its original price and clears previous catalog-price acceptance before retry');
  });
  await scenario(browser, engine, 390, 'changed-checkout-price', async ({ page, state, record, check, create, runOut }) => {
    state.availability = true; state.allowCheckoutNavigation = true;
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await create('Review changed price');
    await page.getByRole('button', { name: 'Finish', exact: true }).click(); await page.locator('.pg-finish-parent summary').click(); await page.getByLabel('Parent developer edition').selectOption(parent.editionId);
    await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click(); await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
    await page.getByRole('button', { name: 'Check account purchase availability', exact: true }).click(); await page.getByRole('button', { name: 'Save reviewed page to my account', exact: true }).click();
    await page.locator('.pg-purchase-accepted').waitFor(); await page.getByLabel(/I have read the/).check();
    state.priceCents = 10900;
    await page.getByRole('button', { name: 'Continue to TEST checkout', exact: true }).click();
    await page.locator('.pg-purchase-flow [role="alert"]').filter({ hasText: /price or edition changed/ }).waitFor();
    assert.equal(record.checkoutFixtures.length, 0); assert.equal(await page.getByLabel(/I have read the/).isChecked(), false);
    await page.getByText('$109.00 · one-time TEST purchase', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Continue to TEST checkout', exact: true }).isDisabled(), true);
    await page.screenshot({ path: path.join(runOut, 'changed-price-requires-consent.png') });
    check('changed displayed price blocks checkout, updates the price and requires renewed consent');
    await page.getByLabel(/I have read the/).check(); await page.getByRole('button', { name: 'Continue to TEST checkout', exact: true }).click();
    await page.getByRole('heading', { name: 'Controlled TEST checkout fixture', exact: true }).waitFor();
    assert.equal(record.checkoutFixtures.length, 1); check('explicit renewed consent permits exactly one intercepted checkout');
  });
  await scenario(browser, engine, 1440, 'cancelled-checkout', async ({ page, state, record, check, create, runOut }) => {
    state.availability = true; state.allowCheckoutNavigation = true; state.purchaseState = 'pending';
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await create('Cancel and continue');
    await page.getByRole('button', { name: 'Finish', exact: true }).click(); await page.locator('.pg-finish-parent summary').click(); await page.getByLabel('Parent developer edition').selectOption(parent.editionId);
    await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click(); await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
    await page.getByRole('button', { name: 'Check account purchase availability', exact: true }).click(); await page.getByRole('button', { name: 'Save reviewed page to my account', exact: true }).click();
    await page.locator('.pg-purchase-accepted').waitFor(); await page.getByLabel(/I have read the/).check(); await page.getByRole('button', { name: 'Continue to TEST checkout', exact: true }).click();
    await page.getByRole('heading', { name: 'Controlled TEST checkout fixture', exact: true }).waitFor();
    state.availability = false; const priorCalls = record.calls.length; await page.getByRole('link', { name: 'Cancel TEST checkout', exact: true }).click();
    await page.getByRole('button', { name: /Continue project/ }).click(); await page.getByRole('button', { name: 'Finish', exact: true }).click();
    await page.getByRole('button', { name: 'Check returned purchase', exact: true }).click(); await page.getByRole('heading', { name: 'Purchase is not ready', exact: true }).waitFor();
    assert.equal(record.calls.slice(priorCalls).some(call => call.path.includes('capabilities') || call.path === '/api/shop/checkout'), false);
    assert.equal(record.calls.filter(call => call.path === '/api/shop/checkout').length, 1); await page.getByRole('heading', { name: 'Purchase is not ready', exact: true }).scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(runOut, 'cancelled-return.png') });
    check('cancel return without a fragment retains the attempt and checks pending status while new checkout is unavailable');
  });
  await scenario(browser, engine, 1440, 'deferred-checkout', async ({ page, state, record, check, create, save, closeFinish, runOut }) => {
    state.availability = true;
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await create('Review in progress');
    await page.getByRole('button', { name: 'Finish', exact: true }).click(); await page.locator('.pg-finish-parent summary').click(); await page.getByLabel('Parent developer edition').selectOption(parent.editionId);
    await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click(); const approve = page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }); await approve.check();
    const localReview = await page.evaluate(() => new Promise((resolve, reject) => { const request = indexedDB.open('eidos-playground-reviews-v1', 1); request.onsuccess = () => { const database = request.result, read = database.transaction('packages').objectStore('packages').getAll(); read.onsuccess = () => { const frozen = read.result.find(value => value?.snapshot); database.close(); resolve({ snapshot: frozen.snapshot, archive: Array.from(frozen.archive), manifest: frozen.manifest, receipt: frozen.receipt, script: new TextDecoder().decode(frozen.files.find(file => file.name === 'script.js').data) }); }; read.onerror = () => reject(read.error); }; request.onerror = () => reject(request.error); }));
    await writeFile(path.join(runOut, 'browser-manifest.json'), JSON.stringify(localReview.manifest, null, 2)); await writeFile(path.join(runOut, 'browser-script.js'), localReview.script);
    await writeFile(path.join(runOut, 'browser-approved.zip'), Buffer.from(localReview.archive)); await writeFile(path.join(runOut, 'browser-snapshot.json'), JSON.stringify(localReview.snapshot, null, 2)); record.browserFreeze = localReview.receipt;
    assert.equal(record.calls.length, 0); check('manual create/review/approval makes no purchase API request');
    await page.getByRole('button', { name: 'Check account purchase availability', exact: true }).click();
    await page.getByRole('button', { name: 'Save reviewed page to my account', exact: true }).click();
    await page.locator('.pg-purchase-accepted').waitFor(); await page.getByLabel(/I have read the/).check();
    const priorCapabilities = record.calls.filter(call => call.path.includes('capabilities')).length;
    state.holdCapability = deferred(); await page.getByRole('button', { name: 'Continue to TEST checkout', exact: true }).click();
    for (let i = 0; i < 100 && record.calls.filter(call => call.path.includes('capabilities')).length === priorCapabilities; i++) await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(record.calls.filter(call => call.path.includes('capabilities')).length, priorCapabilities + 1);
    await approve.uncheck(); state.holdCapability.resolve(); state.holdCapability = null;
    await page.locator('.pg-purchase-flow [role="alert"]').filter({ hasText: /review changed or closed/i }).waitFor();
    assert.equal(record.calls.some(call => call.path === '/api/shop/checkout'), false); check('revoking review approval during deferred preflight prevents checkout dispatch');
    await approve.check();
    state.holdCheckout = deferred(); await page.getByRole('button', { name: 'Continue to TEST checkout', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.pg-purchase-flow')?.textContent.includes('Checking'));
    for (let i = 0; i < 100 && !record.calls.some(call => call.path === '/api/shop/checkout'); i++) await new Promise(resolve => setTimeout(resolve, 30));
    assert.ok(record.calls.some(call => call.path === '/api/shop/checkout'));
    await closeFinish(); await page.getByLabel('Project name', { exact: true }).fill('Newer unsent draft'); const edited = await save();
    state.holdCheckout.resolve(); await page.waitForTimeout(600);
    assert.equal(new URL(page.url()).pathname, '/playground/'); assert.equal(record.unexpected.length, 0); assert.equal((await save()).project.name, edited.project.name);
    await page.getByRole('button', { name: 'Finish', exact: true }).click(); await page.getByText(/Your draft is now revision/).waitFor();
    await page.screenshot({ path: path.join(runOut, 'stale-response.png') }); check('late checkout response after closing review and editing does not navigate or replace the newer draft');
    await page.getByRole('button', { name: 'Check purchase status', exact: true }).click(); await page.getByRole('heading', { name: 'Payment verified for this approved page', exact: true }).waitFor();
    state.owner = 'different-owner'; await page.getByRole('button', { name: 'Refresh account availability', exact: true }).click();
    await page.getByRole('button', { name: 'Save reviewed page to my account', exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Payment verified for this approved page', exact: true }).count(), 0);
    assert.equal(await page.locator('.pg-purchase-accepted').count(), 0); check('account switch clears the previous owner accepted and paid display');
  });
  await scenario(browser, engine, 1440, 'challenge-retry', async ({ page, context, state, record, check, create, runOut }) => {
    state.availability = true; state.localTest = false; state.checkoutFailures = 1; state.allowCheckoutNavigation = true;
    await context.addInitScript(() => {
      const fixture = window.__challengeFixture = { renders: [], removed: [], issue() { const latest = this.renders.at(-1); latest.options.callback('fixture-token-' + latest.id); } };
      window.turnstile = { render(element, options) { const id = String(fixture.renders.length + 1); fixture.renders.push({ id, options }); element.textContent = 'Controlled verification fixture'; return id; }, remove(id) { fixture.removed.push(id); }, reset() { throw Error('Fixture expects the existing resetKey remove/render contract.'); } };
    });
    await page.goto(base + '/playground/', { waitUntil: 'domcontentloaded' }); await create('Retry the same reviewed page');
    await page.getByRole('button', { name: 'Finish', exact: true }).click(); await page.locator('.pg-finish-parent summary').click(); await page.getByLabel('Parent developer edition').selectOption(parent.editionId);
    await page.getByRole('button', { name: 'Prepare current draft', exact: true }).click(); await page.getByLabel('I reviewed this frozen version for my local download.', { exact: true }).check();
    await page.getByRole('button', { name: 'Check account purchase availability', exact: true }).click(); await page.getByRole('button', { name: 'Save reviewed page to my account', exact: true }).click();
    await page.locator('.pg-purchase-accepted').waitFor(); await page.getByLabel(/I have read the/).check();
    const checkout = page.getByRole('button', { name: 'Continue to TEST checkout', exact: true });
    await page.waitForFunction(() => window.__challengeFixture.renders.length === 1); assert.equal(await checkout.isDisabled(), true);
    await page.evaluate(() => window.__challengeFixture.issue()); await checkout.click();
    await page.locator('.pg-purchase-flow [role="alert"]').filter({ hasText: /Controlled checkout failure/ }).waitFor();
    await page.waitForFunction(() => window.__challengeFixture.renders.length === 2 && window.__challengeFixture.removed.includes('1'), undefined, { timeout: 5000 });
    assert.equal(await checkout.isDisabled(), true); await checkout.scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(runOut, 'failed-token-cleared.png') });
    check('failed dispatched checkout removes the consumed challenge and waits for a fresh verification token');
    await page.evaluate(() => window.__challengeFixture.issue()); await checkout.click(); await page.getByRole('heading', { name: 'Controlled TEST checkout fixture', exact: true }).waitFor();
    assert.equal(record.checkoutFixtures.length, 2); assert.equal(record.checkoutFixtures[0].attempt, record.checkoutFixtures[1].attempt); assert.equal(record.checkoutFixtures[0].deliveryId, record.checkoutFixtures[1].deliveryId);
    assert.equal(record.checkoutFixtures[0].challenge, 'fixture-token-1'); assert.equal(record.checkoutFixtures[1].challenge, 'fixture-token-2');
    await page.screenshot({ path: path.join(runOut, 'retry-dispatched.png') }); check('retry keeps the immutable purchase attempt and dispatches only with the fresh token');
  });
  await browser.close();
}
const sourceFiles = await Promise.all(['src/playground/PurchaseRecovery.tsx', 'src/playground/purchaseRecoveryClient.ts', 'src/playground/purchaseClient.ts', 'src/playground/purchaseSnapshot.ts', 'src/playground/purchaseReviewStorage.ts', 'src/playground/FinishPurchase.tsx', 'src/playground/FinishReview.tsx', 'src/playground/Playground.tsx', 'src/playground/useProject.ts', 'src/playground/renderer.ts', 'src/playground/runtimeBundle.ts', 'src/playground/pageStyles.ts', 'src/components/Turnstile.tsx', 'scripts/verify-playground-purchase-browser.mjs'].map(async file => ({ path: file, sha256: digest(await readFile(file)) })));
await writeFile(path.join(out, 'receipt.json'), JSON.stringify({ timestampUtc: new Date().toISOString(), source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceFiles, base,
  browserAvailability: 'External Playwright fixture harness; Chromium, Firefox and WebKit locally available', flow: 'Private return -> explicit authenticated fixture retrieval -> exact stored ZIP -> separate editable copy',
  fixtureOnly: true, actualPayment: false, actualEmail: false, hostedAcceptance: false, physicalDevice: false,
  fixtureArchive: { sha256: serverFrozen.receipt.archiveSha256, bytes: serverFrozen.archive.length }, records }, null, 2) + '\n');
if (records.some(record => record.failure)) process.exitCode = 1;
