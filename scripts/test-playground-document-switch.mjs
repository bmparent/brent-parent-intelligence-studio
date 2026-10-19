import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Deterministic hook scheduling and storage fixtures exercise the production
// useProject implementation. This is not browser/React/IndexedDB acceptance.
const hooks = `
let slots = [], index = 0, effects = [], render;
export function mount(fn) { render = fn; return flush(); }
export function flush() {
  index = 0;
  const value = render(), pending = effects;
  effects = [];
  pending.forEach(effect => effect());
  return value;
}
export function dispose() { slots.forEach(slot => slot?.cleanup?.()); }
export function useState(initial) {
  const slot = index++;
  if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial;
  return [slots[slot], value => { slots[slot] = typeof value === 'function' ? value(slots[slot]) : value; }];
}
export function useReducer(reducer, initial, initialize) {
  const [value, set] = useState(() => initialize ? initialize(initial) : initial);
  return [value, action => set(previous => reducer(previous, action))];
}
export function useRef(value) { return useState(() => ({ current: value }))[0]; }
export function useCallback(callback) { return useState(() => callback)[0]; }
export function useEffect(effect, dependencies) {
  const slot = index++, previous = slots[slot];
  if (!previous || !dependencies || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
    effects.push(() => { previous?.cleanup?.(); slots[slot] = { dependencies, cleanup: effect() }; });
  }
}
`;
const storage = `
export const records = new Map();
export const controls = { fail: false, delay: false, pending: [] };
export async function loadWorkspace(id) { return structuredClone(records.get(id || 'current') || null); }
export async function listSavedProjects() { return []; }
export async function saveWorkspace(value, stillCurrent = () => true) {
  if (controls.delay) await new Promise(resolve => controls.pending.push(resolve));
  if (!stillCurrent()) return;
  if (controls.fail) throw Error('Injected device save failure');
  records.set(value.documentId, structuredClone(value));
  records.set('current', structuredClone(value));
}
`;
const compiled = await build({
  stdin: { contents: `export { useProject } from './src/playground/useProject'; export { CloudProjects as LegacyCloudProjects } from './src/playground/CloudProjectsLegacy'; export { createProject } from './src/playground/model'; export { mount, flush, dispose } from 'react'; export { records, controls } from './src/playground/storage'; export { switchAccount } from './src/lib/accountEpoch';`, resolveDir: process.cwd() },
  bundle: true, write: false, format: 'esm', platform: 'node',
  plugins: [{ name: 'document-switch-fixtures', setup(builder) {
    builder.onResolve({ filter: /^react$/ }, () => ({ path: 'hooks', namespace: 'fixture' }));
    builder.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({ path: 'jsx', namespace: 'fixture' }));
    builder.onResolve({ filter: /\/Purchases$/ }, () => ({ path: 'purchases', namespace: 'fixture' }));
    builder.onResolve({ filter: /\/accountEpoch$/ }, () => ({ path: 'epoch', namespace: 'fixture' }));
    builder.onResolve({ filter: /\/storage$/ }, () => ({ path: 'storage', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: args.path === 'hooks' ? hooks : args.path === 'jsx' ? `export function jsx(type,props) {return {type,props};} export const jsxs=jsx; export const Fragment='fragment';` : args.path === 'purchases' ? `export function Purchases() { return null; }` : args.path === 'epoch' ? `let epoch = ''; const listeners = new Set(); export function accountEpoch() { return epoch; } export function subscribeAccountChanges(callback) { listeners.add(callback); return () => listeners.delete(callback); } export function switchAccount() { epoch = crypto.randomUUID(); listeners.forEach(callback => callback()); }` : storage, loader: 'js' }));
  } }],
});
let instance = 0;
test('local legacy projects fetch account data only on explicit action and clear it on account changes', async t => {
  const source = compiled.outputFiles[0].text + '\n// isolated cloud fixture ' + instance++;
  const f = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const priorFetch = globalThis.fetch, priorLocation = globalThis.location, calls = [];
  globalThis.location = { search: '' };
  globalThis.fetch = async (url, options) => {
    calls.push({url, method: options.method || 'GET'});
    return new Response(JSON.stringify({ ownerId: 'fixture-owner', newFormatSaveEnabled: false, projects: [{id:'fixture-project', name:'Explicit account project', head:'fixture-head', updated_at:''}] }), {headers:{'content-type':'application/json'}});
  };
  t.after(() => { f.dispose(); globalThis.fetch = priorFetch; if (priorLocation === undefined) delete globalThis.location; else globalThis.location = priorLocation; });
  const props = { project:f.createProject(), target:null, documentId:'local-document', guard:()=>()=>true, load:async()=>true, acknowledge:()=>{}, disabled:false };
  const render = () => { const wrapper = f.LegacyCloudProjects(props); return wrapper.type(wrapper.props); };
  const elements = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(elements) : [node, ...elements(node.props?.children)];
  let tree = f.mount(render); await Promise.resolve(); tree = f.flush();
  assert.deepEqual(calls, [], 'mounting a local project makes no account request');
  f.switchAccount(); tree = f.flush(); assert.deepEqual(calls, [], 'session invalidation never opts into cloud access');
  const refresh = elements(tree).find(node => node.type === 'button' && node.props.children === 'Refresh account projects');
  assert.ok(refresh); refresh.props.onClick(); await new Promise(resolve => setImmediate(resolve)); tree = f.flush();
  assert.deepEqual(calls, [{url:'/api/playground/projects', method:'GET'}]);
  assert.ok(elements(tree).some(node => node.type === 'button' && node.props.children?.includes?.('Explicit account project')));
  f.switchAccount(); tree = f.flush();
  assert.equal(elements(tree).some(node => node.type === 'button' && node.props.children?.includes?.('Explicit account project')), false, 'the old account list is cleared');
  assert.equal(calls.length, 1, 'clearing the old account does not fetch the next one');
});
async function fixture(t) {
  const source = compiled.outputFiles[0].text + '\n// isolated fixture ' + instance++;
  const api = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const previousWindow = globalThis.window;
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  t.after(() => { api.dispose(); if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; });
  api.mount(api.useProject);
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  let current = api.flush();
  assert.equal(current.ready, true);
  assert.equal(await current.startProject({ ...api.createProject(), name: 'A-original' }), true);
  current = api.flush();
  assert.equal(await current.saveNow(), true);
  api.flush();
  return { ...api, get: () => api.flush(), project: name => ({ ...api.createProject(), name }) };
}

