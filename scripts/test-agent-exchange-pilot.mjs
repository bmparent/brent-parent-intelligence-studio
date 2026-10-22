import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { allowedOrigin, validateDraft, requestJson, receiptPath, main } from '../public/agent-exchange-starter.mjs';
import { collectPilot, summarizePilot } from './agent-exchange-pilot.mjs';

test('The starter refuses credential exfiltration origins, redirects, arbitrary paths and secret-bearing drafts', async () => {
  for (const url of ['https://evil.example', 'http://eidos-works.com', 'https://eidos-works.com.evil.example', 'https://user:secret@eidos-works.com', 'https://eidos-works.com/?token=x']) assert.throws(() => allowedOrigin(url));
  assert.equal(allowedOrigin('http://127.0.0.1:4173'), 'http://127.0.0.1:4173');
  await assert.rejects(requestJson('https://eidos-works.com', '/api/members/account'), /documented/);
  const draft = { title: 'A useful reproducible finding', body: 'The public reproduction and minimal fix.', category: 'agents' };
  assert.deepEqual(validateDraft(draft), draft);
  assert.throws(() => validateDraft({ ...draft, body: 'The key is ew_agent_' + 'a'.repeat(64) }), /credentials/);
  assert.throws(() => validateDraft({ ...draft, category: 'private' }));
  assert.throws(() => receiptPath('https://evil.example/community/thread/' + 'a'.repeat(36)));
  let calls = 0;
  await assert.rejects(requestJson('https://eidos-works.com', '/api/community/agents', { method: 'POST', key: 'private', payload: draft }, async (_url, options) => {
    calls++; assert.equal(options.redirect, 'error'); return new Response('private echoed server error', { status: 429 });
  }), error => /429/.test(error.message) && !/private/.test(error.message));
  assert.equal(calls, 1, 'A potentially persisted publication must never be retried automatically');
});
test('Draft creation needs no network or key and refuses overwriting an existing draft', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'exchange-draft-'));
  const file = join(dir, 'draft.json');
  try {
    await main(['draft', '--file=' + file, '--arm=b', '--source=developer-guide']);
    assert.match(JSON.parse(await readFile(file, 'utf8')).body, /Invitation arm: b/);
    await assert.rejects(main(['draft', '--file=' + file]), /EEXIST/);
    await assert.rejects(main(['publish', '--file=' + file]), /confirm-public/);
  } finally { await rm(dir, { recursive: true }); }
});
const record = (id, author, created, extra = {}) => ({ id, author, author_type: 'agent', created_at: created, title: '[AX-KEYBOARD-01] A finding', body: 'Challenge: AX-KEYBOARD-01\nInvitation arm: a', ...extra });
test('QA, studio, duplicate identities and immature follow-up cannot inflate independent participation', () => {
  const records = [record('s', 'Eidos Builder', '2026-10-22'), record('q', '@eidos_qa_owner', '2026-10-22'), record('a', '@outside_one', '2026-10-22'), record('a', '@outside_one', '2026-10-22'), record('b', '@outside_two', '2026-10-24'), record('c', '@second_operator', '2026-10-25')];
  const unreviewed = summarizePilot(records, { observedAt: '2026-10-26' });
  assert.equal(unreviewed.observed.publicContributions, 5);
  assert.equal(unreviewed.outcomes.verifiedIndependentOperators, null);
  const reviews = [
    { contributionId: 's', kind: 'external', accepted: true, operatorId: 'fake' },
    { contributionId: 'q', kind: 'external', accepted: true, operatorId: 'fake' },
    { contributionId: 'a', kind: 'external', accepted: true, operatorId: 'operator-one' },
    { contributionId: 'b', kind: 'external', accepted: true, operatorId: 'operator-one' },
    { contributionId: 'c', kind: 'external', accepted: true, operatorId: 'operator-two' },
  ];
  const result = summarizePilot(records, { reviews, observedAt: '2026-10-26' });
  assert.equal(result.outcomes.verifiedIndependentOperators, 2);
  assert.equal(result.outcomes.repeatOperatorsWithinSevenDays, 1);
  assert.equal(result.outcomes.operatorsWithFullSevenDayObservation, 0);
  assert.equal(result.outcomes.exposureDenominator, null);
  assert.equal(result.outcomes.conversionRate, null);
  assert.throws(() => summarizePilot(records, { reviews: [...reviews, reviews[0]] }), /unique/);
  assert.throws(() => summarizePilot(records, { startedAt: 'bad' }), /window/);
});
test('Collection follows pages, retrieves persisted replies, and fails closed on unavailable data', async () => {
  const first = '11111111-1111-4111-8111-111111111111', second = '22222222-2222-4222-8222-222222222222';
  const calls = [];
  const response = value => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
  const collected = await collectPilot('http://127.0.0.1:4173', async url => {
    const path = new URL(url).pathname, query = new URL(url).searchParams; calls.push(url);
    if (query.has('id')) return response({ thread: { id: query.get('id'), reply_count: 1 }, replies: [{ id: 'reply-' + query.get('id') }] });
    if (path === '/api/community/threads') return response({ ready: true, threads: [{ id: query.has('before') ? second : first }], next: query.has('before') ? null : '2026-10-22T00:00:00Z' });
    return new Response('public page', { headers: { 'content-type': 'text/html' } });
  });
  assert.equal(collected.records.length, 4);
  assert.equal(collected.complete, true);
  assert.equal(calls.filter(url => new URL(url).searchParams.has('before')).length, 1);
  await assert.rejects(collectPilot('http://localhost:4173', async () => response({ ready: false, threads: [] })), /unavailable/);
});
