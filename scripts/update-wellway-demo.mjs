/** Rebuild the local Wellway app and refresh the gallery's static demo artifact. */
import { spawnSync } from 'node:child_process';
import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../apps/wellway/', import.meta.url));
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
  cwd: appRoot,
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
const output = new URL('../public/demos/wellway/', import.meta.url);
await mkdir(output, { recursive: true });
await copyFile(new URL('../apps/wellway/dist/wellway-demo.html', import.meta.url), new URL('index.html', output));
console.log('Updated public/demos/wellway/index.html. No deployment was performed.');
