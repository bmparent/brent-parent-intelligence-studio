import test from 'node:test';
import assert from 'node:assert/strict';
import { artworkBytes, configurationFiles, createConfiguration, moduleOptions, pageOptions, reconcileConfiguration, samplePage, validateConfiguration, associatedPackage } from '../src/templates/configurator';
import { templateProducts } from '../src/data/templateCatalog';

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes);
test('each family uses its real current immutable developer identity without mutating the catalog', () => {
  const before = JSON.stringify(templateProducts);
  const styles = new Set<string>();
  for (const product of templateProducts) {
    const config = createConfiguration(product.slug);
    const edition = product.editions.find(item => item.platform === 'developer')!;
    assert.equal(config.editionId, edition.id);
    assert.equal(config.editionVersion, edition.version);
    assert.equal(associatedPackage(config).editionId, edition.id);
    const files = configurationFiles(config);
    styles.add(decode(files.find(file => file.name === 'styles.css')!.data));
    const manifest = JSON.parse(decode(files.find(file => file.name === 'PACKAGE_MANIFEST.json')!.data));
    assert.equal(manifest.commercialEntitlement, false);
    assert.equal(manifest.distribution, 'original-local-configuration-sample');
    assert.deepEqual(manifest.files, files.filter(file => file.name !== 'PACKAGE_MANIFEST.json').map(file => ({ path: file.name, bytes: file.data.length })));
  }
  assert.equal(styles.size, 4, 'family styles should remain distinct');
  assert.equal(JSON.stringify(templateProducts), before);
});

test('every supported page subset and compatible module selection exports exactly its advertised files', () => {
  for (const product of templateProducts) {
    for (let pageMask = 0; pageMask < 16; pageMask++) {
      for (let moduleMask = 0; moduleMask < 8; moduleMask++) {
        const config = reconcileConfiguration({ ...createConfiguration(product.slug), tier: 'expressive', pages: ['home', ...pageOptions.slice(1).filter((_, index) => pageMask & (1 << index)).map(page => page.id)], modules: moduleOptions.filter((_, index) => moduleMask & (1 << index)).map(module => module.id) });
        const files = configurationFiles(config);
        const names = new Set(files.map(file => file.name));
        assert.equal(names.size, files.length);
        assert.deepEqual(files.filter(file => file.name.endsWith('.html')).map(file => file.name), pageOptions.filter(page => config.pages.includes(page.id)).map(page => page.file));
        assert.equal(names.has('modules/gallery.js'), config.modules.includes('gallery'));
        assert.equal(names.has('modules/motion.css'), config.modules.includes('motion'));
        assert.equal(names.has('modules/motion.js'), config.modules.includes('motion'));
        assert.equal(names.has('modules/editorial.css'), config.modules.includes('editorial'));
        for (const file of files.filter(file => file.name.endsWith('.html'))) {
          for (const match of decode(file.data).matchAll(/(?:src|href)="([^"]+)"/g)) {
            assert.ok(names.has(match[1]), `${product.slug}/${file.name}: missing local dependency ${match[1]}`);
          }
        }
      }
    }
  }
});

