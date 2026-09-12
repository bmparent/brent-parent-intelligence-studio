export async function startGestureEvidence(page,frame){
 await page.waitForTimeout(500);
 await page.evaluate(()=>{const state={writes:0,active:true};window.__pgTransientWrites=state;const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(state.active)state.writes++;return original.apply(this,args);};});
 await frame.locator('body').evaluate(()=>{
  const state={active:true,delays:[],frames:[],last:0,longTasks:[],rootReplacements:0,glassRemovals:0};window.__pgActiveEvidence=state;
  const root=document.getElementById('page-root');new MutationObserver(records=>{if(!state.active)return;for(const r of records){if(r.target===root)state.rootReplacements+=r.removedNodes.length;for(const n of r.removedNodes)if(n instanceof Element&&(n.matches('.ew-glass-header')||n.querySelector('.ew-glass-header')))state.glassRemovals++;}}).observe(root,{childList:true,subtree:true});
  document.addEventListener('playground-gesture-paint',e=>{if(state.active)state.delays.push(e.detail.paint-e.detail.sample);});
  if(PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver(list=>{if(state.active)for(const e of list.getEntries())state.longTasks.push(e.duration);}).observe({type:'longtask'});
  function frame(t){if(!state.active)return;if(document.body.dataset.gesture){if(state.last)state.frames.push(t-state.last);state.last=t;}requestAnimationFrame(frame);}requestAnimationFrame(frame);
 });
 return async()=>{
  const result=await frame.locator('body').evaluate(()=>{const s=window.__pgActiveEvidence;s.active=false;return s;});
  result.writes=await page.evaluate(()=>{window.__pgTransientWrites.active=false;return window.__pgTransientWrites.writes;});
  const p95=a=>a.length?[...a].sort((a,b)=>a-b)[Math.min(a.length-1,Math.floor(a.length*.95))]:null;
  result.inputToStyleUpdateP95Ms=p95(result.delays);result.frameIntervalP95Ms=p95(result.frames);result.actualScreenPresentationLatency='not directly instrumented';result.refreshHzAssumption=60;return result;
 };
}
