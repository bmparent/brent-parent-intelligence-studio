import { useRef, useState, type CSSProperties } from "react";
import { storefrontThemes, type StorefrontTheme } from "../data/storefrontDemo";
import "../styles/storefront-demo.css";

export function StorefrontPreview({ slug }: { slug: StorefrontTheme }) {
  const theme = storefrontThemes[slug];
  return (
    <div
      className="sd-preview"
      aria-label={`${theme.title} composed storefront preview`}
    >
      <img
        className="sd-preview-bg"
        src={theme.background}
        alt=""
        loading="lazy"
      />
      <img className="sd-preview-left" src={theme.left} alt="" loading="lazy" />
      <img
        className="sd-preview-right"
        src={theme.right}
        alt=""
        loading="lazy"
      />
      <div className="sd-preview-title">
        <img src={theme.logo} alt={theme.title} loading="lazy" />
        <span>Explore the interactive storefront →</span>
      </div>
    </div>
  );
}

type View = "Home" | "All products" | "Product" | "Bag";
export default function StorefrontDemo({ slug }: { slug: StorefrontTheme }) {
  const theme = storefrontThemes[slug];
  const [view, setView] = useState<View>("Home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [detail, setDetail] = useState(false);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [bag, setBag] = useState<
    { name: string; size: string; quantity: number }[]
  >([]);
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const product = theme.products[selected];
  const categories = ["All", ...new Set(theme.products.map((p) => p.category))];
  const filtered = theme.products
    .map((p, index) => ({ ...p, index }))
    .filter(
      (p) =>
        (category === "All" || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase()),
    );
  function navigate(next: View) {
    setView(next);
    setMessage("");
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      root.current?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }
  function openProduct(index: number) {
    setSelected(index);
    setSize("");
    setQuantity(1);
    setDetail(false);
    navigate("Product");
  }
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <section
      ref={root}
      className={`sd-demo ${slug === "holidays-in-hollywood" ? "sd-holiday" : ""} ${paused ? "sd-paused" : ""}`}
      aria-label={`${theme.title} interactive demo`}
    >
      <div className="sd-notice">
        <span>Interactive design demo · No orders or payments</span>
        <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? "Resume motion" : "Pause motion"}
        </button>
      </div>
      <nav className="sd-nav" aria-label="Demo storefront">
        <button className="sd-brand" onClick={() => navigate("Home")}>
          {theme.title}
        </button>
        <div>
          {(["Home", "All products", "Product", "Bag"] as const).map(
            (label) => (
              <button
                key={label}
                onClick={() => navigate(label)}
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
          <div
            className="sd-hero"
            onPointerMove={(event) => {
              if (
                paused ||
                window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                event.pointerType === "touch"
              )
                return;
              const box = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty(
                "--glow-x",
                `${((event.clientX - box.left) / box.width) * 100}%`,
              );
            }}
          >
            <img className="sd-backdrop" src={theme.background} alt="" />
            <div className="sd-atmosphere" aria-hidden="true">
              <i className="sd-beam" />
              <i className="sd-beam sd-beam-two" />
              {Array.from({ length: 26 }, (_, i) => (
                <i
                  key={i}
                  className="sd-star"
                  style={
                    {
                      "--x": `${(i * 37 + 9) % 100}%`,
                      "--y": `${(i * 19 + 7) % 72}%`,
                      "--delay": `${-i * 0.37}s`,
                    } as CSSProperties
                  }
                />
              ))}
              {slug === "nighttime-spectaculars" && (
                <>
                  <i className="sd-firework" />
                  <i className="sd-firework sd-firework-two" />
                </>
              )}
            </div>
            <img
              className="sd-cast sd-cast-left"
              src={theme.left}
              alt="Collection apparel, left model"
            />
            <img
              className="sd-cast sd-cast-right"
              src={theme.right}
              alt="Collection apparel, right model"
            />
            <div className="sd-hero-copy">
              <img src={theme.logo} alt={theme.title} />
              <p>{theme.intro}</p>
              <button
                className="sd-primary"
                onClick={() => navigate("All products")}
              >
                Explore the collection ↗
              </button>
            </div>
            <div className="sd-wave" aria-hidden="true" />
          </div>
          <div className="sd-collection">
            <p className="sd-kicker">Made for the moment</p>
            <h3>{theme.short}</h3>
            <div className="sd-categories">
              {categories.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setSearch("");
                    navigate("All products");
                  }}
                >
                  {cat} <span>↗</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {view === "All products" && (
        <div className="sd-collection">
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
          </div>
          <p role="status">
            {filtered.length} {filtered.length === 1 ? "item" : "items"} ·
            Sample collection
          </p>
          <div className="sd-grid">
            {filtered.map((p) => (
              <button
                key={p.name}
                className="sd-card"
                onClick={() => openProduct(p.index)}
              >
                <div>
                  <img
                    src={p.image}
                    alt={`${p.name} collection mockup`}
                    loading="lazy"
                  />
                </div>
                <span>{p.category}</span>
                <h3>
                  {p.name} <span>↗</span>
                </h3>
                <p>Explore options</p>
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
        <div className="sd-product">
          <div className={`sd-product-image ${detail ? "sd-detail" : ""}`}>
            <img
              src={product.image}
              alt={`${product.name} ${detail ? "detail" : "full"} mockup`}
            />
            <button onClick={() => setDetail(!detail)} aria-pressed={detail}>
              {detail ? "Show full view" : "Inspect detail"}
            </button>
          </div>
          <div className="sd-options">
            <p className="sd-kicker">
              {theme.title} / {product.category}
            </p>
            <h3>{product.name}</h3>
            <p>
              A closer look at the collection. Choose an example size and
              quantity to try the ordering interaction.
            </p>
            <p className="sd-sample">
              Illustrative options · Not a live product listing
            </p>
            <fieldset>
              <legend>Size</legend>
              {["S", "M", "L", "XL", "2XL"].map((s) => (
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
            <button
              className="sd-primary"
              onClick={() => {
                if (!size) {
                  setMessage("Choose a size before adding to the demo bag.");
                  return;
                }
                setBag((items) => {
                  const existing = items.find(
                    (item) => item.name === product.name && item.size === size,
                  );
                  return existing
                    ? items.map((item) =>
                        item === existing
                          ? { ...item, quantity: item.quantity + quantity }
                          : item,
                      )
                    : [...items, { name: product.name, size, quantity }];
                });
                setMessage(
                  `${quantity} × ${product.name}, size ${size}, added to the demo bag.`,
                );
              }}
            >
              Add to demo bag
            </button>
            <button className="sd-secondary" onClick={() => navigate("Bag")}>
              View demo bag ({count})
            </button>
            <details>
              <summary>About this preview</summary>
              <p>
                Saved project artwork is used to demonstrate browsing,
                filtering, product inspection, and option selection. Sizes are
                examples. This demo does not connect to inventory, customer
                accounts, or checkout.
              </p>
            </details>
          </div>
        </div>
      )}
      {view === "Bag" && (
        <div className="sd-collection">
          <p>Your selections stay in this preview and clear when you reload.</p>
          {bag.length ? (
            <>
              {bag.map((item, index) => (
                <div className="sd-bag-row" key={`${item.name}-${item.size}`}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      Size {item.size} · Quantity {item.quantity}
                    </p>
                  </div>
                  <button
                    aria-label={`Remove ${item.name} size ${item.size}`}
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
            <h3>Your demo bag is empty.</h3>
          )}
          <button
            className="sd-primary"
            onClick={() => navigate("All products")}
          >
            Continue exploring
          </button>
        </div>
      )}
      <p className="sd-status" role="status">
        {message}
      </p>
      <footer className="sd-footer">
        Portfolio reconstruction by Eidos Works · Original storefront work
        within Data Graphics’ client-services workflow.
      </footer>
    </section>
  );
}
