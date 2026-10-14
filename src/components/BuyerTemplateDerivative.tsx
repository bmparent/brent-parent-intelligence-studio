import { useEffect, useRef, useState } from 'react';
import { download } from '../playground/export';
import { buyerFamilies } from '../templates/buyerContract';
import type { TemplateConfiguration } from '../templates/configurator';
import { buildBuyerDerivative, buyerArchivePin, buyerDerivativePreview, buyerPreviewLocation, buyerVerificationMetadata, validateBuyerVerificationMetadata, verifyBuyerArchive, type BuyerDerivative, type BuyerPreviewLocation, type VerifiedBuyerBase } from '../templates/buyerDerivative';

export function BuyerTemplateDerivative({ config, revision, edit, endGesture, guard }: { config: TemplateConfiguration; revision: number; edit: (next: TemplateConfiguration, field?: string) => void; endGesture: () => void; guard: () => () => boolean }) {
  const [metadata, setMetadata] = useState<unknown>(null);
  const [base, setBase] = useState<VerifiedBuyerBase | null>(null);
  const [result, setResult] = useState<BuyerDerivative | null>(null);
  const [resultRevision, setResultRevision] = useState<number | null>(null);
  const [sourceGeneration, setSourceGeneration] = useState(0);
  const [resultGeneration, setResultGeneration] = useState<number | null>(null);
  const [page, setPage] = useState<BuyerPreviewLocation>({ file: 'index.html', search: '', hash: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Attach your own supported developer archive. The site never downloads or receives its bytes.');
  const [error, setError] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);
  const builtGuard = useRef<(() => boolean) | null>(null);
  const operation = useRef(0), alive = useRef(true);
  const contract = buyerFamilies[config.family], pin = buyerArchivePin(config);
  const fresh = result?.configFingerprint === JSON.stringify(config) && resultRevision === revision && resultGeneration === sourceGeneration;
  const htmlFiles = result?.files.filter(file => file.name.endsWith('.html')).map(file => file.name) || [];
  const previewPageKey = htmlFiles.join('|');
  const selectedPage = htmlFiles.includes(page.file) ? page : { file: 'index.html', search: '', hash: '' };
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; operation.current += 1; };
  }, []);
  function beginOperation() {
    const generation = ++operation.current, parentValid = guard();
    setSourceGeneration(generation);
    const local = () => alive.current && operation.current === generation;
    return { generation, local, valid: () => local() && parentValid() };
  }
  function clearImported() {
    operation.current += 1; setSourceGeneration(operation.current);
    setBase(null); setMetadata(null); setResult(null); setBusy(false); setError(''); builtGuard.current = null;
    setMessage('Imported archive bytes and derivative preview cleared from this tool. Your configuration and original file remain yours.');
  }
  useEffect(() => {
    function navigate(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== 'eidos-buyer-preview-page' || !previewPageKey.split('|').includes(event.data.file)) return;
      try { if (result) setPage(buyerPreviewLocation(result, event.data)); } catch { /* Ignore destinations outside this private derivative. */ }
    }
    window.addEventListener('message', navigate);
    return () => window.removeEventListener('message', navigate);
  }, [previewPageKey, result]);
  async function openMetadata(file: File | undefined) {
    if (!file) return;
    const pending = beginOperation(); setBusy(true); setMetadata(null); setBase(null); setResult(null); builtGuard.current = null;
    try {
      if (file.size > 300_000) throw Error('Verification JSON must be smaller than 300 KB.');
      const value = validateBuyerVerificationMetadata(JSON.parse(await file.text()), config);
      if (!pending.valid()) throw Error('The configuration changed while metadata was opening. Choose it again.');
      setMetadata(value); setBase(null); setResult(null); setError('');
      setMessage('Metadata matches the frozen candidate identity. Now attach your own original ZIP. No entitlement has been verified.');
    } catch (reason) { if (pending.local()) setError(reason instanceof Error ? reason.message : 'Could not verify this metadata.'); }
    finally { if (pending.local()) setBusy(false); }
  }
  async function openArchive(file: File | undefined) {
    if (!file || !metadata) return;
    const pending = beginOperation(); setBusy(true); setError(''); setBase(null); setResult(null); builtGuard.current = null;
    try {
      if (file.size > 5_000_000) throw Error('Base ZIP must be smaller than 5 MB.');
      const checked = await verifyBuyerArchive(new Uint8Array(await file.arrayBuffer()), metadata, config);
      if (!pending.valid()) throw Error('The configuration changed while the archive was opening. Attach it again here.');
      setBase(checked); setResult(null);
      setMessage(`Pinned candidate source verified: ${checked.pin.editionId}@${checked.pin.version}. Original bytes are unchanged. This establishes integrity, not entitlement or ownership.`);
    } catch (reason) { if (pending.local()) setError(reason instanceof Error ? reason.message : 'The archive could not be verified.'); }
    finally { if (pending.local()) setBusy(false); }
  }
  async function build() {
    if (!base) return;
    const pending = beginOperation(); setBusy(true); setError('');
    try {
      const output = await buildBuyerDerivative(base, config);
      if (!pending.valid()) throw Error('Options changed while the derivative was building. Build the current configuration again.');
      builtGuard.current = pending.valid; setResult(output); setResultRevision(revision); setResultGeneration(pending.generation); setPage({ file: 'index.html', search: '', hash: '' });
      setMessage('New private derivative built from your actual family files. Preview and download use these exact transformed bytes. The original ZIP and existing rights are unchanged.');
    } catch (reason) { if (pending.local()) setError(reason instanceof Error ? reason.message : 'Could not build this derivative.'); }
    finally { if (pending.local()) setBusy(false); }
  }
  function saveOutput(receiptOnly = false) {
    if (!result || !fresh || !builtGuard.current?.()) { setError('Options changed. Rebuild the current derivative before downloading.'); return; }
    if (receiptOnly) download(JSON.stringify({ schemaVersion: 1, derivativeId: result.id, archiveSha256: result.archiveHash, archiveBytes: result.archiveBytes, configurationSha256: result.configHash, parentArchive: result.manifest.parentArchive, commercialEntitlement: false, entitlementVerification: 'not_performed', originalArchiveChanged: false }, null, 2), `${result.id}-receipt.json`, 'application/json');
    else download(result.archive, `${result.id}.zip`, 'application/zip');
  }
  function choosePage(file: string, checked: boolean) {
    endGesture(); const pages = checked ? [...config.buyer.pages, file] : config.buyer.pages.filter(item => item !== file);
    const modules = config.buyer.modules.filter(id => { const module = contract.modules.find(item => item.id === id)!; return !module.pages.length || module.pages.some(page => pages.includes(page)); });
    edit({ ...config, buyer: { ...config.buyer, pages, modules } }, 'buyer-pages');
  }
  return <section className="ew-shell tc-buyer" aria-labelledby="tc-buyer-title">
    <p className="ew-eyebrow">Buyer-local developer source · candidate</p><h2 id="tc-buyer-title">Personalize the archive you already have.</h2>
    <p>Use your original {config.family} developer ZIP and matching verification metadata. This private local tool keeps the actual family layout, artwork, styles and interactions. It creates a new derivative identity and retains the original license. A matching hash or possession does not establish a purchase, entitlement or ownership.</p>
    <p className="tc-boundary">Supported: {pin.editionId} · {pin.version} · {pin.bytes.toLocaleString()} bytes. Historical unsupported archives keep their existing rights and retrieval path; no repurchase is required. WordPress, Squarespace and GoDaddy are unavailable in this adapter. No checkout, recovery, account or provider request is made.</p>
    <details><summary>Exact pinned candidate SHA-256 and verification metadata</summary><p><code>{pin.sha256}</code></p><button type="button" onClick={() => download(JSON.stringify(buyerVerificationMetadata(config), null, 2), `${pin.editionId}-${pin.version}-verification.json`, 'application/json')}>Download edition verification JSON</button><p>This file carries public archive identity only. It contains no paid source or entitlement.</p></details>
    <div className="tc-buyer-grid"><div className="tc-buyer-controls">
      <label>Release verification JSON<input type="file" accept="application/json,.json" aria-label="Buyer release verification JSON" onChange={event => { void openMetadata(event.target.files?.[0]); event.target.value = ''; }}/></label>
      <label>Your original developer ZIP<input type="file" accept="application/zip,.zip" aria-label="Buyer original developer ZIP" disabled={!metadata || busy} onChange={event => { void openArchive(event.target.files?.[0]); event.target.value = ''; }}/></label>
      <p className="tc-help">Metadata must match the pinned release first. Archive SHA/size is checked before decompression; every original manifest file/hash is then checked. ZIP bytes stay in this browser and are cleared on family/import/reopen switches.</p>
      <fieldset><legend>Actual pages in the private derivative</legend>{contract.pages.map(page => <label className="tc-check" key={page.file}><input type="checkbox" aria-label={`Buyer page ${page.label}`} disabled={page.file === 'index.html'} checked={config.buyer.pages.includes(page.file)} onChange={event => choosePage(page.file, event.target.checked)}/>{page.label} · <code>{page.file}</code></label>)}</fieldset><p className="tc-help">The original legal.html example is retained as an auxiliary page. Removed-page navigation is pruned; other removed destinations become clearly unavailable text.</p>
      <fieldset><legend>Native family modules</legend>{contract.modules.map(module => { const disabled = module.pages.length > 0 && !module.pages.some(page => config.buyer.pages.includes(page)); return <label className="tc-check" key={module.id}><input type="checkbox" aria-label={`Buyer module ${module.label}`} disabled={disabled} checked={config.buyer.modules.includes(module.id)} onChange={event => { endGesture(); edit({ ...config, buyer: { ...config.buyer, modules: event.target.checked ? [...config.buyer.modules, module.id] : config.buyer.modules.filter(id => id !== module.id) } }, 'buyer-modules'); }}/>{module.label}</label>; })}</fieldset>
      <label className="tc-check"><input type="checkbox" aria-label="Buyer allow original motion" checked={config.buyer.motion} onChange={event => { endGesture(); edit({ ...config, buyer: { ...config.buyer, motion: event.target.checked } }, 'buyer-motion'); }}/>Allow original family motion · reduced motion respected</label>
      <div className="tc-buyer-colors">{(['ink', 'paper', 'accent'] as const).map(key => <label key={key}>Family {key}<input type="color" aria-label={`Buyer ${key} color`} value={config.buyer.colors[key]} onChange={event => edit({ ...config, buyer: { ...config.buyer, colors: { ...config.buyer.colors, [key]: event.target.value } } }, `buyer-color-${key}`)} onBlur={endGesture}/></label>)}</div>
      <p className="tc-help">Site name, contact email, main headline/introduction and uploaded artwork come from Your content / Your artwork above. Brand/email apply across pages; headline/introduction/artwork apply to Home. These buyer options share the main Undo, Save locally, Reopen saved and configuration JSON. Reattach the original ZIP after reopening; it is not included in the JSON backup.</p>
      <div className="tc-actions"><button type="button" disabled={!base || busy} onClick={() => void build()}>{busy ? 'Checking / building locally…' : 'Build private family preview'}</button><button type="button" onClick={clearImported}>Clear imported source</button></div>
    </div><div className="tc-buyer-result">
      {result && fresh ? <><label>Private derivative preview page<select aria-label="Buyer preview page" value={selectedPage.file} onChange={event => setPage({ file: event.target.value, search: '', hash: '' })}>{htmlFiles.map(file => <option key={file}>{file}</option>)}</select></label><iframe ref={frame} title="Your actual family derivative preview" srcDoc={buyerDerivativePreview(result, selectedPage.file, selectedPage)} sandbox="allow-scripts allow-modals"/><p><strong>New private derivative</strong> · {result.id}</p><p>{result.files.length} exact files · {config.buyer.pages.length} selected pages + legal example · {config.buyer.modules.length} enabled native modules</p><details><summary>Exact derivative files and SHA-256</summary><p><code>{result.archiveHash}</code> · {result.archiveBytes.toLocaleString()} ZIP bytes</p><ul>{result.files.map(file => <li key={file.name}><code>{file.name}</code> · {file.data.length.toLocaleString()} bytes</li>)}</ul></details><div className="tc-actions"><button type="button" onClick={() => saveOutput()}>Download private derivative ZIP</button><button type="button" onClick={() => saveOutput(true)}>Download derivative receipt</button></div></> : <div className="tc-buyer-empty"><h3>{result ? 'Options changed. Rebuild to inspect this revision.' : 'Your real family preview appears here.'}</h3><p>Attach the matching archive, then build. Original sample preview above is a separate free output and is never substituted for your licensed family files.</p></div>}
      <p role="status">{message}</p>{error && <p className="ew-error" role="alert">{error}</p>}
    </div></div>
  </section>;
}
