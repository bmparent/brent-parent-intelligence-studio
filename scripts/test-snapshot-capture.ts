import test from 'node:test'
import assert from 'node:assert/strict'
import { capturePublicPage } from '../functions/_shared/snapshot/capture'
import { snapshotReady } from '../functions/_shared/snapshot/generation'
import type { SnapshotEnv } from '../functions/_shared/snapshot/types'

const env: SnapshotEnv = {
  SNAPSHOT_CAPTURE_PROXY_URL: 'https://capture.example.test/api/works/snapshot-capture',
  SNAPSHOT_CAPTURE_PROXY_TOKEN: 'fixture-proxy-token',
}

test('capture sends the URL only to the configured protected proxy', async () => {
  const original = globalThis.fetch
  const calls: string[] = []
  globalThis.fetch = async (input, init) => {
    calls.push(String(input))
    assert.equal(init?.method, 'POST')
    assert.equal(init?.redirect, 'manual')
    assert.equal((init?.headers as Record<string, string>).authorization, 'Bearer fixture-proxy-token')
    assert.deepEqual(JSON.parse(String(init?.body)), { websiteUrl: 'https://example.com/' })
    return Response.json({
      finalUrl: 'https://example.com/',
      html: '<title>Public example</title><h1>Example</h1><p>Readable content.</p>',
    })
  }
  try {
    const outcome = await capturePublicPage('https://example.com', env)
    assert.deepEqual(calls, [env.SNAPSHOT_CAPTURE_PROXY_URL])
    assert.equal(outcome.page?.title, 'Public example')
    assert.equal(outcome.page?.finalUrl, 'https://example.com/')
  } finally {
    globalThis.fetch = original
  }
})

test('capture has no direct-fetch fallback when the proxy fails', async () => {
  const original = globalThis.fetch
  const calls: string[] = []
  globalThis.fetch = async (input) => {
    calls.push(String(input))
    return new Response(null, { status: 422 })
  }
  try {
    const outcome = await capturePublicPage('https://example.com', env)
    assert.equal(outcome.page, undefined)
    assert.deepEqual(calls, [env.SNAPSHOT_CAPTURE_PROXY_URL])
  } finally {
    globalThis.fetch = original
  }
})

test('generation stays disabled without a configured capture proxy', () => {
  const ready = {
    SNAPSHOT_DB: {} as SnapshotEnv['SNAPSHOT_DB'],
    SNAPSHOT_OBJECTS: {} as SnapshotEnv['SNAPSHOT_OBJECTS'],
    SNAPSHOT_GENERATION_ENABLED: 'true',
    SNAPSHOT_CAPTURE_APPROVED: 'true',
    SNAPSHOT_DAILY_ALLOWANCE_CENTS: '100',
    SNAPSHOT_MAX_JOB_COST_CENTS: '100',
    OPENAI_TEXT_MODEL: 'fixture-text',
    OPENAI_IMAGE_MODEL: 'fixture-image',
    OPENAI_API_KEY: 'fixture-key',
  } satisfies SnapshotEnv
  assert.equal(snapshotReady(ready), false)
  assert.equal(snapshotReady({ ...ready, ...env }), true)
})
