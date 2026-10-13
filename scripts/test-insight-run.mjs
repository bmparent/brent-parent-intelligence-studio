import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
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
const gates = [
  'content:generate', 'validate:insights', 'lint', 'build',
  'verify:prerender', 'verify:editorial', 'validate:insights:dist',
  'verify:urls', 'build:functions'
];
const dependencyFiles = [
  'eslint/bin/eslint.js', 'typescript/bin/tsc', 'typescript/lib/typescript.js',
  'vite/bin/vite.js', '@vitejs/plugin-react/dist/index.js', 'tsx/dist/cli.mjs',
  'wrangler/bin/wrangler.js', 'esbuild/bin/esbuild', 'esbuild/lib/main.js',
  'react/index.js', 'react-dom/client.js', 'react-dom/server.node.js',
  '@babylonjs/core/index.js', 'gsap/index.js'
];

async function installFixture(root, files = dependencyFiles) {
  for (const file of files) {
    const target = join(root, 'node_modules', file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, '// Local dependency entry fixture.\n');
  }
}

async function readReport(root) {
  const runs = join(root, 'artifacts/insights/runs');
  const [id] = await readdir(runs);
  return JSON.parse(await readFile(join(runs, id, 'run_report.json'), 'utf8'));
}

async function removeFixture(root) {
  assert.equal(dirname(root), resolve(tmpdir()));
  assert.ok(root.startsWith(join(tmpdir(), 'insights runner ')));
  await rm(root, { recursive: true, force: true });
}

for (const fail of [false, true]) {
  test(`publishing runner ${fail ? 'stops and records a failed gate' : 'runs every gate through a CLI path with spaces'}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'insights runner '));
    try {
      const cli = join(root, 'npm cli.mjs');
      await installFixture(root);
      // Each child reads its receipt before emitting output, then waits until
      // that output is saved while it is still running. This tests interruption
      // evidence rather than just inspecting the final successful report.
      await writeFile(cli, `
        import assert from 'node:assert/strict';
        import { appendFile, readdir, readFile } from 'node:fs/promises';
        import { join } from 'node:path';
        const name = process.argv[3];
        const runs = join(process.cwd(), 'artifacts/insights/runs');
        const [id] = await readdir(runs);
        const path = join(runs, id, 'run_report.json');
        const before = JSON.parse(await readFile(path, 'utf8'));
        assert.equal(before.active_command.command, 'npm run ' + name);
        assert.equal(before.active_command.status, 'running');
        assert.equal(before.commands.length, ${JSON.stringify(gates)}.indexOf(name));
        console.log('output for ' + name);
        const deadline = Date.now() + 5000;
        let during;
        do {
          during = JSON.parse(await readFile(path, 'utf8'));
          if (during.active_command.stdout.includes('output for ' + name)) break;
          await new Promise(resolve => setTimeout(resolve, 10));
        } while (Date.now() < deadline);
        assert.equal(during.active_command.status, 'running');
        assert.ok(during.active_command.stdout.includes('output for ' + name));
        await appendFile('observations.jsonl', JSON.stringify({ name, previous: before.commands.length, outputSaved: true }) + '\\n');
        process.exit(${fail} && name === 'lint' ? 7 : 0);
      `);
      const result = spawnSync(process.execPath, [runner, '--slot=test'], {
        cwd: root, env: { ...process.env, npm_execpath: cli }, encoding: 'utf8', timeout: 60000,
      });
      assert.equal(result.status, fail ? 1 : 0, result.stderr);
      const report = await readReport(root);
      assert.equal(report.dependency_preflight.status, 'passed');
      assert.equal(report.status, fail ? 'failed' : 'passed');
      assert.deepEqual(report.commands.map(entry => entry.command), (fail ? gates.slice(0, 3) : gates).map(name => `npm run ${name}`));
      assert.equal(report.commands.at(-1).code, fail ? 7 : 0);
      assert.equal(report.commands.at(-1).status, fail ? 'failed' : 'passed');
      assert.equal(report.active_command, null);
      assert.equal(report.failure, fail ? 'npm run lint exited with 7' : null);
      const observations = (await readFile(join(root, 'observations.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line));
      assert.equal(observations.length, fail ? 3 : 9);
      assert.ok(observations.every(entry => entry.outputSaved));
    } finally {
      await removeFixture(root);
    }
  });
}

for (const partial of [false, true]) {
  test(`dependency preflight rejects ${partial ? 'a partial local install' : 'ancestor dependencies without a local install'} before generation`, async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'insights runner '));
    try {
      await installFixture(fixtureRoot);
      const root = join(fixtureRoot, 'checkout');
      await mkdir(root);
      if (partial) await installFixture(root, ['eslint/bin/eslint.js']);
      const cli = join(fixtureRoot, 'npm cli.mjs');
      await writeFile(cli, 'throw new Error("A gate ran before dependency preflight passed");');
      const result = spawnSync(process.execPath, [runner, '--slot=test'], {
        cwd: root, env: { ...process.env, npm_execpath: cli }, encoding: 'utf8', timeout: 60000,
      });
      assert.equal(result.status, 1, result.stderr);
      const report = await readReport(root);
      assert.equal(report.status, 'failed');
      assert.equal(report.dependency_preflight.status, 'failed');
      assert.equal(report.commands.length, 0);
      assert.equal(report.dependency_preflight.missing_files.length, dependencyFiles.length - Number(partial));
      assert.ok(report.dependency_preflight.missing_files.includes('node_modules/typescript/bin/tsc'));
      assert.match(report.failure, /npm ci --no-audit --no-fund/);
      assert.match(await readFile(join(root, 'artifacts/insights/runs', (await readdir(join(root, 'artifacts/insights/runs')))[0], 'run_report.md'), 'utf8'), /Dependency preflight: failed/);
    } finally {
      await removeFixture(fixtureRoot);
    }
  });
}

test('publishing runner records a child launch error and stops', async () => {
  const root = await mkdtemp(join(tmpdir(), 'insights runner '));
  try {
    await installFixture(root);
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !['path', 'npm_execpath'].includes(key.toLowerCase())));
    env.PATH = '';
    const result = spawnSync(process.execPath, [runner, '--slot=test'], {
      cwd: root, env, encoding: 'utf8', timeout: 60000,
    });
    assert.equal(result.status, 1, result.stderr);
    const report = await readReport(root);
    assert.equal(report.status, 'failed');
    assert.equal(report.commands.length, 1);
    assert.equal(report.commands[0].command, 'npm run content:generate');
    assert.match(report.commands[0].stderr, /Failed to start npm/);
    assert.equal(report.commands[0].status, 'failed');
    assert.equal(report.active_command, null);
  } finally {
    await removeFixture(root);
  }
});
