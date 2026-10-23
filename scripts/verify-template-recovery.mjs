import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

// Controlled browser fixture only. Every account/commerce API is intercepted;
// no provider, mail, payment, or hosted account request leaves this process.
const require = createRequire(import.meta.url), { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const phase = process.env.RECOVERY_PHASE || 'after';
assert.ok(['before', 'after'].includes(phase));
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:5191';
const out = path.resolve(process.env.RECOVERY_EVIDENCE || 'artifacts/playground-unified/continuation-recovery', phase);
const fixture = await build({ stdin: { contents: "export {createStarter} from './src/playground/starters'; export {editorSelection} from './src/playground/workspace';", resolveDir: process.cwd() }, bundle: true, format: 'esm', platform: 'node', write: false });
const { createStarter, editorSelection } = await import('data:text/javascript;base64,' + Buffer.from(fixture.outputFiles[0].text).toString('base64'));
const project = createStarter({ starter: 'switchboard', goal: 'business', action: 'contact', name: 'My existing draft' });
const workspace = { project, snapshots: [], documentId: 'existing-private-draft', revision: 4, editor: editorSelection(project), savedAt: '2026-10-14T12:00:00.000Z' };
const privateToken = 'c'.repeat(64), privateReceipt = 'b'.repeat(64), records = [];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
for (const scenario of phase === 'before' ? ['reload'] : ['sign-in-retry', 'reload', 'wrong-owner', 'guest-original']) {
  const width = scenario === 'reload' ? 390 : 1440;
  const record = { phase, scenario, width, checks: [], calls: [], errors: [], unexpected: [], expectedHttpDenials: [] }; records.push(record);
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  let signedIn = false, redeemCount = 0;
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (!['http:', 'https:'].includes(url.protocol)) return route.continue();
    if (url.hostname === 'fonts.googleapis.com') return route.fulfill({ status: 200, contentType: 'text/css', body: '/* Offline fixture uses local fallback fonts. */' });
    if (url.origin !== new URL(base).origin) { record.unexpected.push(url.origin + url.pathname); return route.abort('blockedbyclient'); }
    assert.ok(!url.search.includes(privateToken) && !url.search.includes(privateReceipt), 'private identities must never be URL queries');
    if (url.pathname === '/account') return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Controlled sign-in fixture</h1><button onclick="fetch(\'/fixture-sign-in\').then(()=>this.textContent=\'Signed in\')">Sign in as purchase owner</button>' });
    if (url.pathname === '/fixture-sign-in') { signedIn = true; return route.fulfill({ status: 200, body: 'fixture-only' }); }
    if (!url.pathname.startsWith('/api/')) return route.continue();
    record.calls.push({ path: url.pathname, method: request.method() });
    const reply = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (url.pathname === '/api/public-config') return reply({ gaMeasurementId: '', turnstileSiteKey: '', communityReady: false, accountsReady: true, aiReady: false, shopReady: false, localTest: true });
    if (url.pathname === '/api/members/account') return reply({ member: null });
    if (url.pathname === '/api/shop/redeem') {
      redeemCount++; assert.deepEqual(request.postDataJSON(), { token: privateToken });
      if (scenario !== 'guest-original' && !signedIn) {
        const status = scenario === 'wrong-owner' ? 403 : 401; record.expectedHttpDenials.push(status);
        return reply({ error: status === 403 ? 'This purchase belongs to another account.' : 'Sign in to the account that approved this page.' }, status);
      }
      return reply({ receipt: privateReceipt, ...(scenario !== 'guest-original' ? { continuePath: '/playground/?checkout=returned#receipt=' + privateReceipt } : {}) });
    }
    if (url.pathname === '/api/shop/status') { assert.equal(request.postDataJSON().receipt, privateReceipt); return reply({ status: 'paid', orderId: 'controlled-guest-order', productId: 'switchboard-developer', editionId: 'developer', version: '1.0.0', mailStatus: 'sent' }); }
    record.unexpected.push(url.pathname); return reply({ error: 'Unexpected fixture request blocked.' }, 418);
  });
  page.on('pageerror', error => record.errors.push(error.message));
  const check = message => { record.checks.push(message); console.log(`${phase} ${scenario}: PASS ${message}`); };
  async function saved() { return page.evaluate(() => new Promise((resolve, reject) => {
    const open = indexedDB.open('eidos-playground-v1', 1); open.onsuccess = () => { const db = open.result, request = db.transaction('workspace').objectStore('workspace').get('project:existing-private-draft'); request.onsuccess = () => { db.close(); resolve(request.result); }; request.onerror = () => reject(request.error); }; open.onerror = () => reject(open.error);
  })); }
  try {
    await page.goto(base + '/shop/choose', { waitUntil: 'networkidle' });
    const essential = page.getByRole('button', { name: 'Essential only', exact: true }); if (await essential.isVisible()) await essential.click();
    await page.evaluate(value => new Promise((resolve, reject) => {
      const open = indexedDB.open('eidos-playground-v1', 1); open.onupgradeneeded = () => open.result.createObjectStore('workspace'); open.onsuccess = () => { const db = open.result, tx = db.transaction('workspace', 'readwrite'), store = tx.objectStore('workspace'); store.put(value, 'current'); store.put(value, 'project:' + value.documentId); store.put({ documentId: value.documentId, name: value.project.name, savedAt: value.savedAt }, 'summary:' + value.documentId); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); }; open.onerror = () => reject(open.error);
    }), workspace);
    await page.goto(base + '/shop/start#token=' + privateToken, { waitUntil: 'networkidle' });
    if (scenario === 'guest-original') {
      await page.getByRole('button', { name: 'Download your versioned package' }).waitFor();
      assert.equal(new URL(page.url()).pathname, '/shop/start'); assert.equal(redeemCount, 1); check('guest original recovery remains on its original download page without sign-in');
    } else {
      await page.getByRole('alert').waitFor(); assert.equal(new URL(page.url()).hash, ''); assert.equal(new URL(page.url()).search, '');
      assert.equal((await page.locator('body').innerText()).includes(privateToken), false); assert.equal(redeemCount, 1); check('private fragment removed, no token rendered, exactly one initial redemption');
      await page.screenshot({ path: path.join(out, scenario + '-requires-account.png'), fullPage: true });
      if (phase === 'before') {
        assert.equal(await page.getByRole('button', { name: 'Retry private recovery' }).count(), 0);
        assert.equal(await page.evaluate(() => sessionStorage.getItem('eidos.template.pending-recovery')), null);
        signedIn = true; await page.reload({ waitUntil: 'networkidle' }); assert.equal(redeemCount, 1); check('reproduced defect: sign-in then reload cannot resume, because private link was lost');
      } else {
        assert.equal(await page.evaluate(token => JSON.parse(sessionStorage.getItem('eidos.template.pending-recovery')).token === token, privateToken), true);
        const accountPageWait = context.waitForEvent('page'); await page.getByRole('link', { name: 'Sign in or switch account' }).click();
        const accountPage = await accountPageWait; await accountPage.getByRole('button', { name: 'Sign in as purchase owner' }).click(); await accountPage.getByRole('button', { name: 'Signed in', exact: true }).waitFor(); await accountPage.close();
        if (scenario === 'reload') await page.reload({ waitUntil: 'domcontentloaded' });
        else await page.getByRole('button', { name: 'Retry private recovery' }).click();
        await page.waitForURL(url => url.pathname === '/playground/'); await page.getByRole('button', { name: 'Restore my approved page', exact: true }).waitFor();
        await page.getByRole('button', { name: /Continue project/ }).waitFor();
        assert.equal(redeemCount, 2); assert.equal(await page.evaluate(() => sessionStorage.getItem('eidos.template.pending-recovery')), null);
        assert.equal(await page.evaluate(receipt => sessionStorage.getItem('eidos.template.receipt') === receipt, privateReceipt), true);
        check('same private token resumes after account change without reopening email; one retry, safe Playground continuation, pending token cleared');
      }
    }
    const retained = await saved(); assert.ok(Number.isFinite(Date.parse(retained.savedAt)));
    assert.deepEqual({ ...retained, savedAt: workspace.savedAt }, workspace);
    record.draftSaveTimestampRefreshed = retained.savedAt !== workspace.savedAt;
    check('existing named draft, source, selection, revision, and snapshots remain exact; ordinary load may refresh the save timestamp');
    assert.equal(record.errors.length, 0); assert.equal(record.unexpected.length, 0); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    check('no runtime errors, outside network requests, or horizontal overflow');
    await page.screenshot({ path: path.join(out, scenario + '-result.png'), fullPage: true });
  } catch (error) { record.failure = String(error.stack).replaceAll(privateToken, '[private-token]').replaceAll(privateReceipt, '[private-receipt]'); await page.screenshot({ path: path.join(out, scenario + '-failure.png'), fullPage: true }).catch(() => {}); }
  finally { record.redemptions = redeemCount; await writeFile(path.join(out, scenario + '.json'), JSON.stringify(record, null, 2) + '\n'); await context.close(); }
}
await browser.close();
await writeFile(path.join(out, 'receipt.json'), JSON.stringify({ phase, boundary: 'Local browser with controlled account and commerce responses only; no real sign-in, mail, payment, provider, deployment, or original archive changes.', passed: records.every(record => !record.failure), records }, null, 2) + '\n');
assert.ok(records.every(record => !record.failure), records.filter(record => record.failure).map(record => record.failure).join('\n'));
