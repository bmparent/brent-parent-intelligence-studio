import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// One entry point for local and production smoke runs. No suite is optional.
const out = path.resolve(process.env.PG_EVIDENCE_DIR || 'artifacts/playground-local-release');
const engines = (process.env.PG_ENGINES || 'chromium,firefox,webkit').split(',');
const widths = process.env.PG_WIDTHS || '1440,390,320';
await mkdir(out, { recursive: true });
const records = [];
function run(suite, extra = {}) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', `scripts/verify-playground-${suite}.mjs`], {
    stdio: 'inherit', env: { ...process.env, PG_BASE_URL: process.env.PG_BASE_URL || 'http://127.0.0.1:4173', PG_WIDTHS: widths, ...extra },
  });
  records.push({ suite, engine: extra.PG_ENGINE || engines.join(','), status: result.status, signal: result.signal, error: result.error?.message });
}
run('walkthrough', { PG_ENGINES: engines.join(','), PG_TOUR_EVIDENCE: path.join(out, 'tour') });
run('unified-browser', { PG_ENGINES: engines.join(','), PG_EVIDENCE_DIR: path.join(out, 'unified') });
run('element-motion', { PG_ENGINES: engines.join(','), PG_MOTION_EVIDENCE: path.join(out, 'motion') });
run('integrated-artwork', { PG_ENGINES: engines.join(','), PG_ARTWORK_EVIDENCE: path.join(out, 'artwork') });
run('account', { PG_ACCOUNT_URL: `${process.env.PG_BASE_URL || 'http://127.0.0.1:4173'}/playground/`, PG_ACCOUNT_EVIDENCE: path.join(out, 'account') });
for (const engine of engines) {
  const base = process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
  run('persistence', { PG_ENGINE: engine, PG_PERSISTENCE_URL: `${base}/playground/`, PG_PERSISTENCE_EVIDENCE: path.join(out, engine, 'persistence') });
  run('unified-gestures', { PG_ENGINE: engine, PG_GESTURE_EVIDENCE: path.join(out, engine, 'gestures') });
  run('guides', { PG_ENGINE: engine, PG_GUIDE_EVIDENCE: path.join(out, engine, 'guides') });
  run('frozen-review', { PG_ENGINE: engine, PG_REVIEW_URL: `${base}/playground/`, PG_REVIEW_EVIDENCE: path.join(out, engine, 'frozen-review') });
}
await writeFile(path.join(out, 'release-receipt.json'), JSON.stringify({ timestamp: new Date().toISOString(), engines, widths, records }, null, 2) + '\n');
if (records.some(record => record.status !== 0)) process.exitCode = 1;
