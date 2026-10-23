import { CloudProjects as LegacyCloudProjects } from './CloudProjectsLegacy';
import type { Project } from './model';
import type { SaveTarget } from './workspace';

export type LegacyCloudProps = {
  project: Project; target: SaveTarget | null; documentId: string; guard: () => () => boolean;
  load: (project: Project, target?: SaveTarget | null) => Promise<boolean>;
  acknowledge: (id: string, target: SaveTarget) => void; disabled: boolean;
  canSave?: boolean;
};

export function CloudProjects(props: LegacyCloudProps) {
  // Capability discovery is explicit inside this panel. Mounting it never
  // enables new formats or makes a cloud request.
  return <LegacyCloudProjects {...props} />;
}
