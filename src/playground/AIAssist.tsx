import type { Project } from './model';
import type { SaveTarget } from './workspace';

type Props = { project: Project; target: SaveTarget | null; documentId: string; selected: string; guard: () => () => boolean; edit: (project: Project) => void };

/** This editor-only release never requests AI configuration or dispatches providers.
 * The held integration retains the complete proposal UI and its spending controls.
 */
export function AIAssist({ project }: Props) {
  return <span hidden data-playground-ai="off" data-project-format={project.schemaVersion} />;
}
