import test from 'node:test';
import assert from 'node:assert/strict';
import { readDeployments } from './deployments.ts';

test('deployment checks use only configured preview hosts and hide bypass secret', async () => {
  const urls:string[]=[];
  const observed=await readDeployments({EIDOS_PLATFORM_URL:'https://backend.vercel.app',EIDOS_SITE_PREVIEW_URL:'https://candidate.pages.dev',EIDOS_PLATFORM_PREVIEW_BYPASS:'secret'},async input=>{
    urls.push(String(input)); return new Response('{}',{status:200});
  },new Date('2026-09-24T12:00:00Z'));
  assert.equal(observed.status,'healthy');
  assert.deepEqual(urls,['https://backend.vercel.app/api/works/v1/health','https://candidate.pages.dev/']);
  assert.equal(JSON.stringify(observed).includes('secret'),false);
  assert.equal(observed.data.providerLogs,'not_configured');
});

test('deployment checks reject arbitrary hosts before issuing requests', async () => {
  let calls=0;
  const observed=await readDeployments({EIDOS_PLATFORM_URL:'https://example.com',EIDOS_SITE_PREVIEW_URL:'https://invalid.example'},async()=>{calls++;return new Response('{}')});
  assert.equal(calls,0);
  assert.equal(observed.status,'not_configured');
});
