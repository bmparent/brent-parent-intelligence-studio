import assert from 'node:assert/strict';
import { normalizePublicHttpUrl, validateSnapshotIntake } from '../functions/_shared/snapshot/validation';
import { verifyStripeSignature } from '../functions/_shared/snapshot/stripe';

for (const value of [
  'http://127.0.0.1',
  'http://10.0.0.4',
  'http://192.168.1.2',
  'http://[::1]',
  'file:///etc/passwd',
  'ftp://example.com'
]) {
  assert.throws(() => normalizePublicHttpUrl(value));
}

assert.equal(normalizePublicHttpUrl('example.com'), 'https://example.com/');

const valid = validateSnapshotIntake({
  websiteUrl: 'https://example.com',
  businessName: 'Example Co',
  industry: 'Services',
  primaryGoal: 'more leads',
  stylePreference: 'clean premium',
  biggestIssue: 'The offer is unclear.',
  email: 'owner@example.com',
  consent: true
});
assert.ok(valid.value);
assert.equal(validateSnapshotIntake({}).value, undefined);

const body = JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed' });
const secret = 'whsec_test';
const timestamp = Math.floor(Date.now() / 1000);
const key = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign']
);
const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
const signature = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');

assert.equal(await verifyStripeSignature(body, `t=${timestamp},v1=${signature}`, secret), true);
assert.equal(await verifyStripeSignature(body, `t=${timestamp},v1=${'0'.repeat(64)}`, secret), false);

console.log('Snapshot validation and Stripe signature checks passed.');
