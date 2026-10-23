import { useEffect, useRef, useState, type FormEvent } from 'react';
import { candlelightAssets, candlelightFits, candlelightPrice, candlelightSizes, type CandlelightFit } from '../data/candlelight';
import '../styles/candlelight-exclusive.css';

type View = 'home' | 'collection' | 'bag' | CandlelightFit;
type BagItem = { id: number; fit: CandlelightFit; size: string; quantity: number; personalization: string };
const money = (value: number) => `$${value.toFixed(2)}`;
const Arrow = () => <span className="clex-arrow" aria-hidden="true" />;

function Jacket({ fit = 'men', back = false, eager = false }: { fit?: CandlelightFit; back?: boolean; eager?: boolean }) {
  return <img src={`${candlelightAssets}/${fit}-${back ? 'back' : 'front'}.webp`} width="1024" height="1536" loading={eager ? 'eager' : 'lazy'} alt={`${candlelightFits[fit].label} black tricot track jacket, ${back ? 'undecorated back' : 'Candlelight show artwork on the wearer’s right chest'}`} />;
}

function ProductDetail({ fit, onAdd }: { fit: CandlelightFit; onAdd: (item: Omit<BagItem, 'id'>) => void }) {
  const product = candlelightFits[fit];
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [back, setBack] = useState(false);
  const [personalized, setPersonalized] = useState(false);
  const [personalization, setPersonalization] = useState('');
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    onAdd({ fit, size, quantity, personalization: personalized ? personalization.trim() : '' });
  }
  return <div className="clex-detail-grid">
    <div><div className="clex-product-image"><Jacket fit={fit} back={back} eager /></div><div className="clex-view-picker" role="group" aria-label="Jacket view"><button type="button" aria-pressed={!back} onClick={() => setBack(false)}>Front</button><button type="button" aria-pressed={back} onClick={() => setBack(true)}>Back</button></div></div>
    <div><p className="clex-eyebrow">{product.sku} · BLACK / BLACK</p><h3>{product.label} Tricot Track Jacket</h3><p className="clex-detail-price">{money(candlelightPrice(size) + (personalized ? 12 : 0))} <small>example unit price</small></p><p>{product.description} Right-chest show artwork is included; the back is undecorated.</p>
      <form onSubmit={add} className="clex-form">
        <div className="clex-field"><label htmlFor="clex-size">Size</label><select id="clex-size" value={size} onChange={event => setSize(event.target.value)}>{candlelightSizes.map(option => <option key={option}>{option}</option>)}</select></div>
        <div className="clex-field"><label htmlFor="clex-quantity">Quantity</label><input id="clex-quantity" type="number" min="1" max="99" step="1" required value={quantity || ''} onChange={event => setQuantity(event.currentTarget.valueAsNumber)} /></div>
        <label className="clex-check"><input type="checkbox" checked={personalized} onChange={event => setPersonalized(event.target.checked)} /> Add left-chest personalization (+$12 per jacket)</label>
        {personalized && <div className="clex-field"><label htmlFor="clex-personalization">Name, title, or position</label><input id="clex-personalization" aria-describedby="clex-personalization-note" type="text" required pattern=".*\S.*" maxLength={40} value={personalization} onChange={event => setPersonalization(event.target.value)} /><small id="clex-personalization-note">Try sample text. Your selection stays in this page until you leave or reload.</small></div>}
        <p>Example line total <strong>{money((candlelightPrice(size) + (personalized ? 12 : 0)) * (Number.isFinite(quantity) ? quantity : 0))}</strong></p>
        <button className="clex-button" type="submit">Add to demo bag <Arrow /></button>
      </form>
      <details className="clex-size-guide"><summary>View {product.label.toLowerCase()} size guide</summary><img src={`${candlelightAssets}/${fit}-size-guide.webp`} width="1600" height="1030" alt={`${product.label} ${product.sku} size guide, with body and flat garment measurements`} loading="lazy" /><a href={`${candlelightAssets}/${fit}-size-guide.webp`} target="_blank" rel="noopener noreferrer">Open the size guide at full size ↗</a></details>
    </div>
  </div>;
}

