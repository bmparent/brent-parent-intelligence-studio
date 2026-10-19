import {effectPresets,applyEffectPreset} from './effectPresets';
import { Color, Range, Toggle } from './Controls';
import { validateProject, type Project } from './model';
import { Preview } from './Preview';

type Props = { project: Project; edit: (p: Project, group?: string) => void; documentId: string; guard: () => () => boolean; notify: (v: string) => void; mobile: boolean };
export function EffectStudio({project,edit,documentId,guard,notify,mobile}: Props) {
  const set = <K extends keyof Project['glass']>(key: K, value: Project['glass'][K]) => edit(validateProject({...project, glass: {...project.glass, [key]:value}}), 'glass:'+key);
  return <div className="studio-effect">
    <section className="studio-controls" aria-label="Effect controls">
      <h2>Shape the surface</h2><p>Original Eidos glass, on your actual page. Scroll the preview to reveal the surface.</p>
      <label>Starting effect<select aria-label="Effect preset" defaultValue="" onChange={e=>{edit(applyEffectPreset(project,e.target.value as keyof typeof effectPresets));notify('Effect applied. Undo restores your previous settings.');e.target.value='';}}><option disabled value="">Choose a reference</option>{Object.keys(effectPresets).map(name=><option key={name}>{name}</option>)}</select></label>
      <Toggle label="Glass enabled" checked={project.glass.enabled} onChange={v=>set('enabled',v)}/>
      <Range label="Frost" value={project.glass.frost} min={0} max={16} step={.5} unit="px" onChange={v=>set('frost',v)}/>
      <Range label="Edge light" value={project.glass.edge} min={0} max={1} step={.01} onChange={v=>set('edge',v)}/>
      <Range label="Prism" value={project.glass.prism} min={0} max={.8} step={.01} onChange={v=>set('prism',v)}/>
      <Range label="Corner radius" value={project.glass.radius} min={0} max={48} unit="px" onChange={v=>set('radius',v)}/>
      <Range label="Light response" value={project.glass.response} min={10} max={60} onChange={v=>set('response',v)}/>
      <Color label="Solid surface" value={project.glass.solid} onChange={v=>set('solid',v)}/>
      <Toggle label="Use reduced motion" checked={project.glass.reducedMotion} onChange={v=>set('reducedMotion',v)}/>
      <button onClick={()=>edit(applyEffectPreset(project,'Approved Eidos header'))}>Restore approved reference</button>
      <details><summary>Output & fallback</summary><p>Export a complete page or reusable header. Both use this renderer and package your images. This editor needs no WebGL. Browsers without SVG refraction retain a readable frosted surface; with JavaScript disabled, navigation stays solid and usable.</p><p>The named reference is a copy of the approved header preset. Editing here changes this project.</p></details>
    </section>
    <div className="studio-page-preview"><Preview project={project} documentId={documentId} selected="header" editing={false} mobile={mobile} guard={guard} notify={notify} onSelect={()=>{}} onLink={href=>notify('Exported link: '+href)}/></div>
  </div>;
}
