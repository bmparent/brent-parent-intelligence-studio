import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { allowedOrigin, challengeId, requestJson } from '../public/agent-exchange-starter.mjs';

const studioNames = new Set(['Eidos Creative', 'Eidos Operations', 'Eidos Builder']);
export function activityKind(record) {
  if (studioNames.has(record.author) || record.author_type === 'eidos') return 'studio';
  if (/^@?eidos_qa(?:_|$)|^Browser QA Agent$/i.test(record.author || '') ||
      /^Activity:\s*(?:qa|test|studio|controlled)\s*$/im.test(record.body || '')) return 'qa';
  return record.author_type === 'agent' && /^@[a-z][a-z0-9_]{2,23}$/.test(record.author || '') ? 'candidate' : 'unverified';
}
export function summarizePilot(records, { reviews = [], startedAt = null, observedAt = new Date().toISOString(), complete = true } = {}) {
  const unique = [...new Map(records.map(record => [record.id, record])).values()];
  const reviewedIds = new Set();
  for (const review of reviews) {
    if (!review || typeof review.contributionId !== 'string' || reviewedIds.has(review.contributionId) ||
        !['external', 'studio', 'qa', 'unknown'].includes(review.kind) || typeof review.accepted !== 'boolean' ||
        (review.kind === 'external' && !/^[a-z][a-z0-9_-]{0,39}$/.test(review.operatorId || ''))) {
      throw Error('Reviews need unique contribution IDs, a kind, accepted boolean, and a public-safe operator token for external work.');
    }
    reviewedIds.add(review.contributionId);
  }
  const start = startedAt === null ? null : Date.parse(startedAt);
  const end = Date.parse(observedAt);
  if ((start !== null && !Number.isFinite(start)) || !Number.isFinite(end) || (start !== null && start > end)) throw Error('Invalid observation window.');
  const challenges = unique.filter(record => (record.body || '').includes(`Challenge: ${challengeId}`) || (record.title || '').startsWith(`[${challengeId}]`));
  const inWindow = challenges.filter(record => Number.isFinite(Date.parse(record.created_at)) && Date.parse(record.created_at) <= end && (start === null || Date.parse(record.created_at) >= start));
  const eligible = [];
  const pending = [];
  const reviewById = new Map(reviews.map(review => [review.contributionId, review]));
  for (const record of inWindow) {
    const kind = activityKind(record), review = reviewById.get(record.id);
    if (['studio', 'qa'].includes(kind)) continue;
    if (!review || review.kind === 'unknown') pending.push(record.id);
    if (review?.kind === 'external' && review.accepted) eligible.push({ ...record, operatorId: review.operatorId });
  }
  const operators = new Map();
  for (const record of eligible.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))) {
    const entries = operators.get(record.operatorId) || []; entries.push(record); operators.set(record.operatorId, entries);
  }
  let returned = 0, mature = 0;
  const arms = { a: 0, b: 0, unassigned: 0, mixed: 0 };
  for (const entries of operators.values()) {
    const first = Date.parse(entries[0].created_at);
    if (end - first >= 7 * 86400000) mature++;
    if (entries.some(entry => Date.parse(entry.created_at) - first >= 86400000 && Date.parse(entry.created_at) - first <= 7 * 86400000)) returned++;
    const named = [...new Set(entries.map(entry => /^Invitation arm:\s*(a|b)\s*$/im.exec(entry.body || '')?.[1]?.toLowerCase()).filter(Boolean))];
    arms[named.length > 1 ? 'mixed' : named[0] || 'unassigned']++;
  }
  return {
    challengeId, observedAt, startedAt, timezone: 'America/New_York', publicReadComplete: complete,
    observed: {
      publicContributions: unique.length,
      studio: unique.filter(record => activityKind(record) === 'studio').length,
      qa: unique.filter(record => activityKind(record) === 'qa').length,
      candidateAgentUsernames: new Set(unique.filter(record => activityKind(record) === 'candidate').map(record => record.author)).size,
      unverified: unique.filter(record => activityKind(record) === 'unverified').length,
      challengeContributionsInWindow: inWindow.length,
    },
    outcomes: {
      adjudication: reviews.length ? 'manual-review-provided' : 'not-reviewed',
      verifiedIndependentOperators: reviews.length ? operators.size : null,
      acceptedExternalContributions: reviews.length ? eligible.length : null,
      repeatOperatorsWithinSevenDays: reviews.length ? returned : null,
      operatorsWithFullSevenDayObservation: reviews.length ? mature : null,
      verifiedOperatorsByInvitationArm: reviews.length ? arms : null,
      needsReview: pending,
      exposureDenominator: null,
      conversionRate: null,
    },
    limitations: [
      'Public API observations are a visibility-limited snapshot, not visitor analytics or a count of unique people.',
      'A username, agent key, user-agent string, or roster entry cannot establish an independent operator. Operator independence and useful work require manual review.',
      'Invitation arm and source are self-reported. Without recorded independent assignments and exposure counts, no conversion lift or causal winner is estimated.',
      'Repeat work must be accepted, from the same reviewed operator, and 24 hours to seven days after its first accepted contribution. Incomplete follow-up is reported separately.',
      'Deleted/private work and older replies outside the public API limit are not observed. API timestamp pagination may omit records tied at a page boundary.',
    ],
  };
}
export async function collectPilot(origin, fetcher = fetch) {
  const base = allowedOrigin(origin), records = [], checks = [];
  let before = '', complete = true;
  const seen = new Set();
  for (let page = 0; page < 20; page++) {
    const path = '/api/community/threads?category=agents' + (before ? '&before=' + encodeURIComponent(before) : '');
    const data = await requestJson(base, path, {}, fetcher);
    if (data.ready !== true || !Array.isArray(data.threads)) throw Error('The conversation service is unavailable; no empty/healthy result was inferred.');
    for (const thread of data.threads) {
      if (seen.has(thread.id)) continue;
      if (!/^[a-f0-9-]{36}$/.test(thread.id)) throw Error('Unexpected conversation ID.');
      seen.add(thread.id);
      const detail = await requestJson(base, '/api/community/threads?id=' + thread.id, {}, fetcher);
      if (!detail.thread || !Array.isArray(detail.replies)) throw Error('Incomplete conversation response.');
      records.push(detail.thread, ...detail.replies);
      if (Number(detail.thread.reply_count) > detail.replies.length) complete = false;
    }
    if (!data.next) break;
    if (data.next === before || page === 19) { complete = false; break; }
    before = data.next;
  }
  for (const path of ['/community/agents/', '/community/agent-guide/', '/community/feed?category=agents', '/llms.txt', '/robots.txt']) {
    const start = performance.now();
    const response = await fetcher(base + path, { redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'EidosWorks-AgentExchange-Diagnostic/1.0' } });
    const body = await response.text();
    const challenge = /cf-chl-|Just a moment\.\.\./i.test(body);
    checks.push({ path, status: response.status, milliseconds: Math.round(performance.now() - start), contentType: response.headers.get('content-type'), accessChallenge: challenge, sha256: createHash('sha256').update(body).digest('hex') });
  }
  return { records, checks, complete };
}
async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map(arg => { const index = arg.indexOf('='); return [arg.slice(2, index), arg.slice(index + 1)]; }));
  const collected = args.input ? JSON.parse(await readFile(args.input, 'utf8')) : await collectPilot(args.origin || 'https://eidos-works.com');
  const reviews = args.reviews ? JSON.parse(await readFile(args.reviews, 'utf8')) : [];
  const report = summarizePilot(collected.records, { reviews, startedAt: args.start || null, complete: collected.complete });
  const out = resolve(args.out || 'artifacts/agent-exchange/latest');
  await mkdir(out, { recursive: true });
  await writeFile(out + '/snapshot.json', JSON.stringify(collected, null, 2) + '\n');
  await writeFile(out + '/report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ report: out + '/report.json', ...report }, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
