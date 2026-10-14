import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.SHOWCASE_BASE||'http://127.0.0.1:5178';
const out=process.env.SHOWCASE_EVIDENCE||'artifacts/showcase/browser-local';
await mkdir(out,{recursive:true});
const records=[];
const browser=await chromium.launch({headless:true,args:['--disable-gpu'],timeout:60000});
async function download(page,button,name){const waiting=page.waitForEvent('download');await button.click();const item=await waiting;await item.saveAs(path.resolve(out,name));return path.resolve(out,name);}
for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true,reducedMotion:width===390?'reduce':'no-preference'});
 const page=await context.newPage();page.setDefaultTimeout(20000);
 const record={width,base,checks:[],errors:[],console:[],started:new Date().toISOString()};records.push(record);
 page.on('pageerror',e=>record.errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))record.console.push({type:m.type(),text:m.text()});});
 page.on('dialog',d=>d.accept());
 const check=name=>{record.checks.push(name);console.log(width+': PASS '+name);};
 const panels=async tools=>{const nav=page.getByRole('navigation',{name:'Studio panels'});if(await nav.isVisible())await nav.getByRole('button',{name:tools?'Project & tools':'Canvas',exact:true}).click();};
 const read=()=>page.evaluate(()=>window.eidosPlayground.read());
 const studio=async value=>{await page.getByLabel('Studio',{exact:true}).selectOption(value);await page.locator('.studio-app').waitFor();};
 try{
  await page.goto(base+'/playground/',{waitUntil:'domcontentloaded'});await page.getByLabel('Studio',{exact:true}).waitFor();
  await studio('effect');await page.getByLabel('Effect preset',{exact:true}).selectOption('Soft frost');
  const frost=page.getByRole('slider',{name:'Frost',exact:true});assert.equal(await frost.inputValue(),'12');
  await frost.scrollIntoViewIfNeeded();if(await page.getByRole('button',{name:'Dismiss message',exact:true}).count())await page.getByRole('button',{name:'Dismiss message',exact:true}).click();const box=await frost.boundingBox();await page.mouse.move(box.x+box.width*.75,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width*.35,box.y+box.height/2,{steps:4});await page.waitForTimeout(1100);await page.mouse.move(box.x+box.width*.5,box.y+box.height/2,{steps:4});await page.mouse.up();
  assert.notEqual(await frost.inputValue(),'12');await page.getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await frost.inputValue(),'12');
  check('effect preset and long continuous gesture undo');
  await panels(true);await page.getByLabel('Variation name',{exact:true}).fill('Frost saved');await page.getByRole('button',{name:'Save variation',exact:true}).click();await page.getByRole('button',{name:'Save locally',exact:true}).click();await page.locator('.studio-save').filter({hasText:'Saved on this device'}).waitFor();
  const jsonPath=await download(page,page.getByRole('button',{name:'Download project JSON',exact:true}),`${width}-project.json`);const source=JSON.parse(await readFile(jsonPath,'utf8'));assert.equal(source.glass.frost,12);assert.equal(source.schemaVersion,5);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('.studio-app').waitFor();await panels(false);assert.equal(await page.getByRole('slider',{name:'Frost',exact:true}).inputValue(),'12');check('save transaction, full JSON download, reload/reopen');
  await panels(true);await page.getByText('Bounded editing & local tools',{exact:true}).click();const before=await read();
  await page.getByLabel('Command value',{exact:true}).fill('A bounded change.');await page.getByRole('button',{name:'Apply requested change',exact:true}).click();assert.equal((await read()).project.sections[1].title,'A bounded change.');
  const stale=await page.evaluate(old=>{try{window.eidosPlayground.apply({documentId:old.documentId,revision:old.revision,selected:'hero',scope:'section',proposal:{ops:[{field:'section.title',value:'Obsolete'}]}});return 'accepted';}catch(e){return e.message;}},before);assert.match(stale,/Stale/);await page.getByRole('button',{name:'Undo',exact:true}).click();assert.equal((await read()).project.sections[1].title,before.project.sections[1].title);check('bounded command, shared undo and stale reply refusal');
  await page.getByLabel('Import studio project',{exact:true}).setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":999}')});await page.locator('.studio-notice').filter({hasText:'different Playground version'}).waitFor();assert.equal((await read()).project.glass.frost,12);check('invalid import retains open document');
  await page.getByLabel('Import studio project',{exact:true}).setInputFiles(jsonPath);await page.locator('.studio-notice').filter({hasText:'Project reopened'}).waitFor();await panels(false);
  await page.screenshot({path:path.resolve(out,`${width}-effect.png`),fullPage:false});
  await download(page,page.getByRole('button',{name:'Export page',exact:true}),`${width}-effect.zip`);check('actual standalone effect ZIP');
  await studio('artwork');await page.getByRole('button',{name:'botanical poster',exact:true}).click();
  const artBefore=(await read()).project.studios.artwork;const linked=artBefore.palette.ink;
  const ink=page.getByLabel('Ink palette',{exact:true});await ink.fill('#204060');await ink.dispatchEvent('input');assert.equal((await read()).project.studios.artwork.palette.ink,'#204060');
  await page.getByLabel('Color source',{exact:true}).selectOption('override');await page.getByLabel('Object color override',{exact:true}).fill('#c84629');assert.ok((await read()).project.studios.artwork.objects.some(o=>o.color==='#c84629'));
  const count=(await read()).project.studios.artwork.objects.length;await page.getByRole('button',{name:'Duplicate',exact:true}).click();assert.equal((await read()).project.studios.artwork.objects.length,count+1);await page.getByRole('button',{name:'Layer back',exact:true}).click();
  await page.getByRole('button',{name:'Repeat proof',exact:true}).click();await page.getByRole('button',{name:'Objects',exact:true}).click();await page.getByRole('button',{name:'Design',exact:true}).click();
  const aPath=await download(page,page.getByRole('button',{name:'Export artwork',exact:true}),`${width}-artwork.zip`);assert.ok(aPath);await download(page,page.getByRole('button',{name:'PNG',exact:true}),`${width}-artwork.png`);
  await page.getByRole('button',{name:'Save locally',exact:true}).click();await page.locator('.studio-save').filter({hasText:'Saved on this device'}).waitFor();await page.reload({waitUntil:'domcontentloaded'});await page.locator('.pg-artwork').waitFor();assert.equal((await read()).project.studios.artwork.objects.length,count+1);check('artwork linked/override colors, duplicate/layer, synchronized views, PNG/ZIP save/reopen');
  await page.screenshot({path:path.resolve(out,`${width}-artwork-editor.png`),fullPage:false});
  await studio('layout');await page.getByRole('button',{name:'responsive',exact:true}).click();assert.equal(await page.locator('iframe[title="Your page preview"]').count(),2);check('layout shares desktop/phone document');
  await page.screenshot({path:path.resolve(out,`${width}-layout.png`),fullPage:false});
  await studio('motion');await page.locator('.pg-motion').waitFor();await download(page,page.getByRole('button',{name:'Export animation',exact:true}),`${width}-motion.zip`);await page.getByRole('button',{name:'Save locally',exact:true}).click();await page.locator('.studio-save').filter({hasText:'Saved on this device'}).waitFor();await page.reload({waitUntil:'domcontentloaded'});await page.locator('.pg-motion').waitFor();check('motion animation download and save/reopen');
  await page.screenshot({path:path.resolve(out,`${width}-motion.png`),fullPage:false});
  assert.equal(await page.locator('vite-error-overlay').count(),0);assert.equal(record.errors.length,0);assert.ok(await page.title());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);check('nonblank identity, no overlay/errors/horizontal overflow with GPU disabled');
 }catch(e){record.failure=e.stack;console.error(width+': FAIL '+e.message);await page.screenshot({path:path.resolve(out,`${width}-failure.png`),fullPage:false}).catch(()=>{});}
 finally{record.finished=new Date().toISOString();await context.close();await writeFile(path.resolve(out,'receipt.json'),JSON.stringify({timestamp:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:'Chromium headless; GPU disabled',records},null,2));}
}
await browser.close();if(records.some(r=>r.failure))process.exitCode=1;
