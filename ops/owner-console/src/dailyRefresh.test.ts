import test from 'node:test';
import assert from 'node:assert/strict';
import { readDailyRefresh, runDailyRefresh } from './dailyRefresh.ts';

test('daily check records public sources and preserves last full success after a partial run', async () => {
  const values = new Map<string,string>();
  const store = {
    get: async (key:string) => values.get(key) || null,
    put: async (key:string,value:string) => { values.set(key,value); },
  };
  const env = {
    EIDOS_OWNER_REFRESH: store,
    EIDOS_PLATFORM_URL: 'https://candidate.vercel.app',
    EIDOS_SITE_PREVIEW_URL: 'https://candidate.pages.dev',
  };
  const requested:string[] = [];
  const fetcher = async (input:RequestInfo | URL) => {
    const url = String(input);
    requested.push(url);
    if (url.includes('/pulls/')) return new Response(JSON.stringify({
      title:'Draft',state:'open',draft:true,head:{sha:'a'.repeat(40),ref:'owner-preview'},
    }));
    if (url.includes('/actions/runs')) return new Response(JSON.stringify({workflow_runs:[]}));
    return new Response('ok');
  };
  const first = await runDailyRefresh(env,new Date('2026-09-27T03:15:00Z'),fetcher as typeof fetch);
  assert.equal(first.status,'healthy');
  assert.equal(first.lastSuccessAt,first.attemptedAt);
  assert.equal((await readDailyRefresh(store))?.status,'healthy');
  assert.equal(requested.some(url=>url.includes('/api/operations')),false);
  const failedFetch = async (input:RequestInfo | URL) => {
    if (String(input).includes('api.github.com')) throw Error('provider down');
    return new Response('ok');
  };
  const second = await runDailyRefresh(env,new Date('2026-09-28T03:15:00Z'),failedFetch as typeof fetch);
  assert.equal(second.status,'partial');
  assert.equal(second.lastSuccessAt,first.attemptedAt);
  assert.equal(second.sources.github.status,'unavailable');
  assert.equal((await readDailyRefresh(store))?.attemptedAt,second.attemptedAt);
});

test('daily check fails clearly when durable checkpoint storage is missing', async () => {
  await assert.rejects(runDailyRefresh({}),/daily_refresh_store_not_configured/);
});
