import { templateProduct, templateProducts } from '../data/templateCatalog';
import packageContents from '../data/templatePackageContents.json';
import type { ExportFile } from '../playground/export';

export const configurationVersion = 1;
export const configurationStorageKey = 'eidos-template-configuration-v1';
export const pageOptions = [
  { id: 'home', label: 'Home', file: 'index.html' },
  { id: 'landing', label: 'Landing', file: 'landing.html' },
  { id: 'contact', label: 'Contact', file: 'contact.html' },
  { id: 'article', label: 'Blog / article', file: 'article.html' },
  { id: 'gallery', label: 'Gallery', file: 'gallery.html' },
] as const;
export const moduleOptions = [
  { id: 'gallery', label: 'Gallery filters + lightbox', description: 'Category buttons, full-size inspection, Escape to close, and focus return.', requires: 'gallery' },
  { id: 'motion', label: 'Accessible entrance motion', description: 'A short entrance, an explicit motion toggle, and reduced-motion CSS.', requires: null },
  { id: 'editorial', label: 'Editorial reading layout', description: 'A wide lead, reading column, pull quote, and related page links.', requires: 'article' },
] as const;
type PageId = typeof pageOptions[number]['id'];
type ModuleId = typeof moduleOptions[number]['id'];
export type TemplateConfiguration = {
  schemaVersion: 1;
  kind: 'eidos-original-configuration-sample';
  family: string;
  editionId: string;
  editionVersion: string;
  tier: 'essential' | 'expressive';
  pages: PageId[];
  modules: ModuleId[];
  name: string;
  headline: string;
  description: string;
  contactEmail: string;
};
export const familyDirections: Record<string, { background: string; ink: string; accent: string; title: string; text: string; layout: string }> = {
  switchboard: { background: '#f6f6ee', ink: '#14302b', accent: '#6b7e17', title: 'Make the next step clear.', text: 'A considered place to explain what you do, show your work, and invite a useful conversation.', layout: 'Strong service grids · clear wayfinding · original diagram studies' },
  tideglass: { background: '#eff3ed', ink: '#182f38', accent: '#7a5730', title: 'A little room to slow down.', text: 'An original landscape study and a calm sequence of spaces, details, and ways to get in touch.', layout: 'Cinematic landscape · generous serif type · quiet scene layers' },
  matter: { background: '#f0e8dc', ink: '#34261f', accent: '#a4472b', title: 'Let the details speak.', text: 'Objects, materials, and the care behind them. A warm editorial starting point for a small studio.', layout: 'Tactile object studies · warm paper · editorial reading rhythm' },
  nightjar: { background: '#201e39', ink: '#fff5d8', accent: '#ff9a7e', title: 'Make room for a different night.', text: 'A bold, open program of original work, shared ideas, and reasons to gather.', layout: 'Oversized typography · poster grids · high contrast program' },
};

export function createConfiguration(family = 'matter'): TemplateConfiguration {
  const product = templateProduct(family) || templateProducts[0];
  const edition = product.editions.find(item => item.platform === 'developer')!;
  const direction = familyDirections[product.slug];
  return { schemaVersion: 1, kind: 'eidos-original-configuration-sample', family: product.slug, editionId: edition.id, editionVersion: edition.version || '1.0.0', tier: 'essential', pages: ['home', 'contact'], modules: [], name: `${product.name} studio study`, headline: direction.title, description: direction.text, contactEmail: '' };
}

