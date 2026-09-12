import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const pw=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.PG_EVIDENCE_DIR||'/tmp/pg-touch';await mkdir(output,{recursive:true});
const b=await pw.chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
await c.tracing.start({screenshots:true,snapshots:true});const page=await c.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const checks=[];const f=page.frameLocator('iframe[title="Your page preview"]');
const panel=async label=>page.locator('.pg-mobile-tabs').getByRole('button',{name:label,exact:true}).tap();
const cd=await c.newCDPSession(page);
const touch=async(type,x,y)=>cd.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1,radiusX:8,radiusY:8}]});
async function json(){await panel('Your page');const d=page.locator('details.pg-project-tools').filter({has:page.locator('summary',{hasText:/^Projects & variations$/})});if(!await d.evaluate(e=>e.open))await d.locator('summary').tap();const pending=page.waitForEvent('download');await d.getByRole('button',{name:'Download project JSON',exact:true}).tap();let bytes=[];for await(const v of await(await pending).createReadStream())bytes.push(v);return JSON.parse(Buffer.concat(bytes));}
try {
 await page.goto((process.env.PG_BASE_URL||'http://127.0.0.1:4173')+'/playground/');await panel('Your page');await page.getByRole('button',{name:'Enable drag & drop',exact:true}).tap();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC9sAAAAASUVORK5CYII=','base64');
 await page.getByLabel('Upload hero image',{exact:true}).setInputFiles({name:'touch-image.png',mimeType:'image/png',buffer:png});
 await page.getByText(/Hero image added\./).waitFor();
 await page.locator('.pg-section-select').filter({hasText:/^Hero$/}).tap();await panel('Controls');await page.getByLabel('Image placement',{exact:true}).selectOption('inline');
 const before=await json();await panel('Preview');
 const handle=f.getByRole('button',{name:'Move image. Drag, or use Layout controls.',exact:true});await handle.scrollIntoViewIfNeeded();
 let r=await handle.boundingBox();await touch('touchStart',r.x+15,r.y+15);await touch('touchMove',r.x-25,r.y-25);await f.locator('.pg-compose-ghost').waitFor();await touch('touchCancel');await page.waitForTimeout(80);assert.equal(await f.locator('.pg-compose-ghost').count(),0);assert.deepEqual(await json(),before);checks.push('native Chromium touchstart/move/cancel: ghost before release; cancellation leaves exact document');
 await panel('Preview');await handle.scrollIntoViewIfNeeded();r=await handle.boundingBox();await touch('touchStart',r.x+15,r.y+15);await touch('touchMove',r.x-25,r.y-25);await f.locator('.pg-compose-ghost').waitFor();
 await f.locator('[data-composition-part="title"]').scrollIntoViewIfNeeded();const dest=await f.locator('[data-composition-part="title"]').boundingBox();
 for(let i=1;i<=12;i++){await touch('touchMove',(r.x-25)+(dest.x+60-(r.x-25))*i/12,(r.y-25)+(dest.y+2-(r.y-25))*i/12);await page.waitForTimeout(16);}
 await touch('touchEnd');await page.waitForTimeout(100);assert.equal(await page.locator('.pg-canvas').isVisible(),true);const after=await json();assert.equal(after.sections.find(s=>s.id==='hero').composition.order[0],'image');await page.getByRole('button',{name:'Undo',exact:true}).tap();assert.deepEqual(await json(),before);checks.push('native touch image drop, canvas remains visible, one exact Undo');
 await panel('Preview');await f.locator('#hero').scrollIntoViewIfNeeded();const rect=await page.locator('iframe').boundingBox();const y0=await f.locator('body').evaluate(()=>scrollY);const x=rect.x+20,y=rect.y+Math.min(rect.height-80,430);await touch('touchStart',x,y);for(let i=1;i<=8;i++){await touch('touchMove',x,y-i*25);await page.waitForTimeout(25);}await touch('touchEnd');await page.waitForTimeout(100);const y1=await f.locator('body').evaluate(()=>scrollY);assert.ok(y1>y0,'ordinary touch outside handles scrolls preview');checks.push('ordinary touch outside handles scrolls page');
 for(const interruption of ['blur','capture','resize']){
   await handle.scrollIntoViewIfNeeded();const start=await handle.boundingBox();await page.mouse.move(start.x+15,start.y+15);await page.mouse.down();await page.mouse.move(start.x-20,start.y-20);await f.locator('.pg-compose-ghost').waitFor();
   if(interruption==='resize')await page.setViewportSize({width:391,height:844});
   else if(interruption==='blur')await f.locator('body').evaluate(()=>window.dispatchEvent(new Event('blur')));
   else await handle.evaluate(el=>{for(let id=1;id<8;id++)if(el.hasPointerCapture(id))el.releasePointerCapture(id);});
   await page.waitForTimeout(80);await page.mouse.up();assert.equal(await f.locator('.pg-compose-ghost').count(),0,interruption);assert.deepEqual(await json(),before,interruption);await panel('Preview');
 }
 checks.push('blur/capture-loss/viewport-resize interruptions preserve document; injected lifecycle events labeled separately from real touch');
 assert.equal(errors.length,0);await page.screenshot({path:path.join(output,'touch.png')});
 await writeFile(path.join(output,'results.json'),JSON.stringify({passed:true,checks,errors,browser:await b.version(),environment:'Windows Chromium CDP touch emulation; physical iPhone untested',viewport:page.viewportSize()},null,2));
 console.log(checks.join('\n'));
} catch(e){await writeFile(path.join(output,'failure.txt'),e.stack);await page.screenshot({path:path.join(output,'failure.png')});throw e;}
finally{await c.tracing.stop({path:path.join(output,'touch-trace.zip')});await b.close();}
