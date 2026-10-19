import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Turnstile } from '../components/Turnstile';
import { download } from './export';
import type { FrozenPackage } from './purchaseSnapshot';
import { acceptFrozenDelivery, assertPurchaseCapability, assertReviewedPurchaseTerms, clearPurchaseReturn, downloadDeliveryArtifact, fetchAcceptedDelivery, fetchDeliveryCapabilities, fetchDeliveryPurchase, inspectOwnedPurchase, loadPurchaseAttempt, matchingProduct, newPurchaseReceipt, PurchaseRequestError, purchaseReturn, saveCheckoutReturn, savePurchaseAttempt, startFrozenCheckout, type DeliveryCapabilities, type DeliveryPurchase, type PurchaseAttempt } from './purchaseClient';
import './finish-purchase.css';

type Props = { frozen: FrozenPackage; approved: boolean; current: boolean; open: boolean; draftVersion: string };
export function FinishPurchase({ frozen, approved, current, open, draftVersion }: Props) {
  const [capabilities, setCapabilities] = useState<DeliveryCapabilities | null>(null), [attempt, setAttempt] = useState<PurchaseAttempt | null>(null), [purchase, setPurchase] = useState<DeliveryPurchase | null>(null);
  const [message, setMessage] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [signin, setSignin] = useState(false);
  const [terms, setTerms] = useState(false), [challenge, setChallenge] = useState(''), [reset, setReset] = useState(0), [useOlder, setUseOlder] = useState(false);
  const mounted = useRef(true), lock = useRef(false), generation = useRef(0);
  const consent = `${open}:${approved}:${current}:${draftVersion}:${terms}:${useOlder}`;
  const latest = useRef(consent);
  useLayoutEffect(() => { latest.current = consent; generation.current++; }, [consent]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const product = capabilities && matchingProduct(capabilities, frozen);
  const ready = !!capabilities?.available && !!product && approved && (current || useOlder);
  const reviewedPrice = purchase?.priceCents ?? product?.priceCents;
  const testMode = capabilities?.mode !== 'live';
  const paid = purchase?.status === 'paid' && purchase.approvedPage.state === 'ready';
  const terminal = purchase && (['expired', 'failed'].includes(purchase.paymentState || '') || ['expired', 'failed'].includes(purchase.status));
  const returned = purchaseReturn();
  function remember(value: PurchaseAttempt) {
    try { savePurchaseAttempt(value); }
    catch { throw Error('This browser cannot retain the private checkout attempt. Keep a local backup and allow session storage before checkout.'); }
    setAttempt(value); setTerms(false); setChallenge(''); setReset(count => count + 1);
  }
  async function run(action: (valid: () => void) => Promise<void>) {
    if (lock.current || !open) return;
    lock.current = true; setBusy(true); setError(''); setSignin(false);
    const captured = consent, operation = ++generation.current;
    const valid = () => { if (!mounted.current || generation.current !== operation || latest.current !== captured) throw Error('The review changed or closed. Check it again before continuing. Your saved attempt is kept.'); };
    try { await action(valid); }
    catch (reason) { if (mounted.current) { setError((reason as Error).message); setSignin(reason instanceof PurchaseRequestError && reason.status === 401); if (reason instanceof PurchaseRequestError && [401, 503].includes(reason.status)) setCapabilities(null); if (reason instanceof PurchaseRequestError && reason.status === 401) { setAttempt(null); setPurchase(null); } } }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  async function checkAvailability(valid: () => void) {
    const cap = await fetchDeliveryCapabilities(); valid();
    if (capabilities) {
      try { assertReviewedPurchaseTerms(capabilities, cap, frozen); }
      catch { setTerms(false); setChallenge(''); setReset(value => value + 1); }
    }
    if (attempt?.ownerId !== cap.ownerId || (attempt && attempt.delivery.mode !== cap.mode)) { setAttempt(null); setPurchase(null); setTerms(false); setChallenge(''); }
    setCapabilities(cap); setMessage(cap.available ? 'Signed-in account confirmed. Review the edition and save this frozen page before checkout.' : cap.reason);
    const saved = loadPurchaseAttempt(cap, frozen);
    if (saved) {
      const delivery = await fetchAcceptedDelivery(saved.delivery.id, cap, frozen); valid();
      remember({ ...saved, delivery });
    }
    if (returned?.state === 'cancelled') { setMessage('Checkout was cancelled. Your frozen page and existing attempt are kept. Check its status or retry the same attempt.'); clearPurchaseReturn(); }
  }
  async function accept(valid: () => void) {
    const cap = await fetchDeliveryCapabilities(); valid(); assertPurchaseCapability(cap, frozen);
    if (!approved || (!current && !useOlder)) throw Error('Review this frozen revision before saving it to your account.');
    if (capabilities && (capabilities.ownerId !== cap.ownerId || capabilities.mode !== cap.mode)) { setCapabilities(null); setAttempt(null); setPurchase(null); throw Error('The signed-in account changed. Check availability again.'); }
    const accepted = await acceptFrozenDelivery(cap, frozen, 'review-' + frozen.snapshot.snapshotHash); valid();
    const previous = loadPurchaseAttempt(cap, frozen);
    remember({ ownerId: cap.ownerId, snapshotHash: frozen.snapshot.snapshotHash, delivery: accepted, receipt: previous?.receipt || newPurchaseReceipt() });
    setCapabilities(cap); setMessage(`Reviewed page saved · revision ${accepted.revision}. No purchase has been made.`);
  }
  async function checkout(valid: () => void) {
    if (!attempt || !ready || !terms) throw Error('Save the reviewed page and accept the terms before checkout.');
    const cap = await fetchDeliveryCapabilities(); valid(); assertPurchaseCapability(cap, frozen);
    if (cap.ownerId !== attempt.ownerId || cap.mode !== attempt.delivery.mode) { setCapabilities(null); setAttempt(null); setPurchase(null); throw Error('The signed-in account changed. Check availability again.'); }
    try { assertReviewedPurchaseTerms(capabilities!, cap, frozen); }
    catch (reason) { setCapabilities(cap); setTerms(false); setChallenge(''); setReset(value => value + 1); throw reason; }
    saveCheckoutReturn(attempt.receipt);
    let url: string;
    try { url = await startFrozenCheckout(cap, frozen, attempt.delivery, attempt.receipt, terms, cap.localTest ? 'local-test' : challenge, fetch, reviewedPrice); }
    finally { if (mounted.current) { setChallenge(''); setReset(value => value + 1); } }
    valid();
    setMessage(`Opening ${cap.mode === 'test' ? 'TEST ' : ''}checkout. Your local review and this attempt are saved.`);
    window.location.assign(url);
  }
  async function inspectReturn(valid: () => void) {
    if (!returned?.receipt) return;
    setPurchase(null);
    const result = await inspectOwnedPurchase(returned.receipt, frozen); valid();
    if (capabilities && capabilities.ownerId !== result.attempt.ownerId) setCapabilities(null);
    remember(result.attempt); setPurchase(result.purchase); clearPurchaseReturn(); setMessage('Purchase checked against the exact reviewed page. A redirect alone never confirms payment.');
  }
  async function refresh(valid: () => void) {
    if (!attempt) return;
    setPurchase(null);
    const result = await fetchDeliveryPurchase(attempt.receipt, { ownerId: attempt.ownerId }, frozen, attempt.delivery); valid();
    setPurchase(result); setTerms(false); setChallenge(''); setReset(count => count + 1); setMessage('Purchase status checked with the server.');
  }
  async function getArtifact(artifact: 'original' | 'approved-page', valid: () => void) {
    if (!attempt) return;
    setPurchase(null);
    const result = await downloadDeliveryArtifact(artifact, attempt.receipt, { ownerId: attempt.ownerId }, frozen, attempt.delivery); valid();
    setPurchase(result.purchase); download(result.bytes, result.name, 'application/zip'); setMessage(artifact === 'original' ? 'Original versioned template verified and downloaded.' : 'Approved page package verified and downloaded. Its editable source is included.');
  }
  return <section className="pg-finish-purchase pg-purchase-flow" aria-label="Account purchase">
    {!capabilities?.available && <button disabled>Purchase unavailable</button>}
    <small>Local downloads remain available. Account purchase is separate and requires confirmed availability.</small>
    {returned?.receipt && <button disabled={busy} onClick={() => void run(inspectReturn)}>Check returned purchase</button>}
    <button className="pg-button-secondary" disabled={busy} onClick={() => void run(checkAvailability)}>{busy ? 'Checking…' : capabilities ? 'Refresh account availability' : 'Check account purchase availability'}</button>
    {capabilities && <><p className="pg-purchase-owner">Signed in · {testMode ? 'TEST only' : 'LIVE purchase'}</p>
      {product ? <div className="pg-purchase-product"><h4>Original template</h4><p>{product.productId} · {product.editionId} · version {product.version}</p><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency.toUpperCase() }).format((reviewedPrice ?? product.priceCents) / 100)} · one-time {testMode ? 'TEST ' : ''}purchase</strong><small>{purchase?.priceCents ? 'Original attempt price supplied by the server. Catalog changes do not change this attempt.' : 'Price supplied by the server.'} The original licensed archive is separate from your approved page. Hosting, domains, and ongoing services are not included.</small><a href={`/templates/guides/${frozen.snapshot.parent!.family}/developer/`} target="_blank" rel="noreferrer">Edition guide</a> · <a href="/shop/template-terms" target="_blank" rel="noreferrer">License and support terms</a></div> : <p>Price and original edition unavailable for this review. Choose a matching parent edition above, then prepare a new review.</p>}
      <div className="pg-purchase-product"><h4>Approved page attachment</h4><p>{frozen.snapshot.project.name} · revision {frozen.snapshot.revision}<br />Standalone developer HTML/CSS/JavaScript · one page</p><small>Includes the editable project and local images. No WordPress or website-builder import, hosting, domains, booking, or form delivery.</small></div>
      <p className="pg-purchase-limits">Server limits: {(capabilities.limits.snapshotBytes / 1_000_000).toLocaleString()} MB source · {(capabilities.limits.archiveBytes / 1_000_000).toLocaleString()} MB package. AI allowance: unavailable.</p>
      {!current && <label className="pg-finish-approval"><input type="checkbox" checked={useOlder} onChange={event => setUseOlder(event.target.checked)} /><span>Use reviewed revision {frozen.snapshot.revision} even though my editable draft is separate or newer.</span></label>}
      {!attempt && <button className="pg-button-secondary" disabled={busy || !ready} onClick={() => void run(accept)}>Save reviewed page to my account</button>}
      {attempt && !paid && <><label className="pg-finish-approval"><input type="checkbox" checked={terms} onChange={event => setTerms(event.target.checked)} /><span>I have read the <a href="/shop/template-terms" target="_blank" rel="noreferrer">edition terms</a> and understand that the original template and approved page are separate files.</span></label>{open && ready && terms && !capabilities.localTest && <Turnstile action="checkout" onToken={setChallenge} resetKey={reset} />}<button className="pg-primary" disabled={busy || !ready || !terms || (!capabilities.localTest && !challenge) || !!terminal || purchase?.approvedPage.state === 'revoked'} onClick={() => void run(checkout)}>{purchase ? `Retry this ${testMode ? 'TEST ' : ''}checkout` : `Continue to ${testMode ? 'TEST ' : ''}checkout`}</button></>}
    </>}
    {attempt && <><p className="pg-purchase-accepted">Reviewed page saved · revision {attempt.delivery.revision}</p><details><summary>Reviewed page identity</summary><code>{attempt.delivery.snapshotHash}</code></details><button className="pg-button-secondary" disabled={busy} onClick={() => void run(refresh)}>Check purchase status</button>{terminal && <button disabled={busy} onClick={() => void run(async () => { remember({ ...attempt, receipt: newPurchaseReceipt() }); setPurchase(null); setTerms(false); setMessage('New attempt created for the same reviewed page. No checkout request has been sent.'); })}>Start a new checkout attempt</button>}</>}
    {purchase && <div role="status" className="pg-purchase-status"><h4>{paid ? 'Payment verified for this approved page' : purchase.approvedPage.state === 'revoked' ? 'Purchased access revoked' : 'Purchase is not ready'}</h4><p>{paid ? 'The server confirms the original edition and the exact approved page. Keep both backups.' : `Payment: ${purchase.paymentState || purchase.status}. Approved page: ${purchase.approvedPage.state}. A return from checkout does not grant access.`}</p><small>Order reference: {purchase.orderId}</small>{paid && <><button disabled={busy} onClick={() => void run(valid => getArtifact('original', valid))}>Download original template</button><button disabled={busy} onClick={() => void run(valid => getArtifact('approved-page', valid))}>Download approved page</button></>}{purchase.mailStatus && <small>Email status: {purchase.mailStatus}. This screen does not establish inbox arrival.</small>}</div>}
    {message && <p role="status">{message}</p>}{error && <p role="alert" className="pg-finish-error">{error}</p>}{signin && <p><a href="/account" target="_blank" rel="noreferrer">Sign in to your Eidos account</a>, then check again.</p>}
  </section>;
}
