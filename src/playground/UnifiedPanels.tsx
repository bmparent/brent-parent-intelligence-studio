import { useRef, useState } from 'react';
import { Color, Field, Range, Toggle } from './Controls';
import { labels, mediaSlots, newBlock, palettes, sectionKind, validateProject, type Project, type SectionType } from './model';
import { applyBlockOperation, enableBlocks } from './authoring';
import { flattenNodes, isContainer, nodeTypes, type NodeType } from './authoringSchema';
import { defaultMedia } from './media';
import { imageData } from './storage';
import { selectStudio } from './studioProject';
import { ArtworkStudio } from './ArtworkStudio';
import { artworkPng, artworkSvg } from './artworkRenderer';
import { insertPageImage } from './editorAssets';
import { assetFiles, download, zipFiles } from './export';

type Props = { project: Project; selected: string; selectedNode: string; edit: (project: Project, group?: string) => void; select: (id: string, sectionId: string) => void; guard: () => () => boolean; notify: (message: string) => void };

export function AddPanel({ project, selected, selectedNode, edit, select, notify }: Props) {
  const all = project.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []);
  const selectedBlock = all.find(n => n.id === selectedNode);
  const destination = selectedBlock && isContainer(selectedBlock) ? selectedBlock : all.find(n => n.children?.some(c => c.id === selectedNode)) || project.sections.find(s => s.id === selected)?.authoring?.root || all[0];
  function add(kind: NodeType) {
    try {
      const base = enableBlocks(project);
      const parent = destination || base.sections.find(s => s.authoring)!.authoring!.root;
      const next = applyBlockOperation(base, { type: 'add', parent: parent.id, kind });
      const section = next.sections.find(s => s.authoring && flattenNodes(s.authoring.root).some(n => n.id === parent.id))!;
      const node = flattenNodes(section.authoring!.root).find(n => n.id === parent.id)!.children!.at(-1)!;
      edit(next); select(node.id, section.id); notify(`${node.name} added. Edit it in the inspector or directly on the page.`);
    } catch (error) { notify((error as Error).message); }
  }
  return <><span className="pg-eyebrow">Build your page</span><h2>Add something</h2><p className="pg-panel-copy">New elements go into <strong>{destination?.name || 'your hero'}</strong>.</p>
    <div className="pg-add-grid">{nodeTypes.map(kind => <button key={kind} onClick={() => add(kind)}><span aria-hidden="true">{({ heading: 'H', text: 'T', image: '▧', button: '↗', stack: '☰', row: '≡', columns: '▥' })[kind]}</span>{kind === 'columns' ? 'Columns' : kind[0].toUpperCase() + kind.slice(1)}</button>)}</div>
    <h3>Ready-made sections</h3><div className="pg-section-add">{(['about', 'contact', 'gallery', 'faq', 'testimonials', 'pricing'] as SectionType[]).map(kind => <button key={kind} disabled={project.sections.length >= 16} onClick={() => { try { const section = newBlock(kind); edit(validateProject({ ...project, sections: [...project.sections.slice(0, -1), section, project.sections.at(-1)!] })); select('', section.id); } catch (error) { notify((error as Error).message); } }}>+ {labels[kind]}</button>)}</div>
    <p className="pg-panel-copy">Stacks and columns reflow on mobile. Images keep their own crop and size controls.</p>
  </>;
}

