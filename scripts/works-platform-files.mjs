import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const platformSourcePaths = [
  'functions/_shared/platform',
  'functions/_shared/snapshot/stripe.ts', 'functions/_shared/snapshot/http.ts', 'functions/_shared/snapshot/types.ts',
  'functions/api/assistant.ts', 'functions/api/public-config.ts', 'functions/api/operations',
  'functions/api/community', 'functions/api/members', 'functions/api/shop', 'functions/community',
  'functions/api/playground', 'src/playground/model.ts', 'src/playground/approved-glass-preset.json',
  'src/playground/aiOperations.ts', 'src/playground/media.ts', 'src/playground/limits.ts', 'src/playground/export.ts', 'src/playground/renderer.ts', 'src/playground/runtime.ts', 'src/playground/pageStyles.ts', 'src/playground/glassBundle.ts',
  'src/playground/compositionSchema.ts', 'src/playground/composition.ts', 'src/playground/compositionRenderer.ts', 'src/playground/compositionRuntime.ts',
  'src/playground/studioSchema.ts', 'src/playground/artworkSchema.ts', 'src/playground/motionSchema.ts', 'src/playground/runtimeBundle.ts',
  'src/playground/authoringSchema.ts', 'src/playground/authoring.ts', 'src/playground/authoringRenderer.ts', 'src/playground/authoringRuntime.ts', 'src/playground/releaseBoundary.ts', 'src/playground/workspace.ts',
  'migrations',
];

// The export and exact-source verifier share one complete runtime inventory.
export async function platformSourceFiles(root = process.cwd()) {
  const files = new Set();
  async function visit(relative) {
    let entries;
    try { entries = await readdir(join(root, relative), {withFileTypes: true}); }
    catch (error) { if (error.code !== 'ENOTDIR') throw error; files.add(relative); return; }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) throw Error('Platform sources cannot contain symbolic links: ' + relative);
      const child = relative + '/' + entry.name;
      if (entry.isDirectory()) await visit(child); else if (entry.isFile()) files.add(child);
    }
  }
  for (const path of platformSourcePaths) await visit(path);
  return [...files].sort();
}
