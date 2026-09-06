import { useEffect, useRef, useState } from 'react';
import sites from '../data/siteGallery.json';
import '../styles/site-gallery.css';

const categories = ['All', 'Games', 'Tools', 'Experiments', 'Storefronts'];
type Site = (typeof sites)[number];

function Thumbnail({ site }: { site: Site }) {
  return <>
    <span className="ew-site-browser" aria-hidden="true"><i /><i /><i /></span>
    <img className={site.previewLabel ? 'ew-site-reference-image' : undefined} src={site.thumbnail} alt={`${site.title} homepage preview`} width="640" height="480" loading="lazy" />
    <span className="ew-site-view" aria-hidden="true">{site.url ? 'Open app ↗' : 'View preview ↗'}</span>
  </>;
}

export function SiteGallery({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Site | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const visible = compact
    ? sites.slice(0, 6)
    : sites.filter((site) =>
        (category === 'All' || site.category === category) &&
        `${site.title} ${site.description}`.toLowerCase().includes(query.trim().toLowerCase()),
      );

  useEffect(() => {
    if (selected && dialog.current && !dialog.current.open) {
      dialog.current.showModal();
    }
  }, [selected]);

  function reset() {
    setCategory('All');
    setQuery('');
  }

  return (
    <section id="site-gallery" className="ew-site-gallery ew-shell" aria-labelledby="site-gallery-title">
      <div className="ew-section-heading">
        <div>
          <p className="ew-eyebrow">From the studio</p>
          <h2 id="site-gallery-title">Small windows. Big possibilities.</h2>
          <p className="ew-gallery-intro">Games, tools, storefronts, and experiments. A growing gallery of the sites we’ve made.</p>
        </div>
        {compact && <a className="ew-text-link" href="/work#site-gallery">View all {sites.length} sites →</a>}
      </div>
      {!compact && (
        <div className="ew-gallery-controls">
          <div className="ew-gallery-filters" role="group" aria-label="Filter site gallery">
            {categories.map((label) => <button type="button" key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}
          </div>
          <label className="ew-gallery-search">Search sites<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a site…" /></label>
        </div>
      )}
      {!compact && <p className="ew-gallery-count" role="status">{visible.length} {visible.length === 1 ? 'site' : 'sites'}</p>}
      <div className="ew-site-grid">
        {visible.map((site) => (
          <article className="ew-site-card" key={site.slug}>
            {site.url ? <a className="ew-site-window" href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${site.title} (new tab)`}><Thumbnail site={site} /></a>
              : <button className="ew-site-window ew-site-reference" type="button" aria-label={`View image: ${site.title}`} aria-haspopup="dialog" onClick={() => setSelected(site)}><Thumbnail site={site} /></button>}
            <span className="ew-site-category">{site.category}</span>
            <h3 className="ew-site-title">{site.title}</h3>
            <div className="ew-site-actions">
              {site.url && <a href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Open app: ${site.title} (new tab)`}>Open app ↗</a>}
              <button className="ew-site-preview" type="button" aria-label={`Preview ${site.title}`} aria-haspopup="dialog" onClick={() => setSelected(site)}>Preview</button>
            </div>
          </article>
        ))}
      </div>
      {visible.length === 0 && <div className="ew-gallery-empty"><p>No sites match your search.</p><button type="button" onClick={reset}>Show all sites</button></div>}
      <dialog ref={dialog} className="ew-site-dialog" aria-labelledby="site-preview-title" onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        {selected && <div className="ew-site-dialog-content">
          <div className="ew-site-dialog-heading"><p className="ew-eyebrow">{selected.category} / Site preview</p><button type="button" aria-label="Close site preview" onClick={() => dialog.current?.close()}>Close ×</button></div>
          <img className="ew-site-full-image" src={selected.image} alt={`${selected.title} homepage`} width="1440" height="1100" />
          <div className="ew-site-dialog-copy"><h3 id="site-preview-title">{selected.title}</h3><p>{selected.description}</p>
            {selected.url ? <a className="ew-text-link" href={selected.url} target="_blank" rel="noopener noreferrer">Open app ↗</a> : <span className="ew-site-private">{selected.previewLabel || 'Saved design reference'}</span>}
          </div>
        </div>}
      </dialog>
    </section>
  );
}
