import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { isExpectedArticleLocation } from './insight-url.mjs';

test('Pages article directory redirects are allowed without accepting other locations', () => {
  const expected = 'https://eidos-works.com/insights/example';
  assert.equal(isExpectedArticleLocation(expected, expected), true);
  assert.equal(isExpectedArticleLocation(`${expected}/`, expected), true);
  for (const actual of [
    'https://eidos-works.com/insights/',
    'https://eidos-works.com/insights/another/',
    'https://other.example/insights/example/',
    'http://eidos-works.com/insights/example/',
    `${expected}/?redirect=1`,
  ]) assert.equal(isExpectedArticleLocation(actual, expected), false, actual);
});

const runner = resolve('scripts/publish-insight-run.mjs');
for (const fail of [false, true]) {
  test(`publishing runner ${fail ? 'stops and records a failed gate' : 'runs every gate through a CLI path with spaces'}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'insights runner '));
    const cli = join(root, 'npm cli.mjs');
    await mkdir(join(root, 'artifacts'), { recursive: true });
    await writeFile(cli, `console.log(process.argv.slice(2).join(' ')); process.exit(${fail} && process.argv[3] === 'lint' ? 7 : 0);`);
    const result = spawnSync(process.execPath, [runner, '--slot=test'], {
      cwd: root, env: { ...process.env, npm_execpath: cli }, encoding: 'utf8', timeout: 60000,
    });
    assert.equal(result.status, fail ? 1 : 0, result.stderr);
    const runs = join(root, 'artifacts/insights/runs');
    const [id] = await readdir(runs);
    const report = JSON.parse(await readFile(join(runs, id, 'run_report.json'), 'utf8'));
    assert.equal(report.status, fail ? 'failed' : 'passed');
    assert.equal(report.commands.length, fail ? 3 : 7);
    assert.equal(report.commands.at(-1).code, fail ? 7 : 0);
    assert.equal(report.failure, fail ? 'npm run lint exited with 7' : null);
  });
}
