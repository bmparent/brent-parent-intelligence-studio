import type { CSSProperties } from 'react';
import { galleryProjects } from '../data/portfolio';
import { cld, cldSrcSet } from '../utils';
import { SectionHeader } from './SectionHeader';

export function ProjectGallery() {
  return (
    <section id="gallery" className="section-shell section-block gallery" aria-labelledby="gallery-title">
      <SectionHeader
        id="gallery-title"
        eyebrow="Cloudinary visual project gallery"
        title="Portfolio visuals that show the level of storefront polish."
        summary="These Cloudinary-hosted mockups support the credibility of the portfolio by showing how different commerce contexts can feel distinct while still staying clean, responsive, and conversion-focused."
      />

      <div className="gallery-grid">
        {galleryProjects.map((project, index) => (
          <article className="gallery-card" key={project.title} data-reveal style={{ '--delay': `${index * 45}ms` } as CSSProperties}>
            <div className="gallery-card__image">
              <img
                src={cld(project.src, 980)}
                srcSet={cldSrcSet(project.src, [520, 760, 980, 1280])}
                sizes="(max-width: 720px) 92vw, (max-width: 1120px) 45vw, 560px"
                width="1024"
                height="768"
                alt={project.alt}
                loading="lazy"
              />
            </div>
            <div className="gallery-card__content">
              <span>{project.label}</span>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <ul aria-label={`What ${project.title} demonstrates`}>
                {project.proves.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
