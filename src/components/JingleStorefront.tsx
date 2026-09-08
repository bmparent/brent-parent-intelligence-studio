import { useRef, useState } from 'react';
import {
  jingleAssets as art,
  jingleProducts as products,
  type JingleProduct,
} from '../data/jingle';
import { JingleMotion } from './JingleMotion';
import '../styles/jingle-original.css';
import '../styles/jingle-demo.css';

const categories = ['All styles', 'Fleece', 'Soft shell', 'Waterproof'];
const globePath =
  'M 57 117 C 27 97 25 57 51 32 C 90 -6 190 -6 229 32 C 255 57 253 97 223 117 L 233 133 Q 235 140 226 140 L 54 140 Q 45 140 47 133 Z';
type BagItem = {
  product: JingleProduct;
  size: string;
  quantity: number;
  personalization: string;
  id: string;
};
function Globe({
  images,
  paused,
  label = '',
}: {
  images: string[];
  paused: boolean;
  label?: string;
}) {
  return (
    <span className="jbjb-globe-card__stage">
      <span
        className={`jbjb-globe-card__photos jbjb-globe-card__photos--${images.length}`}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? label : ''}
            width="500"
            height="500"
            loading="lazy"
          />
        ))}
      </span>
      <span className="jbjb-globe-card__snow">
        <JingleMotion paused={paused} />
      </span>
      <img
        className="jbjb-globe-card__shell"
        src={art.globe}
        alt=""
        width="1254"
        height="1254"
        loading="lazy"
      />
    </span>
  );
}
export function JingleStorefront() {
  const [page, setPage] = useState<'home' | 'catalog' | 'product' | 'bag'>(
    'home',
  );
  const [category, setCategory] = useState('All styles'),
    [query, setQuery] = useState(''),
    [sort, setSort] = useState('original');
  const [selected, setSelected] = useState(products[0]),
    [side, setSide] = useState<'back' | 'front'>('back');
  const [size, setSize] = useState(''),
    [quantity, setQuantity] = useState(1),
    [personalization, setPersonalization] = useState('');
  const [paused, setPaused] = useState(false),
    [bag, setBag] = useState<BagItem[]>([]),
    [message, setMessage] = useState('');
  const root = useRef<HTMLElement>(null);
  const nextItem = useRef(0);
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = (next: typeof page) => {
    setPage(next);
    setMessage('');
    requestAnimationFrame(() => {
      root.current?.scrollIntoView({ block: 'start' });
      root.current?.focus({ preventScroll: true });
    });
  };
  const catalog = (filter = 'All styles') => {
    setCategory(filter);
    setQuery('');
    navigate('catalog');
  };
  const detail = (p: JingleProduct) => {
    setSelected(p);
    setSize('');
    setQuantity(1);
    setPersonalization('');
    setSide('back');
    navigate('product');
  };
  const visible = products
    .filter(
      (p) =>
        (category === 'All styles' || p.category === category) &&
        `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'price'
        ? a.price - b.price
        : sort === 'name'
          ? a.name.localeCompare(b.name)
          : 0,
    );
  const motionButton = (
    <button
      type="button"
      className="jbjb-motion-toggle"
      aria-pressed={paused}
      onClick={() => setPaused(!paused)}
    >
      {paused ? 'Play motion' : 'Pause motion'}
    </button>
  );
  return (
    <section
      ref={root}
      tabIndex={-1}
      className="jbjb-demo"
      aria-label="Jingle Bell, Jingle BAM storefront reconstruction"
      data-motion={paused ? 'paused' : 'playing'}
    >
      <div className="jbjb-demo-notice">
        Storefront recreation · Sample prices captured September 8, 2026 · Demo
        cart only
      </div>
      <div id="jbjb-home">
        <nav className="jbjb-demo-nav" aria-label="Jingle BAM demo navigation">
          <button
            type="button"
            className="jbjb-demo-brand"
            onClick={() => navigate('home')}
            aria-label="Jingle BAM demo home"
          >
            <span className="jbjb-logo-crop">
              <img src={art.logo} alt="Jingle Bell, Jingle BAM!" />
            </span>
          </button>
          <div>
            <button type="button" onClick={() => catalog()}>
              All Products
            </button>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  'This is a storefront recreation. Shopping accounts and checkout belong to the original private store.',
                )
              }
            >
              Sign In
            </button>
            <button
              type="button"
              aria-label={`Demo cart, ${count} items`}
              onClick={() => navigate('bag')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M2 3h3l3 13h11l3-10H6M10 21h.01M18 21h.01" />
              </svg>{' '}
              {count}
            </button>
          </div>
        </nav>
        {message && (
          <p className="jbjb-demo-message" role="status">
            {message}
            {page === 'product' && (
              <button type="button" onClick={() => navigate('bag')}>
                View demo cart →
              </button>
            )}
          </p>
        )}
        {page === 'home' && (
          <>
            <section
              className="jbjb-hero"
              aria-label="Jingle Bell, Jingle BAM apparel collection"
            >
              <div className="jbjb-hero__scene" aria-hidden="true">
                <div className="jbjb-hero__lasers" />
                <div className="jbjb-hero__snow">
                  <JingleMotion paused={paused} fireworks />
                </div>
                <img
                  className="jbjb-hero__elves"
                  src={art.elves}
                  alt=""
                  width="990"
                  height="1094"
                />
              </div>
              <div className="jbjb-hero__content">
                <div className="jbjb-hero__glass">
                  <p className="jbjb-eyebrow">
                    Holiday operations · North Pole Mission Control
                  </p>
                  <h2 className="jbjb-hero__title">
                    <span className="jbjb-sr-only">
                      Jingle Bell, Jingle BAM!
                    </span>
                    <span className="jbjb-logo-crop" aria-hidden="true">
                      <img src={art.logo} alt="" width="683" height="550" />
                    </span>
                  </h2>
                  <p className="jbjb-hero__copy">
                    <span className="jbjb-hero__tagline">
                      <span className="jbjb-hero__snow-script">
                        Cue the snow.
                      </span>
                      <span className="jbjb-hero__bring">Bring the</span>
                      <span className="jbjb-hero__bam-globe">
                        <span
                          className="jbjb-hero__neon-mount"
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 280 150">
                            {['halo', 'tube', 'light'].map((c) => (
                              <path
                                key={c}
                                d={globePath}
                                pathLength="100"
                                className={`jbjb-neon-${c}`}
                              />
                            ))}
                          </svg>
                        </span>
                        <strong className="jbjb-hero__bam">BAM!</strong>
                      </span>
                    </span>
                    <span className="jbjb-hero__subcopy">
                      Cozy layers. Bright nights. A little holiday magic.
                    </span>
                  </p>
                  <div className="jbjb-hero__actions">
                    <button className="jbjb-button" onClick={() => catalog()}>
                      Shop the collection
                    </button>
                    {motionButton}
                  </div>
                  <span className="jbjb-demo-reflection" aria-hidden="true" />
                </div>
              </div>
              <div className="jbjb-hero__mission-strip" aria-hidden="true">
                <span />
                <strong>North Pole Mission Control</strong>
                <span />
              </div>
            </section>
            <section
              className="jbjb-collection"
              aria-labelledby="jingle-collection-title"
            >
              <div className="jbjb-shell">
                <header className="jbjb-section-heading">
                  <h2 id="jingle-collection-title">The Collection</h2>
                </header>
                <div className="jbjb-globe-grid">
                  {[
                    {
                      title: 'Concert Fleece',
                      kicker: 'Comfort layer',
                      code: 'DT800',
                      note: 'Cotton-blend warmth · Full zip',
                      filter: 'Fleece',
                      images: [products[0].back],
                    },
                    {
                      title: 'Active Soft Shell',
                      kicker: 'Active coverage',
                      code: 'J717 · L717',
                      note: 'Wind resistance · Room to move',
                      filter: 'Soft shell',
                      images: [products[1].back, products[3].back],
                    },
                    {
                      title: 'Torrent Waterproof',
                      kicker: 'Wet-weather ready',
                      code: 'J333 · L333',
                      note: 'Rain coverage · Removable hood',
                      filter: 'Waterproof',
                      images: [products[2].back, products[4].back],
                    },
                    {
                      title: 'All Products',
                      kicker: 'The complete collection',
                      code: 'Five show-night styles',
                      note: '',
                      filter: 'All styles',
                      images: [
                        products[0].back,
                        products[1].back,
                        products[4].back,
                      ],
                    },
                  ].map((c) => (
                    <button
                      className="jbjb-globe-card"
                      key={c.title}
                      onClick={() => catalog(c.filter)}
                      aria-label={`Shop ${c.title}`}
                    >
                      <Globe images={c.images} paused={paused} />
                      <span className="jbjb-globe-card__meta">
                        <span className="jbjb-globe-card__kicker">
                          {c.kicker}
                        </span>
                        <strong>{c.title}</strong>
                        <span>{c.code}</span>
                        {c.note && <span>{c.note}</span>}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="jbjb-collection__note">
                  Fleece for warmth. Soft shells for movement. Waterproof
                  jackets for rainy calls. Find your show-night layer.
                </p>
              </div>
            </section>
            <section className="jbjb-closing">
              <div className="jbjb-shell jbjb-closing__inner">
                <div>
                  <p className="jbjb-eyebrow">Ready for the next call?</p>
                  <h2>Find your show-night layer.</h2>
                </div>
                <button className="jbjb-button" onClick={() => catalog()}>
                  Shop all five styles
                </button>
              </div>
            </section>
          </>
        )}
        {page === 'catalog' && (
          <div className="jbjb-demo-archive">
            <header className="jbjb-demo-catalog-intro">
              <p className="jbjb-eyebrow">North Pole issue archive</p>
              <h2>{category === 'All styles' ? 'All Products' : category}</h2>
              <p>
                Five black show-night layers. Choose a style to explore the
                collection.
              </p>
              <div
                className="jbjb-demo-filters"
                role="group"
                aria-label="Shop by layer"
              >
                {categories.map((c) => (
                  <button
                    key={c}
                    aria-pressed={c === category}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </header>
            <div className="jbjb-demo-catalog">
              <div className="jbjb-demo-tools">
                <label>
                  <span className="jbjb-sr-only">Search all products</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search all products"
                  />
                </label>
                <label>
                  Sort by{' '}
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="original">Featured</option>
                    <option value="name">Name</option>
                    <option value="price">Price: low to high</option>
                  </select>
                </label>
              </div>
              <p>{visible.length} of 5 results</p>
              <div className="jbjb-demo-products">
                {visible.map((p) => (
                  <article className="jbjb-demo-card" key={p.sku}>
                    <button
                      className="jbjb-demo-product-image"
                      onClick={() => detail(p)}
                      aria-label={`View ${p.short}`}
                    >
                      <Globe
                        images={[p.back]}
                        paused={paused}
                        label={`${p.short}, decorated back`}
                      />
                    </button>
                    <div className="jbjb-demo-card-meta">
                      <span className="jbjb-demo-swatch" aria-label="Black" />
                      <h3>{p.name}</h3>
                      <p>{p.sku}JBJJ</p>
                      <strong>${p.price.toFixed(2)}</strong>
                      <p>{p.fit}</p>
                      <button className="jbjb-button" onClick={() => detail(p)}>
                        View details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!visible.length && (
                <p role="status">
                  No styles match. Try a product name or style number.
                </p>
              )}
            </div>
          </div>
        )}
        {page === 'product' && (
          <div className="jbjb-demo-archive">
            <button
              className="jbjb-demo-back"
              onClick={() => catalog(selected.category)}
            >
              ← Back to {selected.category.toLowerCase()}
            </button>
            <div className="jbjb-demo-detail">
              <div className="jbjb-demo-detail-art">
                <Globe
                  images={[
                    side === 'front' && selected.front
                      ? selected.front
                      : selected.back,
                  ]}
                  paused={paused}
                  label={`${selected.short}, ${side}`}
                />
                <div
                  className="jbjb-demo-views"
                  role="group"
                  aria-label="Product view"
                >
                  {(['back', 'front'] as const)
                    .filter((s) => s === 'back' || selected.front)
                    .map((s) => (
                      <button
                        key={s}
                        aria-pressed={side === s}
                        onClick={() => setSide(s)}
                      >
                        <img
                          src={s === 'back' ? selected.back : selected.front}
                          alt=""
                        />
                        {s}
                      </button>
                    ))}
                </div>
                <p className="jbjb-demo-image-status" role="status">
                  {side === 'back' ? 'Back view' : 'Front view'} {motionButton}
                </p>
              </div>
              <div className="jbjb-demo-product-info">
                <h2>{selected.name}</h2>
                <p>{selected.sku}JBJJ</p>
                <p className="jbjb-demo-price">
                  ${selected.price.toFixed(2)} / each
                </p>
                <span>{selected.fit}</span>
                <p>{selected.description}</p>
                <ul className="jbjb-demo-features">
                  {selected.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      !size ||
                      !Number.isInteger(quantity) ||
                      quantity < 1 ||
                      quantity > 25
                    )
                      return;
                    const id = String(++nextItem.current);
                    setBag((b) => [
                      ...b,
                      {
                        product: selected,
                        quantity,
                        size,
                        personalization: personalization.trim(),
                        id,
                      },
                    ]);
                    setMessage(
                      `${quantity} × ${selected.short} added to your demo cart.`,
                    );
                  }}
                >
                  <label>
                    Color
                    <select aria-label="Product color">
                      <option>Black</option>
                    </select>
                  </label>
                  <label>
                    Size
                    <select
                      required
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    >
                      <option value="">Choose a size</option>
                      {['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Personalization <span>Add $12.00</span>
                    <input
                      maxLength={50}
                      value={personalization}
                      onChange={(e) => setPersonalization(e.target.value)}
                      placeholder="e.g. Alex · Stage Management"
                    />
                  </label>
                  <p>
                    Optional. Check spelling, capitalization, and punctuation.
                  </p>
                  <small>{personalization.length} / 50 characters</small>
                  <label>
                    Quantity
                    <input
                      type="number"
                      min="1"
                      max="25"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </label>
                  <button className="jbjb-button" type="submit">
                    Add to demo cart
                  </button>
                  <p className="jbjb-demo-final-sale">
                    All sales are final — no returns or exchanges.
                  </p>
                  <small>
                    Recreation only. These options do not represent live
                    inventory.
                  </small>
                </form>
              </div>
            </div>
            <section className="jbjb-demo-related">
              <h2>You may also like</h2>
              <div>
                {products
                  .filter((p) => p.sku !== selected.sku)
                  .map((p) => (
                    <button key={p.sku} onClick={() => detail(p)}>
                      <Globe images={[p.back]} paused={paused} />
                      <strong>{p.short}</strong>
                      <span>{p.sku}</span>
                    </button>
                  ))}
              </div>
            </section>
          </div>
        )}
        {page === 'bag' && (
          <section className="jbjb-demo-bag">
            <h2>Your demo cart</h2>
            <p>
              Try the shopping flow. No order is placed and nothing is charged.
            </p>
            {bag.length ? (
              <>
                {bag.map((item) => (
                  <article key={item.id}>
                    <img src={item.product.back} alt="" />
                    <div>
                      <h3>{item.product.short}</h3>
                      <p>
                        {item.size} · Quantity {item.quantity}
                      </p>
                      {item.personalization && <p>{item.personalization}</p>}
                      <strong>
                        $
                        {(
                          (item.product.price +
                            (item.personalization ? 12 : 0)) *
                          item.quantity
                        ).toFixed(2)}
                      </strong>
                    </div>
                    <button
                      onClick={() =>
                        setBag((b) => b.filter((i) => i.id !== item.id))
                      }
                      aria-label={`Remove ${item.product.short}`}
                    >
                      Remove
                    </button>
                  </article>
                ))}
                <h3>
                  Demo total: $
                  {bag
                    .reduce(
                      (n, i) =>
                        n +
                        (i.product.price + (i.personalization ? 12 : 0)) *
                          i.quantity,
                      0,
                    )
                    .toFixed(2)}
                </h3>
              </>
            ) : (
              <p>Your cart is empty. Choose a show-night layer to try it.</p>
            )}
            <button className="jbjb-button" onClick={() => catalog()}>
              Continue shopping
            </button>
          </section>
        )}
        <footer className="jbjb-demo-footer">
          <div>
            <h3>Navigation</h3>
            <button onClick={() => navigate('home')}>Home</button>
            <button onClick={() => catalog()}>Product Catalog</button>
            <button onClick={() => catalog('Soft shell')}>
              Active Soft Shell · J717 / L717
            </button>
            <button onClick={() => catalog('Waterproof')}>
              Torrent Waterproof · J333 / L333
            </button>
            <button onClick={() => catalog('Fleece')}>
              Concert Fleece · DT800
            </button>
          </div>
          <div>
            <h3>A little help before the big night.</h3>
            <p>
              This public portfolio recreation lets you explore the original
              design. Purchases, store accounts, and customer support remain
              with the original private store.
            </p>
          </div>
          <p>Jingle Bell, Jingle BAM! · Design recreation by Eidos Works</p>
        </footer>
      </div>
    </section>
  );
}
