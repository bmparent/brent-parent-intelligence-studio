import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { directory } from './directory.ts';
import { html } from './ui.ts';

test('service directory is bundled into the owner page alongside automatic refresh', () => {
  assert.ok(directory.length >= 30);
  assert.ok(directory.every(entry => new URL(entry.url).protocol === 'https:'));
  assert.ok(directory.every(entry => !entry.url.includes('dg-promo-photos')));
  assert.match(html, /data-view="directory">Service directory/);
  assert.match(html, /id="refresh-now"/);

  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'owner page must contain its browser script');
  assert.match(script, /const directory=\[/);
  assert.match(script, /function renderDirectory\(root\)/);
  assert.match(script, /if\(view==='directory'\)renderDirectory\(root\)/);
  assert.match(script, /AUTO_REFRESH_MS=15\*60\*1000/);
  assert.doesNotThrow(() => new Script(`(async()=>{${script}})()`));
});
