import { useEffect, useRef, useState } from 'react';
import sites from '../data/siteGallery.json';
import '../styles/site-gallery.css';

const categories = ['All', 'Concepts', 'Games', 'Tools', 'Experiments', 'Storefronts'];
type Site = (typeof sites)[number];

function destinationLabel(site: Site) {
  return site.fullPage && site.category === 'Storefronts' ? 'Open storefront' : 'Open app';
}

function Thumbnail({ site }: { site: Site }) {
  const height = site.fullPage && site.imageWidth && site.imageHeight
    ? Math.round(640 * site.imageHeight / site.imageWidth)
    : 480;
  return <>
    <span className="ew-site-browser" aria-hidden="true"><i /><i /><i /></span>
    <img className={site.fullPage ? 'ew-site-full-page-thumb' : site.previewLabel ? 'ew-site-reference-image' : undefined} src={site.thumbnail} alt={site.alt || `${site.title} homepage preview`} width="640" height={height} loading="lazy" />
    <span className="ew-site-view" aria-hidden="true">{site.fullPage ? 'Explore the full page ↗' : site.url ? 'Open app ↗' : 'View preview ↗'}</span>
  </>;
}

export function SiteGallery({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Site | null>(null);
  const selectedConcept = selected?.category === 'Concepts';
  const [actualSize, setActualSize] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const imageScroll = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const visible = compact
    ? sites.slice(0, 6)
    : sites.filter((site) =>
        (category === 'All' || site.category === category) &&
        `${site.title} ${site.description} ${site.sector || ''} ${site.goal || ''}`.toLowerCase().includes(query.trim().toLowerCase()),
      );

  useEffect(() => {
    if (selected && dialog.current && !dialog.current.open) {
      dialog.current.scrollTop = 0;
      dialog.current.showModal();
    }
  }, [selected]);

  function openPreview(site: Site) {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActualSize(false);
    setSelected(site);
  }

  function reset() {
    setCategory('All');
    setQuery('');
  }

  return (
    <section id="site-gallery" className="ew-site-gallery ew-shell" aria-labelledby="site-gallery-title">
      <div className="ew-section-heading">
        <div>
          <p className="ew-eyebrow">From the studio</p>
          <h2 id="site-gallery-title">Whole websites. Wider possibilities.</h2>
          <p className="ew-gallery-intro">Explore complete website concepts, alongside our tools, storefronts, and experiments. Each concept begins with a particular business and a customer need.</p>
        </div>
        {compact && <a className="ew-text-link" href="/work#site-gallery">Explore all {sites.length} previews →</a>}
      </div>
      {!compact && (
        <div className="ew-gallery-controls">
          <div className="ew-gallery-filters" role="group" aria-label="Filter site gallery">
            {categories.map((label) => <button type="button" key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}
          </div>
          <label className="ew-gallery-search">Search the gallery<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a site or industry…" /></label>
        </div>
      )}
      {!compact && <p className="ew-gallery-count" role="status">{visible.length} {visible.length === 1 ? 'preview' : 'previews'}</p>}
      <div className="ew-site-grid">
        {visible.map((site) => (
          <article className={`ew-site-card${site.fullPage ? ' ew-site-card--concept' : ''}`} key={site.slug}>
            {site.url && !site.fullPage ? <a className="ew-site-window" href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${site.title} (new tab)`}><Thumbnail site={site} /></a>
              : <button className="ew-site-window ew-site-reference" type="button" aria-label={`View image: ${site.title}`} aria-haspopup="dialog" onClick={() => openPreview(site)}><Thumbnail site={site} /></button>}
            <span className="ew-site-category">{site.fullPage ? `${site.sector} / ${site.category === 'Concepts' ? 'Fictional design concept' : 'Client storefront'}` : site.category}</span>
            <h3 className="ew-site-title">{site.title}</h3>
            {site.fullPage && <p className="ew-site-concept-summary">{site.description}</p>}
            <div className="ew-site-actions">
              {site.url && <a href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`${destinationLabel(site)}: ${site.title} (new tab)`}>{destinationLabel(site)} ↗</a>}
              <button className="ew-site-preview" type="button" aria-label={`Preview ${site.title}`} aria-haspopup="dialog" onClick={() => openPreview(site)}>{site.fullPage ? 'Explore full page' : 'Preview'}</button>
            </div>
          </article>
        ))}
      </div>
      {visible.length === 0 && <div className="ew-gallery-empty"><p>No previews match your search.</p><button type="button" onClick={reset}>Show all previews</button></div>}
      <dialog ref={dialog} className={`ew-site-dialog${selected?.fullPage ? ' ew-site-dialog--full-page' : ''}`} aria-labelledby="site-preview-title" onClose={() => { setSelected(null); trigger.current?.focus(); }} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        {selected && <div className="ew-site-dialog-content">
          <div className="ew-site-dialog-heading"><p className="ew-eyebrow">{selected.sector || selected.category} / {selected.fullPage ? selectedConcept ? 'Full-page concept' : 'Full-page storefront' : 'Site preview'}</p><button type="button" autoFocus aria-label="Close site preview" onClick={() => dialog.current?.close()}>Close ×</button></div>
          {selected.fullPage ? <>
            <div className="ew-site-dialog-copy ew-site-concept-intro">
              <h3 id="site-preview-title">{selected.title}</h3><p>{selected.description}</p>
              <span className="ew-site-private">{selected.previewLabel}. {selectedConcept ? 'This is a static design illustration; the business and its offer are imagined.' : 'A saved capture of the live homepage. Storefront work completed through Data Graphics’ client-services workflow; store content and ordering eligibility remain with the client.'}</span>
            </div>
            <div className="ew-site-page-toolbar">
              <p id="site-page-scroll-help">Scroll to explore from hero to footer{actualSize ? '; scroll sideways to read the details' : ''}.</p>
              <button type="button" aria-pressed={actualSize} aria-controls="site-page-scroll" onClick={() => { setActualSize(!actualSize); if (imageScroll.current) imageScroll.current.scrollLeft = 0; }}>{actualSize ? 'Fit to width' : 'Read at full size'}</button>
            </div>
            <div id="site-page-scroll" ref={imageScroll} className="ew-site-page-scroll" tabIndex={0} role="region" aria-label={`${selected.title} complete page image`} aria-describedby="site-page-scroll-help">
              <img className="ew-site-full-page-image" src={selected.image} alt={selected.alt || `${selected.title} complete ${selectedConcept ? 'website concept' : 'storefront homepage'}`} width={selected.imageWidth} height={selected.imageHeight} style={actualSize ? { width: `${selected.imageWidth}px`, maxWidth: 'none' } : undefined} />
            </div>
            <div className="ew-site-dialog-copy ew-site-concept-brief">
              <dl><div><dt>The customer goal</dt><dd>{selected.goal}</dd></div><div><dt>The design approach</dt><dd>{selected.approach}</dd></div></dl>
              {selected.url && <p><a className="ew-text-link" href={selected.url} target="_blank" rel="noopener noreferrer">{destinationLabel(selected)} ↗</a></p>}
              <a className="ew-text-link" href="/contact">Plan a project like this ↗</a>
            </div>
          </> : <>
            <img className="ew-site-full-image" src={selected.image} alt={selected.alt || `${selected.title} homepage`} width="1440" height="1100" />
            <div className="ew-site-dialog-copy"><h3 id="site-preview-title">{selected.title}</h3><p>{selected.description}</p>
              {selected.url ? <a className="ew-text-link" href={selected.url} target="_blank" rel="noopener noreferrer">{destinationLabel(selected)} ↗</a> : <span className="ew-site-private">{selected.previewLabel || 'Saved design reference'}</span>}
            </div>
          </>}
        </div>}
      </dialog>
    </section>
  );
}
