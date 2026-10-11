import catalog from '../../products/templates/catalog.json';

export type TemplateEdition = {
  id: string; platform: string; kind: string; draftPriceCents: number; version?: string;
  currency: string; commercialAvailability: string; status: string;
  packagePath?: string; sourcePath?: string; pilotPath?: string; demoPath?: string; installationGuide: string;
};
export type TemplateProduct = {
  slug: string; name: string; audience: string; summary: string; signature: string;
  market: string; visualStyle: string; tagline: string;
  designDirection: { artCaption: string; structure: string; typography: string; visualLanguage: string; navigation: string; interaction: string };
  pages: (string | { title: string; file?: string })[]; editions: TemplateEdition[];
};
export const templateProducts = catalog.products as unknown as TemplateProduct[];
export const templateProduct = (slug: string) => templateProducts.find((p) => p.slug === slug);
export const pageNames = (product: TemplateProduct) => product.pages.map((p) => typeof p === 'string' ? p : p.title);
export const editionName = (edition: TemplateEdition) => edition.platform === 'wordpress' ? 'WordPress block theme' : edition.platform === 'developer' ? 'Developer source' : edition.platform === 'squarespace' ? 'Squarespace 7.1 section kit' : 'GoDaddy visual add-on';
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
export const templateStyles: Record<string, { market: string; style: string; line: string; art: string }> = Object.fromEntries(
  templateProducts.map((product) => [product.slug, {
    market: product.market, style: product.visualStyle,
    line: product.tagline, art: product.designDirection.artCaption,
  }]),
);
