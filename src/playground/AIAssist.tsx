import { useEffect, useRef, useState } from 'react';
import type { Project } from './model';
import { flattenNodes } from './authoringSchema';
import { applyProposal, contextProposalDiff, createProposalContext, operationLabel, proposalTargetId, stateHash, type AiScope } from './aiOperations';
import { AiRequestError, aiRequest, limitMicros, sameAiAction, usd, type AiAction, type AiBalance, type AiBrief, type AiResponse } from './aiClient';
import './aiAssist.css';

type Props = { project: Project; documentId: string; revision: number; selected: string; selectedNode: string; brandSelected: boolean; guard: () => () => boolean; edit: (project: Project) => void; preview: (project: Project | null) => void; previewActive: boolean };
type Capture = { documentId: string; revision: number; selected: string; selectedNode: string; brandSelected: boolean; username: string; scope: AiScope; instruction: string; hash: string; valid: () => boolean; context: ReturnType<typeof createProposalContext> };
const receiptKey = 'eidos-playground-ai-action-v1';
const pending = (action: AiAction | null) => !!action && ['reserved', 'submitted', 'reconciliation_pending'].includes(action.state);
const terminal = (action: AiAction | null) => !action || ['settled', 'cancelled', 'technical_waiver'].includes(action.state);
const scopeNames: Record<AiScope, string> = { element: 'This element', section: 'This section', page: 'Whole page', brand: 'Shared brand' };
const localTime = (date: string) => new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
function matchingReview(value: Capture | null, p: Props, scope: AiScope, instruction: string) {
  return !!value && value.documentId === p.documentId && value.revision === p.revision && value.selected === p.selected && value.selectedNode === p.selectedNode && value.brandSelected === p.brandSelected && value.scope === scope && value.instruction === instruction.trim();
}