export function BrandPanel({ project: p, edit, guard, notify }: Pick<Props, 'project' | 'edit' | 'guard' | 'notify'>) {
  const [busy, setBusy] = useState(false);
  const brand = p.brand || { businessName: p.sections[0].title, tone: '', locks: [] };
  const logo = p.sections.find(s => sectionKind(s) === 'header')?.image;
  return <div className="pg-global-brand"><span className="pg-eyebrow">Shared across this page</span><h2>Your brand</h2><p className="pg-panel-copy">Start with the essentials. Your content stays in place.</p>
    <Field label="Business name" value={brand.businessName} maxLength={100} onChange={businessName => { if (!brand.locks.includes('name')) edit({ ...p, brand: { ...brand, businessName }, sections: p.sections.map(s => ['header', 'footer'].includes(sectionKind(s)) ? { ...s, title: businessName } : s) }, 'brand:name'); }} />
    {logo && <img className="pg-brand-logo-preview" src={logo} alt="Your current logo" />}
    <label className="pg-upload">{busy ? 'Opening logo…' : logo ? 'Replace logo' : 'Add your logo'}<input aria-label="Upload brand logo" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy || brand.locks.includes('logo')} onChange={async event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; const valid = guard(); setBusy(true); try { const image = await imageData(file); if (!valid()) { notify('Project changed. Choose your logo again.'); return; } edit({ ...p, sections: p.sections.map(s => sectionKind(s) === 'header' ? { ...s, image, alt: brand.businessName, media: { ...defaultMedia(), fit: 'contain', sourceName: file.name.slice(0, 120) } } : s) }); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }} /></label><small>PNG, JPEG or WebP · up to 32 MB / 64 megapixels. Resized privately on this device.</small>
    <h3>Color palette</h3><div className="pg-palettes">{Object.entries(palettes).map(([name, colors]) => <button key={name} disabled={brand.locks.includes('palette')} aria-pressed={p.tokens.background === colors.background} onClick={() => edit({ ...p, tokens: { ...p.tokens, ...colors } })}><span className="pg-swatches"><i style={{ background: colors.background }} /><i style={{ background: colors.accent }} /></span>{name}</button>)}</div>
    {!brand.locks.includes('palette') && (['background', 'foreground', 'accent'] as const).map(key => <Color key={key} label={key === 'foreground' ? 'Text color' : key === 'background' ? 'Page background' : 'Accent color'} value={p.tokens[key]} onChange={value => edit({ ...p, tokens: { ...p.tokens, [key]: value } }, `brand:${key}`)} />)}
    <label className="pg-block-field">Typography<select disabled={brand.locks.includes('font')} value={p.tokens.font} onChange={event => edit({ ...p, tokens: { ...p.tokens, font: event.target.value as 'editorial' | 'modern' } })}><option value="editorial">Editorial · Serif</option><option value="modern">Modern · Sans</option></select></label>
    <Range label="Type scale" value={p.tokens.typeScale} min={0.75} max={1.3} step={0.01} unit="×" onChange={typeScale => edit({ ...p, tokens: { ...p.tokens, typeScale } }, 'brand:scale')} />
    <Field label="Voice and tone" value={brand.tone} maxLength={240} onChange={tone => { if (!brand.locks.includes('tone')) edit({ ...p, brand: { ...brand, tone } }, 'brand:tone'); }} />
    <details><summary>Page defaults & brand locks</summary><Range label="Page spacing" value={p.tokens.spacing} min={32} max={128} unit="px" onChange={spacing => edit({ ...p, tokens: { ...p.tokens, spacing } }, 'brand:spacing')} /><Range label="Page corners" value={p.tokens.radius} min={0} max={48} unit="px" onChange={radius => edit({ ...p, tokens: { ...p.tokens, radius } }, 'brand:radius')} /><Range label="Maximum page width" value={p.tokens.width} min={960} max={1600} step={20} unit="px" onChange={width => edit({ ...p, tokens: { ...p.tokens, width } }, 'brand:width')} />{(['name', 'logo', 'palette', 'font', 'tone'] as const).map(key => <Toggle key={key} label={`Lock ${key}`} checked={brand.locks.includes(key)} onChange={lock => edit({ ...p, brand: { ...brand, locks: lock ? [...brand.locks, key] : brand.locks.filter(v => v !== key) } })} />)}</details>
  </div>;
}

