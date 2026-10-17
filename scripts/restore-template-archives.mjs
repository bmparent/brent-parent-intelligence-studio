import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeZip, verifyExistingArchive } from './build-template-packages.mjs';

// Recover ignored buyer ZIPs from committed source, accepting only the recorded
// byte count and SHA-256. This never changes a purchased archive or version.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map(value => {
  const index = value.indexOf('=');
  return [value.slice(0, index).replace(/^--/, ''), value.slice(index + 1)];
}));
if (!args.receipt || !args.out) throw Error('Supply --receipt=<frozen backend archive receipt> and --out=<private archive directory>.');
const receipt = JSON.parse(await readFile(path.resolve(args.receipt), 'utf8'));
const expected = [...receipt.privateArchives, ...(receipt.retainedArchives || [])];
if (receipt.privateArchives.length !== 8 || new Set(expected.map(item => item.archiveKey)).size !== expected.length) throw Error('Invalid frozen archive inventory.');
for (const item of expected) {
  if (!/^templates\/(switchboard|tideglass|matter|nightjar)\/\d+\.\d+\.\d+\/(developer|wordpress)\.zip$/.test(item.archiveKey) || !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.bytes) || item.bytes <= 0) throw Error('Invalid frozen archive identity.');
}
const output = path.resolve(args.out);
const git = (...values) => execFileSync('git', values, { cwd: root, maxBuffer: 8 * 1024 * 1024 });
const head = git('rev-parse', 'HEAD').toString().trim();
const refs = [...new Set([head, ...git('log', '--format=%H', '--all', '--', 'products/templates').toString().trim().split('\n')])];
const pending = new Map(expected.map(item => [item.archiveKey, item]));
const restored = [];
for (const ref of refs) {
  if (!pending.size) break;
  let catalog;
  try { catalog = JSON.parse(git('show', ref + ':products/templates/catalog.json').toString()); } catch { continue; }
  for (const product of catalog.products) for (const edition of product.editions.filter(item => item.sourcePath)) {
    const platform = edition.platform;
    if (!['developer', 'wordpress'].includes(platform)) continue;
    const key = `templates/${product.slug}/${edition.version || '1.0.0'}/${platform}.zip`;
    const item = pending.get(key);
    if (!item) continue;
    if (!edition.sourcePath.startsWith(`products/templates/${product.slug}/`) || edition.sourcePath.includes('..')) throw Error('Unsafe committed package source.');
    const paths = git('ls-tree', '-r', '--name-only', ref, '--', edition.sourcePath).toString().trim().split('\n').filter(Boolean).sort();
    const prefix = platform === 'wordpress' ? product.slug : edition.id;
    const files = paths.map(name => ({ name: prefix + '/' + name.slice(edition.sourcePath.length + 1), data: git('show', ref + ':' + name) }));
    const archive = makeZip(files);
    if (archive.length !== item.bytes || createHash('sha256').update(archive).digest('hex') !== item.sha256) continue;
    const target = path.resolve(output, key);
    if (!target.startsWith(output + path.sep)) throw Error('Unsafe archive destination.');
    let existing;
    try { existing = await readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    verifyExistingArchive(existing, archive, key);
    await mkdir(path.dirname(target), { recursive: true });
    if (!existing) await writeFile(target, archive, { flag: 'wx', mode: 0o600 });
    restored.push({ ...item, sourceSha: ref, verifiedUnchanged: true });
    pending.delete(key);
  }
}
// Nightjar 1.0.2 was frozen during the documented typography correction but its
// transient source was not committed. Reverse that one recorded 1.0.3 patch;
// the frozen ZIP digest, rather than the recipe, remains the acceptance gate.
const transientKey = 'templates/nightjar/1.0.2/developer.zip';
if (pending.has(transientKey)) {
  const ref = '12d664f4526fee12a66979bc6274d3c0f7d3f7bb';
  const source = 'products/templates/nightjar/developer';
  const paths = git('ls-tree', '-r', '--name-only', ref, '--', source).toString().trim().split('\n').sort();
  const files = paths.map(name => ({ name: 'nightjar-developer-v1/' + name.slice(source.length + 1), data: git('show', ref + ':' + name) }));
  for (const file of files) {
    if (file.name.endsWith('/styles.css')) file.data = Buffer.from(file.data.toString().replace('clamp(2.7rem,7vw,7rem)', 'clamp(3rem,7vw,7rem)'));
    if (file.name.endsWith('/INSTALL.md')) file.data = Buffer.from(file.data.toString()
      .replace('Version 1.0.3 uses `clamp(2.7rem,7vw,7rem)`', 'Version 1.0.2 uses `clamp(3rem,7vw,7rem)`')
      .replace('\nThe 1.0.3 minimum also keeps the sample word intact immediately above the phone\nbreakpoint (641px), where the prior 3rem minimum was still too large.\n', ''));
  }
  const manifestFile = files.find(file => file.name.endsWith('/PACKAGE_MANIFEST.json'));
  const manifest = JSON.parse(manifestFile.data.toString());
  manifest.version = '1.0.2';
  for (const item of manifest.files) {
    const bytes = files.find(file => file.name === 'nightjar-developer-v1/' + item.path).data;
    item.bytes = bytes.length; item.sha256 = createHash('sha256').update(bytes).digest('hex');
  }
  manifestFile.data = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
  const archive = makeZip(files), item = pending.get(transientKey);
  if (archive.length === item.bytes && createHash('sha256').update(archive).digest('hex') === item.sha256) {
    const target = path.join(output, transientKey);
    await mkdir(path.dirname(target), { recursive: true });
    let existing;
    try { existing = await readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    verifyExistingArchive(existing, archive, transientKey);
    if (!existing) await writeFile(target, archive, { flag: 'wx', mode: 0o600 });
    restored.push({ ...item, sourceSha: ref, reconstruction: 'Reverse the documented 1.0.3 typography patch; exact historical digest matched.', verifiedUnchanged: true });
    pending.delete(transientKey);
  }
}
if (pending.size) throw Error('Exact historical archive bytes could not be recovered: ' + [...pending.keys()].join(', '));
await writeFile(path.join(output, 'templates-manifest.json'), JSON.stringify({ schemaVersion: 1, siteSourceSha: head, archives: restored }, null, 2) + '\n', { mode: 0o600 });
console.log(JSON.stringify({ currentArchives: receipt.privateArchives.length, retainedArchives: expected.length - receipt.privateArchives.length, allHashesMatch: true, sourceSha: head }));
