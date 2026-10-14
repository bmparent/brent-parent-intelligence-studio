import { useEffect, useRef, useState } from 'react';
import { download } from './export';
import { projectWarnings, type Project } from './model';
import { buildFrozenPackage, createProjectSnapshot, decodeSnapshotImages, frozenPreviewDocument, isCurrentReview, parentEditions, type FrozenPackage } from './purchaseSnapshot';
import { loadFrozenReview, saveFrozenReview } from './purchaseReviewStorage';
import './finish-review.css';

type Props = { project: Project; documentId: string; revision: number; open: boolean; onClose(): void };
function FrozenPreview({ markup, mobile }: { markup: string; mobile: boolean }) {
  const frame = useRef<HTMLDivElement>(null), [size, setSize] = useState({ width: 500, height: 620 });
  useEffect(() => {
    const observer = new ResizeObserver(entries => { const box = entries[0].contentRect; if (box.width && box.height) setSize({ width: box.width, height: box.height }); });
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);
  const width = mobile ? 390 : 1280, scale = Math.min(1, size.width / width);
  return <div ref={frame} className="pg-finish-frame" data-mobile={mobile}><iframe title="Frozen package preview" sandbox="allow-scripts" srcDoc={markup} style={{ width, height: Math.ceil(size.height / scale), transform: `scale(${scale})`, transformOrigin: 'top left' }} /></div>;
}
export function FinishReview({ project, documentId, revision, open, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null), operation = useRef(0);
  const [frozen, setFrozen] = useState<FrozenPackage | null>(null), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [storageNote, setStorageNote] = useState(''), [parentId, setParentId] = useState('');
  const [mobile, setMobile] = useState(false), [approval, setApproval] = useState('');
  const value = frozen?.snapshot.documentId === documentId ? frozen : null;
  const isCurrent = !!value && isCurrentReview(value.snapshot, documentId, revision);
  const approved = !!value && approval === value.snapshot.snapshotHash;
  const notes = projectWarnings(value?.snapshot.project || project);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    let active = true; const request = ++operation.current;
    void loadFrozenReview(documentId).then(saved => {
      if (!active || request !== operation.current) return;
      setFrozen(saved); setParentId(saved?.snapshot.parent?.editionId || '');
      setPreview(saved ? frozenPreviewDocument(saved) : '');
    }).catch(reason => { if (active && request === operation.current) setStorageNote(`Previous review could not be loaded: ${(reason as Error).message}`); })
      .finally(() => { if (active && request === operation.current) setLoading(false); });
    return () => { active = false; operation.current = -1; };
  }, [documentId]);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  async function prepare() {
    const request = ++operation.current;
    setBusy(true); setError(''); setStorageNote('');
    try {
      // Capture synchronously before decoding/hashing; late draft edits cannot leak in.
      const source = structuredClone(project), snapshotPromise = createProjectSnapshot(source, documentId, revision, parentId);
      const [snapshot] = await Promise.all([snapshotPromise, decodeSnapshotImages(source)]);
      const next = await buildFrozenPackage(snapshot);
      if (request !== operation.current) return;
      const markup = frozenPreviewDocument(next);
      try { await saveFrozenReview(next, () => request === operation.current); }
      catch (reason) { if (request === operation.current) setStorageNote(`Review is available in this tab only. Local save failed: ${(reason as Error).message}`); }
      if (request !== operation.current) return;
      setFrozen(next); setPreview(markup); setApproval('');
    } catch (reason) { if (request === operation.current) setError((reason as Error).message); }
    finally { if (request === operation.current) setBusy(false); }
  }
  function downloadPackage() {
    if (!value || !approved) return;
    const name = (value.snapshot.project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60) || 'eidos-page') + '-review-' + value.snapshot.snapshotHash.slice(0, 10);
    download(value.archive, name + '.zip', 'application/zip');
  }
  return <dialog ref={dialog} className="pg-finish-dialog" aria-labelledby="pg-finish-title" onClose={onClose} onCancel={onClose}>
    <header className="pg-finish-header"><div><span className="pg-eyebrow">Finish your page</span><h2 id="pg-finish-title">Review this version.</h2><p>A local page package with the exact design and editable source.</p></div><button aria-label="Close finish review" onClick={onClose}>×</button></header>
    <div className="pg-finish-body"><section className="pg-finish-visual" aria-label="Frozen page preview">
      {value ? <><div className="pg-finish-device"><span>Frozen revision {value.snapshot.revision}</span><div><button aria-pressed={!mobile} onClick={() => setMobile(false)}>Desktop</button><button aria-pressed={mobile} onClick={() => setMobile(true)}>Mobile</button></div></div><FrozenPreview markup={preview} mobile={mobile} /></> : <div className="pg-finish-empty"><span aria-hidden="true">↗</span><h3>Your next step, kept together.</h3><p>Prepare the current draft, check the frozen page, then download its website files and editable source.</p></div>}
    </section><section className="pg-finish-details" aria-label="Package review">
      <span className="pg-finish-type">Developer source · single page</span>
      <h3>{value ? value.snapshot.project.name : project.name}</h3>
      <p>HTML, CSS, JavaScript, images, and project JSON. Open the page independently or import the JSON to keep editing.</p>
      {value && <p className={`pg-finish-state ${isCurrent ? '' : 'changed'}`} role="status">{isCurrent ? `This review matches draft revision ${revision}.` : `Your draft is now revision ${revision}. This review keeps revision ${value.snapshot.revision}.`}</p>}
      <details className="pg-finish-parent"><summary>Parent edition reference (optional)</summary><p>This records an existing source edition reference only. It does not add its archive or establish a purchase or license.</p><label>Developer edition<select aria-label="Parent developer edition" value={parentId} disabled={busy} onChange={event => setParentId(event.target.value)}><option value="">No parent edition reference</option>{parentEditions.map(parent => <option key={parent.editionId} value={parent.editionId}>{parent.family} · {parent.version}</option>)}</select></label>{value && <small>Frozen reference: {value.snapshot.parent ? `${value.snapshot.parent.family} ${value.snapshot.parent.version}` : 'none'}. Change the selection and prepare again to replace this review.</small>}</details>
      <button className="pg-button-secondary pg-finish-prepare" disabled={busy || loading} onClick={() => void prepare()}>{busy ? 'Preparing exact page files…' : loading ? 'Loading saved review…' : value ? 'Prepare current draft again' : 'Prepare current draft'}</button>
      {error && <p role="alert" className="pg-finish-error">{error}</p>}{storageNote && <p role="status" className="pg-finish-error">{storageNote}</p>}
      {value && <><details className="pg-finish-checks" open={notes.length > 0}><summary>Review before publishing{notes.length ? ` (${notes.length})` : ''}</summary>{notes.length ? <ul>{notes.map(note => <li key={note}>{note}</li>)}</ul> : <p>Check content, links, image rights, and both preview sizes before using the page.</p>}</details><label className="pg-finish-approval"><input type="checkbox" checked={approved} onChange={event => setApproval(event.target.checked ? value.snapshot.snapshotHash : '')} /><span>I reviewed this frozen version for my local download.</span></label><button className="pg-primary pg-finish-download" disabled={!approved || busy} onClick={downloadPackage}>Download page package <span aria-hidden="true">↗</span></button><div className="pg-finish-links"><button onClick={() => download(JSON.stringify(value.receipt, null, 2), 'local-package-receipt.json', 'application/json')}>Download hash receipt</button><button onClick={() => download(value.files.find(file => file.name === 'project.json')!.data, 'reviewed-project.json', 'application/json')}>Editable source</button></div><details className="pg-finish-integrity"><summary>Package identity & file hashes</summary><p>Local integrity only; no purchase is verified.</p><code>{value.snapshot.snapshotHash}</code><ul>{value.manifest.files.map(file => <li key={file.path}><span>{file.path} · {file.bytes.toLocaleString()} bytes</span><code>{file.sha256}</code></li>)}</ul></details></>}
      <div className="pg-finish-purchase"><button disabled>Purchase unavailable</button><small>Orders do not yet bind this frozen page. No payment, email, or entitlement check is performed here. Hosting, domains, and form services are separate.</small></div>
    </section></div>
  </dialog>;
}