test('import persists the outgoing final edit before switching identities and retains Undo', async t => {
  const f = await fixture(t), originalId = f.get().documentId;
  f.get().edit(f.project('A-final-edit'));
  assert.equal(await f.get().replace(f.project('B-import')), true);
  const imported = f.get();
  assert.notEqual(imported.documentId, originalId);
  assert.equal(imported.project.name, 'B-import');
  assert.equal(f.records.get(originalId).project.name, 'A-final-edit');
  assert.equal(await imported.saveNow(), true);
  assert.equal(f.records.get('current').project.name, 'B-import');
  assert.equal(f.records.get(originalId).project.name, 'A-final-edit');
  f.get().undo();
  assert.equal(f.get().documentId, originalId);
  assert.equal(f.get().project.name, 'A-final-edit');
});

test('failed pre-import save leaves the current project, identity and history unchanged', async t => {
  const f = await fixture(t);
  f.get().edit(f.project('A-unsaved'));
  const before = f.get();
  f.controls.fail = true;
  assert.equal(await before.replace(f.project('B-import')), false);
  const after = f.get();
  assert.equal(after.documentId, before.documentId);
  assert.deepEqual(after.project, before.project);
  assert.equal(after.revision, before.revision);
  assert.equal(after.canUndo, before.canUndo);
  assert.match(after.storageError, /Could not save/);
  f.controls.fail = false;
  assert.equal(await after.replace(f.project('B-retry')), true, 'failed save releases the switching lock');
});

