// RECONSTRUCTION, 2026-10-18. Original c9f3992 was not recovered.
// Pure validation and local file hashing only. No provider or deployment API.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const FRONTEND = '4505148c71dc06e17c3cc5359fc628d836d20410';
export const BACKEND = 'f16bd3a94ae8a3a49065baac4c4d7ccfd5da1be7';
export const REPOSITORY = 'bmparent/brent-parent-intelligence-studio';
export const REPOSITORY_ID = 1233394991;
export const REVIEWED_BASE = 'fbee9a7761df9cb848aff8720aa5a17fb37c1b62';
export const BUILD_COMMIT = '8e3ed6c0470fa696452380a9981b794eacc02c5b';
export const SOURCE_TREE = '76823b58400d0c8509b2056124f504f498cb7d35';
export const ARTIFACT_LOCK = Object.freeze({ runId: 39072538950, runAttempt: 1, artifactId: 12115683862, jobId: 117512941864, workflowId: 355341585, workflowBlob: '4be889d89d0df4b86a8b7b2ce34f72bc5d57421a', digest: 'sha256:c1950dd2a20922bd9738f5a5ec4ec8628bae815dc358e9c6cae9cdb9b04ec913', bytes: 62120784 });
export const MAX_METADATA_AGE_MS = 15 * 60 * 1000;
export const PROJECT = 'eidosworks-playground-rehearsal-20261017';
export const BRANCH = 'rehearsal-disabled';
export const PREFIX = 'EIDOS_PG_INTEGRATION';
export const CAPABILITIES = Object.freeze(['accountsReady', 'communityReady', 'aiReady', 'playgroundAiReady', 'shopReady', 'localTest']);
export const FLAGS = Object.freeze(['EIDOS_AI_ENABLED', 'EIDOS_PLAYGROUND_AI_ENABLED', 'EIDOS_SHOP_ENABLED', 'EIDOS_TEMPLATE_LIVE_ENABLED', 'EIDOS_PLAYGROUND_DELIVERY_LIVE_ENABLED', 'EIDOS_TEMPLATE_TEST_ENABLED', 'EIDOS_TEMPLATE_TEST_CHALLENGE', 'EIDOS_ACCOUNTS_ENABLED', 'EIDOS_LOCAL_TEST', 'EIDOS_PROACTIVE_ENABLED', 'EIDOS_COMMUNITY_STUDIO_ENABLED', 'EIDOS_NEWSLETTER_ENABLED']);
function requireValue(condition, message) { if (!condition) throw new Error(message); }
function object(value, label) { requireValue(value && typeof value === 'object' && !Array.isArray(value), label + ' must be an object.'); }
function keys(value, allowed, label) {
  object(value, label);
  requireValue(Object.keys(value).every(k => allowed.includes(k)), label + ' contains an unsupported field; supply only non-secret evidence.');
}
function exact(value, expected, label) { requireValue(value === expected, label + ' differs from the reviewed policy.'); }
function id(value, label) { requireValue(Number.isSafeInteger(value) && value > 0, label + ' must be a positive safe integer.'); }

