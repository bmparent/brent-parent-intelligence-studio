import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { crc32, filesBelow, verifyExistingArchive } from './build-template-packages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'products/templates/catalog.json'), 'utf8'));
const report = { schemaVersion: 1, generatedAt: new Date().toISOString(), checks: [], failures: [], limitations: ['Static structure and archive checks do not establish WordPress activation/editing, real device behavior, live checkout, or platform-builder acceptance. See separate clean-install/browser receipts.'] };
const sha256 = data => createHash('sha256').update(data).digest('hex');
function check(name, fn) {
  try { fn(); report.checks.push({ name, status: 'passed' }); }
  catch (error) { report.failures.push({ name, reason: error.message }); }
}
function unzip(data) {
  const files = new Map();
  let offset = 0;
  while (data.readUInt32LE(offset) === 0x04034b50) {
    const compression = data.readUInt16LE(offset + 8), checksum = data.readUInt32LE(offset + 14);
    const size = data.readUInt32LE(offset + 18), rawSize = data.readUInt32LE(offset + 22);
    const nameLength = data.readUInt16LE(offset + 26), extra = data.readUInt16LE(offset + 28);
    const name = data.subarray(offset + 30, offset + 30 + nameLength).toString('utf8');
    assert(!name.startsWith('/') && !name.split('/').includes('..'), `unsafe ZIP member ${name}`);
    assert(!files.has(name), `duplicate ZIP member ${name}`);
    const start = offset + 30 + nameLength + extra;
    const raw = compression === 8 ? inflateRawSync(data.subarray(start, start + size)) : data.subarray(start, start + size);
    assert.equal(raw.length, rawSize, `${name} raw length`); assert.equal(crc32(raw), checksum, `${name} CRC`);
    files.set(name, raw); offset = start + size;
  }
  assert.equal(data.readUInt32LE(offset), 0x02014b50, 'ZIP central directory required');
  return files;
}

