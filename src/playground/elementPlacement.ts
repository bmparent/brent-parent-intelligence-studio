import { applyBlockOperation } from './authoring';
import { flattenNodes, isContainer, type NodeType } from './authoringSchema';
import type { Project } from './model';

/** Resolve a useful destination without changing an existing project's format. */
export function preferredContainer(project: Project, sectionId: string, selectedNode: string): string | null {
  if (project.schemaVersion !== 4) return null;
  const selected = project.sections.find(section => section.authoring && flattenNodes(section.authoring.root).some(node => node.id === selectedNode));
  if (selected?.authoring) {
    const nodes = flattenNodes(selected.authoring.root);
    const node = nodes.find(item => item.id === selectedNode);
    if (node && isContainer(node)) return node.id;
    const parent = nodes.find(item => item.children?.some(child => child.id === selectedNode));
    if (parent) return parent.id;
  }
  return (project.sections.find(section => section.id === sectionId)?.authoring ||
    project.sections.find(section => section.id === 'hero')?.authoring ||
    project.sections.find(section => section.authoring)?.authoring)?.root.id || null;
}

/** Add and place in a single undo entry. The model validates depth, counts and ancestry. */
export function placeElement(project: Project, kind: NodeType, parentId: string, beforeId: string | null = null) {
  const section = project.sections.find(item => item.authoring && flattenNodes(item.authoring.root).some(node => node.id === parentId));
  const parent = section?.authoring && flattenNodes(section.authoring.root).find(node => node.id === parentId);
  if (!section || !parent || !isContainer(parent)) throw new Error('Choose a page container to place this element.');
  const added = applyBlockOperation(project, { type: 'add', parent: parentId, kind });
  const addedParent = added.sections.find(item => item.id === section.id)!.authoring!;
  const nodeId = flattenNodes(addedParent.root).find(node => node.id === parentId)!.children!.at(-1)!.id;
  const result = beforeId ? applyBlockOperation(added, { type: 'move', id: nodeId, parent: parentId, before: beforeId }) : added;
  return { project: result, sectionId: section.id, nodeId };
}
