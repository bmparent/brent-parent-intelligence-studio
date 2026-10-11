import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const MIRROR_RESERVE_BYTES = 64 * 1024 * 1024;
const manifestPath = 'products/templates/release-manifest.json';
const proofPaths = [
  'artifacts/templates/package-report.json', 'artifacts/templates/package-tests.json',
  'artifacts/templates/package-tests.md', 'artifacts/templates/source-install-receipt.json',
  'artifacts/templates/varied-content-performance.json', 'artifacts/templates/varied-content-performance.md',
  'artifacts/templates/real-photo-content-receipt.json',
  'docs/paid-templates/platform-install-evidence.json', 'docs/paid-templates/product-operations.md',
  'docs/paid-templates/ACCEPTANCE.md', 'docs/paid-templates/security-review.md',
  'artifacts/templates/version-transition-receipt.json', 'artifacts/templates/generator-parity.json',
  'artifacts/templates/wordpress-browser/baseline-native-ui-receipt.json',
  'artifacts/templates/wordpress-browser/installation-receipt.json',
  'artifacts/templates/wordpress-browser/final-metadata-receipt.json',
  'artifacts/templates/wordpress-install-external/browser-ui-receipt.json',
  'artifacts/templates/ci-status.json', 'artifacts/templates/ci-provider-status.json',
];
const evidencePaths = [
  'artifacts/templates/package-tests.json', 'artifacts/templates/source-install-receipt.json',
  'artifacts/templates/varied-content-performance.json', 'artifacts/templates/real-photo-content-receipt.json',
  'docs/paid-templates/platform-install-evidence.json',
  'artifacts/templates/wordpress-install-external/browser-ui-receipt.json',
  'artifacts/templates/platform-pilots/browser-receipt.json',
  'artifacts/templates/wordpress-browser/baseline-native-ui-receipt.json',
  'artifacts/templates/wordpress-browser/installation-receipt.json',
  'artifacts/templates/wordpress-browser/final-metadata-receipt.json',
  'artifacts/templates/version-transition-receipt.json', 'artifacts/templates/generator-parity.json',
];

function localPath(root, relative) {
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(path.resolve(root) + path.sep)) throw new Error(`Path outside repository: ${relative}`);
  return resolved;
}
async function readJson(root, relative, optional = false) {
  try { return JSON.parse(await fs.readFile(localPath(root, relative), 'utf8')); }
  catch (error) { if (optional && error.code === 'ENOENT') return null; throw error; }
}
async function record(root, relative) {
  const data = await fs.readFile(localPath(root, relative));
  return { path: relative, bytes: data.length, sha256: sha256(data) };
}
export function validatePackage(bytes, expected, frozen) {
  const actual = { sha256: sha256(bytes), bytes: bytes.length };
  if (actual.sha256 !== expected.sha256 || actual.bytes !== expected.bytes) throw new Error(`Package receipt mismatch: ${expected.editionId}`);
  if (frozen && (actual.sha256 !== frozen.sha256 || actual.bytes !== frozen.bytes)) throw new Error(`Frozen package changed for existing version: ${expected.editionId}`);
  return actual;
}
export function mirrorCapacity(payloadBytes, freeBytes, reserveBytes = MIRROR_RESERVE_BYTES) {
  return { payload_bytes: payloadBytes, free_bytes: freeBytes, reserve_bytes: reserveBytes,
    required_free_bytes: payloadBytes + reserveBytes,
    sufficient: Number.isSafeInteger(freeBytes) && freeBytes >= payloadBytes + reserveBytes };
}

