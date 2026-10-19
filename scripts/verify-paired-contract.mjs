import { platformSourceFiles } from './works-platform-files.mjs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const backend = process.argv[2];
const output = process.argv[3];
if (!backend || !output) throw Error('Usage: node scripts/verify-paired-contract.mjs <backend-app> <report.json>');

const manifest = JSON.parse(await readFile('artifacts/implementation/2026-09-21/compatibility.json', 'utf8'));
if (manifest.files.length !== 75 || new Set(manifest.files.map(file => file.path)).size !== 75) {
  throw Error('The expected 75-file contract manifest is incomplete or duplicated.');
}
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const contractFiles = [
  // Preserve the historical manifest; the legacy AI implementation now has a
  // distinct name so it can coexist with scoped AI on case-insensitive disks.
  ...manifest.files.map(file => file.path === 'functions/_shared/platform/playgroundAI.ts'
    ? { ...file, path: 'functions/_shared/platform/playgroundLegacyAI.ts' } : file),
  { path: 'migrations/0007_operations.sql', normalization: 'UTF-8 LF' },
  { path: 'functions/_shared/platform/studioAgents.ts', normalization: 'UTF-8 LF' },
];
const registered = new Set(contractFiles.map(file => file.path));
for (const path of await platformSourceFiles()) {
  if (!registered.has(path)) contractFiles.push({path, normalization: 'UTF-8 LF'});
}
const exactRevisions = Boolean(process.env.SITE_REVISION && process.env.BACKEND_REVISION);
const readGitBlob = (cwd, revision, path) => execFileSync('git', ['show', `${revision}:${path}`], { cwd, maxBuffer: 8_000_000 });
const checks = [];
for (const { path, normalization } of contractFiles) {
  // These two explicit adapters redirect to the isolated delivery/proposal
  // graph, verified separately by export-playground-delivery.mjs (check mode).
  if (['functions/_shared/platform/projectDeliveryRenderer.ts', 'functions/_shared/platform/playgroundAiRenderer.ts'].includes(path)) continue;
  const source = exactRevisions ? readGitBlob(process.cwd(), process.env.SITE_REVISION, path) : await readFile(resolve(path));
  const vendor = exactRevisions
    ? readGitBlob(resolve(backend, '../..'), process.env.BACKEND_REVISION, `apps/sentinel-lab/lib/works/vendor/${path}`)
    : await readFile(resolve(backend, 'lib/works/vendor', path));
  const normalize = bytes => normalization === 'UTF-8 LF'
    ? Buffer.from(bytes.toString('utf8').replace(/\r\n?/g, '\n'))
    : bytes;
  const sourceSha256 = sha256(normalize(source));
  const vendorSha256 = sha256(normalize(vendor));
  checks.push({ path, normalization, sourceSha256, vendorSha256, matches: sourceSha256 === vendorSha256 });
}
const report = {
  checkedAt: new Date().toISOString(),
  siteRevision: process.env.SITE_REVISION || 'record separately',
  backendRevision: process.env.BACKEND_REVISION || 'record separately',
  sourceMode: exactRevisions ? 'Git blobs at exact revisions' : 'working tree files',
  separateAdapterVerification: 'Run export-playground-delivery.mjs in check mode for projectDeliveryRenderer.ts and playgroundAiRenderer.ts plus their complete dependency graph.',
  count: checks.length,
  passed: checks.every(check => check.matches),
  checks,
};
await mkdir(dirname(resolve(output)), { recursive: true });
await writeFile(resolve(output), JSON.stringify(report, null, 2) + '\n');
console.log(`${checks.filter(check => check.matches).length}/${checks.length} paired contract files match; report: ${output}`);
if (!report.passed) process.exitCode = 1;
