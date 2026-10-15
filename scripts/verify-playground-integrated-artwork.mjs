import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { flattenNodes } from '../src/playground/authoringSchema.ts';

const pw=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.PG_BASE_URL||'http://127.0.0.1:5184',out=path.resolve(process.env.PG_ARTWORK_EVIDENCE||'artifacts/playground-unified/integrated-artwork');
const receipt={timestamp:new Date().toISOString(),base,source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:`${process.platform}/${process.arch}, Node ${process.version}; external Playwright; Browser plugin not available`,limitations:['Browser viewport tests are not physical-device or unfamiliar-user acceptance.','Artwork is inserted as a bounded PNG; editable objects remain in the same project. Page-level arbitrary object positioning is not implied.'],sourceFiles:{},records:[]};
for(const name of ['src/playground/UnifiedPanels.tsx','src/playground/ArtworkStudio.tsx','src/playground/artworkSchema.ts','src/playground/artworkRenderer.ts','scripts/verify-playground-integrated-artwork.mjs'])receipt.sourceFiles[name]=createHash('sha256').update(await readFile(name)).digest('hex');
await mkdir(out,{recursive:true});
for(const engine of (process.env.PG_ENGINES||'chromium').split(',')){
 const browser=await pw[engine].launch({headless:true,...(engine==='chromium'?{args:['--disable-gpu']}: {})});
 for(const width of [1440,390]){
  const run=path.join(out,engine,String(width));await mkdir(run,{recursive:true});
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true,reducedMotion:'reduce',hasTouch:width===390,...(engine==='chromium'&&width===390?{isMobile:true}:{})}),page=await context.newPage();page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(60000);
  const record={engine,width,checks:[],errors:[],downloads:0,apiCalls:[]};receipt.records.push(record);
  page.on('pageerror',error=>record.errors.push(error.message));page.on('download',()=>record.downloads++);
  await context.route('**/api/**',route=>{const pathname=new URL(route.request().url()).pathname;record.apiCalls.push(pathname);return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(pathname==='/api/public-config'?{accountsReady:false,aiReady:false,shopReady:false,communityReady:false,turnstileSiteKey:'',gaMeasurementId:''}:{member:null})});});
  const check=name=>{record.checks.push(name);console.log(`PASS ${engine}/${width} ${name}`);};
  const panel=async name=>{if(width<640)await page.getByRole('navigation',{name:'Workspace panels'}).getByRole('button',{name,exact:true}).click();};
  const assets=async()=>{await panel('Build');await page.getByRole('navigation',{name:'Build tools'}).getByRole('button',{name:'Assets',exact:true}).click();};
  const save=async()=>{await page.locator('.pg-save-inline').click();await page.waitForFunction(()=>document.querySelector('.pg-save-inline')?.textContent.includes('Saved on this device'));return page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('eidos-playground-v1',1);request.onsuccess=()=>{const db=request.result,read=db.transaction('workspace').objectStore('workspace').get('current');read.onsuccess=()=>{db.close();resolve(read.result);};read.onerror=()=>reject(read.error);};request.onerror=()=>reject(request.error);}));};
  try{
   await page.goto(base+'/playground/',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'What are you making?'}).waitFor();await page.getByRole('button',{name:/Switchboard/}).click();await page.getByLabel('Business or project name').fill('Artwork acceptance');await page.getByRole('button',{name:/Create project/}).click();await page.locator('.pg-unified').waitFor();
   await page.getByRole('button',{name:'1 Content',exact:true}).click();const original=await save();await assets();await page.getByRole('button',{name:'Create artwork',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'Original artwork',exact:true});await dialog.waitFor();await dialog.getByRole('button',{name:'botanical poster',exact:true}).click();
   await dialog.getByLabel('Accent palette',{exact:true}).fill('#71905b');await dialog.getByLabel('Accent palette',{exact:true}).dispatchEvent('input');
   const horizontal=dialog.getByLabel('Position X',{exact:true});assert.equal(await horizontal.getAttribute('min'),'0');assert.equal(await horizontal.getAttribute('max'),'100');await horizontal.focus();await page.keyboard.press('End');assert.equal(await horizontal.inputValue(),'100');await page.keyboard.press('Home');assert.equal(await horizontal.inputValue(),'0');
   for(let i=0;i<5;i++)await page.keyboard.press('ArrowRight');assert.equal(await horizontal.inputValue(),'5');
   const rotation=dialog.getByLabel('Rotation',{exact:true});assert.equal(await rotation.getAttribute('min'),'-180');assert.equal(await rotation.getAttribute('max'),'180');await rotation.focus();await page.keyboard.press('ArrowRight');
   const scale=dialog.getByLabel('Scale',{exact:true});assert.equal(await scale.getAttribute('min'),'0.1');assert.equal(await scale.getAttribute('max'),'3');
   await dialog.screenshot({path:path.join(run,'01-artwork-dialog.png')});check('asset tray opens editable poster with linked palette and bounded keyboard positioning/rotation/scale');
   await dialog.getByRole('button',{name:'Done · Back to page',exact:true}).click();await dialog.waitFor({state:'hidden'});const artwork=await save();
   assert.equal(artwork.documentId,original.documentId);assert.equal(artwork.project.studios.active,'page');assert.equal(artwork.project.studios.artwork.mode,'poster');assert.equal(artwork.project.studios.artwork.palette.accent,'#71905b');assert.equal(artwork.project.studios.artwork.objects[0].x,5);
   await assets();await page.getByRole('button',{name:'Insert artwork into page',exact:true}).click();await page.getByRole('status').filter({hasText:'Image added to your page'}).waitFor();const inserted=await save();
   const image=inserted.project.sections.flatMap(section=>section.authoring?flattenNodes(section.authoring.root):[]).find(node=>node.name==='Original artwork');assert.ok(image?.image.startsWith('data:image/png;base64,'));assert.deepEqual(inserted.project.studios.artwork,artwork.project.studios.artwork);assert.equal(inserted.documentId,original.documentId);assert.equal(record.downloads,0);record.imageId=image.id;
   const raw=Buffer.from(image.image.split(',')[1],'base64');assert.equal(raw.readUInt32BE(16),720);assert.equal(raw.readUInt32BE(20),960);check('Insert artwork embeds decoded 720×960 PNG directly in the same project without any download/re-upload');
   await page.getByRole('button',{name:'Undo',exact:true}).click();assert.deepEqual((await save()).project,artwork.project);await page.getByRole('button',{name:'Redo',exact:true}).click();assert.deepEqual((await save()).project,inserted.project);check('one Undo removes only insertion; Redo restores exact image and editable artwork');
   await page.getByRole('button',{name:'Mobile',exact:true}).first().click();await panel('Canvas');const frame=page.frameLocator('iframe[title="Your page preview"]'),rendered=frame.locator('#'+image.id+' img');await rendered.scrollIntoViewIfNeeded();assert.equal(await rendered.evaluate(img=>img.complete&&img.naturalWidth===720&&img.naturalHeight===960),true);
   const bounds=await frame.locator('#'+image.id).evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,width:r.width,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1};});assert.ok(bounds.left>=-1&&bounds.right<=bounds.viewport+1&&bounds.width>0);assert.equal(bounds.overflow,false);record.mobileBounds=bounds;await page.screenshot({path:path.join(run,'02-inserted-mobile.png')});check('inserted decorative composition fits the mobile container without horizontal page overflow');
   if(engine==='chromium'&&width===390){
    const iframe=page.locator('iframe[title="Your page preview"]'),content=await(await iframe.elementHandle()).contentFrame();await content.evaluate(()=>scrollTo(0,0));await content.waitForFunction(()=>scrollY===0);
    const box=await iframe.boundingBox(),x=box.x+14,y=box.y+Math.min(box.height-90,420),cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1,radiusX:8,radiusY:8}]});
    for(let step=1;step<=8;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*25,id:1,radiusX:8,radiusY:8}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await content.waitForFunction(()=>scrollY>20);record.touchScroll=await content.evaluate(()=>scrollY);await cdp.detach();assert.deepEqual((await save()).project,inserted.project);check('Chromium touch emulation scrolls the current canvas outside explicit handles without mutating the project');
   }
   await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Continue project/}).click();await page.locator('.pg-unified').waitFor();const reopened=await save();assert.deepEqual(reopened.project,inserted.project);assert.equal(reopened.documentId,original.documentId);
   await assets();await page.getByRole('button',{name:'Edit artwork',exact:true}).click();await dialog.waitFor();assert.equal(await dialog.getByLabel('Position X',{exact:true}).inputValue(),'5');await dialog.getByRole('button',{name:'Done · Back to page',exact:true}).click();check('reload/Continue preserves original image bytes, same project and editable artwork source');
   await page.getByRole('button',{name:'Finish',exact:true}).click();await page.getByRole('button',{name:'Prepare current draft',exact:true}).click();await page.getByLabel('I reviewed this frozen version for my local download.',{exact:true}).check();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download page package',exact:true}).click();const download=await pending,zip=path.join(run,'artwork-page.zip');await download.saveAs(zip);
   const bytes=await readFile(zip),extracted=path.join(run,'independent');await mkdir(extracted,{recursive:true});let offset=0;
   while(bytes.readUInt32LE(offset)===0x04034b50){assert.equal(bytes.readUInt16LE(offset+8),0);const size=bytes.readUInt32LE(offset+18),length=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+length).toString();assert.ok(!name.includes('..')&&!path.isAbsolute(name));const start=offset+30+length+extra,dest=path.join(extracted,name);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes.subarray(start,start+size));offset=start+size;}
   assert.deepEqual(JSON.parse(await readFile(path.join(extracted,'project.json'),'utf8')),inserted.project);assert.deepEqual(await readFile(path.join(extracted,'assets',image.id+'.png')),raw);
   const independent=await context.newPage();independent.on('pageerror',error=>record.errors.push(error.message));await independent.goto(pathToFileURL(path.join(extracted,'index.html')).href);await independent.locator('#'+image.id+' img').waitFor();assert.equal(await independent.locator('#'+image.id+' img').evaluate(img=>img.complete&&img.naturalWidth===720),true);await independent.locator('#'+image.id).scrollIntoViewIfNeeded();await independent.screenshot({path:path.join(run,'03-independent.png')});await independent.close();record.archive={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};check('actual Finish ZIP retains exact artwork image/source and opens independently');
   assert.equal(record.errors.length,0);assert.equal(await page.locator('vite-error-overlay').count(),0);assert.equal(record.downloads,1);assert.ok(record.apiCalls.every(name=>['/api/public-config','/api/members/account'].includes(name)));check('no runtime errors, unintended downloads, AI/payment API calls or blank editor');
  }catch(error){record.failure=error.stack;console.error(error.stack);process.exitCode=1;await page.screenshot({path:path.join(run,'failure.png'),fullPage:true}).catch(()=>{});}
  finally{await context.close();receipt.completedAt=new Date().toISOString();await writeFile(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');}
 }
 await browser.close();
}
