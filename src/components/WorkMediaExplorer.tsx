import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { featuredMedia, mediaCategories, workMedia, type WorkMediaItem } from '../data/media';
import { cld, cldSrcSet, externalLinkProps } from '../utils';
import { SectionHeader } from './SectionHeader';

const allCategories = ['All work', ...mediaCategories] as const;
type Filter = (typeof allCategories)[number];

export function WorkMediaExplorer() {
  const [filter, setFilter] = useState<Filter>('All work');
  const [activeItem, setActiveItem] = useState<WorkMediaItem | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const filteredItems = useMemo(
    () => (filter === 'All work' ? workMedia : workMedia.filter((item) => item.category === filter)),
    [filter]
  );

  useEffect(() => {
    if (!activeItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveItem(null);
      if (event.key === 'ArrowRight') {
        const index = filteredItems.findIndex((item) => item.id === activeItem.id);
        setActiveItem(filteredItems[(index + 1) % filteredItems.length] ?? activeItem);
      }
      if (event.key === 'ArrowLeft') {
        const index = filteredItems.findIndex((item) => item.id === activeItem.id);
        setActiveItem(filteredItems[(index - 1 + filteredItems.length) % filteredItems.length] ?? activeItem);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, filteredItems]);

  return (
    <section id="work-media" className="section-shell section-block media-explorer" aria-labelledby="media-title">
      <SectionHeader
        id="media-title"
        eyebrow="Media explorer"
        title="Storefronts, mockups, campaign graphics, and production context in one organized gallery."
        summary="A deduplicated Cloudinary registry keeps the visual work scannable by category while preserving the existing images already used on the site."
      />

      <div className="featured-strip" aria-label="Featured work visuals">
        {featuredMedia.map((item) => (
          <button key={item.id} type="button" onClick={() => setActiveItem(item)}>
            <img
              src={cld(item.src, 620)}
              srcSet={cldSrcSet(item.src, [360, 520, 720])}
              sizes="(max-width: 720px) 72vw, 280px"
              alt={item.alt}
              loading="lazy"
            />
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      <div className="filter-row" aria-label="Filter media by category">
        {allCategories.map((category) => (
          <button
            className={filter === category ? 'is-active' : ''}
            key={category}
            type="button"
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="media-accordion" aria-label="Media groups">
        {mediaCategories.map((category) => {
          const groupItems = filteredItems.filter((item) => item.category === category);
          if (!groupItems.length) return null;

          return (
            <details key={category} open={filter === 'All work' || filter === category}>
              <summary>
                <span>{category}</span>
                <small>{groupItems.length} items</small>
              </summary>
              <div className="media-grid">
                {groupItems.map((item, index) => (
                  <article
                    className={`media-card media-card--${item.type}`}
                    key={item.id}
                    data-reveal
                    style={{ '--delay': `${index * 25}ms` } as CSSProperties}
                  >
                    <button type="button" onClick={() => setActiveItem(item)} aria-label={`Open ${item.title} image`}>
                      <img
                        src={cld(item.src, 920)}
                        srcSet={cldSrcSet(item.src, [420, 640, 920, 1280])}
                        sizes="(max-width: 720px) 92vw, (max-width: 1120px) 45vw, 360px"
                        width="960"
                        height="720"
                        alt={item.alt}
                        loading="lazy"
                      />
                    </button>
                    <div>
                      <span>{item.client ?? item.category}</span>
                      <h3>{item.title}</h3>
                      <p>{item.caption}</p>
                      <div className="media-card__actions">
                        {item.relatedHref ? <a href={item.relatedHref}>View related case study</a> : null}
                        {item.liveUrl ? (
                          <a href={item.liveUrl} {...externalLinkProps(`Open ${item.title}`)}>
                            Open live site
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      {activeItem ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
          <div className="lightbox__backdrop" onClick={() => setActiveItem(null)} aria-hidden="true" />
          <div className="lightbox__panel">
            <button ref={closeButtonRef} type="button" className="modal-close" onClick={() => setActiveItem(null)}>
              Close
            </button>
            <img src={cld(activeItem.src, 1600)} alt={activeItem.alt} />
            <div>
              <span className="section-kicker">{activeItem.category}</span>
              <h3 id="lightbox-title">{activeItem.title}</h3>
              <p>{activeItem.caption}</p>
              <div className="media-card__actions">
                {activeItem.relatedHref ? <a href={activeItem.relatedHref}>View related case study</a> : null}
                {activeItem.liveUrl ? (
                  <a href={activeItem.liveUrl} {...externalLinkProps(`Open ${activeItem.title}`)}>
                    Open live site
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
