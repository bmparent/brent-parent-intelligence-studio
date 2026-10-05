// Bounded, read-only provider check. Never emit credentials, binding values or unrelated records.
import { writeFile } from 'node:fs/promises';

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const receipt = {
  checkedAt: new Date().toISOString(),
  sourceSha: process.env.GITHUB_SHA || null,
  operation: 'read-only',
  cloudflareCredentialsPresent: Boolean(token && accountId),
  quoteWorker: 'not checked',
  isolatedD1: 'not checked',
  existingPagesProject: 'not checked',
};

async function read(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/${path}`, {
    headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000),
  });
  let payload;
  try { payload = await response.json(); } catch { return { status: response.status, accepted: false }; }
  return { status: response.status, accepted: response.ok && payload.success === true, result: payload.result };
}

if (token && accountId) {
  const checks = await Promise.allSettled([
    read('workers/scripts'),
    read('d1/database?name=eidos-quote-desk-preview&per_page=10'),
    read('pages/projects/eidosworks'),
  ]);
  const outcome = (check, found) => check.status === 'fulfilled'
    ? check.value.accepted ? found(check.value.result) ? 'present' : 'absent' : `unavailable (HTTP ${check.value.status})`
    : 'request failed';
  receipt.quoteWorker = outcome(checks[0], rows => Array.isArray(rows) && rows.some(row => row.id === 'eidos-quote-desk-preview'));
  receipt.isolatedD1 = outcome(checks[1], rows => Array.isArray(rows) && rows.some(row => row.name === 'eidos-quote-desk-preview'));
  receipt.existingPagesProject = outcome(checks[2], project => project?.name === 'eidosworks');
  if (checks[2].status === 'fulfilled' && checks[2].value.accepted) {
    const bindings = checks[2].value.result?.deployment_configs?.production?.env_vars || {};
    receipt.pagesTransactionalBindingNames = ['RESEND_API_KEY', 'EIDOS_MAIL_FROM', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY']
      .filter(name => Boolean(bindings[name]));
  }
}
console.log(JSON.stringify(receipt, null, 2));
if (process.env.QUOTE_READINESS_RECEIPT) await writeFile(process.env.QUOTE_READINESS_RECEIPT, JSON.stringify(receipt, null, 2) + '\n');
