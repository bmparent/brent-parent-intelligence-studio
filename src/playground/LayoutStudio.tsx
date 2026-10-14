import {flattenNodes} from './authoringSchema';
import { useState } from 'react';
import { labels, sectionKind, validateProject, type Project } from './model';
import { upgradeProject } from './model';
import { Preview } from './Preview';
import { Range } from './Controls';
import { moveSectionBefore } from './composition';
import { StructureControls } from './StructureControls';
import { BlockControls, BlockTree } from './BlockControls';
import { enableBlocks } from './authoring';
type Props={project:Project;edit:(p:Project|((current:Project)=>Project),group?:string)=>void;documentId:string;guard:()=>()=>boolean;notify:(v:string)=>void};
export function LayoutStudio({project,edit,documentId,guard,notify}:Props) {
  const [selected,setSelected]=useState('hero'),[node,setNode]=useState(''),[view,setView]=useState<'canvas'|'responsive'|'structure'>('canvas');
  const section=project.sections.find(s=>s.id===selected)||project.sections[1];
  const select=(id:string,sectionId:string)=>{setNode(id);setSelected(sectionId);};
  const patch=(key:'spacing'|'mobileSpacing'|'align'|'mobileAlign',value:number|string)=>{
    const p=upgradeProject(project);
    edit(validateProject({...p,sections:p.sections.map(s=>s.id===section.id?{...s,style:{spacing:p.tokens.spacing,align:'left',background:'',...s.style,[key]:value}}:s)}),'layout:'+key);
  };
  return <div className="studio-layout">
    <aside className="studio-controls"><h2>One layout, every view</h2>
      <div className="studio-view-switch" aria-label="Layout view">{(['structure','canvas','responsive'] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v}</button>)}</div>
      <ol className="studio-structure">{project.sections.map((s,i)=><li key={s.id}><button aria-pressed={s.id===section.id} onClick={()=>{setSelected(s.id);setNode('');}}>{labels[sectionKind(s)]}</button>{i>0&&i<project.sections.length-1&&<><button aria-label={'Move '+labels[sectionKind(s)]+' earlier'} disabled={i===1} onClick={()=>edit(moveSectionBefore(project,s.id,project.sections[i-1].id))}>↑</button><button aria-label={'Move '+labels[sectionKind(s)]+' later'} disabled={i===project.sections.length-2} onClick={()=>edit(moveSectionBefore(project,s.id,project.sections[i+2].id))}>↓</button></>}</li>)}</ol>
      {!['header','footer'].includes(sectionKind(section))&&<><Range label="Desktop section spacing" min={0} max={160} value={section.style?.spacing??project.tokens.spacing} onChange={v=>patch('spacing',v)}/><Range label="Phone section spacing" min={0} max={160} value={section.style?.mobileSpacing??section.style?.spacing??project.tokens.spacing} onChange={v=>patch('mobileSpacing',v)}/><label>Alignment<select aria-label="Section alignment" value={section.style?.align||'left'} onChange={e=>patch('align',e.target.value)}>{['left','center','right'].map(v=><option key={v}>{v}</option>)}</select></label></>}
      <StructureControls project={project} selected={section.id} edit={edit} notify={notify} guard={guard}/>
      {!project.sections.some(s=>s.authoring)&&<button onClick={()=>edit(enableBlocks(project))}>Enable responsive blocks</button>}
      <BlockTree project={project} selected={node} onSelect={select} edit={edit} notify={notify} guard={guard}/>
      <details><summary>Use your layout</summary><p>Structure, canvas and phone views share these section identities. Arrow buttons offer keyboard reordering. Select responsive blocks to group, duplicate and edit their flow. Export the page to use it independently.</p></details>
    </aside>
    <section className={'studio-layout-views '+(view==='responsive'?'is-responsive':'')} aria-label="Synchronized layout previews">
      {view==='structure'?<div className="studio-structure-board" role="tree" aria-label="Page structure">{project.sections.map(s=><button role="treeitem" key={s.id} aria-selected={s.id===section.id} onClick={()=>{setSelected(s.id);setNode('');}}><strong>{labels[sectionKind(s)]}</strong><span>{s.title||'Empty section'}</span><small>{s.visible?'Visible':'Hidden'} � {s.style?.spacing??project.tokens.spacing}px desktop / {s.style?.mobileSpacing??s.style?.spacing??project.tokens.spacing}px phone</small>{s.authoring&&<span className="studio-structure-nodes">{flattenNodes(s.authoring.root).map(n=><small key={n.id}>{n.name||n.type}</small>)}</span>}</button>)}</div>:<Preview project={project} documentId={documentId} selected={section.id} selectedNode={node} editing={true} mobile={false} edit={edit} guard={guard} notify={notify} onSelect={setSelected} onNodeSelect={select} onInspectNode={select} onLink={notify}/>}
      {view==='responsive'&&<Preview project={project} documentId={documentId} selected={section.id} editing={false} mobile={true} guard={guard} notify={notify} onSelect={setSelected} onLink={notify}/>}
      {section.authoring&&<BlockControls project={project} selected={node} onSelect={select} edit={edit} notify={notify} guard={guard} mobile={false}/>}
    </section>
  </div>;
}
