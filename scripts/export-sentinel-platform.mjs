import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// Run from this repository; destination must be an explicit Sentinel Lab checkout.
const destination = process.argv[2];
if (!destination) throw Error('Provide the Sentinel Lab app directory.');
const app = resolve(destination);
const pkg = JSON.parse(await readFile(resolve(app, 'package.json'), 'utf8'));
if (pkg.name !== 'eidos-sentinel-lab') throw Error('Destination is not Sentinel Lab.');
const vendor = resolve(app, 'lib/works/vendor');
await mkdir(vendor, { recursive: true });
const files = [
  'functions/_shared/platform',
  'functions/_shared/snapshot/stripe.ts', 'functions/_shared/snapshot/http.ts', 'functions/_shared/snapshot/types.ts',
  'functions/api/assistant.ts', 'functions/api/public-config.ts',
  'functions/api/community', 'functions/api/members', 'functions/api/shop', 'functions/community',
  'functions/api/playground', 'src/playground/model.ts', 'src/playground/approved-glass-preset.json',
  'src/playground/limits.ts', 'src/playground/export.ts', 'src/playground/renderer.ts', 'src/playground/runtime.ts', 'src/playground/pageStyles.ts', 'src/playground/glassBundle.ts',
  'migrations',
];
for (const file of files) {
  await mkdir(resolve(vendor, file, '..'), { recursive: true });
  await cp(resolve(file), resolve(vendor, file), { recursive: true });
}
const schema = (await readFile('migrations/0001_eidos_platform.sql', 'utf8')).replace(/\r\n/g, '\n');
await writeFile(resolve(vendor, 'migrations/0001_eidos_platform.sql'), schema);
await writeFile(resolve(vendor, 'README.md'), `# Eidos Works platform source\n\nVendored from bmparent/brent-parent-intelligence-studio. Refresh with its scripts/export-sentinel-platform.mjs, passing this app directory. Changes originate in that repository and are verified in both runtimes. No research executor is imported.\n\nSchema SHA-256 (UTF-8 LF): ${createHash('sha256').update(schema).digest('hex')}\n`);
console.log('Exported Eidos Works platform to Sentinel Lab.');
