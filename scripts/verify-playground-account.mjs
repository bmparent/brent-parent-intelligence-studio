import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {launchOptions} from './playground-local-browser-guard.mjs';
import {createProject} from '../src/playground/model.ts';
const pw=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.PG_ACCOUNT_URL||'http://127.0.0.1:4173/playground/';
const out=process.env.PG_ACCOUNT_EVIDENCE||tmpdir()+'/eidos-playground-account';
await mkdir(out,{recursive:true});
const receipt={base,environment:'Isolated Chromium; controlled local account responses; no real identity/provider/cloud acceptance',checks:[],errors:[],forbidden:[]};
const browser=await pw.chromium.launch(launchOptions('chromium'));
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
let member=null,capability='missing',posts=0,availableProject=false;
await context.route('**/*',async route=>{
 const req=route.request(),url=new URL(req.url());
 if(url.origin!==new URL(base).origin){if(['data:','blob:','about:'].includes(url.protocol))return route.continue();return route.abort();}
 const fulfill=value=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
 if(url.pathname==='/api/public-config')return fulfill({accountsReady:true,passwordsReady:true,googleReady:true,localTest:true,aiReady:false,shopReady:false,turnstileSiteKey:''});
 if(url.pathname==='/api/members/account')return fulfill({member});
 if(url.pathname==='/api/members/credentials'&&req.method()==='POST'){assert.equal(req.postDataJSON().action,'login');member={username:'local_qa',kind:'person'};return fulfill({member});}
 if(url.pathname==='/api/members/auth'&&req.method()==='POST'){assert.equal(req.postDataJSON().action,'logout');member=null;return fulfill({ok:true});}
 if(url.pathname==='/api/playground/projects'&&req.method()==='GET'){
  if(url.searchParams.has('id'))return fulfill({ownerId:'fixture-owner',document:{...createProject(),name:'Resume from account'},head:'fixture-head'});
  return fulfill(capability==='missing'?{projects:[]}:{ownerId:'fixture-owner',projects:availableProject?[{id:'fixture-project',name:'Resume from account',head:'fixture-head'}]:[],resumeProtocol:1,resumeSaveEnabled:capability==='enabled',newFormatSaveEnabled:false,storage:{imageBytes:0,imageLimit:40000000,documentBytes:0,documentLimit:20000000}});
 }
 if(url.pathname.startsWith('/api/')){posts++;receipt.forbidden.push(req.method()+' '+url.pathname);return route.abort();}
 return route.continue();
});
page.on('pageerror',error=>receipt.errors.push(error.message));
page.on('dialog',dialog=>dialog.accept());
const entry=()=>page.getByRole('button',{name:'Account / Sign in',exact:true});
const modal=()=>page.getByRole('dialog',{name:'Your account',exact:true});
async function check(name,run){await run();receipt.checks.push(name);console.log('PASS '+name);}
try{
 await page.goto(base);await page.getByRole('heading',{name:'What are you making?'}).waitFor();
 await check('start-screen account is keyboard reachable and Escape returns focus',async()=>{await entry().focus();await page.keyboard.press('Enter');await modal().waitFor();assert.equal(await modal().getByRole('button',{name:'Back to Playground'}).evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Escape');assert.equal(await entry().evaluate(el=>el===document.activeElement),true);});
 await check('an empty device can resume an account project without saving an unexplained starter',async()=>{
  member={username:'local_qa',kind:'person'};capability='disabled';availableProject=true;await entry().click();await modal().getByRole('button',{name:'Check sign-in again'}).click();await modal().getByText('Signed in as @local_qa',{exact:true}).waitFor();await modal().getByText('Account projects',{exact:true}).click();await modal().getByRole('button',{name:'Refresh account projects'}).click();await modal().getByRole('button',{name:'Resume from account',exact:true}).waitFor();assert.equal(await modal().getByRole('button',{name:'Import into my account'}).isDisabled(),true);
  await modal().getByRole('button',{name:'Resume from account',exact:true}).click();await modal().getByText(/Project opened. Undo restores/).waitFor();await modal().getByRole('button',{name:'Sign out',exact:true}).click();await modal().getByRole('heading',{name:'Create account',exact:true}).waitFor();await modal().getByRole('button',{name:'Back to Playground'}).click();assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),'Resume from account');assert.equal(await entry().evaluate(el=>el===document.activeElement),true);availableProject=false;capability='missing';await page.getByRole('button',{name:'Back to projects',exact:true}).click();
 });
 await page.getByRole('button',{name:/Switchboard/}).click();await page.getByRole('textbox',{name:'Business or project name'}).fill('Account regression project');await page.getByRole('button',{name:'Create project',exact:true}).click();
 await page.getByRole('textbox',{name:'Project name',exact:true}).fill('Edited before sign-in');await page.locator('.pg-save-inline').filter({hasText:'Saved on this device'}).waitFor();
 await check('password sign-in keeps local project and Undo history',async()=>{await entry().click();await modal().getByRole('button',{name:'Sign in',exact:true}).click();await modal().getByRole('textbox',{name:'Username or email'}).fill('local_qa');await modal().getByLabel('Password',{exact:true}).fill('local-only-fixture-password');await modal().getByRole('button',{name:'Sign in',exact:true}).click();await modal().getByText('Signed in as @local_qa',{exact:true}).waitFor();await modal().getByRole('button',{name:'Back to Playground'}).click();assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),'Edited before sign-in');assert.equal(await page.getByRole('button',{name:'Undo',exact:true}).isEnabled(),true);});
 await check('missing owner and disabled resume capabilities fail closed without writes',async()=>{await entry().click();await modal().getByText('Account projects',{exact:true}).click();await modal().getByRole('button',{name:'Refresh account projects'}).click();await modal().getByText(/matching Playground update/).waitFor();assert.equal(await modal().getByRole('button',{name:'Import into my account'}).isDisabled(),true);capability='disabled';await modal().getByRole('button',{name:'Refresh account projects'}).click();await modal().getByText('Project list refreshed.',{exact:true}).waitFor();assert.equal(await modal().getByRole('button',{name:'Import into my account'}).isDisabled(),true);assert.equal(posts,0);});
 await check('session changes clear capability without losing the project',async()=>{capability='enabled';await modal().getByRole('button',{name:'Refresh account projects'}).click();await modal().getByRole('button',{name:'Import into my account'}).and(page.locator(':enabled')).waitFor();await modal().getByRole('button',{name:'Sign out',exact:true}).click();await modal().getByRole('heading',{name:'Create account',exact:true}).waitFor();await modal().getByRole('button',{name:'Back to Playground'}).click();assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),'Edited before sign-in');await page.getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),'Account regression project');await page.getByRole('button',{name:'Redo',exact:true}).click();});
 await check('desktop and 390px account entry/dialog fit and return keyboard focus',async()=>{for(const width of [1440,390]){await page.setViewportSize({width,height:900});const box=await entry().boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1,'entry within viewport');await entry().click();await modal().waitFor();const dialog=await modal().boundingBox();assert.ok(dialog&&dialog.x>=0&&dialog.x+dialog.width<=width+1,'dialog within viewport');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:out+'/account-'+width+'.png'});await page.keyboard.press('Escape');assert.equal(await entry().evaluate(el=>el===document.activeElement),true);}});
 await check('failed device saving offers backup before separate-tab Google sign-in',async()=>{
  await page.evaluate(()=>{const transaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){if(args[1]==='readwrite')throw new DOMException('Injected write failure','QuotaExceededError');return transaction.apply(this,args);};});
  await page.getByRole('textbox',{name:'Project name',exact:true}).fill('Unsaved before Google');await page.getByRole('region',{name:'Project recovery'}).getByRole('alert').waitFor();await entry().click();
  await modal().getByRole('button',{name:'Continue with Google in a new tab',exact:true}).click();await modal().getByRole('region',{name:'Keep your work before sign-in'}).waitFor();
  const downloaded=page.waitForEvent('download'),newTab=context.waitForEvent('page');await modal().getByRole('button',{name:'Download backup and open sign-in'}).click();assert.equal((await downloaded).suggestedFilename(),'project.json');const tab=await newTab;await tab.waitForURL('**/account/');await tab.close();
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('textbox',{name:'Project name',exact:true}).inputValue(),'Unsaved before Google');assert.equal(await page.getByRole('button',{name:'Undo',exact:true}).isEnabled(),true);
 });
 assert.deepEqual(receipt.errors,[]);assert.deepEqual(receipt.forbidden,[]);assert.equal(await page.locator('vite-error-overlay').count(),0);assert.match(await page.title(),/Playground/);
}catch(error){receipt.error=error.message;process.exitCode=1;await page.screenshot({path:out+'/failure.png'});}
finally{await browser.close();receipt.timestamp=new Date().toISOString();await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));}