export function validateConfiguration(input: unknown): TemplateConfiguration {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Choose an Eidos configuration JSON file.');
  const data = input as Record<string, unknown>;
  if (data.schemaVersion !== configurationVersion || data.kind !== 'eidos-original-configuration-sample') throw Error('This configuration format is unsupported. Your open configuration is unchanged.');
  const product = templateProduct(String(data.family));
  const edition = product?.editions.find(item => item.platform === 'developer' && item.id === data.editionId && (item.version || '1.0.0') === data.editionVersion);
  if (!product || !familyDirections[product.slug] || !edition) throw Error('The associated family or edition version is unavailable in this candidate. Keep your original file.');
  if (data.tier !== 'essential' && data.tier !== 'expressive') throw Error('Unknown configuration tier.');
  const pages = data.pages;
  const modules = data.modules;
  if (!Array.isArray(pages) || !pages.includes('home') || pages.length > pageOptions.length || new Set(pages).size !== pages.length || pages.some(id => !pageOptions.some(page => page.id === id))) throw Error('Select Home and only supported page types.');
  if (!Array.isArray(modules) || modules.length > moduleOptions.length || new Set(modules).size !== modules.length || modules.some(id => !moduleOptions.some(module => module.id === id))) throw Error('Unknown optional module.');
  if ((data.tier === 'essential' && modules.length) || moduleOptions.some(module => modules.includes(module.id) && module.requires && !pages.includes(module.requires))) throw Error('This module needs the Expressive tier and its matching page.');
  for (const [key, max] of [['name', 80], ['headline', 120], ['description', 500], ['contactEmail', 254]] as const) {
    if (typeof data[key] !== 'string' || (data[key] as string).length > max || [...(data[key] as string)].some(character => character.charCodeAt(0) < 9)) throw Error(`Enter valid ${key} text (maximum ${max} characters).`);
  }
  if (data.contactEmail && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(data.contactEmail))) throw Error('Use a plain email address, without a mailto prefix or extra parameters.');
  return { schemaVersion: 1, kind: 'eidos-original-configuration-sample', family: product.slug, editionId: edition.id, editionVersion: edition.version || '1.0.0', tier: data.tier, pages: pageOptions.filter(page => pages.includes(page.id)).map(page => page.id), modules: moduleOptions.filter(module => modules.includes(module.id)).map(module => module.id), name: String(data.name), headline: String(data.headline), description: String(data.description), contactEmail: String(data.contactEmail) };
}

export function reconcileConfiguration(input: TemplateConfiguration): TemplateConfiguration {
  return validateConfiguration({ ...input, modules: input.tier === 'essential' ? [] : input.modules.filter(id => { const module = moduleOptions.find(item => item.id === id); return module && (!module.requires || input.pages.includes(module.requires)); }) });
}

export function associatedPackage(input: TemplateConfiguration) {
  const config = validateConfiguration(input);
  return packageContents.find(item => item.editionId === config.editionId && item.version === config.editionVersion)!;
}