/** Reads frozen buyer archives; never writes product source or ZIPs. */
export async function createReleaseManifest(root) {
  const catalog = await readJson(root, 'products/templates/catalog.json');
  const report = await readJson(root, 'artifacts/templates/package-report.json');
  const previous = await readJson(root, manifestPath, true);
  const sourceReceipt = await readJson(root, 'artifacts/templates/source-install-receipt.json', true);
  const wpReceipt = await readJson(root, 'artifacts/templates/wordpress-install-external/browser-ui-receipt.json', true);
  const platformReceipt = await readJson(root, 'docs/paid-templates/platform-install-evidence.json', true);
  if (report.catalogVersion !== catalog.version) throw new Error('Catalog/package receipt version mismatch');
  const evidence = [];
  for (const relative of evidencePaths) {
    const receipt = await readJson(root, relative, true);
    evidence.push(receipt ? { ...await record(root, relative), status: receipt.result ?? receipt.status ?? 'see-receipt',
      scope: receipt.scope ?? 'Read the referenced receipt for exact scope and limitations.' } : { path: relative, status: 'missing' });
  }
  const products = [], packages = [];
  for (const product of catalog.products) {
    for (const field of ['market', 'visualStyle', 'tagline']) if (!product[field]) throw new Error(`Missing ${field}: ${product.slug}`);
    if (!product.designDirection?.artCaption) throw new Error(`Missing design direction: ${product.slug}`);
    const editions = [];
    for (const edition of product.editions) {
      const published = { id: edition.id, platform: edition.platform, kind: edition.kind, status: edition.status,
        releaseStatus: 'unavailable', commercialAvailability: edition.commercialAvailability,
        draftPriceCents: edition.draftPriceCents, currency: edition.currency,
        priceIds: null, priceIdsReason: 'Provider price IDs and charged amounts belong to the server-owned commerce contract. Public draft prices are not payment authority.',
        version: edition.sourcePath ? edition.version || '1.0.0' : null, package: null,
        compatibility: { acceptance: 'unverified', reason: 'No accepted hosted builder installation. Local pilots are separate evidence.', pilotPath: edition.pilotPath ?? null } };
      if (edition.commercialAvailability !== 'unavailable') throw new Error(`This candidate helper cannot enable sales: ${edition.id}`);
      if (edition.sourcePath) {
        const expected = report.packages.find(item => item.editionId === edition.id);
        if (!expected || expected.packagePath !== edition.packagePath || expected.version !== published.version) throw new Error(`Missing archive receipt: ${edition.id}`);
        const frozen = previous?.packages.find(item => item.editionId === edition.id && item.version === published.version);
        const actual = validatePackage(await fs.readFile(localPath(root, edition.packagePath)), expected, frozen);
        const fileManifest = await readJson(root, `${edition.sourcePath}/PACKAGE_MANIFEST.json`);
        if (fileManifest.editionId !== edition.id || fileManifest.version !== published.version) throw new Error(`Source manifest identity mismatch: ${edition.id}`);
        const documented = fileManifest.files.filter(file => /^(LICENSE\.txt|COPYING|SUPPORT\.md|ASSETS\.md|INSTALL\.md)$/.test(file.path) || file.path.startsWith('assets/'));
        const documents = [];
        for (const file of documented) {
          const doc = await record(root, `${edition.sourcePath}/${file.path}`);
          if (doc.sha256 !== file.sha256 || doc.bytes !== file.bytes) throw new Error(`Packaged documentation changed: ${doc.path}`);
          documents.push(doc);
        }
        const archive = { editionId: edition.id, product: product.slug, platform: edition.platform, version: published.version,
          path: edition.packagePath, ...actual, sourceManifest: await record(root, `${edition.sourcePath}/PACKAGE_MANIFEST.json`),
          distribution: 'private-fulfillment-only', releaseStatus: 'unavailable',
          license: { identifier: edition.platform === 'wordpress' ? 'GPL-2.0-or-later' : 'Eidos-one-finished-website',
            rights: edition.platform === 'wordpress' ? 'GPL rights are unrestricted by the developer one-site commercial terms.' : 'One finished commercial website; see included license for transfer and resale boundaries.' },
          support: { status: 'draft', installationGuidanceDays: 30, suppliedFileDefectDays: 90, responseTimeSla: null },
          documentationAndAssets: documents,
          changelog: [
            ...(edition.platform === 'wordpress' && published.version === '1.0.1' ? [{ version: '1.0.1', status: 'candidate', description: 'Theme identity metadata: explicit Update URI prevents WordPress.org same-slug update confusion. Header, stylesheet cache version, and install filename/version documentation only; no automatic updater is supplied.' }] : []),
            ...(edition.platform === 'developer' && product.slug === 'nightjar' && published.version === '1.0.1' ? [{ version: '1.0.1', status: 'candidate', description: 'Night mode uses the fixed contrasting palette above configured day tokens; day palette customization remains available. CSS precedence and corresponding editing guidance only.' }] : []),
            { version: '1.0.0', status: 'candidate', description: 'Initial portable source/native-block-theme candidate; not a record of a commercial release.' },
          ] };
        packages.push(archive);
        published.package = { path: archive.path, sha256: archive.sha256, bytes: archive.bytes };
        if (edition.platform === 'developer') {
          const check = sourceReceipt?.checks.find(item => item.editionId === edition.id && item.archiveSha256 === actual.sha256);
          published.compatibility = { acceptance: check?.install === 'passed' ? 'local-source-install-passed' : 'unverified',
            scope: 'Local HTTP installation, copy/image edits, and email draft preparation. No remote host or sent email acceptance.',
            evidence: 'artifacts/templates/source-install-receipt.json', browserEvidence: 'artifacts/templates/varied-content-performance.json' };
        } else {
          const check = wpReceipt?.themes?.find(item => item.product === product.slug && item.archive_sha256 === actual.sha256);
          published.compatibility = { acceptance: 'incomplete', declaredMinimums: { wordpress: '6.6', php: '8.1' },
            actualTestedVersions: { wordpress: wpReceipt?.wordpress ?? null, php: wpReceipt?.php ?? null },
            browserPlaygroundChecks: check?.checks ?? null, browserPlaygroundStatus: check?.status ?? 'not_run',
            browserPlaygroundScope: wpReceipt?.scope ?? null,
            installedThemeMetadata: check?.installed_header ?? null,
            baselineNativeContentProof: check?.baseline_native_checks ?? null,
            baselineNativeContentReuse: check?.baseline_native_content_ui_reuse ?? null,
            cliStatus: platformReceipt?.wordpress?.local_cli_outcome?.status ?? 'missing',
            evidence: ['docs/paid-templates/platform-install-evidence.json', 'artifacts/templates/wordpress-install-external/browser-ui-receipt.json'],
            limits: 'Final-byte install/activation/header checks and unchanged baseline native-content editing proof have separate archive hashes and scope. Native PHP/MySQL hosting, minimum versions, four separate clean sites, restart persistence and WordPress.com plans remain unverified. Contact href only; no message sent. No general compatibility claim.' };
        }
      }
      editions.push(published);
    }
    products.push({ slug: product.slug, name: product.name, market: product.market, visualStyle: product.visualStyle,
      tagline: product.tagline, designDirection: product.designDirection, pages: product.pages, editions });
  }
  if (packages.length !== 8 || report.packages.length !== 8) throw new Error('Expected exactly eight frozen private archives');
  return { schemaVersion: 1, catalogVersion: catalog.version, releaseStatus: 'unavailable', saleEnabled: false,
    catalog: await record(root, 'products/templates/catalog.json'),
    generation: { command: 'node scripts/build-template-release-manifest.mjs', packageRebuild: 'npm run templates:build',
      rule: 'This helper reads frozen archives. An existing edition/version checksum may not change. Release evidence never enables commerce automatically.' },
    priceIds: null, priceIdsReason: 'Intentionally omitted: backend owns provider IDs, mode, availability, and price validation.',
    products, packages, compatibilityEvidence: evidence };
}

