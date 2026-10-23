export const candlelightAssets = '/images/storefronts/candlelight-exclusive';
export const candlelightFits = {
  men: { label: 'Men’s', sku: 'JST90', description: 'Soft-brushed backing. Clean lines. Show pride.' },
  women: { label: 'Women’s', sku: 'LST90', description: 'A shaped fit, finished with the Candlelight logo.' },
} as const;
export type CandlelightFit = keyof typeof candlelightFits;
export const candlelightSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export function candlelightPrice(size: string) { return size === '3XL' ? 90 : size === '2XL' ? 89 : 87; }
