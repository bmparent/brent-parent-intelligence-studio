import { mkdir, rename, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const args = process.argv.slice(2);
const slotArg = args.find((arg) => arg.startsWith('--slot='));
const slot = slotArg?.split('=')[1] ?? 'manual';
const runId = `${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}-${slot}`;
const runDir = resolve(root, 'artifacts/insights/runs', runId);
const commands = [
  ['npm', ['run', 'content:generate']],
  ['npm', ['run', 'validate:insights']],
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'build']],
  ['npm', ['run', 'verify:prerender']],
  ['npm', ['run', 'verify:editorial']],
  ['npm', ['run', 'validate:insights:dist']],
  ['npm', ['run', 'verify:urls']],
  ['npm', ['run', 'build:functions']]
];
// Check this checkout directly: Node's normal resolution can silently borrow
// packages from an ancestor checkout and conceal an incomplete npm ci.
const dependencyFiles = [
  'eslint/bin/eslint.js',
  'typescript/bin/tsc',
  'typescript/lib/typescript.js',
  'vite/bin/vite.js',
  '@vitejs/plugin-react/dist/index.js',
  'tsx/dist/cli.mjs',
  'wrangler/bin/wrangler.js',
  'esbuild/bin/esbuild',
  'esbuild/lib/main.js',
  'react/index.js',
  'react-dom/client.js',
  'react-dom/server.node.js',
  '@babylonjs/core/index.js',
  'gsap/index.js'
].map((file) => `node_modules/${file}`);

