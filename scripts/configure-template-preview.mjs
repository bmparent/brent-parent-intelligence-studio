import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { validateTemplatePreviewPin, verifyTemplateCatalogPin } from './template-preview-pin.mjs';
import { templateProducts } from '../functions/_shared/platform/templateCatalog.ts';

const projectName = 'eidosworks-templates-test-20261010';
const branch = 'codex/paid-templates-20261010';
const origin = `https://${projectName}.pages.dev`;
const env = process.env;
for (const key of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'EIDOS_TEMPLATES_PLATFORM_TOKEN', 'EIDOS_TEMPLATES_PREVIEW_BYPASS']) {
  if (!env[key]) throw Error(`Missing candidate-only configuration: ${key}`);
}
const pin = validateTemplatePreviewPin(JSON.parse(await readFile(new URL('../docs/paid-templates/preview-backend.json', import.meta.url), 'utf8')));
const backend = new URL(pin.backendOrigin);
if (backend.protocol !== 'https:' || !backend.hostname.endsWith('.vercel.app') || backend.pathname !== '/' || backend.search || backend.hash) throw Error('Candidate backend must be a pinned Vercel deployment origin.');
if (env.EIDOS_TEMPLATES_PLATFORM_TOKEN.length < 32 || env.EIDOS_TEMPLATES_PREVIEW_BYPASS.length < 20) throw Error('Candidate relay credentials are invalid.');
const headers = { 'x-eidos-platform-token': env.EIDOS_TEMPLATES_PLATFORM_TOKEN, 'x-eidos-site-origin': origin, 'x-vercel-protection-bypass': env.EIDOS_TEMPLATES_PREVIEW_BYPASS };
const catalogResponse = await fetch(backend.origin + '/api/works/v1/api/shop/catalog', { headers, redirect: 'error', signal: AbortSignal.timeout(24000) });
if (!catalogResponse.ok) throw Error(`Pinned backend catalog is unavailable (${catalogResponse.status}); candidate routing was not changed.`);
verifyTemplateCatalogPin(pin, await catalogResponse.json(), templateProducts);
const unsigned = await fetch(backend.origin + '/api/works/v1/api/shop/webhook', { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: '{}', redirect: 'error', signal: AbortSignal.timeout(24000) });
if (unsigned.status !== 400) throw Error(`Pinned webhook must reject an unsigned event with HTTP400 (${unsigned.status}); candidate routing was not changed.`);
const base = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects`;
async function api(path, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers: { authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!result.success) throw Error(`Pages ${method} ${path || '/'} failed (${response.status}; codes ${(result.errors || []).map((e) => e.code).join(',')}).`);
  return result.result;
}
const projects = [];
// Keep inventory requests small; the provider rejected per_page=100 (8000024).
const pageSize = 10;
for (let page = 1; ; page++) {
  const chunk = await api(`?per_page=${pageSize}&page=${page}`);
  projects.push(...chunk);
  if (chunk.length < pageSize) break;
  if (page >= 100) throw Error('Pages project inventory exceeded the bounded limit.');
}
const liveBefore = projects.find((p) => p.name === 'eidosworks');
let candidate = projects.find((p) => p.name === projectName);
if (!candidate) candidate = await api('', 'POST', { name: projectName, production_branch: branch });
if (candidate.name !== projectName || candidate.production_branch !== branch || (candidate.domains || []).some((d) => d !== `${projectName}.pages.dev`)) throw Error('Isolated preview project guard failed.');
const vars = { EIDOS_PLATFORM_URL: { type: 'plain_text', value: backend.origin }, EIDOS_PLATFORM_TOKEN: { type: 'secret_text', value: env.EIDOS_TEMPLATES_PLATFORM_TOKEN }, EIDOS_PLATFORM_PREVIEW_BYPASS: { type: 'secret_text', value: env.EIDOS_TEMPLATES_PREVIEW_BYPASS } };
await api(`/${projectName}`, 'PATCH', { deployment_configs: { production: { env_vars: vars }, preview: { env_vars: vars } } });
const liveAfter = await api('/eidosworks');
if (liveBefore?.latest_deployment?.id !== liveAfter?.latest_deployment?.id) throw Error('Canonical deployment changed during preview configuration; inspect separately.');
await mkdir('artifacts/templates', { recursive: true });
await writeFile('artifacts/templates/preview-configuration.json', JSON.stringify({ project: projectName, branch, siteOrigin: origin, siteSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), backendOrigin: backend.origin, backendSha: pin.backendSha, backendDeploymentId: pin.deploymentId, backendBundleHash: pin.bundleHash, sourceRevision: pin.sourceRevision, catalogPreflight: 'exact TEST source, versions, prices and developer-only availability passed', unsignedWebhook: 400, database: 'existing Eidos Works validation database; backend receipt has host and additive migration evidence', canonicalDeploymentBefore: liveBefore?.latest_deployment?.id || null, canonicalDeploymentAfter: liveAfter?.latest_deployment?.id || null, customDomains: [], sales: 'TEST gated; no LIVE enabled', timestamp: new Date().toISOString() }, null, 2) + '\n');
console.log(`Configured isolated TEST preview ${origin}; canonical deployment unchanged.`);
