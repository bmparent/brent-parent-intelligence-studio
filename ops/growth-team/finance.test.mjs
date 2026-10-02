import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { assessCommitment } from './finance.mjs';

const month = '2026-09';
const now = new Date('2026-09-26T14:00:00Z');
const request = { id: 'ad-test-1', maximumCashCents: 500 };
const managerDecision = { requestId: request.id, decision: 'proceed' };
const financeDecision = { id: 'finance-1', requestId: request.id, role: 'finance', decision: 'approve', month, maximumCashCents: 500 };
const policy = { currency: 'USD', ownerApprovedMonthlyCashCapCents: 1000, ownerApprovedPerCommitmentCashCapCents: 500, ownerApprovalReference: 'test-only-owner-authorization' };
const ledger = { month, spentAndReservedCashCents: 400, requestIds: [] };
const check = (overrides = {}) => assessCommitment({ request, managerDecision, financeDecision, policy, ledger, now, ...overrides });

test('zero-cash work can proceed after manager selection with the unfunded policy', () => {
  const result = check({ request: { id: request.id, maximumCashCents: 0 }, policy: { ...policy, ownerApprovedMonthlyCashCapCents: 0, ownerApprovedPerCommitmentCashCapCents: 0, ownerApprovalReference: null } });
  assert.deepEqual(result, { permitted: true, reason: 'zero_cash' });
});
test('the checked-in owner policy cannot fund a paid request', () => {
  const actualPolicy = JSON.parse(readFileSync(new URL('./budget-policy.json', import.meta.url), 'utf8'));
  assert.equal(actualPolicy.ownerApprovedMonthlyCashCapCents, 0);
  assert.equal(actualPolicy.ownerApprovedPerCommitmentCashCapCents, 0);
  assert.equal(check({ policy: actualPolicy }).permitted, false);
});
test('unknown costs and absent manager selection fail closed', () => {
  assert.equal(check({ request: { id: request.id } }).permitted, false);
  assert.equal(check({ managerDecision: undefined }).permitted, false);
});
test('the unfunded default and an unknown ledger deny paid work', () => {
  assert.equal(check({ policy: { ...policy, ownerApprovedMonthlyCashCapCents: 0, ownerApprovalReference: null } }).reason, 'no_owner_approved_cash_ceiling');
  assert.equal(check({ ledger: undefined }).reason, 'unknown_cash_ledger');
});
test('only matching current finance approval counts', () => {
  assert.equal(check({ financeDecision: { ...financeDecision, role: 'creative_ads' } }).permitted, false);
  assert.equal(check({ financeDecision: { ...financeDecision, month: '2026-08' } }).permitted, false);
  assert.equal(check({ financeDecision: { ...financeDecision, requestId: 'another' } }).permitted, false);
});
test('duplicate commitments, exhausted monthly cap, and larger requests are denied', () => {
  assert.equal(check({ ledger: { ...ledger, requestIds: [request.id] } }).reason, 'duplicate_commitment');
  assert.equal(check({ ledger: { ...ledger, spentAndReservedCashCents: 501 } }).reason, 'cash_ceiling_exceeded');
  assert.equal(check({ request: { ...request, maximumCashCents: 501 } }).reason, 'cash_ceiling_exceeded');
});
test('a bounded commitment returns a reservation amount for the eventual atomic ledger', () => {
  assert.deepEqual(check(), { permitted: true, reason: 'within_approved_cash_ceiling', reserveCashCents: 500 });
});
