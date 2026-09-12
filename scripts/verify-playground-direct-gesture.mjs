import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';

// All mutations below use visible controls and actual input, never a project-state shortcut.
export async function verifyDirectGesture({page,frame,panel,jsonDownload,output,name,check}) {
  await panel('Controls');
  await page.getByLabel('Image placement',{exact:true}).selectOption('inline');
  const before=await jsonDownload();
  await panel('Preview');
  const handle=frame.getByRole('button',{name:'Move image. Drag, or use Layout controls.',exact:true});
  await handle.scrollIntoViewIfNeeded();
  const source=await handle.boundingBox();assert.ok(source);
  await frame.locator('body').evaluate(body=>{
    const state={delays:[],frames:[],longTasks:[],replacements:0,glassRemovals:0,last:0,active:true};window.__gestureEvidence=state;
    const root=document.getElementById('page-root');
    new MutationObserver(records=>{if(!body.dataset.gesture)return;for(const r of records){if(r.target===root&&r.removedNodes.length)state.replacements++;for(const n of r.removedNodes)if(n instanceof Element&&(n.matches('.ew-glass-header')||n.querySelector('.ew-glass-header')))state.glassRemovals++;}}).observe(root,{subtree:true,childList:true});
    document.addEventListener('playground-gesture-paint',e=>state.delays.push(e.detail.paint-e.detail.sample));
    try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(body.dataset.gesture)state.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:false});}catch{/* Unsupported engines report absent long-task instrumentation. */}
    function tick(t){if(!state.active)return;if(body.dataset.gesture){if(state.last)state.frames.push(t-state.last);state.last=t;}else state.last=0;requestAnimationFrame(tick);}requestAnimationFrame(tick);
  });
  await page.evaluate(()=>{window.__gestureWrites=0;window.__countGestureWrites=true;const old=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(window.__countGestureWrites)window.__gestureWrites++;return old.apply(this,args);};});
  // Wait for setup autosave before counting transient gesture writes.
  await page.waitForTimeout(500);await page.evaluate(()=>window.__gestureWrites=0);
  await page.mouse.move(source.x+15,source.y+15);await page.mouse.down();
  await page.mouse.move(source.x-25,source.y-25,{steps:5});
  await frame.locator('.pg-compose-ghost').waitFor();
  assert.equal(await frame.locator('.pg-compose-placeholder').count(),1);
  const gestureRoot=await frame.locator('#hero').elementHandle();
  const movingHandle=await handle.elementHandle();
  for(let i=0;i<50;i++) {
    if(i<15||i>30)await page.mouse.move(source.x-25-Math.sin(i/7)*55,source.y-30-Math.sin(i/9)*60);
    await page.waitForTimeout(100);
    assert.equal(await frame.locator('.pg-compose-ghost').count(),1,'feedback persists through pauses and direction changes');
    assert.equal(await movingHandle.evaluate(e=>e.isConnected),true,'capture element preserved');
  }
  const labels=await frame.locator('.pg-compose-target').allTextContents();assert.ok(labels.includes('Before heading'));assert.ok(!labels.some(x=>/background/i.test(x)));
  await page.screenshot({path:path.join(output,name+'-mid-drag.png')});
  await page.keyboard.press('Escape');await page.mouse.up();
  assert.equal(await frame.locator('.pg-compose-ghost').count(),0);
  assert.equal(await gestureRoot.evaluate(e=>e.isConnected),true);
  const writes=await page.evaluate(()=>{window.__countGestureWrites=false;return window.__gestureWrites;});
  assert.equal(writes,0,'no transient document writes');
  const metrics=await frame.locator('body').evaluate(()=>{window.__gestureEvidence.active=false;return window.__gestureEvidence;});
  assert.equal(metrics.replacements,0);assert.equal(metrics.glassRemovals,0);
  metrics.persistedWrites=writes;metrics.refreshHzAssumption=60;metrics.longTaskSupported=await frame.locator('body').evaluate(()=>PerformanceObserver.supportedEntryTypes.includes('longtask'));
  const percentile=(a,p)=>a.length?[...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))]:null;
  metrics.overlayP95Ms=percentile(metrics.delays,.95);metrics.frameP95Ms=percentile(metrics.frames,.95);
  metrics.previewWidth=await frame.locator('html').evaluate(e=>e.clientWidth);metrics.viewport=page.viewportSize();
  await writeFile(path.join(output,name+'-gesture-metrics.json'),JSON.stringify(metrics,null,2));
  assert.deepEqual(await jsonDownload(),before,'Escape changes no document data');
  check('five-second actual image drag: visible ghost/placeholder/targets, pause/reverse, stable DOM/glass, zero transient writes, exact Escape cancellation');
  await panel('Preview');
  await handle.scrollIntoViewIfNeeded();const start=await handle.boundingBox();
  await page.mouse.move(start.x+15,start.y+15);await page.mouse.down();
  const title=await frame.locator('[data-composition-part="title"]').boundingBox();
  // Bring the destination into view using the actual preview scroller if required.
  await frame.locator('[data-composition-part="title"]').scrollIntoViewIfNeeded();
  const end=await frame.locator('[data-composition-part="title"]').boundingBox();assert.ok(title&&end);
  await page.mouse.move(end.x+Math.min(110,end.width/2),end.y+2,{steps:15});await page.mouse.up();
  await page.waitForTimeout(200);
  const after=await jsonDownload();
  assert.equal(after.sections.find(s=>s.id==='hero').composition.order[0],'image');
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  assert.deepEqual(await jsonDownload(),before,'one Undo restores the complete pre-gesture document');
  await page.getByRole('button',{name:'Redo',exact:true}).click();
  assert.deepEqual(await jsonDownload(),after);
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  check('actual image drop, one exact Undo, Redo and restored baseline');
}
