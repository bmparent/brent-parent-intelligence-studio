import { validateProject, sectionKind, type Project } from './model';
import { applyBlockOperation, enableBlocks } from './authoring';
import { flattenNodes, isContainer, newNode } from './authoringSchema';
import { defaultMedia } from './media';

/** Asset insertion reuses the page model and creates one history transaction. */
export function insertPageImage(project: Project, sectionId: string, nodeId: string, image: string, sourceName: string) {
  const currentSection = project.sections.find(s => s.id === sectionId);
  const media = { ...defaultMedia(), sourceName: sourceName.slice(0, 120) };
  // Existing section images keep their schema, renderer and identity.
  if (currentSection && !currentSection.authoring && ['hero', 'work'].includes(sectionKind(currentSection))) {
    return { project: validateProject({ ...project, sections: project.sections.map(s => s.id === sectionId ? { ...s, image, media } : s) }), nodeId: '', sectionId };
  }
  const next = enableBlocks(project);
  const section = next.sections.find(s => s.id === sectionId && s.authoring) || next.sections.find(s => s.authoring)!;
  const nodes = flattenNodes(section.authoring!.root);
  const selected = nodes.find(n => n.id === nodeId);
  if (selected?.type === 'image') return { project: applyBlockOperation(next, { type: 'patch', id: selected.id, patch: { image, media } }), nodeId: selected.id, sectionId: section.id };
  const parent = selected && isContainer(selected) ? selected : nodes.find(n => n.children?.some(child => child.id === selected?.id)) || section.authoring!.root;
  const node = { ...newNode('image'), image, name: sourceName.slice(0, 60) || 'Image', media };
  const copy = structuredClone(next);
  const destination = copy.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []).find(n => n.id === parent.id)!;
  destination.children!.push(node);
  return { project: validateProject(copy), nodeId: node.id, sectionId: section.id };
}
