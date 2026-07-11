import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(process.cwd());

for (const directory of ['dist', 'dist-ssr']) {
  const target = resolve(root, directory);
  if (dirname(target) !== root) throw new Error(`Refusing to clean an unsafe build path: ${target}`);
  await rm(target, { recursive: true, force: true });
}

console.log('Cleared generated build output.');
