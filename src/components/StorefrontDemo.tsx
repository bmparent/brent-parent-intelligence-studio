import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  storefrontThemes,
  type DemoTheme,
  type StorefrontTheme,
} from "../data/storefrontDemo";
import { StorefrontFireworks } from "./StorefrontFireworks";
import "../styles/storefront-demo.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function particleStyle(index: number, count: number) {
  return {
    "--x": `${(index * 37 + 9) % 100}%`,
    "--y": `${(index * 23 + 11) % 78}%`,
    "--delay": `${-index * 0.67}s`,
    "--duration": `${7 + (index % 5) * 1.4}s`,
    "--size": `${2 + (index % 4)}px`,
    "--drift": `${12 + ((index * 11) % 30)}px`,
    "--turn": `${((index * 47) % 90) - 45}deg`,
    "--index": `${index / count}`,
  } as CSSProperties;
}

function ThemeAtmosphere({
  style,
  compact = false,
}: {
  style: DemoTheme["style"];
  compact?: boolean;
}) {
  const count = compact ? 14 : 26;

  return (
    <div className="sd-atmosphere" aria-hidden="true">
      {(style === "night" || style === "holiday") && (
        <>
          <i className="sd-beam" />
          <i className="sd-beam sd-beam-two" />
        </>
      )}
      {style === "night" && (
        <div className="sd-night-stars">
          {Array.from({ length: count }, (_, index) => (
            <i
              key={index}
              className="sd-night-star"
              style={particleStyle(index, count)}
            />
          ))}
        </div>
      )}
      {style === "holiday" && (
        <div className="sd-marquee-glints">
          {Array.from({ length: compact ? 10 : 18 }, (_, index) => (
            <i
              key={index}
              className="sd-marquee-glint"
              style={particleStyle(index, count)}
            />
          ))}
        </div>
      )}
      {style === "villains" && (
        <div className="sd-mirror-motes">
          {Array.from({ length: count }, (_, index) => (
            <i
              key={index}
              className="sd-mirror-mote"
              style={particleStyle(index, count)}
            />
          ))}
        </div>
      )}
      {style === "anniversary" && (
        <div className="sd-rose-glitter">
          {Array.from({ length: count + 6 }, (_, index) => (
            <i
              key={index}
              className="sd-rose-spark"
              style={particleStyle(index, count + 6)}
            />
          ))}
        </div>
      )}
      {style === "jingle" && (
        <div className="sd-hero-snow">
          {Array.from({ length: count + 8 }, (_, index) => (
            <i
              key={index}
              className="sd-snowflake"
              style={particleStyle(index, count + 8)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GlobeSnow() {
  return (
    <span className="sd-globe-snow" aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => (
        <i key={index} style={particleStyle(index, 16)} />
      ))}
    </span>
  );
}

export function StorefrontPreview({ slug }: { slug: StorefrontTheme }) {
  const theme = storefrontThemes[slug];
  return (
    <div
      className={`sd-preview sd-${theme.style}`}
      aria-label={`${theme.title} composed storefront preview`}
    >
      <img
        className="sd-preview-bg"
        src={theme.background}
        alt=""
        loading="lazy"
      />
      {theme.left && (
        <img
          className="sd-preview-left"
          src={theme.left}
          alt=""
          loading="lazy"
        />
      )}
      {theme.right && (
        <img
          className="sd-preview-right"
          src={theme.right}
          alt=""
          loading="lazy"
        />
      )}
      <ThemeAtmosphere style={theme.style} compact />
      <div className="sd-preview-title">
        <small>{theme.eyebrow}</small>
        {theme.logo ? (
          <img src={theme.logo} alt={theme.title} loading="lazy" />
        ) : (
          <strong>{theme.title}</strong>
        )}
        <span>Explore the interactive storefront →</span>
      </div>
    </div>
  );
}

type View = "Home" | "All products" | "Product" | "Bag";
type BagItem = { index: number; size: string; quantity: number };
export default function StorefrontDemo({ slug }: { slug: StorefrontTheme }) {
  const theme = storefrontThemes[slug];
  const [view, setView] = useState<View>("Home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [side, setSide] = useState<"front" | "back">("front");
  const [zoom, setZoom] = useState(false);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [bag, setBag] = useState<BagItem[]>([]);
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const sizes = useRef<HTMLFieldSetElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const navigationFrame = useRef(0);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
  const product = theme.products[selected];
  const currentImage =
    side === "back" && product.back ? product.back : product.image;
  const categories = ["All", ...new Set(theme.products.map((p) => p.category))];
  const filtered = theme.products
    .map((p, index) => ({ ...p, index }))
    .filter(
      (p) =>
        (category === "All" || p.category === category) &&
        `${p.name} ${p.category}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    );
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let visible = false;
    const sync = () => {
      el.dataset.visible = String(visible && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      cancelAnimationFrame(navigationFrame.current);
    };
  }, []);
  useEffect(() => {
    if (zoom && !dialog.current?.open) dialog.current?.showModal();
  }, [zoom]);

  function navigate(next: View) {
    setView(next);
    setMessage("");
    cancelAnimationFrame(navigationFrame.current);
    navigationFrame.current = requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      root.current?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }
  function collection(cat = "All") {
    setCategory(cat);
    setSearch("");
    navigate("All products");
  }
  function openProduct(index: number) {
    setSelected(index);
    setSize("");
    setQuantity(1);
    setSide("front");
    setZoom(false);
    navigate("Product");
  }
  function addToBag() {
    if (!size) {
      setMessage("Choose an example size before adding to the demo bag.");
      sizes.current?.focus({ preventScroll: true });
      return;
    }
    setBag((items) => {
      const existing = items.find(
        (item) => item.index === selected && item.size === size,
      );
      return existing
        ? items.map((item) =>
            item === existing
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...items, { index: selected, size, quantity }];
    });
    setMessage(
      `${quantity} × ${product.name}, ${size}, added to the demo bag.`,
    );
  }
  return (
    <section
      ref={root}
      className={`sd-demo sd-${theme.style} ${paused || reduced ? "sd-paused" : ""}`}
      style={{ "--sd-scene": `url("${theme.background}")` } as CSSProperties}
      aria-label={`${theme.title} interactive demo`}
    >
      <div className="sd-notice">
        <span>
          <strong>Storefront recreation.</strong> The original store is private
          and password-protected. Explore this public demo of its design and
          browsing experience. Products and options are illustrative; no orders
          or payments are accepted.
        </span>
        {reduced ? (
          <span>Reduced motion on</span>
        ) : (
          <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        )}
      </div>
      <nav className="sd-nav" aria-label="Demo storefront">
        <button className="sd-brand" onClick={() => navigate("Home")}>
          {theme.title}
          <small>CAST & CREW COLLECTION</small>
        </button>
        <div>
          {(["Home", "All products", "Product", "Bag"] as const).map(
            (label) => (
              <button
                key={label}
                onClick={() =>
                  label === "All products" ? collection() : navigate(label)
                }
                aria-current={view === label ? "page" : undefined}
              >
                {label === "Bag" ? `Bag (${count})` : label}
              </button>
            ),
          )}
        </div>
      </nav>
      <h2 ref={heading} tabIndex={-1} className="sd-view-title">
        {view === "Home"
          ? "The collection"
          : view === "Product"
            ? product.name
            : view === "Bag"
              ? "Your demo bag"
              : "All products"}
      </h2>
      {view === "Home" && (
        <>
          <div className="sd-hero">
            <img className="sd-backdrop" src={theme.background} alt="" />
            <ThemeAtmosphere style={theme.style} />
            {theme.style === "night" && <StorefrontFireworks paused={paused} />}
            {theme.left && (
              <img
                className="sd-cast sd-cast-left"
                src={theme.left}
                alt="Collection apparel, left model"
              />
            )}
            {theme.right && (
              <img
                className="sd-cast sd-cast-right"
                src={theme.right}
                alt={
                  theme.style === "jingle"
                    ? "Wayne and Lanny holiday artwork"
                    : "Collection apparel, right model"
                }
              />
            )}
            <div className="sd-hero-copy">
              <p className="sd-kicker">{theme.eyebrow}</p>
              {theme.logo ? (
                <img src={theme.logo} alt={theme.title} />
              ) : (
                <h3>{theme.headline}</h3>
              )}
              <p>{theme.intro}</p>
              <button className="sd-primary" onClick={() => collection()}>
                Explore the collection ↗
              </button>
            </div>
            <div className="sd-wave" aria-hidden="true" />
          </div>
          <div className="sd-collection sd-home-collection">
            <div className="sd-section-heading">
              <div>
                <p className="sd-kicker">Made for the moment</p>
                <h3>{theme.short}</h3>
              </div>
              <p>{theme.story}</p>
            </div>
            <div className="sd-categories">
              {categories.slice(1).map((cat) => (
                <button key={cat} onClick={() => collection(cat)}>
                  <span className="sd-category-art">
                    <img
                      src={
                        theme.categoryImages?.[cat] ||
                        theme.products.find((p) => p.category === cat)!.image
                      }
                      alt=""
                      loading="lazy"
                    />
                    {theme.style === "jingle" && <GlobeSnow />}
                  </span>
                  <span className="sd-category-label">
                    {cat}
                    <span aria-hidden="true">↗</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {view === "All products" && (
        <div className="sd-collection">
          <div className="sd-section-heading">
            <div>
              <p className="sd-kicker">{theme.eyebrow}</p>
              <h3>{theme.short}</h3>
            </div>
            <p>{theme.story}</p>
          </div>
          <div className="sd-tools">
            <label>
              Find an item
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collection"
              />
            </label>
            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Reset filters
            </button>
          </div>
          <p className="sd-results" role="status">
            {filtered.length} {filtered.length === 1 ? "item" : "items"} ·
            Illustrative collection
          </p>
          <div className="sd-grid">
            {filtered.map((p) => (
              <button
                key={p.name}
                className="sd-card"
                onClick={() => openProduct(p.index)}
              >
                <div className="sd-item-art">
                  <img
                    src={p.image}
                    alt={`${p.name} collection mockup`}
                    loading="lazy"
                  />
                  {p.back && (
                    <span className="sd-image-note">Front + back views</span>
                  )}
                </div>
                <span>{p.category}</span>
                <h3>
                  {p.name}
                  <span aria-hidden="true">↗</span>
                </h3>
                <p>Take a closer look</p>
              </button>
            ))}
          </div>
          {!filtered.length && (
            <div className="sd-empty">
              <h3>No matching items</h3>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
      {view === "Product" && (
        <div className="sd-product-wrap">
          <button className="sd-back" onClick={() => navigate("All products")}>
            ← Back to collection
          </button>
          <div className="sd-product">
            <div className="sd-product-gallery">
              <div className="sd-product-image">
                <span className="sd-stage-name" aria-hidden="true">
                  {theme.title}
                </span>
                <img
                  src={currentImage}
                  alt={`${product.name}${product.back ? `, ${side}` : ""} mockup`}
                />
                <button onClick={() => setZoom(true)} aria-haspopup="dialog">
                  Inspect detail ＋
                </button>
              </div>
              {product.back && (
                <div
                  className="sd-image-switch"
                  role="group"
                  aria-label="Product image view"
                >
                  {(["front", "back"] as const).map((value) => (
                    <button
                      key={value}
                      aria-pressed={side === value}
                      onClick={() => setSide(value)}
                    >
                      <img
                        src={value === "back" ? product.back : product.image}
                        alt=""
                      />
                      <span>{value === "front" ? "Front" : "Back"}</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="sd-caption">
                {theme.style === "jingle"
                  ? "Blank apparel reference · Select a view to inspect the garment."
                  : `Saved collection artwork · ${
                      product.back
                        ? "Select a view to inspect the decoration."
                        : "Illustrative styling mockup."
                    }`}
              </p>
            </div>
            <div className="sd-options">
              <p className="sd-kicker">
                {theme.title} / {product.category}
              </p>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p className="sd-sample">
                Design preview · Example options, no live inventory
              </p>
              <fieldset ref={sizes} tabIndex={-1}>
                <legend>Example size{size && <span> / {size}</span>}</legend>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    aria-pressed={size === s}
                    onClick={() => {
                      setSize(s);
                      setMessage("");
                    }}
                  >
                    {s}
                  </button>
                ))}
              </fieldset>
              <label>
                Quantity
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button className="sd-primary" onClick={addToBag}>
                Add to demo bag <span aria-hidden="true">＋</span>
              </button>
              <p className="sd-status" role="status">
                {message}
              </p>
              <button className="sd-secondary" onClick={() => navigate("Bag")}>
                View demo bag ({count}) →
              </button>
              <details>
                <summary>The collection story</summary>
                <p>{theme.story}</p>
              </details>
              <details>
                <summary>About this preview</summary>
                <p>
                  Saved project artwork demonstrates browsing, product
                  inspection, and selection. Names and sizes are illustrative.
                  Selections stay here and clear on reload.
                </p>
              </details>
            </div>
          </div>
        </div>
      )}
      {view === "Bag" && (
        <div className="sd-collection sd-bag">
          <p className="sd-kicker">{theme.title}</p>
          <h3>A little of the show, selected.</h3>
          <p>Your selections stay in this preview and clear when you reload.</p>
          {bag.length ? (
            <>
              {bag.map((item, index) => (
                <div className="sd-bag-row" key={`${item.index}-${item.size}`}>
                  <button
                    className="sd-bag-art"
                    onClick={() => openProduct(item.index)}
                    aria-label={`Inspect ${theme.products[item.index].name}`}
                  >
                    <img src={theme.products[item.index].image} alt="" />
                  </button>
                  <div>
                    <h3>{theme.products[item.index].name}</h3>
                    <p>
                      {item.size} · Quantity {item.quantity}
                    </p>
                  </div>
                  <button
                    aria-label={`Remove ${theme.products[item.index].name} ${item.size}`}
                    onClick={() =>
                      setBag((items) => items.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <p className="sd-sample">
                You’ve reached the end of the demo. No order has been placed.
              </p>
            </>
          ) : (
            <div className="sd-empty">
              <h3>Your demo bag is empty.</h3>
              <p>Find a look you like and try the options.</p>
            </div>
          )}
          <button className="sd-primary" onClick={() => collection()}>
            Continue exploring ↗
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="sd-zoom"
        aria-label={`${product.name} artwork detail`}
        onClose={() => setZoom(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {zoom && (
          <>
            <div className="sd-zoom-toolbar">
              <span>{product.name} · Artwork detail</span>
              <button
                onClick={() => dialog.current?.close()}
                aria-label="Close artwork detail"
              >
                Close ×
              </button>
            </div>
            <div className="sd-zoom-scroll">
              <img
                src={currentImage}
                alt={`${product.name} enlarged ${side} artwork`}
              />
            </div>
          </>
        )}
      </dialog>
      <footer className="sd-footer">
        <span>{theme.title}</span>
        <p>
          Portfolio reconstruction by Eidos Works · Original storefront work
          within Data Graphics’ client-services workflow.
        </p>
      </footer>
    </section>
  );
}
