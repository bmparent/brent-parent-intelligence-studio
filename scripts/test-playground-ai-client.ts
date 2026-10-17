import test from 'node:test';
import assert from 'node:assert/strict';
import { AiRequestError, aiRequest, limitMicros, sameAiAction, usd, validateAiAction, validateAiBalance, validateAiResponse } from '../src/playground/aiClient';

const balance = () => ({ currency: 'USD', unitsPerUsd: 1000000, mode: 'test', period: '2026-10', resetsAt: '2026-11-01T00:00:00.000Z', requestedLimit: 1000000, effectiveLimit: 1000000, settled: 100000, pending: 600000, settledIncluded: 70000, settledPurchased: 30000, remainingCap: 300000, availableIncluded: 200000, availablePurchased: 300000, frozen: false, loweringPending: false });
const action = () => ({ id: 'action_fixture_1', state: 'quoted', documentId: 'document_fixture', revision: '2', scope: 'element', targetId: 'heading_fixture', estimate: 200000, maximum: 600000, currency: 'USD', unitsPerUsd: 1000000, model: 'gpt-6.1-sol', rateCardVersion: 'fixture-v1', expiresAt: '2026-10-14T22:05:00.000Z', resetsAt: '2026-11-01T00:00:00.000Z', chargedIncluded: 0, chargedPurchased: 0, customerStatus: 'none', result: null });

test('USD limit parsing uses integer cents without automatic funding or floating point accumulation', () => {
  assert.equal(limitMicros('0'), 0); assert.equal(limitMicros('0.29'), 290000); assert.equal(limitMicros('1.01'), 1010000); assert.equal(limitMicros(' 5.00 '), 5000000);
  assert.equal(usd(600000), '$0.60');
  for (const value of ['-1', '1e3', '01', 'NaN', '1.005', '1,000', '1000001', 'Infinity', '']) assert.throws(() => limitMicros(value));
});
test('balance receipts reject unknown units, inconsistent usage and invalid money', () => {
  assert.deepEqual(validateAiBalance(balance()), balance());
  for (const change of [{ unitsPerUsd: 100 }, { settled: 1 }, { pending: -1 }, { requestedLimit: Number.NaN }, { effectiveLimit: 1 }, { effectiveLimit: 1000001 }, { remainingCap: 999999 }, { loweringPending: true }, { resetsAt: 'unknown' }, { frozen: 'false' }]) assert.throws(() => validateAiBalance({ ...balance(), ...change }), /invalid spending receipt/);
  assert.throws(() => validateAiResponse({ enabled: true }), /invalid spending receipt/);
});
test('USD receipts retain microdollar charges and exact approved maxima without inventing free usage', () => {
  for (const [micros, expected] of [[0, '$0.00'], [1, '$0.000001'], [1742, '$0.001742'], [1753, '$0.001753'], [3495, '$0.003495'], [10001, '$0.010001'], [600000, '$0.60'], [1000000, '$1.00'], [4996505, '$4.996505'], [1000000000000, '$1000000.00']] as const) assert.equal(usd(micros), expected);
  for (const value of [-1, NaN, Infinity, 1.5, 1000000000001]) assert.throws(() => usd(value), /invalid spending receipt/);
});
test('action receipts bind explicit scope and cannot hide charges above the approved maximum', () => {
  assert.deepEqual(validateAiAction(action()), action());
  for (const change of [{ maximum: -1 }, { maximum: 0, estimate: 0 }, { estimate: 700000 }, { chargedIncluded: 400000, chargedPurchased: 300000 }, { scope: 'all' }, { targetId: '' }, { state: 'retry' }, { customerStatus: 'settled' }, { state: 'submitted', customerStatus: 'none' }, { result: { ops: [{ field: 'node.text', value: 'Hello' }] } }]) assert.throws(() => validateAiAction({ ...action(), ...change }));
  const settled = { ...action(), state: 'settled', customerStatus: 'settled', chargedIncluded: 100000, result: { ops: [{ field: 'node.text', value: 'A useful heading.' }] } };
  assert.deepEqual(validateAiAction(settled), settled);
  assert.throws(() => validateAiAction({ ...settled, result: { ops: [{ field: 'execute', value: 'alert(1)' }] } }));
});
test('status and cancellation receipts must retain every frozen quote identity field', () => {
  const before = validateAiAction(action()), after = validateAiAction({ ...action(), state: 'cancelled', customerStatus: 'waived' });
  assert.equal(sameAiAction(before, after), true);
  for (const [key, value] of Object.entries({ id: 'other_action', documentId: 'other_document', revision: '3', scope: 'page', targetId: 'page', maximum: 700000, estimate: 100000, model: 'other-model', rateCardVersion: 'new-rate', expiresAt: '2026-10-14T22:06:00.000Z', resetsAt: '2026-12-01T00:00:00.000Z' })) assert.equal(sameAiAction(before, { ...after, [key]: value }), false, key);
});
test('generation sends only the server-quoted maximum and one request with same-origin credentials', async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const request: typeof fetch = async (url, init) => { calls.push({ url: String(url), init }); return Response.json({ action: { ...action(), state: 'submitted', customerStatus: 'held' }, balance: balance() }); };
  await aiRequest({ action: 'generate', id: action().id, approvedMaximumMicros: action().maximum }, undefined, undefined, request);
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/playground/ai'); assert.equal(calls[0].init?.credentials, 'same-origin'); assert.equal(calls[0].init?.cache, 'no-store');
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { action: 'generate', id: 'action_fixture_1', approvedMaximumMicros: 600000 });
  assert.equal(new Headers(calls[0].init?.headers).has('authorization'), false);
});
test('network uncertainty never retries generation and existing-status reads use the saved action ID', async () => {
  let calls = 0;
  const failed: typeof fetch = async () => { calls++; throw new TypeError('Connection lost after submission'); };
  await assert.rejects(aiRequest({ action: 'generate', id: action().id, approvedMaximumMicros: 600000 }, undefined, undefined, failed), /Connection lost/); assert.equal(calls, 1);
  const status: typeof fetch = async (url, init) => { calls++; assert.equal(String(url), '/api/playground/ai?id=action_fixture_1'); assert.equal(init?.method, undefined); return Response.json({ action: action() }); };
  await aiRequest(undefined, 'action_fixture_1', undefined, status); assert.equal(calls, 2);
});
test('HTTP and malformed receipt failures remain explicit and do not manufacture a usable proposal', async () => {
  await assert.rejects(aiRequest(undefined, undefined, undefined, async () => Response.json({ error: 'Sign in first' }, { status: 401 })), error => error instanceof AiRequestError && error.status === 401);
  await assert.rejects(aiRequest(undefined, undefined, undefined, async () => new Response('<html>upstream failed</html>', { status: 502 })), /could not read/);
  await assert.rejects(aiRequest(undefined, undefined, undefined, async () => Response.json({ action: { ...action(), maximum: null } })), /invalid spending receipt/);
});
