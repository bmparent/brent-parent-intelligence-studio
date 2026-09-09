import { useEffect, useRef, useState } from "react";
import {
  createProject,
  labels,
  palettes,
  projectWarnings,
  validateProject,
  type Project,
  type SectionType,
} from "./model";
import { useProject } from "./useProject";
import { Preview } from "./Preview";
import { Inspector } from "./Inspector";
import { Icon } from "./Controls";
import { download, exportFiles, zipFiles } from "./export";
import "./editor.css";
export default function Playground() {
  const {
    project,
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
  const [selected, setSelected] = useState<SectionType>("header"),
    [mobile, setMobile] = useState(false),
    [editing, setEditing] = useState(true),
    [panel, setPanel] = useState("canvas");
  const [notice, setNotice] = useState(""),
    [comparison, setComparison] = useState<Project | null>(null),
    [exporting, setExporting] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    [snapshotName, setSnapshotName] = useState("");
  const warnings = projectWarnings(project);
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
  const chooseSection = (id: SectionType) => {
    setSelected(id);
    setPanel("inspector");
  };
  function reorder(index: number, direction: number) {
    const next = index + direction;
    if (next < 1 || next > 4) return;
    const sections = [...project.sections];
    [sections[index], sections[next]] = [sections[next], sections[index]];
    change({ ...project, sections });
  }
  async function importProject(file?: File) {
    if (!file) return;
    try {
      if (file.size > 30_000_000)
        throw new Error("Project is too large. Maximum import size is 30 MB.");
      const p = validateProject(JSON.parse(await file.text()));
      change(p);
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
          <button aria-pressed={!mobile} onClick={() => setMobile(false)}>
            <Icon name="desktop" />
            <span>Desktop</span>
          </button>
          <button aria-pressed={mobile} onClick={() => setMobile(true)}>
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
          <button
            className="pg-primary"
            disabled={!ready || !!comparison}
            onClick={() => dialog.current?.showModal()}
          >
            Export <Icon name="export" />
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
      <div className="pg-workspace">
        <aside className="pg-sidebar" aria-label="Page sections">
          <h2>Your page</h2>
          <label className="pg-sr-only" htmlFor="page-template">
            Template
          </label>
          <select
            id="page-template"
            value={project.template}
            disabled={!ready}
            onChange={(e) => {
              change(createProject(e.target.value as Project["template"]));
              setNotice(
                "Template changed. Undo brings your previous design back.",
              );
            }}
          >
            <option value="landing">Landing page</option>
            <option value="homepage">Homepage</option>
            <option value="portfolio">Portfolio</option>
          </select>
          <div className="pg-section-list">
            {project.sections.map((s, i) => (
              <div
                key={s.id}
                className={`pg-section-row ${selected === s.id ? "selected" : ""} ${!s.visible ? "hidden-section" : ""}`}
              >
                <button
                  className="pg-section-select"
                  aria-pressed={selected === s.id}
                  onClick={() => chooseSection(s.id)}
                >
                  <Icon name={s.id} />
                  <span>{labels[s.id]}</span>
                </button>
                <div className="pg-section-actions">
                  <button
                    title={`${s.visible ? "Hide" : "Show"} ${labels[s.id]}`}
                    aria-label={`${s.visible ? "Hide" : "Show"} ${labels[s.id]}`}
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
                  {i > 0 && i < 5 && (
                    <>
                      <button
                        aria-label={`Move ${labels[s.id]} up`}
                        disabled={i === 1}
                        onClick={() => reorder(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`Move ${labels[s.id]} down`}
                        disabled={i === 4}
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
                <button onClick={() => change(s.project)}>Restore</button>
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
                project={comparison || project}
                selected={selected}
                editing={editing && !comparison}
                mobile={mobile}
                onSelect={chooseSection}
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
        </main>
        <Inspector
          project={project}
          selected={selected}
          edit={change}
          notify={setNotice}
        />
      </div>
      <footer className="pg-statusbar">
        <span>
          <Icon name={mobile ? "mobile" : "desktop"} />
          {mobile ? "Mobile · 390px" : "Desktop · Fit to canvas"}
        </span>
        <span>
          {comparison
            ? "Saved variation"
            : editing
              ? "Click a section to make it yours"
              : "Visitor preview"}
        </span>
        <button disabled={!ready || !!comparison} onClick={() => dialog.current?.showModal()}>
          {warnings.length
            ? `${warnings.length} publishing notes`
            : "Ready to export"}{" "}
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
        <p>A working page. Every setting. Ready for your next step.</p>
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
          {exporting ? "Preparing package…" : "Download page package"}
          <Icon name="export" />
        </button>
        <small>Free during the preview release. No account required.</small>
      </dialog>
    </div>
  );
}
