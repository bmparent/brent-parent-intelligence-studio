import { useEffect, useRef, useState } from 'react';
import { startListMove } from './listMove';
import { type Project } from './model';
import { flattenNodes, isContainer, nodeTypes, type BlockNode, type NodeType } from './authoringSchema';
import { applyBlockOperation, enableBlocks, type BlockOperation } from './authoring';
import { defaultMedia } from './media';
import { imageData } from './storage';
import './authoringEditor.css';
type Props = {
    project: Project;
    selected: string;
    onSelect: (id: string, sectionId: string) => void;
    edit: (p: Project) => void;
    notify: (text: string) => void;
    guard: () => () => boolean;
    mobile: boolean;
};
export function BlockTree({ project, selected, onSelect, edit, notify, guard }: Omit<Props, 'mobile'>) {
    const drag = useRef<() => void>(() => {});
    useEffect(() => () => drag.current(), [project]);
    function move(event: React.PointerEvent<HTMLButtonElement>) {
        drag.current(); drag.current = startListMove(event, guard(), (id, before) => {
            try {
                const parent = project.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []).find(n => n.children?.some(c => c.id === before));
                if (parent) { const next = applyBlockOperation(project, {type:'move',id,parent:parent.id,before}); if(next!==project)edit(next); }
            } catch(error) { notify((error as Error).message); }
        });
    }
    if (project.schemaVersion !== 4)
        return <section className="pg-project-tools"><h3>Responsive blocks</h3><p>Add independent images, text and buttons in responsive containers. This explicit upgrade changes the hero to normal document flow; Undo restores the original design and format.</p><button onClick={() => { try {
            edit(enableBlocks(project));
            notify('Responsive blocks enabled. Select an element in Preview or Layers. Undo restores the original format.');
        }
        catch (e) {
            notify((e as Error).message);
        } }}>Enable responsive blocks</button></section>;
    function node(n: BlockNode, section: string, child = false): React.ReactNode { return <li key={n.id} data-sort-id={n.id}><div className="pg-layer-line"><button className={selected === n.id ? 'pg-layer-selected' : ''} aria-pressed={selected === n.id} onClick={() => onSelect(n.id, section)}>{n.image ? <img src={n.image} alt=""/> : <span aria-hidden="true">{isContainer(n) ? '▤' : n.type === 'image' ? '▧' : 'T'}</span>}<span>{n.name || n.type}</span></button>{child && <button className="pg-layer-drag" aria-label={'Drag layer '+n.name} onPointerDown={move}>⠿</button>}</div>{n.children && <ul>{n.children.map(child => node(child, section, true))}</ul>}</li>; }
    return <section className="pg-block-tree pg-project-tools" aria-label="Layers"><h3>Layers</h3>{project.sections.filter(s => s.authoring).map(s => <div key={s.id}><strong>{s.title || s.type}</strong><ul>{node(s.authoring!.root, s.id)}</ul></div>)}<button onClick={() => { try {
        edit(applyBlockOperation(project, { type: 'add-section' }));
    }
    catch (e) {
        notify((e as Error).message);
    } }}>Add content section</button><small>Up to 96 nodes, 48 per section, three nested levels.</small></section>;
}
/** Form drafts commit on blur or submission, never on every range/typing coordinate. */
export function BlockControls({ project, selected, onSelect, edit, notify, guard, mobile }: Props) {
    const all = project.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []);
    const node = all.find(n => n.id === selected) || all[0];
    const [kind, setKind] = useState<NodeType>('image'), [destination, setDestination] = useState('');
    const [busy, setBusy] = useState(false);
    if (!node)
        return null;
    const photoZoom=mobile?node.mobile?.zoom??node.media?.zoom??1:node.media?.zoom??1;
    const containers = all.filter(isContainer), parent = all.find(n => n.children?.some(c => c.id === node.id));
    const currentSection = project.sections.find(s => s.authoring && flattenNodes(s.authoring.root).some(n => n.id === node.id))!;
    function run(operation: BlockOperation) { try {
        const next = applyBlockOperation(project, operation);
        if (next !== project)
            edit(next);
    }
    catch (e) {
        notify((e as Error).message);
    } }
    function patch(value: Partial<BlockNode>) { run({ type: 'patch', id: node.id, patch: value }); }
    const field = (label: string, value: string, key: 'name' | 'text' | 'href' | 'alt', multiline = false) => <label className="pg-block-field">{label}{multiline ? <textarea key={node.id + key + value} defaultValue={value} maxLength={key === 'text' ? (node.type === 'heading' ? 240 : node.type === 'button' ? 100 : 8000) : 300} onBlur={e => { if (e.target.value !== value)
        patch({ [key]: e.target.value }); }}/> : <input key={node.id + key + value} defaultValue={value} maxLength={key === 'name' ? 60 : key === 'href' ? 1000 : 300} onBlur={e => { if (e.target.value !== value)
        patch({ [key]: e.target.value }); }}/>}</label>;
    function number(label: string, key: 'width' | 'height' | 'gap' | 'split', min: number, max: number) { const value = mobile && key !== 'split' ? node.mobile?.[key] ?? (key==='width'?100:key==='height'?Math.min(node.height,360):node[key]) : node[key]; return <label className="pg-block-field">{label}<input key={node.id + key + mobile + value} type="number" min={min} max={max} defaultValue={value} onBlur={e => { const v = Number(e.target.value); if (v === value)
        return; if (!Number.isFinite(v) || v < min || v > max) {
        e.target.value = String(value);
        notify(`${label} must be ${min}–${max}.`);
        return;
    }
    const geometry:Partial<BlockNode> = {[key]:v};
    if(node.type==='image' && node.lockAspect && (key==='width'||key==='height')) {
      const oldWidth=mobile?node.mobile?.width??100:node.width;
      const oldHeight=mobile?node.mobile?.height??Math.min(node.height,360):node.height;
      geometry.width=key==='width'?v:oldWidth*v/oldHeight;
      geometry.height=key==='height'?v:oldHeight*v/oldWidth;
      if(geometry.width<10||geometry.width>100||geometry.height<64||geometry.height>960){e.target.value=String(value);notify('Unlock the frame aspect ratio to use those dimensions.');return;}
    }
    patch(mobile && key !== 'split' ? { mobile: { ...node.mobile, ...geometry } } : geometry); }}/></label>; }
    return <aside className="pg-inspector pg-block-controls" aria-label="Block controls"><h2>{node.name || node.type}</h2><p>{mobile ? 'Mobile settings · missing values inherit desktop or automatic stacking' : 'Desktop settings'}</p>{mobile && <button onClick={() => {const media={...(node.media||defaultMedia())};delete media.mobileX;delete media.mobileY;patch({mobile:undefined,...(node.media?{media}: {})});}}>Reset mobile overrides</button>}
 {field('Layer name', node.name, 'name')}
 {!isContainer(node) && node.type !== 'image' && <>{field('Text', node.text, 'text', true)}{node.type === 'button' && field('Link destination', node.href, 'href')}</>}
 {node.type === 'image' && <><label className="pg-upload">{busy ? 'Opening image…' : 'Replace image'}<input aria-label="Replace block image" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ''; if (!file)
        return; const valid = guard(); setBusy(true); try {
        const image = await imageData(file);
        if (!valid()) {
            notify('Workspace changed. Choose the image again.');
            return;
        }
        patch({ image, media: { ...defaultMedia(), sourceName: file.name.slice(0, 120) } });
    }
    catch (error) {
        notify((error as Error).message);
    }
    finally {
        setBusy(false);
    } }}/></label>{field('Image description', node.alt, 'alt')}{number('Frame height (px)', 'height', 64, 960)}<label><input type="checkbox" checked={node.lockAspect} onChange={e => patch({ lockAspect: e.target.checked })}/> Lock frame aspect ratio</label><p>Select Crop in the canvas toolbar to reposition the photo inside its frame. Resizing changes the frame.</p><label className="pg-block-field">Photo zoom<input key={node.id + 'zoom' + mobile + photoZoom} type="number" min="1" max="3" step="0.05" defaultValue={photoZoom} onBlur={e => { const zoom = Number(e.target.value); if (zoom >= 1 && zoom <= 3)
        patch(mobile?{mobile:{...node.mobile,zoom}}:{ media: { ...(node.media || defaultMedia()), zoom } }); }}/></label><button onClick={() => {const media={...defaultMedia(),...node.media};if(mobile){delete media.mobileX;delete media.mobileY;const overrides={...node.mobile};delete overrides.zoom;patch({media,mobile:overrides});}else patch({media:{...media,fit:'cover',x:50,y:50,zoom:1}});}}>Reset crop</button></>}
 {number('Width (%)', 'width', 10, 100)}
 <label className="pg-block-field">Alignment<select aria-label="Alignment" value={mobile ? node.mobile?.align || node.align : node.align} onChange={e => patch(mobile ? { mobile: { ...node.mobile, align: e.target.value as BlockNode['align'] } } : { align: e.target.value as BlockNode['align'] })}>{['left', 'center', 'right'].map(v => <option key={v}>{v}</option>)}</select></label>
 {isContainer(node) && <>{number('Gap (px)', 'gap', 0, 96)}{!mobile && node.type === 'columns' && node.children?.length === 2 && number('First column share (%)', 'split', 20, 80)}<label className="pg-block-field">Add element<select aria-label="Add element" value={kind} onChange={e => setKind(e.target.value as NodeType)}>{nodeTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></label><button onClick={() => run({ type: 'add', parent: node.id, kind })}>Add {kind}</button>{mobile && <label className="pg-block-field">Mobile layout<select aria-label="Mobile layout" value={node.mobile?.layout || 'stack'} onChange={e => patch({ mobile: { ...node.mobile, layout: e.target.value as 'stack' | 'row' } })}><option value="stack">Automatic stack</option><option value="row">Row</option></select></label>}</>}
 {parent && <><div className="pg-block-actions"><button onClick={() => run({ type: 'duplicate', id: node.id })}>Duplicate</button><button onClick={() => { run({ type: 'remove', id: node.id }); onSelect(parent.id, currentSection.id); }}>Remove from this design</button></div><label className="pg-block-field">Move to container<select aria-label="Move to container" value={destination || parent.id} onChange={e => setDestination(e.target.value)}>{containers.filter(c => !flattenNodes(node).some(v => v.id === c.id)).map(c => <option key={c.id} value={c.id}>{c.name} · {project.sections.find(s => s.authoring && flattenNodes(s.authoring.root).includes(c))?.title}</option>)}</select></label><button onClick={() => run({ type: 'move', id: node.id, parent: destination || parent.id, before: null })}>Move here</button><div className="pg-block-actions"><button disabled={parent.children!.indexOf(node) === 0} onClick={() => run({ type: 'move', id: node.id, parent: parent.id, before: parent.children![parent.children!.indexOf(node) - 1].id })}>Move earlier</button><button disabled={parent.children!.at(-1) === node} onClick={() => run({ type: 'move', id: node.id, parent: parent.id, before: parent.children![parent.children!.indexOf(node) + 2]?.id || null })}>Move later</button></div></>}
 <small>Removing a block affects this design only. Existing revisions and image assets are preserved.</small></aside>;
}
