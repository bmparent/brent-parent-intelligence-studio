import assert from 'node:assert/strict';

export function launchOptions(engine) {
  return { headless: true, ...(engine === 'chromium' ? {
    args: ['--disable-gpu'],
    ...(process.env.PG_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PG_CHROMIUM_EXECUTABLE } : {}),
  } : {}) };
}

// Fail closed before sending any editor API mutation. Config/account reads are
// allowed; all project cloud, AI, payment and recovery calls are forbidden.
// Context routing also guards preview iframes and independent extracted ZIP tabs.
export async function guardLocalEditor(page) {
  const forbidden = [];
  let editorOrigin;
  await page.context().route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (!editorOrigin && request.isNavigationRequest() && ['http:', 'https:'].includes(url.protocol)) editorOrigin = url.origin;
    const local = ['file:', 'data:', 'blob:', 'about:'].includes(url.protocol) || url.origin === editorOrigin;
    const readOnly = ['GET', 'HEAD'].includes(request.method());
    const provider = /(^|\.)(openai\.com|anthropic\.com|stripe\.com|resend\.com|replicate\.com|runwayml\.com)$/.test(url.hostname);
    const api = url.pathname.startsWith('/api/');
    const allowedRead = ['/api/public-config', '/api/members/account'].includes(url.pathname);
    if (local && readOnly && !provider && allowedRead) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(url.pathname === '/api/public-config' ? { accountsReady: false, aiReady: false, shopReady: false, communityReady: false, turnstileSiteKey: '', gaMeasurementId: '' } : { member: null }) });
    if (local && readOnly && !provider && !api) return route.continue();
    forbidden.push(`${request.method()} ${url.pathname}`);
    await route.abort('blockedbyclient');
  });
  page.context().on('close', () => assert.deepEqual(forbidden, [], 'Local editor attempted a forbidden cloud/provider request'));
  return async () => {
    assert.deepEqual(forbidden, [], 'Local editor attempted a forbidden cloud/provider request');
    assert.equal(await page.getByRole('button', { name: /^(AI|AI assist|Generate with AI|Purchase.*|Recover purchase|Purchase recovery|Checkout)$/i }).count(), 0);
  };
}

// Local packages use ZIP STORE. This reader is deliberately independent of the
// application renderer and purchase/archive modules.
export function readLocalZip(input) {
  const bytes = Buffer.from(input), files = [];
  let offset = 0;
  while (offset + 30 <= bytes.length && bytes.readUInt32LE(offset) === 0x04034b50) {
    assert.equal(bytes.readUInt16LE(offset + 8), 0, 'Expected uncompressed local ZIP');
    const size = bytes.readUInt32LE(offset + 18), length = bytes.readUInt16LE(offset + 26), extra = bytes.readUInt16LE(offset + 28);
    const name = bytes.subarray(offset + 30, offset + 30 + length).toString();
    assert.ok(name && !name.includes('..') && !name.startsWith('/') && !name.includes('\\'));
    const start = offset + 30 + length + extra;
    assert.ok(start + size <= bytes.length, 'ZIP entry is truncated');
    assert.ok(!files.some(file => file.name === name), 'Duplicate ZIP entry');
    files.push({ name, data: bytes.subarray(start, start + size) });
    offset = start + size;
  }
  assert.ok(files.length && bytes.readUInt32LE(offset) === 0x02014b50, 'ZIP central directory missing');
  return files;
}