/** Server receipts own spending. Apply uses the existing project and Undo history. */
export function AIAssist(props: Props) {
  const { project, selected, selectedNode, brandSelected } = props;
  const [open, setOpen] = useState(false), [scope, setScope] = useState<AiScope>(brandSelected ? 'brand' : selectedNode ? 'element' : 'section');
  const [instruction, setInstruction] = useState(''), [username, setUsername] = useState('');
  const [enabled, setEnabled] = useState(false), [accountReady, setAccountReady] = useState(false);
  const [balance, setBalance] = useState<AiBalance | null>(null), [action, setAction] = useState<AiAction | null>(null);
  const [busy, setBusy] = useState(''), [message, setMessage] = useState('Open Eidos to check availability. Manual editing is free.');
  const [limit, setLimit] = useState(''), [applied, setApplied] = useState(false), [discarded, setDiscarded] = useState(false);
  const [review, setReview] = useState<Capture | null>(null), [clock, setClock] = useState(() => Date.now());
  const [needsStatus, setNeedsStatus] = useState(false);
  const current = useRef(props), captured = useRef<Capture | null>(null), lock = useRef(false), controller = useRef<AbortController | null>(null);
  const mounted = useRef(true), cancelledWait = useRef(false), sequence = useRef(0);
  useEffect(() => { current.current = props; });
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { if (action?.state !== 'quoted') return; const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, [action]);
  const reviewMatches = matchingReview(review, props, scope, instruction) && !!username && review?.username === username;
  useEffect(() => { if (!reviewMatches && props.previewActive) queueMicrotask(() => current.current.preview(null)); }, [reviewMatches, props.previewActive]);

  function stillCurrent(value = captured.current, p = current.current) {
    return !!value && value.valid() && matchingReview(value, p, scope, instruction);
  }
  function capture(value: Capture | null) { captured.current = value; setReview(value); }
  function remember(value: AiAction | null, owner = username) {
    try { if (value && owner) sessionStorage.setItem(receiptKey, JSON.stringify({ id: value.id, username: owner })); else sessionStorage.removeItem(receiptKey); } catch { /* The visible action ID remains available if browser storage is unavailable. */ }
  }
  function accept(value: AiResponse, owner = username) {
    if (value.balance) { setBalance(value.balance); setLimit(String(value.balance.requestedLimit / 1000000)); }
    if (value.action) { setAction(value.action); remember(value.action, owner); }
    return value.action;
  }
  function describe(value: AiAction) {
    if (value.state === 'settled' && value.result) return 'Proposal generated. Review before Apply. Generated usage has been charged; Discard does not refund it.';
    if (value.state === 'settled') return 'This settled receipt has no usable proposal. Your design is unchanged; inspect the recorded charge before requesting another action.';
    if (value.state === 'technical_waiver') return 'This action was technically waived. Customer allowance was restored. Any unresolved provider cost stays with Eidos.';
    if (value.state === 'cancelled') return 'The action was canceled before dispatch. No generation was charged.';
    if (pending(value)) return 'This action is pending or its provider outcome is unknown. Check its status before starting another generation.';
    return 'Review this frozen quote, then explicitly confirm generation.';
  }
  async function run(label: string, work: (signal: AbortSignal) => Promise<void>) {
    if (lock.current) return;
    lock.current = true; cancelledWait.current = false; const abort = new AbortController(); controller.current = abort; setBusy(label);
    let releaseAbort = () => {};
    const stopped = new Promise<never>((_, reject) => {
      const onAbort = () => reject(new DOMException('Stopped waiting.', 'AbortError'));
      abort.signal.addEventListener('abort', onAbort, { once: true });
      releaseAbort = () => abort.signal.removeEventListener('abort', onAbort);
    });
    try { await Promise.race([work(abort.signal), stopped]); }
    catch (error) { if (mounted.current) setMessage(cancelledWait.current ? 'Stopped waiting. Provider work may still complete and incur usage. Check the existing action status.' : error instanceof Error ? error.message : 'Eidos is unavailable. Your design is unchanged.'); }
    finally { releaseAbort(); lock.current = false; if (controller.current === abort) controller.current = null; if (mounted.current) setBusy(''); }
  }
  async function refresh(signal: AbortSignal) {
    const requestSequence = ++sequence.current;
    setMessage('Checking Eidos availability…');
    const configuration = await fetch('/api/public-config', { credentials: 'same-origin', cache: 'no-store', signal });
    if (!configuration.ok) throw Error('Eidos availability could not be verified. Manual editing remains available.');
    const config = await configuration.json();
    if (typeof config.accountsReady !== 'boolean' || typeof config.playgroundAiReady !== 'boolean') throw Error('Eidos configuration is unavailable.');
    if (!mounted.current || requestSequence !== sequence.current) return;
    setEnabled(false); setAccountReady(config.accountsReady);
    if (!config.accountsReady) { setUsername(''); setBalance(null); setMessage('Eidos account access is unavailable in this preview. Keep building manually.'); return; }
    const response = await fetch('/api/members/account', { credentials: 'same-origin', cache: 'no-store', signal });
    if (!response.ok) throw Error('Your signed-in account could not be verified.');
    const account = await response.json(), owner = account.member?.username;
    if (!mounted.current || requestSequence !== sequence.current) return;
    if (typeof owner !== 'string' || !owner) { setUsername(''); setBalance(null); capture(null); setAction(null); remember(null); current.current.preview(null); setMessage('Sign in to check your Eidos allowance and monthly limit.'); return; }
    if (username && username !== owner) { capture(null); setAction(null); setBalance(null); remember(null); current.current.preview(null); setNeedsStatus(false); }
    setUsername(owner);
    const value = await aiRequest(undefined, undefined, signal);
    if (!mounted.current || requestSequence !== sequence.current) return;
    accept(value, owner); setEnabled(config.playgroundAiReady && value.enabled === true);
    setMessage(config.playgroundAiReady && value.enabled ? 'Eidos is available. Choose a scope and describe the change to request a quote.' : value.reason || 'Generation is unavailable in this preview. Manual edits and existing downloads remain available.');
    let restored: { id?: unknown; username?: unknown } | null = null;
    try { restored = JSON.parse(sessionStorage.getItem(receiptKey) || 'null'); } catch { /* Invalid local metadata grants no access. */ }
    if (restored && restored.username === owner && typeof restored.id === 'string') {
      try {
        const previous = await aiRequest(undefined, restored.id, signal);
        if (!mounted.current || requestSequence !== sequence.current) return;
        if (action && previous.action?.id === action.id && !sameAiAction(action, previous.action)) { capture(null); current.current.preview(null); throw Error('The restored action changed its frozen quote. Keep the original action reference and request support.'); }
        const received = accept(previous, owner);
        if (received) { setNeedsStatus(false); setMessage(describe(received) + (!captured.current ? ' This restored receipt cannot be applied to a new or changed workspace.' : '')); }
      } catch (error) { if (error instanceof AiRequestError && error.status === 404) remember(null); else throw error; }
    }
  }
  async function quote(signal: AbortSignal) {
    if (!enabled || !username || instruction.trim().length < 3 || !terminal(action)) return;
    const p = current.current, valid = p.guard(), context = createProposalContext(p.project, p.selected, p.selectedNode, scope), hash = await stateHash(p.project);
    if (!valid()) throw Error('Your design changed while preparing this request. Review it again.');
    const snapshot: Capture = { documentId: p.documentId, revision: p.revision, selected: p.selected, selectedNode: p.selectedNode, brandSelected: p.brandSelected, username, scope, instruction: instruction.trim(), hash, valid, context };
    capture(snapshot);
    const targetId = proposalTargetId(context), brief: AiBrief = { documentId: p.documentId, revision: String(p.revision), scope, targetId, instruction: snapshot.instruction, context: JSON.stringify(context) };
    const value = await aiRequest({ action: 'quote', idempotencyKey: crypto.randomUUID(), brief }, undefined, signal);
    if (!mounted.current) return;
    const received = accept(value); setApplied(false); setDiscarded(false); setNeedsStatus(false);
    if (!received || received.documentId !== p.documentId || received.revision !== String(p.revision) || received.scope !== scope || received.targetId !== targetId) { capture(null); throw Error('The quote does not match this design and scope. Generation is blocked.'); }
    setMessage(stillCurrent(snapshot) ? describe(received) : 'Your design or selection changed. Cancel this quote and request a fresh one.');
  }
  async function generate(signal: AbortSignal) {
    if (!action || needsStatus || action.state !== 'quoted' || !stillCurrent() || Date.parse(action.expiresAt) <= clock) throw Error('This quote is stale, expired or awaiting status. Check the existing action before requesting more generation.');
    setNeedsStatus(true);
    const value = await aiRequest({ action: 'generate', id: action.id, approvedMaximumMicros: action.maximum }, undefined, signal);
    if (!mounted.current || signal.aborted) return;
    const received = value.action;
    if (!received || !sameAiAction(action, received)) { capture(null); current.current.preview(null); throw Error('Eidos returned a different action receipt. Check the original action status.'); }
    accept(value); setNeedsStatus(false);
    setMessage(describe(received) + (stillCurrent() ? '' : ' Your design or selection changed, so Apply is disabled.'));
  }
  async function check(signal: AbortSignal) {
    if (!action) return;
    const value = await aiRequest(undefined, action.id, signal);
    if (!mounted.current) return;
    if (!value.action || !sameAiAction(action, value.action)) throw Error('Eidos returned a different receipt. Keep the original action reference.');
    const received = accept(value); setNeedsStatus(false); if (received) setMessage(describe(received));
  }
  async function cancel(signal: AbortSignal) {
    if (!action) return;
    const value = await aiRequest({ action: 'cancel', id: action.id }, undefined, signal);
    if (!mounted.current) return;
    if (!value.action || !sameAiAction(action, value.action)) throw Error('Eidos returned a different receipt. Keep the original action reference.');
    const received = accept(value); setNeedsStatus(false); if (received) setMessage(describe(received));
  }
  async function apply(signal: AbortSignal) {
    if (!action?.result || action.state !== 'settled' || applied || discarded || !captured.current) return;
    const saved = captured.current, p = current.current;
    try {
      if (!stillCurrent(saved)) throw Error('This proposal is stale. Your current manual work is preserved. Request a new quote from the current selection.');
      const response = await fetch('/api/members/account', { credentials: 'same-origin', cache: 'no-store', signal });
      if (!response.ok || (await response.json()).member?.username !== saved.username) throw Error('Your signed-in account changed. Refresh availability before applying this proposal.');
      const hash = await stateHash(p.project);
      if (!stillCurrent(saved) || hash !== saved.hash) throw Error('Your design changed. This proposal cannot replace the current manual work.');
      const next = applyProposal(p.project, saved.selected, saved.scope, action.result, saved.selectedNode);
      if (!stillCurrent(saved)) throw Error('Your workspace changed. Apply was canceled.');
      p.preview(null); p.edit(next); setApplied(true); setMessage('Applied as one edit. Undo restores the previous design. Apply adds no AI charge.');
    } catch (error) { setMessage((error as Error).message); }
  }
  const stale = !!action && !reviewMatches, canQuote = enabled && !!username && !busy && !needsStatus && instruction.trim().length >= 3 && terminal(action);
  let diff: ReturnType<typeof contextProposalDiff> = [];
  try { if (action?.result && review) diff = contextProposalDiff(review.context, action.result); } catch { /* Full-project validation also blocks invalid proposals at Apply. */ }
  const node = project.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []).find(n => n.id === selectedNode);
  const selection = scope === 'element' ? node?.name || node?.type || 'No element selected' : scope === 'section' ? project.sections.find(s => s.id === selected)?.title || selected : scope === 'brand' ? project.brand?.businessName || project.name : project.name;
  return <section className="pg-ai-assist" aria-label="Eidos assistance">
    <button className="pg-ai-open" aria-expanded={open} onClick={() => { if (open) setOpen(false); else { setOpen(true); void run('availability', refresh); } }}><span aria-hidden="true">✦</span>Ask Eidos<span aria-hidden="true">{open ? '−' : '+'}</span></button>
    {open && <div className="pg-ai-body">
      <p className="pg-ai-message" role="status">{message}</p><button disabled={!!busy} onClick={() => void run('availability', refresh)}>Refresh availability &amp; balance</button>
      {accountReady && !username && <a href="/account" target="_blank" rel="noreferrer">Sign in to your Eidos account ↗</a>}
      {balance && <div className="pg-ai-balance" aria-label="AI balance and monthly limit"><strong>{balance.mode === 'test' ? 'TEST allowance' : 'AI allowance'}</strong><dl>
        <div><dt>Included available</dt><dd>{usd(balance.availableIncluded)}</dd></div><div><dt>Purchased available</dt><dd>{usd(balance.availablePurchased)}</dd></div><div><dt>Usage this month</dt><dd>{usd(balance.settled)}</dd></div><div><dt>Included / purchased used</dt><dd>{usd(balance.settledIncluded)} / {usd(balance.settledPurchased)}</dd></div><div><dt>Reserved</dt><dd>{usd(balance.pending)}</dd></div><div><dt>Remaining monthly cap</dt><dd>{usd(balance.remainingCap)}</dd></div><div><dt>Monthly usage limit</dt><dd>{usd(balance.requestedLimit)}</dd></div>
      </dl><p>Resets {localTime(balance.resetsAt)} (your local time; {balance.resetsAt}). This limit covers all AI usage across your projects and devices, including included allowance. Package purchases and explicit top-ups are separate.</p>{balance.loweringPending && <p>The requested limit is below existing commitments. The effective floor is {usd(balance.effectiveLimit)}; existing usage cannot be undone.</p>}{balance.frozen && <p role="alert">This AI balance is frozen. Generation is unavailable.</p>}</div>}
      {username && <details className="pg-ai-limit"><summary>Set Monthly AI usage limit</summary><label>Monthly limit (USD)<input aria-label="Monthly AI usage limit (USD)" type="text" inputMode="decimal" value={limit} onChange={e => setLimit(e.target.value)} /></label><p>Only you can change your limit. Setting it does not purchase funds or enable automatic recharge.</p><button disabled={!!busy} onClick={() => void run('limit', async signal => { const value = await aiRequest({ action: 'limit', limitMicros: limitMicros(limit) }, undefined, signal); if (mounted.current) { accept(value); setMessage('Monthly AI usage limit updated. Existing usage and reservations carry forward.'); } })}>Save monthly limit</button></details>}
      <label>Change scope<select aria-label="Eidos change scope" value={scope} disabled={!!busy} onChange={e => setScope(e.target.value as AiScope)}><option value="element" disabled={!selectedNode}>This element</option><option value="section">This section</option><option value="page">Whole page</option><option value="brand">Shared brand</option></select></label><p className="pg-ai-target"><strong>{scopeNames[scope]}</strong> · {selection}</p>
      <label>Describe the change<textarea aria-label="Describe the Eidos change" value={instruction} maxLength={2000} rows={4} disabled={!!busy} onChange={e => setInstruction(e.target.value)} placeholder="Make this clearer for a first-time visitor…" /></label><p>Only relevant text, structure and brand settings are sent. Uploaded image bytes and private purchase archives stay out of the request.</p>
      <button className="pg-ai-primary" disabled={!canQuote || !!balance?.frozen} onClick={() => void run('quote', quote)}>Get generation quote</button>
      {action && <div className="pg-ai-action" aria-label="Eidos action receipt"><strong>{scopeNames[action.scope]} · {needsStatus ? 'status unknown' : action.state.replaceAll('_', ' ')}</strong><dl><div><dt>Estimate</dt><dd>{usd(action.estimate)}</dd></div><div><dt>Approved maximum</dt><dd>{usd(action.maximum)}</dd></div><div><dt>Actual AI usage charged</dt><dd>{needsStatus || pending(action) ? 'Pending confirmation' : usd(action.chargedIncluded + action.chargedPurchased)}</dd></div><div><dt>Included / purchased charged</dt><dd>{usd(action.chargedIncluded)} / {usd(action.chargedPurchased)}</dd></div></dl><p>{action.model} · rate {action.rateCardVersion}</p><p>Action <code>{action.id}</code></p>
        {action.state === 'quoted' && <><p>Quote expires {localTime(action.expiresAt)}. A usable generated proposal is charged at actual usage up to this maximum, even if you Discard it. Apply has no second charge.</p>{stale && <p role="alert">Your design, selection or request changed. This quote cannot be confirmed.</p>}<button className="pg-ai-primary" disabled={!!busy || stale || needsStatus || Date.parse(action.expiresAt) <= clock} onClick={() => void run('generation', generate)}>Confirm generation · max {usd(action.maximum)}</button></>}
        {['quoted', 'reserved'].includes(action.state) && <button disabled={!!busy} onClick={() => void run('cancellation', cancel)}>{needsStatus ? 'Request cancellation' : 'Cancel before dispatch'}</button>}{(pending(action) || needsStatus) && <p>Pending usage retains its reservation. Stopping this browser request does not prove provider cancellation or a refund. Check status before another request.</p>}<button disabled={!!busy} onClick={() => void run('status', check)}>Check existing action status</button>
        {action.result && !discarded && <div className="pg-ai-proposal" aria-label="Eidos before and after proposal"><h3>Proposed changes</h3>{diff.length ? <ul>{diff.map((item, index) => <li key={index}><strong>{operationLabel(item.field)}</strong><span>Before: {item.before}</span><span>After: {item.after}</span></li>)}</ul> : <p>This restored receipt has no matching local review context. Request a fresh proposal to change this design.</p>}{stale && !applied && <p role="alert">This proposal is stale. Your current manual edits are preserved.</p>}<button disabled={!!busy || stale || applied || !diff.length} onClick={() => { try { if (!stillCurrent()) throw Error('This proposal is stale. Your manual work is preserved.'); props.preview(props.previewActive ? null : applyProposal(project, review!.selected, review!.scope, action.result, review!.selectedNode)); } catch (error) { setMessage((error as Error).message); } }}>{props.previewActive ? 'Show current page' : 'Preview proposed page'}</button><button className="pg-ai-primary" disabled={!!busy || stale || applied || !diff.length} onClick={() => void run('apply', apply)}>{applied ? 'Proposal applied' : 'Apply proposal · no extra charge'}</button><button disabled={!!busy || applied} onClick={() => { props.preview(null); setDiscarded(true); setMessage('Proposal discarded. Its generated usage remains charged. Your design is unchanged.'); }}>Discard proposal</button></div>}
      </div>}{busy === 'generation' && <button onClick={() => { cancelledWait.current = true; setNeedsStatus(true); setMessage('Stopped waiting. Provider work may still complete and incur usage. Check the existing action status.'); controller.current?.abort(); }}>Stop waiting</button>}
    </div>}
  </section>;
}