export function validatePlan(plan, mode = 'check-only') {
  exact(mode, 'check-only', 'Mode (deployment is not implemented in this recovery checkpoint)');
  keys(plan, ['schemaVersion', 'classification', 'frontendSha', 'backendSha', 'target', 'database', 'capabilities', 'flags', 'modes', 'deploymentAllowed'], 'Plan');
  exact(plan.schemaVersion, 1, 'Plan schema');
  exact(plan.classification, 'proposed-unverified-reconstruction', 'Plan classification');
  exact(plan.frontendSha, FRONTEND, 'Frontend SHA'); exact(plan.backendSha, BACKEND, 'Backend SHA');
  exact(plan.deploymentAllowed, false, 'Deployment permission');
  keys(plan.target, ['project', 'branch', 'origin', 'environment', 'customDomains'], 'Target');
  exact(plan.target.project, PROJECT, 'Pages project'); exact(plan.target.branch, BRANCH, 'Pages branch');
  exact(plan.target.origin, `https://${PROJECT}.pages.dev`, 'Pages origin');
  exact(plan.target.environment, 'preview', 'Environment');
  requireValue(Array.isArray(plan.target.customDomains) && plan.target.customDomains.length === 0, 'Custom domains are forbidden.');
  keys(plan.database, ['bindingPrefix', 'environment', 'dedicated'], 'Database');
  exact(plan.database.bindingPrefix, PREFIX, 'Dedicated database binding prefix');
  exact(plan.database.environment, 'preview', 'Database environment'); exact(plan.database.dedicated, true, 'Dedicated database requirement');
  keys(plan.capabilities, CAPABILITIES, 'Capabilities');
  for (const key of CAPABILITIES) exact(plan.capabilities[key], false, 'Capability ' + key);
  keys(plan.flags, FLAGS, 'Flags');
  for (const key of FLAGS) exact(plan.flags[key], 'false', 'Flag ' + key);
  keys(plan.modes, ['EIDOS_PLAYGROUND_AI_MODE', 'EIDOS_PLAYGROUND_DELIVERY_MODE'], 'Modes');
  for (const key of ['EIDOS_PLAYGROUND_AI_MODE', 'EIDOS_PLAYGROUND_DELIVERY_MODE']) exact(plan.modes[key], 'disabled', 'Mode ' + key);
  return plan;
}

