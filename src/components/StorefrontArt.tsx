import { holidayCompositions } from '../data/holidayArtwork';

// One viewBox keeps the model and every mark together in thumbnails, product
// cards, inspection and the demo bag. Other storefronts retain their own images.
export function StorefrontArt({ src, alt, className, loading }: {
  src: string; alt: string; className?: string; loading?: 'lazy' | 'eager';
}) {
  const composition = holidayCompositions[src];
  if (!composition) return <img src={src} alt={alt} className={className} loading={loading} />;
  return <svg className={['sd-art', className].filter(Boolean).join(' ')}
    viewBox={`0 0 ${composition.width} ${composition.height}`} preserveAspectRatio="xMidYMax meet"
    role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined}>
    <image href={src} width={composition.width} height={composition.height} />
    {composition.marks.map((mark, index) => <image key={index} data-garment-mark=""
      href={mark.source} x={mark.x} y={mark.y} width={mark.width} height={mark.height}
      transform={`rotate(${mark.angle ?? 0} ${mark.x + mark.width / 2} ${mark.y + mark.height / 2})`} />)}
  </svg>;
}
