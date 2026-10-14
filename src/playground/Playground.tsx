import { useEffect, useRef, useState } from 'react';
import { StudioWorkspace, StudioPicker } from './StudioWorkspace';
import { selectStudio } from './studioProject';
import { studioModes, type StudioMode } from './studioSchema';
import { BlockTree, BlockControls } from './BlockControls';
import { flattenNodes, type BlockNode } from './authoringSchema';
import { AIAssist } from './AIAssist';
import { AgentCommands } from './AgentCommands';
import { StructureControls } from './StructureControls';
import { labels, sectionKind, projectWarnings, validateProject, type Project } from './model';
import { moveSectionBefore } from './composition';
import { startListMove } from './listMove';
import { useProject } from './useProject';
import { Preview } from './Preview';
import { Inspector } from './Inspector';
import { CloudProjects } from './CloudProjects';
import { Icon } from './Controls';
import { download, headerFiles, zipFiles } from './export';
import { FinishReview } from './FinishReview';
import { StartScreen } from './StartScreen';
import { AddPanel, AssetsPanel, BrandPanel } from './UnifiedPanels';
import './editor.css';
import './unifiedEditor.css';

type Tool = 'pages' | 'add' | 'layers' | 'assets' | 'project';
function nodePath(node: BlockNode, id: string): BlockNode[] {
  if (node.id === id) return [node];
  for (const child of node.children || []) { const path = nodePath(child, id); if (path.length) return [node, ...path]; }
  return [];
}

