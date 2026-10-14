import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.PG_BASE_URL||'http://127.0.0.1:5184';
const out=process.env.PG_EVIDENCE_DIR||'artifacts/playground-unified/browser-local';
await mkdir(out,{recursive:true});
const engines=(process.env.PG_ENGINES||'chromium').split(','),records=[];
for(const engine of engines){
const browser=await pw[engine].launch({headless:true,...(engine==='chromium'?{args:['--disable-gpu']}:{})});
for(const width of [1440,390]) {
 const runOut=engines.length>1?path.join(out,engine):out;await mkdir(runOut,{recursive:true});
 const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true,reducedMotion:width===390?'reduce':'no-preference'});
 const page=await context.newPage();page.setDefaultTimeout(20000);const record={engine,width,checks:[],errors:[],console:[]};records.push(record);
 page.on('pageerror',e=>record.errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))record.console.push({type:m.type(),text:m.text()});});page.on('dialog',d=>d.accept());
 const check=name=>{record.checks.push(name);console.log(width+': PASS '+name);};
 const panel=async name=>{const nav=page.getByRole('navigation',{name:'Workspace panels'});if(await nav.isVisible())await nav.getByRole('button',{name,exact:true}).click();};
 const tool=async name=>{await panel('Build');await page.getByRole('navigation',{name:'Build tools'}).getByRole('button',{name,exact:true}).click();};
 const saved=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const req=indexedDB.open('eidos-playground-v1',1);req.onsuccess=()=>{const db=req.result;const read=db.transaction('workspace').objectStore('workspace').get('current');read.onsuccess=()=>{db.close();resolve(read.result??null);};read.onerror=()=>reject(read.error);};req.onerror=()=>reject(req.error);}));
 const save=async()=>{await page.locator('.pg-save-inline').click();await page.waitForFunction(()=>document.querySelector('.pg-save-inline')?.textContent.includes('Saved on this device'));return saved();};
 try {
  await page.goto(base+'/playground/',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'What are you making?'}).waitFor();
  assert.equal(await saved(),null);assert.equal(await page.getByRole('button',{name:/Continue project/}).count(),0);check('clean start does not save or silently open a default project');
  await page.screenshot({path:path.resolve(runOut,`${width}-start.png`),fullPage:true});
  await page.getByLabel('What should a visitor do?').selectOption('estimate');
  await page.getByRole('button',{name:/Switchboard/}).click();await page.getByLabel('Business or project name').fill('Harbor Studio');await page.getByLabel('Your offer, in a few words').fill('A clear plan for your next project.');await page.getByRole('button',{name:/Create project/}).click();await page.locator('.pg-unified').waitFor();
  const frame=page.frameLocator('iframe[title="Your page preview"]');await panel('Canvas');const heading=frame.locator('[data-node-type="heading"] [data-node-text]').first();await heading.waitFor();
  await heading.dblclick({position:{x:20,y:20}});await page.keyboard.insertText('A thoughtful place to begin.');await page.keyboard.press('Enter');await heading.filter({hasText:'A thoughtful place to begin.'}).waitFor();check('goal and starter create real page; inline headline editing');
  const first=await save();record.documentId=first.documentId;const hero=first.project.sections.find(s=>s.authoring),headingId=hero.authoring.root.children[0].children[0].id;
  await tool('Assets');
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=160;c.height=100;const ctx=c.getContext('2d');ctx.fillStyle='#53715d';ctx.fillRect(0,0,160,100);ctx.fillStyle='#e5e0c8';ctx.fillRect(30,20,100,60);return c.toDataURL('image/png').split(',')[1];});
  await page.getByLabel('Upload image to page').setInputFiles({name:'garden-study.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.getByRole('status').filter({hasText:'Image added to your page'}).waitFor();
  await panel('Edit selection');await page.getByLabel('Move to container',{exact:true}).selectOption(hero.authoring.root.id);await page.getByRole('button',{name:'Move here',exact:true}).click();
  const size=page.getByLabel(/^Width \(%\)/);await size.fill('65');await size.blur();const moved=await save();const placed=moved.project.sections.find(s=>s.id===hero.id).authoring.root.children.at(-1);assert.equal(placed.media.sourceName,'garden-study.png');assert.equal(width===390?placed.mobile.width:placed.width,65);check('uploaded image moves into columns and resizes through click/keyboard controls');
  await page.getByRole('button',{name:'Brand',exact:true}).first().click();await page.getByLabel('Business name',{exact:true}).fill('Harbor & Field');await page.getByLabel('Accent color',{exact:true}).fill('#c0df78');await page.getByLabel('Accent color',{exact:true}).dispatchEvent('input');const branded=await save();assert.equal(branded.project.brand.businessName,'Harbor & Field');assert.equal(branded.project.tokens.accent,'#c0df78');check('global brand updates shared project');
  await tool('Layers');await page.getByRole('button',{name:'Move Services down',exact:true}).click();const reordered=await save();assert.notDeepEqual(reordered.project.sections.map(s=>s.id),branded.project.sections.map(s=>s.id));await page.getByRole('button',{name:'Undo',exact:true}).click();const undone=await save();assert.deepEqual(undone.project.sections.map(s=>s.id),branded.project.sections.map(s=>s.id));await page.getByRole('button',{name:'Redo',exact:true}).click();const redone=await save();assert.deepEqual(redone.project,reordered.project);check('section reorder and exact shared Undo/Redo');
  await page.getByRole('button',{name:'Mobile',exact:true}).first().click();await panel('Canvas');await page.screenshot({path:path.resolve(runOut,`${width}-mobile-canvas.png`)});
  await page.getByRole('button',{name:'Desktop',exact:true}).click();await panel('Canvas');await page.screenshot({path:path.resolve(runOut,`${width}-editor.png`)});
  const beforeReload=await save();await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Continue project/}).click();await page.locator('.pg-unified').waitFor();const reopened=await save();assert.equal(reopened.documentId,beforeReload.documentId);assert.deepEqual(reopened.project,beforeReload.project);assert.deepEqual(reopened.editor,beforeReload.editor);check('reload explicitly continues exact content, IDs, assets and selection');
  await tool('Project');await page.getByLabel('Import project',{exact:true}).setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":999}')});await page.locator('.pg-toast').waitFor();assert.deepEqual((await save()).project,reopened.project);check('invalid import preserves current work');
  await page.getByRole('button',{name:'Finish',exact:true}).click();await page.getByRole('button',{name:'Prepare current draft',exact:true}).click();await page.getByLabel('I reviewed this frozen version for my local download.',{exact:true}).check();const wait=page.waitForEvent('download');await page.getByRole('button',{name:'Download page package',exact:true}).click();const download=await wait;const zip=path.resolve(runOut,`${width}-page.zip`);await download.saveAs(zip);record.exportZip=zip;check('Finish freezes and downloads actual standalone page ZIP');
  const bytes=await readFile(zip), extracted=path.resolve(runOut,`${width}-independent`);await mkdir(extracted,{recursive:true});let offset=0;
  while(bytes.readUInt32LE(offset)===0x04034b50){assert.equal(bytes.readUInt16LE(offset+8),0);const size=bytes.readUInt32LE(offset+18),nameLength=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28);const name=bytes.subarray(offset+30,offset+30+nameLength).toString();assert.ok(!name.includes('..')&&!path.isAbsolute(name));const start=offset+30+nameLength+extra;const destination=path.join(extracted,name);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,bytes.subarray(start,start+size));offset=start+size;}
  assert.deepEqual(JSON.parse(await readFile(path.join(extracted,'project.json'),'utf8')),reopened.project);
  const independent=await context.newPage();await independent.goto(pathToFileURL(path.join(extracted,'index.html')).href);await independent.getByRole('heading',{name:'A thoughtful place to begin.'}).waitFor();assert.equal(await independent.locator('.pg-node-toolbar').count(),0);await independent.screenshot({path:path.resolve(runOut,`${width}-independent-export.png`),fullPage:true});assert.ok(await independent.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)));await independent.close();check('extracted output opens independently with exact editable project and all images');
  assert.equal(await page.locator('vite-error-overlay').count(),0);assert.equal(record.errors.length,0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);record.title=await page.title();record.url=page.url();check('page identity, no blank/overlay/runtime error/horizontal overflow');
 } catch(e) {record.failure=e.stack;console.error(engine+' '+width+': FAIL '+e.message);await page.screenshot({path:path.resolve(runOut,`${width}-failure.png`),fullPage:true}).catch(()=>{});}
 finally {await context.close();await writeFile(out+'/receipt.json',JSON.stringify({timestamp:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTreeDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),base,browser:'Headless browsers; Chromium GPU disabled; viewport emulation is not physical-device evidence',records},null,2)+'\n');}
}
await browser.close();
}
if(records.some(r=>r.failure))process.exitCode=1;
