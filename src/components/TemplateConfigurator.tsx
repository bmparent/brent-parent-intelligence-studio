import { useEffect, useReducer, useRef, useState } from 'react';
import { editionName, money, pageNames, templateProduct, templateProducts } from '../data/templateCatalog';
import { download, zipFiles } from '../playground/export';
import { associatedPackage, configurationFiles, configurationStorageKey, createConfiguration, familyDirections, moduleOptions, pageOptions, reconcileConfiguration, samplePage, validateConfiguration, type TemplateConfiguration } from '../templates/configurator';
import '../styles/template-configurator.css';

type History = { current: TemplateConfiguration; past: TemplateConfiguration[]; future: TemplateConfiguration[]; group: string };
type Action = { type: 'edit'; next: TemplateConfiguration; group: string } | { type: 'undo' } | { type: 'redo' };
function historyReducer(state: History, action: Action): History {
  if (action.type === 'undo') {
    const previous = state.past.at(-1);
    return previous ? { current: previous, past: state.past.slice(0, -1), future: [state.current, ...state.future], group: '' } : state;
  }
  if (action.type === 'redo') {
    const next = state.future[0];
    return next ? { current: next, past: [...state.past, state.current], future: state.future.slice(1), group: '' } : state;
  }
  if (JSON.stringify(state.current) === JSON.stringify(action.next)) return state;
  return { current: action.next, past: state.group === action.group ? state.past : [...state.past.slice(-79), state.current], future: [], group: action.group };
}

