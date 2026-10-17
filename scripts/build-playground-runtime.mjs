import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export const runtimeBundlePath = 'src/playground/runtimeBundle.ts';
/** Compile once into source literals. Application bundlers may transform their
 * surrounding module, but cannot rename or reformat the saved runtime bytes. */
export async function canonicalRuntimeModule(root = process.cwd()) {
  const entries = [
    ['pageRuntimeSource', 'runtime', 'pageRuntime', 'EidosPageRuntime'],
    ['compositionRuntimeSource', 'compositionRuntime', 'compositionRuntime', 'EidosCompositionRuntime'],
    ['authoringRuntimeSource', 'authoringRuntime', 'authoringRuntime', 'EidosAuthoringRuntime'],
  ];
  const declarations = [];
  for (const [constant, module, fn, globalName] of entries) {
    const result = await build({ stdin: { contents: `export { ${fn} as run } from './src/playground/${module}';`, resolveDir: root },
      bundle: true, write: false, format: 'iife', globalName, platform: 'browser', target: 'es2022',
      minify: true, keepNames: false, charset: 'ascii', legalComments: 'none', sourcemap: false });
    const script = result.outputFiles[0].text.replaceAll('\r\n', '\n');
    declarations.push(`export const ${constant} = ${JSON.stringify(script)};`);
  }
  return '// Generated canonical runtimes. Run npm run playground:runtime after editing runtime sources.\n' + declarations.join('\n') + '\n';
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const generated = await canonicalRuntimeModule();
  if (process.argv.includes('--check')) {
    if ((await readFile(runtimeBundlePath, 'utf8')) !== generated) throw Error('Canonical Playground runtime is stale. Run npm run playground:runtime and review the generated diff.');
    console.log('Canonical Playground runtime is current.');
  } else { await writeFile(runtimeBundlePath, generated, 'utf8'); console.log('Generated canonical Playground runtime.'); }
}
