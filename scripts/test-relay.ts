import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware';
const env = { EIDOS_PLATFORM_URL:'https://eidos-sentinel-lab.vercel.app', EIDOS_PLATFORM_TOKEN:'relay-test-at-least-32-characters-long' };
await test('OAuth relay keeps separate secure cookies and allows only the exact same-origin account redirect', async () => {
  const original = globalThis.fetch;
  const token = 'b'.repeat(64), session = `__Host-eidos_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`;
  const clear = '__Host-eidos_oauth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure';
  let location = 'https://eidos-works.com/account?oauth=success';
  globalThis.fetch = async (_url, init) => {
    assert.equal(new Headers(init?.headers).get('cookie'), `__Host-eidos_session=${token}; __Host-eidos_oauth=${token}`);
    const headers = new Headers({ location });
    for (const cookie of [session, clear, 'analytics=private; Path=/; Secure']) headers.append('set-cookie', cookie);
    return new Response(null, {status:303,headers});
  };
  const next = async () => { throw Error('OAuth must use the relay'); };
  const request = (path = '/api/members/google') => new Request('https://eidos-works.com'+path, {headers:{cookie:`__Host-eidos_session=${token}; analytics=private; __Host-eidos_oauth=${token}; __Host-eidos_onboard=malformed`}});
  try {
    const response = await onRequest({env,next,request:request()});
    assert.equal(response.status,303);
    assert.deepEqual(response.headers.getSetCookie(),[session,clear]);
    for (const status of ['choose-username', 'link-required', 'signup-required', 'collision', 'error']) {
      location='https://eidos-works.com/account?oauth='+status;
      const accepted=await onRequest({env,next,request:request()});
      assert.equal(accepted.status,303);assert.equal(accepted.headers.get('location'),location);
    }
    for (const invalid of ['https://eidos-works.com.attacker.example/account?oauth=success','https://eidos-works.com/account?oauth=success&next=https://attacker.example','/account?oauth=success']) {
      location=invalid;
      const rejected=await onRequest({env,next,request:request()});
      assert.equal(rejected.status,503);assert.equal(rejected.headers.get('location'),null);assert.equal(rejected.headers.get('set-cookie'),null);
    }
    location='https://eidos-works.com/account?oauth=success';
    assert.equal((await onRequest({env,next,request:request('/api/members/credentials')})).status,503);
  } finally { globalThis.fetch=original; }
});
await test('Member relay forwards only the scoped session and accepts only the secure member cookie', async () => {
  const original = globalThis.fetch;
  const token = 'a'.repeat(64), cookie = `__Host-eidos_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`;
  let returnedCookie = cookie;
  globalThis.fetch = async (_url, init) => {
    assert.equal(new Headers(init?.headers).get('cookie'), `__Host-eidos_session=${token}`);
    return Response.json({ok:true}, {headers:{'set-cookie':returnedCookie}});
  };
  const next = async () => {throw Error('Member route must be relayed');};
  const request = (path:string) => new Request('https://eidos-works.com'+path,{headers:{cookie:`analytics=private; __Host-eidos_session=${token}; unrelated=secret`}});
  try {
    const response = await onRequest({env,next,request:request('/api/members/account')});
    assert.equal(response.headers.get('set-cookie'),cookie);assert.equal(response.headers.get('cache-control'),'no-store');
    returnedCookie='unrelated=injected; Path=/; Secure';
    assert.equal((await onRequest({env,next,request:request('/api/members/auth')})).headers.get('set-cookie'),null);
    returnedCookie=cookie;
    assert.equal((await onRequest({env,next,request:request('/api/members/directory?q=al')})).headers.get('set-cookie'),null);
  } finally {globalThis.fetch=original;}
});
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
