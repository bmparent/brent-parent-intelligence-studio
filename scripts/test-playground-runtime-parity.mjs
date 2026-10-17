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