export async function mirrorRelease(root, manifest, env = process.env) {
  const timestamp = new Date().toISOString();
  const result = { timestamp_utc: timestamp, drive_copy_attempted: false, drive_copy_success: false,
    drive_root: null, drive_run_dir: null, reason: '', files_considered: [], files_copied: [], files_skipped: [],
    cloud_sync_confirmed: false, cloud_sync_note: 'A verified mounted-folder copy does not establish remote cloud synchronization.' };
  const paths = [...new Set([...manifest.packages.map(item => item.path), manifestPath, ...proofPaths])];
  for (const relative of paths) {
    try {
      const file = await record(root, relative);
      if (!relative.endsWith('.zip') && file.bytes > 512 * 1024) result.files_skipped.push({ path: relative, reason: 'Proof document exceeds 512 KiB mirror bound' });
      else result.files_considered.push(file);
    } catch (error) { if (error.code === 'ENOENT') result.files_skipped.push({ path: relative, reason: 'Optional proof document not present' }); else throw error; }
  }
  const payload = result.files_considered.reduce((total, file) => total + file.bytes, 0);
  const configured = ['EIDOS_PROOF_DRIVE_DIR', 'EIDOS_ARTIFACT_ROOT'].filter(key => env[key]);
  const previousFailure = await readJson(root, 'artifacts/templates/drive_manifest-initial-enospc.json', true);
  const candidates = [];
  for (const key of configured) {
    const destination = path.resolve(env[key]);
    try {
      const stats = await fs.statfs(destination);
      const capacity = mirrorCapacity(payload, Number(stats.bavail) * Number(stats.bsize));
      candidates.push({ variable: key, root: destination, ...capacity });
      if (previousFailure?.drive_root === destination && previousFailure.drive_copy_attempted && !previousFailure.drive_copy_success) {
        candidates.at(-1).reason = 'Previous mounted copy failed ENOSPC; no automatic retry. See artifacts/templates/drive_manifest-initial-enospc.json.';
        continue;
      }
      if (!capacity.sufficient) continue;
      const run = path.join(destination, 'Eidos_Works_Paid_Templates', timestamp.slice(0, 10), `${manifest.catalogVersion}-${sha256(JSON.stringify(manifest)).slice(0, 12)}`);
      result.drive_root = destination; result.drive_run_dir = run;
      await fs.mkdir(run, { recursive: true });
      result.drive_copy_attempted = true;
      for (const file of result.files_considered) {
        try {
          const source = localPath(root, file.path), target = localPath(run, file.path);
          await fs.mkdir(path.dirname(target), { recursive: true });
          let existing;
          try { existing = await fs.readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
          if (existing && sha256(existing) !== file.sha256) throw new Error('Existing mirror bytes differ; refusing overwrite');
          if (!existing) await fs.copyFile(source, target);
          if (sha256(await fs.readFile(target)) !== file.sha256) throw new Error('Destination checksum mismatch');
          result.files_copied.push(file);
        } catch (error) {
          result.files_skipped.push({ path: file.path, reason: error.message });
          for (const pending of result.files_considered.slice(result.files_copied.length + 1)) result.files_skipped.push({ path: pending.path, reason: 'Copy stopped after first destination failure; repo original retained.' });
          break;
        }
      }
      result.drive_copy_success = result.files_copied.length === result.files_considered.length;
      result.reason = result.drive_copy_success ? 'Mounted destination copies checksum-verified; remote cloud sync unconfirmed.' : 'Some mounted destination copies failed; original repo artifacts remain authoritative.';
      break;
    } catch (error) { candidates.push({ variable: key, root: destination, sufficient: false, reason: error.message }); }
  }
  result.destinations_checked = candidates;
  if (!result.drive_copy_attempted) {
    result.drive_root = candidates[0]?.root ?? null;
    result.reason = configured.length ? 'Configured destinations unavailable, below payload plus 64 MiB reserve, or blocked by the preserved earlier copy failure. No mirror files copied.' : 'EIDOS_PROOF_DRIVE_DIR and EIDOS_ARTIFACT_ROOT are not configured. No mirror files copied.';
    for (const file of result.files_considered) result.files_skipped.push({ path: file.path, reason: result.reason });
  }
  return result;
}

export async function buildReleaseManifest(root) {
  const manifest = await createReleaseManifest(root);
  const text = JSON.stringify(manifest, null, 2) + '\n';
  await fs.writeFile(localPath(root, manifestPath), text);
  await fs.writeFile(localPath(root, 'artifacts/templates/release-manifest.json'), text);
  const drive = await mirrorRelease(root, manifest);
  await fs.writeFile(localPath(root, 'artifacts/templates/drive_manifest.json'), JSON.stringify(drive, null, 2) + '\n');
  console.log(`Release manifest: ${manifest.products.length} products, ${manifest.packages.length} frozen archives; commerce unavailable. Drive: ${drive.reason}`);
  return { manifest, drive };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildReleaseManifest(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
}
