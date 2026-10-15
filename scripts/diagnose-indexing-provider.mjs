// Bounded provider reads using the existing credential. Never emit credentials,
// account/zone identifiers, environment configuration, client IPs or raw errors.
import { writeFile } from 'node:fs/promises';

const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const expectedCommit = 'b8bfbbc4e6f9dd73c7c899f0b32e829207314b75';
const rays = ['a4afd098fd319df8', 'a4afd0a5fe7aefcd', 'a4afd0b2ed4c7631', 'a4afd0bfc8d283f9', 'a4afd0f90fd7efcd', 'a4afd1065e7c2724', 'a4afd113aeba6e05', 'a4afd1211cb2efcd'];
const report = { checkedAt: new Date().toISOString(), sourceCommit: process.env.GITHUB_SHA || null, policy: 'Read existing Pages identity and security events for eight known diagnostic Ray IDs only. No provider mutation, credential change or public URL probe.', credentialPresent: Boolean(token), pages: null, zoneLookup: null, securityEvents: null };

async function request(path, body) {
  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    const errors = Array.isArray(data.errors) ? data.errors : [];
    const errorCategories = errors.map((error) => /auth|permission|access|forbidden|not allowed/i.test(error.message || '') ? 'authorization' : /field|argument|type|syntax|schema/i.test(error.message || '') ? 'schema' : 'provider');
    return { status: response.status, accepted: response.ok && data.success !== false && errors.length === 0, errorCodes: errors.map((error) => error.code || error.extensions?.code || null), errorCategories, data };
  } catch { return { status: null, accepted: false, error: 'request failed' }; }
}
function outcome(value) { return { status: value.status, accepted: value.accepted, errorCodes: value.errorCodes || [], errorCategories: value.errorCategories || [], ...(value.error ? { error: value.error } : {}) }; }

if (token) {
  if (account) {
    const value = await request(`accounts/${encodeURIComponent(account)}/pages/projects/eidosworks`);
    report.pages = outcome(value);
    if (value.accepted) {
      const project = value.data.result, deployment = project?.canonical_deployment;
      Object.assign(report.pages, { project: project?.name, productionBranch: project?.production_branch, canonicalDomainAttached: project?.domains?.includes('eidos-works.com') === true, deploymentId: deployment?.id || null, deploymentUrl: deployment?.url || null, deployedCommit: deployment?.deployment_trigger?.metadata?.commit_hash || null, deploymentStatus: deployment?.latest_stage?.status || null, expectedCommitUnchanged: deployment?.deployment_trigger?.metadata?.commit_hash === expectedCommit });
    }
  }
  const zone = account ? await request(`accounts/${encodeURIComponent(account)}/pages/projects/eidosworks/domains/eidos-works.com`) : { status: null, accepted: false, error: 'Existing account credential unavailable' };
  report.zoneLookup = outcome(zone);
  const domain = zone.accepted ? zone.data.result : null;
  report.zoneLookup.exactDomainMatch = domain?.name === 'eidos-works.com';
  report.zoneLookup.zoneTagPresent = Boolean(domain?.zone_tag);
  if (domain?.name === 'eidos-works.com' && domain.zone_tag) {
    // A GraphQL query (not a mutation), restricted to our own known requests.
    const query = 'query IndexingDiagnosticEvents($zoneTag: string, $filter: FirewallEventsAdaptiveFilter_InputObject) { viewer { zones(filter: {zoneTag: $zoneTag}) { firewallEventsAdaptive(filter: $filter, limit: 16, orderBy: [datetime_ASC]) { rayName datetime action source ruleId clientRequestPath } } } }';
    const value = await request('graphql', { query, variables: { zoneTag: domain.zone_tag, filter: { datetime_geq: '2026-10-15T15:21:35Z', datetime_leq: '2026-10-15T15:22:10Z', rayName_in: rays } } });
    report.securityEvents = outcome(value);
    if (value.accepted) {
      const rows = value.data.data?.viewer?.zones?.flatMap((entry) => entry.firewallEventsAdaptive || []) || [];
      report.securityEvents.events = rows.filter((entry) => rays.includes(entry.rayName)).map(({ rayName, datetime, action, source, ruleId, clientRequestPath }) => ({ rayName, datetime, action, source, ruleId, path: clientRequestPath }));
      report.securityEvents.limitation = 'Sampled events for test clients only; absence does not prove passage and no verified crawler request was tested.';
    }
  } else report.securityEvents = { attempted: false, reason: 'Exact canonical zone is not readable with the existing credential.' };
}
console.log(JSON.stringify(report, null, 2));
if (process.env.INDEXING_PROVIDER_RECEIPT) await writeFile(process.env.INDEXING_PROVIDER_RECEIPT, JSON.stringify(report, null, 2) + '\n');
