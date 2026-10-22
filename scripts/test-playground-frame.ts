import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { onRequestGet } from '../functions/playground-frame';
import { previewFrameBootstrapSource } from '../functions/_shared/playgroundFrameBootstrap';
import { canonicalPreviewFrameModule, previewFrameBundlePath } from './build-playground-runtime.mjs';

test('preview shell uses a fresh nonce, opaque origin and no network, cache, account or database access', async () => {
  const a = onRequestGet(), b = onRequestGet();
  const policy = a.headers.get('content-security-policy')!;
  const nonce = policy.match(/script-src 'nonce-([a-f0-9]+)'/)![1];
  assert.notEqual(policy, b.headers.get('content-security-policy'));
  assert.match(await a.text(), new RegExp(`<script nonce="${nonce}">`));
  for (const boundary of ["default-src 'none'", "connect-src 'none'", "frame-src 'none'", "worker-src 'none'", "form-action 'none'", "base-uri 'none'", "frame-ancestors 'self'", 'sandbox allow-scripts']) assert.ok(policy.includes(boundary));
  assert.ok(!policy.includes('allow-same-origin'));
  assert.ok(!/script-src[^;]*(?:unsafe-inline|unsafe-eval|https:|blob:|data:)/.test(policy));
  assert.equal(a.headers.get('cache-control'), 'private, no-store');
  assert.equal(a.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(a.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(a.headers.get('set-cookie'), null);
  const headers = await readFile('public/_headers', 'utf8');
  assert.match(headers, /script-src 'self' https:\/\/challenges.cloudflare.com/);
  assert.ok(!/script-src[^;]*(?:unsafe-inline|unsafe-eval)/.test(headers));
});

test('the committed frame bootstrap is exactly reproducible', async () => {
  assert.equal(await canonicalPreviewFrameModule(), await readFile(previewFrameBundlePath, 'utf8'));
});

test('only the owning parent and channel can open once; original script bytes use the frame nonce', () => {
  const listeners: Record<string, ((event: Record<string, unknown>) => void)[]> = {}, messages: unknown[] = [], inserted: {textContent?: string; attributes: Record<string,string>}[] = [];
  const parent = { postMessage: (value: unknown) => messages.push(value) };
  const window = { addEventListener: (name: string, fn: (event: Record<string, unknown>) => void) => { (listeners[name] ||= []).push(fn); } };
  let parses = 0;
  const script = { type: '', textContent: 'original frozen script bytes', hasAttribute: () => false, remove() {} };
  const document = {
    currentScript: { nonce: 'response-nonce' },
    addEventListener() {},
    head: { replaceChildren() {} },
    body: { replaceChildren() {}, setAttribute() {}, append: (node: typeof inserted[number]) => inserted.push(node) },
    createElement: () => ({ attributes: {} as Record<string,string>, setAttribute(name: string,value: string) {this.attributes[name]=value;} }),
  };
  class DOMParser { parseFromString() { parses++; return { querySelectorAll: () => [script], head: { childNodes: [] }, body: { childNodes: [], attributes: [] } }; } }
  runInNewContext(previewFrameBootstrapSource, { parent, window, document, location: { hash: '#test-channel' }, DOMParser });
  const open = (source: unknown, channel: string) => listeners.message[0]({ source, data: {type:'playground-frame-open',channel,html:'frozen document'} });
  open({}, 'test-channel'); open(parent, 'wrong-channel'); assert.equal(parses, 0);
  open(parent, 'test-channel'); assert.equal(parses, 1);
  assert.equal(inserted[0].attributes.nonce, 'response-nonce'); assert.equal(inserted[0].textContent, script.textContent);
  open(parent, 'test-channel'); assert.equal(parses, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(messages)), [{type:'playground-frame-ready',channel:'test-channel'},{type:'playground-frame-loaded',channel:'test-channel'}]);
});
