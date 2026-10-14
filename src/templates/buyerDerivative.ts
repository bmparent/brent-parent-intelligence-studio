import pins from '../data/buyerArchivePins.json';
import { zipFiles, type ExportFile } from '../playground/export';
import { artworkBytes, validateConfiguration, type TemplateConfiguration } from './configurator';
import { buyerFamilies } from './buyerContract';

export type BuyerArchivePin = { family: string; editionId: string; version: string; sha256: string; bytes: number; catalogVersion: string; status: string };
export type VerifiedBuyerBase = { pin: BuyerArchivePin; files: ExportFile[]; sha256: string; bytes: number };
export type BuyerDerivative = { id: string; configFingerprint: string; configHash: string; archiveHash: string; archiveBytes: number; files: ExportFile[]; archive: Uint8Array; manifest: Record<string, unknown>; base: { sha256: string; bytes: number } };
const encode = (text: string) => new TextEncoder().encode(text);
const decode = (bytes: Uint8Array) => new TextDecoder('utf-8', { fatal: true }).decode(bytes);
export async function sha256(bytes: Uint8Array) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer))].map(byte => byte.toString(16).padStart(2, '0')).join(''); }
const crc32 = (bytes: Uint8Array) => { let crc = -1; for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); } return (crc ^ -1) >>> 0; };
export function buyerArchivePin(config: TemplateConfiguration): BuyerArchivePin {
  const pin = pins.find(item => item.family === config.family && item.editionId === config.editionId && item.version === config.editionVersion);
  if (!pin) throw Error('This edition/version is unsupported by this configurator. Your original retrieval path and license remain unchanged; no repurchase is required.');
  return pin;
}
function metadataMatches(metadata: unknown, pin: BuyerArchivePin) {
  if (!metadata || typeof metadata !== 'object') return false;
  const value = metadata as Record<string, unknown>;
  if (value.kind === 'eidos-buyer-base-verification') return value.editionId === pin.editionId && value.version === pin.version && value.sha256 === pin.sha256 && value.bytes === pin.bytes;
  if (!Array.isArray(value.products)) return false;
  return value.products.some(product => product && typeof product === 'object' && (product as { slug?: string }).slug === pin.family && Array.isArray(product.editions) && product.editions.some((edition: { id?: string; version?: string; package?: { sha256?: string; bytes?: number } }) => edition.id === pin.editionId && edition.version === pin.version && edition.package?.sha256 === pin.sha256 && edition.package?.bytes === pin.bytes));
}
export function buyerVerificationMetadata(config: TemplateConfiguration) { return { schemaVersion: 1, kind: 'eidos-buyer-base-verification', ...buyerArchivePin(config), entitlementVerification: 'not_performed', notice: 'Candidate archive identity only. Hash/possession does not establish a purchase, license, or entitlement.' }; }
export function validateBuyerVerificationMetadata(metadata: unknown, config: TemplateConfiguration) {
  if (!metadataMatches(metadata, buyerArchivePin(config))) throw Error('Verification metadata does not match the pinned candidate edition/version/hash.');
  return metadata;
}

