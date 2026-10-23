import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/project-inquiries';
import type { Database } from '../functions/_shared/platform/core';
import { withInquiryTurnstile } from './mock-inquiry-turnstile';
// @ts-expect-error Plain Worker module is intentionally shared with Cloudflare unchanged.
import mailer from '../ops/inquiry-mailer/worker.mjs';

const input = { projectType: 'build', problem: 'Clearly labeled release validation inquiry.', name: 'Release test', email: 'test@example.com' };
const request = (origin = 'https://eidos-works.com', body = input) => new Request('https://eidos-works.com/api/project-inquiries', { method: 'POST', headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1' }, body: JSON.stringify({ challenge: 'verified-local-token', ...body }) });
const protectedEnv = {
  EIDOS_PLATFORM_TOKEN: 'test-only-inquiry-hmac-key-long-enough',
  TURNSTILE_SECRET_KEY: 'test-only',
  EIDOS_GROWTH_DB: { prepare: () => ({ bind() { return this; }, first: async () => ({ used: 1 }) }) } as unknown as Database,
};

test('inquiry requires same origin and confirmed private-provider delivery', () => withInquiryTurnstile(async () => {
  let sends = 0;
  const env = { ...protectedEnv, EIDOS_INQUIRY_MAILER: { fetch: (async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(url), 'https://inquiry.internal/inquiry');
    assert.equal(new Headers(init?.headers).get('x-eidos-inquiry-client'), '192.0.2.1');
    sends++;
    return Response.json({ ok: true, receipt: 'test-receipt' });
  }) as typeof fetch } };
  assert.equal((await onRequestPost({ request: request('https://other.example'), env })).status, 403);
  assert.equal(sends, 0);
  const accepted = await (await onRequestPost({ request: request(), env })).json();
  assert.equal(accepted.submitted, true);
  assert.equal(accepted.receipt, 'test-receipt');
  assert.equal(sends, 1);
  env.EIDOS_INQUIRY_MAILER.fetch = async () => Response.json({ ok: false });
  assert.equal((await onRequestPost({ request: request(), env })).status, 502);
  const fallback = await (await onRequestPost({ request: request(), env: {} })).json();
  assert.equal(fallback.submitted, false);
}));

test('friction review keeps its label, useful context, and safe attribution', () => withInquiryTurnstile(async () => {
  let forwardedBrief = '';
  const friction = {
    inquiryKind: 'friction-review',
    projectType: 'Friction Review',
    problem: 'Customers stop after the estimate page because the next step is unclear.',
    desiredOutcome: 'Make the handoff into scheduling obvious without replacing the current CRM.',
    currentUrl: 'https://example.com/estimate',
    supportingUrl: 'https://example.com/safe-share',
    foundVia: 'LinkedIn',
    utmSource: 'linkedin',
    utmMedium: 'organic',
    utmCampaign: 'phase2-playground',
    utmContent: 'founder-post',
    referrer: 'https://www.linkedin.com/feed/',
    landingPage: '/friction-review',
    name: 'Release test',
    email: 'test@example.com',
    company: 'Example Co',
  };
  const env = { ...protectedEnv, EIDOS_INQUIRY_MAILER: { fetch: (async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as { brief: string; email: string };
    forwardedBrief = body.brief;
    assert.equal(body.email, friction.email);
    return Response.json({ ok: true, receipt: 'friction-receipt' });
  }) as typeof fetch } };

  const response = await onRequestPost({ request: request('https://eidos-works.com', friction), env });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.submitted, true);
  assert.equal(body.receipt, 'friction-receipt');
  assert.match(body.message, /Friction Review request reached Eidos Works/);
  assert.match(forwardedBrief, /^Eidos Works Friction Review request/);
  assert.match(forwardedBrief, /Where is the friction\?/);
  assert.match(forwardedBrief, /What would you rather happen\?/);
  assert.match(forwardedBrief, /utm_source: linkedin/);
  assert.match(forwardedBrief, /Referrer: https:\/\/www\.linkedin\.com\/feed\//);
  assert.match(decodeURIComponent(body.mailto), /subject=Eidos Works Friction Review/);
}));

test('lab access requests receive a clearly labeled review brief', async () => {
  const response = await onRequestPost({
    request: request('https://eidos-works.com', {
      ...input,
      projectType: 'Eidos / Sentinel access — Guided full-engine trial',
    }),
    env: {},
  });
  const body = await response.json();
  assert.match(body.brief, /^Eidos Brain \/ Sentinel test-access request/);
  assert.match(
    decodeURIComponent(body.mailto),
    /subject=Eidos Brain \/ Sentinel Test Access/,
  );
});

test('private mailer fixes destination, labels bounded inquiry types, enforces rate limit, and requires provider receipt', async () => {
  let sent = 0;
  let permitted = true;
  let lastSubject = '';
  const env = { STUDIO_TO: 'studio@example.com', STUDIO_FROM: 'projects@eidos-works.com', INQUIRY_LIMIT: { limit: async () => ({ success: permitted }) }, EMAIL: { send: async (message: Record<string, string>) => {
    assert.equal(message.to, 'studio@example.com');
    assert.equal(message.from, 'projects@eidos-works.com');
    assert.equal(message.replyTo, input.email);
    lastSubject = message.subject;
    sent++;
    return { messageId: 'provider-test' };
  } } };
  const message = (body: unknown = { brief: input.problem, email: input.email, to: 'untrusted@example.com' }) => new Request('https://inquiry.internal/inquiry', { method: 'POST', headers: { 'x-eidos-inquiry-client': '192.0.2.1' }, body: JSON.stringify(body) });
  const delivered = await (await mailer.fetch(message(), env)).json();
  assert.equal(delivered.ok, true);
  assert.equal(delivered.providerMessageId, 'provider-test');
  assert.equal(lastSubject, 'Eidos Works project inquiry');

  const frictionDelivered = await (await mailer.fetch(message({ brief: 'Eidos Works Friction Review request\n\nA sufficiently detailed friction review.', email: input.email }), env)).json();
  assert.equal(frictionDelivered.ok, true);
  assert.equal(lastSubject, 'Eidos Works Friction Review request');

  permitted = false;
  assert.equal((await mailer.fetch(message(), env)).status, 429);
  assert.equal(sent, 2);
  assert.equal((await mailer.fetch(message({ brief: 'x'.repeat(13_000), email: input.email }), env)).status, 413);
  assert.equal((await mailer.fetch(message({ brief: input.problem, email: 'x@example.com\r\nBcc: victim@example.com' }), env)).status, 400);
  permitted = true;
  env.EMAIL.send = async () => { throw Error('provider unavailable'); };
  assert.equal((await mailer.fetch(message(), env)).status, 502);
});
