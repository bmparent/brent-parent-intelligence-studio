import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { canonicalRuntimeModule, runtimeBundlePath } from './build-playground-runtime.mjs';

const entry = "export {buildFrozenPackage,createProjectSnapshot} from './src/playground/purchaseSnapshot'; export {createStarter} from './src/playground/starters'; export {runtimeScript} from './src/playground/renderer'; export {setBlockMotion} from './src/playground/authoring'; export {flattenNodes} from './src/playground/authoringSchema';";
async function compiled(options) {
  const result = await build({ stdin: { contents: entry, resolveDir: process.cwd() }, bundle: true, write: false, format: 'esm', legalComments: 'none', ...options });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}

test('checked-in runtime literals regenerate exactly with LF and no bundle-dependent names or paths', async () => {
  const generated = await canonicalRuntimeModule(), stored = await readFile(runtimeBundlePath, 'utf8');
  assert.equal(stored, generated); assert.equal(await canonicalRuntimeModule(), generated);
  assert.equal(stored.includes('\r'), false);
  assert.equal(stored.includes('__name'), false);
  assert.equal(stored.includes('sourceMappingURL'), false);
  assert.equal(stored.includes(process.cwd().replaceAll('\\', '/')), false);
});

test('browser development, minified browser, tsx-like and server builds produce identical frozen files, archive and editor bridge bytes', async () => {
  const variants = [
    { platform: 'browser', target: 'es2022', minify: false, keepNames: true },
    { platform: 'browser', target: 'es2020', minify: true, keepNames: false },
    { platform: 'node', target: 'es2022', minify: false, keepNames: true },
    { platform: 'node', target: 'es2022', minify: true, keepNames: false },
  ];
  const modules = await Promise.all(variants.map(compiled));
  const original = modules[0].createStarter({ starter: 'switchboard', goal: 'business', action: 'contact', name: 'Canonical runtime parity' });
  const heading = original.sections.flatMap(section => section.authoring ? modules[0].flattenNodes(section.authoring.root) : []).find(node => node.type === 'heading');
  const project = modules[0].setBlockMotion(original, heading.id, { preset: 'rise', duration: 700, delay: 100 });
  const snapshot = await modules[0].createProjectSnapshot(project, 'same-document', 7);
  const frozen = await Promise.all(modules.map(module => module.buildFrozenPackage(snapshot)));
  for (const candidate of frozen.slice(1)) {
    assert.deepEqual(candidate.files, frozen[0].files);
    assert.deepEqual(candidate.manifest, frozen[0].manifest);
    assert.deepEqual(candidate.receipt, frozen[0].receipt);
    assert.deepEqual(candidate.archive, frozen[0].archive);
  }
  const bridge = modules[0].runtimeScript(project, true, 'hero', true, 'fixed-channel');
  for (const module of modules) assert.equal(module.runtimeScript(project, true, 'hero', true, 'fixed-channel'), bridge);
  const script = new TextDecoder().decode(frozen[0].files.find(file => file.name === 'script.js').data);
  assert.ok(script.includes('EidosPageRuntime.run(')); assert.ok(!script.includes('__name'));
  assert.ok(!script.includes('EidosAuthoringRuntime')); assert.ok(bridge.includes('EidosAuthoringRuntime.run('));
});