test('a late pre-import save cannot replace newer manual edits', async t => {
  const f = await fixture(t), originalId = f.get().documentId;
  f.controls.delay = true;
  const pending = f.get().replace(f.project('B-import'));
  assert.equal(f.controls.pending.length, 1);
  f.get().edit(f.project('A-newer-manual-edit'));
  f.get();
  f.controls.delay = false;
  f.controls.pending.shift()();
  assert.equal(await pending, false);
  assert.equal(f.get().documentId, originalId);
  assert.equal(f.get().project.name, 'A-newer-manual-edit');
  assert.equal(f.records.get(originalId).project.name, 'A-original', 'stale queued save was dropped');
  assert.equal(await f.get().saveNow(), true);
  assert.equal(f.records.get(originalId).project.name, 'A-newer-manual-edit');
});

test('concurrent imports are serialized and only the accepted replacement enters history', async t => {
  const f = await fixture(t);
  f.controls.delay = true;
  const accepted = f.get().replace(f.project('B-first'));
  assert.equal(await f.get().replace(f.project('C-second')), false);
  f.controls.delay = false;
  f.controls.pending.shift()();
  assert.equal(await accepted, true);
  assert.equal(f.get().project.name, 'B-first');
  f.get().undo();
  assert.equal(f.get().project.name, 'A-original');
});

test('import, Undo and Redo retain variations only for their document identities', async t => {
  const f = await fixture(t), originalId = f.get().documentId;
  f.get().saveSnapshot('A-only');
  assert.equal(await f.get().replace(f.project('B-import')), true);
  const importedId = f.get().documentId;
  assert.deepEqual(f.get().snapshots, []);
  f.get().saveSnapshot('B-only');
  assert.equal(await f.get().saveNow(), true);
  f.get().undo();
  assert.equal(f.get().documentId, originalId);
  assert.deepEqual(f.get().snapshots.map(s => s.name), ['A-only']);
  assert.equal(await f.get().saveNow(), true);
  assert.deepEqual(f.records.get(originalId).snapshots.map(s => s.name), ['A-only']);
  assert.deepEqual(f.records.get(importedId).snapshots.map(s => s.name), ['B-only']);
  f.get().redo();
  assert.equal(f.get().documentId, importedId);
  assert.deepEqual(f.get().snapshots.map(s => s.name), ['B-only']);
});

test('invalid imports fail before persistence or identity changes', async t => {
  const f = await fixture(t), before = f.get();
  f.controls.fail = true;
  await assert.rejects(before.replace({ schemaVersion: 999 }), /different Playground version/);
  assert.equal(f.get().documentId, before.documentId);
  assert.equal(f.get().storageError, '');
  f.controls.fail = false;
  assert.equal(await f.get().replace(f.project('Valid retry')), true);
});


test('an account change invalidates cloud callbacks without discarding local edits', async t => {
  const f = await fixture(t), before = f.get(), valid = before.guard();
  assert.equal(valid(), true);
  f.switchAccount();
  assert.equal(valid(), false);
  assert.equal(f.get().documentId, before.documentId);
  assert.deepEqual(f.get().project, before.project);
  assert.equal(f.get().guard()(), true);
});

test('an account change during outgoing persistence cancels a cloud replacement', async t => {
  const f = await fixture(t), originalId = f.get().documentId;
  f.get().edit(f.project('A-final-local-edit'));
  f.controls.delay = true;
  const pending = f.get().replace(f.project('B-from-earlier-account'), { id:'cloud-b', head:'head-b', owner:'earlier-owner', name:'B', saved:'' });
  assert.equal(f.controls.pending.length, 1);
  f.switchAccount();
  f.controls.delay = false;
  f.controls.pending.shift()();
  assert.equal(await pending, false);
  assert.equal(f.get().documentId, originalId);
  assert.equal(f.get().project.name, 'A-final-local-edit');
  assert.equal(f.records.get(originalId).project.name, 'A-final-local-edit');
  assert.equal(f.get().target, null);
  assert.equal(await f.get().replace(f.project('C-explicit-local-import')), true);
});
