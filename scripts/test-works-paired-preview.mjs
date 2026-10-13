import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fingerprint, previewBranch, previewProject, previewOrigin, relayBinding, requireIsolatedProject, verifyAccountOriginRedirect, withoutRelayUrl } from './works-paired-preview.mjs';

const project = () => ({
  name: previewProject, production_branch: previewBranch,
  domains: [`${previewProject}.pages.dev`],
  deployment_configs: { production: { env_vars: {
    EIDOS_PLATFORM_URL: { type: 'plain_text', value: 'https://old-preview.vercel.app' },
    EIDOS_PLATFORM_TOKEN: { type: 'secret_text', value: 'test-fixture-only' },
    EIDOS_PLATFORM_PREVIEW_BYPASS: { type: 'secret_text', value: 'test-fixture-only' },
  }, services: { EIDOS_INQUIRY_MAILER: { service: 'test-mailer' } } }, preview: {} },
});

test('preview deployment refuses production, custom domains and a changed branch', () => {
  assert.doesNotThrow(() => requireIsolatedProject(project()));
  for (const changed of [
    { ...project(), name: 'eidosworks' },
    { ...project(), domains: [`${previewProject}.pages.dev`, 'eidos-works.com'] },
    { ...project(), production_branch: 'main' },
  ]) assert.throws(() => requireIsolatedProject(changed));
});

test('preview deployment refuses missing protected relay bindings', () => {
  for (const key of ['EIDOS_PLATFORM_TOKEN', 'EIDOS_PLATFORM_PREVIEW_BYPASS']) {
    const changed = project();
    delete changed.deployment_configs.production.env_vars[key];
    assert.throws(() => requireIsolatedProject(changed));
  }
});

test('relay reconciliation preserves encrypted binding type without disclosing masked values', () => {
  assert.deepEqual(relayBinding({ type: 'secret_text', value: 'masked-provider-value' }), { type: 'secret_text', previousOrigin: null, masked: true });
  assert.deepEqual(relayBinding({ type: 'plain_text', value: 'https://old-preview.vercel.app/' }), { type: 'plain_text', previousOrigin: 'https://old-preview.vercel.app', masked: false });
  for (const value of ['https://unrelated.example', 'https://user:secret@preview.vercel.app', 'https://preview.vercel.app/?token=secret', 'http://preview.vercel.app']) {
    assert.throws(() => relayBinding({ type: 'plain_text', value }));
    assert.equal(relayBinding({ type: 'secret_text', value }).previousOrigin, null);
  }
  assert.throws(() => relayBinding(undefined));
});

test('URL-only reconciliation detects credential, environment and service-binding drift', () => {
  const before = project().deployment_configs;
  const changedUrl = structuredClone(before);
  changedUrl.production.env_vars.EIDOS_PLATFORM_URL.value = 'https://new-preview.vercel.app';
  assert.equal(fingerprint(withoutRelayUrl(before)), fingerprint(withoutRelayUrl(changedUrl)));
  for (const mutate of [
    value => { value.production.env_vars.EIDOS_PLATFORM_TOKEN.value = 'changed-credential'; },
    value => { value.production.services.EIDOS_INQUIRY_MAILER.service = 'different-mailer'; },
    value => { value.preview.env_vars = { NEW_SETTING: { value: 'new' } }; },
  ]) {
    const changed = structuredClone(before);
    mutate(changed);
    assert.notEqual(fingerprint(withoutRelayUrl(before)), fingerprint(withoutRelayUrl(changed)));
  }
  assert.equal(before.production.env_vars.EIDOS_PLATFORM_URL.value, 'https://old-preview.vercel.app');
});

test('account redirect acceptance tolerates new-alias propagation and records every observed response', async () => {
  const statuses = [404, 503, 307];
  let clock = 0;
  const checked = await verifyAccountOriginRedirect('https://b2e285ac.eidosworks-test-20260923.pages.dev', '/account/', {
    now: () => clock, pause: async ms => { clock += ms; },
    fetcher: async (url, options) => {
      assert.equal(url, 'https://b2e285ac.eidosworks-test-20260923.pages.dev/account/');
      assert.equal(options.redirect, 'manual');
      return new Response(null, { status: statuses.shift(), headers: { location: previewOrigin + '/account/', 'cache-control': 'no-store' } });
    },
  });
  assert.deepEqual(checked.observedStatuses, [404, 503, 307]);
  assert.equal(checked.attempts, 3);
});

test('account redirect acceptance stops on access denials, wrong destinations, cookies and rendered alias pages', async () => {
  for (const [status, headers] of [
    [401, {}], [403, {}], [429, {}], [200, {}],
    [307, { location: 'https://attacker.example/account/', 'cache-control': 'no-store' }],
    [307, { location: previewOrigin + '/account/', 'cache-control': 'no-store', 'set-cookie': 'unexpected=identity' }],
  ]) {
    let calls = 0;
    await assert.rejects(verifyAccountOriginRedirect('https://b2e285ac.eidosworks-test-20260923.pages.dev', '/account/', {
      fetcher: async () => { calls++; return new Response(null, { status, headers }); },
      pause: async () => { throw Error('Must not retry an access or authority failure'); },
    }));
    assert.equal(calls, 1);
  }
});

test('account redirect acceptance bounds propagation and rejects unknown hosts and paths before fetching', async () => {
  let clock = 0;
  let calls = 0;
  await assert.rejects(verifyAccountOriginRedirect('https://b2e285ac.eidosworks-test-20260923.pages.dev', '/account/', {
    now: () => clock, pause: async ms => { clock += ms; },
    fetcher: async () => { calls++; return new Response(null, { status: 404 }); },
  }));
  assert.equal(clock, 90000);assert.equal(calls, 31);
  for (const [host, path] of [['https://eidos-works.com','/account/'],['https://b2e285ac.eidosworks-test-20260923.pages.dev','/api/members/account']]) {
    await assert.rejects(verifyAccountOriginRedirect(host, path, { fetcher: async () => { throw Error('No fetch allowed'); } }));
  }
});