// A single reviewed artifact is allowed. A PR merge is accepted only with the
// pinned parents, identical Git trees, original build identity and fresh PR/API
// evidence. This does not extend approval to arbitrary synthetic merge builds.
// Local snapshots prove consistency, not API authentication; CI fetches fresh.
export function checkoutExcerpt(logs) {
  requireValue(typeof logs === 'string', 'Checkout logs are missing.');
  return logs.split(/\r?\n/).filter(l => /refs\/remotes\/pull\/126\/merge|HEAD is now at 8e3ed6c|git log -1 --format=%H|^\S+ 8e3ed6c0470fa696452380a9981b794eacc02c5b$/.test(l)).join('\n') + '\n';
}
export function validateSourceEvidence(evidence, now = Date.now()) {
  object(evidence, 'Source evidence'); exact(evidence.schemaVersion, 1, 'Source evidence schema');
  const observed = Date.parse(evidence.observedAt);
  requireValue(Number.isFinite(now) && Number.isFinite(observed) && now - observed <= MAX_METADATA_AGE_MS && observed - now <= 60000, 'Source metadata is stale, future-dated or invalid; refresh the read-only GitHub evidence.');
  const front = evidence.frontendPR, back = evidence.backendPR;
  exact(front?.number, 126, 'Frontend PR'); exact(front?.state, 'open', 'Frontend PR state'); exact(front?.merged, false, 'Frontend merged state');
  exact(front?.head?.sha, FRONTEND, 'Current frontend head'); exact(front?.base?.sha, REVIEWED_BASE, 'Current frontend base');
  exact(front?.head?.repo?.id, REPOSITORY_ID, 'Current frontend head repository'); exact(front?.base?.repo?.id, REPOSITORY_ID, 'Current frontend base repository');
  exact(front?.head?.repo?.full_name, REPOSITORY, 'Current frontend repository'); exact(front?.merge_commit_sha, BUILD_COMMIT, 'Current PR merge commit');
  exact(back?.number, 83, 'Backend PR'); exact(back?.state, 'open', 'Backend PR state'); exact(back?.merged, false, 'Backend merged state');
  exact(back?.head?.sha, BACKEND, 'Current backend head'); exact(back?.head?.repo?.id, 1138596182, 'Backend repository ID'); exact(back?.head?.repo?.full_name, 'bmparent/eidos', 'Backend repository');
  const head = evidence.headCommit, build = evidence.buildCommit;
  exact(head?.sha, FRONTEND, 'Reviewed source commit'); exact(build?.sha, BUILD_COMMIT, 'Actual build commit');
  exact(head?.url, `https://api.github.com/repos/${REPOSITORY}/git/commits/${FRONTEND}`, 'Head commit provenance');
  exact(build?.url, `https://api.github.com/repos/${REPOSITORY}/git/commits/${BUILD_COMMIT}`, 'Build commit provenance');
  exact(head?.tree?.sha, SOURCE_TREE, 'Reviewed source tree'); exact(build?.tree?.sha, SOURCE_TREE, 'Build source tree');
  requireValue(Array.isArray(build.parents) && build.parents.length === 2, 'Expected exactly two merge parents.');
  exact(build.parents[0]?.sha, REVIEWED_BASE, 'Merge base parent'); exact(build.parents[1]?.sha, FRONTEND, 'Merge reviewed-head parent');
  exact(build?.verification?.verified, true, 'GitHub merge verification');
  exact(evidence.producerWorkflow?.path, '.github/workflows/playground-editor-release.yml', 'Producer workflow path'); exact(evidence.producerWorkflow?.sha, ARTIFACT_LOCK.workflowBlob, 'Producer workflow source');
  const job = evidence.job;
  exact(job?.id, ARTIFACT_LOCK.jobId, 'Checkout job'); exact(job?.run_id, ARTIFACT_LOCK.runId, 'Checkout job run'); exact(job?.name, 'local-editor', 'Build job name'); exact(job?.conclusion, 'success', 'Build job conclusion'); exact(job?.status, 'completed', 'Build job state');
  for (const name of ['Run actions/checkout@v4', 'Retain browser and build evidence even when a check fails']) requireValue(job.steps?.some(s => s.name === name && s.conclusion === 'success'), 'Missing successful source/artifact job step.');
  requireValue(job.steps?.some(s => s.name === 'Deploy only this verified main commit to the existing Pages project' && s.conclusion === 'skipped'), 'The recorded PR deployment step must be skipped.');
  const excerpt = evidence.checkoutLogExcerpt;
  requireValue(typeof excerpt === 'string' && excerpt.includes(`+${BUILD_COMMIT}:refs/remotes/pull/126/merge`), 'Checkout fetch source is not proven.');
  requireValue(new RegExp('git log -1 --format=%H\\r?\\n\\S+ ' + BUILD_COMMIT + '(?:\\r?\\n|$)').test(excerpt), 'Checkout HEAD does not prove the actual build commit.');
  return { provenanceKind: 'github-pr-merge-identical-tree', reviewedFrontendHead: FRONTEND, buildCommit: BUILD_COMMIT, sourceTree: SOURCE_TREE, backendReviewedHead: BACKEND, metadataObservedAt: evidence.observedAt };
}
export function validateProvenance(run, artifact, expectedDigest, sourceEvidence, now = Date.now()) {
  const source = validateSourceEvidence(sourceEvidence, now);
  object(run, 'Run'); object(artifact, 'Artifact');
  id(run.id, 'Run ID'); id(artifact.id, 'Artifact ID');
  exact(run.id, ARTIFACT_LOCK.runId, 'Reviewed producer run'); exact(run.run_attempt, ARTIFACT_LOCK.runAttempt, 'Reviewed run attempt'); exact(run.workflow_id, ARTIFACT_LOCK.workflowId, 'Producer workflow ID');
  exact(run.repository?.full_name, REPOSITORY, 'Run repository');
  exact(run.repository?.id, REPOSITORY_ID, 'Run repository ID');
  exact(run.head_repository?.id, REPOSITORY_ID, 'Head repository ID');
  exact(run.head_repository?.full_name, REPOSITORY, 'Head repository');
  exact(run.head_sha, FRONTEND, 'Run head');
  exact(run.head_commit?.id, FRONTEND, 'Run commit');
  exact(run.head_branch, 'integrate/playground-readiness-20261017', 'Source branch');
  exact(run.path, '.github/workflows/playground-editor-release.yml', 'Artifact producer workflow');
  exact(run.status, 'completed', 'Run status'); exact(run.conclusion, 'success', 'Run conclusion');
  exact(artifact.id, ARTIFACT_LOCK.artifactId, 'Reviewed artifact ID');
  exact(artifact.name, `playground-editor-${BUILD_COMMIT}`, 'Original artifact name/build source');
  exact(run.event, 'pull_request', 'Reviewed producer event');
  requireValue(run.pull_requests?.length === 1 && run.pull_requests[0].number === 126 && run.pull_requests[0].head?.sha === FRONTEND && run.pull_requests[0].base?.sha === REVIEWED_BASE, 'Producer PR source association differs.');
  exact(artifact.expired, false, 'Artifact expired status');
  requireValue(Number.isFinite(Date.parse(artifact.expires_at)) && Date.parse(artifact.expires_at) > now, 'Artifact expiry is stale or invalid.');
  requireValue(Number.isSafeInteger(artifact.size_in_bytes) && artifact.size_in_bytes > 0, 'Artifact size is invalid.');
  exact(artifact.workflow_run?.id, run.id, 'Artifact run association');
  exact(artifact.workflow_run?.repository_id, REPOSITORY_ID, 'Artifact repository');
  exact(artifact.workflow_run?.head_repository_id, REPOSITORY_ID, 'Artifact head repository');
  exact(artifact.workflow_run?.head_sha, FRONTEND, 'Artifact source');
  exact(artifact.workflow_run?.head_branch, run.head_branch, 'Artifact source branch');
  requireValue(typeof expectedDigest === 'string' && /^sha256:[a-f0-9]{64}$/.test(expectedDigest), 'A reviewed sha256 artifact digest is required.');
  exact(expectedDigest, ARTIFACT_LOCK.digest, 'Reviewed immutable artifact digest'); exact(artifact.size_in_bytes, ARTIFACT_LOCK.bytes, 'Reviewed immutable artifact size');
  exact(artifact.digest, expectedDigest, 'GitHub artifact digest');
  return { ...source, runId: run.id, runAttempt: run.run_attempt, artifactId: artifact.id, artifactName: artifact.name, digest: expectedDigest };
}