export function AssetsPanel(props: Props) {
  const { project, edit, selected, selectedNode, guard, notify, select } = props;
  const [busy, setBusy] = useState(false);
  const artworkDialog = useRef<HTMLDialogElement>(null);
  const assets = mediaSlots(project).filter((item, index, all) => item.image && all.findIndex(other => other.image === item.image) === index);
  const selectedImage = project.sections.flatMap(s => s.authoring ? flattenNodes(s.authoring.root) : []).find(n => n.id === selectedNode && n.type === 'image');
  const sectionImage = project.sections.find(s => s.id === selected && !s.authoring && ['hero', 'work'].includes(sectionKind(s)));
  function insert(image: string, name: string) { const result = insertPageImage(project, selected, selectedNode, image, name); edit(result.project); select(result.nodeId, result.sectionId); notify(selectedImage ? 'Selected image replaced. Undo restores it.' : 'Image added to your page. Drag its handle to move it.'); }
  async function upload(file?: File) { if (!file) return; const valid = guard(); setBusy(true); try { const image = await imageData(file); if (!valid()) { notify('Project changed. Choose your image again.'); return; } insert(image, file.name); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }
  return <><span className="pg-eyebrow">Images & original artwork</span><h2>Your assets</h2><p className="pg-panel-copy">{selectedImage ? `Replace ${selectedImage.name} with an image below.` : sectionImage ? `Choose the image for ${labels[sectionKind(sectionImage)]}.` : 'Add a photo to your selected container.'}</p>
    <button className="pg-button-secondary" disabled={!assets.length} onClick={() => {try {download(zipFiles(assetFiles(project)),'eidos-assets.zip','application/zip');notify('Asset download started. These are the optimized images used in your project. Download a project backup to resume editing later.');} catch(error) {notify((error as Error).message);}}}>Download images & logos</button><p className="pg-panel-copy">Downloads only the images used in this project. Account project saving is separate; originals stay on your device.</p>
    <label className="pg-upload pg-asset-upload">{busy ? 'Opening image…' : '+ Upload image'}<input aria-label="Upload image to page" disabled={busy} type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label><small className="pg-panel-copy">PNG, JPEG or WebP. Saved with this project.</small>
    <div className="pg-asset-grid">{assets.map(item => <button key={item.id} title="Insert this image" onClick={() => { try { insert(item.image, item.media?.sourceName || 'Project image'); } catch (error) { notify((error as Error).message); } }}><img src={item.image} alt={item.alt || 'Project image'} /><span>{item.media?.sourceName || ('name' in item ? item.name : item.title) || 'Image'}</span></button>)}</div>
    <div className="pg-artwork-card"><h3>Make something original</h3><p>Create a pattern or composition, then insert it directly into this page.</p>{project.studios?.artwork && <div className="pg-artwork-thumbnail" dangerouslySetInnerHTML={{ __html: artworkSvg(project.studios.artwork) }} />}<button className="pg-button-secondary" onClick={() => { if (!project.studios?.artwork) edit(selectStudio(selectStudio(project, 'artwork'), 'page')); artworkDialog.current?.showModal(); }}>{project.studios?.artwork ? 'Edit artwork' : 'Create artwork'}</button>{project.studios?.artwork && <button disabled={busy} onClick={async () => { const valid = guard(); setBusy(true); try { const bytes = await artworkPng(project.studios!.artwork!); if (!valid()) { notify('Project changed while preparing artwork. Insert it again.'); return; } insert('data:image/png;base64,' + btoa(Array.from(bytes, b => String.fromCharCode(b)).join('')), 'Original artwork'); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }}>Insert artwork into page</button>}</div>
    <dialog ref={artworkDialog} className="pg-artwork-dialog" aria-labelledby="pg-artwork-title"><header><div><span className="pg-eyebrow">Project asset</span><h2 id="pg-artwork-title">Original artwork</h2></div><button onClick={() => artworkDialog.current?.close()}>Done · Back to page</button></header>{project.studios?.artwork && <ArtworkStudio value={project.studios.artwork} onChange={(artwork, group) => edit({ ...project, studios: { ...project.studios!, artwork } }, group)} guard={guard} notify={notify} />}</dialog>
  </>;
}
