import { readFile, writeFile, mkdir } from 'node:fs/promises';

const catalog = JSON.parse(await readFile('products/templates/catalog.json', 'utf8'));
const guides = [];
for (const product of catalog.products) {
  for (const edition of product.editions.filter((e) => e.sourcePath)) {
    guides.push({ slug: product.slug, name: product.name, platform: edition.platform, editionId: edition.id, path: `/templates/guides/${product.slug}/${edition.platform}/`, markdown: await readFile(`${edition.sourcePath}/INSTALL.md`, 'utf8') });
  }
}
await mkdir('src/data', { recursive: true });
await writeFile('src/data/templateGuides.json', JSON.stringify(guides, null, 2) + '\n');
console.log(`Generated ${guides.length} public installation guides from the packaged source instructions.`);
