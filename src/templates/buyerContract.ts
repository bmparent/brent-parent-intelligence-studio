export type BuyerSelection = { schemaVersion: 1; pages: string[]; modules: string[]; motion: boolean; colors: { ink: string; paper: string; accent: string } };
type NativeModule = { id: string; label: string; attributes: string[]; pages: string[] };
export const buyerFamilies: Record<string, { pages: { file: string; label: string }[]; modules: NativeModule[] }> = {
  switchboard: { pages: [{ file: 'index.html', label: 'Home' }, { file: 'services.html', label: 'Services' }, { file: 'service-detail.html', label: 'Service detail' }, { file: 'process.html', label: 'Our process' }, { file: 'contact.html', label: 'Contact' }], modules: [{ id: 'service-selector', label: 'Original problem-to-service selector', attributes: ['data-problem'], pages: ['index.html', 'services.html'] }] },
  tideglass: { pages: [{ file: 'index.html', label: 'Home' }, { file: 'stays.html', label: 'Stays' }, { file: 'stay-detail.html', label: 'Stay detail' }, { file: 'guide.html', label: 'Local guide' }, { file: 'contact.html', label: 'Contact / booking inquiry' }], modules: [{ id: 'scene-explorer', label: 'Original time-of-day scene explorer', attributes: ['data-time'], pages: ['index.html'] }] },
  matter: { pages: [{ file: 'index.html', label: 'Home' }, { file: 'collection.html', label: 'Collection' }, { file: 'object.html', label: 'Object detail' }, { file: 'process.html', label: 'Our process' }, { file: 'contact.html', label: 'Contact' }], modules: [{ id: 'material-inspection', label: 'Original material / surface inspection', attributes: ['data-material', 'data-lens'], pages: ['index.html', 'process.html'] }] },
  nightjar: { pages: [{ file: 'index.html', label: 'Home' }, { file: 'program.html', label: 'Program' }, { file: 'event.html', label: 'Event detail' }, { file: 'about.html', label: 'About' }, { file: 'contact.html', label: 'Contact' }], modules: [{ id: 'program-filter', label: 'Original program filters', attributes: ['data-program'], pages: ['index.html', 'program.html'] }, { id: 'poster-layers', label: 'Original poster-layer explorer', attributes: ['data-poster-layer'], pages: ['index.html', 'program.html'] }, { id: 'day-night', label: 'Original day / night treatment', attributes: ['data-theme-toggle'], pages: [] }] },
};

export function defaultBuyerSelection(family: string, palette: string[] = ['#34261f', '#f0e8dc', '#a4472b']): BuyerSelection {
  const contract = buyerFamilies[family];
  if (!contract) throw Error('This family has no supported buyer-local source adapter.');
  return { schemaVersion: 1, pages: contract.pages.map(page => page.file), modules: contract.modules.map(module => module.id), motion: true, colors: { ink: palette[0], paper: palette[1], accent: palette[2] } };
}
export function validateBuyerSelection(input: unknown, family: string): BuyerSelection {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Buyer configuration is invalid.');
  const value = input as BuyerSelection, contract = buyerFamilies[family];
  if (!contract || value.schemaVersion !== 1 || !Array.isArray(value.pages) || !value.pages.includes('index.html') || new Set(value.pages).size !== value.pages.length || value.pages.some(file => !contract.pages.some(page => page.file === file))) throw Error('Select Home and only the actual pages supported by this family.');
  if (!Array.isArray(value.modules) || new Set(value.modules).size !== value.modules.length || value.modules.some(id => !contract.modules.some(module => module.id === id))) throw Error('Unknown native family module.');
  if (contract.modules.some(module => value.modules.includes(module.id) && module.pages.length && !module.pages.some(file => value.pages.includes(file)))) throw Error('A selected native module needs one of its original pages.');
  if (typeof value.motion !== 'boolean' || !value.colors || ['ink', 'paper', 'accent'].some(key => !/^#[0-9a-f]{6}$/i.test(value.colors[key as keyof typeof value.colors]))) throw Error('Choose valid motion and six-digit palette colors.');
  return { schemaVersion: 1, pages: contract.pages.filter(page => value.pages.includes(page.file)).map(page => page.file), modules: contract.modules.filter(module => value.modules.includes(module.id)).map(module => module.id), motion: value.motion, colors: { ink: value.colors.ink, paper: value.colors.paper, accent: value.colors.accent } };
}
