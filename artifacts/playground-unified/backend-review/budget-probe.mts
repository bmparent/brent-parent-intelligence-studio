import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import aiSchema from 'file:///C:/Users/bmpar/codex-worktrees/playground-unified-backend-20261014/apps/sentinel-lab/lib/works/vendor/functions/_shared/platform/playgroundAiSchema';
import { createClient } from 'file:///C:/Users/bmpar/codex-worktrees/playground-unified-backend-20261014/apps/sentinel-lab/node_modules/@libsql/client/lib-esm/node.js';
import { adaptDatabase } from 'file:///C:/Users/bmpar/codex-worktrees/playground-unified-backend-20261014/apps/sentinel-lab/lib/works/database';
import { hash, type PlatformEnv } from 'file:///C:/Users/bmpar/codex-worktrees/playground-unified-backend-20261014/apps/sentinel-lab/lib/works/vendor/functions/_shared/platform/core';
import { onRequestGet, onRequestPost } from 'file:///C:/Users/bmpar/codex-worktrees/playground-unified-backend-20261014/apps/sentinel-lab/lib/works/vendor/functions/api/playground/ai';
import { USD, aiBalance, cancelAiAction, claimAiDispatch, configureAiPolicy, ensureAiLedger, grantPaidAiBalance, markAiUnknown,
  meterAiUsage, monthlyPeriod, ownedAiAction, providerMaximum, quoteAiAction, reconcileAiDeadlines, reconcileAiReversals,
  reserveAiAction, retailCharge, setAiLimit, settleAiAction, validateRateCard, recordVerifiedAiPayment, type AiBrief, type AiRateCard } from 'file:///C:/Users/bmpar/codex-worktrees/playground-unified-backend-20261014/apps/sentinel-lab/lib/works/vendor/functions/_shared/platform/playgroundAi';

// CONTROLLED FIXTURES ONLY: these prices are deliberately synthetic, not accepted provider/customer prices.
const at = new Date('2026-10-14T12:00:00.000Z');
const card: AiRateCard = { version: 'fixture-v1', model: 'gpt-6.1-sol', evidence: 'controlled-fixture',
  inputMicrosPerMillion: 50 * USD, outputMicrosPerMillion: 100 * USD, retailNumerator: 1, retailDenominator: 1,
  maxInputTokens: 8000, maxOutputTokens: 2000, maxCalls: 1, maxRetries: 0, maxAgentTurns: 1, maxSubagents: 0,
  paidTools: 0, maxToolReturnBytes: 0, processing: 'standard', reasoning: 'medium', maxRuntimeMs: 30000, validUntil: '2027-01-01T00:00:00.000Z' };
