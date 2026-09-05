import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware';
const env = { EIDOS_PLATFORM_URL:'https://eidos-sentinel-lab.vercel.app', EIDOS_PLATFORM_TOKEN:'relay-test-at-least-32-characters-long' };
await test('Relay preserves webhook body and signature, overwrites client claims, and never redirects secrets', async () => {
  const original = globalThis.fetch;
  let nextCalls = 0;
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url),'https://eidos-sentinel-lab.vercel.app/api/works/v1/api/shop/webhook');
    assert.equal(init?.body,'{"exact": "body"}\n');
    const h = new Headers(init?.headers);
    assert.equal(h.get('stripe-signature'),'signature');
    assert.equal(h.get('x-eidos-site-origin'),'https://eidos-works.com');
    assert.equal(h.get('x-eidos-platform-token'),env.EIDOS_PLATFORM_TOKEN);
    assert.equal(h.get('x-eidos-client-ip'),'192.0.2.1');
    assert.equal(h.get('x-vercel-protection-bypass'), null);
    assert.equal(init?.redirect,'manual');
    return Response.json({ok:true});
  };
  const next = async () => { nextCalls++; return new Response('local'); };
  try {
    const response = await onRequest({env,next,request:new Request('https://eidos-works.com/api/shop/webhook',{
      method:'POST',body:'{"exact": "body"}\n', headers:{'stripe-signature':'signature','CF-Connecting-IP':'192.0.2.1','x-eidos-platform-token':'forged','x-eidos-site-origin':'https://evil.example','x-vercel-protection-bypass':'forged'},
    })});
    assert.equal(response.status,200); assert.equal(nextCalls,0);
    assert.equal((await onRequest({env,next,request:new Request('https://eidos-works.com/api/snapshot/checkout')})).status,200);
    assert.equal(nextCalls,1);
    globalThis.fetch = async () => new Response(null, {status: 307, headers: {location: 'https://attacker.example'}});
    const redirected = await onRequest({env,next,request:new Request('https://eidos-works.com/api/assistant')});
    assert.equal(redirected.status,503); assert.equal(redirected.headers.get('location'),null);
    globalThis.fetch = async () => { throw Error('Offline'); };
    assert.equal((await onRequest({env,next,request:new Request('https://eidos-works.com/api/assistant')})).status,503);
    assert.equal(nextCalls,1);
    assert.equal((await onRequest({env:{...env,EIDOS_PLATFORM_URL:'https://attacker.example'},next,request:new Request('https://eidos-works.com/api/assistant')})).status,503);
  } finally { globalThis.fetch=original; }
});
await test('Protected preview relay uses only the server-configured Vercel credential', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    assert.equal(new Headers(init?.headers).get('x-vercel-protection-bypass'), 'configured-preview-credential');
    return Response.json({ ok: true });
  };
  try {
    const response = await onRequest({ env: { ...env, EIDOS_PLATFORM_PREVIEW_BYPASS: 'configured-preview-credential' }, next: async () => { throw Error('Unexpected fallback'); }, request: new Request('https://release-validation.eidosworks.pages.dev/api/public-config', { headers: { 'x-vercel-protection-bypass': 'forged' } }) });
    assert.equal(response.status, 200);
  } finally { globalThis.fetch = original; }
});
