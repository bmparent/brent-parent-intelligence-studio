import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const catalog = JSON.parse(await readFile('products/templates/catalog.json', 'utf8'));
const report = { scope: 'built frontend and product demo boundaries', checks: [], timestamp: new Date().toISOString() };
for (const product of catalog.products) {
  const html = await readFile(`dist/shop/${product.slug}/index.html`, 'utf8');
  assert.ok(html.includes(product.name));
  assert.ok(html.includes('Purchasing unavailable'));
  assert.ok(html.includes('proposed one-time price'));
  assert.ok(html.includes('noindex, nofollow'));
  assert.ok(html.includes(`/template-demos/${product.slug}/`));
  report.checks.push({ product: product.slug, detail: 'passed', purchaseDefault: 'unavailable' });
}
async function publicArchives(path) {
  const found = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.isDirectory()) found.push(...await publicArchives(`${path}/${entry.name}`));
    else if (/\.(zip|tar|gz)$/i.test(entry.name)) found.push(`${path}/${entry.name}`);
  }
  return found;
}
const archives = (await publicArchives('dist')).filter((p) => /templates|shop|kit/i.test(p));
assert.deepEqual(archives, [], 'Paid template archives must never be deployed as static files.');
const start = await readFile('dist/shop/start/index.html', 'utf8');
assert.ok(start.includes('no-referrer') && start.includes('noindex, nofollow'));
assert.ok(!start.includes('Download your versioned package'));
report.paidStaticArchives = archives;
report.privateStart = 'passed';
await mkdir('artifacts/templates', { recursive: true });
await writeFile('artifacts/templates/shop-contract.json', JSON.stringify(report, null, 2) + '\n');
console.log('Built shop contract passed: 4 product routes, unavailable defaults, private recovery, and no public paid archives.');
