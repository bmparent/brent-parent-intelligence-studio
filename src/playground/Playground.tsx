import { DndContext, DragOverlay, pointerWithin, rectIntersection, type DragEndEvent } from '@dnd-kit/core';
import { BlockTree, BlockControls } from './BlockControls';
import { CanvasDropZone, ElementPalette } from './ElementPalette';
import { enableBlocks } from './authoring';
import { preferredContainer, placeElement } from './elementPlacement';
import { nodeTypes, type NodeType } from './authoringSchema';
import {AIAssist} from "./AIAssist";
import {imageWarnings} from "./publishing";
import {StructureControls} from "./StructureControls";
import { sectionKind } from "./model";
import { moveSectionBefore } from "./composition";
import { startListMove } from "./listMove";
import { useEffect, useRef, useState } from "react";
import {
  createProject,
  labels,
  palettes,
  projectWarnings,
  validateProject,
  type Project,
  
} from "./model";
import { useProject } from "./useProject";
import { Preview } from "./Preview";
import { MediaBrand } from "./MediaBrand";
import { Inspector } from "./Inspector";
import { CloudProjects } from './CloudProjects';
import { Icon } from "./Controls";
import { download, exportFiles, headerFiles, zipFiles } from "./export";
import { track } from '../lib/analytics';
import "./editor.css";
export default function Playground() {
  const {
    project,
    target, documentId, guard, replace, acknowledge,
    ready,
    edit,
    undo,
    redo,
    canUndo,
    canRedo,
    status,
    snapshots,
    saveSnapshot,
    storageError,
  } = useProject();
  const [selected, setSelected] = useState<string>("hero"),
    [mobile, setMobile] = useState(() => typeof window!=='undefined' && window.innerWidth<=640),
    [editing, setEditing] = useState(true),
    [panel, setPanel] = useState("canvas");
  const [selectedNode,setSelectedNode]=useState('');
  const selectNode=(id:string,sectionId:string)=>{setSelectedNode(id);setSelected(sectionId);setMediaOpen(false);};
  const [mediaOpen, setMediaOpen] = useState(false);
  const [draggingKind, setDraggingKind] = useState<NodeType | null>(null);
  const [notice, setNotice] = useState(""),
    [comparison, setComparison] = useState<Project | null>(null),
    [exporting, setExporting] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    [snapshotName, setSnapshotName] = useState("");
  const [imageNotes,setImageNotes]=useState<string[]>([]);
  const sectionDrag = useRef<() => void>(() => {});
  useEffect(() => { sectionDrag.current(); return () => sectionDrag.current(); }, [project, documentId, comparison]);
  const warnings = [...projectWarnings(project),...imageNotes];
  const dropSection = project.sections.find(section => section.id === selected && section.authoring);
  async function openExport(){const valid=guard();setImageNotes([]);dialog.current?.showModal();const notes=await imageWarnings(project);if(valid())setImageNotes(notes);}
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(t);
  }, [notice]);
  const change = (p: Project | ((current: Project) => Project), group?: string) => {
    if (!ready) return;
    setComparison(null);
    edit(p, group);
  };
  const chooseSection = (id: string) => {
    setMediaOpen(false);
    setSelected(id);
    setSelectedNode('');
    setPanel("inspector");
  };
  function reorder(index: number, direction: number) {
    const next = index + direction;
    if (next < 1 || next > project.sections.length-2) return;
    const sections = [...project.sections];
    [sections[index], sections[next]] = [sections[next], sections[index]];
    change({ ...project, sections });
  }
  function addElement(kind: NodeType, parent = preferredContainer(project, selected, selectedNode), before: string | null = null) {
    if (!ready || comparison) return;
    try {
      if (!parent) throw new Error('Choose a page area first.');
      const placed = placeElement(project, kind, parent, before);
      change(placed.project);
      setSelected(placed.sectionId);
      setSelectedNode(placed.nodeId);
      setMediaOpen(false);
      setPanel('canvas');
      setNotice(`${kind.charAt(0).toUpperCase() + kind.slice(1)} added. Select it on the page to edit, or Undo to remove it.`);
    } catch (error) { setNotice((error as Error).message); }
  }
  function finishElementDrag(event: DragEndEvent) {
    const kind = event.active.data.current?.kind;
    setDraggingKind(null);
    if (!nodeTypes.includes(kind as NodeType) || !event.over) return;
    if (event.over.id === 'canvas') { addElement(kind as NodeType); return; }
    const parent = event.over.data.current?.parent;
    const before = event.over.data.current?.before;
    if (typeof parent === 'string' && (before === null || typeof before === 'string'))
      addElement(kind as NodeType, parent, before);
  }
  async function importProject(file?: File) {
    if (!file) return;
    const stillCurrent = guard();
    try {
      if (file.size > 30_000_000)
        throw new Error("Project is too large. Maximum import size is 30 MB.");
      const p = validateProject(JSON.parse(await file.text()));
      if (!stillCurrent()) { setNotice("Import ignored because the workspace changed. Choose the file again to import here."); return; }
      replace(p);
      setNotice("Project imported. Undo restores your previous design.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  async function exportZip() {
    if (comparison || !ready) return;
    setExporting(true);
    try {
      const data = zipFiles(exportFiles(project));
      download(
        data,
        (project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() ||
          "eidos-page") + ".zip",
        "application/zip",
      );
      setNotice("Your page package is ready. Check your downloads.");
      track('playground_pack_download', { item_id: 'playground-starter-pack' });
      dialog.current?.close();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className={`pg-app ${!editing ? "pg-trying" : ""}`} data-panel={panel}>
      <header className="pg-toolbar">
        <a href="/" className="pg-brand">
          <img className="pg-brand-mark" src="/brand/eidos-mark.svg" alt="" width="30" height="30" />
          <strong>Eidos</strong>
          <span>/ Playground</span>
        </a>
        <input
          className="pg-project-name"
          aria-label="Project name"
          value={project.name}
          maxLength={100}
          disabled={!ready}
          onChange={(e) => change({ ...project, name: e.target.value }, "name")}
        />
        <div className="pg-history">
          <button
            title="Undo"
            aria-label="Undo"
            disabled={!canUndo || !!comparison}
            onClick={undo}
          >
            <Icon name="undo" />
          </button>
          <button
            title="Redo"
            aria-label="Redo"
            disabled={!canRedo || !!comparison}
            onClick={redo}
          >
            <Icon name="redo" />
          </button>
        </div>
        <div className="pg-device" aria-label="Preview size">
          <button aria-label="Desktop" aria-pressed={!mobile} onClick={() => setMobile(false)}>
            <Icon name="desktop" />
            <span>Desktop</span>
          </button>
          <button aria-label="Mobile" aria-pressed={mobile} onClick={() => setMobile(true)}>
            <Icon name="mobile" />
            <span>Mobile</span>
          </button>
        </div>
        <div className="pg-toolbar-actions">
          <button
            className="pg-button-secondary"
            onClick={() => {
              setEditing((v) => !v);
              setPanel("canvas");
            }}
          >
            <Icon name="eye" />
            {editing ? "Try page" : "Back to editor"}
          </button>
          <a className="pg-button-secondary pg-work-link" href="/contact/?from=playground#project-form" onClick={() => track('playground_contact_click')}>Work with Eidos Works ↗</a>
          <button
            className="pg-primary"
            disabled={!ready || !!comparison}
            onClick={() => void openExport()}
          >
            Free starter pack <Icon name="export" />
          </button>
        </div>
      </header>
      <nav className="pg-mobile-tabs" aria-label="Workspace panels">
        {["sections", "canvas", "inspector"].map((v) => (
          <button
            key={v}
            aria-pressed={panel === v}
            onClick={() => setPanel(v)}
          >
            {v === "sections"
              ? "Your page"
              : v === "canvas"
                ? "Preview"
                : "Controls"}
          </button>
        ))}
      </nav>
      <DndContext collisionDetection={args => args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args)}
        onDragStart={event => { const kind = event.active.data.current?.kind; if (nodeTypes.includes(kind as NodeType)) setDraggingKind(kind as NodeType); }}
        onDragEnd={finishElementDrag} onDragCancel={() => setDraggingKind(null)}>
      <div className="pg-workspace">
        <aside className="pg-sidebar" aria-label="Page sections" inert={!ready}>
          <h2>Your page</h2>
          <p className="pg-guide">Pick a starting layout, add elements, then make the page yours. Your edits save on this device.</p>
          <button className="pg-media-entry" aria-pressed={mediaOpen} onClick={()=>{setMediaOpen(!mediaOpen);setPanel("inspector");}}>Media / Brand</button>
          <label className="pg-sr-only" htmlFor="page-template">
            Template
          </label>
          <select
            id="page-template"
            value={project.template}
            disabled={!ready}
            onChange={(e) => {
              replace(enableBlocks(createProject(e.target.value as Project["template"])));
              setNotice(
                "Template changed. Undo brings your previous design back.",
              );
            }}
          >
            <option value="landing">Landing · Moss / editorial split</option>
            <option value="homepage">Homepage · Ink / centered studio</option>
            <option value="portfolio">Portfolio · Clay / spacious work</option>
            <option value="about">About page</option><option value="contact">Contact / leads</option>
          </select>
          <div className="pg-section-list">
            {project.sections.map((s, i) => (
              <div
                key={s.id}
                data-sort-id={i > 0 ? s.id : undefined}
                className={`pg-section-row ${selected === s.id ? "selected" : ""} ${!s.visible ? "hidden-section" : ""}`}
              >
                <button
                  className="pg-section-select"
                  aria-pressed={selected === s.id}
                  onClick={() => chooseSection(s.id)}
                >
                  <Icon name={sectionKind(s)} />
                  <span>{labels[sectionKind(s)]}</span>
                </button>
                <div className="pg-section-actions">
                  {i > 0 && i < project.sections.length-1 && <button aria-label={`Drag ${labels[sectionKind(s)]}`} style={{touchAction:'none',cursor:'grab'}} disabled={!ready || !!comparison} onPointerDown={event => {
                    sectionDrag.current(); sectionDrag.current = startListMove(event,guard(),(id,before)=>{
                      try { const next=moveSectionBefore(project,id,before); if(JSON.stringify(next)!==JSON.stringify(project))change(next); }
                      catch(error){setNotice((error as Error).message);}
                    });
                  }}>⠿</button>}
                  <button
                    title={`${s.visible ? "Hide" : "Show"} ${labels[sectionKind(s)]}`}
                    aria-label={`${s.visible ? "Hide" : "Show"} ${labels[sectionKind(s)]}`}
                    onClick={() =>
                      change({
                        ...project,
                        sections: project.sections.map((v) =>
                          v.id === s.id ? { ...v, visible: !v.visible } : v,
                        ),
                      })
                    }
                  >
                    {s.visible ? "◉" : "○"}
                  </button>
                  {i > 0 && i < project.sections.length-1 && (
                    <>
                      <button
                        aria-label={`Move ${labels[sectionKind(s)]} up`}
                        disabled={i === 1}
                        onClick={() => reorder(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`Move ${labels[sectionKind(s)]} down`}
                        disabled={i === project.sections.length-2}
                        onClick={() => reorder(i, 1)}
                      >
                        ↓
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ElementPalette enabled={project.schemaVersion === 4 && ready && !comparison}
            add={kind => addElement(kind)} upgrade={() => { try { change(enableBlocks(project)); setSelected('hero'); setNotice('Flexible editing is ready. Your earlier design is available with Undo.'); } catch (error) { setNotice((error as Error).message); } }}/>
          <BlockTree project={project} selected={selectedNode} onSelect={selectNode} edit={change} notify={setNotice} guard={guard} dragging={!!draggingKind} />
          <StructureControls project={project} selected={selected} edit={change} guard={guard} notify={setNotice} />
          <div className="pg-directions">
            <h2>Design direction</h2>
            <div className="pg-palettes">
              {Object.entries(palettes).map(([name, palette]) => (
                <button
                  key={name}
                  aria-pressed={
                    project.tokens.background === palette.background
                  }
                  onClick={() =>
                    change({
                      ...project,
                      tokens: { ...project.tokens, ...palette },
                    })
                  }
                >
                  <span className="pg-swatches">
                    <i style={{ background: palette.background }} />
                    <i style={{ background: palette.accent }} />
                  </span>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <details className="pg-project-tools">
            <summary>Projects & variations</summary>
            <label className="pg-upload">
              Import project
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  void importProject(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={() => {
                try {
                  download(
                    JSON.stringify(validateProject(project), null, 2),
                    "project.json",
                    "application/json",
                  );
                } catch (e) {
                  setNotice((e as Error).message);
                }
              }}
            >
              Download project JSON
            </button>
            <label htmlFor="snapshot-name">Variation name</label>
            <input
              id="snapshot-name"
              placeholder="e.g. Softer edges"
              maxLength={70}
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
            />
            <button
              disabled={!snapshotName.trim()}
              onClick={() => {
                saveSnapshot(snapshotName.trim());
                setSnapshotName("");
                setNotice(
                  "Variation saved. Your five most recent variations are kept.",
                );
              }}
            >
              Save variation
            </button>
            {snapshots.map((s) => (
              <div className="pg-snapshot" key={s.id}>
                <span>{s.name}</span>
                <button onClick={() => replace(s.project)}>Restore</button>
                <button
                  aria-pressed={comparison === s.project}
                  onClick={() =>
                    setComparison(comparison === s.project ? null : s.project)
                  }
                >
                  Compare
                </button>
              </div>
            ))}
          </details>
          <AIAssist project={project} target={target} documentId={documentId} selected={selectedNode || (project.sections.some(s=>s.id===selected)?selected:project.sections[0].id)} guard={guard} edit={change} />
          <CloudProjects project={project} target={target} documentId={documentId} guard={guard} load={replace} acknowledge={acknowledge} disabled={!ready || !!comparison} />
          <div
            className={`pg-save-status ${storageError ? "error" : ""}`}
            role="status"
          >
            <Icon name="check" />
            <span>
              {status}
              <small>
                {storageError
                  ? "Export remains available."
                  : "Private to this browser"}
              </small>
            </span>
          </div>
          <div className="pg-next-steps">
            <h2>When your draft feels right</h2>
            <button onClick={() => void openExport()} disabled={!ready || !!comparison}>Download your free starter pack ↗</button>
            <a href="/contact/?from=playground#project-form" onClick={() => track('playground_contact_click')}>Ask Eidos Works to finish it ↗</a>
            <small>Custom work is scoped and quoted after you tell us what you need. <a href="/services/digital-experiences/">Explore the service</a>.</small>
          </div>
        </aside>
        <main className="pg-canvas" aria-label="Page canvas">
          {comparison && (
            <div className="pg-compare-bar">
              Viewing saved variation{" "}
              <button onClick={() => setComparison(null)}>
                Return to current design
              </button>
            </div>
          )}
          {!editing && (
            <div className="pg-try-hint">
              Try the navigation, scroll, and explore. External destinations are
              shown without leaving your design.
            </div>
          )}
          <div className="pg-preview-shell">
            {ready ? (
              <Preview
                edit={change}
                guard={guard}
                notify={setNotice}
                documentId={documentId}
                selectedNode={selectedNode}
                onNodeSelect={selectNode}
                onInspectNode={(id,sectionId)=>{selectNode(id,sectionId);setPanel("inspector");}}
                project={comparison || project}
                selected={project.sections.some(s=>s.id===selected)?selected:project.sections[0].id}
                editing={editing && !comparison}
                mobile={mobile}
                onSelect={id => { setMediaOpen(false); setSelected(id); setSelectedNode(''); }}
                onLink={(href) =>
                  setNotice(
                    `This link opens ${href}. It will work normally in your exported page.`,
                  )
                }
              />
            ) : (
              <div className="pg-loading">Opening your workspace…</div>
            )}
          </div>
          <CanvasDropZone dragging={!!draggingKind && editing && !comparison} destination={dropSection ? labels[sectionKind(dropSection)] : 'Hero'} />
        </main>
        {mediaOpen ? <MediaBrand project={project} edit={change} guard={guard} notify={setNotice} close={()=>setMediaOpen(false)} /> : project.schemaVersion===4 && project.sections.find(s=>s.id===selected)?.authoring ? <BlockControls project={project} selected={selectedNode} onSelect={selectNode} edit={change} notify={setNotice} guard={guard} mobile={mobile} /> : <Inspector
          project={project}
          selected={project.sections.some(s=>s.id===selected)?selected:project.sections[0].id}
          edit={change}
          notify={setNotice}
          guard={guard}
        />}
      </div>
      <DragOverlay>{draggingKind && <div className="pg-element-overlay">+ {draggingKind.charAt(0).toUpperCase() + draggingKind.slice(1)}</div>}</DragOverlay>
      </DndContext>
      <footer className="pg-statusbar">
        <span>
          <Icon name={mobile ? "mobile" : "desktop"} />
          {mobile ? "Mobile · 390px" : `Desktop · ${project.tokens.width}px · Fit to canvas`}
        </span>
        <span>
          {comparison
            ? "Saved variation"
            : editing
              ? "Add an element or select one on the canvas"
              : "Visitor preview"}
        </span>
        <button disabled={!ready || !!comparison} onClick={() => void openExport()}>
          {warnings.length
            ? `${warnings.length} publishing notes`
            : "Free starter pack"}{" "}
          ↗
        </button>
      </footer>
      {notice && (
        <div className="pg-toast" role="status">
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="pg-export-dialog"
        aria-labelledby="pg-export-title"
      >
        <form method="dialog">
          <button className="pg-dialog-close" aria-label="Close export">
            ×
          </button>
        </form>
        <span className="pg-export-icon">
          <Icon name="export" />
        </span>
        <h2 id="pg-export-title">
          Take your design
          <br />
          with you.
        </h2>
        <p>Your working draft and the files an AI assistant or development team can continue from.</p>
        <ul className="pg-export-list">
          <li>Standalone HTML, CSS & JavaScript</li>
          <li>Editable project & design tokens</li>
          <li>Your images, packaged locally</li>
          <li>AI handoff & integration guide</li>
        </ul>
        {warnings.length > 0 && (
          <details open className="pg-export-notes">
            <summary>Before you publish</summary>
            <ul>
              {warnings.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </details>
        )}
        <button
          className="pg-primary"
          disabled={exporting || !ready || !!comparison}
          onClick={() => void exportZip()}
        >
          {exporting ? "Preparing package…" : "Download my free starter pack"}
          <Icon name="export" />
        </button>
        <small>Your design stays on this device until you choose to export or save it to an available account. No account or payment needed for this download.</small>
        <div className="pg-export-next"><a href="/contact/?from=playground#project-form" onClick={() => track('playground_contact_click')}>Want Eidos Works to finish this? Send a project note ↗</a><p>Custom design and development are quoted after discovery. Your project is not attached automatically; share the ZIP only if you choose.</p><a href="/shop/cinematic-starter/">Explore the separate $29 Cinematic Starter kit ↗</a></div>
        <button disabled={exporting || !ready || !!comparison} onClick={()=>{try{download(zipFiles(headerFiles(project)),'eidos-header.zip','application/zip');setNotice('Header component downloaded with installation instructions.');}catch(e){setNotice((e as Error).message);}}}>Download header component</button>
      </dialog>
    </div>
  );
}