async function inflate(packed: Uint8Array, expected: number) {
  let stream: ReadableStream<Uint8Array>;
  try { stream = new Blob([new Uint8Array(packed).buffer]).stream().pipeThrough(new DecompressionStream('deflate-raw')); }
  catch { throw Error('Raw ZIP decompression is unavailable in this browser. Use a supported current browser; keep your original archive.'); }
  const reader = stream.getReader(), chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.length; if (total > expected) { await reader.cancel(); throw Error('ZIP expanded beyond its declared size.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const output = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
  return output;
}

/** Bounded parser for the exact non-encrypted STORE/deflate package format.
 * Whole-archive pin validation happens before any decompression. */
export async function readBuyerZip(input: Uint8Array): Promise<ExportFile[]> {
  if (input.length > 5_000_000 || input.length < 22) throw Error('The base ZIP must be smaller than 5 MB.');
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength), files: ExportFile[] = [];
  const localOffsets: number[] = []; let cursor = 0, total = 0;
  while (cursor + 30 <= input.length && view.getUint32(cursor, true) === 0x04034b50) {
    if (files.length >= 100) throw Error('Too many ZIP entries.');
    const flags = view.getUint16(cursor + 6, true), method = view.getUint16(cursor + 8, true), crc = view.getUint32(cursor + 14, true), size = view.getUint32(cursor + 18, true), raw = view.getUint32(cursor + 22, true), length = view.getUint16(cursor + 26, true), extra = view.getUint16(cursor + 28, true);
    if ((flags & ~0x800) !== 0 || (method !== 0 && method !== 8) || !length || raw > 5_000_000 || total + raw > 20_000_000 || cursor + 30 + length + extra + size > input.length) throw Error('Unsupported, encrypted, oversized, or incomplete ZIP entry.');
    const name = decode(input.slice(cursor + 30, cursor + 30 + length));
    if (!/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(name) || name.split('/').some(part => part === '.' || part === '..' || part.startsWith('.')) || files.some(file => file.name === name)) throw Error('Unsafe or duplicate ZIP path.');
    const start = cursor + 30 + length + extra, packed = input.slice(start, start + size);
    const data = method === 8 ? await inflate(packed, raw) : packed;
    if (data.length !== raw || crc32(data) !== crc) throw Error('ZIP entry size or integrity check failed.');
    localOffsets.push(cursor); files.push({ name, data }); total += raw; cursor = start + size;
  }
  const centralStart = cursor;
  for (let index = 0; index < files.length; index++) {
    if (cursor + 46 > input.length || view.getUint32(cursor, true) !== 0x02014b50) throw Error('ZIP central directory is missing.');
    const length = view.getUint16(cursor + 28, true), extra = view.getUint16(cursor + 30, true), comment = view.getUint16(cursor + 32, true), mode = view.getUint32(cursor + 38, true) >>> 16;
    if (cursor + 46 + length + extra + comment > input.length || view.getUint32(cursor + 42, true) !== localOffsets[index] || (mode & 0xf000) === 0xa000 || decode(input.slice(cursor + 46, cursor + 46 + length)) !== files[index].name) throw Error('ZIP directory path, link, or offset is invalid.');
    cursor += 46 + length + extra + comment;
  }
  if (!files.length || cursor + 22 > input.length || view.getUint32(cursor, true) !== 0x06054b50 || view.getUint16(cursor + 4, true) !== 0 || view.getUint16(cursor + 6, true) !== 0 || view.getUint16(cursor + 8, true) !== files.length || view.getUint16(cursor + 10, true) !== files.length || view.getUint32(cursor + 12, true) !== cursor - centralStart || view.getUint32(cursor + 16, true) !== centralStart || cursor + 22 + view.getUint16(cursor + 20, true) !== input.length) throw Error('ZIP directory completeness check failed.');
  return files;
}

/** Low-level verifier accepts an explicitly trusted pin for synthetic tests.
 * The product entry point below resolves its pin only from the frozen registry. */
export async function verifyArchiveAgainstPin(input: Uint8Array, metadata: unknown, pin: BuyerArchivePin): Promise<VerifiedBuyerBase> {
  if (input.length !== pin.bytes || input.length > 5_000_000 || await sha256(input) !== pin.sha256) throw Error('This ZIP does not match the pinned candidate edition/version/hash. Keep the original archive and use its existing retrieval path.');
  if (!metadataMatches(metadata, pin)) throw Error('Verification metadata does not match the trusted edition/version/hash.');
  const prefix = `${pin.editionId}/`, archive = await readBuyerZip(input);
  if (archive.some(file => !file.name.startsWith(prefix))) throw Error('ZIP edition prefix does not match its identity.');
  const files = archive.map(file => ({ name: file.name.slice(prefix.length), data: file.data }));
  const manifestFile = files.find(file => file.name === 'PACKAGE_MANIFEST.json');
  if (!manifestFile) throw Error('Base PACKAGE_MANIFEST.json is missing.');
  const manifest = JSON.parse(decode(manifestFile.data));
  if (manifest.schemaVersion !== 1 || manifest.editionId !== pin.editionId || manifest.product !== pin.family || manifest.version !== pin.version || !Array.isArray(manifest.files)) throw Error('Base package manifest identity is invalid.');
  const names = manifest.files.map((file: { path: string }) => file.path);
  if (new Set(names).size !== names.length || names.length + 1 !== files.length || files.some(file => file.name !== 'PACKAGE_MANIFEST.json' && !names.includes(file.name))) throw Error('Base manifest file set is incomplete.');
  for (const record of manifest.files as { path: string; bytes: number; sha256: string }[]) {
    const file = files.find(item => item.name === record.path);
    if (!file || file.data.length !== record.bytes || await sha256(file.data) !== record.sha256) throw Error('Base manifest file hashes do not match the archive.');
  }
  if (!buyerFamilies[pin.family]) throw Error('No supported source adapter exists for this family.');
  for (const required of ['styles.css', 'script.js', 'site-config.js', 'LICENSE.txt', 'SUPPORT.md', 'ASSETS.md', 'INSTALL.md', 'legal.html', ...buyerFamilies[pin.family].pages.map(page => page.file)]) if (!files.some(file => file.name === required)) throw Error(`Required family source is missing: ${required}`);
  return { pin: { ...pin }, files, sha256: pin.sha256, bytes: input.length };
}
export async function verifyBuyerArchive(input: Uint8Array, metadata: unknown, config: TemplateConfiguration) { return verifyArchiveAgainstPin(input, metadata, buyerArchivePin(validateConfiguration(config))); }

const esc = (text: string) => text.replace(/[&<>"']/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[value]!);
const json = (input: unknown) => JSON.stringify(input, null, 2).replace(/</g, '\\u003c');
function replaceText(html: string, attribute: string, value: string) { return html.replace(new RegExp(`<([a-z][a-z0-9]*)\\b([^>]*\\b${attribute}(?:=["'][^"']*["'])?[^>]*)>[\\s\\S]*?<\\/\\1>`, 'gi'), (_match, tag, attributes) => `<${tag}${attributes}>${esc(value)}</${tag}>`); }
function replaceHref(html: string, attribute: string, href: string) { return html.replace(new RegExp(`<a\\b(?=[^>]*\\b${attribute}\\b)[^>]*>`, 'gi'), tag => tag.replace(/href="[^"]*"/, () => `href="${esc(href)}"`)); }
function localTarget(href: string) { return /^[A-Za-z0-9_-]+\.html(?:[?#]|$)/.test(href) ? href.split(/[?#]/)[0] : null; }

export async function buildBuyerDerivative(base: VerifiedBuyerBase, input: TemplateConfiguration): Promise<BuyerDerivative> {
  const config = validateConfiguration(input);
  if (config.editionId !== base.pin.editionId || config.editionVersion !== base.pin.version || config.family !== base.pin.family) throw Error('The uploaded base belongs to another family/version. Reattach the matching archive.');
  if (!config.name.trim() || !config.headline.trim()) throw Error('Enter a site name and home headline before creating a derivative.');
  const sourceConfig = base.files.find(file => file.name === 'site-config.js')!;
  const match = decode(sourceConfig.data).match(/window\.SITE_CONFIG\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!match) throw Error('The pinned family configuration source is unsupported.');
  const siteConfig = JSON.parse(match[1]), contract = buyerFamilies[config.family];
  const selected = new Set([...config.buyer.pages, 'legal.html']);
  const destination = contract.pages.find(page => selected.has(page.file) && page.file !== 'index.html');
  siteConfig.brand = config.name; siteConfig.email = config.contactEmail; siteConfig.motion = config.buyer.motion; siteConfig.colors = { ...siteConfig.colors, ...config.buyer.colors };
  siteConfig.pages.index = { ...siteConfig.pages.index, title: config.headline, intro: config.description, ctaHref: destination?.file || '#main', ctaLabel: destination ? `Explore ${destination.label.toLowerCase()}` : 'Explore this page' };
  if (config.artwork) { siteConfig.pages.index.image = 'assets/customer-artwork.png'; siteConfig.pages.index.imageAlt = config.artwork.alt; }
  const output: ExportFile[] = [], removed: string[] = [], transformed: string[] = [];
  for (const source of base.files) {
    if (source.name === 'PACKAGE_MANIFEST.json') { output.push({ name: 'BASE_PACKAGE_MANIFEST.json', data: source.data.slice() }); continue; }
    if (source.name.endsWith('.html') && !selected.has(source.name)) { removed.push(source.name); continue; }
    let data = source.data.slice();
    if (source.name === 'site-config.js') data = encode(`/* Buyer-local derivative. Original source/license remains separate. */\nwindow.SITE_CONFIG = ${json(siteConfig)};\n`);
    if (source.name.endsWith('.html')) {
      let html = replaceText(decode(data), 'data-brand', config.name);
      html = html.replace(/<body\b([^>]*)>/i, (_match, attributes) => `<body${attributes} style="${Object.entries(config.buyer.colors).map(([key, color]) => `--${key}:${color}`).join(';')}">`);
      html = html.replace(/<title>[^<]*<\/title>/i, () => `<title>${esc(contract.pages.find(page => page.file === source.name)?.label || 'Site notes')} — ${esc(config.name)}</title>`);
      html = html.replace(/(<meta\b[^>]*(?:property="og:title"|name="twitter:title")[^>]*content=")[^"]*(")/gi, (_match, before, after) => before + esc(config.name) + after);
      html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (_tag, text) => { const value = JSON.parse(text); value.name = config.name; if (source.name === 'index.html') value.description = config.description; return `<script type="application/ld+json">${json(value)}</script>`; });
      if (source.name === 'index.html') {
        html = replaceText(html, 'data-hero-title', config.headline); html = replaceText(html, 'data-hero-intro', config.description); html = replaceText(html, 'data-primary-link', siteConfig.pages.index.ctaLabel); html = replaceHref(html, 'data-primary-link', siteConfig.pages.index.ctaHref);
        html = html.replace(/(<meta\b[^>]*(?:name="description"|property="og:description")[^>]*content=")[^"]*(")/gi, (_match, before, after) => before + esc(config.description) + after);
        if (config.artwork) html = html.replace(/<img\b(?=[^>]*\bdata-hero-image\b)[^>]*>/gi, tag => tag.replace(/src="[^"]*"/, 'src="assets/customer-artwork.png"').replace(/alt="[^"]*"/, () => `alt="${esc(config.artwork!.alt)}"`));
      }
      if (config.contactEmail) { html = replaceText(html, 'data-email', config.contactEmail); html = replaceHref(html, 'data-email', `mailto:${config.contactEmail}`); }
      else {
        html = html.replace(/<a\b(?=[^>]*\bdata-email\b)[^>]*>[\s\S]*?<\/a>/gi, '<span>Contact address is not configured.</span>');
        html = html.replace(/(<form\b[^>]*class="[^"]*inquiry-form[^"]*"[^>]*>)([\s\S]*?)(<\/form>)/gi, '$1<p>Contact email is not configured. This form is disabled; no inquiry will be sent.</p><fieldset disabled>$2</fieldset>$3');
      }
      for (const module of contract.modules.filter(module => !config.buyer.modules.includes(module.id))) for (const attribute of module.attributes) html = html.replace(new RegExp(`<button\\b(?=[^>]*\\b${attribute}(?:[=\\s>]))[^>]*>[\\s\\S]*?<\\/button>`, 'gi'), '');
      if (!config.buyer.motion) html = html.replace('</head>', '<style>html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important}</style></head>');
      html = html.replace(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi, (_tag, attributes, body) => `<nav${attributes}>${body.replace(/<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi, (anchor: string, href: string) => { const target = localTarget(href); return target && !selected.has(target) ? '' : anchor; })}</nav>`);
      html = html.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (anchor, href, contents) => { const target = localTarget(href); return target && !selected.has(target) ? `<span class="not-included">${contents} <small>(page not included)</small></span>` : anchor; });
      data = encode(html);
    }
    if (await sha256(data) !== await sha256(source.data)) transformed.push(source.name);
    output.push({ name: source.name, data });
  }
  if (config.artwork) output.push({ name: 'assets/customer-artwork.png', data: artworkBytes(config.artwork.dataUrl) });
  const configFingerprint = JSON.stringify(config), configHash = await sha256(encode(configFingerprint));
  const id = `${config.family}-developer-${config.editionVersion}-local-${(await sha256(encode(`eidos-buyer-derivative-v1\n${base.sha256}\n${configHash}`))).slice(0, 20)}`;
  output.push({ name: 'configuration.json', data: encode(json(config)) });
  output.push({ name: 'DERIVATIVE_INSTALL.md', data: encode(`# Buyer-local ${config.family} derivative\n\nIdentity: ${id}\n\nThis uses your supplied pinned candidate developer source. Hash/possession verification is not purchase, ownership, entitlement, or license verification. Keep your original ZIP unchanged. Existing LICENSE.txt, SUPPORT.md, ASSETS.md and INSTALL.md are preserved byte-for-byte; this tool grants no new rights and does not change your support agreement. Uploaded artwork retains its own rights. No sample MIT grant applies to this paid source.\n\n## Open and use\n1. Unzip this NEW local derivative and open index.html independently. No account, provider, CDN or build is required.\n2. Included pages: ${config.buyer.pages.join(', ')}. legal.html is retained as an auxiliary policy example. Deselected page links are removed from navigation or shown as unavailable text. Review all retained demonstration copy and policy notes before hosting.\n3. Brand/email are applied across pages; main headline/introduction/artwork apply to Home. Palette and motion apply across pages. Native modules: ${config.buyer.modules.join(', ') || 'none'}. The original family script retains dormant handlers; disabled controls are absent.\n4. ${config.contactEmail ? 'Contact prepares an email draft in the visitor’s mail app. Nothing is sent or stored by this static website; verify inbox delivery separately.' : 'Contact email is not configured; the form is disabled. Configure your real email and rebuild before publication.'}\n5. To edit again, import configuration.json in /shop/configure and reattach the same original base ZIP and verification metadata. This source backup contains your image and options, not the licensed base ZIP. Use the main Undo/Save locally/Reopen saved controls for these options. Any edit invalidates an earlier derivative preview until rebuilt.\n6. Test keyboard, reduced motion, narrow screens, every retained link and your actual hosting environment. Upload all files together to static hosting. WordPress/native builders are unsupported by this adapter.\n\n## Provenance and limits\nBase: ${base.pin.editionId}@${base.pin.version}; SHA256 ${base.sha256}; ${base.bytes} bytes. Configuration SHA256 ${configHash}. BASE_PACKAGE_MANIFEST.json preserves the original manifest. PACKAGE_MANIFEST.json inventories the new payload and explicitly excludes itself. The separate download receipt hashes the complete ZIP. No checkout, recovery, order, account, original archive, or server fulfillment record is changed. Historical unsupported archives retain their existing rights/retrieval path; no repurchase is required.\n`) });
  output.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const manifest = { schemaVersion: 1, distribution: 'buyer-local-private-derivative', derivativeId: id, engine: 'eidos-buyer-derivative-v1', commercialEntitlement: false, entitlementVerification: 'not_performed', license: 'Unchanged base LICENSE.txt; uploaded artwork retains its own rights; no sample MIT grant', candidate: true, parentArchive: { editionId: base.pin.editionId, version: base.pin.version, sha256: base.sha256, bytes: base.bytes, catalogVersion: base.pin.catalogVersion }, configurationHash: configHash, includedPages: config.buyer.pages, auxiliaryPages: ['legal.html'], enabledModules: config.buyer.modules, motion: config.buyer.motion, transformedFiles: transformed, removedFiles: removed, addedFiles: output.filter(file => !base.files.some(baseFile => baseFile.name === file.name)).map(file => file.name), files: await Promise.all(output.map(async file => ({ path: file.name, bytes: file.data.length, sha256: await sha256(file.data) }))), manifestScope: 'All payload files; this manifest excludes itself. Complete ZIP checksum is in the separate download receipt.', contact: config.contactEmail ? 'Email draft only; no delivered-inquiry receipt' : 'Unconfigured; form disabled' };
  output.push({ name: 'PACKAGE_MANIFEST.json', data: encode(json(manifest)) });
  const archive = zipFiles(output);
  return { id, configFingerprint, configHash, archiveHash: await sha256(archive), archiveBytes: archive.length, archive, files: output, manifest, base: { sha256: base.sha256, bytes: base.bytes } };
}

/** The preview inlines these exact transformed files; it never substitutes the
 * original-sample renderer or fetches paid source from a server. */
export type BuyerPreviewLocation = { file: string; search: string; hash: string };
export function buyerPreviewLocation(result: BuyerDerivative, input: unknown): BuyerPreviewLocation {
  if (!input || typeof input !== 'object') throw Error('Invalid private preview destination.');
  const { file, search = '', hash = '' } = input as Record<string, unknown>;
  const bounded = (value: unknown, prefix: string, limit: number): value is string => typeof value === 'string' && value.length <= limit && (!value || value.startsWith(prefix)) && ![...value].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);
  if (typeof file !== 'string' || !/^[A-Za-z0-9_-]+\.html$/.test(file) || !result.files.some(item => item.name === file) || !bounded(search, '?', 512) || search.includes('#') || !bounded(hash, '#', 128)) throw Error('This private preview destination is unavailable.');
  return { file, search, hash };
}
export function buyerDerivativePreview(result: BuyerDerivative, file = 'index.html', context: { search?: string; hash?: string } = {}): string {
  const location = buyerPreviewLocation(result, { file, ...context });
  const page = result.files.find(item => item.name === file && file.endsWith('.html'));
  if (!page) throw Error('This page is not included in the current derivative.');
  const dataUrl = (path: string) => { const asset = result.files.find(item => item.name === path); if (!asset) throw Error(`Missing preview dependency: ${path}`); const mime = path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.png') ? 'image/png' : path.endsWith('.woff2') ? 'font/woff2' : path.endsWith('.woff') ? 'font/woff' : path.endsWith('.ttf') ? 'font/ttf' : path.endsWith('.webp') ? 'image/webp' : path.endsWith('.jpg') || path.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream'; let text = ''; for (const byte of asset.data) text += String.fromCharCode(byte); return `data:${mime};base64,${btoa(text)}`; };
  let html = decode(page.data);
  html = html.replace(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/gi, (_tag, path) => `<style>${decode(result.files.find(item => item.name === path)!.data).replace(/url\((['"]?)([^'")]+)\1\)/gi, (url, _quote, asset) => asset.startsWith('data:') || asset.startsWith('#') ? url : `url("${dataUrl(asset.replace(/^\.\//, ''))}")`)}</style>`);
  const scripts: string[] = [];
  html = html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/gi, (_tag, path) => {
    let script = decode(result.files.find(item => item.name === path)!.data);
    // Only adapt the pinned handler expression, never strings in user configuration.
    if (path === 'script.js') script = script.replace(/new URLSearchParams\(window\.location\.search\)/g, () => `new URLSearchParams(${json(location.search)})`);
    scripts.push(script.replace(/<\/script/gi, '<\\/script')); return '';
  });
  html = html.replace(/(<img\b[^>]*src=")([^"]+)(")/gi, (_tag, before, path, after) => before + dataUrl(path) + after);
  const pages = result.files.filter(item => item.name.endsWith('.html')).map(item => item.name);
  const bridge = `document.documentElement.dataset.buyerPreviewSearch=${json(location.search)};document.documentElement.dataset.buyerPreviewHash=${json(location.hash)};document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;const href=link.getAttribute('href')||'';const parts=href.match(/^([A-Za-z0-9_-]+\\.html)?(\\?[^#]*)?(#.*)?$/);if(!parts)return;const file=parts[1]||${json(file)},search=parts[2]||(!parts[1]?${json(location.search)}:''),hash=parts[3]||'';if(${JSON.stringify(pages)}.includes(file)){event.preventDefault();parent.postMessage({type:'eidos-buyer-preview-page',file,search,hash},'*')}});if(${json(location.hash)})requestAnimationFrame(()=>{try{document.getElementById(decodeURIComponent(${json(location.hash)}.slice(1)))?.scrollIntoView({behavior:'instant'})}catch{/* Invalid encoded fragment has no target. */}});`;
  const assetMap = Object.fromEntries(result.files.filter(item => /^assets\//.test(item.name)).map(item => [item.name, dataUrl(item.name)]));
  // The original family script can change img.src during material inspection.
  // Resolve those exact local assets inside this opaque sandbox as well.
  const resolver = `const buyerPreviewAssets=${JSON.stringify(assetMap)};const buyerImageSource=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{get:buyerImageSource.get,set(value){buyerImageSource.set.call(this,buyerPreviewAssets[value]||value)}});`;
  return html.replace('</body>', () => `<script>${resolver}\n${scripts.join('\n')}\n${bridge}</script></body>`);
}
