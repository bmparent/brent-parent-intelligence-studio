import { validateProject, sectionKind, type Project } from './model';
import type { StudioMode } from './studioSchema';
import { createArtwork } from './artworkSchema';
import { createMotion } from './motionSchema';

/** Explicit, undoable local format upgrade; renderer identities never change. */
export function selectStudio(project: Project, mode: StudioMode): Project {
  if (mode === 'page' && !project.studios) return project;
  return validateProject({...project, schemaVersion: 5,
    sections: project.sections.map(s=>({...s,type:sectionKind(s)})),
    studios: {...project.studios,version:1,active:mode,
      ...(mode === 'artwork' && !project.studios?.artwork ? {artwork:createArtwork()} : {}),
      ...(mode === 'motion' && !project.studios?.motion ? {motion:createMotion()} : {}),
    },
  });
}
