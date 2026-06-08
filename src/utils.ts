import { siteConfig } from './config/site';

export function cld(src: string, width: number): string {
  return src.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

export function cldSrcSet(src: string, widths: number[]): string {
  return widths.map((width) => `${cld(src, width)} ${width}w`).join(', ');
}

export function externalLinkProps(label: string) {
  return {
    target: '_blank',
    rel: 'noreferrer noopener',
    'aria-label': `${label} (opens in a new tab)`
  };
}

export const projectBriefText = `Hi Brent - I am interested in building with Eidos Works.\n\nProject type: storefront / dashboard / automation / intelligence prototype / website\nBusiness context:\nPrimary goal:\nCurrent tools or platform:\nTimeline:\nWhat would make this project successful:\n`;

export const contactEmail = siteConfig.contactEmail;
export const contactMailto = `mailto:${contactEmail}?subject=Eidos%20Works%20project%20inquiry&body=${encodeURIComponent(projectBriefText)}`;