export function CandlelightShowcase() {
  const [view, setView] = useState<View>('home');
  const [bag, setBag] = useState<BagItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const nextId = useRef(1);
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  const count = bag.reduce((total, item) => total + item.quantity, 0);
  const total = bag.reduce((sum, item) => sum + (candlelightPrice(item.size) + (item.personalization ? 12 : 0)) * item.quantity, 0);

  function navigate(next: View) {
    navigated.current = true;
    setView(next);
    if (next === view) heading.current?.focus();
  }

  useEffect(() => {
    if (navigated.current) heading.current?.focus();
    const element = root.current;
    const feature = element?.querySelector('.clex-feature');
    if (!element || !feature) return;
    let inView = false;
    const update = () => { element.dataset.lightingVisible = String(inView && !document.hidden); };
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; update(); });
    observer.observe(feature);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); delete element.dataset.lightingVisible; };
  }, [view]);

  function productCards() {
    return <div className="clex-products">{(Object.keys(candlelightFits) as CandlelightFit[]).map(fit => {
      const product = candlelightFits[fit];
      return <article className="clex-product" key={fit}><button className="clex-product-image" type="button" onClick={() => navigate(fit)} aria-label={`Explore ${product.label.toLowerCase()} jacket`}><Jacket fit={fit} /></button><div className="clex-product-meta"><span>{product.label.toUpperCase()} FIT · {product.sku}</span><span>FROM $87</span></div><h3><button type="button" onClick={() => navigate(fit)}>{product.label} Tricot Track Jacket</button></h3><p>{product.description}</p><button className="clex-text-link" type="button" onClick={() => navigate(fit)}>Shop {product.label.toLowerCase()} <Arrow /></button></article>;
    })}</div>;
  }

  return <>
    <section className="ew-page-intro ew-shell clex-case-intro"><a className="ew-text-link" href="/work">← Selected work</a><p className="ew-eyebrow">Storefront design / InkSoft</p><h1>Candlelight Exclusive</h1><p>A concert-program approach to apparel: warm ivory, deep ink, and just enough light to make the jacket feel special.</p></section>
    <div className="clex-demo-shell">
      <div className="clex-demo-notice"><p><strong>Interactive portfolio reconstruction.</strong> Explore the complete design and a temporary demo bag. Sample prices reflect the saved design; this preview does not accept orders.</p><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Resume lighting' : 'Pause lighting'}</button></div>
      <div id="clex-demo" ref={root} data-lighting-paused={paused}>
        <nav className="clex-nav" aria-label="Candlelight demo"><div><button type="button" onClick={() => navigate('home')} aria-current={view === 'home' ? 'page' : undefined}>Home</button><button type="button" onClick={() => navigate('collection')} aria-current={view === 'collection' ? 'page' : undefined}>Collection</button></div><button className="clex-nav-logo" type="button" onClick={() => navigate('home')} aria-label="Candlelight demo home"><img src={`${candlelightAssets}/emblem.webp`} width="93" height="93" alt="Candlelight Processional emblem" /></button><button type="button" className="clex-bag-link" onClick={() => navigate('bag')} aria-current={view === 'bag' ? 'page' : undefined}>Demo bag ({count})</button></nav>
        {view === 'home' ? <>
          <section className="clex-hero" aria-labelledby="clex-title"><div className="clex-mast"><span>EPCOT · CANDLELIGHT PROCESSIONAL</span><span>THE EXCLUSIVE COLLECTION</span></div><div className="clex-hero-grid"><div className="clex-intro"><p className="clex-eyebrow">FOR THE PEOPLE BEHIND THE PERFORMANCE</p><h2 ref={heading} tabIndex={-1} id="clex-title" className="clex-title">A tradition.<br />A team.<br /><em>A keepsake.</em></h2><p className="clex-lede">The Candlelight jacket, made for the moments beyond the stage.</p><button className="clex-button" type="button" onClick={() => navigate('collection')}>Explore the collection <Arrow /></button><p className="clex-small">Two fits. One shared tradition.</p></div><figure className="clex-feature"><Jacket eager /><figcaption><span>THE TRICOT TRACK JACKET</span><span>SPORT-TEK · BLACK / BLACK</span></figcaption></figure></div><div className="clex-line"><span>RIGHT-CHEST SHOW LOGO INCLUDED</span><span>XS–3XL</span><span>OPTIONAL PERSONALIZATION</span></div></section>
          <section className="clex-collection" aria-labelledby="clex-collection-title"><div className="clex-section-head"><div><p className="clex-eyebrow">THE EXCLUSIVE COLLECTION</p><h2 id="clex-collection-title">Choose your fit.</h2></div><p>The same Candlelight detail.<br />A silhouette that feels like you.</p></div>{productCards()}</section>
          <section className="clex-details" aria-labelledby="clex-details-title"><div><p className="clex-eyebrow">THE FINISHING TOUCH</p><h2 id="clex-details-title">Make it<br /><em>your own.</em></h2><p>Add your name, title, or position to the wearer’s left chest for an additional $12. The Candlelight show logo on the right chest is included.</p></div><div className="clex-order-info"><div><span>THE JACKET</span><strong>Sport-Tek Tricot Track Jacket</strong><p>100% polyester tricot with soft-brushed backing, raglan sleeves, side zippered pockets, and an adjustable open hem.</p></div><div><span>SIZE &amp; PRICING</span><dl><dt>XS–XL</dt><dd>$87</dd><dt>2XL</dt><dd>$89</dd><dt>3XL</dt><dd>$90</dd><dt>Optional left-chest personalization</dt><dd>+$12</dd></dl><p>Check the size guide on each product before ordering.</p></div></div></section>
          <section className="clex-finale" aria-label="Explore the Candlelight collection"><p className="clex-eyebrow">CANDLELIGHT PROCESSIONAL · EPCOT</p><h2>Carry the tradition<br /><em>with you.</em></h2><button className="clex-button clex-button-light" type="button" onClick={() => navigate('collection')}>Shop the collection <Arrow /></button></section>
        </> : <section className="clex-shop-panel"><p className="clex-eyebrow">THE EXCLUSIVE COLLECTION</p><h2 ref={heading} tabIndex={-1}>{view === 'collection' ? 'Choose your fit.' : view === 'bag' ? 'Your demo bag.' : `${candlelightFits[view].label} Tricot Track Jacket`}</h2><button className="clex-text-link clex-return" type="button" onClick={() => navigate(view === 'collection' ? 'home' : 'collection')}>← {view === 'collection' ? 'Back to the entrance' : 'Back to the collection'}</button>
          {view === 'collection' ? <><p className="clex-shop-lede">Two fits. Black / Black. The same Candlelight detail.</p>{productCards()}</> : view === 'bag' ? <>
            <p className="clex-shop-lede">These selections are temporary examples. No account, order, payment, or fulfillment is created.</p>
            {bag.length ? <><ul className="clex-bag-items">{bag.map(item => <li key={item.id}><Jacket fit={item.fit} /><div><h3>{candlelightFits[item.fit].label} Tricot Track Jacket</h3><p>Size {item.size} · Quantity {item.quantity}</p><p>{item.personalization ? `Left chest: ${item.personalization}` : 'Show artwork only'}</p><strong>{money((candlelightPrice(item.size) + (item.personalization ? 12 : 0)) * item.quantity)}</strong><button className="clex-text-link" type="button" onClick={() => { setBag(items => items.filter(entry => entry.id !== item.id)); setAnnouncement('Item removed from the demo bag.'); }} aria-label={`Remove ${candlelightFits[item.fit].label.toLowerCase()} ${item.size} jacket`}>Remove item</button></div></li>)}</ul><p className="clex-bag-total">Example total <strong>{money(total)}</strong></p><p>Taxes and delivery are outside this demonstration.</p></> : <p className="clex-empty">Your demo bag is empty. Choose a jacket to try the selection flow.</p>}
          </> : <ProductDetail key={view} fit={view} onAdd={item => { const entry = { ...item, id: nextId.current++ }; setBag(items => [...items, entry]); setAnnouncement('Jacket added to the demo bag.'); navigate('bag'); }} />}
        </section>}
        <p className="clex-demo-footer">Candlelight Exclusive · Design demonstration · No checkout</p><span className="ew-sr-only" role="status">{announcement}</span>
      </div>
    </div>
    <section className="ew-showcase-story ew-shell"><div><p className="ew-eyebrow">Behind the design</p><h2>A quieter kind of atmosphere.</h2><p>The original page treats the collection like a concert program: flat ivory surfaces, fine rules, generous space, and deep ink typography. Warm amber light gives the jacket a focal point without filling the page with effects.</p><h3>From the original build</h3><p>This reconstruction follows the finished October 22 homepage, its apparel artwork, two fits, finishing details, and closing invitation. The saved static glow is retained; a low-contrast flicker adds the requested living light. Pause lighting keeps the warmth, and reduced-motion preferences stop the animation automatically.</p><h3>A complete browsing journey</h3><p>The React reconstruction carries the palette into collection browsing, front-and-back garment views, the saved fit guides, example personalization, and a temporary bag. The original InkSoft platform supplies the operational catalog and checkout.</p><a className="ew-text-link" href="/contact?service=digital-experiences">Plan a storefront like this →</a></div><aside><p className="ew-eyebrow">Role and scope</p><p>Storefront design and implementation within Data Graphics’ client-services workflow. Brand identities and artwork belong to their respective owners. No direct Disney engagement or endorsement is claimed.</p><p>This public reconstruction contains no customer records or private-store access. No conversion or revenue uplift is claimed.</p></aside></section>
  </>;
}
