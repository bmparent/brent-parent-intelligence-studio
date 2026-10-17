import test from 'node:test';
import assert from 'node:assert/strict';
import {imageDimensions, fittedImageSize, imageData, MAX_IMAGE_DATA_LENGTH} from '../src/playground/imageImport';
import {createProject, validateProject} from '../src/playground/model';
import {exportFiles} from '../src/playground/export';
function png(width:number,height:number) {const b=new Uint8Array(33);b.set([137,80,78,71,13,10,26,10]);const v=new DataView(b.buffer);v.setUint32(8,13);b.set([73,72,68,82],12);v.setUint32(16,width);v.setUint32(20,height);return b;}
function jpeg(width:number,height:number) {return Uint8Array.from([255,216,255,224,0,4,0,0,255,192,0,8,8,height>>8,height&255,width>>8,width&255,0]);}
test('phone raster preflight accepts 48 MP without decoding and rejects excessive or malformed dimensions',()=>{
 assert.deepEqual(imageDimensions(png(8000,6000)),{width:8000,height:6000,type:'image/png'});
 assert.deepEqual(imageDimensions(jpeg(8000,6000)),{width:8000,height:6000,type:'image/jpeg'});
 for(const b of [png(0,100),png(16000,16000),png(20000,2),jpeg(100,100).slice(0,12),new TextEncoder().encode('<svg width="10" height="10"/>')]) assert.throws(()=>imageDimensions(b));
 for(let size=0;size<33;size++)assert.throws(()=>imageDimensions(png(100,100).slice(0,size)));
 assert.deepEqual(fittedImageSize(8000,6000),{width:1600,height:1200});
 assert.deepEqual(fittedImageSize(6000,8000),{width:1200,height:1600});
 assert.deepEqual(fittedImageSize(10,10000),{width:2,height:1600});
 assert.deepEqual(fittedImageSize(100,50),{width:100,height:50});
});
test('WebP extended, lossy and lossless dimensions are bounded before decode',()=>{
 for(const kind of ['VP8X','VP8 ','VP8L']) {
  const b=new Uint8Array(30),v=new DataView(b.buffer);b.set(new TextEncoder().encode('RIFF'),0);b.set(new TextEncoder().encode('WEBP'+kind),8);
  if(kind==='VP8X'){v.setUint32(16,10,true);b[24]=99;b[27]=49;}
  if(kind==='VP8 '){b.set([157,1,42],23);v.setUint16(26,100,true);v.setUint16(28,50,true);}
  if(kind==='VP8L'){b[20]=47;v.setUint32(21,99|(49<<14),true);}
  assert.deepEqual(imageDimensions(b),{width:100,height:50,type:'image/webp'});
 }
});
test('tiny 26-byte lossless WebP header is accepted without weakening truncated-header checks',()=>{
 const tiny=Buffer.from('5249464612000000574542505650384c060000002f0000000000','hex');
 assert.equal(tiny.length,26);assert.deepEqual(imageDimensions(tiny),{width:1,height:1,type:'image/webp'});
 for(let size=0;size<25;size++)assert.throws(()=>imageDimensions(tiny.subarray(0,size)));
 for(const kind of ['VP8X','VP8 ']){const truncated=Buffer.from(tiny);truncated.write(kind,12);assert.throws(()=>imageDimensions(truncated));}
});
test('unsupported and over-budget files fail before browser allocation',async()=>{
 await assert.rejects(imageData(new File(['test'],'phone.heic',{type:'image/heic'})),/HEIC.*JPEG/);
 await assert.rejects(imageData(new File([],'empty.png',{type:'image/png'})),/32 MB/);
 await assert.rejects(imageData({size:32_000_001,name:'large.jpg',type:'image/jpeg'} as File),/32 MB/);
 await assert.rejects(imageData(new File(['<svg/>'],'fake.png',{type:'image/png'})),/damaged or unsupported/);
});
test('portable output stays under existing per-image and aggregate project limits',()=>{
 const p=createProject();const image='data:image/png;base64,'+Buffer.from(png(1,1)).toString('base64');p.sections[0].image=image;
 assert.equal(validateProject(p).sections[0].image,image);assert.ok(exportFiles(p).some(f=>f.name==='assets/header.png'));
 assert.ok(MAX_IMAGE_DATA_LENGTH<1_800_024);
 // Existing aggregate local-authoring budget is deliberately not raised.
 const huge='data:image/png;base64,'+'A'.repeat(4_400_000);
 const modern={...p,schemaVersion:5,sections:p.sections.map(s=>({...s,image:huge}))};
 assert.throws(()=>validateProject(modern),/16 MB local authoring limit/);
});
test('decoder resizing, adaptive output budget and cleanup preserve oriented geometry',async t=>{
 const originals = new Map<string, PropertyDescriptor|undefined>();
 const stub=(key:string,value:unknown)=>{if(!originals.has(key))originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});};
 t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else Reflect.deleteProperty(globalThis,key);}});
 let closed=0,attempts=0;const calls:unknown[]=[];
 stub('HTMLImageElement',class {});
 stub('createImageBitmap',async (_file:File,options:unknown)=>{calls.push(options);return {width:1600,height:2400,close(){closed++;}};});
 const context={imageSmoothingQuality:'',drawImage(){}};
 const canvas={width:0,height:0,getContext:()=>context,toDataURL:()=>++attempts===1?'data:image/png;base64,'+'A'.repeat(MAX_IMAGE_DATA_LENGTH):'data:image/webp;base64,UklGRg=='};
 stub('document',{createElement:()=>canvas});
 assert.match(await imageData(new File([jpeg(6000,4000)],'phone.jpg',{type:'image/jpeg'})),/^data:image\/webp/);
 assert.equal(attempts,2);assert.equal(closed,1);assert.equal(canvas.width,1);assert.equal(canvas.height,1);
 assert.deepEqual(calls,[{imageOrientation:'from-image',resizeWidth:1600,resizeQuality:'high'}]);
 await imageData(new File([jpeg(6000,100)],'wide-logo.jpg'));
 assert.deepEqual(calls[1],{imageOrientation:'from-image',resizeQuality:'high'});
 // Unsupported resize-at-decode cannot silently allocate a 48 MP fallback.
 stub('createImageBitmap',async()=>{throw Error('unsupported');});
 await assert.rejects(imageData(new File([jpeg(8000,6000)],'phone.jpg')),/under 20 megapixels/);
});
