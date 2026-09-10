import { useState } from 'react';
import type { Project } from './model';
import { sectionKind } from './model';
import { enableComposition } from './composition';
import { imageData } from './storage';
import { defaultMedia } from './media';
import { StructureControls as OriginalStructureControls } from './StructureControlsOriginal';
import { EDITOR_RELEASE } from './releaseBoundary';

type Props = { project: Project; selected: string; edit: (project: Project) => void; guard: () => () => boolean; notify: (message: string) => void };

export function StructureControls(props: Props) {
  const { project, edit, guard, notify } = props;
  const [uploading, setUploading] = useState(false);
  const enabled = project.schemaVersion === 3;
  async function uploadHero(file: File) {
    const valid = guard();
    setUploading(true);
    try {
      const image = await imageData(file);
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(image));
      const sourceId = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (!valid()) { notify('The workspace changed. Choose your hero image again.'); return; }
      const next = enableComposition(project);
      edit({ ...next, sections: next.sections.map(section => sectionKind(section) === 'hero' ? {
        ...section, image, alt: '', media: { ...defaultMedia(), sourceId, sourceName: file.name.slice(0, 120) },
      } : section) });
      notify('Hero image added. Select Hero for placement, crop and image-description controls. Undo restores the previous design.');
    } catch (error) { if (valid()) notify(error instanceof Error ? error.message : 'The image could not be opened.'); }
    finally { setUploading(false); }
  }
  return <>
    <section className="pg-project-tools" aria-labelledby="pg-customize-heading" data-editor-release={EDITOR_RELEASE}>
      <h2 id="pg-customize-heading">Drag &amp; drop</h2>
      <p>{enabled ? 'Drag the labeled hero handles in Preview to reorder your heading, text, button and image.' : 'Arrange your hero image, heading, text and button directly in Preview. Your existing design changes only when you enable this.'}</p>
      {!enabled && <button className="pg-primary" style={{ minHeight: 44 }} onClick={() => {
        try { edit(enableComposition(project)); notify('Drag-and-drop enabled. Open Preview and drag a labeled hero handle. Select Hero for image placement controls. Undo restores the original format.'); }
        catch (error) { notify(error instanceof Error ? error.message : 'Composition could not be enabled.'); }
      }}>Enable drag &amp; drop</button>}
      <label className="pg-upload" style={{ minHeight: 44 }}>
        {uploading ? 'Opening image…' : 'Upload hero image'}
        <input aria-label="Upload hero image" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={event => {
          const file = event.target.files?.[0]; event.target.value = ''; if (file) void uploadHero(file);
        }} />
      </label>
      <p><small>Select <strong>Hero</strong> above for Behind text, Below heading, side-by-side placement and mobile controls. You can also drop one PNG, JPEG or WebP onto the hero after enabling drag-and-drop.</small></p>
      <p><small>Drag page sections in the list above, or use the arrow buttons. This is a structured page editor, not an unrestricted object canvas.</small></p>
    </section>
    <OriginalStructureControls {...props} />
  </>;
}
