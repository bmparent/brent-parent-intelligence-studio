import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { flattenNodes } from '../src/playground/authoringSchema.ts';
import { exportFiles } from '../src/playground/export.ts';

const require = createRequire(import.meta.url), pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PG_BASE_URL || 'http://127.0.0.1:5184';
const out = path.resolve(process.env.PG_MOTION_EVIDENCE || 'artifacts/playground-unified/element-motion');
const engines = (process.env.PG_ENGINES || 'chromium').split(',');
const files = ['src/playground/authoringSchema.ts','src/playground/model.ts','src/playground/authoring.ts','src/playground/BlockControls.tsx','src/playground/authoringRenderer.ts','src/playground/authoringEditor.css','src/playground/runtimeBundle.ts','scripts/verify-playground-element-motion.mjs'];
const receipt = { timestamp: new Date().toISOString(), base, source: execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), sourceFiles: {}, environment: `${process.platform}/${process.arch}, Node ${process.version}; external Playwright fixture harness; Browser plugin not available`, limitations: ['Desktop and narrow browser viewports are not physical-device or unfamiliar-user acceptance.', 'Animations are sampled with browser animation APIs; no display-latency claim.'], records: [] };
for (const name of files) receipt.sourceFiles[name] = createHash('sha256').update(await readFile(name)).digest('hex');
await mkdir(out,{recursive:true});
const getNode = (project,id) => project.sections.flatMap(s=>s.authoring?flattenNodes(s.authoring.root):[]).find(n=>n.id===id);
for (const engine of engines) {
 console.log('Starting element motion checks: '+engine);
 const browser = await pw[engine].launch({headless:true,...(engine==='chromium'?{args:['--disable-gpu']}: {})});
 for (const width of (process.env.PG_WIDTHS || '1440,390').split(',').map(Number)) {
  const run = path.join(out,engine,String(width)); await mkdir(run,{recursive:true});
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true,reducedMotion:'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(60000);
  const record={engine,width,checks:[],errors:[],console:[],apiCalls:[]};receipt.records.push(record);
  const check=name=>{record.checks.push(name);console.log(`PASS ${engine}/${width} ${name}`);};
  page.on('pageerror',e=>record.errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))record.console.push({type:m.type(),text:m.text()});});
  await context.route('**/api/**',route=>{const url=new URL(route.request().url());record.apiCalls.push(url.pathname);return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(url.pathname==='/api/public-config'?{accountsReady:false,aiReady:false,shopReady:false,communityReady:false,turnstileSiteKey:'',gaMeasurementId:''}:{member:null})});});
  const panel=async name=>{if(width<640)await page.getByRole('navigation',{name:'Workspace panels'}).getByRole('button',{name,exact:true}).click();};
  const tool=async name=>{await panel('Build');await page.getByRole('navigation',{name:'Build tools'}).getByRole('button',{name,exact:true}).click();};
  const save=async()=>{await page.locator('.pg-save-inline').click();await page.waitForFunction(()=>document.querySelector('.pg-save-inline')?.textContent.includes('Saved on this device'));return page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('eidos-playground-v1',1);request.onsuccess=()=>{const db=request.result,read=db.transaction('workspace').objectStore('workspace').get('current');read.onsuccess=()=>{db.close();resolve(read.result);};read.onerror=()=>reject(read.error);};request.onerror=()=>reject(request.error);}));};
  try {
   await page.goto(base+'/playground/',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'What are you making?'}).waitFor();
   await page.getByRole('button',{name:/Switchboard/}).click();await page.getByRole('button',{name:/Create project/}).click();await page.locator('.pg-unified').waitFor();
   await page.getByRole('button',{name:'1 Content',exact:true}).click();await panel('Edit selection');
   const before=await save(),id=before.editor.nodeId,frame=page.frameLocator('iframe[title="Your page preview"]');
   assert.equal(await page.getByLabel('Element entrance',{exact:true}).inputValue(),'none');
   await page.getByLabel('Element entrance',{exact:true}).selectOption('rise');const applied=await save();
   assert.deepEqual(getNode(applied.project,id).motion,{preset:'rise',duration:600,delay:0});assert.equal(applied.documentId,before.documentId);
   await page.getByRole('button',{name:'Undo',exact:true}).click();assert.deepEqual((await save()).project,before.project);
   await page.getByRole('button',{name:'Redo',exact:true}).click();assert.deepEqual((await save()).project,applied.project);check('selected block motion is one exact Undo/Redo edit with stable identity');
   await page.getByLabel('Duration (ms)',{exact:true}).fill('800');await page.getByLabel('Duration (ms)',{exact:true}).blur();
   await page.getByLabel('Delay (ms)',{exact:true}).fill('150');await page.getByLabel('Delay (ms)',{exact:true}).blur();const configured=await save();
   assert.deepEqual(getNode(configured.project,id).motion,{preset:'rise',duration:800,delay:150});
   // Firefox returns empty computed styles for a display:none iframe. Inspect
   // the real visible canvas, then return to its narrow inspector for the shot.
   await panel('Canvas');await frame.locator('#'+id+'[data-node-motion="rise"]').waitFor();assert.equal(await frame.locator('#'+id).evaluate(el=>getComputedStyle(el).animationName),'none');await panel('Edit selection');
   await page.screenshot({path:path.join(run,'01-inspector.png'),fullPage:true});check('keyboard numeric motion settings persist; editing stays static for selection and gestures');
   await page.getByRole('button',{name:'Preview',exact:true}).click();
   await frame.locator('body[data-editing="false"]').waitFor();
   const sample=await frame.locator('#'+id).evaluate(el=>{const animation=el.getAnimations()[0];if(!animation)return null;animation.pause();animation.currentTime=550;const css=getComputedStyle(el);return {name:css.animationName,opacity:Number(css.opacity),transform:css.transform,iterations:css.animationIterationCount,duration:css.animationDuration};});
   assert.equal(sample?.name,'pg-block-rise');assert.ok(sample.opacity>0&&sample.opacity<1);assert.notEqual(sample.transform,'none');assert.equal(sample.iterations,'1');assert.equal(sample.duration,'0.8s');record.previewSample=sample;
   await page.screenshot({path:path.join(run,'02-preview-motion.png')});check('visitor preview renders a bounded one-shot entrance on the selected block');
   await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await frame.locator('#'+id).evaluate(el=>getComputedStyle(el).animationName),'none');
   assert.equal(await frame.locator('#'+id).evaluate(el=>getComputedStyle(el).opacity),'1');check('system reduced motion immediately presents static, visible content');
   await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Edit page',exact:true}).click();await panel('Edit selection');
   await page.getByRole('button',{name:'Mobile',exact:true}).first().click();await panel('Edit selection');assert.equal(await page.getByLabel('Element entrance',{exact:true}).inputValue(),'rise');assert.deepEqual(getNode((await save()).project,id).motion,getNode(configured.project,id).motion);check('mobile shares the same explicit element motion without changing desktop layout');
   await page.getByRole('button',{name:'Remove motion',exact:true}).click();const removed=await save();assert.equal(getNode(removed.project,id).motion,undefined);assert.equal(await frame.locator('#'+id).getAttribute('data-node-motion'),null);
   await page.getByRole('button',{name:'Undo',exact:true}).click();assert.deepEqual((await save()).project,configured.project);check('Remove motion clears metadata and one Undo restores the exact configured project');
   await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Continue project/}).click();await page.locator('.pg-unified').waitFor();assert.deepEqual((await save()).project,configured.project);check('explicit Continue restores motion, source identity and saved content');
   await page.getByRole('button',{name:'Finish',exact:true}).click();await page.getByRole('button',{name:'Prepare current draft',exact:true}).click();await page.getByLabel('I reviewed this frozen version for my local download.',{exact:true}).check();
   const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download page package',exact:true}).click();const download=await downloadPromise,zip=path.join(run,'approved-motion.zip');await download.saveAs(zip);
   const bytes=await readFile(zip),extracted=path.join(run,'independent');await mkdir(extracted,{recursive:true});let offset=0;
   while(bytes.readUInt32LE(offset)===0x04034b50){assert.equal(bytes.readUInt16LE(offset+8),0);const size=bytes.readUInt32LE(offset+18),length=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+length).toString();assert.ok(!name.includes('..')&&!path.isAbsolute(name));const start=offset+30+length+extra,dest=path.join(extracted,name);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes.subarray(start,start+size));offset=start+size;}
   assert.deepEqual(JSON.parse(await readFile(path.join(extracted,'project.json'),'utf8')),configured.project);
   for(const file of exportFiles(configured.project))assert.deepEqual(await readFile(path.join(extracted,file.name)),Buffer.from(file.data),'browser/server renderer parity: '+file.name);
   record.archive={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
   const independent=await context.newPage();independent.on('pageerror',e=>record.errors.push(e.message));await independent.goto(pathToFileURL(path.join(extracted,'index.html')).href);
   await independent.locator('body[data-editing="false"]').waitFor();assert.equal(await independent.locator('#'+id).evaluate(el=>getComputedStyle(el).animationName),'pg-block-rise');assert.equal(await independent.locator('.pg-node-toolbar').count(),0);
   await independent.screenshot({path:path.join(run,'03-independent-export.png'),fullPage:true});await independent.close();check('actual downloaded ZIP matches common renderer bytes and executes motion independently');
   const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),staticPage=await staticContext.newPage();await staticPage.goto(pathToFileURL(path.join(extracted,'index.html')).href);
   assert.equal(await staticPage.locator('#'+id).evaluate(el=>getComputedStyle(el).opacity),'1');assert.equal(await staticPage.locator('#'+id).evaluate(el=>getComputedStyle(el).animationName),'none');await staticContext.close();check('export remains visible and static without JavaScript');
   await page.getByRole('button',{name:'Close finish review',exact:true}).click();await tool('Project');const reduced=structuredClone(configured.project);reduced.glass.reducedMotion=true;
   await page.getByLabel('Import project',{exact:true}).setInputFiles({name:'reduced-motion.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(reduced))});await page.locator('.pg-toast').filter({hasText:'Project imported'}).waitFor();await page.getByRole('button',{name:'Preview',exact:true}).click();
   await frame.locator('body[data-editing="false"][data-reduced="true"]').waitFor();assert.equal(await frame.locator('#'+id).evaluate(el=>getComputedStyle(el).animationName),'none');check('the saved project reduced-motion preference also suppresses element animation');
   assert.equal(record.errors.length,0);assert.equal(await page.locator('vite-error-overlay').count(),0);assert.ok((await page.title()).length>0);assert.ok(record.apiCalls.every(name=>['/api/public-config','/api/members/account'].includes(name)));check('nonblank page identity, no framework/runtime errors and no AI/payment API requests');
  } catch(error) {record.failure=error.stack;console.error(error.stack);process.exitCode=1;await page.screenshot({path:path.join(run,'failure.png'),fullPage:true}).catch(()=>{});}
  finally{await context.close();receipt.completedAt=new Date().toISOString();await writeFile(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');}
 }
 await browser.close();
}
receipt.sourceFilesAtEnd = {};
for (const name of files) receipt.sourceFilesAtEnd[name] = createHash('sha256').update(await readFile(name)).digest('hex');
receipt.changedSourceFilesDuringRun = files.filter(name => receipt.sourceFiles[name] !== receipt.sourceFilesAtEnd[name]);
await writeFile(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
