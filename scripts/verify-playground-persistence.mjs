import { launchOptions, guardLocalEditor, readLocalZip } from './playground-local-browser-guard.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createProject,upgradeProject} from '../src/playground/model.ts';
import {enableComposition} from '../src/playground/composition.ts';
import {enableBlocks} from '../src/playground/authoring.ts';
const require=createRequire(import.meta.url), pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.PG_PERSISTENCE_URL||'http://127.0.0.1:4173/playground/';
const out=process.env.PG_PERSISTENCE_EVIDENCE||'artifacts/playground-unified/persistence';
await mkdir(out,{recursive:true});
const receipt={kind:(process.env.PG_ENGINE||'chromium')+' desktop browser; local candidate; no provider/cloud/payment acceptance',base,checks:[],failures:[],consoleErrors:[]};
const engine=process.env.PG_ENGINE||'chromium';
const browser=await pw[engine].launch(launchOptions(engine));
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}), page=await context.newPage();
page.on('pageerror',error=>receipt.consoleErrors.push(error.message));
page.on('dialog',dialog=>dialog.accept());
const read=(key='current')=>page.evaluate(async key=>new Promise((resolve,reject)=>{const open=indexedDB.open('eidos-playground-v1',1);open.onupgradeneeded=()=>open.result.createObjectStore('workspace');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,request=db.transaction('workspace').objectStore('workspace').get(key);request.onsuccess=()=>{resolve(request.result??null);db.close();};request.onerror=()=>reject(request.error);};}),key);
const seed=value=>page.evaluate(async value=>new Promise((resolve,reject)=>{const open=indexedDB.open('eidos-playground-v1',1);open.onupgradeneeded=()=>open.result.createObjectStore('workspace');open.onsuccess=()=>{const db=open.result,tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(value,'current');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}),value);
const put=(key,value)=>page.evaluate(async ({key,value})=>new Promise((resolve,reject)=>{const open=indexedDB.open('eidos-playground-v1',1);open.onsuccess=()=>{const db=open.result,tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(value,key);tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>reject(tx.error);};}),{key,value});
const recovery=()=>page.evaluate(async()=>new Promise((resolve,reject)=>{const open=indexedDB.open('eidos-playground-v1',1);open.onsuccess=()=>{const db=open.result,request=db.transaction('workspace').objectStore('workspace').getAll(IDBKeyRange.bound('recovery:','recovery:\uffff'));request.onsuccess=()=>{db.close();resolve(request.result);};request.onerror=()=>reject(request.error);};}));
const downloadedBytes=async download=>{const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);return Buffer.concat(chunks);};
const saved=async()=>{await page.locator('.pg-save-inline').filter({hasText:'Saved on this device'}).waitFor({timeout:15000});return read();};
async function check(name,run){try{await run();receipt.checks.push(name);console.log('PASS '+name);}catch(error){receipt.failures.push({name,error:error.message});await page.screenshot({path:out+'/failure-'+receipt.failures.length+'.png',fullPage:true});throw error;}}
try {
  const assertLocalOnly = await guardLocalEditor(page);await page.goto(base);await page.getByRole('heading',{name:'What are you making?'}).waitFor();
  await check('clean visit writes no unexplained starter',async()=>{await page.waitForTimeout(800);assert.equal(await read(),null);assert.equal(await page.getByRole('button',{name:/Continue project/}).count(),0);});
  const fixtures=[createProject(),upgradeProject(createProject()),enableComposition(createProject()),enableBlocks(createProject())];
  for(const project of fixtures){
    project.name='Legacy '+project.schemaVersion;
    await check(`legacy schema ${project.schemaVersion} saved envelope opens and gets stable identity`,async()=>{
      await seed({project,snapshots:[]});await page.reload();await page.getByRole('button',{name:/Continue project/}).click();
      await page.getByRole('textbox',{name:'Project name',exact:true}).waitFor();assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),project.name);
      const first=await saved();assert.equal(first.project.schemaVersion,project.schemaVersion);assert.ok(first.documentId);assert.equal(first.editor.pageId,'page-main');
      await page.reload();await page.getByRole('button',{name:/Continue project/}).click();const next=await saved();assert.equal(next.documentId,first.documentId);assert.deepEqual(next.project,first.project);
    });
    await check(`legacy schema ${project.schemaVersion} file import preserves validator and history`,async()=>{
      await page.getByRole('button',{name:'Project',exact:true}).click();
      await page.locator(".pg-project-tools input[accept='.json,application/json']").setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
      await page.locator('.pg-toast').filter({hasText:'Project imported. Undo restores your previous design.'}).waitFor();
      const imported=await saved();assert.equal(imported.project.schemaVersion,project.schemaVersion);assert.equal(imported.project.name,project.name);
      await page.getByRole('button',{name:'Undo',exact:true}).click();await saved();
    });
  }
  await check('invalid imported JSON leaves project, identity and revision unchanged',async()=>{
    const before=await saved();await page.getByRole('button',{name:'Project',exact:true}).click();
    await page.locator(".pg-project-tools input[accept='.json,application/json']").setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":99}')});
    await page.getByText(/This project needs a different Playground version/).waitFor();await page.waitForTimeout(450);
    const after=await read();assert.deepEqual(after.project,before.project);assert.equal(after.documentId,before.documentId);assert.equal(after.revision,before.revision);
  });
  let previous;
  await check('explicit new project preserves previous editable document and assets',async()=>{
    previous=await saved();await page.getByRole('button',{name:'Back to projects',exact:true}).click();
    await page.getByRole('button',{name:/Switchboard/}).click();await page.getByRole('textbox',{name:'Business or project name'}).fill('Second project');
    await page.getByRole('button',{name:'Create project'}).click();await page.getByRole('textbox',{name:'Project name',exact:true}).waitFor();
    const next=await saved();assert.notEqual(next.documentId,previous.documentId);assert.equal(next.project.name,'Second project');assert.deepEqual((await read('project:'+previous.documentId)).project,previous.project);
    assert.ok(next.project.sections[1].authoring.root.children.some(n=>n.type==='image'&&n.image.startsWith('data:image/webp;')));
  });
  await check('delayed saved-project read cannot overwrite continued manual edits',async()=>{
    await page.getByRole('button',{name:'Back to projects',exact:true}).click();
    await page.evaluate(id=>{const get=IDBObjectStore.prototype.get;IDBObjectStore.prototype.get=function(key){const request=get.call(this,key);if(key==='project:'+id){request.addEventListener('success',event=>{event.stopImmediatePropagation();window.releaseSavedRead=()=>request.dispatchEvent(new Event('success'));},{once:true});}return request;};},previous.documentId);
    await page.getByText('Other projects saved on this device',{exact:true}).click();
    await page.locator('.pg-start-saved li').filter({has:page.getByText(previous.project.name,{exact:true})}).first().getByRole('button',{name:'Open project'}).click();
    await page.waitForFunction(()=>typeof window.releaseSavedRead==='function');
    await page.getByRole('button',{name:/Continue project/}).click();
    await page.getByRole('textbox',{name:'Project name',exact:true}).fill('Continued manual work');
    await page.evaluate(()=>window.releaseSavedRead());const current=await saved();assert.equal(current.project.name,'Continued manual work');assert.notEqual(current.documentId,previous.documentId);
    await page.reload();await page.getByRole('button',{name:/Continue project/}).click();assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),'Continued manual work');
  });
  await check('one malformed catalogue item and a missing date do not hide valid work',async()=>{
    const before=await saved();await put('summary:malformed',null);await put('summary:undated',{documentId:'undated',name:'Undated project',savedAt:null});
    await page.reload();await page.getByRole('button',{name:/Continue project/}).click();
    assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),before.project.name);
    await page.getByRole('region',{name:'Project recovery'}).waitFor();assert.equal(await read('summary:malformed'),null);
    await page.getByRole('textbox',{name:'Project name',exact:true}).fill('Valid work still saves');assert.equal((await saved()).project.name,'Valid work still saves');
  });
  await check('a malformed variation leaves valid variations editable and archives the exact original',async()=>{
    const before=await saved(),raw={...before,snapshots:[{id:'good',name:'Good variation',project:before.project,savedAt:''},null,{project:{schemaVersion:999},marker:'keep-variation'}]};
    await seed(raw);await page.reload();await page.getByRole('button',{name:/Continue project/}).click();
    const next=await saved();assert.equal(next.snapshots.length,1);assert.equal(next.snapshots[0].name,'Good variation');
    assert.ok((await recovery()).some(record=>record.key==='current'&&JSON.stringify(record.raw)===JSON.stringify(raw)));
  });
  await check('unreadable current data remains recoverable before and after starting fresh and reload',async()=>{
    const raw={project:{schemaVersion:999},marker:'raw-current-preserved',snapshots:[null]};await seed(raw);await page.reload();
    await page.getByRole('button',{name:'Download recovery data'}).waitFor();assert.equal(await page.getByRole('button',{name:/Continue project/}).count(),0);
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download recovery data'}).click();const backup=JSON.parse((await downloadedBytes(await pending)).toString());
    assert.ok(backup.records.some(record=>record.key==='current'&&record.raw.marker===raw.marker));
    await page.getByRole('button',{name:/Switchboard/}).click();await page.getByRole('button',{name:'Skip details',exact:true}).click();await saved();
    assert.ok((await recovery()).some(record=>record.raw?.marker===raw.marker));
    await page.reload();await page.getByRole('button',{name:/Continue project/}).click();await saved();await page.getByRole('button',{name:'Download recovery data'}).waitFor();
  });
  await check('write failure, account cancel, backup and retry preserve unsaved edits and Undo',async()=>{
    const before=await saved();await page.evaluate(()=>{const transaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){if(args[1]==='readwrite'&&window.failDeviceWrites)throw new DOMException('Injected quota failure','QuotaExceededError');return transaction.apply(this,args);};window.failDeviceWrites=true;});
    await page.getByRole('textbox',{name:'Project name',exact:true}).fill('Keep unsaved customer work');await page.getByRole('region',{name:'Project recovery'}).getByRole('alert').waitFor();assert.equal((await read()).project.name,before.project.name);
    await page.getByRole('button',{name:'Account / Sign in',exact:true}).click();await page.getByRole('dialog',{name:'Your account',exact:true}).waitFor();await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),'Keep unsaved customer work');assert.equal(await page.getByRole('button',{name:'Undo',exact:true}).isEnabled(),true);
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download project backup'}).click();assert.equal(JSON.parse((await downloadedBytes(await pending)).toString()).name,'Keep unsaved customer work');
    await page.getByRole('button',{name:'Retry device saving'}).click();await page.getByRole('region',{name:'Project recovery'}).getByRole('alert').waitFor();
    await page.evaluate(()=>{window.failDeviceWrites=false;});await page.getByRole('button',{name:'Retry device saving'}).click();assert.equal((await saved()).project.name,'Keep unsaved customer work');
    assert.equal(await page.getByRole('region',{name:'Project recovery'}).getByRole('alert').count(),0);
  });
  await check('IndexedDB read failure retries the real saved project without writing a default',async()=>{
    const before=await saved();await page.addInitScript(()=>{const open=IDBFactory.prototype.open;IDBFactory.prototype.open=function(...args){let fail=false;try{fail=sessionStorage.getItem('pg-fail-open')==='1';}catch{}if(fail)throw new DOMException('Injected open failure','SecurityError');return open.apply(this,args);};});
    await page.evaluate(()=>sessionStorage.setItem('pg-fail-open','1'));await page.reload();await page.getByRole('button',{name:'Retry device saving'}).waitFor();assert.equal(await page.getByRole('button',{name:/Continue project/}).count(),0);
    await page.evaluate(()=>sessionStorage.removeItem('pg-fail-open'));await page.getByRole('button',{name:'Retry device saving'}).click();await page.getByRole('button',{name:/Continue project/}).click();assert.equal((await saved()).documentId,before.documentId);
  });
  await check('asset-only ZIP contains unique image bytes and no project or page files',async()=>{
    await page.getByRole('button',{name:'Assets',exact:true}).click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download images & logos'}).click();
    const files=readLocalZip(await downloadedBytes(await pending));assert.ok(files.length);assert.ok(files.every(file=>/^assets\/image-\d+\.(png|jpg|webp)$/.test(file.name)));assert.equal(new Set(files.map(file=>file.data.toString('base64'))).size,files.length);
  });
  await assertLocalOnly();await check('no app runtime errors or framework overlay',async()=>{assert.deepEqual(receipt.consoleErrors,[]);assert.equal(await page.locator('vite-error-overlay').count(),0);});
  await page.screenshot({path:out+'/continued-project.png',fullPage:true});
}catch(error){receipt.error=error.message;process.exitCode=1;}
finally{await browser.close();receipt.timestamp=new Date().toISOString();await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));}
