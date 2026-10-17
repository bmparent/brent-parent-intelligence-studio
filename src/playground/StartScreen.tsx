import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Project } from './model';
import type { SavedProjectSummary } from './storage';
import { imageData } from './storage';
import { pageMarkup, renderedStyles, tokensCss } from './renderer';
import { createStarter, loadStarterArtwork, starters, type ProjectGoal, type StarterBrief, type StarterId, type VisitorAction } from './starters';
import './start-screen.css';

type Props = {
  savedProject?: Project;
  savedProjects?: SavedProjectSummary[];
  currentDocumentId?: string;
  storageError?: string;
  onContinue: () => void;
  onStart: (project: Project) => Promise<boolean>;
  onOpenSaved?: (id: string) => Promise<boolean>;
};
function StarterPreview({project,title}:{project:Project;title:string}) {
  const document = useMemo(() => `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${tokensCss(project)}${renderedStyles(project)}html{scroll-behavior:auto}.pg-header{position:relative;top:0}.pg-skip{display:none}</style></head><body>${pageMarkup(project)}</body></html>`,[project]);
  return <span className="pg-start-preview"><iframe title={title} srcDoc={document} sandbox="" tabIndex={-1} aria-hidden="true" loading="lazy" /></span>;
}
export function StartScreen({savedProject,savedProjects=[],currentDocumentId,storageError,onContinue,onStart,onOpenSaved}:Props) {
  const [goal,setGoal] = useState<ProjectGoal>('business'), [action,setAction] = useState<VisitorAction>('contact');
  const [selected,setSelected] = useState<StarterId>('switchboard'), [customizing,setCustomizing] = useState(false);
  const [name,setName] = useState(''), [offer,setOffer] = useState(''), [link,setLink] = useState(''), [confirmed,setConfirmed] = useState(false);
  const [logo,setLogo] = useState(''), [photo,setPhoto] = useState(''), [accent,setAccent] = useState('');
  const [art,setArt] = useState<Partial<Record<StarterId,string>>>({}), [message,setMessage] = useState(''), [busy,setBusy] = useState(false), [uploading,setUploading] = useState(false);
  const details = useRef<HTMLHeadingElement>(null), active = useRef(true);
  useEffect(() => {
    active.current = true;
    for (const starter of starters) void loadStarterArtwork(starter.id).then(value => {
      if (active.current) setArt(current => ({...current,[starter.id]:value}));
    }).catch(() => { if (active.current) setMessage('Starter artwork is still unavailable. You can add your own photo or continue and replace the image later.'); });
    return () => { active.current = false; };
  },[]);
  const previews = useMemo(() => Object.fromEntries(starters.map(s => [s.id,createStarter({starter:s.id,goal:s.goal,action:'contact'},art[s.id])])) as Record<StarterId,Project>,[art]);
  const chosen = starters.find(s => s.id === selected)!;
  const brief: StarterBrief = {starter:selected,goal,action,name,offer,verifiedLink:link,linkConfirmed:confirmed,logo,photo,accent};
  async function upload(file: File | undefined, kind: 'logo'|'photo') {
    if (!file) return;
    setUploading(true); setMessage('Preparing your image on this device…');
    try { const data = await imageData(file); if (active.current) { if (kind === 'logo') setLogo(data); else setPhoto(data); setMessage('Image added. You can adjust it in the editor.'); } }
    catch (error) { if (active.current) setMessage((error as Error).message); }
    finally { if (active.current) setUploading(false); }
  }
  async function begin(skip = false) {
    if (busy || uploading) return;
    setBusy(true); setMessage('');
    try {
      // An uploaded photo is already portable. Bundled artwork is optional and
      // must not make manual project creation depend on a successful fetch.
      const artwork = !skip && photo ? '' : art[selected] || await loadStarterArtwork(selected).catch(() => '');
      if (!active.current) return;
      const project = createStarter(skip?{...brief,name:'',offer:'',logo:'',photo:'',accent:''}:brief,artwork);
      if (!await onStart(project)) setMessage('Your previous project could not be saved. Continue it and download a backup before starting another.');
    } catch (error) { setMessage((error as Error).message); }
    finally { if (active.current) setBusy(false); }
  }
  // Focus when the details form commits, before it can receive user input.
  // A deferred animation-frame focus can steal focus from the name field and
  // lose its first edit, particularly during WebKit's text insertion.
  useLayoutEffect(() => { if (customizing) details.current?.focus(); }, [customizing]);
  function choose(id: StarterId) { setSelected(id); setCustomizing(true); }
  return <main className="pg-start" aria-label="Start a Playground project">
    <header className="pg-start-brand"><a href="/" aria-label="Eidos Works home"><img src="/brand/eidos-mark-light.svg" alt="" width="30" height="30" /><span>eidos <strong>playground</strong></span></a><span>One page. Your point of view.</span></header>
    <div className="pg-start-body">
      <div className="pg-start-intro"><p className="pg-start-eyebrow">A useful starting point</p><h1>Make something<br /><em>that feels like you.</em></h1><p>Start with a real design. Make it your own, one detail at a time.</p></div>
      {savedProject && <section className="pg-start-continue" aria-label="Continue your project"><div><span className="pg-start-eyebrow">Your work is here</span><h2>{savedProject.name}</h2><p>Continue the same page, images, and saved selection.</p></div><button className="pg-start-primary" onClick={onContinue}>Continue project <span aria-hidden="true">↗</span></button></section>}
      {savedProjects.some(s => s.documentId !== currentDocumentId) && onOpenSaved && <details className="pg-start-saved"><summary>Other projects saved on this device</summary><ul>{savedProjects.filter(s => s.documentId !== currentDocumentId).map(s => <li key={s.documentId}><span>{s.name}</span><button disabled={busy} onClick={async()=>{setBusy(true);const opened=await onOpenSaved(s.documentId);if(active.current){setBusy(false);if(!opened)setMessage('This saved project could not be opened. Your current design is unchanged.');}}}>Open project</button></li>)}</ul></details>}
      {storageError && <p className="pg-start-message" role="status">{storageError}</p>}
      {!customizing ? <section className="pg-start-new" aria-labelledby="pg-new-heading">
        <div className="pg-start-section-heading"><div><p className="pg-start-eyebrow">New project</p><h2 id="pg-new-heading">What are you making?</h2></div>{savedProject && <p>Starting fresh keeps your previous project in your saved projects.</p>}</div>
        <fieldset className="pg-start-goals"><legend>Choose the kind of page</legend>{([{id:'business',label:'Business site',detail:'Introduce what you do'},{id:'landing',label:'Landing page',detail:'Give one offer a home'},{id:'portfolio',label:'Portfolio',detail:'Put your work first'}] as const).map(g=><label key={g.id} className={goal===g.id?'is-selected':''}><input type="radio" name="project-goal" value={g.id} checked={goal===g.id} onChange={()=>{setGoal(g.id);setSelected(starters.find(s=>s.goal===g.id)!.id);}}/><span><strong>{g.label}</strong><small>{g.detail}</small></span></label>)}</fieldset>
        <label className="pg-start-action">What should a visitor do?<select value={action} onChange={e=>setAction(e.target.value as VisitorAction)}><option value="contact">Contact me</option><option value="estimate">Request an estimate</option><option value="link">Use my booking or purchase link</option></select></label>
        {action==='link' && <div className="pg-start-link"><label>Booking or purchase destination<input type="url" placeholder="https://" value={link} onChange={e=>{setLink(e.target.value);setConfirmed(false);}}/></label><label className="pg-start-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I control this destination and have checked where it leads.</label><small>This adds a link. It does not connect a booking system or online store.</small></div>}
        <div className="pg-start-section-heading pg-start-choice-heading"><h2>Choose your starting point</h2><span>All three are editable · one-page output</span></div>
        <div className="pg-start-cards">{starters.map(s=><button type="button" key={s.id} className={`pg-start-card ${selected===s.id?'is-recommended':''}`} onClick={()=>choose(s.id)}><StarterPreview project={previews[s.id]} title={`${s.name} editable page preview`}/><span className="pg-start-card-copy"><span className="pg-start-card-title"><strong>{s.name}</strong><span aria-hidden="true">↗</span></span><span>{s.purpose}</span><small>{s.description}</small>{s.goal===goal&&<span className="pg-start-recommended">Suggested for your page</span>}</span></button>)}</div>
      </section> : <section className="pg-start-customize" aria-labelledby="pg-details-heading">
        <div className="pg-start-customize-preview"><StarterPreview project={previews[selected]} title={`${chosen.name} page preview`}/><h3>{chosen.name}</h3><p>{chosen.description}</p><button onClick={()=>setCustomizing(false)}>← Choose another starting point</button></div>
        <form onSubmit={event=>{event.preventDefault();void begin();}}><p className="pg-start-eyebrow">Make it yours</p><h2 id="pg-details-heading" ref={details} tabIndex={-1}>A few details to begin.</h2><p>Everything here is optional. You can change it on the page.</p><label>Business or project name<input maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Your business or creative practice" autoComplete="organization"/></label><label>Your offer, in a few words<textarea maxLength={240} value={offer} onChange={e=>setOffer(e.target.value)} placeholder="What do you help people do?" rows={3}/></label>
          <div className="pg-start-uploads"><label>{logo?<img src={logo} alt="Your uploaded logo"/>:<span aria-hidden="true">＋</span>}<strong>{logo?'Replace logo':'Add a logo'}</strong><input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading||busy} onChange={e=>{void upload(e.target.files?.[0],'logo');e.target.value='';}}/></label><label>{photo?<img src={photo} alt="Your uploaded photo"/>:<span aria-hidden="true">＋</span>}<strong>{photo?'Replace photo':'Add a photo'}</strong><input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading||busy} onChange={e=>{void upload(e.target.files?.[0],'photo');e.target.value='';}}/></label></div><small>PNG, JPEG or WebP · up to 32 MB. Use images you have permission to publish.</small>
          <label className="pg-start-accent">Brand accent <input type="color" value={accent||previews[selected].tokens.accent} onChange={e=>setAccent(e.target.value)}/>{accent&&<button type="button" onClick={()=>setAccent('')}>Use starter color</button>}</label>
          <div className="pg-start-create"><button className="pg-start-primary" disabled={busy||uploading} type="submit">{busy?'Opening your page…':'Create project'} <span aria-hidden="true">↗</span></button><button type="button" disabled={busy||uploading} onClick={()=>void begin(true)}>Skip details</button></div><small>Your first step: select the headline and write it in your own words.</small>
        </form>
      </section>}
      {message&&<p className="pg-start-message" role="status">{message}</p>}
      <footer className="pg-start-footnote">Start and edit freely on this device. Review the supported package and its price when you finish. Contact links need your destination; no contact form is connected.</footer>
    </div>
  </main>;
}
