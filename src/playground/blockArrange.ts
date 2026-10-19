import { applyBlockOperation } from './authoring';
import { flattenNodes, type BlockNode } from './authoringSchema';
import type { Project } from './model';

/** A shared operation for pointer-free layer and inspector ordering. */
export function moveBlockStep(project: Project, id: string, direction: -1 | 1): Project {
  const all = project.sections.flatMap(section => section.authoring ? flattenNodes(section.authoring.root) : []);
  const parent = all.find(node => node.children?.some(child => child.id === id));
  if (!parent) return project;
  const index = parent.children!.findIndex(node => node.id === id);
  if (index + direction < 0 || index + direction >= parent.children!.length) return project;
  return applyBlockOperation(project, { type: 'move', id, parent: parent.id, before: parent.children![index + (direction === -1 ? -1 : 2)]?.id || null });
}

export function blockLayoutPatch(node: BlockNode, mobile: boolean, value: Pick<Partial<BlockNode>, 'align' | 'gap'>): Partial<BlockNode> {
  return mobile ? { mobile: { ...node.mobile, ...value } } : value;
}
