import { candlelightAssets } from '../data/candlelight';
import '../styles/candlelight-preview.css';

export function CandlelightPreview() {
  return <div className="clex-preview" aria-label="Candlelight Exclusive ivory storefront with an amber-lit jacket arch">
    <div className="clex-preview-mast" aria-hidden="true">EPCOT · CANDLELIGHT PROCESSIONAL <span>THE EXCLUSIVE COLLECTION</span></div>
    <div className="clex-preview-grid">
      <div className="clex-preview-copy"><span>FOR THE PEOPLE BEHIND THE PERFORMANCE</span><strong>A tradition.<br />A team.<br /><em>A keepsake.</em></strong><p>The Candlelight jacket, made for the moments beyond the stage.</p><i>Explore the collection ↗</i></div>
      <div className="clex-preview-arch"><img src={`${candlelightAssets}/men-front.webp`} width="1024" height="1536" alt="" loading="lazy" /></div>
    </div>
    <div className="clex-preview-rule" aria-hidden="true">TWO FITS. ONE SHARED TRADITION.</div>
  </div>;
}
