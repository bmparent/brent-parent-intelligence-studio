import { readFile, writeFile, mkdir } from 'node:fs/promises';

const catalog = JSON.parse(await readFile('products/templates/catalog.json', 'utf8'));
const packages = JSON.parse(await readFile('artifacts/templates/package-report.json', 'utf8')).packages;
let wordpressEvidence = null;
try { wordpressEvidence = JSON.parse(await readFile('artifacts/templates/wordpress-install-external/browser-ui-receipt.json', 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const guides = [];
const contents = [];
for (const product of catalog.products) {
  for (const edition of product.editions.filter((e) => e.sourcePath)) {
    guides.push({ slug: product.slug, name: product.name, platform: edition.platform, editionId: edition.id, path: `/templates/guides/${product.slug}/${edition.platform}/`, markdown: await readFile(`${edition.sourcePath}/INSTALL.md`, 'utf8') });
    const manifest = JSON.parse(await readFile(`${edition.sourcePath}/PACKAGE_MANIFEST.json`, 'utf8'));
    const archive = packages.find(item => item.editionId === edition.id && item.version === (edition.version || '1.0.0'));
    if (!archive) throw new Error(`Current package receipt missing for ${edition.id}`);
    const files = [...manifest.files.map(item => item.path), 'PACKAGE_MANIFEST.json'].sort();
    const observed = wordpressEvidence?.themes?.find(item => item.product === product.slug && item.archive_sha256 === archive.sha256);
    contents.push({ editionId: edition.id, version: archive.version,
      guidePath: `/templates/guides/${product.slug}/${edition.platform}/`, files,
      originalArt: files.filter(name => name.startsWith('assets/')),
      wordpressEvidence: edition.platform === 'wordpress' ? {
        exactCurrentZipActivation: observed?.checks?.final_exact_zip_activation === 'passed' && observed?.installed_header?.version === archive.version,
        nativeApiGate: observed?.native_api_gate === 'passed' && wordpressEvidence?.native_api_gate === 'passed',
        wordpress: wordpressEvidence?.wordpress ?? null, php: wordpressEvidence?.php ?? null,
        database: wordpressEvidence?.database?.native ? `${wordpressEvidence.database.engine} ${wordpressEvidence.database.version}` : null,
        scope: observed ? wordpressEvidence.scope : 'Historical browser-sandbox evidence; not current-version acceptance',
      } : null });
  }
}
await mkdir('src/data', { recursive: true });
await writeFile('src/data/templateGuides.json', JSON.stringify(guides, null, 2) + '\n');
await writeFile('src/data/templatePackageContents.json', JSON.stringify(contents, null, 2) + '\n');
console.log(`Generated ${guides.length} public installation guides and exact package-content summaries.`);