test('preview and standalone package share composition, styles, and supported feature logic', () => {
  const config = reconcileConfiguration({ ...createConfiguration('tideglass'), tier: 'expressive', pages: pageOptions.map(page => page.id), modules: moduleOptions.map(module => module.id) });
  const files = configurationFiles(config);
  for (const page of pageOptions) {
    const preview = samplePage(config, page.id);
    const exported = decode(files.find(file => file.name === page.file)!.data);
    assert.equal(preview.match(/<main>([\s\S]+)<\/main>/)![1].replace(/data:image\/svg\+xml;charset=utf-8,[^"]+/g, 'LOCAL_ART'), exported.match(/<main>([\s\S]+)<\/main>/)![1].replace(/assets\/study-\d.svg/g, 'LOCAL_ART'));
    assert.ok(preview.includes(decode(files.find(file => file.name === 'styles.css')!.data)));
    assert.ok(!/https?:\/\/|fetch\(/.test(exported), 'sample HTML must open independently without remote dependencies');
  }
});

test('unsupported platforms, stale versions, invalid modules, and malformed documents fail closed', () => {
  const current = createConfiguration();
  for (const bad of [null, [], {}, { ...current, schemaVersion: 9 }, { ...current, editionId: 'matter-wordpress-v1' }, { ...current, editionVersion: '0.0.0' }, { ...current, pages: ['home', 'home'] }, { ...current, pages: ['contact'] }, { ...current, modules: ['gallery'] }, { ...current, tier: 'expressive', modules: ['gallery'] }, { ...current, contactEmail: 'x@example.com?body=unwanted' }, { ...current, headline: 'x'.repeat(121) }]) assert.throws(() => validateConfiguration(bad));
  assert.deepEqual(validateConfiguration(JSON.parse(JSON.stringify(current))), current);
});

test('incompatible options are removed by explicit UI reconciliation and do not silently enter imports', () => {
  const config = { ...createConfiguration(), tier: 'expressive' as const, pages: pageOptions.map(page => page.id), modules: moduleOptions.map(module => module.id) };
  assert.deepEqual(reconcileConfiguration({ ...config, tier: 'essential' }).modules, []);
  assert.deepEqual(reconcileConfiguration({ ...config, pages: ['home', 'contact'] }).modules, ['motion']);
  assert.throws(() => validateConfiguration({ ...config, pages: ['home', 'contact'] }));
});

test('sample content is escaped and contact delivery is represented honestly', () => {
  const config = { ...createConfiguration('nightjar'), headline: '</h1><script>alert(1)</script>', description: '<img onerror="alert(1)">', contactEmail: '' };
  const page = samplePage(config, 'home');
  assert.ok(page.includes('&lt;script&gt;'));
  assert.ok(!page.includes('<script>alert(1)'));
  const unconfigured = samplePage(config, 'contact');
  assert.ok(unconfigured.includes('Email is not configured'));
  assert.ok(!unconfigured.includes('<form'));
  const contact = samplePage({ ...config, contactEmail: 'studio@example.com' }, 'contact');
  assert.ok(contact.includes('href="mailto:studio@example.com"'));
  assert.ok(contact.includes('no form server or delivered-inquiry receipt'));
});

test('schema1 and schema2 migrate explicitly, PNG artwork survives source roundtrip and packages exact owned bytes', () => {
  const current = createConfiguration();
  const legacy = { ...current, schemaVersion: 1, artwork: undefined };
  const migrated = validateConfiguration(legacy);
  assert.equal(migrated.schemaVersion, 3);
  assert.equal(migrated.artwork, null);
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const config = validateConfiguration({ ...current, artwork: { dataUrl: png, alt: 'Original uploaded Artwork Studio tile' } });
  const schema2 = validateConfiguration({ ...config, schemaVersion: 2, buyer: undefined });
  assert.equal(schema2.schemaVersion, 3);
  assert.deepEqual(schema2.artwork, config.artwork);
  assert.deepEqual(schema2.buyer, current.buyer);
  const files = configurationFiles(config);
  assert.deepEqual(files.find(file => file.name === 'assets/artwork.png')!.data, artworkBytes(png));
  assert.ok(!files.some(file => file.name === 'assets/study-0.svg'));
  assert.ok(samplePage(config, 'home').includes(png));
  assert.ok(samplePage(config, 'home', false).includes('src="assets/artwork.png"'));
  assert.ok(samplePage(config, 'home', false).includes('Original uploaded Artwork Studio tile'));
  assert.deepEqual(validateConfiguration(JSON.parse(decode(files.find(file => file.name === 'configuration.json')!.data))), config);
  const corrupt = png.slice(0, -8) + 'AAAAAAAA';
  for (const url of ['https://example.com/tile.png', 'data:image/svg+xml,<svg/>', corrupt]) assert.throws(() => validateConfiguration({ ...current, artwork: { dataUrl: url, alt: 'bad image' } }));
  assert.throws(() => validateConfiguration({ ...legacy, artwork: config.artwork }));
});