export default function Playground() {
  const w = useProject();
  const { project, target, documentId, guard, replace, acknowledge, ready, edit, undo, redo, canUndo, canRedo, status, snapshots, saveSnapshot, storageError } = w;
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 640);
  const [editing, setEditing] = useState(true), [panel, setPanel] = useState('canvas'), [tool, setTool] = useState<Tool>('pages');
  const [brandOpen, setBrandOpen] = useState(false), [checklist, setChecklist] = useState(true);
  const [notice, setNotice] = useState(''), [comparison, setComparison] = useState<Project | null>(null), [finishOpen, setFinishOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const sectionDrag = useRef<() => void>(() => {});
  const requestedStudio = useRef(false);
  const selected = project.sections.some(s => s.id === w.editor.sectionId) ? w.editor.sectionId : project.sections.find(s => sectionKind(s) === 'hero')?.id || project.sections[0].id;
  const section = project.sections.find(s => s.id === selected)!;
  const selectedNode = section.authoring && flattenNodes(section.authoring.root).some(n => n.id === w.editor.nodeId) ? w.editor.nodeId! : section.authoring?.root.id || '';
  const breadcrumbs = section.authoring ? nodePath(section.authoring.root, selectedNode) : [];
  const warnings = projectWarnings(project);

  useEffect(() => { sectionDrag.current(); return () => sectionDrag.current(); }, [project, documentId, comparison]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    // A deep link selects a specialized view only after a person opens a project.
    if (!ready || !w.started || requestedStudio.current) return;
    requestedStudio.current = true;
    const mode = new URLSearchParams(window.location.search).get('studio');
    if (mode !== 'page' && studioModes.includes(mode as StudioMode)) edit(selectStudio(project, mode as StudioMode));
  }, [ready, w.started, edit, project]);
  const change = (p: Project | ((current: Project) => Project), group?: string) => { if (!ready) return; setComparison(null); edit(p, group); };
  const selectNode = (id: string, sectionId: string) => { w.setEditorSelection({ sectionId, nodeId: id || undefined }); setBrandOpen(false); };
  const chooseSection = (id: string) => { selectNode('', id); setPanel('inspector'); };
  const openTool = (next: Tool) => { setTool(next); setPanel('sections'); };
  function reorder(index: number, direction: number) { const next = index + direction; if (next < 1 || next > project.sections.length - 2) return; const sections = [...project.sections]; [sections[index], sections[next]] = [sections[next], sections[index]]; change({ ...project, sections }); }
  function openExport() { setFinishOpen(true); }
  function backup() { try { download(JSON.stringify(validateProject(project), null, 2), 'project.json', 'application/json'); } catch (error) { setNotice((error as Error).message); } }
  async function importProject(file?: File) { if (!file) return; const valid = guard(); try { if (file.size > 30_000_000) throw Error('Project is too large. Maximum import size is 30 MB.'); const next = validateProject(JSON.parse(await file.text())); if (!valid()) { setNotice('Import ignored because the workspace changed. Choose the file again.'); return; } replace(next); setNotice('Project imported. Undo restores your previous design.'); } catch (error) { setNotice((error as Error).message); } }
  const common = { project, selected, selectedNode, edit: change, select: selectNode, guard, notify: setNotice };

  if (!ready) return <div className="pg-app pg-start-loading"><img src="/brand/eidos-mark.svg" alt="Eidos" width="44" height="44" /><p>Opening your workspace…</p></div>;
  if (!w.started) return <StartScreen savedProject={w.hasSavedProject ? project : undefined} savedProjects={w.savedProjects} currentDocumentId={documentId} onOpenSaved={w.openSavedProject} onContinue={w.continueProject} onStart={w.startProject} storageError={storageError} />;
  if (project.studios && project.studios.active !== 'page') return <StudioWorkspace workspace={w} />;
  return <div className={`pg-app pg-unified ${!editing ? 'pg-trying' : ''}`} data-panel={panel}
    onPointerDownCapture={event => { if ((event.target as HTMLElement).matches('input[type=range]')) w.beginGesture(); }}
    onPointerUpCapture={w.endGesture} onPointerCancelCapture={w.endGesture}
    onKeyDownCapture={event => { if ((event.target as HTMLElement).matches('input[type=range]') && !event.repeat && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) w.beginGesture(); }}
    onKeyUpCapture={w.endGesture} onBlurCapture={w.endGesture}>
    <header className="pg-toolbar">
      <button className="pg-brand" aria-label="Back to projects" onClick={w.returnToStart}><img className="pg-brand-mark" src="/brand/eidos-mark.svg" alt="" width="30" height="30" /><strong>Eidos</strong><span>Playground</span></button>
      <div className="pg-project-identity"><input className="pg-project-name" aria-label="Project name" value={project.name} maxLength={100} onChange={event => change({ ...project, name: event.target.value }, 'name')} /><button className={`pg-save-inline ${storageError ? 'error' : ''}`} title={storageError || 'Save this project in this browser'} onClick={() => void w.saveNow()}><span className="pg-save-dot" />{status}</button></div>
      <div className="pg-history"><button title="Undo" aria-label="Undo" disabled={!canUndo || !!comparison} onClick={undo}><Icon name="undo" /></button><button title="Redo" aria-label="Redo" disabled={!canRedo || !!comparison} onClick={redo}><Icon name="redo" /></button></div>
      <button className={`pg-brand-button ${brandOpen ? 'active' : ''}`} aria-pressed={brandOpen} onClick={() => { setBrandOpen(!brandOpen); setPanel('inspector'); }}><span className="pg-brand-colors"><i style={{ background: project.tokens.background }} /><i style={{ background: project.tokens.accent }} /></span>Brand</button>
      <div className="pg-device" aria-label="Preview size"><button aria-label="Desktop" aria-pressed={!mobile} onClick={() => setMobile(false)}><Icon name="desktop" /><span>Desktop</span></button><button aria-label="Mobile" aria-pressed={mobile} onClick={() => setMobile(true)}><Icon name="mobile" /><span>Mobile</span></button></div>
      <div className="pg-toolbar-actions"><button className="pg-button-secondary" aria-label={editing ? 'Preview' : 'Edit page'} title={editing ? 'Preview' : 'Edit page'} onClick={() => { setEditing(!editing); setPanel('canvas'); }}><Icon name="eye" /><span>{editing ? 'Preview' : 'Edit page'}</span></button><button className="pg-primary" disabled={!!comparison} onClick={() => void openExport()}>Finish <span aria-hidden="true">↗</span></button></div>
    </header>
    <nav className="pg-mobile-tabs" aria-label="Workspace panels">{['sections', 'canvas', 'inspector'].map(value => <button key={value} aria-pressed={panel === value} onClick={() => setPanel(value)}>{value === 'sections' ? 'Build' : value === 'canvas' ? 'Canvas' : 'Edit selection'}</button>)}</nav>
    {checklist && editing && <div className="pg-checklist"><span><strong>Make it yours.</strong> Start with your headline.</span><div>{['Content', 'Brand', 'Layout', 'Mobile', 'Finish'].map((label, index) => <button key={label} onClick={() => { if (label === 'Brand') { setBrandOpen(true); setPanel('inspector'); } else if (label === 'Mobile') { setMobile(true); setPanel('canvas'); } else if (label === 'Finish') void openExport(); else if (label === 'Layout') openTool('layers'); else { const hero = project.sections.find(s => sectionKind(s) === 'hero'); if (hero) { selectNode(hero.authoring ? flattenNodes(hero.authoring.root).find(n => n.type === 'heading')?.id || '' : '', hero.id); setPanel('inspector'); } } }}><b>{index + 1}</b>{label}</button>)}</div><button className="pg-checklist-dismiss" aria-label="Dismiss getting started checklist" onClick={() => setChecklist(false)}>×</button></div>}
    <div className="pg-workspace">
      <aside className="pg-sidebar" aria-label="Build panel">
        <nav className="pg-tool-rail" aria-label="Build tools">{([{ id: 'pages', icon: '▤', label: 'Pages' }, { id: 'add', icon: '+', label: 'Add' }, { id: 'layers', icon: '▱', label: 'Layers' }, { id: 'assets', icon: '▧', label: 'Assets' }, { id: 'project', icon: '⋯', label: 'Project' }] as const).map(item => <button key={item.id} aria-pressed={tool === item.id} onClick={() => openTool(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav>
        <div className="pg-tool-panel">
          {tool === 'pages' && <><span className="pg-eyebrow">Your website</span><h2>One page. Yours.</h2><button className="pg-page-card" aria-current="page" onClick={() => { selectNode('', project.sections.find(s => sectionKind(s) === 'hero')?.id || selected); setPanel('canvas'); }}><span className="pg-page-thumbnail" style={{ background: project.tokens.background, color: project.tokens.foreground }}><i style={{ background: project.tokens.accent }} /><b>{project.brand?.businessName || project.name}</b></span><strong>Home</strong><small>Single-page website · /</small></button><p className="pg-panel-copy">Your navigation links to sections on this page. Add content from the + tab.</p><h3>Page outline</h3></>}
          {(tool === 'pages' || tool === 'layers') && <>{tool === 'layers' && <><span className="pg-eyebrow">Page structure</span><h2>Layers</h2><p className="pg-panel-copy">Choose an element to edit it. Drag a handle or use the move controls.</p></>}<div className="pg-section-list">{project.sections.map((s, index) => <div key={s.id} data-sort-id={index > 0 ? s.id : undefined} className={`pg-section-row ${selected === s.id ? 'selected' : ''} ${!s.visible ? 'hidden-section' : ''}`}><button className="pg-section-select" aria-pressed={selected === s.id} onClick={() => chooseSection(s.id)}><Icon name={sectionKind(s)} /><span>{labels[sectionKind(s)]}</span></button><div className="pg-section-actions">{index > 0 && index < project.sections.length - 1 && <button aria-label={`Drag ${labels[sectionKind(s)]}`} style={{ touchAction: 'none', cursor: 'grab' }} disabled={!!comparison} onPointerDown={event => { sectionDrag.current(); sectionDrag.current = startListMove(event, guard(), (id, before) => { try { const next = moveSectionBefore(project, id, before); if (JSON.stringify(next) !== JSON.stringify(project)) change(next); } catch (error) { setNotice((error as Error).message); } }); }}>⠿</button>}<button aria-label={`${s.visible ? 'Hide' : 'Show'} ${labels[sectionKind(s)]}`} onClick={() => change({ ...project, sections: project.sections.map(item => item.id === s.id ? { ...item, visible: !item.visible } : item) })}>{s.visible ? '◉' : '○'}</button>{index > 0 && index < project.sections.length - 1 && <><button aria-label={`Move ${labels[sectionKind(s)]} up`} disabled={index === 1} onClick={() => reorder(index, -1)}>↑</button><button aria-label={`Move ${labels[sectionKind(s)]} down`} disabled={index === project.sections.length - 2} onClick={() => reorder(index, 1)}>↓</button></>}</div></div>)}</div>{tool === 'layers' && <BlockTree project={project} selected={selectedNode} onSelect={selectNode} edit={change} notify={setNotice} guard={guard} />}</>}
          {tool === 'add' && <AddPanel {...common} />}
          {tool === 'assets' && <AssetsPanel {...common} />}
          {tool === 'project' && <><span className="pg-eyebrow">Keep & continue</span><h2>Your project</h2><button className="pg-button-secondary" onClick={() => void w.saveNow()}>Save now</button><button className="pg-button-secondary" onClick={w.returnToStart}>Projects & starters</button><p className="pg-panel-copy">Saved in this browser. Keep a JSON backup to move your editable project to another device.</p><details className="pg-project-tools" open><summary>Backup & restore</summary><button onClick={backup}>Download project JSON</button><label className="pg-upload">Import project<input type="file" accept=".json,application/json" onChange={event => { void importProject(event.target.files?.[0]); event.target.value = ''; }} /></label></details><details className="pg-project-tools"><summary>Saved variations</summary><label htmlFor="snapshot-name">Variation name</label><input id="snapshot-name" placeholder="e.g. Softer edges" maxLength={70} value={snapshotName} onChange={event => setSnapshotName(event.target.value)} /><button disabled={!snapshotName.trim()} onClick={() => { saveSnapshot(snapshotName.trim()); setSnapshotName(''); setNotice('Variation saved. Your five most recent variations are kept.'); }}>Save variation</button>{snapshots.map(snapshot => <div className="pg-snapshot" key={snapshot.id}><span>{snapshot.name}</span><button onClick={() => replace(snapshot.project)}>Restore</button><button aria-pressed={comparison === snapshot.project} onClick={() => setComparison(comparison === snapshot.project ? null : snapshot.project)}>Compare</button></div>)}</details><details className="pg-project-tools"><summary>Advanced</summary><p>Specialized tools use this same project and Undo history.</p><StudioPicker value="page" choose={mode => change(selectStudio(project, mode))} /><button onClick={() => { try { download(zipFiles(headerFiles(project)), 'eidos-header.zip', 'application/zip'); } catch (error) { setNotice((error as Error).message); } }}>Download header component</button><AgentCommands isCurrent={guard()} project={project} documentId={documentId} revision={w.revision} edit={change} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} save={w.saveNow} exportProject={backup} notify={setNotice} /><CloudProjects project={project} target={target} documentId={documentId} guard={guard} load={replace} acknowledge={acknowledge} disabled={!!comparison} /></details></>}
          <div className="pg-local-note"><span className="pg-save-dot" />Local editing · no AI usage</div>
        </div>
      </aside>
      <main className="pg-canvas" aria-label="Page canvas">
        <div className="pg-canvas-heading"><span>{editing ? 'Home' : 'Visitor preview'} <small> / </small></span><span>{mobile ? 'Mobile · 390px' : 'Desktop · fit to canvas'}</span></div>
        {comparison && <div className="pg-compare-bar">Viewing saved variation<button onClick={() => setComparison(null)}>Return to current design</button></div>}
        {!editing && <div className="pg-try-hint">Explore your page. External links are shown without leaving your design.</div>}
        <div className="pg-preview-shell"><Preview edit={change} guard={guard} notify={setNotice} documentId={documentId} selectedNode={selectedNode} onNodeSelect={selectNode} onInspectNode={(id, sectionId) => { selectNode(id, sectionId); setPanel('inspector'); }} project={comparison || project} selected={selected} editing={editing && !comparison} mobile={mobile} onSelect={id => selectNode('', id)} onLink={href => setNotice(`This link opens ${href}. It will work normally in your exported page.`)} /></div>
      </main>
      <aside className="pg-context" aria-label="Selection inspector">
        <div className="pg-scope"><span>{brandOpen ? 'Shared brand' : breadcrumbs.length ? 'This element' : 'This section'}</span><button aria-label="Close inspector" onClick={() => { setBrandOpen(false); setPanel('canvas'); }}>×</button></div>
        {brandOpen ? <BrandPanel project={project} edit={change} guard={guard} notify={setNotice} /> : <><nav className="pg-breadcrumb" aria-label="Selection path"><button onClick={() => { openTool('pages'); }}>Home</button><span>›</span><button onClick={() => selectNode('', selected)}>{labels[sectionKind(section)]}</button>{breadcrumbs.map(node => <span key={node.id}><span>›</span><button aria-current={node.id === selectedNode ? 'location' : undefined} onClick={() => selectNode(node.id, selected)}>{node.name || node.type}</button></span>)}</nav>{section.authoring ? <BlockControls project={project} selected={selectedNode} onSelect={selectNode} edit={change} notify={setNotice} guard={guard} mobile={mobile} /> : <><Inspector key={selected} project={project} selected={selected} edit={change} notify={setNotice} guard={guard} /><div className="pg-section-settings"><StructureControls project={project} selected={selected} edit={change} guard={guard} notify={setNotice} sectionOnly /></div></>}<AIAssist project={project} target={target} documentId={documentId} selected={selected} guard={guard} edit={change} /></>}
      </aside>
    </div>
    <footer className="pg-statusbar"><span><Icon name={mobile ? 'mobile' : 'desktop'} />{mobile ? 'Mobile layout' : 'Desktop layout'}</span><span>{comparison ? 'Saved variation' : editing ? 'Select an element · double-click text to edit' : 'Visitor preview'}</span><button disabled={!!comparison} onClick={() => void openExport()}>{warnings.length ? `${warnings.length} checks before finishing` : 'Review & download'} ↗</button></footer>
    {notice && <div className="pg-toast" role="status">{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
    <FinishReview key={documentId} project={project} documentId={documentId} revision={w.revision} open={finishOpen} onClose={() => setFinishOpen(false)} />
  </div>;
}
