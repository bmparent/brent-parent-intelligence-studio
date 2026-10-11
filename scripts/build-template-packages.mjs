import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'products/templates/catalog.json'), 'utf8'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let bit = 0; bit < 8; bit++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
export function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export async function filesBelow(directory) {
  const result = [];
  async function visit(relative) {
    for (const entry of (await fs.readdir(path.join(directory, relative), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) throw new Error(`Symlinks cannot enter a commercial package: ${relative}/${entry.name}`);
      const next = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await visit(next);
      else if (entry.isFile()) result.push(next);
    }
  }
  await visit('');
  return result.sort();
}

/** Deterministic ZIP, UTF-8 filenames, deflate, stable date and ordinary file modes.
 * No external compressor, dependency install, timestamps, credentials, or host paths.
 */
export function makeZip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  // October 10, 2026 00:00:00; changing source bytes changes the content checksum.
  const dosDate = ((2026 - 1980) << 9) | (10 << 5) | 10;
  for (const { name, data } of files) {
    if (!name || name.startsWith('/') || name.split('/').some(part => part === '..' || part === '')) throw new Error(`Unsafe ZIP path: ${name}`);
    const filename = Buffer.from(name, 'utf8');
    const packed = deflateRawSync(data, { level: 9 });
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6); local.writeUInt16LE(8, 8); local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(checksum, 14); local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(filename.length, 26);
    locals.push(local, filename, packed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(0x314, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8); central.writeUInt16LE(8, 10); central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(checksum, 16); central.writeUInt32LE(packed.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(filename.length, 28);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); central.writeUInt32LE(offset, 42);
    centrals.push(central, filename);
    offset += local.length + filename.length + packed.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

async function build() {
  const reports = [];
  for (const product of catalog.products) {
    for (const edition of product.editions.filter(edition => edition.sourcePath)) {
      if (!/^[a-z0-9-]+$/.test(edition.id)) throw new Error(`Invalid edition ID: ${edition.id}`);
      const source = path.resolve(root, edition.sourcePath);
      if (!source.startsWith(path.join(root, 'products/templates') + path.sep)) throw new Error('Source outside products/templates');
      let names = (await filesBelow(source)).filter(name => name !== 'PACKAGE_MANIFEST.json');
      const blocked = names.filter(name => /(^|\/)(\.env(?:\.|$)|node_modules|\.git|credentials)|\.(zip|pem|key|p12|pfx)$/i.test(name));
      if (blocked.length) throw new Error(`Forbidden package files: ${blocked.join(', ')}`);
      const contents = await Promise.all(names.map(async name => ({ name, data: await fs.readFile(path.join(source, name)) })));
      const manifest = {
        schemaVersion: 1, editionId: edition.id, product: product.slug, version: '1.0.0', catalogVersion: catalog.version,
        availability: edition.commercialAvailability, status: edition.status,
        distribution: 'private-fulfillment-package',
        files: contents.map(({ name, data }) => ({ path: name, bytes: data.length, sha256: sha256(data) })),
        license: edition.platform === 'wordpress' ? 'GPL-2.0-or-later' : 'Eidos Works Commercial Template License 1.0',
        integrations: 'No live form server, booking engine, payment processing, ticket inventory, analytics, or proprietary Eidos service included.'
      };
      await fs.writeFile(path.join(source, 'PACKAGE_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
      names = [...names, 'PACKAGE_MANIFEST.json'].sort();
      const prefix = edition.platform === 'wordpress' ? product.slug : edition.id;
      const archiveFiles = await Promise.all(names.map(async name => ({ name: `${prefix}/${name}`, data: await fs.readFile(path.join(source, name)) })));
      const zip = makeZip(archiveFiles);
      const outputRelative = edition.packagePath || `artifacts/templates/packages/${edition.id}.zip`;
      const output = path.resolve(root, outputRelative);
      if (!output.startsWith(path.join(root, 'artifacts/templates/packages') + path.sep)) throw new Error('ZIP must stay in private artifacts/templates/packages');
      await fs.mkdir(path.dirname(output), { recursive: true });
      await fs.writeFile(output, zip);
      if (edition.platform === 'developer') {
        const demo = path.join(root, 'public/template-demos', product.slug);
        for (const name of names) {
          const target = path.join(demo, name);
          await fs.mkdir(path.dirname(target), { recursive: true });
          await fs.copyFile(path.join(source, name), target);
        }
      }
      reports.push({ editionId: edition.id, sourcePath: edition.sourcePath, packagePath: outputRelative, sha256: sha256(zip), bytes: zip.length, files: names.length, demoPath: edition.platform === 'developer' ? `/template-demos/${product.slug}/` : null });
    }
  }
  await fs.mkdir(path.join(root, 'artifacts/templates'), { recursive: true });
  await fs.writeFile(path.join(root, 'artifacts/templates/package-report.json'), JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), catalogVersion: catalog.version, packages: reports }, null, 2) + '\n');
  console.log(`Built ${reports.length} private template packages. Published four byte-identical source demos. No ZIP copied to public/.`);
}

// Exports are used by package integrity tests, which must not rebuild as a side effect.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
