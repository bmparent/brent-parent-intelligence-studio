import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { configurationFiles, createConfiguration, moduleOptions, pageOptions, validateConfiguration } from '../src/templates/configurator';
import { templateProducts } from '../src/data/templateCatalog';
// The existing deterministic package writer is shared; no commercial build runs.
import { makeZip } from './build-template-packages.mjs';

const output = resolve('artifacts/showcase/template-configurator');
await mkdir(output, { recursive: true });
const receipts = [];
for (const family of templateProducts) {
  for (const tier of ['essential', 'expressive'] as const) {
    const config = validateConfiguration({ ...createConfiguration(family.slug), tier, pages: pageOptions.map(page => page.id), modules: tier === 'expressive' ? moduleOptions.map(module => module.id) : [] });
    const files = configurationFiles(config);
    const id = `${family.slug}-${tier}-sample`;
    const directory = resolve(output, id);
    for (const file of files) {
      const target = resolve(directory, file.name);
      await mkdir(resolve(target, '..'), { recursive: true });
      await writeFile(target, file.data);
    }
    const bytes = makeZip(files.map(file => ({ name: `${id}/${file.name}`, data: Buffer.from(file.data) })));
    await writeFile(resolve(output, `${id}.zip`), bytes);
    receipts.push({ id, configuration: config, distribution: 'original-local-configuration-sample', archive: `artifacts/showcase/template-configurator/${id}.zip`, openIndependently: `artifacts/showcase/template-configurator/${id}/index.html`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, files: files.map(file => ({ path: file.name, bytes: file.data.length, sha256: createHash('sha256').update(file.data).digest('hex') })) });
  }
}
await writeFile(resolve(output, 'export-receipts.json'), JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), command: 'node --import tsx scripts/export-template-configurator-samples.ts', commercialArchivesChanged: false, browserVerified: false, receipts }, null, 2) + '\n');
console.log(`Generated ${receipts.length} original standalone sample ZIPs and extracted outputs in artifacts/showcase/template-configurator. Browser verification is separate.`);
