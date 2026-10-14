import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { previewDirectoryIndex } from './prerender-preview';

test('preview serves actual built slashless route index while preserving query and HEAD', async () => {
  const root = await mkdtemp(join(tmpdir(), 'eidos-prerender-preview-'));
  try {
    for (const path of ['shop/configure', 'work/signal-house', 'playground']) {
      await mkdir(join(root, 'dist', path), { recursive: true });
      await writeFile(join(root, 'dist', path, 'index.html'), `<h1>${path}</h1>`);
      assert.equal(previewDirectoryIndex(root, 'dist', `/${path}`), `/${path}/index.html`);
      assert.equal(previewDirectoryIndex(root, 'dist', `/${path}?studio=effect&choice=a%3Fb`, 'HEAD'), `/${path}/index.html?studio=effect&choice=a%3Fb`);
      assert.equal(previewDirectoryIndex(root, 'dist', `/${path}/`), undefined);
    }
    for (const path of ['/', '/missing', '/api/private', '/assets/script.js', '/work/../playground', '/work/%2e%2e/playground', '//playground', '/playground\\index']) assert.equal(previewDirectoryIndex(root, 'dist', path), undefined, path);
    assert.equal(previewDirectoryIndex(root, 'dist', '/playground', 'POST'), undefined);
    assert.equal(previewDirectoryIndex(root, 'dist', '/playground', 'DELETE'), undefined);
  } finally {
    assert.ok(root.startsWith(join(tmpdir(), 'eidos-prerender-preview-')));
    await rm(root, { recursive: true, force: true });
  }
});
