import { useEffect, useRef, useState } from 'react';
import { post } from '../lib/platform';
import { Turnstile } from './Turnstile';
import { SafeEmailLink } from './EmailAddress';
import { editionName, money, pageNames, templateProduct, templateProducts, templateStyles, type TemplateProduct, type TemplateEdition } from '../data/templateCatalog';
import packageContents from '../data/templatePackageContents.json';

function wordpressCompatibility(edition: TemplateEdition) {
  const evidence = packageContents.find(item => item.editionId === edition.id && item.version === (edition.version || '1.0.0'))?.wordpressEvidence;
  const runtime = evidence?.wordpress && evidence?.php ? `WordPress ${evidence.wordpress} / PHP ${evidence.php}` : 'recorded WordPress/PHP runtime';
  if (evidence?.exactCurrentZipActivation && evidence.nativeApiGate) return `Exact current ZIP installed using native PHP APIs on ${runtime} / ${evidence.database}. Independent clean-site API editing, export, and process-restart persistence passed. Fresh visual admin installation/editor workflows, managed hosting, and WordPress.com upload plans require separate verification. Public sales remain unavailable.`;
  return evidence?.exactCurrentZipActivation
    ? `Exact current ZIP activation observed on ${runtime}. ${evidence.scope} Other hosting environments and WordPress.com upload plans require separate verification; public sales remain unavailable.`
    : `Current version ${edition.version || '1.0.0'} native installation acceptance is pending. Historical browser-sandbox evidence used ${runtime}; it does not establish this ZIP's installation. Conventional hosting, declared minimum versions, and WordPress.com upload plans remain separately unverified.`;
}

export function TemplatePackageContents({ edition }: { edition: TemplateEdition }) {
  const contents = packageContents.find(item => item.editionId === edition.id && item.version === (edition.version || '1.0.0'));
  if (!contents) return null;
  return <div className="et-package-contents"><p><a href={contents.guidePath}>Read this edition’s installation guide →</a></p><p>Package version {contents.version}. Original included art: {contents.originalArt.join(' · ')}. System fonts; no font files or stock photography are bundled.</p><details><summary>Included files ({contents.files.length})</summary><ul className="et-package-files">{contents.files.map(file => <li key={file}><code>{file}</code></li>)}</ul></details></div>;
}