check('catalog: four distinct families, unique edition IDs, unavailable until accepted', () => {
  assert.equal(catalog.products.length, 4);
  const ids = catalog.products.flatMap(p => p.editions.map(e => e.id)); assert.equal(new Set(ids).size, ids.length);
  for (const p of catalog.products) { assert.equal(p.pages.length, 5); assert(p.editions.some(e => e.platform === 'developer')); assert(p.editions.some(e => e.platform === 'wordpress')); }
  for (const edition of catalog.products.flatMap(p => p.editions)) { assert.equal(edition.commercialAvailability, 'unavailable'); assert(Number.isInteger(edition.draftPriceCents) && edition.draftPriceCents > 0); }
});
const allHtmlHashes = [];
for (const product of catalog.products) {
  for (const edition of product.editions.filter(e => e.sourcePath)) {
    const source = path.join(root, edition.sourcePath);
    const names = await filesBelow(source);
    const manifest = JSON.parse(await fs.readFile(path.join(source, 'PACKAGE_MANIFEST.json'), 'utf8'));
    const archive = unzip(await fs.readFile(path.join(root, edition.packagePath || `artifacts/templates/packages/${edition.id}.zip`)));
    const prefix = edition.platform === 'wordpress' ? product.slug : edition.id;
    check(`${edition.id}: ZIP bytes equal reviewed source; manifest hashes complete`, () => {
      assert.equal(manifest.editionId, edition.id); assert.equal(archive.size, names.length);
      assert.equal(manifest.version, edition.version || '1.0.0');
      assert.deepEqual(manifest.files.map(f => f.path).sort(), names.filter(n => n !== 'PACKAGE_MANIFEST.json').sort());
    });
    for (const name of names) {
      const bytes = await fs.readFile(path.join(source, name));
      check(`${edition.id}: ${name} integrity`, () => {
        assert.deepEqual(archive.get(`${prefix}/${name}`), bytes);
        if (name !== 'PACKAGE_MANIFEST.json') { const entry = manifest.files.find(f => f.path === name); assert.equal(entry.sha256, sha256(bytes)); assert.equal(entry.bytes, bytes.length); }
      });
      if (edition.platform === 'developer') {
        check(`${edition.id}: ${name} demo parity`, () => {});
        try { assert.deepEqual(await fs.readFile(path.join(root,'public/template-demos',product.slug,name)),bytes); }
        catch(error) { report.failures.push({name:`${edition.id}: ${name} demo parity`,reason:error.message}); }
      }
    }
    if (edition.platform === 'wordpress') {
      const css = await fs.readFile(path.join(source,'style.css'),'utf8'), theme = JSON.parse(await fs.readFile(path.join(source,'theme.json'),'utf8'));
      check(`${edition.id}: native block theme structure and GPL`, () => {
        assert.match(css,/Theme Name:/); assert.match(css,/License: GNU General Public License/); assert.equal(theme.version,3);
        assert.match(css, /^Version: 1\.0\.1$/m);
        assert(css.includes(`Update URI: https://eidos-works.com/shop/templates/${product.slug}/`));
        for (const file of ['templates/index.html','templates/front-page.html','parts/header.html','parts/footer.html','COPYING','demo-content.xml','INSTALL.md']) assert(names.includes(file),`missing ${file}`);
        assert.equal(names.filter(n => n.startsWith('patterns/')).length,5);
      });
      for (const name of names.filter(n => /^(templates|parts|patterns)\//.test(n))) {
        const text = await fs.readFile(path.join(source,name),'utf8');
        check(`${edition.id}: ${name} native block editing`, () => { assert.match(text,/<!-- wp:/); assert(!/<!-- wp:html|<iframe/i.test(text),'whole-page HTML/iframe is not native editing'); });
      }
      continue;
    }
    if (edition.platform !== 'developer') continue;
    const htmlNames = names.filter(n => n.endsWith('.html'));
    check(`${edition.id}: five designed pages plus legal page`, () => assert.equal(htmlNames.length,6));
    for (const name of htmlNames) {
      const html = await fs.readFile(path.join(source,name),'utf8'); allHtmlHashes.push(sha256(html));
      check(`${edition.id}: ${name} semantics and static fallback`, () => {
        assert.match(html,/<html lang="en">/); assert.match(html,/<meta name="viewport"/); assert.match(html,/class="skip-link"/); assert.match(html,/<main id="main">/);
        assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,'one H1'); assert.match(html,/<nav[^>]*aria-label="Main navigation"/);
        for (const property of ['og:title','og:description','og:type','og:image','og:image:alt']) assert(html.includes(`property="${property}"`),`missing ${property}`);
        const socialImage = html.match(/property="og:image" content="([^"]+)"/)[1]; assert(names.includes(socialImage),'original social illustration exists');
        const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
        assert.equal(schema['@type'],'WebPage'); assert.equal(schema.inLanguage,'en'); assert(!schema.url && !schema.offers && !schema.aggregateRating,'no invented canonical or commerce claim');
        assert.match(html,/Before publication set your real canonical URL/);
        assert(!/<script[^>]+src="https?:|<iframe|\son\w+\s*=/i.test(html),'no remote scripts, iframe, or inline handler');
        for (const img of html.matchAll(/<img\b[^>]*>/g)) assert.match(img[0],/\balt="[^"]+"/,'image alt required');
        assert.match(html,/Fictional demonstration content/);
      });
      for (const ref of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (/^(mailto:|tel:|https?:|#)/.test(ref[1])) continue;
        const local = ref[1].split(/[?#]/)[0];
        check(`${edition.id}: ${name} → ${local}`, () => assert(names.includes(local),`broken local resource ${local}`));
      }
      for (const ref of html.matchAll(/href="([^"?#]+\.html)#([^"]+)"/g)) {
        const target = await fs.readFile(path.join(source,ref[1]),'utf8');
        check(`${edition.id}: ${name} anchor ${ref[2]}`, () => assert(target.includes(`id="${ref[2]}"`),`missing anchor ${ref[2]}`));
      }
    }
    const css = await fs.readFile(path.join(source,'styles.css'),'utf8');
    const js = await fs.readFile(path.join(source,'script.js'),'utf8');
    check(`${edition.id}: responsive, reduced motion, focus, progressive JS`, () => {
      assert.match(css,/@media\(max-width:640px\)/); assert.match(css,/prefers-reduced-motion/); assert.match(css,/:focus-visible/); assert.match(css,/min-height:44px/);
      assert.match(css,/\.enhancement\{display:none\}/); assert.match(css,/\.js-ready \.enhancement/);
      assert.match(js,/aria-pressed/); assert.match(js,/aria-expanded/); new vm.Script(js);
    });
  }
}
check('Existing archive mutation is rejected before any ZIP write', () => {
  const frozen = Buffer.from('frozen version bytes');
  assert.doesNotThrow(() => verifyExistingArchive(frozen, Buffer.from(frozen), 'version.zip'));
  assert.doesNotThrow(() => verifyExistingArchive(undefined, frozen, 'new-version.zip'));
  assert.throws(() => verifyExistingArchive(frozen, Buffer.from('changed bytes'), 'version.zip'), /Immutable archive already exists/);
});
check('Every static page has distinct content',()=>assert.equal(new Set(allHtmlHashes).size,allHtmlHashes.length));
const publicFiles = await filesBelow(path.join(root,'public/template-demos'));
check('No public downloadable ZIP, credential, or third-party bundle',()=>assert(!publicFiles.some(n => /\.(zip|pem|key|pfx|p12)$|(^|\/)\.env/.test(n))));
report.status = report.failures.length ? 'failed' : 'passed';
report.passed = report.checks.length; report.failed = report.failures.length;
await fs.mkdir(path.join(root,'artifacts/templates'),{recursive:true});
await fs.writeFile(path.join(root,'artifacts/templates/package-tests.json'),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(path.join(root,'artifacts/templates/package-tests.md'),`# Template package verification\n\nStatus: ${report.status}\n\n${report.passed} checks passed; ${report.failed} failed.\n\nChecked catalog safety, ZIP integrity and source hashes, demo byte parity, real linked pages, local resources/anchors, static fallback, native core-block theme structure, and GPL files.\n\n${report.failures.map(f => `- ${f.name}: ${f.reason}`).join('\n')}\n\nLimits: ${report.limitations.join(' ')}\n`);
console.log(`${report.status.toUpperCase()}: ${report.passed} package checks passed; ${report.failed} failed. See artifacts/templates/package-tests.json.`);
if (report.failures.length) process.exitCode=1;
