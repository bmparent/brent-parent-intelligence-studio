import { useEffect, useRef, useState } from 'react';
import { blockLayoutPatch, moveBlockStep } from './blockArrange';
import { startListMove } from './listMove';
import { type Project } from './model';
import { flattenNodes, isContainer, nodeTypes, blockMotionPresets, type BlockMotion, type BlockNode, type NodeType } from './authoringSchema';
import { applyBlockOperation, enableBlocks, setBlockMotion, type BlockOperation } from './authoring';
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
        drag.current(); drag.current = startListMove(event, guard(), (id, before, parentId) => {
            try {
                const parent = project.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []).find(n => n.id === parentId);
                if (parent) { const next = applyBlockOperation(project, {type:'move',id,parent:parent.id,before:before || null}); if(next!==project)edit(next); }
            } catch(error) { notify((error as Error).message); }
        }, {nested:true});
    }
    if (project.schemaVersion < 4)
        return <section className="pg-project-tools"><h3>Responsive blocks</h3><p>Add independent images, text and buttons in responsive containers. This explicit upgrade changes the hero to normal document flow; Undo restores the original design and format.</p><button onClick={() => { try {
            edit(enableBlocks(project));
            notify('Responsive blocks enabled. Select an element in Preview or Layers. Undo restores the original format.');
        }
        catch (e) {
            notify((e as Error).message);
        } }}>Enable responsive blocks</button></section>;
    function node(n: BlockNode, section: string, child = false): React.ReactNode { return <li key={n.id} data-sort-id={n.id}><div className="pg-layer-line"><button className={selected === n.id ? 'pg-layer-selected' : ''} aria-pressed={selected === n.id} onClick={() => onSelect(n.id, section)}>{n.image ? <img src={n.image} alt=""/> : <span aria-hidden="true">{isContainer(n) ? '▤' : n.type === 'image' ? '▧' : 'T'}</span>}<span>{n.name || n.type}</span></button>{child && <button className="pg-layer-drag" aria-label={'Drag layer '+n.name} onPointerDown={move}>⠿</button>}</div>{child && selected === n.id && <div className="pg-layer-order" role="group" aria-label={'Reorder ' + n.name}>{([-1, 1] as const).map(direction => { const parent = project.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []).find(p => p.children?.some(c => c.id === n.id))!; const index = parent.children!.findIndex(c => c.id === n.id); return <button key={direction} disabled={index + direction < 0 || index + direction >= parent.children!.length} aria-label={`Move layer ${n.name} ${direction === -1 ? 'earlier' : 'later'}`} onClick={() => { try { const next = moveBlockStep(project, n.id, direction); if (next !== project) { edit(next); notify(`${n.name} moved ${direction === -1 ? 'earlier' : 'later'}.`); } } catch (error) { notify((error as Error).message); } }}>{direction === -1 ? '↑ Earlier' : '↓ Later'}</button>; })}</div>}{n.children && <ul data-sort-container={n.id} data-sort-name={n.name || n.type} style={{minHeight:28,paddingBottom:24}}>{n.children.map(child => node(child, section, true))}</ul>}</li>; }
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
    const [kind, setKind] = useState<NodeType>('image');
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
    function motion(value?: BlockMotion) { try {
        const next = setBlockMotion(project, node.id, value);
        if (next !== project) edit(next);
    } catch (error) { notify((error as Error).message); } }
    const field = (label: string, value: string, key: 'name' | 'text' | 'href' | 'alt', multiline = false) => <label className="pg-block-field">{label}{multiline ? <textarea key={node.id + key + value} defaultValue={value} maxLength={key === 'text' ? (node.type === 'heading' ? 240 : node.type === 'button' ? 100 : 8000) : 300} onBlur={e => { if (e.target.value !== value)
        patch({ [key]: e.target.value }); }}/> : <input key={node.id + key + value} defaultValue={value} maxLength={key === 'name' ? 60 : key === 'href' ? 1000 : 300} onBlur={e => { if (e.target.value !== value)
        patch({ [key]: e.target.value }); }}/>}</label>;
    function number(label: string, key: 'width' | 'height' | 'gap' | 'split', min: number, max: number) { const value = mobile && key !== 'split' ? node.mobile?.[key] ?? (key==='width'?100:key==='height'?Math.min(node.height,360):node[key]) : node[key]; return <label className="pg-block-field">{label}{mobile && key !== 'split' && <span className="pg-value-origin">{node.mobile?.[key] === undefined ? 'Inherited' : 'Override'}</span>}<input key={node.id + key + mobile + value} type="number" min={min} max={max} defaultValue={value} onBlur={e => { const v = Number(e.target.value); if (v === value)
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
    const hasMobileOverride = !!Object.keys(node.mobile || {}).length || node.media?.mobileX !== undefined || node.media?.mobileY !== undefined;
    return <aside className="pg-inspector pg-block-controls" aria-label="Block controls"><h2>{node.name || node.type}</h2><p>{mobile ? hasMobileOverride ? 'Mobile · custom values override the responsive defaults' : 'Mobile · inherits desktop with automatic stacking and image sizing' : 'Desktop settings · mobile inherits unless you add an override'}</p>{mobile && <button disabled={!hasMobileOverride} onClick={() => {const media={...(node.media||defaultMedia())};delete media.mobileX;delete media.mobileY;patch({mobile:undefined,...(node.media?{media}: {})});}}>Reset mobile overrides</button>}
 {parent && <section className="pg-arrange-card" aria-label="Arrange selected element">
 <div className="pg-arrange-heading"><strong>Arrange</strong><span>{parent.children!.indexOf(node) + 1} of {parent.children!.length}</span></div>
 <p>Inside <button className="pg-parent-link" onClick={() => onSelect(parent.id, currentSection.id)}>{parent.name || parent.type}</button></p>
 <div className="pg-arrange-step"><button disabled={parent.children![0].id === node.id} onClick={() => { const next = moveBlockStep(project, node.id, -1); if (next !== project) { edit(next); notify(`${node.name} moved earlier. Undo restores its position.`); } }}>↑ Move earlier</button><button disabled={parent.children!.at(-1)!.id === node.id} onClick={() => { const next = moveBlockStep(project, node.id, 1); if (next !== project) { edit(next); notify(`${node.name} moved later. Undo restores its position.`); } }}>↓ Move later</button></div>
 <details><summary>Move to another container</summary><form key={node.id + parent.id} onSubmit={event => { event.preventDefault(); const destination = new FormData(event.currentTarget).get('destination'); if (typeof destination !== 'string' || destination === parent.id) return; try { const next = applyBlockOperation(project, { type: 'move', id: node.id, parent: destination, before: null }); const section = next.sections.find(s => s.authoring && flattenNodes(s.authoring.root).some(n => n.id === node.id))!; edit(next); onSelect(node.id, section.id); notify(`${node.name} moved. Undo restores its position.`); } catch (error) { notify((error as Error).message); } }}><label className="pg-block-field">Destination<select aria-label="Move to container" name="destination" defaultValue={parent.id}>{containers.filter(c => !flattenNodes(node).some(v => v.id === c.id)).map(c => <option key={c.id} value={c.id}>{c.name} · {project.sections.find(s => s.authoring && flattenNodes(s.authoring.root).some(n => n.id === c.id))?.title}</option>)}</select></label><button type="submit">Move here</button></form></details>
 <small>Elements stay in responsive page flow. Moves apply to desktop and mobile.</small>
 </section>}
 <fieldset className="pg-layout-quick"><legend>Layout · {mobile ? 'Mobile' : 'Desktop'}</legend><div className="pg-layout-label">Alignment</div><div className="pg-layout-options" role="group" aria-label="Quick alignment">{(['left', 'center', 'right'] as const).map(align => <button key={align} aria-pressed={(mobile ? node.mobile?.align || node.align : node.align) === align} onClick={() => patch(blockLayoutPatch(node, mobile, { align }))}><span aria-hidden="true">{{left:'⇤',center:'↔',right:'⇥'}[align]}</span>{align[0].toUpperCase() + align.slice(1)}</button>)}</div>{isContainer(node) && <><div className="pg-layout-label">Space between elements</div><div className="pg-layout-options" role="group" aria-label="Spacing presets">{([{ label: 'Tight', gap: 12 }, { label: 'Balanced', gap: 24 }, { label: 'Airy', gap: 48 }]).map(preset => <button key={preset.gap} aria-pressed={(mobile ? node.mobile?.gap ?? node.gap : node.gap) === preset.gap} onClick={() => patch(blockLayoutPatch(node, mobile, { gap: preset.gap }))}>{preset.label}<small>{preset.gap} px</small></button>)}</div></>}<small>{mobile ? 'Changes here apply only to mobile.' : 'Mobile inherits these settings unless overridden.'} Fine-tune values below.</small></fieldset>
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
 <fieldset className="pg-block-motion"><legend>Element motion</legend><label className="pg-block-field">Entrance<select aria-label="Element entrance" value={node.motion?.preset || 'none'} onChange={event => motion(event.target.value === 'none' ? undefined : { preset: event.target.value as BlockMotion['preset'], duration: node.motion?.duration ?? 600, delay: node.motion?.delay ?? 0 })}><option value="none">None</option>{blockMotionPresets.map(preset => <option key={preset} value={preset}>{{ fade: 'Fade in', rise: 'Gentle rise', settle: 'Soft settle' }[preset]}</option>)}</select></label>{node.motion && <><label className="pg-block-field">Duration (ms)<input key={node.id + 'motion-duration' + node.motion.duration} type="number" min="200" max="1600" step="50" defaultValue={node.motion.duration} onBlur={event => { const duration = Number(event.target.value); if (!Number.isFinite(duration) || duration < 200 || duration > 1600) { event.target.value = String(node.motion!.duration); notify('Motion duration must be 200–1600 ms.'); } else if (duration !== node.motion!.duration) motion({ ...node.motion!, duration }); }} /></label><label className="pg-block-field">Delay (ms)<input key={node.id + 'motion-delay' + node.motion.delay} type="number" min="0" max="1200" step="50" defaultValue={node.motion.delay} onBlur={event => { const delay = Number(event.target.value); if (!Number.isFinite(delay) || delay < 0 || delay > 1200) { event.target.value = String(node.motion!.delay); notify('Motion delay must be 0–1200 ms.'); } else if (delay !== node.motion!.delay) motion({ ...node.motion!, delay }); }} /></label><button onClick={() => motion()}>Remove motion</button></>}<p>Plays once when the page opens. Choose Preview to see it. Motion stays off while editing and follows reduced-motion preferences on desktop and mobile.</p>{project.schemaVersion === 4 && <small>Adding motion upgrades this local project to version 5. One Undo restores its original format.</small>}</fieldset>
 <label className="pg-block-field">Alignment{mobile && <span className="pg-value-origin">{node.mobile?.align === undefined ? 'Inherited' : 'Override'}</span>}<select aria-label="Alignment" value={mobile ? node.mobile?.align || node.align : node.align} onChange={e => patch(mobile ? { mobile: { ...node.mobile, align: e.target.value as BlockNode['align'] } } : { align: e.target.value as BlockNode['align'] })}>{['left', 'center', 'right'].map(v => <option key={v}>{v}</option>)}</select></label>
 {isContainer(node) && <>{number('Gap (px)', 'gap', 0, 96)}{!mobile && node.type === 'columns' && node.children?.length === 2 && number('First column share (%)', 'split', 20, 80)}<label className="pg-block-field">Add element<select aria-label="Add element" value={kind} onChange={e => setKind(e.target.value as NodeType)}>{nodeTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></label><button onClick={() => run({ type: 'add', parent: node.id, kind })}>Add {kind}</button>{mobile && <label className="pg-block-field">Mobile layout<select aria-label="Mobile layout" value={node.mobile?.layout || 'stack'} onChange={e => patch({ mobile: { ...node.mobile, layout: e.target.value as 'stack' | 'row' } })}><option value="stack">Automatic stack</option><option value="row">Row</option></select></label>}</>}
 {parent && <><div className="pg-block-actions"><button onClick={() => run({ type: 'duplicate', id: node.id })}>Duplicate</button><button onClick={() => { run({ type: 'remove', id: node.id }); onSelect(parent.id, currentSection.id); }}>Remove from this design</button></div></>}
 <small>Removing a block affects this design only. Existing revisions and image assets are preserved.</small></aside>;
}