const brief: AiBrief = { documentId: 'document-one', revision: 'revision-1', scope: 'element', targetId: 'headline-1', instruction: 'Clarify this offer', context: 'A local service business. Current headline: Reliable cleaning.' };
const usage = { inputTokens: 1000, outputTokens: 1000, calls: 1, paidTools: 0 };
const fullUsage = { inputTokens: card.maxInputTokens, outputTokens: card.maxOutputTokens, calls: 1, paidTools: 0 };
async function fixture(limit = USD, balance = USD, budget = 10 * USD, databaseUrl = ':memory:') {
  const client = createClient({ url: databaseUrl }), database = adaptDatabase(client);
  for (const name of ['0001_eidos_platform.sql', '0002_members.sql', '0004_paid_templates.sql'])
    await client.executeMultiple(readFileSync(new URL('file:///C:/Users/bmpar/codex-worktrees/playground-unified-backend-20261014/apps/sentinel-lab/lib/works/vendor/migrations/' + name, import.meta.url), 'utf8'));
  const env: PlatformEnv = { EIDOS_DB: database, EIDOS_LOCAL_TEST: 'true', EIDOS_PLAYGROUND_AI_MODE: 'test', EIDOS_TEMPLATE_STRIPE_ACCOUNT_ID: 'acct_fixturemerchant' };
  await ensureAiLedger(env); await ensureAiLedger(env);
  for (const owner of ['alice', 'bob']) {
    await database.prepare('INSERT INTO eidos_email_members(id,email,username,kind,created_at,newsletter_after) VALUES(?,?,?,?,?,?)').bind(owner, owner + '@example.test', owner, 'person', at.toISOString(), at.toISOString()).run();
    await setAiLimit(env, owner, 'test', limit, at);
  }
  await configureAiPolicy(env, 'test', card, budget, true);
  let serial = 0;
  async function paid(owner: string, amount: number, kind: 'included' | 'purchased' = 'purchased', status = 'paid', mode = 'test') {
    const id = 'order-' + ++serial;
    await database.prepare('INSERT INTO eidos_orders(id,receipt_hash,session_id,status,created_at,payment_intent) VALUES(?,?,?,?,?,?)').bind(id, id, 'cs_' + mode + '_' + id, status, at.toISOString(), 'pi_' + mode + '_' + id).run();
    await database.prepare('INSERT INTO eidos_template_orders(order_id,product_id,edition_id,version,price_cents,archive_key,archive_sha256,download_name,guide_path,member_id,receipt_expires,checkout_expires,fulfillment_status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, 'switchboard-developer-v1', 'developer', '1.0.0', 500, 'immutable/archive.zip', 'a'.repeat(64), 'archive.zip', '/setup', owner, 2000000000, 2000000000, status === 'paid' ? 'ready' : 'awaiting_payment', at.toISOString()).run();
    await database.prepare('INSERT INTO eidos_stripe_events(id,received_at) VALUES(?,?)').bind('fixture-event-' + id, at.toISOString()).run();
    await database.prepare('INSERT INTO eidos_pg_ai_checkout_merchants(order_id,mode,merchant_id,created_at) VALUES(?,?,?,?)').bind(id, mode, 'acct_fixturemerchant', at.toISOString()).run();
    if (mode === 'test') await recordVerifiedAiPayment(env, id, 'fixture-event-' + id, 'test', 'acct_fixturemerchant');
    const rule = { productId: 'switchboard-developer-v1', editionId: 'developer', version: '1.0.0', priceCents: 500, grantVersion: 'fixture-allowance-v1', kind, amount };
    return { id, rule };
  }
  async function credit(owner: string, amount: number, kind: 'included' | 'purchased' = 'purchased') {
    const row = await paid(owner, amount, kind); await grantPaidAiBalance(env, owner, 'test', row.id, row.rule); return row;
  }
  if (balance) await credit('alice', balance);
  let requests = 0, calls = 0;
  async function quote(owner = 'alice', change: Partial<AiBrief> = {}, date = at, key = 'request-' + ++requests) {
    return quoteAiAction(env, owner, 'test', key, { ...brief, ...change }, date);
  }
  async function execute(id: string, owner = 'alice', metered = usage, usable = true) {
    await reserveAiAction(env, owner, 'test', id, at);
    const token = await claimAiDispatch(env, owner, 'test', id, at);
    if (token) { calls++; return settleAiAction(env, owner, 'test', id, { dispatchToken: token, providerId: 'response-' + id, providerRequestId: 'req-' + id, usage: metered, usable, result: { operations: [] } }, at); }
    return ownedAiAction(env, owner, 'test', id);
  }
  return { client, database, env, quote, execute, paid, credit, calls: () => calls, close: () => client.close() };
}

const f = await fixture(USD, USD, USD);
try {
 const a = await f.quote();
 await reserveAiAction(f.env, 'alice', 'test', a.id, at);
 await configureAiPolicy(f.env, 'test', card, 0, true);
 const token = await claimAiDispatch(f.env, 'alice', 'test', a.id, at);
 const row = await f.database.prepare('SELECT provider_budget FROM eidos_pg_ai_policies WHERE mode=?').bind('test').first();
 const action = await ownedAiAction(f.env, 'alice', 'test', a.id);
 console.log(JSON.stringify({ fixture:'controlled no provider', configuredBudget: row.provider_budget, dispatchGranted: Boolean(token), providerHold: action.provider_maximum, state: action.state }));
} finally { f.close(); }
