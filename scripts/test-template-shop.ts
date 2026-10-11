import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

// The production modules use Vite's import.meta.env replacement. Load through
// the same SSR transform rather than changing product code for the test runner.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const { TemplateChooser, TemplateCollection, TemplateDetail, TemplateStart, TemplateTerms } = await vite.ssrLoadModule('/src/components/TemplateShop.tsx');
const { templateProducts } = await vite.ssrLoadModule('/src/data/templateCatalog.ts');
const { pageMetadata, prerenderPagePaths } = await vite.ssrLoadModule('/src/data/pages.ts');
const { templateProducts: serverProducts } = await vite.ssrLoadModule('/functions/_shared/platform/templateCatalog.ts');
await vite.close();

test('each collection entry points to its actual demo and independent five-page product detail', () => {
  const markup = renderToStaticMarkup(createElement(TemplateCollection));
  assert.equal(templateProducts.length, 4);
  for (const product of templateProducts) {
    assert.equal(product.pages.length, 5);
    assert.ok(markup.includes(`/shop/${product.slug}`));
    assert.ok(markup.includes(`/template-demos/${product.slug}/`));
    const detail = renderToStaticMarkup(createElement(TemplateDetail, { slug: product.slug }));
    assert.match(detail, /Purchasing unavailable/);
    assert.match(detail, /proposed one-time price/);
    assert.match(detail, /No live payment/);
    assert.ok(detail.includes('disabled=""'));
    assert.equal(pageMetadata(`/shop/${product.slug}`).noIndex, true);
    assert.ok(prerenderPagePaths().includes(`/shop/${product.slug}`));
  }
});

test('candidate price and guide records match the server-owned edition contract', () => {
  for (const product of templateProducts) {
    for (const edition of product.editions.filter((e: { platform: string }) => ['developer', 'wordpress'].includes(e.platform))) {
      const server = serverProducts.find((p: { id: string }) => p.id === edition.id);
      assert.ok(server, `Missing server edition ${edition.id}`);
      assert.equal(server.priceCents, edition.draftPriceCents);
      assert.equal(server.guidePath, `/templates/guides/${product.slug}/${edition.platform}/`);
      assert.equal(server.version, '1.0.0');
      assert.ok(prerenderPagePaths().includes(server.guidePath.replace(/\/$/, '')));
    }
  }
});

test('platform help, terms, and recovery disclose product boundaries', () => {
  const chooser = renderToStaticMarkup(createElement(TemplateChooser));
  assert.match(chooser, /Visual add-ons/);
  const terms = renderToStaticMarkup(createElement(TemplateTerms));
  assert.match(terms, /GPLv2-or-later/);
  assert.match(terms, /Cinematic Starter/);
  assert.match(terms, /cannot reclaim/);
  const start = renderToStaticMarkup(createElement(TemplateStart));
  assert.match(start, /Checkout email/);
  assert.doesNotMatch(start, /Download your versioned package/);
  assert.equal(pageMetadata('/shop/start').noIndex, true);
  assert.equal(pageMetadata('/shop/start').noReferrer, true);
});

test('new candidate preserves Cinematic Starter product files and price', async () => {
  const shop = await readFile('src/components/ShopPages.tsx', 'utf8');
  assert.match(shop, /\$29/);
  assert.match(shop, /cinematic-starter/);
  const starter = await readFile('functions/_shared/platform/shop.ts', 'utf8');
  assert.match(starter, /KIT_PRICE = 2900/);
});
