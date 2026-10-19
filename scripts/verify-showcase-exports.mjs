import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.env.SHOWCASE_EVIDENCE||'artifacts/showcase/browser-local');
const results=[];
const browser=await chromium.launch({headless:true,args:['--disable-gpu']});
async function extract(file,dir){
 const bytes=await readFile(file);let offset=0;const names=[];
 while(bytes.readUInt32LE(offset)===0x04034b50){
  assert.equal(bytes.readUInt16LE(offset+8),0,'independent reader supports ZIP STORE');
  const size=bytes.readUInt32LE(offset+18),length=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.toString('utf8',offset+30,offset+30+length);
  assert.ok(!path.isAbsolute(name)&&!name.split(/[\\/]/).includes('..'),'safe archive path');
  const target=path.join(dir,name);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes.subarray(offset+30+length+extra,offset+30+length+extra+size));names.push(name);offset+=30+length+extra+size;
 }return names;
}
for(const kind of ['effect','artwork','motion']){
 const dir=path.join(root,'independent-'+kind),names=await extract(path.join(root,'1440-'+kind+'.zip'),dir);
 assert.ok(names.includes('project.json'));const source=JSON.parse(await readFile(path.join(dir,'project.json'),'utf8'));assert.equal(source.schemaVersion,5);
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto(pathToFileURL(path.join(dir,'index.html')).href,{waitUntil:'load'});
 assert.ok(await page.title());assert.equal(await page.locator('body').innerText().then(t=>t.length>0)||await page.locator('svg').count()>0,true);
 if(kind==='effect') {await page.locator('h1').waitFor();assert.equal(await page.locator('h1').innerText(),source.sections[1].title);await page.evaluate(()=>scrollTo(0,150));}
 if(kind==='artwork'){assert.equal(await page.locator('svg').first().getAttribute('width'),String(source.studios.artwork.width));await page.evaluate(()=>document.fonts.ready);}
 if(kind==='motion') {const first=await page.locator('[data-motion-id]').first().getAttribute('transform');await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(700);const second=await page.locator('[data-motion-id]').first().getAttribute('transform');assert.notEqual(first,second);await page.getByRole('button',{name:'Pause',exact:true}).click();}
 assert.equal(errors.length,0);assert.ok(requests.every(url=>!/^https?:/.test(url)),'no external network dependency');
 await page.screenshot({path:path.join(root,kind+'-independent.png'),fullPage:false});
 results.push({kind,url:page.url(),title:await page.title(),files:names,errors,network:'No HTTP(S) dependencies',sourceMatches:true,animationPlayed:kind==='motion'?true:null});await context.close();
}
// The no-script effect output retains content and usable solid navigation.
const fallback=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await fallback.newPage();await page.goto(pathToFileURL(path.join(root,'independent-effect/index.html')).href);assert.ok(await page.locator('h1').innerText());assert.ok(await page.locator('nav a').count());await page.screenshot({path:path.join(root,'effect-no-script-fallback.png')});await fallback.close();
await browser.close();await writeFile(path.join(root,'independent-exports.json'),JSON.stringify({timestamp:new Date().toISOString(),browser:'Chromium GPU disabled; motion intentional playback under reduced motion; file URLs',results,noScriptFallback:'Readable page and solid navigation passed'},null,2));console.log('PASS: three extracted file:// outputs, animation playback, no remote dependencies, shared source, no-script fallback');
