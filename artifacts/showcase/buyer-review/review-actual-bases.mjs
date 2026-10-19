// Run from the repository root. Reads original candidate archives in memory only.
// Writes hashes, counts and review outcomes; never writes paid source or derivatives.
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { createConfiguration, validateConfiguration } from '../../../src/templates/configurator.ts';
import { buyerFamilies } from '../../../src/templates/buyerContract.ts';
import { buildBuyerDerivative, buyerDerivativePreview, buyerVerificationMetadata, sha256, verifyBuyerArchive } from '../../../src/templates/buyerDerivative.ts';

const root = process.cwd();
const output = 'artifacts/showcase/buyer-review/actual-base-subsets.json';
const command = 'node --import tsx artifacts/showcase/buyer-review/review-actual-bases.mjs';
const release = JSON.parse(await readFile('products/templates/release-manifest.json', 'utf8'));
const decode = bytes => new TextDecoder().decode(bytes);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
const paths = ['src/templates/buyerDerivative.ts', 'src/components/BuyerTemplateDerivative.tsx', 'src/templates/buyerContract.ts', 'src/templates/configurator.ts', 'src/playground/export.ts', 'src/data/buyerArchivePins.json', 'products/templates/release-manifest.json', 'artifacts/showcase/buyer-review/review-actual-bases.mjs'];
const moduleHashes = await Promise.all(paths.map(async path => ({ path, sha256: await sha256(new Uint8Array(await readFile(path))) })));
const receipt = {
  schemaVersion: 1,
  timestampUtc: new Date().toISOString(),
  command,
  repoRoot: root,
  git: { head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current'), sourceBasis: 'Working source module hashes below; concurrent uncommitted implementation may differ from HEAD.' },
  environment: { node: process.version, platform: process.platform, architecture: process.arch, osRelease: os.release(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  scope: 'Actual pinned developer candidate archives, every Home-required page subset, all optional native modules disabled, motion disabled. In-memory static output and preview dependency audit only.',
  privacy: 'Only hashes, counts and filenames are written. No archive, paid source, derivative output, credentials or customer data are saved.',
  moduleHashes,
  families: [],
  variants: [],
  failures: [],
  limits: ['Static reference and exact-byte preservation checks do not establish browser behavior, physical-device acceptance, hosting acceptance, email delivery, entitlement or commercial release.', 'Browser race and preview/export navigation parity regressions are recorded separately by the browser QA agent.', 'This receipt does not change immutable archives, fulfillment records, licensing or release gates.'],
};
let referenceCount = 0, previewCount = 0, disabledControlCount = 0;
for (const family of Object.keys(buyerFamilies)) {
  const contract = buyerFamilies[family];
  const edition = release.products.find(product => product.slug === family).editions.find(edition => edition.platform === 'developer');
  const archive = new Uint8Array(await readFile(edition.package.path));
  const originalArchiveHash = await sha256(archive);
  const seed = createConfiguration(family);
  const base = await verifyBuyerArchive(archive, buyerVerificationMetadata(seed), seed);
  const preserved = await Promise.all(['LICENSE.txt', 'SUPPORT.md', 'ASSETS.md', 'INSTALL.md', 'script.js'].map(async name => ({ name, originalSha256: await sha256(base.files.find(file => file.name === name).data), preservedSha256: null })));
  const familyResult = { family, editionId: edition.id, version: edition.version, baseArchive: { sha256: originalArchiveHash, bytes: archive.length, matchesFrozenPin: originalArchiveHash === edition.package.sha256 && archive.length === edition.package.bytes }, sourceFiles: base.files.length, preserved, variantCount: 0, allVariantsPreserveNoticesAndScript: true, originalArchiveUnchanged: null };
  for (let mask = 0; mask < (1 << (contract.pages.length - 1)); mask++) {
    const pages = contract.pages.filter((page, index) => index === 0 || (mask & (1 << (index - 1)))).map(page => page.file);
    const config = validateConfiguration({ ...seed, name: 'Independent review studio', headline: 'A precise independent review.', description: 'Static evidence audit of actual family files.', contactEmail: 'review@example.com', buyer: { ...seed.buyer, pages, modules: [], motion: false } });
    const result = await buildBuyerDerivative(base, config);
    const files = new Map(result.files.map(file => [file.name, file]));
    const failures = [], references = [];
    const inspect = (source, value, href = false) => {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) return;
      const [pathWithQuery, hash = ''] = value.split('#');
      const path = pathWithQuery.split('?')[0].replace(/^\.\//, '') || source;
      references.push({ source, target: path });
      if (!files.has(path)) failures.push({ source, kind: 'missing-local-file', target: path });
      else if (href && hash && path.endsWith('.html')) {
        let target; try { target = decodeURIComponent(hash); } catch { target = hash; }
        const ids = [...decode(files.get(path).data).matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
        if (!ids.includes(target)) failures.push({ source, kind: 'missing-fragment-target', target: `${path}#${hash}` });
      }
    };
    for (const file of result.files) {
      if (file.name.endsWith('.html')) {
        const html = decode(file.data);
        for (const match of html.matchAll(/\b(href|src)=["']([^"']+)["']/g)) inspect(file.name, match[2], match[1] === 'href');
        for (const module of contract.modules) for (const attribute of module.attributes) {
          disabledControlCount += 1;
          if (new RegExp(`<button\\b(?=[^>]*\\b${attribute}(?:[=\\s>]))`, 'i').test(html)) failures.push({ source: file.name, kind: 'disabled-module-control-remains', attribute });
        }
        // Raises if CSS, scripts, images or inlined CSS URL assets are absent.
        buyerDerivativePreview(result, file.name); previewCount += 1;
      }
      if (file.name.endsWith('.css')) for (const match of decode(file.data).matchAll(/url\((['"]?)([^'")]+)\1\)/g)) if (!match[2].startsWith('#')) inspect(file.name, match[2]);
    }
    for (const record of preserved) {
      const hash = await sha256(files.get(record.name).data);
      record.preservedSha256 ??= hash;
      if (hash !== record.originalSha256) { familyResult.allVariantsPreserveNoticesAndScript = false; failures.push({ source: record.name, kind: 'preserved-byte-mismatch' }); }
    }
    const baseManifest = await sha256(base.files.find(file => file.name === 'PACKAGE_MANIFEST.json').data);
    if (await sha256(files.get('BASE_PACKAGE_MANIFEST.json').data) !== baseManifest) failures.push({ source: 'BASE_PACKAGE_MANIFEST.json', kind: 'original-manifest-mismatch' });
    referenceCount += references.length;
    familyResult.variantCount += 1;
    receipt.variants.push({ family, mask, pages, fileCount: files.size, localReferencesChecked: references.length, derivativeId: result.id, derivativeArchiveSha256: result.archiveHash, failures });
    receipt.failures.push(...failures.map(failure => ({ family, mask, ...failure })));
  }
  familyResult.originalArchiveUnchanged = await sha256(archive) === originalArchiveHash;
  receipt.families.push(familyResult);
}
receipt.summary = { status: receipt.failures.length ? 'failed' : 'passed', families: receipt.families.length, variants: receipt.variants.length, localReferencesChecked: referenceCount, previewPagesGeneratedInMemory: previewCount, disabledModuleChecks: disabledControlCount, missingReferences: receipt.failures.filter(failure => failure.kind.startsWith('missing-')), failureCount: receipt.failures.length, rawPaidFilesSaved: 0 };
await writeFile(output, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ receipt: output, ...receipt.summary }, null, 2));
if (receipt.failures.length) process.exitCode = 1;
