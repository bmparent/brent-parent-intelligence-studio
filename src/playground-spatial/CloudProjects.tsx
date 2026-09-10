import type { Project } from './model';
import type { SaveTarget } from './workspace';

type Props = {
  project: Project;
  target: SaveTarget | null;
  documentId: string;
  guard: () => () => boolean;
  load: (project: Project, target?: SaveTarget | null) => void;
  acknowledge: (id: string, target: SaveTarget) => void;
  disabled: boolean;
};

/**
 * Deliberate release boundary. The production backend does not yet accept
 * schema 3. Never send these documents to the legacy account or sales APIs,
 * and never down-convert them by dropping their composition.
 */
export function CloudProjects(_props: Props) {
  return <section className="pg-project-tools" aria-label="Project storage">
    <h3>Saved on this device</h3>
    <p>This drag-and-drop release saves in your browser. Download project JSON
      to keep a portable backup, or export a complete working page.</p>
    <p>Your existing account projects and earlier browser workspace remain in
      the <a href="/playground/?classic=1">classic editor</a>. Download their
      project JSON there and import it here to customize a copy.</p>
    <small>Account sync, paid exports and AI generation are not enabled in
      this editor. They are not required for local editing or downloads.</small>
  </section>;
}
