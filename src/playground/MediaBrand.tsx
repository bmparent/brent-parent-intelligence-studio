import { sectionKind, mediaSlots, type Card, type Section } from "./model";
import {useState} from 'react';
import type {Project} from './model';
import {labels} from './model';
import {defaultMedia,type MediaSettings,type BrandKit} from './media';
import {Field,Color,Range,Toggle} from './Controls';
import {imageData} from './storage';
import {cloudPreflight} from './limits';
export function MediaBrand({project:p,edit,guard,notify,close}:{project:Project;edit:(p:Project|((p:Project)=>Project),group?:string)=>void;guard:()=>()=>boolean;notify:(s:string)=>void;close:()=>void}) {
 const [placement,setPlacement]=useState<string>('hero'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const s=(mediaSlots(p).find(v=>v.id===placement)||p.sections[1]),m=s.media||defaultMedia();
 const brand=p.brand||{businessName:p.sections[0].title,tone:'',locks:[]};
 const updateItem=(patch:Partial<Card|Section>)=>({...p,sections:p.sections.map(v=>v.id===s.id?{...v,...patch} as Section:{...v,...(v.cards?{cards:v.cards.map(c=>c.id===s.id?{...c,...patch} as Card:c)}:{})})});
 const role=placement==='header'?'Brand logo':placement==='hero'?'Hero image':placement==='work'?'Selected work image':'Section background';
 function media(patch:Partial<MediaSettings>) {edit(updateItem({media:{...m,...patch}}),'media-'+s.id);}
 function kit(patch:Partial<BrandKit>) {edit({...p,brand:{...brand,...patch}});}
 async function upload(file?:File) {
  if(!file||busy||(placement==='header'&&brand.locks.includes('logo')))return;const valid=guard();setBusy(true);setMessage('Processing image on this device…');
  try {
   const data=await imageData(file),hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(data));
   if(!valid()){setMessage('Workspace changed. Choose the image again to add it here.');return;}
   const sourceId=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
   const next=updateItem({image:data,media:{...defaultMedia(),fit:placement==='header'?'contain':'cover',sourceId,sourceName:file.name.slice(0,120)}});
   edit(next);setMessage(cloudPreflight(next).message||'Image added locally. Save explicitly to keep it in your account.');
  }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
 }
 async function palette() {
  const logo=p.sections.find(v=>v.id==='header')?.image;if(!logo){setMessage('Add a logo first. Palette suggestions are computed on this device.');return;}
  const valid=guard();try {const image=new Image();image.src=logo;await image.decode();const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0,32,32);const pixels=ctx.getImageData(0,0,32,32).data,counts=new Map<string,number>();for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<160)continue;const hex='#'+[pixels[i],pixels[i+1],pixels[i+2]].map(v=>(Math.round(v/32)*32>255?255:Math.round(v/32)*32).toString(16).padStart(2,'0')).join('');counts.set(hex,(counts.get(hex)||0)+1);}const accent=[...counts].sort((a,b)=>b[1]-a[1])[0]?.[0];if(valid()&&accent&&!brand.locks.includes('palette')) {edit({...p,tokens:{...p.tokens,accent}});notify('Suggested accent from logo pixels. Review text contrast before publishing.');}}catch{setMessage('Could not read this logo. Choose colors manually.');}
 }
 return <aside className="pg-inspector" aria-label="Media and brand controls"><div className="pg-panel-heading"><h2>Media / Brand</h2><button onClick={close} aria-label="Close media controls">×</button></div><div className="pg-inspector-body">
 <div className="pg-field"><label htmlFor="pg-media-placement">Image placement</label><select id="pg-media-placement" value={placement} onChange={e=>setPlacement(e.target.value as string)}>{mediaSlots(p).filter(v=>v.id!=='footer').map(v=><option key={v.id} value={v.id}>{'visible' in v?labels[sectionKind(v)]:`Card: ${v.title||v.id}`} · {v.id==='header'?'logo':v.id==='hero'||v.id==='work'?'image':'background'}</option>)}</select></div>
 <div className="pg-media-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void upload(e.dataTransfer.files[0]);}}>
 {s.image&&<img className="pg-media-thumb" src={s.image} alt={`${role} thumbnail`} />}
 <strong>{role}</strong><label className="pg-upload">{busy?'Processing…':s.image?'Replace image':'Choose image'}<input disabled={busy||(placement==='header'&&brand.locks.includes('logo'))} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}} /></label><small>Choose a file or drop it here. PNG, JPEG, WebP · 8 MB input · 16 megapixels. No SVG or HTML.</small></div>
 <p role="status">{message}</p>
 {s.image&&<><small>{m.sourceName||'Embedded image'} · local bytes included in exports</small><div className="pg-field"><label htmlFor="pg-media-fit">Image fit</label><select id="pg-media-fit" value={m.fit} onChange={e=>media({fit:e.target.value as MediaSettings['fit']})}><option value="cover">Cover / crop</option><option value="contain">Contain</option><option value="fill">Fill / stretch</option></select></div><Range label="Crop zoom" min={1} max={3} step={0.05} value={m.zoom} onChange={zoom=>media({zoom})}/><Range label="Focal point horizontal" min={0} max={100} value={m.x} onChange={x=>media({x})}/><Range label="Focal point vertical" min={0} max={100} value={m.y} onChange={y=>media({y})}/><details><summary>Mobile focal point</summary><Toggle label="Override on mobile" checked={m.mobileX!==undefined} onChange={v=>media({mobileX:v?m.x:undefined,mobileY:v?m.y:undefined})}/>{m.mobileX!==undefined&&<><Range label="Mobile horizontal" min={0} max={100} value={m.mobileX} onChange={mobileX=>media({mobileX})}/><Range label="Mobile vertical" min={0} max={100} value={m.mobileY??m.y} onChange={mobileY=>media({mobileY})}/></>}</details><Color label="Overlay tint" value={m.tint} onChange={tint=>media({tint})}/><Range label="Overlay opacity" min={0} max={0.8} step={0.01} value={m.opacity} onChange={opacity=>media({opacity})}/><Toggle label="Decorative image" checked={m.decorative} onChange={decorative=>media({decorative})}/>{!m.decorative&&<Field label="Image alternative text" value={s.alt} maxLength={300} onChange={alt=>edit(updateItem({alt}))}/>}<button onClick={()=>edit(updateItem({image:''}))}>Remove from this page</button><small>Saved revisions and purchases retain their images.</small></>}
 <h3>Brand kit</h3><Field label="Business name" value={brand.businessName} maxLength={100} onChange={businessName=>{if(!brand.locks.includes('name'))edit({...p,brand:{...brand,businessName},sections:p.sections.map(v=>v.id==='header'||v.id==='footer'?{...v,title:businessName}:v)});}}/><Field label="Brand tone" value={brand.tone} maxLength={240} onChange={tone=>{if(!brand.locks.includes('tone'))kit({tone});}}/>
 {!brand.locks.includes('palette')&&<>{(['background','foreground','accent'] as const).map(k=><Color key={k} label={'Brand '+k} value={p.tokens[k]} onChange={v=>edit({...p,tokens:{...p.tokens,[k]:v}})}/>)}<button onClick={()=>void palette()}>Suggest accent from logo</button></>}
 <div className="pg-field"><label htmlFor="pg-brand-font">Brand typography</label><select id="pg-brand-font" disabled={brand.locks.includes('font')} value={p.tokens.font} onChange={e=>edit({...p,tokens:{...p.tokens,font:e.target.value as 'editorial'|'modern'}})}><option value="editorial">Editorial · Georgia</option><option value="modern">Modern · Arial</option></select></div>
 <details><summary>Lock brand values</summary><p>Locks protect brand suggestions and optional AI edits. Unlock to change these controls.</p>{(['name','logo','palette','font','tone'] as const).map(k=><Toggle key={k} label={'Lock '+k} checked={brand.locks.includes(k)} onChange={v=>kit({locks:v?[...brand.locks,k]:brand.locks.filter(x=>x!==k)})}/>)}</details>
 </div></aside>;
}
