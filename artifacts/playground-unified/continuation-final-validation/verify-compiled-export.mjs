import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [input,output]=process.argv.slice(2);
assert.ok(input&&output,'Pass the actual compiled ZIP and a new output directory.');
const data=await readFile(input),out=path.resolve(output),digest=x=>createHash('sha256').update(x).digest('hex');
await mkdir(out,{recursive:true});let offset=0;const files=[];
while(data.readUInt32LE(offset)===0x04034b50){
 assert.equal(data.readUInt16LE(offset+8),0);const size=data.readUInt32LE(offset+18),length=data.readUInt16LE(offset+26),extra=data.readUInt16LE(offset+28);
 const name=data.subarray(offset+30,offset+30+length).toString();assert.ok(!name.includes('..')&&!path.isAbsolute(name));
 const start=offset+30+length+extra,bytes=data.subarray(start,start+size),target=path.join(out,'extracted',name);
 await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes);files.push({path:name,bytes:bytes.length,sha256:digest(bytes)});offset=start+size;
}
assert.ok(files.some(x=>x.path==='project.json'));
const project=JSON.parse(await readFile(path.join(out,'extracted/project.json'),'utf8'));
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,args:['--disable-gpu']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],external=[];
await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({status:200,contentType:'text/css',body:'/* Independent font fallback check. */'}));
await context.route(/^https?:\/\/(?!fonts\.googleapis\.com\/)/,route=>{external.push(route.request().url());return route.abort();});
page.on('pageerror',error=>errors.push(error.message));
const receipt={timestampUtc:new Date().toISOString(),inputArchive:{bytes:data.length,sha256:digest(data)},files,checks:[],errors,external,providerCalls:0,environment:'Actual compiled ZIP opened independently in Chromium with GPU disabled; optional Google Fonts CSS replaced with empty CSS to verify the existing font fallback.',limitations:['This is local browser execution, not hosted ownership/payment/inbox or physical-device acceptance.']};
try{
 await page.goto(pathToFileURL(path.join(out,'extracted/index.html')).href,{waitUntil:'domcontentloaded'});
 await page.locator('body[data-editing="false"] #page-root').waitFor();assert.ok((await page.locator('#page-root').innerText()).includes(project.name));
 receipt.checks.push('Compiled ZIP executes its own runtime and renders the exact project brand.');
 await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
 receipt.images=await page.locator('img').count();assert.ok(receipt.images>0);receipt.checks.push('Every exported image decodes from the independent package.');
 assert.equal(await page.locator('.pg-node-toolbar,.pg-layout-guides').count(),0);assert.equal(errors.length,0);assert.equal(external.length,0);
 receipt.checks.push('Export has no editor chrome, runtime error or unapproved external request.');
 await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:900});assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth>innerWidth+1),false);
 receipt.checks.push('Independent narrow viewport renders without horizontal overflow.');await page.screenshot({path:path.join(out,'narrow.png'),fullPage:true});
}catch(error){receipt.failure=error.stack;process.exitCode=1;}
finally{await writeFile(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({archive:receipt.inputArchive,checks:receipt.checks.length,failure:receipt.failure||null,images:receipt.images}));