export function TemplateConfigurator() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => ({ current: createConfiguration(), past: [], future: [], group: '' }));
  const config = history.current;
  const [page, setPage] = useState<typeof config.pages[number]>('home');
  const [phone, setPhone] = useState(false);
  const [message, setMessage] = useState('Configuration stays in this browser. Download JSON for a portable backup.');
  const [saveState, setSaveState] = useState('Not saved');
  const [error, setError] = useState('');
  const group = useRef(0);
  const current = useRef(config);
  const revision = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const preview = useRef<HTMLIFrameElement>(null);
  const product = templateProduct(config.family)!;
  const edition = product.editions.find(item => item.id === config.editionId)!;
  const associated = associatedPackage(config);
  const files = configurationFiles(config);
  const selectedPage = config.pages.includes(page) ? page : 'home';

  function edit(next: TemplateConfiguration, field = 'options') {
    try {
      const checked = reconcileConfiguration(next);
      current.current = checked;
      revision.current += 1;
      dispatch({ type: 'edit', next: checked, group: `${field}-${group.current}` });
      setSaveState('Unsaved changes'); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The configuration could not change.'); }
  }
  function historyAction(type: 'undo' | 'redo') {
    revision.current += 1; group.current += 1;
    const next = type === 'undo' ? history.past.at(-1) : history.future[0];
    if (next) current.current = next;
    dispatch({ type }); setSaveState('Unsaved changes');
  }
  useEffect(() => {
    const family = new URLSearchParams(window.location.search).get('family');
    if (family && templateProduct(family)) {
      const next = createConfiguration(family);
      current.current = next;
      dispatch({ type: 'edit', next, group: 'initial-family' });
    }
  }, []);
  useEffect(() => {
    function openPreviewPage(event: MessageEvent) {
      if (event.source !== preview.current?.contentWindow || !event.data || event.data.type !== 'eidos-template-preview-page') return;
      if (config.pages.includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener('message', openPreviewPage);
    return () => window.removeEventListener('message', openPreviewPage);
  }, [config.pages]);
  function save() {
    setSaveState('Saving…');
    try {
      localStorage.setItem(configurationStorageKey, JSON.stringify(validateConfiguration(current.current)));
      setSaveState('Saved in this browser'); setMessage('Saved locally. Reopen saved restores these exact options. Account storage is a separate gated service.'); setError('');
    } catch { setSaveState('Save failed'); setError('Browser storage is unavailable or full. Download configuration JSON to keep your work.'); }
  }
  function reopen() {
    try {
      const source = localStorage.getItem(configurationStorageKey);
      if (!source) throw Error('No saved configuration is in this browser yet. Save locally or import your JSON backup.');
      edit(validateConfiguration(JSON.parse(source)), 'restore'); group.current += 1;
      setSaveState('Saved in this browser'); setMessage('The saved local configuration is open. Undo restores the configuration you had before reopening.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The saved configuration is invalid. Your open work is unchanged.'); }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    const start = revision.current;
    try {
      if (file.size > 150_000) throw Error('Configuration JSON must be smaller than 150 KB.');
      const next = validateConfiguration(JSON.parse(await file.text()));
      if (start !== revision.current) throw Error('Your configuration changed while the file was opening. Import again to apply it to the current work.');
      edit(next, 'import'); group.current += 1; setMessage('Imported configuration. Undo restores your previous work.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not import this JSON. Your open configuration is unchanged.'); }
    if (input.current) input.current.value = '';
  }
  function exportPackage() {
    try {
      const snapshot = validateConfiguration(current.current);
      download(zipFiles(configurationFiles(snapshot)), `eidos-${snapshot.family}-${snapshot.tier}-sample.zip`, 'application/zip');
      setMessage('Downloaded an original static sample with its exact selected pages and modules. Unzip, then open index.html independently. The paid family archive is a separate product.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Export failed. Your configuration remains open.'); }
  }
  function checkboxPage(id: typeof config.pages[number], checked: boolean) {
    group.current += 1; edit({ ...config, pages: checked ? [...config.pages, id] : config.pages.filter(item => item !== id) });
  }

  return <div className="tc-page">
    <section className="ew-shell tc-intro"><a href="/shop">← Template collection</a><p className="ew-eyebrow">A useful starting point</p><h1>Choose a direction.<br /><em>Leave with something real.</em></h1><p>Explore four original family directions, choose the pages and supported features, and download a working static sample. Preview and export use the same configuration.</p><p className="tc-boundary">Local sample candidate · Paid family archives, proposed prices, licenses, and release gates stay separate. This tool does not personalize or grant access to a purchased template.</p></section>
    <section className="ew-shell tc-workspace" aria-label="Template configuration workspace">
      <div className="tc-toolbar"><div className="tc-actions"><button type="button" disabled={!history.past.length} onClick={() => historyAction('undo')}>Undo</button><button type="button" disabled={!history.future.length} onClick={() => historyAction('redo')}>Redo</button><button type="button" onClick={save}>Save locally</button><button type="button" onClick={reopen}>Reopen saved</button><button type="button" onClick={() => input.current?.click()}>Import JSON</button><button type="button" onClick={() => download(JSON.stringify(config, null, 2), `${config.family}-configuration.json`, 'application/json')}>Download JSON</button></div><span role="status">{saveState}</span><input ref={input} type="file" accept="application/json,.json" hidden onChange={event => void importFile(event.target.files?.[0])} /></div>
      <aside className="tc-controls" aria-label="Configuration options">
        <label>Family<select aria-label="Family" value={config.family} onChange={event => { group.current += 1; edit(createConfiguration(event.target.value), 'family'); }}>
          {templateProducts.map(item => <option key={item.slug} value={item.slug}>{item.name} · {item.market}</option>)}
        </select></label><p className="tc-help">{familyDirections[config.family].layout}</p>
        <label>Output / platform<select aria-label="Output / platform" value="developer" onChange={() => {}}><option value="developer">Portable HTML sample</option>{product.editions.filter(item => item.platform !== 'developer').map(item => <option key={item.id} value={item.platform} disabled>{editionName(item)} · unavailable here</option>)}</select></label><p className="tc-help">This generator exports static HTML. Native WordPress themes and builder kits need their own edition and verified installation path. <a href={`/shop/${config.family}`}>Inspect those exact editions →</a></p>
        <fieldset><legend>Pages in your sample</legend>{pageOptions.map(item => <label className="tc-check" key={item.id}><input type="checkbox" checked={config.pages.includes(item.id)} disabled={item.id === 'home'} onChange={event => checkboxPage(item.id, event.target.checked)} />{item.label}{item.id === 'home' ? ' · required' : ''}</label>)}</fieldset>
        <label>Sample feature tier<select aria-label="Sample feature tier" value={config.tier} onChange={event => { group.current += 1; edit({ ...config, tier: event.target.value as typeof config.tier }); }}><option value="essential">Essential · selected pages + static artwork</option><option value="expressive">Expressive · compatible interactive modules</option></select></label><p className="tc-help">These are free sample feature sets. They do not introduce a paid price tier.</p>
        <fieldset><legend>Optional modules</legend>{moduleOptions.map(module => {
          const disabled = config.tier !== 'expressive' || Boolean(module.requires && !config.pages.includes(module.requires));
          return <label className="tc-module" key={module.id}><span className="tc-check"><input type="checkbox" aria-label={module.label} disabled={disabled} checked={config.modules.includes(module.id)} onChange={event => { group.current += 1; edit({ ...config, modules: event.target.checked ? [...config.modules, module.id] : config.modules.filter(id => id !== module.id) }); }} />{module.label}</span><small>{disabled ? `Requires Expressive${module.requires ? ` + ${pageOptions.find(item => item.id === module.requires)!.label}` : ''}. ` : ''}{module.description}</small></label>;
        })}</fieldset>
        <details open><summary>Your content</summary>{(['name', 'headline', 'description'] as const).map(field => <label key={field}>{field === 'name' ? 'Site name' : field === 'headline' ? 'Main headline' : 'Introduction'}<input value={config[field]} maxLength={field === 'name' ? 80 : field === 'headline' ? 120 : 500} onBlur={() => { group.current += 1; }} onChange={event => edit({ ...config, [field]: event.target.value }, field)} /></label>)}<label>Contact email (optional; applies when you leave the field)<input key={config.contactEmail} defaultValue={config.contactEmail} maxLength={254} onBlur={event => { group.current += 1; edit({ ...current.current, contactEmail: event.target.value }, 'contactEmail'); }} /></label><p className="tc-help">Contact opens the visitor’s email app when an address is configured. A static page does not establish delivered inquiries.</p></details>
        <button className="tc-reset" type="button" onClick={() => { group.current += 1; edit(createConfiguration(config.family), 'reset'); }}>Reset this family · Undo available</button>
      </aside>
      <div className="tc-canvas"><div className="tc-preview-bar"><label>Preview page<select aria-label="Preview page" value={selectedPage} onChange={event => setPage(event.target.value as typeof page)}>{pageOptions.filter(item => config.pages.includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><button type="button" aria-pressed={phone} onClick={() => setPhone(value => !value)}>{phone ? 'Phone width · show desktop' : 'Desktop · show phone width'}</button></div><div className={`tc-frame-wrap${phone ? ' tc-frame-wrap--phone' : ''}`}><iframe ref={preview} title={`${product.name} ${selectedPage} original sample preview`} srcDoc={samplePage(config, selectedPage)} sandbox="allow-scripts allow-modals" /></div><p className="tc-help">Original sample preview · follow the navigation or use the page selector. The downloaded package uses ordinary local page links.</p>
        <div className="tc-export"><div><h2>Your exact sample package</h2><p>{config.pages.length} pages · {config.modules.length ? config.modules.map(id => moduleOptions.find(item => item.id === id)!.label).join(' · ') : 'No optional modules'} · {files.length} files</p></div><button className="ew-button ew-button--primary" type="button" onClick={exportPackage}>Download working sample ZIP ↓</button><details><summary>Included files ({files.length})</summary><ul>{files.map(file => <li key={file.name}><code>{file.name}</code> <small>{file.data.length.toLocaleString()} bytes</small></li>)}</ul></details></div>
        <p className="tc-feedback" role="status">{message}</p>{error && <p className="ew-error" role="alert">{error}</p>}
      </div>
    </section>
    <section className="ew-shell tc-bottom"><div><p className="ew-eyebrow">The separate paid family</p><h2>{product.name} developer source</h2><p>{product.summary}</p><p><strong>{money(edition.draftPriceCents)} proposed price</strong> · {edition.id} · version {edition.version} · purchasing unavailable unless the existing TEST/LIVE readiness contract authorizes it.</p><p>The immutable archive includes {pageNames(product).join(' · ')}. Your sample options do not alter its {associated.files.length} files, original version, rights, or recovery path.</p><details><summary>Actual paid archive contents ({associated.files.length})</summary><ul>{associated.files.map(file => <li key={file}><code>{file}</code></li>)}</ul></details><p><a href={`/shop/${product.slug}`}>Review actual demo, editions, and release status →</a></p><p><a href={associated.guidePath}>Read this exact edition’s setup and rollback guide →</a></p></div><div><p className="ew-eyebrow">Use your output</p><h2>From sample to your own site.</h2><ol><li>Choose pages, edit content, and use Undo to compare.</li><li>Save locally; reopen the saved configuration. Keep JSON for another browser.</li><li>Download and unzip. Open index.html directly; follow every selected page link.</li><li>Try included gallery filters, inspection, Escape, and the motion toggle. Review reduced motion and narrow screens.</li><li>Replace demonstration copy, verify contact delivery separately, and upload all files to static hosting.</li></ol><p>System fonts and original local SVG artwork are included. No build service, account, API key, or paid template entitlement is needed for this separate sample.</p><a href="/playground?studio=artwork">Create your own artwork in Playground →</a></div></section>
  </div>;
}
