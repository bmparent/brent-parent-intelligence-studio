import { useId } from 'react';
import type { Project } from './model';
import { applyCompositionOperation, enableComposition } from './composition';
import { imagePlacements, type Composition, type ImagePlacement } from './compositionSchema';
import { Range, Color } from './Controls';
import './compositionEditor.css';
const partLabels = { title: 'Heading', description: 'Description', cta: 'Button', image: 'Image' };
const placementLabels: Record<ImagePlacement, string> = {
  background: 'Behind text · hero background', left: 'Beside text · left', right: 'Beside text · right',
  above: 'Above all hero content', below: 'Below all hero content', inline: 'Within text · use element order',
};
export function CompositionControls({ project, sectionId, edit, notify }: {
  project: Project; sectionId: string;
  edit: (value: Project | ((current: Project) => Project), group?: string) => void;
  notify: (message: string) => void;
}) {
  const uid = useId();
  const section = project.sections.find(s => s.id === sectionId);
  if (!section) return null;
  const c = section.composition;
  if (!c) return <section className="pg-composition-controls" aria-label="Hero layout">
    <h3>Put everything in its place.</h3>
    <p>Place an image behind your text, beside it, or between the heading and button.</p>
    <button className="pg-primary" onClick={() => { try { edit(enableComposition(project)); notify('Spatial composition enabled. Undo restores your original project.'); } catch(error) { notify((error as Error).message); } }}>Enable spatial composition</button>
    <small>Opt-in project upgrade. Your images, text and original glass settings stay with you.</small>
  </section>;
  const patch = (value: Partial<Composition>, group?: string) => {
    try { edit(applyCompositionOperation(project, { type: 'settings', sectionId, patch: value }), group && sectionId + ':composition:' + group); }
    catch(error) { notify((error as Error).message); }
  };
  return <section className="pg-composition-controls" aria-label="Hero layout">
    <h3>Hero layout <span>Spatial</span></h3>
    <p>Drag the labeled handles in the preview, or use these controls. Drop a photo directly into the hero.</p>
    <label htmlFor={uid + '-placement'}>Image placement</label>
    <select id={uid + '-placement'} value={c.placement} onChange={event => patch({ placement: event.target.value as ImagePlacement })}>
      {imagePlacements.map(value => <option key={value} value={value}>{placementLabels[value]}</option>)}
    </select>
    <div className="pg-composition-shortcuts">
      <button onClick={() => patch({ placement: 'background' })}>Behind text</button>
      <button onClick={() => {
        try { edit(applyCompositionOperation(project, { type: 'move', sectionId, part: 'image', before: c.order.filter(p => p !== 'image')[c.order.filter(p => p !== 'image').indexOf('title') + 1] || null })); }
        catch(error) { notify((error as Error).message); }
      }}>Below heading</button>
    </div>
    <label htmlFor={uid + '-mobile'}>Image placement on phones</label>
    <select id={uid + '-mobile'} value={c.mobilePlacement} onChange={event => patch({ mobilePlacement: event.target.value as Composition['mobilePlacement'] })}>
      <option value="auto">Automatic · side images stack below</option>
      {(['background','above','below','inline'] as const).map(value => <option key={value} value={value}>{placementLabels[value]}</option>)}
    </select>
    <h4>Element order</h4>
    <p className="pg-composition-note">Text order applies at every size. The image joins this order when placed within the text.</p>
    <ol className="pg-composition-order">
      {c.order.map((part, index) => <li key={part}>
        <span>{partLabels[part]}</span>
        <button aria-label={`Move ${partLabels[part].toLowerCase()} earlier`} disabled={index === 0} onClick={() => {
          try { edit(applyCompositionOperation(project, { type: 'move', sectionId, part, before: c.order[index - 1] })); }
          catch(error) { notify((error as Error).message); }
        }}>↑</button>
        <button aria-label={`Move ${partLabels[part].toLowerCase()} later`} disabled={index === c.order.length - 1} onClick={() => {
          try { edit(applyCompositionOperation(project, { type: 'move', sectionId, part, before: c.order[index + 2] || null })); }
          catch(error) { notify((error as Error).message); }
        }}>↓</button>
      </li>)}
    </ol>
    <label htmlFor={uid + '-align'}>Content alignment</label>
    <select id={uid + '-align'} value={c.align} onChange={event => patch({ align: event.target.value as Composition['align'] })}>{(['left','center','right'] as const).map(v => <option key={v}>{v}</option>)}</select>
    <Range label="Space between elements" value={c.gap} min={0} max={96} unit="px" onChange={gap => patch({gap},'gap')} />
    <Range label="Content width" value={c.contentWidth} min={30} max={100} unit="%" onChange={contentWidth => patch({contentWidth},'width')} />
    <details><summary>Image depth and fine positioning</summary>
      <p className="pg-composition-note">Use Media / Brand for crop, focal point and alternative text. Fine transforms reset on phones to protect the layout.</p>
      <Color label="Background overlay color" value={c.overlay} onChange={overlay => patch({overlay},'overlay')} />
      <Range label="Background overlay strength" value={c.overlayOpacity} min={0} max={0.85} step={0.01} onChange={overlayOpacity => patch({overlayOpacity},'overlayOpacity')} />
      <Range label="Image opacity" value={c.imageOpacity} min={0.1} max={1} step={0.01} onChange={imageOpacity => patch({imageOpacity},'imageOpacity')} />
      <Range label="Image blur" value={c.blur} min={0} max={20} step={0.5} unit="px" onChange={blur => patch({blur},'blur')} />
      <Range label="Horizontal image offset" value={c.offsetX} min={-15} max={15} unit="%" onChange={offsetX => patch({offsetX},'x')} />
      <Range label="Vertical image offset" value={c.offsetY} min={-15} max={15} unit="%" onChange={offsetY => patch({offsetY},'y')} />
      <Range label="Image rotation" value={c.rotation} min={-15} max={15} unit="°" onChange={rotation => patch({rotation},'rotation')} />
      <Range label="Image scale" value={c.scale} min={0.75} max={1.5} step={0.01} unit="×" onChange={scale => patch({scale},'scale')} />
      <Range label="Desktop hero minimum height" value={c.minHeight} min={240} max={1000} unit="px" onChange={minHeight => patch({minHeight},'height')} />
      <label htmlFor={uid + '-mobile-align'}>Phone text alignment</label>
      <select id={uid + '-mobile-align'} value={c.mobileAlign} onChange={event => patch({mobileAlign:event.target.value as Composition['mobileAlign']})}>{(['inherit','left','center','right'] as const).map(v => <option key={v}>{v}</option>)}</select>
      <button onClick={() => patch({offsetX:0,offsetY:0,rotation:0,scale:1,blur:0,imageOpacity:1})}>Reset image adjustments</button>
    </details>
    <small>Check readability over your actual photo. An overlay is not an automatic contrast guarantee.</small>
  </section>;
}
