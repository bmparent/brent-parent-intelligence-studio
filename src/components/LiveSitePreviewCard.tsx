import { useEffect, useRef, useState } from 'react';
import type { StoreCaseStudy } from '../data/portfolio';
import { externalLinkProps } from '../utils';

type LiveSitePreviewCardProps = {
  study: StoreCaseStudy;
  featured?: boolean;
};

export function LiveSitePreviewCard({ study, featured = false }: LiveSitePreviewCardProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <article className={featured ? 'case-card case-card--feature glass-card' : 'case-card'} data-reveal>
        <div className="case-card__header">
          <span>{study.category}</span>
          <small>Live store</small>
        </div>
        <h3>{study.title}</h3>
        <p className="case-card__client">{study.client}</p>
        <div className="case-card__body">
          <section>
            <h4>Problem</h4>
            <p>{study.problem}</p>
          </section>
          <section>
            <h4>Approach</h4>
            <p>{study.approach}</p>
          </section>
          <section>
            <h4>Execution</h4>
            <p>{study.execution}</p>
          </section>
          <section>
            <h4>Result</h4>
            <p>{study.result}</p>
          </section>
        </div>
        <div className="case-card__proof" aria-label="What this project proves">
          {study.proves.map((proof) => (
            <span key={proof}>{proof}</span>
          ))}
        </div>
        <div className="case-card__actions">
          <a className="btn btn--primary" href={study.url} {...externalLinkProps(`Open ${study.title} live store`)}>
            Visit live site
          </a>
          <button className="btn btn--secondary" type="button" onClick={() => setOpen(true)}>
            Preview
          </button>
        </div>
      </article>

      {open ? (
        <div className="preview-modal" role="dialog" aria-modal="true" aria-labelledby={`${study.title}-preview-title`}>
          <div className="preview-modal__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="preview-modal__panel">
            <div className="preview-modal__header">
              <div>
                <span className="section-kicker">Live preview</span>
                <h3 id={`${study.title}-preview-title`}>{study.title}</h3>
              </div>
              <button ref={closeButtonRef} type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="Close preview">
                Close
              </button>
            </div>
            <div className="preview-frame">
              <iframe src={study.url} title={`${study.title} live site preview`} loading="lazy" />
            </div>
            <p>
              Some storefronts block embedded previews. If the frame does not load, use the live-site link.
            </p>
            <a className="btn btn--primary" href={study.url} {...externalLinkProps(`Open ${study.title} live store`)}>
              Visit live site
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
