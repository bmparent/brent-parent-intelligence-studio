import {mediaSlots,type Project} from './model';
// Browser-only, local decode; no provider or remote fetch. Imports contain embedded raster bytes.
export async function imageWarnings(p:Project):Promise<string[]> {
 const out:string[]=[];
 await Promise.all(mediaSlots(p).filter(s=>s.image).map(async s=>{const image=new Image();image.src=s.image;try{await image.decode();const expected=s.id==='header'?140:('cards' in s||s.id==='hero'?640:320);if(image.naturalWidth<expected)out.push(`${('text' in s?s.name:s.title)||'Image'}: ${image.naturalWidth}px wide; consider at least ${expected}px for this placement.`);}catch{out.push(`${('text' in s?s.name:s.title)||'Image'} could not be decoded. Re-upload before publishing.`);}}));
 return out.sort();
}
