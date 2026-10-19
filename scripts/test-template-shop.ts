import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

// The production modules use Vite's import.meta.env replacement. Load through
// the same SSR transform rather than changing product code for the test runner.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const { TemplateChooser, TemplateCollection, TemplateDetail, TemplateStart, TemplateTerms, TemplatePackageContents } = await vite.ssrLoadModule('/src/components/TemplateShop.tsx');
const { templateProducts } = await vite.ssrLoadModule('/src/data/templateCatalog.ts');
const { pageMetadata, prerenderPagePaths } = await vite.ssrLoadModule('/src/data/pages.ts');
const { templateProducts: serverProducts } = await vite.ssrLoadModule('/functions/_shared/platform/templateCatalog.ts');
const { TemplateInstallGuide } = await vite.ssrLoadModule('/src/components/TemplateInstallGuide.tsx');
await vite.close();

test('all eight buyer guides separate section headings, instructions, steps, and inline filenames', () => {
  for (const product of templateProducts) {
    for (const platform of ['developer', 'wordpress']) {
      const markup = renderToStaticMarkup(createElement(TemplateInstallGuide, { path: `/templates/guides/${product.slug}/${platform}` }));
      assert.match(markup, /<h2>What this edition is<\/h2><p>/, 'Body copy must not become heading text');
      assert.doesNotMatch(markup, /<h2>[^<]*\n/, 'Soft-wrapped instructions must not be part of headings');
      assert.match(markup, platform === 'developer' ? /<h2>Quick start<\/h2><ol><li>/ : /<h2>Install on a fresh or backed-up site<\/h2><ol><li>/, 'Setup steps must be a numbered list');
      assert.match(markup, /<h2>Troubleshooting and common mistakes<\/h2><ul><li>/, 'Troubleshooting must be readable list items');
      assert.match(markup, /<code>INSTALL\.md<\/code>|<code>LICENSE\.txt<\/code>/, 'Inline filenames must be formatted as code');
      assert.doesNotMatch(markup, /<code>[^<]*`/, 'Backtick delimiters must not appear in code');
    }
  }
});

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
      assert.equal(server.version, edition.version || '1.0.0');
      assert.ok(prerenderPagePaths().includes(server.guidePath.replace(/\/$/, '')));
    }
  }
});

test('all eight selected-edition guides and exact file/art contents are public before checkout', async () => {
  for (const product of templateProducts) {
    for (const edition of product.editions.filter((e: { platform: string }) => ['developer', 'wordpress'].includes(e.platform))) {
      const manifest = JSON.parse(await readFile(`${edition.sourcePath}/PACKAGE_MANIFEST.json`, 'utf8'));
      const contents = renderToStaticMarkup(createElement(TemplatePackageContents, { edition }));
      assert.ok(contents.includes(`/templates/guides/${product.slug}/${edition.platform}/`), 'Public guide missing');
      assert.ok(contents.includes(`Package version ${edition.version || '1.0.0'}`));
      for (const file of [...manifest.files.map((item: { path: string }) => item.path), 'PACKAGE_MANIFEST.json']) assert.ok(contents.includes(`<code>${file}</code>`), `Missing exact file ${file}`);
      for (const art of manifest.files.filter((item: { path: string }) => item.path.startsWith('assets/'))) assert.ok(contents.includes(art.path));
      assert.match(contents, /no font files or stock photography/);
    }
    const detail = renderToStaticMarkup(createElement(TemplateDetail, { slug: product.slug }));
    const guideIndex = detail.indexOf(`/templates/guides/${product.slug}/developer/`);
    assert.ok(guideIndex >= 0 && guideIndex < detail.indexOf('type="checkbox"'), 'Installation guide must be visible before terms/checkout, without a purchase');
    assert.ok(detail.includes('Included files and artwork'));
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
