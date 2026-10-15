import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Miniflare, createFetchMock } from 'miniflare';

await test('Cloudflare runtime accepts the relay request options', async () => {
  const { outputFiles } = await build({
    stdin: { contents: "import { onRequest } from './functions/_middleware.ts'; export default { fetch(request, env) { return onRequest({request, env, next: () => new Response('unexpected fallback', {status:500})}); } };", resolveDir: process.cwd() },
    bundle: true, write: false, format: 'esm', platform: 'browser',
  });
  const fetchMock = createFetchMock();
  fetchMock.disableNetConnect();
  const upstream = fetchMock.get('https://eidos-sentinel-lab.vercel.app');
  upstream.intercept({ path: '/api/works/v1/api/public-config' }).reply(200, { communityReady: true });
  const runtime = new Miniflare({ modules: true, compatibilityDate: '2026-06-08', script: outputFiles[0].text, fetchMock,
    bindings: { EIDOS_PLATFORM_URL: 'https://eidos-sentinel-lab.vercel.app', EIDOS_PLATFORM_TOKEN: 'runtime-test-credential-at-least-32-characters' },
  });
  try {
    const good = await runtime.dispatchFetch('https://eidos-works.com/api/public-config');
    assert.equal(good.status, 200);
    assert.deepEqual(await good.json(), { communityReady: true });
    fetchMock.assertNoPendingInterceptors();
  } finally { await runtime.dispose(); }
});

await test('Cloudflare runtime preserves both OAuth cookies without following the callback redirect', async () => {
  const {outputFiles}=await build({stdin:{contents:"import { onRequest } from './functions/_middleware.ts'; export default { fetch(request, env) { return onRequest({request, env, next: () => new Response('unexpected fallback', {status:500})}); } };",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'browser'});
  const session=`__Host-eidos_session=${'c'.repeat(64)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`;
  const clear='__Host-eidos_oauth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure';
  // Use a service response: the fetchMock bridge follows redirects inside Node
  // before workerd sees them. This exercises workerd's actual manual response path.
  const runtime=new Miniflare({modules:true,compatibilityDate:'2026-06-08',script:outputFiles[0].text,bindings:{EIDOS_PLATFORM_URL:'https://eidos-sentinel-lab.vercel.app',EIDOS_PLATFORM_TOKEN:'runtime-test-credential-at-least-32-characters'},outboundService:request=>{
    assert.equal(request.url,'https://eidos-sentinel-lab.vercel.app/api/works/v1/api/members/google?code=controlled-test');
    const headers=new Headers({location:'https://eidos-works.com/account?oauth=success'});
    headers.append('set-cookie',session);headers.append('set-cookie',clear);
    return new Response(null,{status:303,headers});
  }});
  try {
    const response=await runtime.dispatchFetch('https://eidos-works.com/api/members/google?code=controlled-test',{redirect:'manual'});
    assert.equal(response.status,303,await response.text());
    assert.equal(response.headers.get('location'),'https://eidos-works.com/account?oauth=success');
    assert.deepEqual(response.headers.getSetCookie(),[session,clear]);
  } finally {await runtime.dispose();}
});