const esc = (text: string) => text.replace(/[&<>"']/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[value]!);
export function sampleArtwork(family: string, variation = 0): string {
  const d = familyDirections[family] || familyDirections.matter;
  const inner = family === 'tideglass'
    ? `<circle cx="${550 + variation * 40}" cy="135" r="68" fill="${d.accent}"/><path d="M0 300 Q190 130 390 300 T800 280V560H0Z" fill="${d.ink}" opacity=".8"/><path d="M0 370 Q250 260 480 380T800 350V560H0Z" fill="${d.accent}" opacity=".7"/><path d="M0 440Q200 375 420 455T800 440V560H0Z" fill="${d.background}" opacity=".8"/>`
    : family === 'switchboard'
      ? `<g fill="none" stroke="${d.ink}" stroke-width="3"><path d="M120 280H310V140H650M310 280V430H650"/><rect x="70" y="230" width="100" height="100" rx="16" fill="${d.accent}"/><rect x="570" y="90" width="150" height="100" rx="16"/><rect x="570" y="380" width="150" height="100" rx="16"/><circle cx="310" cy="280" r="35" fill="${d.background}"/></g>`
      : family === 'nightjar'
        ? `<g fill="${d.accent}"><path d="M120 120H360V360H120Z" transform="rotate(${15 + variation * 15} 240 240)"/><circle cx="560" cy="270" r="145" fill="none" stroke="${d.ink}" stroke-width="35"/><path d="M450 450H710V475H450Z"/></g>`
        : variation === 1
          ? `<ellipse cx="400" cy="475" rx="235" ry="22" fill="${d.ink}" opacity=".12"/><path d="M180 300Q210 470 400 475Q590 470 620 300Z" fill="${d.accent}"/><ellipse cx="400" cy="300" rx="220" ry="60" fill="${d.ink}"/><ellipse cx="400" cy="300" rx="185" ry="43" fill="${d.background}"/><path d="M230 355Q290 415 350 425" fill="none" stroke="${d.background}" stroke-width="12" opacity=".35"/>`
          : variation === 2
            ? `<ellipse cx="400" cy="475" rx="210" ry="22" fill="${d.ink}" opacity=".12"/><path d="M385 270H415V460H385Z" fill="${d.ink}"/><ellipse cx="400" cy="460" rx="100" ry="20" fill="${d.ink}"/><path d="M250 280Q260 90 400 90Q540 90 550 280Z" fill="${d.accent}"/><ellipse cx="400" cy="280" rx="150" ry="30" fill="${d.ink}"/><ellipse cx="400" cy="280" rx="125" ry="18" fill="${d.background}"/>`
            : `<ellipse cx="400" cy="475" rx="240" ry="22" fill="${d.ink}" opacity=".12"/><path d="M260 210Q240 170 310 150H490Q560 170 540 210L510 440Q400 500 290 440Z" fill="${d.accent}"/><ellipse cx="400" cy="170" rx="115" ry="28" fill="${d.ink}"/><path d="M330 210L350 420" stroke="${d.background}" stroke-width="12" opacity=".35"/><circle cx="640" cy="125" r="55" fill="${d.ink}" opacity=".15"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" role="img" aria-label="Original ${esc(family)} abstract study"><rect width="800" height="560" fill="${d.background}"/>${inner}</svg>`;
}

export function sampleStyles(config: TemplateConfiguration) {
  const d = familyDirections[config.family];
  return `:root{color-scheme:${config.family === 'nightjar' ? 'dark' : 'light'};--paper:${d.background};--ink:${d.ink};--accent:${d.accent}}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.65 Arial,Helvetica,sans-serif}a{color:inherit;text-underline-offset:.2em}button,a,input{touch-action:manipulation}a:focus-visible,button:focus-visible{outline:3px solid var(--accent);outline-offset:5px}header,main,footer{width:min(1180px,calc(100% - 48px));margin:auto}header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:28px 0;border-bottom:1px solid currentColor}header strong{font-size:20px;max-width:30ch;overflow-wrap:anywhere}nav{display:flex;flex-wrap:wrap;gap:18px}nav a{font-size:14px}main{padding:60px 0}h1,h2,h3{line-height:1.08;letter-spacing:-.045em;overflow-wrap:anywhere}h1{font:500 clamp(40px,7vw,98px)/1.05 ${config.family === 'matter' || config.family === 'tideglass' ? 'Georgia,serif' : 'Arial,sans-serif'};max-width:13ch;margin:20px 0 28px}h2{font-size:clamp(28px,4vw,46px)}p{max-width:64ch;overflow-wrap:anywhere}.eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:12px}.lead{font-size:20px}.hero{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}.hero img{display:block;width:100%;aspect-ratio:1.2;object-fit:cover;border:1px solid currentColor;border-radius:${config.family === 'tideglass' ? '45% 45% 4px 4px' : '2px'}}.nightjar .hero{grid-template-columns:1.25fr .75fr}.nightjar h1{text-transform:uppercase;font-weight:800}.switchboard .hero img{order:-1}.button{display:inline-flex;min-height:44px;align-items:center;padding:12px 22px;border:1px solid currentColor;text-decoration:none;margin:12px 8px 12px 0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:44px 0}.card{border-top:1px solid currentColor;padding-top:20px}.card img{display:block;width:100%;aspect-ratio:1.25;object-fit:cover}.card h2{font-size:28px}.filters{display:flex;flex-wrap:wrap;gap:12px}button{font:inherit;color:inherit;background:transparent;border:1px solid currentColor;padding:10px 18px;cursor:pointer;min-height:44px}button[aria-pressed=true]{background:var(--ink);color:var(--paper)}dialog{background:var(--paper);color:var(--ink);max-width:min(900px,90vw);border:1px solid currentColor}dialog::backdrop{background:#0009}dialog img{display:block;width:100%;max-height:65vh;object-fit:contain}dialog button{float:right}article{max-width:760px;margin:auto}article img{width:100%}blockquote{border-left:3px solid var(--accent);margin:32px 0;padding-left:24px;font:28px/1.35 Georgia,serif}footer{padding:32px 0 48px;border-top:1px solid currentColor;font-size:13px}[hidden]{display:none!important}@media(max-width:700px){header{align-items:flex-start;flex-direction:column}.hero,.nightjar .hero,.grid{grid-template-columns:1fr}.hero{gap:24px}.hero img{max-height:420px}main{padding:32px 0}h1{max-width:18ch}.grid{gap:32px}}`;
}
const galleryScript = `document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter})}));const modal=document.querySelector('dialog');let opener;document.querySelectorAll('[data-inspect]').forEach(button=>button.addEventListener('click',()=>{opener=button;modal.querySelector('img').src=button.dataset.inspect;modal.querySelector('img').alt=button.dataset.label;modal.showModal();modal.querySelector('button').focus()}));modal?.querySelector('button').addEventListener('click',()=>modal.close());modal?.addEventListener('close',()=>opener?.focus());`;
const motionScript = `const toggle=document.querySelector('[data-motion]');let paused=false;toggle?.addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('motion-paused',paused);toggle.setAttribute('aria-pressed',String(!paused));toggle.textContent=paused?'Enable motion':'Pause motion'});`;
const motionStyles = `@keyframes reveal{from{opacity:.4;transform:translateY(12px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:no-preference){.hero{animation:reveal .6s ease-out}.motion-paused *{animation:none!important;transition:none!important}}@media(prefers-reduced-motion:reduce){[data-motion]{display:none}}`;
const editorialStyles = `.reading-lead{font:clamp(24px,3vw,36px)/1.4 Georgia,serif}.article-related{border-top:1px solid currentColor;margin-top:48px;padding-top:24px}article p{max-width:58ch}`;

export function samplePage(input: TemplateConfiguration, page: PageId, inline = true): string {
  const config = validateConfiguration(input);
  if (!config.pages.includes(page)) throw Error('This page is not in the selected package.');
  const selected = pageOptions.filter(item => config.pages.includes(item.id));
  const art = (i = 0) => inline ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sampleArtwork(config.family, i))}` : `assets/study-${i}.svg`;
  const gallery = config.modules.includes('gallery');
  const content = page === 'gallery'
    ? `<p class="eyebrow">Original studies</p><h1>A closer look.</h1><p>Original abstract work for this configuration sample.</p>${gallery ? '<div class="filters" aria-label="Filter the gallery"><button data-filter="all" aria-pressed="true">All studies</button><button data-filter="objects" aria-pressed="false">Objects</button><button data-filter="spaces" aria-pressed="false">Spaces</button></div>' : ''}<div class="grid">${[0,1,2].map(i => `<section class="card" data-category="${i === 1 ? 'spaces' : 'objects'}"><img src="${art(i)}" alt="${esc(config.family)} study ${i + 1}"><h2>Study ${i + 1}</h2><p>${i === 1 ? 'Space and atmosphere.' : 'Shape, material, and proportion.'}</p>${gallery ? `<button data-inspect="${art(i)}" data-label="${esc(config.family)} study ${i + 1}">Inspect study ${i + 1}</button>` : ''}</section>`).join('')}</div>${gallery ? '<dialog aria-label="Full-size study"><button type="button">Close inspection</button><img alt="" src=""></dialog>' : ''}`
    : page === 'article'
      ? `<article><p class="eyebrow">Studio journal · Original demonstration copy</p><h1>The care between the details.</h1><p class="reading-lead">A quiet decision can hold a whole composition together.</p><img src="${art()}" alt="Original abstract material study"><h2>Begin with what people need.</h2><p>${esc(config.description)}</p><p>The useful starting point is a clear hierarchy: one subject, room to inspect it, and a next action that says what will happen. Replace this demonstration copy with your own story.</p><blockquote>Give each detail enough room to be understood.</blockquote><h2>Make the work yours.</h2><p>Edit the exported HTML and CSS directly. This sample uses local vector artwork and system fonts, so it opens without an account or build service.</p><div class="article-related">${selected.filter(item=>item.id!=='article').map(item=>`<a class="button" href="${item.file}">${item.label}</a>`).join('')}</div></article>`
      : page === 'contact'
        ? `<div class="hero"><div><p class="eyebrow">Start a conversation</p><h1>What are you imagining?</h1><p class="lead">${esc(config.description)}</p>${config.contactEmail ? `<a class="button" href="mailto:${esc(config.contactEmail)}">Email ${esc(config.contactEmail)}</a><p>This opens your email app. Delivery depends on your mail provider. This static sample has no form server or delivered-inquiry receipt.</p>` : '<p><strong>Email is not configured.</strong> Add your real address in the configurator before export, or edit this page. No inquiry form or delivery service is included.</p>'}</div><img src="${art()}" alt="Original abstract study"></div>`
        : `<div class="hero"><div><p class="eyebrow">${esc(templateProduct(config.family)!.name)} · Original configuration sample</p><h1>${esc(config.headline)}</h1><p class="lead">${esc(config.description)}</p>${selected.filter(item=>item.id!=='home').slice(0,2).map(item=>`<a class="button" href="${item.file}">${item.label === 'Contact' ? 'Start a conversation' : `Explore ${item.label.toLowerCase()}`}</a>`).join('')}</div><img src="${art()}" alt="Original ${esc(config.family)} abstract study"></div>${page === 'home' ? `<div class="grid">${selected.filter(item=>item.id!=='home').map(item=>`<section class="card"><p class="eyebrow">${item.label}</p><h2>${item.id === 'contact' ? 'A useful next step.' : item.id === 'gallery' ? 'Look a little closer.' : item.id === 'article' ? 'Behind the work.' : 'An idea, made clear.'}</h2><p>Open the ${item.label.toLowerCase()} included in this sample.</p><a href="${item.file}">Explore ${item.label.toLowerCase()} →</a></section>`).join('')}</div>` : '<section><h2>One idea. A clear invitation.</h2><p>This landing page is a focused introduction. Replace the demonstration text and review the destinations before publishing.</p></section>'}`;
  const style = sampleStyles(config) + (config.modules.includes('motion') ? motionStyles : '') + (config.modules.includes('editorial') ? editorialStyles : '');
  // A sandboxed preview asks its owning component to open another selected page.
  // The exported package uses ordinary links and has no parent/window dependency.
  const bridge = inline ? `document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;const pages=${JSON.stringify(selected.map(item=>({file:item.file,id:item.id})))};const page=pages.find(item=>item.file===link.getAttribute('href'));if(page){event.preventDefault();parent.postMessage({type:'eidos-template-preview-page',page:page.id},'*')}});` : '';
  const scripts = bridge + (gallery && page === 'gallery' ? galleryScript : '') + (config.modules.includes('motion') ? motionScript : '');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(config.name)} · ${pageOptions.find(item=>item.id===page)!.label}</title>${inline ? `<style>${style}</style>` : `<link rel="stylesheet" href="styles.css">${config.modules.includes('motion') ? '<link rel="stylesheet" href="modules/motion.css">' : ''}${config.modules.includes('editorial') ? '<link rel="stylesheet" href="modules/editorial.css">' : ''}`}</head><body class="${config.family}"><header><strong>${esc(config.name)}</strong><nav aria-label="Main">${selected.map(item=>`<a href="${item.file}"${item.id===page ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}</nav></header><main>${content}</main><footer><p>${esc(config.name)} · Original Eidos Works configuration sample. ${config.tier === 'essential' ? 'Essential' : 'Expressive'} feature tier.</p>${config.modules.includes('motion') ? '<button data-motion aria-pressed="true">Pause motion</button>' : ''}<p>Static HTML · System fonts · No provider services included</p></footer>${inline ? `<script>${scripts}</script>` : `${gallery && page === 'gallery' ? '<script src="modules/gallery.js" defer></script>' : ''}${config.modules.includes('motion') ? '<script src="modules/motion.js" defer></script>' : ''}`}</body></html>`;
}

export function configurationFiles(input: TemplateConfiguration): ExportFile[] {
  const config = validateConfiguration(input);
  const encode = (text: string) => new TextEncoder().encode(text);
  const associated = associatedPackage(config);
  const files = [
    ...pageOptions.filter(page => config.pages.includes(page.id)).map(page => ({ name: page.file, data: encode(samplePage(config, page.id, false)) })),
    { name: 'styles.css', data: encode(sampleStyles(config)) },
    ...[0,1,2].map(i => ({ name: `assets/study-${i}.svg`, data: encode(sampleArtwork(config.family, i)) })),
    { name: 'configuration.json', data: encode(JSON.stringify(config, null, 2)) },
    { name: 'README.md', data: encode(`# ${config.name}\n\nThis is an original Eidos Works configuration sample, freely reusable for your own website. It is separate from the licensed ${config.family} paid-template archive. It does not grant an entitlement, rebuild a purchased version, or change a paid package.\n\n## Setup checklist\n1. Unzip and open index.html directly in a browser. No build, key, CDN, or external font is required.\n2. Follow every navigation link. The selected pages are ${config.pages.join(', ')}. The selected modules are ${config.modules.join(', ') || 'none'}.\n3. Replace sample copy and original abstract SVG studies. Edit the generated HTML/CSS with a text editor, or import configuration.json at /shop/configure and re-export. Re-exporting replaces hand edits.\n4. ${config.contactEmail ? `Contact opens the visitor's email application for ${config.contactEmail}. Verify actual inbox delivery separately.` : 'Contact email is not configured. Add a real email before publication.'} No form server, booking, payments, or email delivery service is included.\n5. Review keyboard navigation, gallery Escape/focus return when included, reduced motion, narrow screens, links, and real devices.\n6. Upload all files together to static hosting. This is not a WordPress theme, Squarespace import, or GoDaddy builder package.\n\n## Paid family association\nCatalog edition: ${config.editionId}@${config.editionVersion}. Its immutable ${associated.files.length}-file archive is a separate product. The sample's page/tier/module selection does not personalize that archive or change its price. Paid release remains gated by existing provider, ownership, mail and installation acceptance. Follow ${associated.guidePath} for the actual edition.\n\n## Rights\nThe generated sample layout and included vector studies are original Eidos Works work, licensed under MIT; see LICENSE.txt. System Arial/Helvetica and Georgia are selected by the operating system; no fonts are redistributed. User-supplied text remains yours.\n`) },
    { name: 'LICENSE.txt', data: encode('MIT License\n\nCopyright (c) 2026 Eidos Works\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this original configuration sample and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\nThis license applies to this generated original sample only. It does not change the license, entitlement, support terms, or archive of any separate paid template.\n') },
  ];
  if (config.modules.includes('gallery')) files.push({ name: 'modules/gallery.js', data: encode(galleryScript) });
  if (config.modules.includes('motion')) files.push({ name: 'modules/motion.css', data: encode(motionStyles) }, { name: 'modules/motion.js', data: encode(motionScript) });
  if (config.modules.includes('editorial')) files.push({ name: 'modules/editorial.css', data: encode(editorialStyles) });
  files.push({ name: 'PACKAGE_MANIFEST.json', data: encode(JSON.stringify({ schemaVersion: 1, distribution: 'original-local-configuration-sample', commercialEntitlement: false, configuration: config, associatedImmutableEdition: { id: config.editionId, version: config.editionVersion, guidePath: associated.guidePath, unchangedFileCount: associated.files.length }, files: files.map(file=>({ path:file.name, bytes:file.data.length })), manifestScope: 'All payload files; this manifest excludes itself to avoid recursive byte counts.', fonts: 'Operating-system Arial/Helvetica and Georgia; no remote or bundled font files.', contact: config.contactEmail ? 'mailto; inbox delivery unverified' : 'unconfigured; no delivery service' }, null, 2)) });
  return files;
}
