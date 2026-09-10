import type { Project } from './model';

/** The live backend has not accepted the newer media/structure/composition formats.
 * This frontend-only release must never submit those formats to its legacy API.
 * Do not remove this boundary until the paired hosted ownership/reopen tests pass.
 */
export function supportsProductionCloud(project: Project): boolean {
  const projectKeys = new Set(['schemaVersion', 'rendererVersion', 'template', 'name', 'tokens', 'glass', 'sections']);
  const sectionKeys = new Set(['id', 'visible', 'title', 'description', 'cta', 'href', 'layout', 'image', 'alt']);
  return project.schemaVersion === 1
    && Object.keys(project).every(key => projectKeys.has(key))
    && project.sections.every(section => Object.keys(section).every(key => sectionKeys.has(key)));
}

export const EDITOR_RELEASE = 'local-spatial-2026-09-10';
export const CLOUD_FORMAT_NOTICE = 'This design uses the new editor format. Cloud saving for this format is not enabled yet. Local autosave stays on; download project JSON or a page ZIP to keep a portable backup. Existing account projects are unchanged.';