async function runCommand(command, commandArgs, onProgress = async () => {}) {
  const startedAt = new Date().toISOString();
  const result = {
    command: [command, ...commandArgs].join(' '),
    code: null,
    status: 'running',
    started_at_utc: startedAt,
    finished_at_utc: null,
    stdout: '',
    stderr: ''
  };
  let progress = Promise.resolve();
  const recordProgress = () => {
    const snapshot = { ...result };
    progress = progress.then(() => onProgress(snapshot));
    // Keep errors handled while the child is alive; reject its result on close.
    progress.catch(() => {});
  };
  recordProgress();
  await progress;
  return new Promise((resolveCommand, rejectCommand) => {
    // npm supplies its CLI path when this script runs via npm run. Invoke it
    // through Node so Windows never needs to execute a .cmd file or a shell.
    const npmCli = command === 'npm' ? process.env.npm_execpath : null;
    const child = spawn(npmCli ? process.execPath : command, npmCli ? [npmCli, ...commandArgs] : commandArgs, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    child.on('error', (error) => {
      result.stderr = `${result.stderr}Failed to start ${command}: ${error.message}\n`.slice(-12000);
      recordProgress();
    });
    child.stdout.on('data', (chunk) => {
      const value = chunk.toString();
      result.stdout = `${result.stdout}${value}`.slice(-12000);
      process.stdout.write(value);
      recordProgress();
    });
    child.stderr.on('data', (chunk) => {
      const value = chunk.toString();
      result.stderr = `${result.stderr}${value}`.slice(-12000);
      process.stderr.write(value);
      recordProgress();
    });
    child.on('close', (code, signal) => {
      Object.assign(result, {
        code, signal, status: code === 0 ? 'passed' : 'failed',
        finished_at_utc: new Date().toISOString()
      });
      recordProgress();
      progress.then(() => resolveCommand(result), rejectCommand);
    });
  });
}

async function getGitValue(args) {
  const result = await runCommand('git', args, updateActiveCommand);
  report.active_command = null;
  await saveReport();
  return result.code === 0 ? result.stdout.trim() : 'unknown';
}

await mkdir(runDir, { recursive: true });

const report = {
  run_id: runId,
  slot,
  started_at_utc: new Date().toISOString(),
  cwd: root,
  git_commit_before: 'unknown',
  dependency_preflight: {
    status: 'running',
    scope: 'Local entry-file presence only; the subsequent gates verify the installed tools and application.',
    required_files: dependencyFiles,
    missing_files: [],
    repair_command: 'npm ci --no-audit --no-fund'
  },
  active_command: null,
  commands: [],
  status: 'running',
  failure: null
};

// Serialize atomic replacements so an interrupted child still leaves a valid
// receipt with its command and most recent output, rather than no report.
let reportWrites = Promise.resolve();
function saveReport() {
  const snapshot = `${JSON.stringify(report, null, 2)}\n`;
  // A later final failure receipt may retry after a transient write failure.
  reportWrites = reportWrites.catch(() => {}).then(async () => {
    const pendingPath = resolve(runDir, 'run_report.json.tmp');
    await writeFile(pendingPath, snapshot);
    for (let attempt = 0; ; attempt++) {
      try {
        await rename(pendingPath, resolve(runDir, 'run_report.json'));
        break;
      } catch (error) {
        // Windows readers/scanners can briefly hold the destination open.
        if (process.platform !== 'win32' || !['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 20) throw error;
        await delay(50);
      }
    }
  });
  return reportWrites;
}

async function updateActiveCommand(command) {
  report.active_command = command;
  await saveReport();
}

try {
  await saveReport();
  for (const file of dependencyFiles) {
    try {
      if (!(await stat(resolve(root, file))).isFile()) report.dependency_preflight.missing_files.push(file);
    } catch {
      report.dependency_preflight.missing_files.push(file);
    }
  }
  report.dependency_preflight.status = report.dependency_preflight.missing_files.length ? 'failed' : 'passed';
  if (report.dependency_preflight.status === 'failed') {
    report.status = 'failed';
    report.failure = `Dependency preflight failed: missing or incomplete local dependencies (${report.dependency_preflight.missing_files.join(', ')}). Run npm ci --no-audit --no-fund from the repository root, then retry the same slot.`;
    console.error(report.failure);
  }
  await saveReport();
  report.git_commit_before = await getGitValue(['rev-parse', 'HEAD']);

  if (report.status === 'running') {
    for (const [command, commandArgs] of commands) {
      const result = await runCommand(command, commandArgs, updateActiveCommand);
      report.commands.push(result);
      report.active_command = null;
      if (result.code !== 0) {
        report.status = 'failed';
        report.failure = `${result.command} exited with ${result.code}`;
      }
      await saveReport();
      if (report.status === 'failed') break;
    }
  }
  report.git_status_after = await getGitValue(['status', '--short']);
} catch (error) {
  report.status = 'failed';
  report.failure = `Publishing runner could not finish recording the run: ${error.message}`;
  if (report.active_command) {
    report.active_command.status = 'failed';
    report.active_command.finished_at_utc = new Date().toISOString();
  }
  console.error(report.failure);
}

if (report.status === 'running') {
  report.status = 'passed';
}

report.finished_at_utc = new Date().toISOString();

await saveReport();
await writeFile(
  resolve(runDir, 'run_report.md'),
  [
    `# Insights publishing run - ${runId}`,
    '',
    `Status: ${report.status}`,
    `Slot: ${slot}`,
    `Started: ${report.started_at_utc}`,
    `Finished: ${report.finished_at_utc}`,
    `Git commit before: ${report.git_commit_before}`,
    `Dependency preflight: ${report.dependency_preflight.status}`,
    '',
    '## Commands',
    ...report.commands.map((entry) => `- ${entry.command}: ${entry.code === 0 ? 'passed' : `failed (${entry.code})`}`),
    '',
    '## Notes',
    report.failure ? `- Blocking failure: ${report.failure}` : '- Validation, lint, build, prerender, editorial, dist, URL, and Functions checks completed.',
    '- This script does not commit, push, or deploy by itself. The scheduled Codex automation performs those steps after reviewing the generated diff.'
  ].join('\n')
);

console.log(`Wrote run report to ${runDir}`);
if (report.status !== 'passed') process.exit(1);
