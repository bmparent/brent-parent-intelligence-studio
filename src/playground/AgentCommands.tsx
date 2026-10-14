import {applyLocalCommand,applyStudioCommand,type StudioEditRequest,assertCurrent,type Envelope,type EditRequest} from './localCommands';
import { useEffect, useRef, useState } from 'react';
import { aiContext, proposalDiff, validateProposal, operationFields, type Proposal } from './aiOperations';
import type { Project } from './model';

type Props=Envelope&{isCurrent:()=>boolean;project:Project;edit:(p:Project)=>void;undo:()=>void;redo:()=>void;canUndo:boolean;canRedo:boolean;save:()=>Promise<boolean>;exportProject:()=>void;notify:(v:string)=>void};
type CommandAPI={read:()=>unknown;inspect:(id:string)=>unknown;history:()=>unknown;apply:(request:EditRequest)=>unknown;applyStudio:(request:StudioEditRequest)=>unknown;undo:(expected:Envelope)=>void;redo:(expected:Envelope)=>void;save:(expected:Envelope)=>Promise<boolean>;export:(expected:Envelope)=>void};
declare global { interface Window { eidosPlayground?:CommandAPI } }

export function AgentCommands(props:Props) {
  const current=useRef(props), pending=useRef(false);
  useEffect(()=>{current.current=props;pending.current=false;});
  const [selected,setSelected]=useState('hero'),[field,setField]=useState<string>('section.title'),[value,setValue]=useState('A clearer point of view.'),[draft,setDraft]=useState<EditRequest|null>(null),[receipt,setReceipt]=useState('');
  const id=props.project.sections.some(s=>s.id===selected)?selected:props.project.sections[1].id;
  useEffect(()=>{
    const api:CommandAPI={
      read:()=>{const p=current.current;return {documentId:p.documentId,revision:p.revision,project:structuredClone(p.project)};},
      inspect:selected=>{const p=current.current.project,object=p.studios?.artwork?.objects.find(o=>o.id===selected)||p.studios?.motion?.objects.find(o=>o.id===selected);return object?structuredClone(object):aiContext(p,selected,'section');},
      history:()=>{const p=current.current;return {documentId:p.documentId,revision:p.revision,canUndo:p.canUndo,canRedo:p.canRedo};},
      apply:request=>{if(pending.current||!current.current.isCurrent())throw Error('Stale command: a mutation is pending. Read again after the visible update.');const p=current.current,next=applyLocalCommand(p.project,p,request);const diff=proposalDiff(p.project,request.selected,request.scope,request.proposal);p.edit(next);pending.current=true;return {changed:diff,undoAvailable:true};},
      applyStudio:request=>{if(pending.current||!current.current.isCurrent())throw Error('Stale command: a mutation is pending.');const p=current.current,next=applyStudioCommand(p.project,p,request);p.edit(next);pending.current=true;return {operation:request.operation.type,undoAvailable:true};},
      undo:expected=>{if(pending.current||!current.current.isCurrent())throw Error('Stale command: a mutation is pending.');const p=current.current;assertCurrent(expected,p);p.undo();pending.current=true;},
      redo:expected=>{if(pending.current||!current.current.isCurrent())throw Error('Stale command: a mutation is pending.');const p=current.current;assertCurrent(expected,p);p.redo();pending.current=true;},
      save:async expected=>{if(pending.current||!current.current.isCurrent())throw Error('Stale command: a mutation is pending.');const p=current.current;assertCurrent(expected,p);return p.save();},
      export:expected=>{if(pending.current||!current.current.isCurrent())throw Error('Stale command: a mutation is pending.');const p=current.current;assertCurrent(expected,p);p.exportProject();},
    };
    window.eidosPlayground=api;
    return()=>{if(window.eidosPlayground===api)delete window.eidosPlayground;};
  },[]);
  const request=():EditRequest=>({documentId:props.documentId,revision:props.revision,selected:id,scope:field.startsWith('tokens.')?'page':'section',proposal:validateProposal({ops:[{field,value}]})});
  const apply=(r:EditRequest)=>{try{const next=applyLocalCommand(props.project,props,r),diff=proposalDiff(props.project,r.selected,r.scope,r.proposal);props.edit(next);pending.current=true;setDraft(null);setReceipt(diff.map(d=>`${d.field}: ${d.before} → ${d.after}`).join('\n'));props.notify('Bounded change applied. Undo is available.');}catch(e){props.notify((e as Error).message);}};
  return <details className="studio-agent"><summary>Bounded editing & local tools</summary><p>Make a precise change without a provider. Manual edits and local agent commands share validation, revision guards and Undo. Hosted AI remains disabled under its existing release gate.</p>
    <label>Section<select aria-label="Command section" value={id} onChange={e=>setSelected(e.target.value)}>{props.project.sections.map(s=><option key={s.id} value={s.id}>{s.title||s.id}</option>)}</select></label>
    <label>Property<select aria-label="Command property" value={field} onChange={e=>{setField(e.target.value);setDraft(null);}}>{operationFields.map(v=><option key={v}>{v}</option>)}</select></label>
    <label>New value<input aria-label="Command value" value={value} maxLength={2000} onChange={e=>{setValue(e.target.value);setDraft(null);}}/></label>
    <button onClick={()=>{try{const r=request();if(/layout|spacing|align/.test(field)){applyLocalCommand(props.project,props,r);setDraft(r);}else apply(r);}catch(e){props.notify((e as Error).message);}}}>{/layout|spacing|align/.test(field)?'Review change':'Apply requested change'}</button>
    {draft&&<div role="region" aria-label="Layout change review"><pre>{JSON.stringify(draft.proposal,null,2)}</pre><button onClick={()=>apply(draft)}>Apply reviewed change</button><button onClick={()=>setDraft(null)}>Cancel</button></div>}
    {receipt&&<output className="studio-command-receipt">{receipt}</output>}
    <button onClick={()=>setReceipt(JSON.stringify({documentId:props.documentId,revision:props.revision,selection:aiContext(props.project,id,'section'),history:{canUndo:props.canUndo,canRedo:props.canRedo}},null,2))}>Read selection & history</button>
    <p><code>window.eidosPlayground</code> exposes read, inspect, history, apply, applyStudio, undo, redo, save and export to browser-local integrations. Changes require the current document ID and revision. It grants no account or server access.</p>
  </details>;
}
