import { CloudProjects as LegacyCloudProjects } from './CloudProjectsLegacy';
import type { Project } from './model';
import type { SaveTarget } from './workspace';
import { CLOUD_FORMAT_NOTICE, supportsProductionCloud } from './releaseBoundary';

export type LegacyCloudProps = {
  project: Project; target: SaveTarget | null; documentId: string; guard: () => () => boolean;
  load: (project: Project, target?: SaveTarget | null) => void;
  acknowledge: (id: string, target: SaveTarget) => void; disabled: boolean;
};

export function CloudProjects(props: LegacyCloudProps) {
  if (!supportsProductionCloud(props.project)) return <details className="pg-project-tools" open>
    <summary>Account projects</summary>
    <p role="status">{CLOUD_FORMAT_NOTICE}</p>
    <p>Use Projects &amp; variations above for JSON backup, or Export for a standalone page. Account signup, Google sign-in and the new cloud editor are a separate release.</p>
  </details>;
  return <LegacyCloudProjects {...props} />;
}