// A focused-parent fixture models engines where preventDefault on pointerdown
// does not transfer focus into the iframe. Real-engine acceptance remains in
// verify-playground-guides.mjs (Save, drag, Escape, release, exact project).
test('narrow toolbar avoids top content and gesture focus lets Escape cancel before release', async () => {
  const { runInNewContext } = await import('node:vm');
  const result = await build({ entryPoints: ['src/playground/authoringRuntime.ts'], bundle: true, write: false, format: 'iife', globalName: 'Authoring', platform: 'browser' });
  let focused = null;
  const messages = [], elements = [];
  class Element {
    constructor() {
      this.listeners = {}; this.children = []; this.attributes = {}; this.dataset = {}; this.style = { removeProperty() {} };
      this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
      this.offsetWidth = 100; this.offsetHeight = 44; elements.push(this);
    }
    addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
    dispatch(type, extra = {}) { for (const listener of this.listeners[type] || []) listener({ currentTarget: this, target: this, preventDefault() {}, stopPropagation() {}, ...extra }); }
    append(child) { this.children.push(child); child.parentElement = this; }
    remove() {}
    setAttribute(key, value) { this.attributes[key] = value; }
    getAttribute(key) { return this.attributes[key] ?? null; }
    removeAttribute(key) { delete this.attributes[key]; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    closest() { return root; }
    getBoundingClientRect() { return { left: 0, top: 100, right: 300, bottom: 200, width: 300, height: 100 }; }
    focus(options) { assert.equal(options.preventScroll, true); focused = this; }
    setPointerCapture(pointer) { assert.equal(focused, this, 'focus must precede pointer capture'); this.pointer = pointer; }
    hasPointerCapture(pointer) { return this.pointer === pointer; }
    releasePointerCapture() { this.pointer = null; }
  }
  const root = new Element(), node = new Element();
  node.id = 'heading'; node.dataset = { nodeType: 'heading', nodeName: 'Heading' }; node.parentElement = root;
  root.querySelectorAll = () => [node];
  const document = new Element(), window = new Element(), parent = { postMessage(message) { messages.push(message); } };
  document.head = new Element(); document.body = new Element();
  document.createElement = () => new Element();
  document.querySelectorAll = () => [root];
  document.getElementById = id => id === node.id ? node : null;
  const environment = {
    window, document, parent, AbortController, innerWidth: 320, innerHeight: 800,
    cancelAnimationFrame() {}, performance: { now: () => 1 },
  };
  runInNewContext(result.outputFiles[0].text + ';Authoring.authoringRuntime({bridge:true,editing:true,channel:"test",compositionStamp:"one"});', environment);
  window.dispatch('message', { source: parent, data: { type: 'playground-block-selection', channel: 'test', id: node.id } });
  const toolbar = elements.find(element => element.className === 'pg-node-toolbar');
  assert.equal(toolbar.style.top, '51px', 'room above keeps toolbar outside the selected block');
  node.getBoundingClientRect = () => ({ left: 0, top: 10, right: 300, bottom: 150, width: 300, height: 140 });
  window.dispatch('resize');
  assert.equal(toolbar.style.top, '155px', 'a near-top block gets its toolbar below, not over its text');
  node.getBoundingClientRect = () => ({ left: 0, top: 10, right: 300, bottom: 1000, width: 300, height: 990 });
  window.dispatch('resize');
  assert.equal(toolbar.style.top, '750px', 'a viewport-spanning container docks at the bottom');
  const chromeCss = document.head.children[0].textContent;
  assert.match(chromeCss, /flex-wrap:nowrap/);
  assert.match(chromeCss, /overflow-x:auto/);
  assert.match(chromeCss, /\.pg-node-toolbar>\*\{flex-shrink:0\}/);
  assert.match(chromeCss, /min-height:calc\(44 \* var\(--pg-chrome-unit,1px\)\)/);
  for (const label of ['Drag selected block', 'Resize block width']) {
    const handle = elements.find(element => element.attributes['aria-label'] === label);
    assert.ok(handle);
    focused = null; // Parent Save control owns keyboard focus before pointerdown.
    handle.dispatch('pointerdown', { isPrimary: true, button: 0, pointerId: 7, clientX: 20, clientY: 120 });
    assert.equal(focused, handle);
    assert.equal(handle.hasPointerCapture(7), true);
    // Keyboard events only reach this document after focus has transferred.
    if (focused === handle) document.dispatch('keydown', { key: 'Escape' });
    assert.equal(handle.hasPointerCapture(7), false);
    document.dispatch('pointerup', { pointerId: 7, clientX: 150, clientY: 180 });
    assert.equal(messages.filter(message => message.action === 'command').length, 0);
  }
});
