import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

await test('Cloudflare runtime accepts the relay request options', async () => {
  const { outputFiles } = await build({
    stdin: { contents: "import { onRequest } from './functions/_middleware.ts'; export default { fetch(request, env) { return onRequest({request, env, next: () => new Response('unexpected fallback', {status:500})}); } };", resolveDir: process.cwd() },
    bundle: true, write: false, format: 'esm', platform: 'browser',
  });
  const upstreamRequests = [];
  const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, compatibilityDate: '2026-06-08', script: outputFiles[0].text,
    // Miniflare's outbound service keeps every request in this fixture. The
    // removed createFetchMock API must not be replaced with real network I/O.
    outboundService(request) {
      upstreamRequests.push(request.url);
      assert.equal(request.url, 'https://eidos-sentinel-lab.vercel.app/api/works/v1/api/public-config');
      return Response.json({ communityReady: true });
    },
    bindings: { EIDOS_PLATFORM_URL: 'https://eidos-sentinel-lab.vercel.app', EIDOS_PLATFORM_TOKEN: 'runtime-test-credential-at-least-32-characters' },
  }));
  try {
    const good = await runtime.dispatchFetch('https://eidos-works.com/api/public-config');
    assert.equal(good.status, 200);
    assert.deepEqual(await good.json(), { communityReady: true });
    assert.equal(upstreamRequests.length, 1);
  } finally { await runtime.dispose(); }
});
