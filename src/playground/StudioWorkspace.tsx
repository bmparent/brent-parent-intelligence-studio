import { useEffect, useState } from 'react';
import type { useProject } from './useProject';
import { validateProject, sectionKind, type Project } from './model';
import { selectStudio } from './studioProject';
import { studioModes, type StudioMode } from './studioSchema';
import { EffectStudio } from './EffectStudio';
import { ArtworkStudio } from './ArtworkStudio';
import { MotionStudio } from './MotionStudio';
import { LayoutStudio } from './LayoutStudio';
import { AgentCommands } from './AgentCommands';
import { artworkFiles, artworkPng } from './artworkRenderer';
import { motionFiles } from './motionRenderer';
import { download, exportFiles, headerFiles, zipFiles } from './export';
import { CloudProjects } from './CloudProjects';
import { MediaBrand } from './MediaBrand';
import './studioWorkspace.css';

export function StudioPicker({value,choose,disabled=false}:{value:StudioMode;choose:(v:StudioMode)=>void;disabled?:boolean}) {
  return <label className="studio-picker">Workspace<select aria-label="Studio" disabled={disabled} value={value} onChange={e=>choose(e.target.value as StudioMode)}>{studioModes.map(v=><option key={v} value={v}>{v==='page'?'Page editor':v[0].toUpperCase()+v.slice(1)+' Studio'}</option>)}</select></label>;
}
export function StudioWorkspace({workspace:w}:{workspace:ReturnType<typeof useProject>}) {
  const {project}=w;
  const mode=project.studios?.active||'effect';
  const [notice,setNotice]=useState(''),[variation,setVariation]=useState(''),[mobile,setMobile]=useState(()=>typeof window!=='undefined'&&window.innerWidth<=760),[panel,setPanel]=useState<'canvas'|'tools'>('canvas'),[compare,setCompare]=useState<Project|null>(null),[media,setMedia]=useState(false);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),6500);return()=>clearTimeout(timer);},[notice]);
  const edit=(p:Project|((current:Project)=>Project),group?:string)=>{try{w.edit(validateProject(typeof p==='function'?p(project):p),group);setCompare(null);}catch(e){setNotice((e as Error).message);}};
  const output=(kind:'project'|'page'|'header'|'studio')=>{
    try{
      if(compare)throw Error('Return to your current design before exporting.');
      const source=validateProject(project);
      if(kind==='project'){download(JSON.stringify(source,null,2),'project.json','application/json');return;}
      const files=kind==='page'?exportFiles(source):kind==='header'?headerFiles(source):mode==='artwork'&&source.studios?.artwork?artworkFiles(source.studios.artwork):mode==='motion'&&source.studios?.motion?motionFiles(source.studios.motion):exportFiles(source);
      // The complete shared document travels alongside studio-specific source.
      const complete=files.filter(f=>f.name!=='project.json').concat({name:'project.json',data:new TextEncoder().encode(JSON.stringify(source,null,2))});
      download(zipFiles(complete),'eidos-'+(kind==='studio'?mode:kind)+'.zip','application/zip');setNotice('Downloaded. Extract the ZIP and open its output independently; project.json reopens the complete workspace.');
    }catch(e){setNotice((e as Error).message);}
  };
  const display=compare||project;
  const guard=w.guard;
  return <div className="studio-app" data-panel={panel}
    onPointerDownCapture={e=>{if((e.target as HTMLElement).matches('input[type=range]'))w.beginGesture();}}
    onPointerUpCapture={w.endGesture} onPointerCancelCapture={w.endGesture}
    onKeyDownCapture={e=>{if((e.target as HTMLElement).matches('input[type=range]')&&!e.repeat&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))w.beginGesture();}}
    onKeyUpCapture={w.endGesture} onBlurCapture={w.endGesture}>
    <header className="studio-toolbar"><a href="/" className="studio-brand"><img src="/brand/eidos-mark.svg" alt="Eidos Works" width="28" height="28"/><span>Playground</span></a><StudioPicker value={mode} choose={v=>{w.endGesture();edit(selectStudio(project,v));}}/>
      <input aria-label="Project name" value={project.name} maxLength={100} onChange={e=>edit({...project,name:e.target.value},'name')}/>
      <div className="studio-actions"><button aria-label="Undo" disabled={!w.canUndo} onClick={()=>{w.undo();setCompare(null);}}>Undo</button><button aria-label="Redo" disabled={!w.canRedo} onClick={w.redo}>Redo</button><button onClick={async()=>setNotice(await w.saveNow()?'Saved on this device.':'Save did not complete for this revision. Download project JSON to keep your work.')}>Save locally</button><button className="studio-primary" onClick={()=>output('studio')}>Export {mode==='motion'?'animation':mode==='artwork'?'artwork':'page'}</button></div>
    </header>
    <nav className="studio-mobile-panels" aria-label="Studio panels"><button aria-pressed={panel==='canvas'} onClick={()=>setPanel('canvas')}>Canvas</button><button aria-pressed={panel==='tools'} onClick={()=>setPanel('tools')}>Project & tools</button></nav>
    <div className="studio-body"><aside className="studio-project-tools"><h1>{mode[0].toUpperCase()+mode.slice(1)} Studio</h1><p className={'studio-save '+(w.storageError?'is-error':'')} role="status">{w.status}<small>Local browser workspace · account save is separate</small></p>
      <label className="studio-import">Import project JSON<input type="file" aria-label="Import studio project" accept="application/json,.json" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;const current=guard();try{if(file.size>16_000_000)throw Error('Maximum project size is 16 MB.');const next=validateProject(JSON.parse(await file.text()));if(!current())throw Error('Import ignored because the project changed. Choose it again.');if(!await w.replace(next))throw Error('Import paused: save your current project and try again.');setCompare(null);setNotice('Project reopened. Undo restores the previous workspace.');}catch(err){setNotice((err as Error).message);}}}/></label>
      <button onClick={()=>output('project')}>Download project JSON</button>
      <details open><summary>Variations</summary><label>Name<input aria-label="Variation name" value={variation} maxLength={70} onChange={e=>setVariation(e.target.value)}/></label><button disabled={!variation.trim()} onClick={()=>{w.saveSnapshot(variation.trim());setVariation('');setNotice('Variation added to local autosave.');}}>Save variation</button>{w.snapshots.map(s=><div className="studio-variation" key={s.id}><span>{s.name}</span><button onClick={async()=>{if(await w.replace(s.project))setCompare(null);}}>Restore {s.name}</button><button disabled={mode!=='effect'} onClick={()=>setCompare(compare===s.project?null:s.project)}>Compare {s.name}</button></div>)}</details>
      {(mode==='effect'||mode==='layout')&&<><button aria-pressed={mobile} onClick={()=>setMobile(!mobile)}>Phone preview</button><button onClick={()=>output('header')}>Export header component</button><button onClick={()=>setMedia(!media)}>Media & brand</button></>}
      <AgentCommands isCurrent={w.guard()} project={project} documentId={w.documentId} revision={w.revision} edit={edit} undo={w.undo} redo={w.redo} canUndo={w.canUndo} canRedo={w.canRedo} save={w.saveNow} exportProject={()=>output('project')} notify={setNotice}/>
      {mode==='artwork'&&project.studios?.artwork&&<button onClick={async()=>{const valid=guard();try{const destination=project.sections.find(s=>sectionKind(s)==='work');if(!destination)throw Error('Add a Selected work section in Page editor before applying artwork.');const bytes=await artworkPng(project.studios!.artwork!);if(!valid())throw Error('Project changed while preparing artwork. Apply the current design again.');const base64=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));edit({...project,sections:project.sections.map(s=>s.id===destination.id?{...s,image:'data:image/png;base64,'+base64,alt:'Original artwork from this project'}:s)});setNotice('Artwork applied to Selected work. Open Page editor or Effect Studio to see it.');}catch(e){setNotice((e as Error).message);}}}>Apply artwork to page</button>}
      <CloudProjects project={project} target={w.target} documentId={w.documentId} guard={guard} load={w.replace} acknowledge={w.acknowledge} disabled={!w.ready||!!compare}/>
      <details><summary>Start & use</summary><p>Choose a studio, edit its example, then save a variation. Local saves finish when the transaction confirms. Project JSON contains the complete design and embedded uploads.</p><p>Exports work after extraction without an account or provider. Artwork includes vector output; Motion includes a browser animation. A page/header uses the original Eidos renderer. Review each ZIP's README before publishing.</p><a href="/shop/configure">Configure a template</a></details>
    </aside><main className="studio-canvas" aria-label="Studio canvas">
      {compare&&<div className="studio-compare">Saved variation preview; controls restore current work.<button onClick={()=>setCompare(null)}>Return to current design</button></div>}
      {media?<MediaBrand project={project} edit={edit} guard={guard} notify={setNotice} close={()=>setMedia(false)}/>:mode==='effect'?<EffectStudio key={w.documentId} project={display} edit={(next,group)=>{if(compare)setNotice('Return to your current design before editing.');else edit(next,group);}} documentId={w.documentId} guard={guard} notify={setNotice} mobile={mobile}/>:mode==='artwork'&&project.studios?.artwork?<ArtworkStudio key={w.documentId} value={project.studios.artwork} onChange={(artwork,group)=>edit({...project,studios:{...project.studios!,artwork}},group)} guard={guard} notify={setNotice}/>:mode==='motion'&&project.studios?.motion?<MotionStudio key={w.documentId} value={project.studios.motion} onChange={(motion,group)=>edit({...project,studios:{...project.studios!,motion}},group)} guard={guard} notify={setNotice}/>:<LayoutStudio key={w.documentId} project={project} edit={edit} documentId={w.documentId} guard={guard} notify={setNotice}/>}
    </main></div>
    {notice&&<div className="studio-notice" role="status">{notice}<button aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></div>}
  </div>;
}
