import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

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
  ['npm', ['run', 'validate:insights:dist']],
  ['npm', ['run', 'verify:urls']]
];

function runCommand(command, commandArgs) {
  const startedAt = new Date().toISOString();
  return new Promise((resolveCommand) => {
    const commandForPlatform = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
    const child = spawn(commandForPlatform, commandArgs, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      const value = chunk.toString();
      stdout += value;
      process.stdout.write(value);
    });
    child.stderr.on('data', (chunk) => {
      const value = chunk.toString();
      stderr += value;
      process.stderr.write(value);
    });
    child.on('close', (code) => {
      resolveCommand({
        command: [command, ...commandArgs].join(' '),
        code,
        started_at_utc: startedAt,
        finished_at_utc: new Date().toISOString(),
        stdout: stdout.slice(-12000),
        stderr: stderr.slice(-12000)
      });
    });
  });
}

async function getGitValue(args) {
  const result = await runCommand('git', args);
  return result.code === 0 ? result.stdout.trim() : 'unknown';
}

await mkdir(runDir, { recursive: true });

const report = {
  run_id: runId,
  slot,
  started_at_utc: new Date().toISOString(),
  cwd: root,
  git_commit_before: await getGitValue(['rev-parse', 'HEAD']),
  commands: [],
  status: 'running',
  failure: null
};

for (const [command, commandArgs] of commands) {
  const result = await runCommand(command, commandArgs);
  report.commands.push(result);
  if (result.code !== 0) {
    report.status = 'failed';
    report.failure = `${result.command} exited with ${result.code}`;
    break;
  }
}

if (report.status === 'running') {
  report.status = 'passed';
}

report.finished_at_utc = new Date().toISOString();
report.git_status_after = await getGitValue(['status', '--short']);

await writeFile(resolve(runDir, 'run_report.json'), `${JSON.stringify(report, null, 2)}\n`);
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
    '',
    '## Commands',
    ...report.commands.map((entry) => `- ${entry.command}: ${entry.code === 0 ? 'passed' : `failed (${entry.code})`}`),
    '',
    '## Notes',
    report.failure ? `- Blocking failure: ${report.failure}` : '- Validation, lint, build, prerender, dist checks, and URL verification completed.',
    '- This script does not commit, push, or deploy by itself. The scheduled Codex automation performs those steps after reviewing the generated diff.'
  ].join('\n')
);

console.log(`Wrote run report to ${runDir}`);
if (report.status !== 'passed') process.exit(1);