export async function hashArtifact(file) {
  const hash = createHash('sha256'); let size = 0;
  for await (const bytes of createReadStream(file)) { hash.update(bytes); size += bytes.length; }
  return { digest: 'sha256:' + hash.digest('hex'), size };
}

export async function checkRehearsal({ plan, run, artifact, expectedDigest, artifactPath, sourceEvidence, mode = 'check-only', now = Date.now() }) {
  validatePlan(plan, mode);
  const provenance = validateProvenance(run, artifact, expectedDigest, sourceEvidence, now);
  const actual = await hashArtifact(artifactPath);
  exact(actual.digest, provenance.digest, 'Downloaded artifact digest'); exact(actual.size, artifact.size_in_bytes, 'Downloaded artifact size');
  return {
    classification: 'reconstruction-check-only', sourceAndIntentChecks: 'passed',
    ...provenance, frontendSha: FRONTEND, backendSha: BACKEND,
    target: PROJECT, branch: BRANCH, deploymentReady: false,
    blockers: ['Pages project existence and ownership unverified', 'Dedicated preview database binding and schema unverified', 'Backend deployed source/bundle and disabled runtime capabilities unverified', 'Disabled isolated-preview hosted acceptance and deployment review still required'],
  };
}

export async function main(args) {
  requireValue(args.length === 6 || args.length === 7, 'Usage: node scripts/rehearsal-deploy-guard.mjs plan.json run.json artifact.json artifact.zip sha256:... source-evidence.json [check-only]');
  const [planFile, runFile, artifactFile, artifactPath, expectedDigest, evidenceFile, mode = 'check-only'] = args;
  const [plan, run, artifact, sourceEvidence] = await Promise.all([planFile, runFile, artifactFile, evidenceFile].map(async p => JSON.parse(await readFile(p, 'utf8'))));
  return checkRehearsal({ plan, run, artifact, artifactPath, expectedDigest, sourceEvidence, mode });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await main(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error('Rehearsal check blocked: ' + error.message); process.exitCode = 1; }
}