type ShopCatalog = { mode: string; ready: boolean; editions: { id: string; available: boolean; priceCents: number; version: string }[] };
function useTemplateShop() {
  const [shop, setShop] = useState<ShopCatalog | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/shop/catalog', { signal: abort.signal }).then(async (r) => {
      if (!r.ok) return;
      const data = await r.json();
      if (!abort.signal.aborted && data.mode === 'test' && Array.isArray(data.editions)) setShop(data);
    }).catch(() => { /* Purchasing stays unavailable when readiness cannot be verified. */ });
    return () => abort.abort();
  }, []);
  return shop;
}
function Preview({ product, mobile = false }: { product: TemplateProduct; mobile?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const fit = () => { const iframe = element.querySelector('iframe'); if (iframe) iframe.style.transform = `scale(${element.clientWidth / (mobile ? 390 : 1440)})`; };
    const observer = new ResizeObserver(fit); observer.observe(element); fit();
    return () => observer.disconnect();
  }, [mobile]);
  return <div ref={frame} className={`et-preview et-preview--${product.slug}${mobile ? ' et-preview--phone' : ''}`}>
    <iframe title={`${product.name} ${mobile ? 'phone' : 'desktop'} preview`} src={`/template-demos/${product.slug}/index.html`} loading="lazy" tabIndex={-1} sandbox="allow-scripts" />
  </div>;
}
export function TemplateCollection() {
  const [platform, setPlatform] = useState('all'), [market, setMarket] = useState('all'), [style, setStyle] = useState('all'), [type, setType] = useState('all');
  const shown = templateProducts.filter((p) =>
    (market === 'all' || templateStyles[p.slug].market === market) &&
    (style === 'all' || templateStyles[p.slug].style === style) &&
    p.editions.some((e) => (e.sourcePath || e.pilotPath) &&
      (platform === 'all' || e.platform === platform) &&
      (type === 'all' || e.kind === type)));
  return <div className="et-shop">
    <section className="ew-shell et-intro"><h1>Distinctive websites.<br /><em>Make one your own.</em></h1><p>Choose a design for your business, select your platform, replace the sample content, and launch.</p><div className="ew-actions"><a className="ew-button ew-button--primary" href="#designs">Explore the designs</a><a className="ew-text-link" href="/shop/choose">Which version do I need?</a></div><p className="et-candidate">Preview collection · proposed prices · TEST purchases only when enabled</p></section>
    <section className="ew-shell" id="designs" aria-label="Template collection">
      <div className="et-filters">
        <label>Platform<select value={platform} onChange={(e) => setPlatform(e.target.value)}><option value="all">All platforms</option><option value="developer">Developer source</option><option value="wordpress">WordPress</option><option value="squarespace">Squarespace 7.1 pilot</option><option value="godaddy">GoDaddy builder pilot</option></select></label>
        <label>Your business<select value={market} onChange={(e) => setMarket(e.target.value)}><option value="all">All uses</option>{Object.values(templateStyles).map((s) => <option key={s.market}>{s.market}</option>)}</select></label>
        <label>Visual style<select value={style} onChange={(e) => setStyle(e.target.value)}><option value="all">All styles</option>{Object.values(templateStyles).map((s) => <option key={s.style}>{s.style}</option>)}</select></label>
        <label>Product type<select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option><option value="complete-site-source">Complete developer website</option><option value="native-block-theme">Native block theme</option><option value="existing-site-kit">Section kit for an existing site</option><option value="visual-add-on">Visual add-on</option></select></label>
      </div>
      <p className="et-result" aria-live="polite">{shown.length} {shown.length === 1 ? 'design' : 'designs'} · compatibility and availability shown before checkout</p>
      <div className="et-grid">{shown.map((p) => <article className="et-product" key={p.slug}><a className="et-preview-link" href={`/shop/${p.slug}`} aria-label={`Explore ${p.name}`}><Preview product={p} /></a><div className="et-product-heading"><h2><a href={`/shop/${p.slug}`}>{p.name}</a></h2><span>{templateStyles[p.slug].market}</span></div><p>{templateStyles[p.slug].line}</p><p className="et-meta">5 pages · {templateStyles[p.slug].style}</p><div className="ew-actions"><a className="ew-text-link" href={`/shop/${p.slug}`}>Contents & editions →</a><a className="ew-text-link" href={`/template-demos/${p.slug}/index.html`} target="_blank" rel="noopener noreferrer">Try the actual demo ↗</a></div></article>)}</div>
      {shown.length === 0 && <p>No designs match that combination. Choose another filter. Builder pilots remain unavailable until platform installation is verified.</p>}
    </section>
    <section className="ew-shell et-existing"><div><h2>A smaller beginning.</h2><p>Already have a site? Cinematic Starter is the original header and hero add-on, with its existing one-website license and terms.</p></div><a className="ew-button ew-button--secondary" href="/shop/cinematic-starter">Cinematic Starter · $29 →</a></section>
  </div>;
}
export function TemplateDetail({ slug }: { slug: string }) {
  const product = templateProduct(slug)!;
  const [selected, setSelected] = useState(product.editions[0].id), [terms, setTerms] = useState(false), [challenge, setChallenge] = useState(''), [reset, setReset] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const attempts = useRef<Record<string, string>>({});
  const shop = useTemplateShop();
  const edition = product.editions.find((e) => e.id === selected)!;
  const offered = shop?.editions.find((e) => e.id === selected);
  const ready = shop?.mode === 'test' && shop.ready && offered?.available === true && offered.priceCents === edition.draftPriceCents && offered.version === (edition.version || '1.0.0');
  async function checkout() {
    if (!ready) return;
    setBusy(true); setError('');
    try {
      const result = await post<{ url: string }>('/api/shop/checkout', { productId: edition.id, editionId: edition.platform, acceptTerms: terms, challenge, attempt: attempts.current[edition.id] ??= Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('') });
      const url = new URL(result.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw Error('The secure checkout link could not be verified.');
      window.location.assign(url.href);
    } catch (e) { setError(e instanceof Error ? e.message : 'Checkout could not open.'); setBusy(false); setChallenge(''); setReset((n) => n + 1); }
  }
  return <div className="et-shop"><section className="ew-shell et-detail-intro"><a className="ew-text-link" href="/shop">← All designs</a><h1>{product.name}<br /><em>{templateStyles[slug].line}</em></h1><p>{product.summary}</p></section>
    <section className="ew-shell et-detail-layout"><div><Preview product={product} /><div className="et-demo-actions"><a className="ew-button ew-button--secondary" href={`/template-demos/${slug}/index.html`} target="_blank" rel="noopener noreferrer">Open working demo ↗</a><p>These previews load the same versioned source files included in the developer package. Their content is fictional demonstration content.</p></div><div className="et-phone-row"><Preview product={product} mobile /><div><h2>Designed for the task.</h2><p>{product.audience}</p><p>{product.signature}</p><p>Keyboard and ordinary links remain available. Reduced motion and no-JavaScript layouts keep the content accessible.</p></div></div></div>
      <aside className="et-purchase"><h2>Choose your edition.</h2><label className="ew-field">Platform & package<select value={selected} onChange={(e) => { setSelected(e.target.value); setError(''); }}>{product.editions.map((e) => <option key={e.id} value={e.id}>{editionName(e)}</option>)}</select></label><p className="et-price">{money(edition.draftPriceCents)} <span>USD · proposed one-time price</span></p><p>{edition.platform === 'developer' ? 'A complete five-page website in editable HTML, CSS, and JavaScript. Hosting and code editing are required.' : edition.platform === 'wordpress' ? 'A native block theme with editable content, patterns, templates, and styles in the WordPress Site Editor. Hosting is separate.' : 'A manually installed section kit. This is a visual add-on; it does not replace your native website.'}</p><dl><dt>Included scope</dt><dd>{edition.platform === 'developer' || edition.platform === 'wordpress' ? pageNames(product).join(' · ') : edition.pilotPath ? edition.platform === 'squarespace' ? 'Manual five-page native section recipe, styles, and optional service selector. No import or prepared starter site.' : 'One isolated service-selector HTML section. Your native site pages and services remain separate.' : 'This edition is not implemented and cannot be purchased.'}</dd><dt>Editability</dt><dd>{edition.platform === 'wordpress' ? 'Site Editor for text, images, navigation, and styles. This edition uses native Details alternatives to the developer effects.' : edition.platform === 'squarespace' ? 'Native recipe sections use the builder editor; optional styles, selector, and effects need source editing.' : edition.platform === 'godaddy' ? 'Embed copy, styles, and links need source editing. Surrounding native pages remain in the builder.' : 'Edit source copy and the documented configuration. Basic HTML/CSS knowledge is needed.'}</dd><dt>Installation</dt><dd>{edition.platform === 'wordpress' ? 'Upload ZIP → activate → follow demo setup. Check your host supports theme uploads.' : edition.platform === 'developer' ? 'Unzip → edit → publish on static hosting. No mandatory build pipeline.' : edition.platform === 'squarespace' ? 'Manual Squarespace 7.1 native section setup and supported custom styles. No ZIP import. Pilot installation remains unverified.' : 'Paste the section into GoDaddy Websites + Marketing HTML section. Native navigation and services remain separate. Pilot installation remains unverified.'}</dd><dt>Included files and artwork</dt><dd><TemplatePackageContents edition={edition} /></dd><dt>Compatibility gate</dt><dd>{edition.platform === 'developer' ? 'Portable source; browser and buyer-install receipts apply to the tested version. No CMS import.' : edition.platform === 'wordpress' ? wordpressCompatibility(edition) : edition.platform === 'squarespace' ? 'Version 7.1 only. Optional JavaScript, iframe, and injection require Core, Plus, Advanced, or an eligible legacy plan; Basic uses the static recipe. Authorized hosted installation is pending.' : 'Websites + Marketing HTML-section route only; actual provider iframe height, mobile, and native coexistence acceptance is pending.'}</dd><dt>Connections</dt><dd>Contact, booking, commerce, and ticket services require your own verified destination. Layouts and buttons do not include those services.</dd><dt>Support & updates</dt><dd>Draft terms: 30 days of installation help, defect fixes for this major version for 90 days. Customization and future major versions are separate.</dd><dt>Dependencies</dt><dd>No mandatory paid builder, Eidos hosting, premium fonts, or subscription. Platform hosting and plan fees remain yours.</dd><dt>Release status</dt><dd>{edition.status}. Public sales are unavailable in this candidate.</dd></dl><label className="ew-check-label"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /><span>I have read the <a href="/shop/template-terms">draft edition terms</a> and installation requirements.</span></label><Turnstile action="checkout" onToken={setChallenge} resetKey={reset} /><button className="ew-button ew-button--primary" type="button" disabled={!ready || !terms || busy || !challenge} onClick={() => void checkout()}>{busy ? 'Opening TEST checkout…' : ready ? `Try TEST checkout · ${money(edition.draftPriceCents)}` : 'Purchasing unavailable'}</button><p className="et-candidate">TEST candidate. No live payment is enabled for this collection.</p>{error && <p role="alert" className="ew-error">{error}</p>}<a className="ew-text-link" href="/shop/choose">Which version do I need? →</a></aside></section>
    <section className="ew-shell et-faq"><h2>Before you choose.</h2><details><summary>Does the preview personalize my download?</summary><p>No. Demo controls explore the included interaction. To personalize the website, follow the edition guide and edit its content and configuration. There is no unsaved customization promise.</p></details><details><summary>Can I install the developer ZIP in a website builder?</summary><p>It runs as a standalone website. Squarespace and GoDaddy Websites + Marketing need their specifically labeled kits and manual setup. GoDaddy-hosted WordPress can use the WordPress edition after its hosting requirements are verified.</p></details><details><summary>What rights come with it?</summary><p>Developer source has proposed commercial use for one website, with no template resale. WordPress theme code retains GPLv2-or-later rights. Dependency rights take precedence. See the included notices and <a href="/shop/template-terms">draft terms</a>.</p></details><details><summary>What if my download email never arrives?</summary><p>Use the <a href="/shop/start">purchase recovery page</a> with the checkout email. If you cannot access that inbox, contact billing with the payment reference; never send card details or passwords.</p></details></section>
  </div>;
}
export function TemplateChooser() {
  const [choice, setChoice] = useState('unsure');
  const answers: Record<string, string> = { unsure: 'Choose the platform you actually use. Each edition has a different installation route.', developer: 'Choose developer source if you can edit HTML/CSS and have static hosting. Five pages run without a build service.', wordpress: 'Choose a native WordPress block theme if your host allows theme uploads. Edit native blocks in the Site Editor; verify the tested version and plan first.', godaddy: 'GoDaddy-hosted WordPress and Websites + Marketing are different products. WordPress uses a theme ZIP; Websites + Marketing needs a manual HTML-section visual add-on. That pilot remains unavailable.', squarespace: 'Squarespace 7.1 needs a manual section kit or a prepared starter-site workflow. A ZIP cannot replace an existing site. The pilot remains unavailable until tested.' };
  return <section className="ew-shell ew-reading et-guide"><a href="/shop">← The collection</a><h1>Which version<br /><em>do you need?</em></h1><label className="ew-field">Where will your website live?<select value={choice} onChange={(e) => setChoice(e.target.value)}><option value="unsure">I’m deciding</option><option value="developer">Static hosting / developer workflow</option><option value="wordpress">Self-hosted WordPress / WordPress.com</option><option value="godaddy">GoDaddy</option><option value="squarespace">Squarespace 7.1</option></select></label><p className="ew-notice" aria-live="polite">{answers[choice]}</p><h2>The platform costs are separate.</h2><p>Hosting, platform subscriptions, domain registration, booking, ecommerce, email, and ticket services are not included. Builder plans can limit custom JavaScript. Static alternatives are documented in the pilot guides.</p><h2>Know what you are getting.</h2><ul><li>Complete developer websites: five linked pages with editable source.</li><li>WordPress themes: native blocks, styles, patterns, and templates.</li><li>Visual add-ons: a section or effect installed inside your existing builder.</li></ul><p><a href="/shop">Browse designs →</a> · <a href="/contact">Ask about your platform →</a></p></section>;
}
export function TemplateTerms() {
  return <section className="ew-shell ew-reading et-guide"><a href="/shop">← The collection</a><h1>Template terms.<br /><em>Draft for review.</em></h1><p>These proposed terms apply to the new collection candidate only. The existing <a href="/shop/cinematic-starter">$29 Cinematic Starter</a> and its <a href="/terms">approved terms</a> remain unchanged. No new live sales are enabled.</p><h2>Developer source and visual kits</h2><p>Proposed license: use and modify the original assets and source for one commercial website, including a client website. Keep an archive backup. Reselling, redistributing as a template, and using sample identities as your own endorsements are excluded.</p><h2>WordPress and dependency rights</h2><p>WordPress derivative theme code is GPLv2-or-later. Its license permits use, modification, and redistribution under its terms; no one-site limitation retracts GPL rights. Separate support and paid access terms do not replace dependency licenses. Included asset notices identify redistribution rights.</p><h2>Support and versions</h2><p>Proposed: 30 days of installation help from purchase and 90 days of defect corrections for the purchased major version. Custom design, third-party service setup, platform support, and future major versions are separate. No lifetime or unlimited commitment. Original purchased archives remain versioned and immutable.</p><h2>Refunds and access</h2><p>The existing approved <a href="/terms">refund policy</a> governs the candidate workflow; contact billing for missing files, duplicate charges, or defects. Refund/revocation prevents future retrieval. It cannot reclaim a previously downloaded file.</p><h2>Services and additional cost</h2><p>No recurring Eidos fee or mandatory Eidos hosting. Platform plans, domains, paid integrations, legal copy, real business imagery, and publication are your responsibility. Assisted setup has no published price until its labor is measured. A layout never asserts an integration is connected.</p><h2>Privacy</h2><p>Transactional order email is separate from marketing consent. Recovery links expire and must remain private. Do not send card data, passwords, or API keys to support.</p><SafeEmailLink address="billing@eidos-works.com">Contact billing</SafeEmailLink></section>;
}

type Purchase = { status: string; paymentState?: 'pending' | 'paid' | 'expired' | 'failed'; mailStatus?: 'pending' | 'failed' | 'sent'; orderId: string; productId?: string; editionId?: string; version?: string; downloadName?: string; guidePath?: string; downloadToken?: string; downloadExpires?: string };
export function TemplateStart() {
  const [receipt, setReceipt] = useState(''), [purchase, setPurchase] = useState<Purchase | null>(null), [email, setEmail] = useState(''), [challenge, setChallenge] = useState(''), [message, setMessage] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [reset, setReset] = useState(0);
  const redemption = useRef<Promise<{ receipt: string }> | null>(null);
  useEffect(() => {
    let active = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const fresh = fragment.get('receipt') || '';
    const token = fragment.get('token') || fragment.get('recovery') || '';
    window.history.replaceState(null, '', '/shop/start');
    let saved = '';
    try { saved = sessionStorage.getItem('eidos.template.receipt') || ''; } catch { /* optional storage */ }
    if (/^[a-f0-9]{64}$/.test(fresh)) saved = fresh;
    if (/^[a-f0-9]{64}$/.test(token) && !redemption.current) redemption.current = post<{ receipt: string }>('/api/shop/redeem', { token });
    const pending = redemption.current ??= Promise.resolve({ receipt: saved });
    pending.then((data) => {
      if (!active) return;
      if (/^[a-f0-9]{64}$/.test(data.receipt)) { setReceipt(data.receipt); try { sessionStorage.setItem('eidos.template.receipt', data.receipt); } catch { /* optional */ } }
    }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'That recovery link could not be used. Request a new one below.'); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!receipt) return;
    let active = true;
    post<Purchase>('/api/shop/status', { receipt }).then((p) => { if (active) setPurchase(p); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Purchase verification failed.'); });
    return () => { active = false; };
  }, [receipt]);
  async function refresh() {
    setBusy(true); setError('');
    try { setPurchase(await post<Purchase>('/api/shop/status', { receipt })); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); }
  }
  async function recover(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const result = await post<{ message: string }>('/api/shop/recover', { email, challenge }); setMessage(result.message || 'If an eligible order matches, a private recovery email will be sent. Check spam and your checkout inbox.'); } catch (e) { setError(e instanceof Error ? e.message : 'Recovery could not be requested.'); } finally { setBusy(false); setChallenge(''); setReset((n) => n + 1); }
  }
  async function download() {
    setBusy(true); setError('');
    try {
      const current = await post<Purchase>('/api/shop/status', { receipt }); setPurchase(current);
      if (current.status !== 'paid') throw Error('Payment must be verified before download.');
      const response = await fetch('/api/shop/download', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ receipt, downloadToken: current.downloadToken }), signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw Error((await response.json()).error || 'Download could not be prepared.');
      if (!response.headers.get('content-type')?.includes('application/zip')) throw Error('The archive response could not be verified.');
      const blob = await response.blob(), url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = current.downloadName?.replace(/[^a-zA-Z0-9._-]/g, '') || 'eidos-template.zip'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Download could not be prepared.'); } finally { setBusy(false); }
  }
  const product = purchase?.productId ? templateProducts.find((p) => purchase.productId === p.slug || p.editions.some((e) => e.id === purchase.productId)) : undefined;
  return <section className="ew-shell ew-reading et-guide"><a href="/shop">← The collection</a><h1>Your website.<br /><em>Start here.</em></h1><p>Get the right package, follow your edition’s guide, and keep a backup of the original archive. Purchase links are private.</p>
    {purchase && <div className="et-start-status" aria-live="polite"><h2>{purchase.status === 'paid' ? `${product?.name || 'Your template'} is ready.` : 'Purchase status'}</h2><p>{purchase.status === 'paid' ? `Payment verified · ${purchase.editionId || 'source'} · version ${purchase.version || '1'}` : purchase.paymentState === 'failed' ? 'Payment failed. No download was granted. Return to the product page to start a new TEST checkout.' : purchase.paymentState === 'expired' ? 'Checkout expired. No download was granted. Return to the product page to start a new TEST checkout.' : purchase.status === 'pending' ? 'Payment is still pending. A checkout redirect does not grant access. Check again after Stripe confirms payment.' : `Status: ${purchase.status}. Contact billing if you need help.`}</p><p>Order reference: {purchase.orderId}</p>{purchase.status === 'paid' && <button className="ew-button ew-button--primary" type="button" disabled={busy} onClick={() => void download()}>{busy ? 'Preparing…' : 'Download your versioned package'}</button>}{purchase.status === 'pending' && !['failed', 'expired'].includes(purchase.paymentState || '') && <button className="ew-button ew-button--secondary" type="button" disabled={busy} onClick={() => void refresh()}>Check payment again</button>}</div>}
    {purchase?.status === 'paid' && <><h2>Install in three stages.</h2>{purchase.guidePath && /^\/templates\/guides\/[a-z-]+\/(developer|wordpress)\/$/.test(purchase.guidePath) && <p><a href={purchase.guidePath}>Open your edition’s installation guide →</a></p>}<ol><li>Unzip and read INSTALL.md and the license notices. Keep the untouched ZIP.</li><li>{purchase.editionId === 'wordpress' ? 'Back up your WordPress site. Upload the theme ZIP, activate in a test site, and follow its demo-content setup. Edit text, images, and navigation in the Site Editor.' : 'Open index.html. Replace the sample business content, imagery, and configuration using the included guide. Test every page before hosting.'}</li><li>Connect your real contact, booking, or ticket destination; verify it on a phone. Publish only after you check the guide’s installation checklist.</li></ol><p>The package contains rollback/removal steps. Platform accounts, subscriptions, and third-party services are separate.</p></>}
    {purchase?.status === 'paid' && purchase.mailStatus === 'failed' && <p role="status">Your payment is verified, but the email receipt could not be delivered. Download your package here and contact billing if you need help.</p>}
    <h2>Email missing or link expired?</h2><p>Use the email entered at checkout. Recovery responds the same way whether an order exists. The private email link expires and can be used once.</p><form className="et-start-form" onSubmit={(e) => void recover(e)}><label className="ew-field">Checkout email<input type="email" autoComplete="email" value={email} maxLength={254} required onChange={(e) => setEmail(e.target.value)} /></label><Turnstile action="recovery" onToken={setChallenge} resetKey={reset} /><button className="ew-button ew-button--secondary" type="submit" disabled={busy || !challenge}>Send a private recovery link</button></form>{message && <p role="status">{message}</p>}{error && <p className="ew-error" role="alert">{error}</p>}<p>Still need help? <SafeEmailLink address="billing@eidos-works.com">Contact billing</SafeEmailLink> with your payment reference. Never send card details or passwords.</p><p><a href="/account">Your existing Eidos account →</a> · <a href="/shop/choose">Platform guide →</a></p></section>;
}
