import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { NodeType } from './authoringSchema';

const elements: { kind: NodeType; label: string; icon: string }[] = [
  { kind: 'heading', label: 'Heading', icon: 'H' },
  { kind: 'text', label: 'Text', icon: '¶' },
  { kind: 'image', label: 'Image', icon: '▧' },
  { kind: 'button', label: 'Button', icon: '↗' },
  { kind: 'stack', label: 'Stack', icon: '☷' },
  { kind: 'row', label: 'Row', icon: '▥' },
  { kind: 'columns', label: 'Columns', icon: '▤' },
];

function PaletteItem({ kind, label, icon, add }: { kind: NodeType; label: string; icon: string; add: (kind: NodeType) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `element:${kind}`, data: { kind } });
  return <div className={`pg-element ${isDragging ? 'dragging' : ''}`}>
    <button type="button" onClick={() => add(kind)} aria-label={`Add ${label} to selected section`}><span aria-hidden="true">{icon}</span>{label}<span aria-hidden="true">+</span></button>
    <button type="button" ref={setNodeRef} {...attributes} {...listeners} className="pg-element-grip" aria-label={`Drag ${label} into page structure or onto canvas`} title={`Drag ${label}`} style={{ touchAction: 'none' }}>⠿</button>
  </div>;
}

export function ElementPalette({ enabled, add, upgrade }: { enabled: boolean; add: (kind: NodeType) => void; upgrade: () => void }) {
  return <section className="pg-element-library" aria-label="Add elements">
    <h2>Add elements</h2>
    <p>Choose an element or drag its handle into the page structure. On desktop, drop on the canvas to add it to the selected area.</p>
    {enabled ? <div className="pg-element-list">{elements.map(item => <PaletteItem key={item.kind} {...item} add={add} />)}</div>
      : <button className="pg-element-upgrade" onClick={upgrade}>Use the flexible editor <span aria-hidden="true">↗</span></button>}
  </section>;
}

export function ElementDropSlot({ parent, before, dragging }: { parent: string; before: string | null; dragging: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot:${parent}:${before || 'end'}`, data: { parent, before }, disabled: !dragging });
  return <li ref={setNodeRef} className={`pg-element-slot ${dragging ? 'available' : ''} ${isOver ? 'over' : ''}`} aria-hidden="true">{dragging ? 'Drop here' : ''}</li>;
}

export function CanvasDropZone({ dragging, destination }: { dragging: boolean; destination: string }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas', disabled: !dragging });
  return <div ref={setNodeRef} className={`pg-canvas-drop ${dragging ? 'active' : ''} ${isOver ? 'over' : ''}`} aria-hidden="true">
    {dragging && <span>Drop to add to {destination}</span>}
  </div>;
}
